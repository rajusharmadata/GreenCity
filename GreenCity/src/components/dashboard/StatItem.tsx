import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, FontWeights } from '../../styles/theme';

interface StatItemProps {
  icon: any;
  value: string;
  label: string;
}

export function StatItem({ icon, value, label }: StatItemProps) {
  return (
    <View style={styles.statItem}>
      <Ionicons name={icon} size={14} color="rgba(255,255,255,0.7)" style={{ marginBottom: 2 }} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statItem: { alignItems: 'center', flex: 1 },
  statValue: {
    fontSize: FontSizes['2xl'],
    fontWeight: FontWeights.extrabold,
    color: Colors.neutral[0],
  },
  statLabel: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold,
    color: '#dcfce7',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
