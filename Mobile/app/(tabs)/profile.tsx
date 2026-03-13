import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  ActivityIndicator, Alert, StyleSheet, RefreshControl
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import api from '../../utils/api';

const BADGES = [
  { name: 'Green Starter', icon: '🌱', pts: 50, color: '#f0fdf4', border: '#86efac' },
  { name: 'Eco Warrior', icon: '⚔️', pts: 200, color: '#fef9c3', border: '#fde047' },
  { name: 'City Guardian', icon: '🛡️', pts: 500, color: '#ede9fe', border: '#c4b5fd' },
  { name: 'Planet Hero', icon: '🌍', pts: 1000, color: '#dcfce7', border: '#4ade80' },
];

const TIERS = [
  { name: 'Eco Newcomer', icon: '🌱', min: 0, color: '#94a3b8' },
  { name: 'Green Scout', icon: '🍃', min: 100, color: '#34d399' },
  { name: 'City Guardian', icon: '🌿', min: 300, color: '#10b981' },
  { name: 'Eco Warrior', icon: '⚡', min: 700, color: '#06b6d4' },
  { name: 'Urban Hero', icon: '🌍', min: 1500, color: '#6366f1' },
  { name: 'Planet Saviour', icon: '🏆', min: 3000, color: '#f59e0b' },
];

function getTier(pts: number) {
  return [...TIERS].reverse().find(t => pts >= t.min) || TIERS[0];
}

export default function ProfileScreen() {
  const { user, token, setUser, logout } = useAuthStore();
  const [uploading, setUploading] = useState(false);
  const [reportsCount, setReportsCount] = useState(user?.reportsCount || 0);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const points = user?.points || 0;
  const tier = getTier(points);
  const earnedBadges = BADGES.filter(b => points >= b.pts);
  const nextBadge = BADGES.find(b => points < b.pts);

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data, token);
      setReportsCount(res.data.reportsCount || 0);
    } catch (e) {
      console.error('profile refresh error', e);
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { refreshUser(); }, []));
  const onRefresh = () => { setRefreshing(true); refreshUser(); };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true, aspect: [1, 1], quality: 0.7,
      });
      if (!result.canceled && result.assets?.length > 0) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadImage = async (uri: string) => {
    setUploading(true);
    try {
      const filename = uri.split('/').pop() || 'profile.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image';
      const formData = new FormData();
      // @ts-ignore
      formData.append('avatar', { uri, name: filename, type });
      const response = await api.post('/auth/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data?.avatar && user) {
        setUser({ ...user, avatar: response.data.avatar }, token);
        Alert.alert('✅ Updated', 'Profile photo updated!');
      }
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#16a34a" />}
    >
      {/* Hero Header */}
      <View style={styles.heroWrap}>
        <LinearGradient colors={['#14532d', '#16a34a', '#22c55e']} style={styles.heroBg} />
        <View style={styles.heroContent}>
          {/* Avatar */}
          <TouchableOpacity onPress={pickImage} disabled={uploading} style={styles.avatarWrap}>
            {uploading && (
              <View style={styles.avatarOverlay}>
                <ActivityIndicator size="large" color="#16a34a" />
              </View>
            )}
            <Image
              source={{ uri: user?.avatar || `https://i.pravatar.cc/300?u=${user?.email}` }}
              style={styles.avatar}
            />
            <View style={styles.cameraIcon}>
              <Ionicons name="camera" size={16} color="white" />
            </View>
          </TouchableOpacity>

          <Text style={styles.userName}>{user?.name || 'Green Citizen'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>

          {/* Tier Badge */}
          <View style={[styles.tierBadge, { backgroundColor: tier.color + '30', borderColor: tier.color }]}>
            <Text style={styles.tierEmoji}>{tier.icon}</Text>
            <Text style={[styles.tierText, { color: tier.color }]}>{tier.name}</Text>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{points}</Text>
              <Text style={styles.statLabel}>Impact Points</Text>
            </View>
            <View style={styles.statDivider} />
            <TouchableOpacity style={styles.statItem} onPress={() => router.push('/leaderboard')}>
              <Text style={styles.statValue}>{reportsCount}</Text>
              <Text style={styles.statLabel}>Reports</Text>
            </TouchableOpacity>
            <View style={styles.statDivider} />
            <TouchableOpacity style={styles.statItem} onPress={() => router.push('/badges')}>
              <Text style={styles.statValue}>{earnedBadges.length}</Text>
              <Text style={styles.statLabel}>Badges 🎖️</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.body}>
        {/* Next Badge Unlock */}
        {nextBadge && (
          <TouchableOpacity style={styles.nextBadgeCard} onPress={() => router.push('/badges')}>
            <View style={[styles.nextBadgeIcon, { backgroundColor: nextBadge.color, borderColor: nextBadge.border, borderWidth: 1 }]}>
              <Text style={{ fontSize: 22 }}>🔒</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.nextBadgeLabel}>NEXT BADGE</Text>
              <Text style={styles.nextBadgeName}>{nextBadge.name}</Text>
              <Text style={styles.nextBadgePts}>{Math.max(0, nextBadge.pts - points)} pts to unlock</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#16a34a" />
          </TouchableOpacity>
        )}

        {/* Earned Badges */}
        {earnedBadges.length > 0 && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Achievements</Text>
              <TouchableOpacity onPress={() => router.push('/badges')}>
                <Text style={styles.sectionLink}>View All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgesScroll}>
              {earnedBadges.map(badge => (
                <View key={badge.name} style={[styles.badgeCard, { backgroundColor: badge.color, borderColor: badge.border, borderWidth: 1.5 }]}>
                  <Text style={styles.badgeEmoji}>{badge.icon}</Text>
                  <Text style={styles.badgeName}>{badge.name}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <ActionCard icon="trophy" label="Leaderboard" color="#f59e0b" onPress={() => router.push('/leaderboard')} />
          <ActionCard icon="ribbon" label="My Badges" color="#6366f1" onPress={() => router.push('/badges')} />
          <ActionCard icon="document-text" label="My Reports" color="#16a34a" onPress={() => router.push('/(tabs)/report')} />
          <ActionCard icon="leaf" label="Eco Routes" color="#0ea5e9" onPress={() => router.push('/(tabs)/eco-routes')} />
        </View>

        {/* Settings */}
        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.settingsCard}>
          <MenuItem icon="notifications" title="Notifications" color="#16a34a" />
          <MenuItem icon="shield-checkmark" title="Privacy" color="#16a34a" />
          <MenuItem icon="language" title="Language: English" color="#16a34a" />
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => Alert.alert('Log Out', 'Are you sure?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Log Out', style: 'destructive', onPress: () => { logout(); router.replace('/login'); } }
            ])}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#fee2e2' }]}>
              <Ionicons name="log-out" size={22} color="#ef4444" />
            </View>
            <Text style={[styles.menuTitle, { color: '#ef4444' }]}>Log Out</Text>
            <Ionicons name="chevron-forward" size={18} color="#fca5a5" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

function ActionCard({ icon, label, color, onPress }: any) {
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

function MenuItem({ icon, title, color }: any) {
  return (
    <TouchableOpacity style={styles.menuItem}>
      <View style={[styles.menuIcon, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.menuTitle}>{title}</Text>
      <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  heroWrap: { position: 'relative', paddingBottom: 0 },
  heroBg: { position: 'absolute', top: 0, left: 0, right: 0, height: 200 },
  heroContent: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 24 },
  avatarWrap: { width: 110, height: 110, borderRadius: 35, borderWidth: 4, borderColor: 'white', overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, elevation: 8, marginBottom: 14, position: 'relative' },
  avatarOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.7)', alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  avatar: { width: '100%', height: '100%' },
  cameraIcon: { position: 'absolute', bottom: 6, right: 6, backgroundColor: '#16a34a', padding: 6, borderRadius: 10, borderWidth: 2, borderColor: 'white' },
  userName: { color: 'white', fontSize: 26, fontWeight: '900', textAlign: 'center' },
  userEmail: { color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: '500', marginTop: 3 },
  tierBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, marginTop: 10, marginBottom: 16 },
  tierEmoji: { fontSize: 16 },
  tierText: { fontWeight: '800', fontSize: 13 },
  statsRow: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 24, paddingVertical: 18, paddingHorizontal: 10, width: '100%', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '900', color: '#111827' },
  statLabel: { fontSize: 10, fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: '#f1f5f9' },
  body: { padding: 16, gap: 4 },
  nextBadgeCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 22, padding: 16, gap: 14, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  nextBadgeIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  nextBadgeLabel: { fontSize: 9, fontWeight: '800', color: '#94a3b8', letterSpacing: 2, textTransform: 'uppercase' },
  nextBadgeName: { fontSize: 15, fontWeight: '900', color: '#111827', marginTop: 2 },
  nextBadgePts: { fontSize: 12, color: '#16a34a', fontWeight: '700', marginTop: 2 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#111827', marginTop: 16, marginBottom: 10 },
  sectionLink: { color: '#16a34a', fontWeight: '700', fontSize: 13 },
  badgesScroll: { marginBottom: 8 },
  badgeCard: { padding: 16, borderRadius: 22, alignItems: 'center', marginRight: 10, minWidth: 90 },
  badgeEmoji: { fontSize: 32, marginBottom: 6 },
  badgeName: { fontSize: 11, fontWeight: '800', color: '#111827', textAlign: 'center' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionCard: { width: '47%', backgroundColor: 'white', borderRadius: 20, padding: 16, alignItems: 'center', gap: 8, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  actionIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontSize: 13, fontWeight: '800', color: '#374151' },
  settingsCard: { backgroundColor: 'white', borderRadius: 24, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14, borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
  menuIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  menuTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: '#374151' },
});
