import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';

interface ReportCardProps {
  report: any;
  onPress: () => void;
}

const STATUS_COLOR: Record<string, { bg: string; text: string }> = {
  Pending: colors.status.Pending,
  'In Progress': colors.status['In Progress'],
  Resolved: colors.status.Resolved,
};
const SEV_COLOR: Record<string, string> = colors.severity as Record<string, string>;

export function ReportCard({ report, onPress }: ReportCardProps) {
  const statusStyle = STATUS_COLOR[report.status] || STATUS_COLOR.Pending;
  const sevColor = SEV_COLOR[report.ai?.severity] || colors.textMuted;

  return (
    <TouchableOpacity
      style={styles.reportCard}
      onPress={onPress}
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
}

const styles = StyleSheet.create({
  reportCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 12,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  reportImage: {
    width: 80,
    height: 80,
    borderRadius: 18,
    backgroundColor: colors.borderLight,
  },
  reportInfo: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  reportHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reportCategory: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  reportAddress: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: '600',
    marginTop: 2,
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  severityLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 4,
  },
  severityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  severityLabelText: {
    fontSize: 10,
    fontWeight: '800',
  },
  reportDate: {
    fontSize: 11,
    color: colors.textLight,
    fontWeight: '600',
  },
});
