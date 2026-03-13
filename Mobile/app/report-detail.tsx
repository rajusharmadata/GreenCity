import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity,
  ActivityIndicator, StyleSheet
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../utils/api';

const SEVERITY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Critical: { bg: '#fee2e2', text: '#dc2626', border: '#fca5a5' },
  High: { bg: '#fef3c7', text: '#d97706', border: '#fcd34d' },
  Medium: { bg: '#dbeafe', text: '#2563eb', border: '#93c5fd' },
  Low: { bg: '#dcfce7', text: '#16a34a', border: '#86efac' },
};

const STATUS_STEPS = ['Pending', 'In Progress', 'Resolved'];

export default function ReportDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await api.get(`/reports/${id}`);
        setReport(res.data.report);
      } catch (e: any) {
        setError(e.response?.data?.error || 'Failed to load report');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={styles.loadingText}>Loading Report...</Text>
      </View>
    );
  }

  if (error || !report) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={64} color="#cbd5e1" />
        <Text style={styles.errorText}>{error || 'Report not found'}</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const severity = report.ai?.severity || 'Low';
  const sevColors = SEVERITY_COLORS[severity] || SEVERITY_COLORS.Low;
  const currentStep = STATUS_STEPS.indexOf(report.status ?? 'Pending');
  const confidencePct = report.ai?.confidence != null
    ? Math.round(report.ai.confidence * 100)
    : null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#14532d', '#16a34a']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report Detail</Text>
        <View style={styles.codeTag}>
          <Text style={styles.codeText}>{report.issueCode}</Text>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        {/* Image */}
        {report.image ? (
          <Image source={{ uri: report.image }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={48} color="#cbd5e1" />
          </View>
        )}

        <View style={styles.content}>
          {/* Title + Severity */}
          <View style={styles.row}>
            <Text style={styles.title} numberOfLines={2}>{report.title}</Text>
            <View style={[styles.severityBadge, { backgroundColor: sevColors.bg, borderColor: sevColors.border }]}>
              <Text style={[styles.severityText, { color: sevColors.text }]}>{severity}</Text>
            </View>
          </View>

          {/* Status Timeline */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>STATUS</Text>
            <View style={styles.timeline}>
              {STATUS_STEPS.map((step, i) => (
                <View key={step} style={styles.timelineItem}>
                  <View style={[
                    styles.timelineDot,
                    i <= currentStep ? styles.timelineDotActive : styles.timelineDotInactive
                  ]}>
                    {i < currentStep && <Ionicons name="checkmark" size={12} color="white" />}
                    {i === currentStep && <View style={styles.timelineDotCenter} />}
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

          {/* Location */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>LOCATION</Text>
            <View style={styles.locationRow}>
              <View style={styles.locationIcon}>
                <Ionicons name="location-sharp" size={20} color="#16a34a" />
              </View>
              <Text style={styles.locationText}>{report.address || 'Unknown location'}</Text>
            </View>
          </View>

          {/* AI Analysis */}
          {report.ai && (
            <LinearGradient colors={['#f0fdf4', '#dcfce7']} style={styles.aiCard}>
              <View style={styles.aiHeader}>
                <View style={styles.aiIconWrap}>
                  <Ionicons name="sparkles" size={20} color="#16a34a" />
                </View>
                <Text style={styles.aiTitle}>AI Analysis</Text>
                {confidencePct != null && (
                  <View style={styles.confidenceBadge}>
                    <Text style={styles.confidenceText}>{confidencePct}% confident</Text>
                  </View>
                )}
              </View>

              <View style={styles.aiRow}>
                <Text style={styles.aiKey}>Category</Text>
                <Text style={styles.aiVal}>{report.ai.category || report.category}</Text>
              </View>
              {report.ai.description ? (
                <View style={styles.aiDescCard}>
                  <Text style={styles.aiDescLabel}>Description</Text>
                  <Text style={styles.aiDesc}>{report.ai.description}</Text>
                </View>
              ) : null}
              {report.ai.suggestedAction ? (
                <View style={styles.aiActionCard}>
                  <Ionicons name="bulb-outline" size={16} color="#d97706" />
                  <Text style={styles.aiAction}>{report.ai.suggestedAction}</Text>
                </View>
              ) : null}
            </LinearGradient>
          )}

          {/* Category + Date Meta */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="pricetag-outline" size={16} color="#6b7280" />
              <Text style={styles.metaText}>{report.category}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={16} color="#6b7280" />
              <Text style={styles.metaText}>
                {new Date(report.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="shield-checkmark-outline" size={16} color="#16a34a" />
              <Text style={[styles.metaText, { color: '#16a34a' }]}>Integrity {report.integrity}</Text>
            </View>
          </View>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  loadingText: { marginTop: 12, color: '#94a3b8', fontWeight: '600' },
  errorText: { marginTop: 12, color: '#94a3b8', textAlign: 'center', fontSize: 16 },
  backBtn: { marginTop: 20, backgroundColor: '#16a34a', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20 },
  backBtnText: { color: 'white', fontWeight: '700' },
  header: { paddingTop: 56, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 12 },
  backIcon: { padding: 4 },
  headerTitle: { flex: 1, color: 'white', fontSize: 20, fontWeight: '900' },
  codeTag: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  codeText: { color: 'white', fontSize: 11, fontWeight: '700' },
  scroll: { flex: 1 },
  image: { width: '100%', height: 260 },
  imagePlaceholder: { height: 200, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20, gap: 16 },
  row: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  title: { flex: 1, fontSize: 22, fontWeight: '900', color: '#111827', lineHeight: 28 },
  severityBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, alignSelf: 'flex-start', marginTop: 4 },
  severityText: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  card: { backgroundColor: 'white', borderRadius: 24, padding: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  cardLabel: { fontSize: 10, fontWeight: '800', color: '#94a3b8', letterSpacing: 2, marginBottom: 12, textTransform: 'uppercase' },
  timeline: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  timelineItem: { alignItems: 'center', flex: 1 },
  timelineDot: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  timelineDotActive: { backgroundColor: '#16a34a' },
  timelineDotInactive: { backgroundColor: '#e5e7eb', borderWidth: 2, borderColor: '#d1d5db' },
  timelineDotCenter: { width: 10, height: 10, borderRadius: 5, backgroundColor: 'white' },
  timelineLine: { position: 'absolute', top: 13, left: '50%', right: '-50%', height: 2 },
  timelineLineActive: { backgroundColor: '#16a34a' },
  timelineLineInactive: { backgroundColor: '#e5e7eb' },
  timelineLabel: { marginTop: 8, fontSize: 10, fontWeight: '700', textAlign: 'center' },
  timelineLabelActive: { color: '#16a34a' },
  timelineLabelInactive: { color: '#9ca3af' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  locationIcon: { backgroundColor: '#f0fdf4', padding: 8, borderRadius: 12 },
  locationText: { flex: 1, color: '#374151', fontWeight: '600', fontSize: 14 },
  aiCard: { borderRadius: 24, padding: 20, gap: 12 },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  aiIconWrap: { backgroundColor: '#dcfce7', padding: 8, borderRadius: 12 },
  aiTitle: { flex: 1, fontSize: 15, fontWeight: '900', color: '#14532d' },
  confidenceBadge: { backgroundColor: '#bbf7d0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  confidenceText: { color: '#15803d', fontSize: 11, fontWeight: '700' },
  aiRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  aiKey: { color: '#6b7280', fontWeight: '600', fontSize: 13 },
  aiVal: { color: '#111827', fontWeight: '800', fontSize: 13 },
  aiDescCard: { backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 16, padding: 14, gap: 4 },
  aiDescLabel: { fontSize: 10, fontWeight: '800', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1 },
  aiDesc: { color: '#374151', fontSize: 14, lineHeight: 20, fontStyle: 'italic' },
  aiActionCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#fef9c3', borderRadius: 16, padding: 14 },
  aiAction: { flex: 1, color: '#78350f', fontSize: 13, fontWeight: '600' },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, gap: 6, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  metaText: { color: '#6b7280', fontSize: 12, fontWeight: '600' },
});
