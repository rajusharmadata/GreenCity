import React from 'react';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface ActionCardProps {
  icon: any;
  label: string;
  color: string;
  onPress: () => void;
}

export function ActionCard({ icon, label, color, onPress }: ActionCardProps) {
  return (
    <TouchableOpacity style={styles.actionCard} onPress={onPress}>
      <LinearGradient colors={[color + '20', color + '08']} style={[StyleSheet.absoluteFill, { borderRadius: 20 }]} />
      <View style={[styles.actionIcon, { backgroundColor: color + '22' }]}>
        <Ionicons name={icon} size={26} color={color} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  actionCard: {
    width: '47%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#374151',
  },
});
