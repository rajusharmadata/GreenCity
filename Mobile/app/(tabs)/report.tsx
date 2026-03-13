import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Image,
  ActivityIndicator, Modal, StyleSheet, Alert, RefreshControl
} from 'react-native';
import * as Location from 'expo-location';
import api from '../../utils/api';
import CameraCapture from '../../components/CameraCapture';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';
import { useRouter, useFocusEffect } from 'expo-router';

const STATUS_COLOR: Record<string, { bg: string; text: string }> = {
  Pending: { bg: '#fef9c3', text: '#b45309' },
  'In Progress': { bg: '#dbeafe', text: '#1d4ed8' },
  Resolved: { bg: '#dcfce7', text: '#15803d' },
};
const SEV_COLOR: Record<string, string> = {
  Critical: '#dc2626', High: '#d97706', Medium: '#2563eb', Low: '#16a34a'
};

export default function ReportScreen() {
  const router = useRouter();
  const [showCamera, setShowCamera] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [address, setAddress] = useState('');
  const [aiResult, setAiResult] = useState<any>(null);
  const [myReports, setMyReports] = useState<any[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const updatePoints = useAuthStore(state => state.updatePoints);

  const fetchLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLocation(loc);
      const reverse = await Location.reverseGeocodeAsync({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      if (reverse[0]) {
        const addr = reverse[0];
        setAddress(`${addr.streetNumber || ''} ${addr.street || ''}, ${addr.city || ''}`.trim().replace(/^,/, '').trim() || 'Location detected');
      }
    } catch (e) {
      console.error('[Report] location error:', e);
    }
  };

  const fetchMyReports = async () => {
    try {
      const res = await api.get('/reports/my-reports');
      setMyReports(res.data.reports || []);
    } catch (e) {
      console.error('[Report] fetch my reports error:', e);
    } finally {
      setReportsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchLocation(); }, []);

  useFocusEffect(useCallback(() => { fetchMyReports(); }, []));

  const onRefresh = () => { setRefreshing(true); fetchMyReports(); };

  const handleCapture = (uri: string) => { setPhoto(uri); setShowCamera(false); };

  const handleSubmit = async () => {
    if (!photo || !location) { Alert.alert('Required', 'Photo and location are required.'); return; }
    setLoading(true);
    try {
      const formData = new FormData();
      // @ts-ignore
      formData.append('image', { uri: photo, type: 'image/jpeg', name: 'report.jpg' });
      formData.append('lat', location.coords.latitude.toString());
      formData.append('lng', location.coords.longitude.toString());
      formData.append('address', address);

      const response = await api.post('/reports/submit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAiResult(response.data);
      updatePoints(response.data.totalPoints);
      fetchMyReports();
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || e.response?.data?.error || 'Report submission failed');
    } finally {
      setLoading(false);
    }
  };

  if (showCamera) return <CameraCapture onCapture={handleCapture} onClose={() => setShowCamera(false)} />;

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#16a34a" />}
    >
      {/* Header */}
      <LinearGradient colors={['#14532d', '#16a34a']} style={styles.header}>
        <Text style={styles.headerTitle}>Report Issue</Text>
        <Text style={styles.headerSub}>AI-powered environmental reporting</Text>
      </LinearGradient>

      <View style={styles.content}>
        {/* Location Bar */}
        <View style={styles.locationBar}>
          <View style={styles.locationIcon}>
            <Ionicons name="location-sharp" size={20} color="#16a34a" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.locationLabel}>DETECTED LOCATION</Text>
            <Text style={styles.locationValue} numberOfLines={1}>
              {address || (location ? 'Resolving address...' : 'Detecting...')}
            </Text>
          </View>
          <TouchableOpacity onPress={() => { setAddress(''); fetchLocation(); }} style={styles.refreshBtn}>
            <Ionicons name="refresh" size={18} color="#16a34a" />
          </TouchableOpacity>
        </View>

        {/* Camera Area */}
        {!photo ? (
          <TouchableOpacity style={styles.cameraTrigger} onPress={() => setShowCamera(true)}>
            <LinearGradient colors={['#f0fdf4', '#dcfce7']} style={styles.cameraGradient}>
              <View style={styles.cameraInner}>
                <Ionicons name="camera" size={52} color="#16a34a" />
                <Text style={styles.cameraTitle}>Tap to Capture</Text>
                <Text style={styles.cameraSubtitle}>AI will analyze the issue instantly</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <View style={styles.photoContainer}>
            <Image source={{ uri: photo }} style={styles.photo} resizeMode="cover" />
            <TouchableOpacity style={styles.overlayClose} onPress={() => setPhoto(null)}>
              <Ionicons name="close" size={22} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.retakeBtn} onPress={() => setShowCamera(true)}>
              <Ionicons name="camera-reverse-outline" size={18} color="#16a34a" />
              <Text style={styles.retakeBtnText}>Retake</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Submit Button */}
        {photo && (
          <TouchableOpacity
            style={[styles.submitBtn, loading && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <LinearGradient colors={['#14532d', '#16a34a']} style={styles.submitGradient}>
              {loading ? (
                <>
                  <ActivityIndicator color="white" />
                  <Text style={styles.submitText}>Analyzing with AI...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="sparkles" size={22} color="white" />
                  <Text style={styles.submitText}>Analyze & Submit</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* My Reports */}
        <View style={styles.myReportsHeader}>
          <Text style={styles.myReportsTitle}>My Reports</Text>
          <Text style={styles.myReportsCount}>{myReports.length} submitted</Text>
        </View>

        {reportsLoading ? (
          <ActivityIndicator color="#16a34a" style={{ marginTop: 16 }} />
        ) : myReports.length === 0 ? (
          <View style={styles.emptyReports}>
            <Ionicons name="document-text-outline" size={40} color="#cbd5e1" />
            <Text style={styles.emptyReportsText}>No reports yet. Be the change!</Text>
          </View>
        ) : (
          myReports.map(report => {
            const statusStyle = STATUS_COLOR[report.status] || STATUS_COLOR.Pending;
            const sevColor = SEV_COLOR[report.ai?.severity] || '#6b7280';
            return (
              <TouchableOpacity
                key={report._id}
                style={styles.reportCard}
                onPress={() => router.push({ pathname: '/report-detail', params: { id: report._id } })}
                activeOpacity={0.8}
              >
                <View style={styles.reportCardInner}>
                  <Image
                    source={{ uri: report.image || 'https://picsum.photos/200/200?random=1' }}
                    style={styles.reportThumb}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reportTitle} numberOfLines={1}>{report.title}</Text>
                    <Text style={styles.reportAddr} numberOfLines={1}>
                      <Ionicons name="location-outline" size={11} color="#94a3b8" /> {report.address || 'Unknown'}
                    </Text>
                    <View style={styles.reportTags}>
                      <View style={[styles.statusTag, { backgroundColor: statusStyle.bg }]}>
                        <Text style={[styles.statusText, { color: statusStyle.text }]}>{report.status}</Text>
                      </View>
                      {report.ai?.severity && (
                        <View style={[styles.sevTag, { borderColor: sevColor }]}>
                          <Text style={[styles.sevText, { color: sevColor }]}>{report.ai.severity}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>

      {/* Success Modal */}
      <Modal visible={!!aiResult} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <LinearGradient colors={['#f0fdf4', '#dcfce7']} style={styles.modalHeader}>
              <View style={styles.checkCircle}>
                <Ionicons name="checkmark-circle" size={52} color="#16a34a" />
              </View>
              <Text style={styles.modalTitle}>Report Submitted!</Text>
              <View style={styles.pointsBubble}>
                <Ionicons name="flash" size={14} color="#f59e0b" />
                <Text style={styles.pointsText}>+{aiResult?.pointsEarned || 10} Points Earned</Text>
              </View>
            </LinearGradient>

            <View style={styles.aiResultCard}>
              <Text style={styles.aiResultLabel}>AI ANALYSIS</Text>
              <View style={styles.aiResultRow}>
                <Text style={styles.aiResultKey}>Category</Text>
                <Text style={styles.aiResultVal}>{aiResult?.ai?.category || aiResult?.report?.category}</Text>
              </View>
              <View style={styles.aiResultRow}>
                <Text style={styles.aiResultKey}>Severity</Text>
                <View style={[styles.sevTag, { borderColor: SEV_COLOR[aiResult?.ai?.severity] || '#6b7280' }]}>
                  <Text style={[styles.sevText, { color: SEV_COLOR[aiResult?.ai?.severity] || '#6b7280' }]}>
                    {aiResult?.ai?.severity || 'Low'}
                  </Text>
                </View>
              </View>
              {aiResult?.ai?.description && (
                <Text style={styles.aiResultDesc}>"{aiResult.ai.description}"</Text>
              )}
            </View>

            <TouchableOpacity style={styles.awesomeBtn} onPress={() => { setAiResult(null); setPhoto(null); }}>
              <Text style={styles.awesomeBtnText}>Awesome! 🌿</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { paddingTop: 56, paddingBottom: 28, paddingHorizontal: 20 },
  headerTitle: { color: 'white', fontSize: 28, fontWeight: '900' },
  headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: '500', marginTop: 4 },
  content: { padding: 16 },
  locationBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 20, padding: 14, marginBottom: 16, gap: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  locationIcon: { backgroundColor: '#f0fdf4', padding: 8, borderRadius: 12 },
  locationLabel: { fontSize: 9, fontWeight: '800', color: '#94a3b8', letterSpacing: 2, textTransform: 'uppercase' },
  locationValue: { fontSize: 13, fontWeight: '700', color: '#111827', marginTop: 2 },
  refreshBtn: { padding: 8, backgroundColor: '#f0fdf4', borderRadius: 12 },
  cameraTrigger: { borderRadius: 28, overflow: 'hidden', marginBottom: 16, borderWidth: 2, borderColor: '#86efac', borderStyle: 'dashed' },
  cameraGradient: { padding: 40 },
  cameraInner: { alignItems: 'center', gap: 8 },
  cameraTitle: { fontSize: 18, fontWeight: '900', color: '#15803d' },
  cameraSubtitle: { fontSize: 13, color: '#4ade80', fontWeight: '500', textAlign: 'center' },
  photoContainer: { borderRadius: 28, overflow: 'hidden', marginBottom: 16, position: 'relative' },
  photo: { width: '100%', height: 260, borderRadius: 28 },
  overlayClose: { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 14 },
  retakeBtn: { position: 'absolute', bottom: 12, left: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14, gap: 6 },
  retakeBtnText: { color: '#16a34a', fontWeight: '700', fontSize: 13 },
  submitBtn: { borderRadius: 22, overflow: 'hidden', marginBottom: 24 },
  submitGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 18 },
  submitText: { color: 'white', fontSize: 17, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 },
  myReportsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  myReportsTitle: { fontSize: 20, fontWeight: '900', color: '#111827' },
  myReportsCount: { fontSize: 12, fontWeight: '700', color: '#16a34a' },
  emptyReports: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  emptyReportsText: { color: '#94a3b8', fontWeight: '600', fontSize: 14 },
  reportCard: { backgroundColor: 'white', borderRadius: 20, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  reportCardInner: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  reportThumb: { width: 64, height: 64, borderRadius: 16, backgroundColor: '#f1f5f9' },
  reportTitle: { fontSize: 14, fontWeight: '800', color: '#111827' },
  reportAddr: { fontSize: 11, color: '#9ca3af', fontWeight: '500', marginTop: 3 },
  reportTags: { flexDirection: 'row', gap: 6, marginTop: 6 },
  statusTag: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  statusText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  sevTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, borderWidth: 1 },
  sevText: { fontSize: 10, fontWeight: '800' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalSheet: { backgroundColor: 'white', borderTopLeftRadius: 40, borderTopRightRadius: 40, overflow: 'hidden' },
  modalHeader: { alignItems: 'center', padding: 30 },
  checkCircle: { marginBottom: 10 },
  modalTitle: { fontSize: 24, fontWeight: '900', color: '#14532d', marginBottom: 8 },
  pointsBubble: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fef9c3', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16 },
  pointsText: { color: '#92400e', fontWeight: '800', fontSize: 14 },
  aiResultCard: { padding: 20, gap: 10 },
  aiResultLabel: { fontSize: 10, fontWeight: '800', color: '#94a3b8', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 },
  aiResultRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  aiResultKey: { color: '#6b7280', fontWeight: '600', fontSize: 14 },
  aiResultVal: { color: '#111827', fontWeight: '800', fontSize: 14 },
  aiResultDesc: { color: '#6b7280', fontStyle: 'italic', fontSize: 13, lineHeight: 19, backgroundColor: '#f8fafc', padding: 14, borderRadius: 14 },
  awesomeBtn: { margin: 16, marginTop: 4, backgroundColor: '#16a34a', borderRadius: 20, padding: 18 },
  awesomeBtnText: { color: 'white', textAlign: 'center', fontWeight: '900', fontSize: 16 },
});
