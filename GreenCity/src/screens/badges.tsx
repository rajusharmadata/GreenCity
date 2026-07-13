import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

  const earnedBadges = ALL_BADGES.filter((b) => points >= b.pts);
  const nextBadge = ALL_BADGES.find((b) => points < b.pts);
  const currentTier = TIERS.find((t) => points >= t.min && points <= t.max) || TIERS[0];
  const nextTier = TIERS[TIERS.indexOf(currentTier) + 1];
  const tierProgress = nextTier
    ? ((points - currentTier.min) / (nextTier.min - currentTier.min)) * 100
    : 100;
  const clampedProgress = Math.min(Math.max(tierProgress, 0), 100);

  // Animate the progress fill in on mount rather than snapping to width —
  // small touch, but it reads as "your progress just loaded" instead of static UI.
  const progressAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: clampedProgress,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [clampedProgress]);

  const animatedWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <LinearGradient colors={['#14532d', '#16a34a']} style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Achievements</Text>
          <Text style={styles.headerSub}>
            {earnedBadges.length} of {ALL_BADGES.length} unlocked
          </Text>
        </View>
        <View style={styles.headerIconWrap}>
          <Text style={{ fontSize: 26 }}>🎖️</Text>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Tier Card */}
        <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.tierCard}>
          <View style={styles.tierRow}>
            <View style={[styles.tierIconWrap, { borderColor: currentTier.color }]}>
              <Text style={styles.tierEmoji}>{currentTier.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.tierLabel}>CURRENT TIER</Text>
              <Text style={[styles.tierName, { color: currentTier.color }]}>
                {currentTier.name}
              </Text>
              {nextTier && (
                <Text style={styles.tierNext}>
                  Next: {nextTier.name} at {nextTier.min} pts
                </Text>
              )}
            </View>
            <View style={styles.ptsBox}>
              <Text style={styles.ptsNum}>{points}</Text>
              <Text style={styles.ptsLabel}>PTS</Text>
            </View>
          </View>

          {nextTier && (
            <View style={{ marginTop: 16 }}>
              <View style={styles.progressTrack}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    { width: animatedWidth, backgroundColor: currentTier.color },
                  ]}
                />
              </View>
              <View style={styles.progressLabels}>
                <Text style={styles.progressLabel}>{currentTier.min} pts</Text>
                <Text style={[styles.progressPct, { color: currentTier.color }]}>
                  {Math.round(clampedProgress)}%
                </Text>
                <Text style={styles.progressLabel}>{nextTier.min} pts</Text>
              </View>
            </View>
          )}
        </LinearGradient>

        {/* Next badge to unlock */}
        {nextBadge && (
          <View style={styles.nextBadgeCard}>
            <View style={styles.nextBadgeIconWrap}>
              <Ionicons name="lock-open-outline" size={16} color="#b45309" />
            </View>
            <Text style={styles.nextBadgeText}>
              Next badge: <Text style={styles.nextBadgeHighlight}>{nextBadge.name}</Text> at{' '}
              {nextBadge.pts} pts
              <Text style={styles.nextBadgeMuted}>
                {'  ·  '}
                {Math.max(0, nextBadge.pts - points)} pts away
              </Text>
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
                    ? {
                        backgroundColor: badge.color,
                        borderColor: badge.border,
                        borderWidth: 1.5,
                        ...styles.badgeCardShadow,
                      }
                    : {
                        backgroundColor: '#f8fafc',
                        borderColor: '#e2e8f0',
                        borderWidth: 1,
                      },
                ]}
              >
                {unlocked && (
                  <View style={styles.unlockedTag}>
                    <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
                  </View>
                )}
                <View style={[styles.badgeEmojiWrap, !unlocked && styles.badgeEmojiWrapLocked]}>
                  <Text style={styles.badgeEmoji}>{unlocked ? badge.icon : '🔒'}</Text>
                </View>
                <Text style={[styles.badgeName, !unlocked && styles.textMuted]}>
                  {badge.name}
                </Text>
                <Text style={[styles.badgeDesc, !unlocked && styles.textFaint]}>
                  {badge.desc}
                </Text>
                <View
                  style={[
                    styles.badgePtsBubble,
                    unlocked && { backgroundColor: 'rgba(21,128,61,0.12)' },
                  ]}
                >
                  <Text style={[styles.badgePts, unlocked ? styles.badgePtsUnlocked : styles.textMuted]}>
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
            const isLast = i === TIERS.length - 1;
            return (
              <View key={tier.name} style={styles.roadmapRow}>
                <View style={styles.roadmapDotColumn}>
                  <View
                    style={[
                      styles.roadmapDot,
                      { backgroundColor: reached ? tier.color : '#e2e8f0' },
                      reached && styles.roadmapDotShadow,
                    ]}
                  >
                    <Text style={styles.roadmapEmoji}>{reached ? tier.icon : '·'}</Text>
                  </View>
                  {!isLast && (
                    <View
                      style={[
                        styles.roadmapLine,
                        { backgroundColor: reached ? tier.color : '#e2e8f0' },
                      ]}
                    />
                  )}
                </View>
                <View style={styles.roadmapInfo}>
                  <Text style={[styles.roadmapName, { color: reached ? '#111827' : '#94a3b8' }]}>
                    {tier.name}
                  </Text>
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
      </ScrollView>
    </SafeAreaView>
  );
}

const cardShadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  android: { elevation: 3 },
  default: {},
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },

  header: {
    paddingTop: 12,
    paddingBottom: 24,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { color: 'white', fontSize: 24, fontWeight: '800', letterSpacing: -0.3 },
  headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: '600', marginTop: 2 },
  headerIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  tierCard: { margin: 16, borderRadius: 24, padding: 20, ...cardShadow },
  tierRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  tierIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  tierEmoji: { fontSize: 28 },
  tierLabel: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  tierName: { fontSize: 19, fontWeight: '800', marginTop: 3, letterSpacing: -0.3 },
  tierNext: { color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 4 },
  ptsBox: { alignItems: 'center' },
  ptsNum: { color: 'white', fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  ptsLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },

  progressTrack: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 4 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  progressLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 10, fontWeight: '600' },
  progressPct: { fontSize: 11, fontWeight: '800' },

  nextBadgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fefce8',
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  nextBadgeIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(180,83,9,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBadgeText: { flex: 1, color: '#78350f', fontSize: 13, fontWeight: '500', lineHeight: 18 },
  nextBadgeHighlight: { color: '#b45309', fontWeight: '800' },
  nextBadgeMuted: { color: '#a16207', fontWeight: '600' },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
    marginHorizontal: 16,
    marginTop: 26,
    marginBottom: 12,
    letterSpacing: -0.3,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  badgeCard: {
    flexBasis: '47%',
    flexGrow: 1,
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    position: 'relative',
  },
  badgeCardShadow: cardShadow,
  unlockedTag: { position: 'absolute', top: 10, right: 10 },
  badgeEmojiWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  badgeEmojiWrapLocked: { backgroundColor: 'rgba(148,163,184,0.12)' },
  badgeEmoji: { fontSize: 26 },
  badgeName: { fontSize: 13, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 4 },
  badgeDesc: { fontSize: 11, color: '#6b7280', textAlign: 'center', lineHeight: 15 },
  badgePtsBubble: {
    marginTop: 10,
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgePts: { fontSize: 11, fontWeight: '800' },
  badgePtsUnlocked: { color: '#15803d' },
  textMuted: { color: '#94a3b8' },
  textFaint: { color: '#cbd5e1' },

  roadmapList: { paddingHorizontal: 16, marginBottom: 8 },
  roadmapRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  roadmapDotColumn: { alignItems: 'center' },
  roadmapDot: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  roadmapDotShadow: cardShadow,
  roadmapEmoji: { fontSize: 20 },
  roadmapLine: { width: 2, flex: 1, minHeight: 22, marginVertical: 4 },
  roadmapInfo: { flex: 1, justifyContent: 'center', minHeight: 44 },
  roadmapName: { fontSize: 14, fontWeight: '800' },
  roadmapPts: { fontSize: 11, color: '#9ca3af', fontWeight: '600', marginTop: 2 },
  currentTierBadge: {
    alignSelf: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  currentTierText: { color: 'white', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
});