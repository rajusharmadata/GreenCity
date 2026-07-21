import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  ActivityIndicator, Alert, StyleSheet, RefreshControl
} from 'react-native';
import { useAuthStore } from '../store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import api from '../utils/api';
import { useApi } from '../hooks/api/useApi';
import { ActionCard } from '../components/profile/ActionCard';
import { MenuItem } from '../components/profile/MenuItem';

import {styles}  from '../styles/profile'
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
  const { get, put, post } = useApi();
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
      const res = await get('/auth/me', { showToast: false });
      const userData = res?.data?.data?.user;
      if (userData) {
        setUser(userData, token);
        setReportsCount(userData.reportsCount || 0);
      }
    } catch (e) {
      console.error('Profile refresh error:', e);
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
      if (response.data?.data?.user) {
        setUser(response.data.data.user, token);
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