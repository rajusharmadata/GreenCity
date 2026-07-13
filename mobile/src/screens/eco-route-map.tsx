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
    Location.watchPositionAsync(
      { accuracy: Location.Accuracy.Balanced, distanceInterval: 15, timeInterval: 3000 },
      (loc) => setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude })
    ).then((sub) => { locationSubRef.current = sub; });
    return () => {
      locationSubRef.current?.remove();
      locationSubRef.current = null;
    };
  }, [activeJourney]);

  useEffect(() => {
    if (!userLocation || !activeJourney) return;
    Location.reverseGeocodeAsync(userLocation).then((rev) => {
      if (rev[0]) {
        const a = rev[0];
        setYouAreHereAddress([a.streetNumber, a.street, a.city].filter(Boolean).join(', ') || 'Your location');
      }
    });
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
    const pts = MODES.find(m => m.id === activeJourney.route.mode)?.pts ?? 0;
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
        style={StyleSheet.absoluteFillObject}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0fdf4' },
  topBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 52 : 44,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  topBarCenter: { flex: 1 },
  topBarTitle: { fontSize: 11, fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 },
  topBarSubtitle: { fontSize: 16, fontWeight: '800', color: '#111827', marginTop: 2 },
  topBarRight: { width: 44 },
  directionsCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  directionStep: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  stepIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center' },
  stepContent: { flex: 1 },
  stepTitle: { fontSize: 10, fontWeight: '800', color: '#94a3b8', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 },
  stepAddress: { fontSize: 14, fontWeight: '600', color: '#111827' },
  directionLine: { width: 2, height: 16, backgroundColor: '#e5e7eb', marginLeft: 19, marginVertical: 4 },
  directionStats: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 16, paddingVertical: 12, backgroundColor: '#f0fdf4', borderRadius: 16 },
  statBox: { alignItems: 'center', gap: 2 },
  statValue: { fontSize: 16, fontWeight: '900', color: '#16a34a' },
  statLabel: { fontSize: 11, fontWeight: '600', color: '#6b7280' },
  openMapsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#f0fdf4',
    padding: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#16a34a',
    marginBottom: 10,
  },
  openMapsBtnText: { fontSize: 15, fontWeight: '800', color: '#16a34a' },
  endBtn: { backgroundColor: '#16a34a', padding: 16, borderRadius: 16, alignItems: 'center' },
  endBtnText: { color: 'white', fontSize: 16, fontWeight: '900' },
  webPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 16 },
  webTitle: { fontSize: 20, fontWeight: '900', color: '#111827', textAlign: 'center' },
  webDesc: { fontSize: 14, color: '#6b7280' },
});
