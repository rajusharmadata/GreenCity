import React from 'react';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights } from '../../styles/theme';

interface ActionCardProps {
  icon: any;
  title: string;
  color: string;
  desc: string;
  onPress: () => void;
}

export function ActionCard({ icon, title, color, desc, onPress }: ActionCardProps) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.actionCard} activeOpacity={0.85}>
      <LinearGradient
        colors={[`${color}20`, `${color}05`]}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.actionCardIcon, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <Text style={styles.actionCardTitle}>{title}</Text>
      <Text style={styles.actionCardDesc}>{desc}</Text>
    </TouchableOpacity>
  );
}

const cardShadow = {
  shadowColor: '#000',
  shadowOpacity: 0.06,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 3 },
  elevation: 2,
};

const styles = StyleSheet.create({
  actionCard: {
    flex: 1,
    backgroundColor: Colors.neutral[0],
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius['3xl'],
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.neutral[100],
    ...cardShadow,
  },
  actionCardIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius['3xl'],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  actionCardTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.extrabold,
    color: Colors.neutral[900],
  },
  actionCardDesc: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold,
    color: Colors.neutral[400],
    marginTop: 2,
    textTransform: 'uppercase',
  },
});
