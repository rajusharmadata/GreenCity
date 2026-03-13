import axios from 'axios';
import EcoRouteHistory from '../models/EcoRouteHistory.js';
import { addPoints } from './leaderboardController.js';

const ORS_BASE = 'https://api.openrouteservice.org/v2/directions';

const profiles = {
  walk: 'foot-walking',
  cycle: 'cycling-regular',
  drive: 'driving-car'
};

const ECO_SCORES = {
  walk: 100,
  cycle: 90,
  transit: 70,
  drive: 20
};

const POINTS = {
  walk: 20,
  cycle: 15,
  transit: 10,
  drive: 0
};

// Approx. emissions (kg CO2 per km)
const EMISSIONS = {
  drive: 0.192,
  transit: 0.08,
  walk: 0,
  cycle: 0
};

const requireNumber = (v) => typeof v === 'number' && Number.isFinite(v);

const orsDirections = async ({ fromLat, fromLng, toLat, toLng, mode }) => {
  const apiKey = process.env.OPENROUTESERVICE_API_KEY;
  if (!apiKey) throw new Error('Missing OPENROUTESERVICE_API_KEY');

  const profile = profiles[mode];
  if (!profile) throw new Error(`Unsupported mode: ${mode}`);

  const url = `${ORS_BASE}/${profile}/geojson`;
  console.log(`[ORS] Calling ${url} with mode ${mode}`);

  const resp = await axios.post(
    url,
    {
      coordinates: [
        [fromLng, fromLat],
        [toLng, toLat]
      ]
    },
    {
      headers: {
        Authorization: apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8'
      },
      timeout: 15000
    }
  );

  const feature = resp.data?.features?.[0];
  const summary = feature?.properties?.summary;
  return {
    distanceKm: (summary?.distance ?? 0) / 1000,
    durationMin: (summary?.duration ?? 0) / 60,
    geometry: feature?.geometry
  };
};

const computeCo2SavedKg = (distanceKm, mode) => {
  const driveKg = distanceKm * EMISSIONS.drive;
  const modeKg = distanceKm * (EMISSIONS[mode] ?? EMISSIONS.drive);
  return Math.max(0, driveKg - modeKg);
};

// Haversine distance in km — used for mock data scaling
const haversineKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/**
 * POST /api/routes/find
 * Body: { fromLat, fromLng, toLat, toLng }
 */
export const findRoutes = async (req, res) => {
  try {
    const { fromLat, fromLng, toLat, toLng } = req.body || {};
    console.log('[RouteController] Finding routes from:', { fromLat, fromLng }, 'to:', { toLat, toLng });

    if (![fromLat, fromLng, toLat, toLng].every(requireNumber)) {
      return res.status(400).json({ error: 'fromLat, fromLng, toLat, toLng must be numbers' });
    }

    const modes = ['walk', 'cycle', 'drive'];
    const results = await Promise.all(
      modes.map(async (mode) => {
        try {
          const r = await orsDirections({ fromLat, fromLng, toLat, toLng, mode });
          return { mode, ...r };
        } catch (err) {
          console.warn(`[RouteController] Failed to fetch mode ${mode}:`, err.response?.data?.error?.message || err.message);
          return null;
        }
      })
    );

    const options = [];

    const mk = (mode, r) => ({
      id: `${mode}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      mode,
      distanceKm: Number((r.distanceKm || 0).toFixed(2)),
      durationMin: Math.round(r.durationMin || 0),
      ecoScore: ECO_SCORES[mode],
      co2SavedKg: Number(computeCo2SavedKg(r.distanceKm || 0, mode).toFixed(3)),
      geometry: r.geometry
    });

    const [walk, cycle, drive] = results;
    if (walk) options.push(mk('walk', walk));
    if (cycle) options.push(mk('cycle', cycle));
    if (drive) {
      options.push(mk('drive', drive));
      options.push({
        id: `transit-${Date.now()}`,
        mode: 'transit',
        distanceKm: Number((drive.distanceKm || 0).toFixed(2)),
        durationMin: Math.round((drive.durationMin || 0) * 1.4),
        ecoScore: ECO_SCORES.transit,
        co2SavedKg: Number(computeCo2SavedKg(drive.distanceKm || 0, 'transit').toFixed(3)),
        geometry: drive.geometry
      });
    }

    // FALLBACK: If ORS is unreachable for all modes, provide calculated mock data
    if (options.length === 0) {
      console.log('[RouteController] Providing mock fallback routes due to ORS unavailability');
      const dist = Number(haversineKm(fromLat, fromLng, toLat, toLng).toFixed(2));
      const walkMin = Math.round((dist / 5) * 60);   // ~5 km/h
      const cycleMin = Math.round((dist / 15) * 60); // ~15 km/h
      const driveMin = Math.round((dist / 40) * 60); // ~40 km/h avg city

      options.push({ id: 'mock-walk', mode: 'walk', distanceKm: dist, durationMin: walkMin, ecoScore: 100, co2SavedKg: Number(computeCo2SavedKg(dist, 'walk').toFixed(3)), isMock: true });
      options.push({ id: 'mock-cycle', mode: 'cycle', distanceKm: dist, durationMin: cycleMin, ecoScore: 90, co2SavedKg: Number(computeCo2SavedKg(dist, 'cycle').toFixed(3)), isMock: true });
      options.push({ id: 'mock-transit', mode: 'transit', distanceKm: dist, durationMin: Math.round(driveMin * 1.4), ecoScore: 70, co2SavedKg: Number(computeCo2SavedKg(dist, 'transit').toFixed(3)), isMock: true });
      options.push({ id: 'mock-drive', mode: 'drive', distanceKm: dist, durationMin: driveMin, ecoScore: 20, co2SavedKg: 0, isMock: true });
    }

    return res.json({ options });
  } catch (error) {
    console.error('findRoutes error:', error);
    return res.status(500).json({
      error: 'Failed to find routes',
      details: String(error.message || error)
    });
  }
};

/**
 * POST /api/routes/complete
 * Body: { mode, fromLat, fromLng, toLat, toLng, distanceKm, durationMin }
 */
export const completeRoute = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      mode,
      fromLat,
      fromLng,
      toLat,
      toLng,
      distanceKm,
      durationMin
    } = req.body || {};

    const validModes = ['walk', 'cycle', 'transit', 'drive'];
    if (!validModes.includes(mode)) {
      return res.status(400).json({ error: 'Invalid mode' });
    }
    if (![fromLat, fromLng, toLat, toLng, distanceKm, durationMin].every(requireNumber)) {
      return res.status(400).json({ error: 'from/to coords, distanceKm, durationMin must be numbers' });
    }

    const ecoScore = ECO_SCORES[mode];
    const co2SavedKg = computeCo2SavedKg(distanceKm, mode);

    const history = await EcoRouteHistory.create({
      userId,
      mode,
      from: { lat: fromLat, lng: fromLng },
      to: { lat: toLat, lng: toLng },
      distanceKm,
      durationMin,
      co2SavedKg,
      ecoScore
    });

    const pointsEarned = POINTS[mode];
    const pointsResult = pointsEarned ? await addPoints(userId, pointsEarned, `Eco route: ${mode}`) : null;

    return res.json({
      message: 'Route completed',
      pointsEarned,
      totalPoints: pointsResult?.newPoints ?? undefined,
      history
    });
  } catch (error) {
    console.error('completeRoute error:', error);
    return res.status(500).json({ error: 'Failed to complete route' });
  }
};

export default { findRoutes, completeRoute };
