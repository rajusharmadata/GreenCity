import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Image,
  ActivityIndicator, Modal, StyleSheet, Alert, RefreshControl
} from 'react-native';
import CameraCapture from '../../components/CameraCapture';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import { useLocation } from '../../hooks/useLocation';
import { useCamera } from '../../hooks/useCamera';
import { usePoints } from '../../hooks/usePoints';
import { submitReport, fetchMyReports as fetchMyReportsApi } from '../../services/reportService';
import { colors } from '../../theme';

const STATUS_COLOR: Record<string, { bg: string; text: string }> = {
  Pending: colors.status.Pending,
  'In Progress': colors.status['In Progress'],
  Resolved: colors.status.Resolved,
};
const SEV_COLOR: Record<string, string> = colors.severity as Record<string, string>;

export default function ReportScreen() {
  const router = useRouter();
  const { location, address, refresh: refreshLocation, getCurrentForSubmit, getAddressForCoords } = useLocation();
  const { showCamera, photo, openCamera, closeCamera, onCapture, clearPhoto } = useCamera();
  const { updatePoints } = usePoints();
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [myReports, setMyReports] = useState<any[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMyReports = useCallback(async () => {
    try {
      const data = await fetchMyReportsApi();
      setMyReports(data.reports || []);
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('[Report] fetch my reports error:', e);
      }
    } finally {
      setReportsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchMyReports(); }, []));

  const onRefresh = () => { setRefreshing(true); fetchMyReports(); };

  const handleSubmit = async () => {
    if (!photo) { Alert.alert('Required', 'Photo is required.'); return; }
    setLoading(true);
    try {
      const exactLoc = await getCurrentForSubmit();
      if (!exactLoc) {
        Alert.alert('Location required', 'Please enable location so authorities can find and fix this issue.');
        setLoading(false);
        return;
      }
      const resolvedAddress = await getAddressForCoords(exactLoc.coords.latitude, exactLoc.coords.longitude) || address || 'Resolving...';
      const response = await submitReport({
        imageUri: photo,
        lat: exactLoc.coords.latitude,
        lng: exactLoc.coords.longitude,
        address: resolvedAddress,
      });
      setAiResult(response);
      if (response.totalPoints != null) updatePoints(response.totalPoints);
      fetchMyReports();
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error ?? e.message ?? 'Report submission failed');
    } finally {
      setLoading(false);
    }
  };

  if (showCamera) return <CameraCapture onCapture={onCapture} onClose={closeCamera} />;

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      {/* Header */}
      <LinearGradient colors={[colors.primaryDark, colors.primary]} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Green Report</Text>
            <Text style={styles.headerSub}>AI Environmental Guardian</Text>
          </View>
          <View style={styles.headerIcon}>
            <Ionicons name="leaf" size={28} color="white" />
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Location Bar */}
        <TouchableOpacity activeOpacity={0.7} onPress={() => refreshLocation()} style={styles.locationCard}>
          <View style={styles.locationIcon}>
            <Ionicons name="location" size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.locationLabel}>VERIFIED LOCATION</Text>
            <Text style={styles.locationValue} numberOfLines={1}>
              {address || (location ? 'Resolving address...' : 'Detecting...')}
            </Text>
          </View>
          <Ionicons name="refresh-circle" size={24} color={colors.primary} />
        </TouchableOpacity>

        {/* Camera Area */}
        {!photo ? (
          <TouchableOpacity style={styles.cameraTrigger} onPress={openCamera} activeOpacity={0.9}>
            <LinearGradient colors={['#ffffff', '#f0fdf4']} style={styles.cameraGradient}>
              <View style={styles.cameraInner}>
                <View style={styles.cameraIconContainer}>
                  <Ionicons name="camera" size={48} color={colors.primary} />
                  <View style={styles.cameraBadge}>
                    <Ionicons name="sparkles" size={14} color="white" />
                  </View>
                </View>
                <Text style={styles.cameraTitle}>Capture Issue</Text>
                <Text style={styles.cameraSubtitle}>Point, shoot, and let AI do the rest</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <View style={styles.photoContainer}>
            <Image source={{ uri: photo }} style={styles.photo} resizeMode="cover" />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.6)']}
              style={styles.photoOverlay}
            />
            <TouchableOpacity style={styles.overlayClose} onPress={clearPhoto}>
              <Ionicons name="close" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.retakeBtn} onPress={openCamera}>
              <Ionicons name="camera-reverse" size={18} color={colors.primary} />
              <Text style={styles.retakeBtnText}>Retake</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Submit Button */}
        {photo && (
          <TouchableOpacity
            style={[styles.submitBtn, loading && { opacity: 0.8 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <LinearGradient 
              colors={[colors.primary, colors.primaryDark]} 
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitGradient}
            >
              {loading ? (
                <>
                  <ActivityIndicator color="white" size="small" />
                  <Text style={styles.submitText}>AI is analyzing...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="cloud-upload" size={22} color="white" />
                  <Text style={styles.submitText}>Submit Report</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* My Reports */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Previous Contributions</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{myReports.length}</Text>
          </View>
        </View>

        {reportsLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
        ) : myReports.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text" size={48} color={colors.textLight} />
            <Text style={styles.emptyText}>No reports yet. Start reporting to earn points!</Text>
          </View>
        ) : (
          <View style={styles.reportsList}>
            {myReports.map(report => {
              const statusStyle = STATUS_COLOR[report.status] || STATUS_COLOR.Pending;
              const sevColor = SEV_COLOR[report.ai?.severity] || colors.textMuted;
              return (
                <TouchableOpacity
                  key={report._id}
                  style={styles.reportCard}
                  onPress={() => router.push(`/report-detail?id=${report._id}`)}
                  activeOpacity={0.7}
                >
                  <Image
                    source={{ uri: report.image || 'https://picsum.photos/200/200?random=1' }}
                    style={styles.reportImage}
                  />
                  <View style={styles.reportInfo}>
                    <View style={styles.reportHeaderRow}>
                      <Text style={styles.reportCategory} numberOfLines={1}>{report.category}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                        <Text style={[styles.statusBadgeText, { color: statusStyle.text }]}>{report.status}</Text>
                      </View>
                    </View>
                    <Text style={styles.reportAddress} numberOfLines={1}>
                      <Ionicons name="pin" size={10} color={colors.primary} /> {report.address || 'Unknown Location'}
                    </Text>
                    <View style={styles.reportFooter}>
                      <View style={[styles.severityLabel, { borderColor: sevColor }]}>
                        <View style={[styles.severityDot, { backgroundColor: sevColor }]} />
                        <Text style={[styles.severityLabelText, { color: sevColor }]}>{report.ai?.severity || 'Normal'}</Text>
                      </View>
                      <Text style={styles.reportDate}>{new Date(report.createdAt).toLocaleDateString()}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      {/* Success Modal */}
      <Modal visible={!!aiResult} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <LinearGradient colors={[colors.primaryDark, colors.primary]} style={styles.modalHero}>
                <View style={styles.successIcon}>
                  <Ionicons name="checkmark-done" size={40} color="white" />
                </View>
                <Text style={styles.modalHeadline}>Great Job!</Text>
                <Text style={styles.modalSubheadline}>Your report has been received</Text>
                
                <View style={styles.rewardCard}>
                  <Ionicons name="star" size={18} color="#fbbf24" />
                  <Text style={styles.rewardText}>+{aiResult?.pointsEarned || 10} XP EARNED</Text>
                </View>
              </LinearGradient>

              <View style={styles.aiBreakdown}>
                <View style={styles.aiTag}>
                  <Ionicons name="hardware-chip" size={12} color={colors.primary} />
                  <Text style={styles.aiTagText}>AI ANALYSIS</Text>
                </View>
                
                <View style={styles.aiDetailBox}>
                  <Text style={styles.aiResultTitle}>{aiResult?.ai?.category || 'Environmental Issue'}</Text>
                  <Text style={styles.aiResultDescription}>
                    {aiResult?.ai?.description || 'Your report has been successfully processed by our AI systems.'}
                  </Text>
                  
                  <View style={styles.aiStatRow}>
                    <View style={styles.aiStat}>
                      <Text style={styles.aiStatLabel}>SEVERITY</Text>
                      <Text style={[styles.aiStatValue, { color: SEV_COLOR[aiResult?.ai?.severity] || colors.primary }]}>
                        {aiResult?.ai?.severity || 'Normal'}
                      </Text>
                    </View>
                    <View style={styles.aiStatDivider} />
                    <View style={styles.aiStat}>
                      <Text style={styles.aiStatLabel}>CONFIDENCE</Text>
                      <Text style={styles.aiStatValue}>{( (aiResult?.ai?.confidence || 0.95) * 100).toFixed(0)}%</Text>
                    </View>
                  </View>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.modalCloseBtn} 
                onPress={() => { setAiResult(null); clearPhoto(); }}
              >
                <Text style={styles.modalCloseBtnText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: 60, paddingBottom: 30, paddingHorizontal: 24, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { color: 'white', fontSize: 32, fontWeight: '900', letterSpacing: -0.5 },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600', marginTop: 2 },
  headerIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20 },
  locationCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 24, padding: 16, marginBottom: 20, gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 4 },
  locationIcon: { width: 40, height: 40, backgroundColor: colors.primaryLight, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  locationLabel: { fontSize: 10, fontWeight: '800', color: colors.textLight, letterSpacing: 1.5 },
  locationValue: { fontSize: 14, fontWeight: '700', color: colors.text, marginTop: 2 },
  cameraTrigger: { borderRadius: 32, overflow: 'hidden', marginBottom: 20, shadowColor: colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 6 },
  cameraGradient: { paddingVertical: 40, paddingHorizontal: 20 },
  cameraInner: { alignItems: 'center' },
  cameraIconContainer: { marginBottom: 16, position: 'relative' },
  cameraBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#fbbf24', width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'white' },
  cameraTitle: { fontSize: 20, fontWeight: '900', color: colors.primaryDark },
  cameraSubtitle: { fontSize: 14, color: colors.primary, fontWeight: '600', marginTop: 4, opacity: 0.8 },
  photoContainer: { borderRadius: 32, overflow: 'hidden', marginBottom: 20, position: 'relative', height: 300, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 15, elevation: 8 },
  photo: { width: '100%', height: '100%' },
  photoOverlay: { ...StyleSheet.absoluteFillObject },
  overlayClose: { position: 'absolute', top: 16, right: 16, backgroundColor: 'rgba(0,0,0,0.5)', width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' },
  retakeBtn: { position: 'absolute', bottom: 16, left: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 16, gap: 6 },
  retakeBtnText: { color: colors.primary, fontWeight: '800', fontSize: 14 },
  submitBtn: { borderRadius: 24, overflow: 'hidden', marginBottom: 30, shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  submitGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, paddingVertical: 20 },
  submitText: { color: 'white', fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 10 },
  sectionTitle: { fontSize: 22, fontWeight: '900', color: colors.text },
  countBadge: { backgroundColor: colors.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  countText: { color: 'white', fontSize: 12, fontWeight: '800' },
  emptyContainer: { alignItems: 'center', paddingVertical: 40, opacity: 0.5 },
  emptyText: { color: colors.text, fontWeight: '600', fontSize: 14, marginTop: 12, textAlign: 'center', paddingHorizontal: 40 },
  reportsList: { gap: 12 },
  reportCard: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 24, padding: 12, gap: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  reportImage: { width: 80, height: 80, borderRadius: 18, backgroundColor: colors.borderLight },
  reportInfo: { flex: 1, justifyContent: 'space-between', paddingVertical: 2 },
  reportHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reportCategory: { fontSize: 16, fontWeight: '800', color: colors.text, flex: 1, marginRight: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  statusBadgeText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  reportAddress: { fontSize: 12, color: colors.textLight, fontWeight: '600', marginTop: 2 },
  reportFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  severityLabel: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2, gap: 4 },
  severityDot: { width: 6, height: 6, borderRadius: 3 },
  severityLabelText: { fontSize: 10, fontWeight: '800' },
  reportDate: { fontSize: 11, color: colors.textLight, fontWeight: '600' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContainer: { width: '100%', maxWidth: 400, borderRadius: 36, overflow: 'hidden' },
  modalContent: { backgroundColor: 'white' },
  modalHero: { padding: 40, alignItems: 'center' },
  successIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  modalHeadline: { color: 'white', fontSize: 28, fontWeight: '900' },
  modalSubheadline: { color: 'rgba(255,255,255,0.8)', fontSize: 16, fontWeight: '600', marginTop: 4 },
  rewardCard: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginTop: 24 },
  rewardText: { color: 'white', fontWeight: '900', fontSize: 14, letterSpacing: 1 },
  aiBreakdown: { padding: 30 },
  aiTag: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  aiTagText: { color: colors.primary, fontSize: 11, fontWeight: '900', letterSpacing: 2 },
  aiDetailBox: { backgroundColor: '#f8fafc', borderRadius: 24, padding: 20 },
  aiResultTitle: { fontSize: 20, fontWeight: '900', color: colors.text, marginBottom: 8 },
  aiResultDescription: { fontSize: 14, color: colors.textMuted, lineHeight: 22, fontWeight: '500' },
  aiStatRow: { flexDirection: 'row', alignItems: 'center', marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  aiStat: { flex: 1, alignItems: 'center' },
  aiStatDivider: { width: 1, height: 30, backgroundColor: '#e2e8f0' },
  aiStatLabel: { fontSize: 10, fontWeight: '800', color: colors.textLight, marginBottom: 4, letterSpacing: 1 },
  aiStatValue: { fontSize: 16, fontWeight: '900', color: colors.text },
  modalCloseBtn: { margin: 30, marginTop: 0, backgroundColor: colors.text, borderRadius: 20, padding: 18 },
  modalCloseBtnText: { color: 'white', textAlign: 'center', fontWeight: '900', fontSize: 16 },
});
