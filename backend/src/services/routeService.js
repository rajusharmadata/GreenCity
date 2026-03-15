import axios from 'axios';
import EcoRouteHistory from '../models/EcoRouteHistory.js';
import { addPoints } from './pointsService.js';

const ORS_BASE = 'https://api.openrouteservice.org';
const ORS_GEOCODE = `${ORS_BASE}/geocode/search`;
const ORS_DIRECTIONS = (profile) => `${ORS_BASE}/v2/directions/${profile}/geojson`;

const PROFILES = {
  walk: 'foot-walking',
  cycle: 'cycling-regular',
  drive: 'driving-car',
};

const ECO_SCORES = {
  walk: 100,
  cycle: 90,
  transit: 70,
  drive: 20,
};

const POINTS_REWARDS = {
  walk: 20,
  cycle: 15,
  transit: 10,
  drive: 0,
};

const CO2_KG_PER_KM = {
  walking: 0,
  cycling: 0,
  transit: 0.089,
  driving: 0.21,
};

const MODE_TO_EMISSION_KEY = {
  walk: 'walking',
  cycle: 'cycling',
  transit: 'transit',
  drive: 'driving',
};

function requireNumber(v) {
  return typeof v === 'number' && Number.isFinite(v);
}

function orsAuthHeader() {
  const key = process.env.OPENROUTESERVICE_API_KEY;
  if (!key) return {};
  return { Authorization: key };
}

function orsCoordinatesToMap(coordinates) {
  if (!Array.isArray(coordinates)) return [];
  return coordinates.map(([lng, lat]) => ({ latitude: lat, longitude: lng }));
}

function extractGeometry(orsResponse) {
  const features = orsResponse?.features;
  if (!Array.isArray(features) || features.length === 0) return null;
  const coords = features[0]?.geometry?.coordinates;
  if (!Array.isArray(coords)) return null;
  return { type: 'LineString', coordinates: coords };
}

function extractSummary(orsResponse) {
  const features = orsResponse?.features;
  if (!Array.isArray(features) || features.length === 0) return null;
  const props = features[0]?.properties?.summary;
  return props || null;
}

/**
 * Geocode an address string to coordinates using ORS.
 * Returns { latitude, longitude, label } or null.
 */
export async function geocodeAddress(toAddress) {
  try {
    const key = process.env.OPENROUTESERVICE_API_KEY;
    if (!key) return null;
    const res = await axios.get(ORS_GEOCODE, {
      params: { text: toAddress, api_key: key },
      timeout: 10000,
    });
    const features = res.data?.features;
    if (!Array.isArray(features) || features.length === 0) return null;
    const f = features[0];
    const [lng, lat] = f.geometry?.coordinates ?? [];
    if (lng == null || lat == null) return null;
    const label = f.properties?.label ?? toAddress;
    return { latitude: lat, longitude: lng, label };
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[routeService] geocode error:', err?.message);
    }
    return null;
  }
}

/**
 * Fetch one route from ORS. Returns { distanceKm, durationMin, geometry } or null.
 * geometry is GeoJSON-style { type, coordinates } (coordinates are [lng, lat][]).
 */
async function fetchOneRoute(fromLat, fromLng, toLat, toLng, mode) {
  const profile = PROFILES[mode];
  if (!profile) return null;
  try {
    const key = process.env.OPENROUTESERVICE_API_KEY;
    if (!key) return null;
    const res = await axios.post(
      ORS_DIRECTIONS(profile),
      {
        coordinates: [
          [fromLng, fromLat],
          [toLng, toLat],
        ],
      },
      {
        headers: { ...orsAuthHeader(), 'Content-Type': 'application/json' },
        timeout: 15000,
      }
    );
    const geometry = extractGeometry(res.data);
    const summary = extractSummary(res.data);
    if (!geometry || !summary) return null;
    const distanceM = summary.distance ?? 0;
    const durationS = summary.duration ?? 0;
    return {
      distanceKm: distanceM / 1000,
      durationMin: durationS / 60,
      geometry,
    };
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(`[routeService] ${mode} route error:`, err?.message);
    }
    return null;
  }
}

function computeCo2SavedKg(distanceKm, mode) {
  const drivingKg = distanceKm * CO2_KG_PER_KM.driving;
  const key = MODE_TO_EMISSION_KEY[mode] ?? 'driving';
  const modeKg = distanceKm * (CO2_KG_PER_KM[key] ?? CO2_KG_PER_KM.driving);
  return Math.max(0, drivingKg - modeKg);
}

/**
 * Find routes from origin to destination (geocoded from toAddress).
 * Returns { options, destinationCoords, destinationLabel }.
 * options are sorted by eco score descending; each option has polyline in map format.
 */
export async function findRoutes(fromLat, fromLng, toAddress) {
  const geocoded = await geocodeAddress(toAddress);
  if (!geocoded) {
    throw new Error('Could not find the destination address. Please try a different search.');
  }
  const { latitude: toLat, longitude: toLng, label: destinationLabel } = geocoded;

  const results = await Promise.all([
    fetchOneRoute(fromLat, fromLng, toLat, toLng, 'walk'),
    fetchOneRoute(fromLat, fromLng, toLat, toLng, 'cycle'),
    fetchOneRoute(fromLat, fromLng, toLat, toLng, 'drive'),
  ]);

  const [walk, cycle, drive] = results;
  const options = [];
  const driveDistance = drive?.distanceKm ?? 0;
  const driveDuration = drive?.durationMin ?? 0;

  if (walk) {
    options.push({
      id: `walk-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      mode: 'walk',
      distanceKm: Number(walk.distanceKm.toFixed(2)),
      durationMin: Math.round(walk.durationMin),
      ecoScore: ECO_SCORES.walk,
      co2SavedKg: Number(computeCo2SavedKg(walk.distanceKm, 'walk').toFixed(3)),
      geometry: walk.geometry,
      polyline: orsCoordinatesToMap(walk.geometry?.coordinates ?? []),
    });
  }
  if (cycle) {
    options.push({
      id: `cycle-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      mode: 'cycle',
      distanceKm: Number(cycle.distanceKm.toFixed(2)),
      durationMin: Math.round(cycle.durationMin),
      ecoScore: ECO_SCORES.cycle,
      co2SavedKg: Number(computeCo2SavedKg(cycle.distanceKm, 'cycle').toFixed(3)),
      geometry: cycle.geometry,
      polyline: orsCoordinatesToMap(cycle.geometry?.coordinates ?? []),
    });
  }
  if (drive) {
    options.push({
      id: `drive-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      mode: 'drive',
      distanceKm: Number(drive.distanceKm.toFixed(2)),
      durationMin: Math.round(drive.durationMin),
      ecoScore: ECO_SCORES.drive,
      co2SavedKg: 0,
      geometry: drive.geometry,
      polyline: orsCoordinatesToMap(drive.geometry?.coordinates ?? []),
    });
  }

  const transitOption = drive
    ? {
        id: `transit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        mode: 'transit',
        distanceKm: Number(drive.distanceKm.toFixed(2)),
        durationMin: Math.round(driveDuration * 1.4),
        ecoScore: ECO_SCORES.transit,
        co2SavedKg: Number(computeCo2SavedKg(drive.distanceKm, 'transit').toFixed(3)),
        geometry: drive.geometry,
        polyline: orsCoordinatesToMap(drive.geometry?.coordinates ?? []),
      }
    : null;
  if (transitOption) options.push(transitOption);

  options.sort((a, b) => (b.ecoScore ?? 0) - (a.ecoScore ?? 0));

  return {
    options,
    destinationCoords: { latitude: toLat, longitude: toLng },
    destinationLabel,
  };
}

/**
 * Complete a journey: save history and award points.
 * Returns { pointsEarned, totalPoints, history }.
 */
export async function completeJourney(userId, payload) {
  const { mode, fromLat, fromLng, toLat, toLng, distanceKm, durationMin } = payload;
  const ecoScore = ECO_SCORES[mode] ?? 20;
  const co2SavedKg = computeCo2SavedKg(distanceKm, mode);
  const pointsEarned = POINTS_REWARDS[mode] ?? 0;

  const history = await EcoRouteHistory.create({
    userId,
    mode,
    from: { lat: fromLat, lng: fromLng },
    to: { lat: toLat, lng: toLng },
    distanceKm,
    durationMin,
    co2SavedKg,
    ecoScore,
  });

  const pointsResult = pointsEarned
    ? await addPoints(userId, pointsEarned, `Eco route: ${mode}`)
    : null;

  return {
    pointsEarned,
    totalPoints: pointsResult?.newPoints ?? undefined,
    history,
  };
}

export default { geocodeAddress, findRoutes, completeJourney };
