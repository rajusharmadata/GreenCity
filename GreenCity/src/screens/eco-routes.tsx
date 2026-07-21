import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { findRoutes as findRoutesApi, completeRoute as completeRouteApi } from '../services/routeService';
import { useEcoRouteStore } from '../store/ecoRouteStore';
import { ecoRoutesStyles as styles } from '../styles/ecoRoutesStyle';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const ROUTE_COLORS: Record<string, string> = {
  walk: '#16a34a',
  cycle: '#0ea5e9',
  transit: '#f59e0b',
  drive: '#ef4444',
};

const MODE_ICONS: Record<string, IoniconName> = {
  walk: 'walk',
  cycle: 'bicycle',
  transit: 'bus',
  drive: 'car',
};

const MODE_LABELS: Record<string, string> = {
  walk: 'Walk',
  cycle: 'Cycle',
  transit: 'Transit',
  drive: 'Drive',
};

const POINTS_BY_MODE: Record<string, number> = {
  walk: 20,
  cycle: 15,
  transit: 10,
  drive: 0,
};

interface RouteOption {
  id: string;
  mode: string;
  distanceKm: number;
  durationMin: number;
  ecoScore: number;
  co2SavedKg: number;
  geometry?: { coordinates?: [number, number][] };
  polyline?: { latitude: number; longitude: number }[];
}

function getPolylineCoords(option: RouteOption): { latitude: number; longitude: number }[] {
  if (option.polyline && option.polyline.length > 0) return option.polyline;
  const coords = option.geometry?.coordinates;
  if (!coords?.length) return [];
  return coords.map(([lng, lat]) => ({ latitude: lat, longitude: lng }));
}

export default function EcoRoutesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const setActiveJourney = useEcoRouteStore((s) => s.setActiveJourney);
  const mapRef = useRef<MapView>(null);
  const locationRef = useRef<{ latitude: number; longitude: number } | null>(null);

  const [userRegion, setUserRegion] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [destination, setDestination] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedMode, setSelectedMode] = useState<string>('walk');
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [destinationCoords, setDestinationCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [destinationLabel, setDestinationLabel] = useState('');
  const [routeError, setRouteError] = useState<string | null>(null);
  const [navigating, setNavigating] = useState(false);
  const watchSubRef = useRef<Location.LocationSubscription | null>(null);

  const fromCoords = userRegion ?? locationRef.current;
  const fromCoordsRef = useRef(fromCoords);
  fromCoordsRef.current = fromCoords;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (mounted) setLocationError('Location permission is required to find eco routes.');
          return;
        }
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.BestForNavigation,
        });
        const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
        locationRef.current = coords;
        if (mounted) setUserRegion(coords);
        const sub = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.BestForNavigation, distanceInterval: 5 },
          (l) => {
            const c = { latitude: l.coords.latitude, longitude: l.coords.longitude };
            locationRef.current = c;
            if (mounted) setUserRegion(c);
          }
        );
        watchSubRef.current = sub;
      } catch (e) {
        if (mounted) setLocationError('Could not get your location. Check GPS and try again.');
        if (process.env.NODE_ENV !== 'production') {
          console.error('[EcoRoutes] location error:', e);
        }
      }
    })();
    return () => {
      mounted = false;
      watchSubRef.current?.remove();
      watchSubRef.current = null;
    };
  }, []);

  // Only re-fits when a new route/destination arrives, not on every GPS tick —
  // otherwise live location updates would keep fighting the user's map gestures.
  const fitMapToRoute = useCallback(() => {
    const origin = fromCoordsRef.current;
    if (!mapRef.current || !origin) return;
    const allCoords = [origin];
    routes.forEach((r) => {
      allCoords.push(...getPolylineCoords(r));
    });
    if (destinationCoords) allCoords.push(destinationCoords);
    if (allCoords.length < 2) return;
    mapRef.current.fitToCoordinates(allCoords, {
      edgePadding: { top: 120, right: 24, bottom: 280, left: 24 },
      animated: true,
    });
  }, [routes, destinationCoords]);

  useEffect(() => {
    if (routes.length > 0 && destinationCoords) fitMapToRoute();
  }, [routes.length, destinationCoords, fitMapToRoute]);

  const findRoutes = async () => {
    const toAddress = destination.trim();
    if (!toAddress) {
      Alert.alert('Enter destination', 'Please type where you want to go.');
      return;
    }
    if (!fromCoords) {
      Alert.alert('Location needed', locationError || 'Waiting for your location.');
      return;
    }
    setRouteError(null);
    setLoading(true);
    setRoutes([]);
    setDestinationCoords(null);
    setDestinationLabel('');
    try {
      const response = await findRoutesApi({
        fromLat: fromCoords.latitude,
        fromLng: fromCoords.longitude,
        toAddress,
      });
      const options: RouteOption[] = response.options ?? [];
      const dest = response.destinationCoords ?? null;
      const label = response.destinationLabel ?? toAddress;
      if (options.length === 0) {
        setRouteError('No routes found for this destination.');
        return;
      }
      setRoutes(options);
      setSelectedMode(options[0].mode);
      setDestinationCoords(dest);
      setDestinationLabel(label);
    } catch (e: any) {
      const msg = (e.response?.data?.error as string) ?? e.message ?? 'Failed to find routes.';
      setRouteError(msg);
    } finally {
      setLoading(false);
    }
  };

  const centerOnUser = () => {
    if (!mapRef.current || !fromCoords) return;
    mapRef.current.animateToRegion({
      ...fromCoords,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  const handleStartEcoJourney = async () => {
    const route = routes.find((r) => r.mode === selectedMode) ?? routes[0];
    if (!route || !fromCoords || !destinationCoords) return;
    setLoading(true);
    try {
      const completeRes = await completeRouteApi({
        mode: route.mode,
        fromLat: fromCoords.latitude,
        fromLng: fromCoords.longitude,
        toLat: destinationCoords.latitude,
        toLng: destinationCoords.longitude,
        distanceKm: route.distanceKm,
        durationMin: route.durationMin,
      });
      const pointsEarned = completeRes.pointsEarned ?? POINTS_BY_MODE[route.mode] ?? 0;
      const polylineCoords = getPolylineCoords(route);
      const fallbackCoords =
        polylineCoords.length > 1
          ? polylineCoords
          : [fromCoords, destinationCoords];
      setActiveJourney({
        route: { mode: route.mode, distanceKm: route.distanceKm, durationMin: route.durationMin },
        destinationAddress: destinationLabel || destination.trim(),
        toLat: destinationCoords.latitude,
        toLng: destinationCoords.longitude,
        fromLat: fromCoords.latitude,
        fromLng: fromCoords.longitude,
        polylineCoords: fallbackCoords,
      });
      setNavigating(true);
      router.push('/eco-route-map');
    } catch (err: any) {
      const msg = (err.response?.data?.error as string) ?? err.message ?? 'Could not start journey.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const initialRegion = fromCoords
    ? {
        ...fromCoords,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }
    : undefined;

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <View style={styles.webPlaceholder}>
          <Text style={styles.webTitle}>Eco Routes — use the app on a device for maps.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass
        followsUserLocation={navigating}
      >
        {routes.map((r) => {
          const coords = getPolylineCoords(r);
          if (coords.length < 2) return null;
          const isSelected = r.mode === selectedMode;
          const hex = ROUTE_COLORS[r.mode] ?? '#6b7280';
          const strokeColor = isSelected ? hex : hex + '66';
          const isWalking = r.mode === 'walk';
          return (
            <Polyline
              key={r.id}
              coordinates={coords}
              strokeColor={strokeColor}
              strokeWidth={isSelected ? 5 : 2}
              lineDashPattern={isWalking ? [8, 4] : undefined}
              lineCap="round"
              lineJoin="round"
              zIndex={isSelected ? 1 : 0}
            />
          );
        })}
      </MapView>

      {/* Floating search card */}
      <View style={[styles.searchCard, { paddingTop: insets.top + 8 }]}>
        <View style={styles.searchRow}>
          <Ionicons name="location-sharp" size={18} color={locationError ? '#ef4444' : '#16a34a'} />
          <Text style={styles.searchLabel}>
            {locationError ?? 'My Location (GPS)'}
          </Text>
        </View>
        <View style={styles.searchRow}>
          <Ionicons name="navigate" size={18} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Destination"
            placeholderTextColor="#94a3b8"
            value={destination}
            onChangeText={(t) => { setDestination(t); setRouteError(null); }}
            onSubmitEditing={findRoutes}
            returnKeyType="search"
          />
          {destination.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setDestination('');
                setRoutes([]);
                setRouteError(null);
                setDestinationCoords(null);
                setDestinationLabel('');
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close-circle" size={20} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.searchSubmit, loading && { opacity: 0.7 }]}
          onPress={findRoutes}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Ionicons name="arrow-forward" size={20} color="white" />
          )}
        </TouchableOpacity>
      </View>

      {/* My Location button */}
      <TouchableOpacity style={[styles.myLocationBtn, { top: insets.top + 140 }]} onPress={centerOnUser}>
        <Ionicons name="locate" size={24} color="#16a34a" />
      </TouchableOpacity>

      {/* Bottom sheet: route options */}
      <View style={[styles.bottomSheet, { paddingBottom: insets.bottom + 16 }]}>
        {loading && routes.length === 0 ? (
          <View style={styles.sheetLoading}>
            <ActivityIndicator size="large" color="#16a34a" />
            <Text style={styles.sheetLoadingText}>Finding routes...</Text>
          </View>
        ) : routes.length > 0 ? (
          <>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cardsScroll}
            >
              {routes.map((r) => {
                const isSelected = r.mode === selectedMode;
                const color = ROUTE_COLORS[r.mode] ?? '#6b7280';
                const icon = MODE_ICONS[r.mode] ?? 'car';
                const label = MODE_LABELS[r.mode] ?? r.mode;
                const pts = POINTS_BY_MODE[r.mode] ?? 0;
                return (
                  <TouchableOpacity
                    key={r.id}
                    style={[
                      styles.routeCard,
                      isSelected && { borderColor: '#16a34a', borderWidth: 2, backgroundColor: 'white' },
                    ]}
                    onPress={() => setSelectedMode(r.mode)}
                    activeOpacity={0.9}
                  >
                    <View style={[styles.routeCardIcon, { backgroundColor: `${color}20` }]}>
                      <Ionicons name={icon} size={24} color={color} />
                    </View>
                    <Text style={styles.routeCardMode}>{label}</Text>
                    <Text style={styles.routeCardDuration}>{r.durationMin} min</Text>
                    <Text style={styles.routeCardDistance}>{r.distanceKm} km</Text>
                    <View style={[styles.ecoBadge, { backgroundColor: `${color}25` }]}>
                      <Text style={[styles.ecoBadgeText, { color }]}>Eco {r.ecoScore}</Text>
                    </View>
                    <Text style={styles.co2Text}>{r.co2SavedKg} kg CO₂ saved</Text>
                    <View style={styles.ptsChip}>
                      <Ionicons name="flash" size={12} color="#b45309" />
                      <Text style={styles.ptsChipText}>+{pts} pts</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity
              style={[styles.startJourneyBtn, loading && { opacity: 0.7 }]}
              onPress={handleStartEcoJourney}
              disabled={loading}
            >
              <Ionicons name="navigate" size={20} color="white" />
              <Text style={styles.startJourneyBtnText}>Start Eco Journey</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.sheetHint}>Enter a destination and search to see eco routes.</Text>
        )}
      </View>

      {/* Error banner */}
      {routeError ? (
        <View style={[styles.errorBanner, { bottom: (insets.bottom || 16) + 236 }]}>
          <Ionicons name="warning" size={18} color="#b45309" />
          <Text style={styles.errorBannerText}>{routeError}</Text>
        </View>
      ) : null}
    </View>
  );
}