import { useState, useEffect, useRef, useCallback } from 'react';
import * as Location from 'expo-location';

const ACCURACY = Location.Accuracy.BestForNavigation;
const DISTANCE_INTERVAL = 5;

export interface LocationState {
  location: Location.LocationObject | null;
  locationRef: React.MutableRefObject<Location.LocationObject | null>;
  address: string;
  refresh: () => Promise<void>;
  getCurrentForSubmit: () => Promise<Location.LocationObject | null>;
  getAddressForCoords: (latitude: number, longitude: number) => Promise<string>;
}

function formatAddress(addr: Location.LocationGeocodedAddress | null): string {
  if (!addr) return '';
  // addr.name typically contains the POI name (e.g. "Subharti University")
  const parts = [addr.name, addr.streetNumber, addr.street, addr.district, addr.city].filter(Boolean);
  return parts.join(', ').trim() || '';
}

export function useLocation(): LocationState {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [address, setAddress] = useState('');
  const locationRef = useRef<Location.LocationObject | null>(null);
  const watchSubRef = useRef<Location.LocationSubscription | null>(null);

  const updateAddress = useCallback(async (lat: number, lng: number) => {
    const reverse = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
    return reverse[0] ? formatAddress(reverse[0]) : '';
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const sub = await Location.watchPositionAsync(
          { accuracy: ACCURACY, distanceInterval: DISTANCE_INTERVAL, timeInterval: 5000 },
          (loc) => {
            locationRef.current = loc;
            if (mounted) setLocation(loc);
          }
        );
        watchSubRef.current = sub;
        const initial = await Location.getCurrentPositionAsync({ accuracy: ACCURACY });
        locationRef.current = initial;
        if (mounted) setLocation(initial);
        const addr = await updateAddress(initial.coords.latitude, initial.coords.longitude);
        if (mounted) setAddress(addr);
      } catch (e) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('[useLocation] error:', e);
        }
      }
    })();
    return () => {
      mounted = false;
      watchSubRef.current?.remove();
      watchSubRef.current = null;
    };
  }, [updateAddress]);

  useEffect(() => {
    if (!location) return;
    updateAddress(location.coords.latitude, location.coords.longitude).then(setAddress);
  }, [location?.coords.latitude, location?.coords.longitude, updateAddress]);

  const refresh = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: ACCURACY });
      locationRef.current = loc;
      setLocation(loc);
      const addr = await updateAddress(loc.coords.latitude, loc.coords.longitude);
      setAddress(addr);
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('[useLocation] refresh error:', e);
      }
    }
  }, [updateAddress]);

  const getCurrentForSubmit = useCallback(async (): Promise<Location.LocationObject | null> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return locationRef.current;
      const loc = await Location.getCurrentPositionAsync({
        accuracy: ACCURACY,
        timeout: 15000,
      });
      return loc;
    } catch (_) {
      return locationRef.current ?? null;
    }
  }, []);

  const getAddressForCoords = useCallback(async (latitude: number, longitude: number) => {
    return updateAddress(latitude, longitude);
  }, [updateAddress]);

  return { location, locationRef, address, refresh, getCurrentForSubmit, getAddressForCoords };
}
