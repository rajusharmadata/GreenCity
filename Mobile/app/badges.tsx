import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../store/authStore';

const ALL_BADGES = [
  { name: 'Green Starter', icon: '🌱', pts: 50, desc: 'Submit your first report', color: '#f0fdf4', border: '#86efac' },
  { name: 'Eco Warrior', icon: '⚔️', pts: 200, desc: 'Reach 200 impact points', color: '#fef9c3', border: '#fde047' },
  { name: 'City Guardian', icon: '🛡️', pts: 500, desc: 'Reach 500 impact points', color: '#ede9fe', border: '#c4b5fd' },
  { name: 'Planet Hero', icon: '🌍', pts: 1000, desc: 'Reach 1000 impact points', color: '#dcfce7', border: '#4ade80' },
  { name: 'Eco Trailblazer', icon: '🔥', pts: 2000, desc: 'Reach 2000 impact points', color: '#fee2e2', border: '#fca5a5' },
  { name: 'Planet Saviour', icon: '🏆', pts: 3000, desc: 'Reach 3000 impact points', color: '#fef3c7', border: '#fbbf24' },
];

const TIERS = [
  { name: 'Eco Newcomer', icon: '🌱', min: 0, max: 99, color: '#94a3b8' },
  { name: 'Green Scout', icon: '🍃', min: 100, max: 299, color: '#34d399' },
  { name: 'City Guardian', icon: '🌿', min: 300, max: 699, color: '#10b981' },
  { name: 'Eco Warrior', icon: '⚡', min: 700, max: 1499, color: '#06b6d4' },
  { name: 'Urban Hero', icon: '🌍', min: 1500, max: 2999, color: '#6366f1' },
  { name: 'Planet Saviour', icon: '🏆', min: 3000, max: Infinity, color: '#f59e0b' },
];

export default function BadgesScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const points = user?.points || 0;

  const earnedBadges = ALL_BADGES.filter(b => points >= b.pts);
  const nextBadge = ALL_BADGES.find(b => points < b.pts);
  const currentTier = TIERS.find(t => points >= t.min && points <= t.max) || TIERS[0];
  const nextTier = TIERS[TIERS.indexOf(currentTier) + 1];
  const tierProgress = nextTier
    ? ((points - currentTier.min) / (nextTier.min - currentTier.min)) * 100
    : 100;

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#14532d', '#16a34a']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Achievements</Text>
          <Text style={styles.headerSub}>{earnedBadges.length} of {ALL_BADGES.length} unlocked</Text>
        </View>
        <Text style={{ fontSize: 32 }}>🎖️</Text>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Tier Card */}
        <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.tierCard}>
          <View style={styles.tierRow}>
            <View style={[styles.tierIconWrap, { borderColor: currentTier.color }]}>
              <Text style={styles.tierEmoji}>{currentTier.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.tierLabel}>CURRENT TIER</Text>
              <Text style={[styles.tierName, { color: currentTier.color }]}>{currentTier.name}</Text>
              {nextTier && (
                <Text style={styles.tierNext}>Next: {nextTier.name} at {nextTier.min} pts</Text>
              )}
            </View>
            <View style={styles.ptsBox}>
              <Text style={styles.ptsNum}>{points}</Text>
              <Text style={styles.ptsLabel}>PTS</Text>
            </View>
          </View>
          {nextTier && (
            <View style={{ marginTop: 14 }}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${Math.min(tierProgress, 100)}%`, backgroundColor: currentTier.color }]} />
              </View>
              <View style={styles.progressLabels}>
                <Text style={styles.progressLabel}>{currentTier.min} pts</Text>
                <Text style={[styles.progressLabel, { color: currentTier.color, fontWeight: '700' }]}>
                  {Math.round(tierProgress)}%
                </Text>
                <Text style={styles.progressLabel}>{nextTier.min} pts</Text>
              </View>
            </View>
          )}
        </LinearGradient>

        {/* Next badge to unlock */}
        {nextBadge && (
          <View style={styles.nextBadgeCard}>
            <Ionicons name="lock-open-outline" size={16} color="#f59e0b" />
            <Text style={styles.nextBadgeText}>
              Next badge: <Text style={{ color: '#f59e0b', fontWeight: '800' }}>{nextBadge.name}</Text> at {nextBadge.pts} pts
              {' '}({Math.max(0, nextBadge.pts - points)} pts away)
            </Text>
          </View>
        )}

        {/* Badges Grid */}
        <Text style={styles.sectionTitle}>Badges</Text>
        <View style={styles.grid}>
          {ALL_BADGES.map((badge) => {
            const unlocked = points >= badge.pts;
            return (
              <View
                key={badge.name}
                style={[
                  styles.badgeCard,
                  unlocked
                    ? { backgroundColor: badge.color, borderColor: badge.border, borderWidth: 2 }
                    : { backgroundColor: '#f1f5f9', borderColor: '#e2e8f0', borderWidth: 1, opacity: 0.6 }
                ]}
              >
                {unlocked && (
                  <View style={styles.unlockedTag}>
                    <Ionicons name="checkmark-circle" size={14} color="#16a34a" />
                  </View>
                )}
                <Text style={[styles.badgeEmoji, !unlocked && styles.badgeEmojiLocked]}>
                  {unlocked ? badge.icon : '🔒'}
                </Text>
                <Text style={[styles.badgeName, !unlocked && { color: '#94a3b8' }]}>{badge.name}</Text>
                <Text style={[styles.badgeDesc, !unlocked && { color: '#cbd5e1' }]}>{badge.desc}</Text>
                <View style={styles.badgePtsBubble}>
                  <Text style={[styles.badgePts, unlocked ? { color: '#15803d' } : { color: '#94a3b8' }]}>
                    {badge.pts} pts
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Tier Roadmap */}
        <Text style={styles.sectionTitle}>Tier Roadmap</Text>
        <View style={styles.roadmapList}>
          {TIERS.map((tier, i) => {
            const reached = points >= tier.min;
            return (
              <View key={tier.name} style={styles.roadmapRow}>
                <View style={[styles.roadmapDot, { backgroundColor: reached ? tier.color : '#e2e8f0' }]}>
                  <Text style={styles.roadmapEmoji}>{reached ? tier.icon : '·'}</Text>
                </View>
                {i < TIERS.length - 1 && (
                  <View style={[styles.roadmapLine, { backgroundColor: reached ? tier.color : '#e2e8f0' }]} />
                )}
                <View style={styles.roadmapInfo}>
                  <Text style={[styles.roadmapName, { color: reached ? tier.color : '#94a3b8' }]}>{tier.name}</Text>
                  <Text style={styles.roadmapPts}>
                    {tier.max === Infinity ? `${tier.min}+ pts` : `${tier.min}–${tier.max} pts`}
                  </Text>
                </View>
                {currentTier.name === tier.name && (
                  <View style={[styles.currentTierBadge, { backgroundColor: tier.color }]}>
                    <Text style={styles.currentTierText}>CURRENT</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { paddingTop: 56, paddingBottom: 24, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { padding: 4 },
  headerTitle: { color: 'white', fontSize: 24, fontWeight: '900' },
  headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600', marginTop: 2 },
  tierCard: { margin: 16, borderRadius: 28, padding: 20 },
  tierRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  tierIconWrap: { width: 64, height: 64, borderRadius: 20, borderWidth: 2, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.1)' },
  tierEmoji: { fontSize: 32 },
  tierLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase' },
  tierName: { fontSize: 18, fontWeight: '900', marginTop: 2 },
  tierNext: { color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 4 },
  ptsBox: { alignItems: 'center' },
  ptsNum: { color: 'white', fontSize: 28, fontWeight: '900' },
  ptsLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: '700', letterSpacing: 2 },
  progressTrack: { height: 8, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  progressLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: '600' },
  nextBadgeCard: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fef9c3', marginHorizontal: 16, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: '#fde047' },
  nextBadgeText: { flex: 1, color: '#78350f', fontSize: 13, fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#111827', marginHorizontal: 16, marginTop: 24, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 10, gap: 12, justifyContent: 'space-between' },
  badgeCard: { width: '46%', padding: 18, borderRadius: 24, alignItems: 'center', position: 'relative' },
  unlockedTag: { position: 'absolute', top: 10, right: 10 },
  badgeEmoji: { fontSize: 40, marginBottom: 8 },
  badgeEmojiLocked: { opacity: 0.6 },
  badgeName: { fontSize: 13, fontWeight: '900', color: '#111827', textAlign: 'center', marginBottom: 4 },
  badgeDesc: { fontSize: 11, color: '#6b7280', textAlign: 'center', lineHeight: 15 },
  badgePtsBubble: { marginTop: 8, backgroundColor: 'rgba(0,0,0,0.05)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  badgePts: { fontSize: 11, fontWeight: '800' },
  roadmapList: { paddingHorizontal: 16, marginBottom: 8 },
  roadmapRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 12 },
  roadmapDot: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  roadmapEmoji: { fontSize: 20 },
  roadmapLine: { display: 'none' },
  roadmapInfo: { flex: 1 },
  roadmapName: { fontSize: 14, fontWeight: '800' },
  roadmapPts: { fontSize: 11, color: '#9ca3af', fontWeight: '600', marginTop: 2 },
  currentTierBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  currentTierText: { color: 'white', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
});
