import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity,
  ActivityIndicator, StyleSheet
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../utils/api';
import { colors } from '../theme';

const SEVERITY_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  Critical: { bg: '#fee2e2', text: '#dc2626', border: '#fecaca', dot: '#dc2626' },
  High: { bg: '#fff7ed', text: '#ea580c', border: '#ffedd5', dot: '#ea580c' },
  Medium: { bg: '#eff6ff', text: '#2563eb', border: '#dbeafe', dot: '#2563eb' },
  Low: { bg: '#f0fdf4', text: '#16a34a', border: '#dcfce7', dot: '#16a34a' },
};

const STATUS_STEPS = ['Pending', 'In Progress', 'Resolved'];

export default function ReportDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      setError('Report ID is missing');
      setLoading(false);
      return;
    }
    (async () => {
      try {
        // Try to fetch from reports endpoint
        const res = await api.get(`/reports/${id}`);
        // Support both { report } and { issue } keys for maximum resilience
        setReport(res.data.report || res.data.issue);
      } catch (e: any) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('[ReportDetail] load error:', e?.response?.data || e.message);
        }
        setError(e.response?.data?.error || 'Failed to load report session. Please try again later.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Analyzing Green Data...</Text>
      </View>
    );
  }

  if (error || !report) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <View style={styles.errorIconContainer}>
          <Ionicons name="leaf-outline" size={64} color={colors.border} />
          <View style={styles.errorBadge}>
            <Ionicons name="alert" size={20} color="white" />
          </View>
        </View>
        <Text style={styles.errorText}>{error || 'Report Data Unavailable'}</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="white" />
          <Text style={styles.backBtnText}>Return to Reports</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const severity = report.ai?.severity || 'Low';
  const sevColors = SEVERITY_COLORS[severity] || SEVERITY_COLORS.Low;
  const currentStep = STATUS_STEPS.indexOf(report.status ?? 'Pending');
  const confidencePct = report.ai?.confidence != null
    ? Math.round(report.ai.confidence * 100)
    : 95;

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={[colors.primaryDark, colors.primary]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
          <Ionicons name="chevron-back" size={28} color="white" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Report Details</Text>
          <Text style={styles.headerSub}>Tracking Environmental Impact</Text>
        </View>
        <View style={styles.codeTag}>
          <Text style={styles.codeText}>{report.issueCode || 'GC-9999'}</Text>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        {/* Image Card */}
        <View style={styles.heroCard}>
          {report.image ? (
            <Image source={{ uri: report.image }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image" size={64} color={colors.border} />
              <Text style={styles.placeholderText}>Visual Evidence Unavailable</Text>
            </View>
          )}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.4)']}
            style={styles.imageOverlay}
          />
          <View style={[styles.floatingSeverity, { backgroundColor: sevColors.bg }]}>
            <View style={[styles.severityDot, { backgroundColor: sevColors.dot }]} />
            <Text style={[styles.severityText, { color: sevColors.text }]}>{severity}</Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Title & Status */}
          <View style={styles.mainInfo}>
            <Text style={styles.title}>{report.title || report.category}</Text>
            
            <View style={styles.statusBox}>
              <Text style={styles.cardLabel}>INVESTIGATION STATUS</Text>
              <View style={styles.timeline}>
                {STATUS_STEPS.map((step, i) => (
                  <View key={step} style={styles.timelineItem}>
                    <View style={[
                      styles.timelineDot,
                      i <= currentStep ? styles.timelineDotActive : styles.timelineDotInactive
                    ]}>
                      {i < currentStep && <Ionicons name="checkmark" size={14} color="white" />}
                      {i === currentStep && <View style={styles.pulseDot} />}
                    </View>
                    {i < STATUS_STEPS.length - 1 && (
                      <View style={[styles.timelineLine, i < currentStep ? styles.timelineLineActive : styles.timelineLineInactive]} />
                    )}
                    <Text style={[styles.timelineLabel, i <= currentStep ? styles.timelineLabelActive : styles.timelineLabelInactive]}>
                      {step}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Location Details */}
          <View style={styles.detailCard}>
            <View style={styles.detailTitleRow}>
              <View style={styles.detailIconBox}>
                <Ionicons name="location" size={18} color={colors.primary} />
              </View>
              <Text style={styles.detailTitle}>Location Intelligence</Text>
            </View>
            <Text style={styles.locationContent}>{report.address || 'Geo-coordinates locked'}</Text>
            {report.coords && (
              <View style={styles.coordsRow}>
                <Text style={styles.coordsText}>LAT: {report.coords.lat.toFixed(6)}</Text>
                <Text style={styles.coordsDivider}>•</Text>
                <Text style={styles.coordsText}>LNG: {report.coords.lng.toFixed(6)}</Text>
              </View>
            )}
          </View>

          {/* AI Insights */}
          <LinearGradient colors={['#ffffff', '#f0fdf4']} style={styles.aiInsightCard}>
            <View style={styles.aiHeader}>
              <View style={styles.aiBadge}>
                <Ionicons name="hardware-chip" size={14} color="white" />
                <Text style={styles.aiBadgeText}>AI INSIGHTS</Text>
              </View>
              <View style={styles.confidenceWrap}>
                <Text style={styles.confidenceVal}>{confidencePct}%</Text>
                <Text style={styles.confidenceLabel}>Confidence</Text>
              </View>
            </View>

            <View style={styles.aiBody}>
              <Text style={styles.aiDescription}>{report.ai?.description || 'Comprehensive environmental assessment pending.'}</Text>
              
              {report.ai?.suggestedAction && (
                <View style={styles.actionBox}>
                  <Ionicons name="construct" size={16} color={colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.actionLabel}>RECOMMENDED ACTION</Text>
                    <Text style={styles.actionText}>{report.ai.suggestedAction}</Text>
                  </View>
                </View>
              )}
            </View>
          </LinearGradient>

          {/* Report Metadata */}
          <View style={styles.metadataGrid}>
            <View style={styles.metaBox}>
              <Ionicons name="calendar" size={16} color={colors.primary} />
              <View>
                <Text style={styles.metaLabel}>REPORTED ON</Text>
                <Text style={styles.metaValue}>
                  {new Date(report.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </Text>
              </View>
            </View>
            <View style={styles.metaBox}>
              <Ionicons name="shield-checkmark" size={16} color={colors.primary} />
              <View>
                <Text style={styles.metaLabel}>INTEGRITY</Text>
                <Text style={styles.metaValue}>{report.integrity || 50}/100</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  loadingText: { marginTop: 16, color: colors.primary, fontWeight: '800', fontSize: 16 },
  errorIconContainer: { position: 'relative', marginBottom: 20 },
  errorBadge: { position: 'absolute', bottom: -4, right: -4, backgroundColor: colors.error, width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: colors.background },
  errorText: { color: colors.textLight, textAlign: 'center', fontSize: 16, fontWeight: '600', marginBottom: 30, lineHeight: 24 },
  backBtn: { backgroundColor: colors.text, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  backBtnText: { color: 'white', fontWeight: '800', fontSize: 14 },
  header: { paddingTop: 60, paddingBottom: 24, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', gap: 16 },
  backIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: 'white', fontSize: 22, fontWeight: '900' },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '600' },
  codeTag: { backgroundColor: 'white', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14 },
  codeText: { color: colors.primaryDark, fontSize: 11, fontWeight: '900', letterSpacing: 0.5 },
  scroll: { flex: 1 },
  heroCard: { margin: 20, height: 280, borderRadius: 36, overflow: 'hidden', backgroundColor: 'white', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 15, elevation: 8 },
  image: { width: '100%', height: '100%' },
  imageOverlay: { ...StyleSheet.absoluteFillObject },
  imagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9' },
  placeholderText: { marginTop: 12, color: colors.textLight, fontWeight: '700', fontSize: 14 },
  floatingSeverity: { position: 'absolute', top: 20, right: 20, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
  severityDot: { width: 8, height: 8, borderRadius: 4 },
  severityText: { fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  content: { paddingHorizontal: 20 },
  mainInfo: { marginBottom: 24 },
  title: { fontSize: 24, fontWeight: '900', color: colors.text, marginBottom: 20, lineHeight: 32 },
  statusBox: { backgroundColor: 'white', borderRadius: 28, padding: 24, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  cardLabel: { fontSize: 10, fontWeight: '900', color: colors.textLight, letterSpacing: 1.5, marginBottom: 16 },
  timeline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  timelineItem: { alignItems: 'center', flex: 1 },
  timelineDot: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  timelineDotActive: { backgroundColor: colors.primary },
  timelineDotInactive: { backgroundColor: colors.borderLight },
  pulseDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: 'white' },
  timelineLine: { position: 'absolute', top: 16, left: '50%', right: '-50%', height: 3 },
  timelineLineActive: { backgroundColor: colors.primary },
  timelineLineInactive: { backgroundColor: colors.borderLight },
  timelineLabel: { marginTop: 10, fontSize: 11, fontWeight: '800' },
  timelineLabelActive: { color: colors.primary },
  timelineLabelInactive: { color: colors.textLight },
  detailCard: { backgroundColor: 'white', borderRadius: 28, padding: 24, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  detailTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  detailIconBox: { width: 32, height: 32, borderRadius: 10, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  detailTitle: { fontSize: 15, fontWeight: '800', color: colors.text },
  locationContent: { fontSize: 14, color: colors.textMuted, lineHeight: 22, fontWeight: '600' },
  coordsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.borderLight },
  coordsText: { fontSize: 10, color: colors.primary, fontWeight: '800', letterSpacing: 0.5 },
  coordsDivider: { color: colors.border, fontSize: 10 },
  aiInsightCard: { borderRadius: 32, padding: 24, marginBottom: 20, shadowColor: colors.primary, shadowOpacity: 0.1, shadowRadius: 15, elevation: 4 },
  aiHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  aiBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  aiBadgeText: { color: 'white', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  confidenceWrap: { alignItems: 'flex-end' },
  confidenceVal: { fontSize: 18, fontWeight: '900', color: colors.primary },
  confidenceLabel: { fontSize: 9, fontWeight: '700', color: colors.textLight, textTransform: 'uppercase' },
  aiDescription: { fontSize: 15, color: colors.text, lineHeight: 24, fontWeight: '600', marginBottom: 20 },
  aiBody: { gap: 12 },
  actionBox: { flexDirection: 'row', gap: 12, backgroundColor: 'white', padding: 16, borderRadius: 20, borderLeftWidth: 4, borderLeftColor: colors.primary },
  actionLabel: { fontSize: 9, fontWeight: '900', color: colors.primary, letterSpacing: 1, marginBottom: 4 },
  actionText: { fontSize: 13, color: colors.text, fontWeight: '700', lineHeight: 18 },
  metadataGrid: { flexDirection: 'row', gap: 12, marginBottom: 30 },
  metaBox: { flex: 1, backgroundColor: 'white', borderRadius: 24, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8 },
  metaLabel: { fontSize: 9, fontWeight: '800', color: colors.textLight, marginBottom: 2 },
  metaValue: { fontSize: 12, fontWeight: '800', color: colors.text },
});
