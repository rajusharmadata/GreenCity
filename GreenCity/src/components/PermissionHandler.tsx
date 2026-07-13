import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { requestAllPermissions } from '../utils/permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights } from '../styles/theme';

interface PermissionItemProps {
  icon: string;
  title: string;
  desc: string;
}

function PermissionItem({ icon, title, desc }: PermissionItemProps) {
  return (
    <View style={styles.permissionItem}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon as any} size={24} color={Colors.primary[500]} />
      </View>
      <View style={styles.permissionContent}>
        <Text style={styles.permissionTitle}>{title}</Text>
        <Text style={styles.permissionDesc}>{desc}</Text>
      </View>
    </View>
  );
}

export default function PermissionHandler({ onComplete }: { onComplete: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleGrant = async () => {
    setLoading(true);
    await requestAllPermissions();
    await AsyncStorage.setItem('permissions_granted', 'true');
    setLoading(false);
    onComplete();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconBadge}>
          <Ionicons name="leaf" size={60} color={Colors.primary[500]} />
        </View>
        <Text style={styles.title}>Ready to go Green? 🌿</Text>
        <Text style={styles.subtitle}>To provide the best experience, GreenCity needs a few permissions:</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <PermissionItem 
          icon="location" 
          title="Location" 
          desc="To auto-detect issues near you and find eco routes" 
        />
        <PermissionItem 
          icon="camera" 
          title="Camera" 
          desc="To capture and report city issues instantly" 
        />
        <PermissionItem 
          icon="notifications" 
          title="Notifications" 
          desc="Get updates when your reports are resolved" 
        />
      </ScrollView>

      <TouchableOpacity 
        style={[styles.grantButton, loading && styles.grantButtonDisabled]}
        onPress={handleGrant}
        disabled={loading}
      >
        <Text style={styles.grantButtonText}>
          {loading ? 'Granting Permissions...' : 'Grant Permissions & Start'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundAlt,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  header: {
    marginTop: Spacing['2xl'],
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  iconBadge: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSizes['3xl'],
    fontWeight: FontWeights.bold,
    color: Colors.primary[900],
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.normal,
    color: Colors.neutral[500],
    textAlign: 'center',
    lineHeight: 24,
  },
  content: {
    flex: 1,
    marginVertical: Spacing.lg,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  permissionTitle: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.bold,
    color: Colors.primary[900],
    marginBottom: Spacing.xs,
  },
  permissionDesc: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.normal,
    color: Colors.neutral[400],
  },
  grantButton: {
    backgroundColor: Colors.primary[500],
    borderRadius: BorderRadius['3xl'],
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  grantButtonDisabled: {
    opacity: 0.6,
  },
  grantButtonText: {
    color: Colors.neutral[0],
    fontSize: FontSizes.base,
    fontWeight: FontWeights.bold,
  },
});