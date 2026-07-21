import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
  Platform, StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useEcoRouteStore } from '../store/ecoRouteStore';

import { styles } from '../styles/eco-route-map';

const MODES = [
  { id: 'walk', icon: 'walk', label: 'Walk', pts: 20 },
  { id: 'cycle', icon: 'bicycle', label: 'Cycle', pts: 15 },
  { id: 'transit', icon: 'bus', label: 'Transit', pts: 10 },
  { id: 'drive', icon: 'car', label: 'Drive', pts: 0 },
];

const haversineKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function EcoRouteMapScreen() {
  const router = useRouter();
  const { activeJourney, setActiveJourney } = useEcoRouteStore();
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [youAreHereAddress, setYouAreHereAddress] = useState('');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const mapRef = useRef<MapView>(null);
  const locationSubRef = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    if (!activeJourney) {
      router.back();
      return;
    }
    setUserLocation({ latitude: activeJourney.fromLat, longitude: activeJourney.fromLng });
  }, [activeJourney]);

  useEffect(() => {
    if (!activeJourney) return;
    let mounted = true;

    Location.watchPositionAsync(
      { accuracy: Location.Accuracy.Balanced, distanceInterval: 15, timeInterval: 3000 },
      (loc) => {
        if (mounted) setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      }
    )
      .then((sub) => {
        if (mounted) {
          locationSubRef.current = sub;
        } else {
          sub.remove();
        }
      })
      .catch((e) => {
        if (mounted) setLocationError('Lost GPS tracking. Directions may be out of date.');
        if (process.env.NODE_ENV !== 'production') {
          console.error('[EcoRouteMap] watchPosition error:', e);
        }
      });

    return () => {
      mounted = false;
      locationSubRef.current?.remove();
      locationSubRef.current = null;
    };
  }, [activeJourney]);

  useEffect(() => {
    if (!userLocation || !activeJourney) return;
    let mounted = true;
    Location.reverseGeocodeAsync(userLocation)
      .then((rev) => {
        if (!mounted || !rev[0]) return;
        const a = rev[0];
        setYouAreHereAddress([a.streetNumber, a.street, a.city].filter(Boolean).join(', ') || 'Your location');
      })
      .catch(() => {
        // Non-critical — keep showing the last known address.
      });
    return () => {
      mounted = false;
    };
  }, [userLocation?.latitude, userLocation?.longitude]);

  const distanceLeftKm = activeJourney && userLocation
    ? haversineKm(userLocation.latitude, userLocation.longitude, activeJourney.toLat, activeJourney.toLng)
    : 0;
  const minLeft = activeJourney?.route?.durationMin
    ? Math.round((distanceLeftKm / (activeJourney.route.distanceKm || 0.001)) * activeJourney.route.durationMin)
    : 0;

  const handleEndJourney = () => {
    if (!activeJourney) return;
    setCompleting(true);
    setActiveJourney(null);
    router.back();
    setCompleting(false);
  };

  const openInMaps = () => {
    if (!activeJourney) return;
    const { toLat, toLng, destinationAddress } = activeJourney;
    const url = Platform.select({
      ios: `maps://app?daddr=${toLat},${toLng}&dirflg=w`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${toLat},${toLng}`,
    });
    Linking.openURL(url).catch(() =>
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destinationAddress)}`)
    );
  };

  if (!activeJourney) return null;

  const regionForMap = userLocation
    ? {
        latitude: (userLocation.latitude + activeJourney.toLat) / 2,
        longitude: (userLocation.longitude + activeJourney.toLng) / 2,
        latitudeDelta: Math.max(0.02, Math.abs(userLocation.latitude - activeJourney.toLat) * 1.8),
        longitudeDelta: Math.max(0.02, Math.abs(userLocation.longitude - activeJourney.toLng) * 1.8),
      }
    : {
        latitude: activeJourney.fromLat,
        longitude: activeJourney.fromLng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };

  const modeLabel = MODES.find(m => m.id === activeJourney.route.mode)?.label || activeJourney.route.mode;

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.webPlaceholder}>
          <Ionicons name="map" size={64} color="#16a34a" />
          <Text style={styles.webTitle}>Navigate to {activeJourney.destinationAddress}</Text>
          <Text style={styles.webDesc}>{distanceLeftKm.toFixed(1)} km left · ~{minLeft} min</Text>
          <TouchableOpacity style={styles.openMapsBtn} onPress={openInMaps}>
            <Ionicons name="map" size={20} color="#16a34a" />
            <Text style={styles.openMapsBtnText}>Open in Google Maps for directions</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.endBtn} onPress={handleEndJourney} disabled={completing}>
            {completing ? <ActivityIndicator color="white" /> : <Text style={styles.endBtnText}>End Journey</Text>}
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.backBtn} onPress={() => { setActiveJourney(null); router.back(); }}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={regionForMap}
        showsUserLocation
        followsUserLocation
        showsMyLocationButton
        showsCompass
      >
        <Marker
          coordinate={{ latitude: activeJourney.toLat, longitude: activeJourney.toLng }}
          title="Destination"
          description={activeJourney.destinationAddress}
          pinColor="#f59e0b"
        />
        {activeJourney.polylineCoords.length > 1 && (
          <Polyline
            coordinates={activeJourney.polylineCoords}
            strokeColor="#16a34a"
            strokeWidth={5}
            lineDashPattern={[1]}
          />
        )}
      </MapView>

      {/* Top bar: Navigate to ... */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => { setActiveJourney(null); router.back(); }}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.topBarCenter}>
          <Text style={styles.topBarTitle} numberOfLines={1}>Navigate to</Text>
          <Text style={styles.topBarSubtitle} numberOfLines={1}>{activeJourney.destinationAddress}</Text>
        </View>
        <View style={styles.topBarRight} />
      </View>

      {/* Directions card (Google Maps style) */}
      <View style={styles.directionsCard}>
        {locationError && (
          <View style={styles.locationWarning}>
            <Ionicons name="warning" size={14} color="#b45309" />
            <Text style={styles.locationWarningText}>{locationError}</Text>
          </View>
        )}
        <View style={styles.directionStep}>
          <View style={styles.stepIcon}>
            <Ionicons name="navigate" size={20} color="#16a34a" />
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>You are here</Text>
            <Text style={styles.stepAddress} numberOfLines={2}>{youAreHereAddress || 'Getting location...'}</Text>
          </View>
        </View>
        <View style={styles.directionLine} />
        <View style={styles.directionStep}>
          <View style={[styles.stepIcon, { backgroundColor: '#fef9c3' }]}>
            <Ionicons name="flag" size={20} color="#d97706" />
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Destination</Text>
            <Text style={styles.stepAddress} numberOfLines={2}>{activeJourney.destinationAddress}</Text>
          </View>
        </View>
        <View style={styles.directionStats}>
          <View style={styles.statBox}>
            <Ionicons name="navigate" size={18} color="#16a34a" />
            <Text style={styles.statValue}>{distanceLeftKm.toFixed(1)} km</Text>
            <Text style={styles.statLabel}>left</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="time" size={18} color="#16a34a" />
            <Text style={styles.statValue}>~{minLeft}</Text>
            <Text style={styles.statLabel}>min</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="walk" size={18} color="#16a34a" />
            <Text style={styles.statValue}>{modeLabel}</Text>
            <Text style={styles.statLabel}>mode</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.openMapsBtn} onPress={openInMaps}>
          <Ionicons name="map" size={22} color="#16a34a" />
          <Text style={styles.openMapsBtnText}>Open in Google Maps for turn-by-turn</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.endBtn, completing && { opacity: 0.7 }]}
          onPress={handleEndJourney}
          disabled={completing}
        >
          {completing ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.endBtnText}>Stop Journey</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}