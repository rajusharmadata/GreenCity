import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  ActivityIndicator, StyleSheet, Alert
} from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../utils/api';

const MODES = [
  { id: 'walk', icon: 'walk', label: 'Walk', pts: 20, score: 100, color: '#16a34a', gradient: ['#dcfce7', '#bbf7d0'] as [string, string] },
  { id: 'cycle', icon: 'bicycle', label: 'Cycle', pts: 15, score: 90, color: '#0ea5e9', gradient: ['#e0f2fe', '#bae6fd'] as [string, string] },
  { id: 'transit', icon: 'bus', label: 'Transit', pts: 10, score: 70, color: '#f59e0b', gradient: ['#fef9c3', '#fde68a'] as [string, string] },
  { id: 'drive', icon: 'car', label: 'Drive', pts: 0, score: 20, color: '#6b7280', gradient: ['#f3f4f6', '#e5e7eb'] as [string, string] },
];

export default function EcoRoutesScreen() {
  const [region, setRegion] = useState<any>(null);
  const [destination, setDestination] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedMode, setSelectedMode] = useState('walk');
  const [routes, setRoutes] = useState<any[]>([]);
  const [locationName, setLocationName] = useState('Detecting...');
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const loc = await Location.getCurrentPositionAsync({});
        setRegion({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
        // Reverse geocode for display
        const rev = await Location.reverseGeocodeAsync({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        if (rev[0]) setLocationName(rev[0].city || rev[0].district || 'Your Location');
      } catch (e) {
        console.error('[EcoRoutes] location error:', e);
      }
    })();
  }, []);

  const findRoutes = async () => {
    if (!destination.trim() || !region) {
      Alert.alert('Enter a destination', 'Please type where you want to go.');
      return;
    }
    setLoading(true);
    setRoutes([]);
    try {
      const geo = await Location.geocodeAsync(destination);
      if (!geo.length) { Alert.alert('Not Found', 'Could not find that location.'); return; }
      const target = geo[0];
      const response = await api.post('/routes/find', {
        fromLat: region.latitude,
        fromLng: region.longitude,
        toLat: target.latitude,
        toLng: target.longitude,
      });
      const options = response.data?.options || [];
      if (options.length > 0) {
        setRoutes(options);
        setSelectedMode(options[0].mode);
      } else {
        Alert.alert('No Routes', 'No routes found for this destination.');
      }
    } catch (e: any) {
      const msg = e.response?.data?.details || e.response?.data?.error || e.message || 'Failed to find routes.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleStartJourney = async () => {
    const route = routes.find(r => r.mode === selectedMode) || routes[0];
    if (!route || !region) return;
    setCompleting(true);
    try {
      const geo = await Location.geocodeAsync(destination);
      const target = geo[0];
      await api.post('/routes/complete', {
        mode: route.mode,
        fromLat: region.latitude,
        fromLng: region.longitude,
        toLat: target?.latitude || 0,
        toLng: target?.longitude || 0,
        distanceKm: route.distanceKm,
        durationMin: route.durationMin,
      });
      Alert.alert('Journey Started! 🌿', `You earned ${MODES.find(m => m.id === route.mode)?.pts || 0} eco points!`);
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error || 'Could not complete route');
    } finally {
      setCompleting(false);
    }
  };

  const currentRoute = routes.find(r => r.mode === selectedMode) || routes[0];
  const currentMode = MODES.find(m => m.id === selectedMode) || MODES[0];
  const hasMockData = currentRoute?.isMock;

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#14532d', '#16a34a']} style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Eco Routes</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-sharp" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.locationText}>{locationName}</Text>
          </View>
        </View>
        <View style={styles.leafIcon}>
          <Ionicons name="leaf" size={28} color="white" />
        </View>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#16a34a" />
          <TextInput
            style={styles.searchInput}
            placeholder="Where do you want to go?"
            placeholderTextColor="#94a3b8"
            value={destination}
            onChangeText={setDestination}
            onSubmitEditing={findRoutes}
            returnKeyType="search"
          />
          {destination.length > 0 && (
            <TouchableOpacity onPress={() => { setDestination(''); setRoutes([]); }}>
              <Ionicons name="close-circle" size={20} color="#cbd5e1" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.searchBtn} onPress={findRoutes} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Ionicons name="arrow-forward" size={22} color="white" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Mode Selector */}
        <Text style={styles.sectionLabel}>TRAVEL MODE</Text>
        <View style={styles.modeGrid}>
          {MODES.map(mode => {
            const routeData = routes.find(r => r.mode === mode.id);
            const active = selectedMode === mode.id;
            return (
              <TouchableOpacity
                key={mode.id}
                style={[styles.modeCard, active && { borderColor: mode.color, borderWidth: 2, backgroundColor: mode.color + '15' }]}
                onPress={() => setSelectedMode(mode.id)}
              >
                <View style={[styles.modeIconWrap, { backgroundColor: active ? mode.color : '#f1f5f9' }]}>
                  <Ionicons name={mode.icon as any} size={22} color={active ? 'white' : mode.color} />
                </View>
                <Text style={[styles.modeLabel, active && { color: mode.color, fontWeight: '900' }]}>{mode.label}</Text>
                {routeData ? (
                  <Text style={styles.modeDuration}>{routeData.durationMin}m</Text>
                ) : (
                  <Text style={styles.modePts}>+{mode.pts}pts</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Route Card */}
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color="#16a34a" />
            <Text style={styles.loadingText}>Finding eco-friendly routes...</Text>
          </View>
        ) : routes.length > 0 && currentRoute ? (
          <View>
            {hasMockData && (
              <View style={styles.mockBanner}>
                <Ionicons name="information-circle-outline" size={16} color="#d97706" />
                <Text style={styles.mockText}>Estimated route (offline mode – ORS not reachable)</Text>
              </View>
            )}
            <LinearGradient
              colors={['#14532d', '#16a34a', '#22c55e']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.routeCard}
            >
              <View style={styles.routeHeader}>
                <View>
                  <Text style={styles.routeDuration}>{currentRoute.durationMin} min</Text>
                  <Text style={styles.routeDistance}>{currentRoute.distanceKm} km away</Text>
                </View>
                <View style={styles.ecoScoreWrap}>
                  <Text style={styles.ecoScoreNum}>{currentRoute.ecoScore}</Text>
                  <Text style={styles.ecoScoreLabel}>ECO SCORE</Text>
                </View>
              </View>

              <View style={styles.routeStats}>
                <View style={styles.routeStat}>
                  <Ionicons name="leaf-outline" size={16} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.routeStatText}>{currentRoute.co2SavedKg} kg CO₂ saved</Text>
                </View>
                <View style={styles.routeStat}>
                  <Ionicons name="flash-outline" size={16} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.routeStatText}>+{currentMode.pts} pts earned</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.startBtn}
                onPress={handleStartJourney}
                disabled={completing}
              >
                {completing ? (
                  <ActivityIndicator color="#16a34a" />
                ) : (
                  <>
                    <Ionicons name="navigate" size={20} color="#16a34a" />
                    <Text style={styles.startBtnText}>Start Journey</Text>
                  </>
                )}
              </TouchableOpacity>
            </LinearGradient>

            {/* All routes comparison */}
            <Text style={styles.sectionLabel}>ALL OPTIONS</Text>
            {routes.map(r => {
              const m = MODES.find(x => x.id === r.mode);
              return (
                <TouchableOpacity
                  key={r.id}
                  style={[styles.routeRow, r.mode === selectedMode && { borderColor: m?.color, borderWidth: 2 }]}
                  onPress={() => setSelectedMode(r.mode)}
                >
                  <LinearGradient colors={m?.gradient || ['#f1f5f9', '#e2e8f0']} style={styles.routeRowIcon}>
                    <Ionicons name={m?.icon as any} size={20} color={m?.color || '#6b7280'} />
                  </LinearGradient>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.routeRowMode}>{m?.label || r.mode}</Text>
                    <Text style={styles.routeRowPts}>+{m?.pts || 0} eco pts</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.routeRowDuration}>{r.durationMin} min</Text>
                    <Text style={styles.routeRowDist}>{r.distanceKm} km</Text>
                  </View>
                  <View style={[styles.ecoScoreBump, { backgroundColor: (m?.color || '#6b7280') + '20', borderColor: m?.color || '#6b7280' }]}>
                    <Text style={[styles.ecoScoreBumpText, { color: m?.color }]}>{r.ecoScore}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : !loading && destination.length > 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="map-outline" size={56} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>Ready to find routes!</Text>
            <Text style={styles.emptyDesc}>Press the search button to find eco-friendly paths to your destination.</Text>
          </View>
        ) : (
          <View style={styles.emptyWrap}>
            <Ionicons name="leaf-outline" size={56} color="#bbf7d0" />
            <Text style={styles.emptyTitle}>Plan an eco journey</Text>
            <Text style={styles.emptyDesc}>Type a destination above to discover the greenest routes.</Text>
          </View>
        )}
        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { paddingTop: 56, paddingBottom: 24, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { color: 'white', fontSize: 28, fontWeight: '900' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  locationText: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '600' },
  leafIcon: { backgroundColor: 'rgba(255,255,255,0.15)', padding: 12, borderRadius: 20 },
  searchWrap: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginTop: -18, marginBottom: 4 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 14, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 6, gap: 10 },
  searchInput: { flex: 1, fontSize: 16, color: '#111827', fontWeight: '500' },
  searchBtn: { backgroundColor: '#16a34a', borderRadius: 20, padding: 16, shadowColor: '#16a34a', shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 6 },
  scroll: { flex: 1, paddingHorizontal: 16 },
  sectionLabel: { fontSize: 10, fontWeight: '800', color: '#94a3b8', letterSpacing: 2, textTransform: 'uppercase', marginTop: 20, marginBottom: 10 },
  modeGrid: { flexDirection: 'row', gap: 10 },
  modeCard: { flex: 1, backgroundColor: 'white', borderRadius: 20, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  modeIconWrap: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  modeLabel: { fontSize: 11, fontWeight: '700', color: '#6b7280' },
  modeDuration: { fontSize: 11, fontWeight: '800', color: '#16a34a', marginTop: 2 },
  modePts: { fontSize: 10, color: '#94a3b8', marginTop: 2 },
  loadingWrap: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  loadingText: { color: '#94a3b8', fontWeight: '600', fontSize: 14 },
  mockBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fef9c3', borderRadius: 14, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#fde047' },
  mockText: { flex: 1, color: '#92400e', fontSize: 12, fontWeight: '600' },
  routeCard: { borderRadius: 28, padding: 24, shadowColor: '#16a34a', shadowOpacity: 0.3, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 8 },
  routeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  routeDuration: { color: 'white', fontSize: 40, fontWeight: '900' },
  routeDistance: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600', marginTop: 2 },
  ecoScoreWrap: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: 14, alignItems: 'center' },
  ecoScoreNum: { color: 'white', fontSize: 24, fontWeight: '900' },
  ecoScoreLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 9, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  routeStats: { flexDirection: 'row', gap: 16, marginBottom: 20 },
  routeStat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  routeStatText: { color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '600' },
  startBtn: { backgroundColor: 'white', borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  startBtnText: { color: '#16a34a', fontWeight: '900', fontSize: 16, textTransform: 'uppercase', letterSpacing: 1 },
  routeRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 20, padding: 14, marginBottom: 10, gap: 12, borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  routeRowIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  routeRowMode: { fontSize: 14, fontWeight: '800', color: '#111827' },
  routeRowPts: { fontSize: 11, color: '#6b7280', fontWeight: '600', marginTop: 2 },
  routeRowDuration: { fontSize: 15, fontWeight: '900', color: '#111827' },
  routeRowDist: { fontSize: 11, color: '#9ca3af', fontWeight: '600' },
  ecoScoreBump: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  ecoScoreBumpText: { fontSize: 13, fontWeight: '900' },
  emptyWrap: { alignItems: 'center', paddingVertical: 48, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: '900', color: '#374151' },
  emptyDesc: { color: '#9ca3af', textAlign: 'center', fontSize: 14, lineHeight: 20, paddingHorizontal: 20 },
});
