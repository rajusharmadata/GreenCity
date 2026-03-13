import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  ActivityIndicator, StyleSheet, RefreshControl
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../utils/api';
import { useAuthStore } from '../store/authStore';

const TIER_COLORS: Record<string, string> = {
  'Eco Newcomer': '#94a3b8',
  'Green Scout': '#34d399',
  'City Guardian': '#10b981',
  'Eco Warrior': '#06b6d4',
  'Urban Hero': '#6366f1',
  'Planet Saviour': '#f59e0b',
};
const TIER_ICONS: Record<string, string> = {
  'Eco Newcomer': '🌱',
  'Green Scout': '🍃',
  'City Guardian': '🌿',
  'Eco Warrior': '⚡',
  'Urban Hero': '🌍',
  'Planet Saviour': '🏆',
};

export default function LeaderboardScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [entries, setEntries] = useState<any[]>([]);
  const [myRank, setMyRank] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = async (p = 1) => {
    try {
      const [lbRes, meRes] = await Promise.allSettled([
        api.get(`/leaderboard?limit=20&page=${p}`),
        api.get('/leaderboard/me'),
      ]);
      if (lbRes.status === 'fulfilled') {
        const data = lbRes.value.data;
        setEntries(p === 1 ? data.leaderboard : [...entries, ...data.leaderboard]);
        setTotalPages(data.totalPages || 1);
      }
      if (meRes.status === 'fulfilled') {
        setMyRank(meRes.value.data.user);
      }
    } catch (e) {
      console.error('leaderboard fetch error', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(1); }, []);

  const onRefresh = () => { setRefreshing(true); setPage(1); fetchData(1); };
  const loadMore = () => {
    if (page < totalPages) { const next = page + 1; setPage(next); fetchData(next); }
  };

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#14532d', '#16a34a']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Leaderboard</Text>
          <Text style={styles.headerSub}>Global Eco Rankings</Text>
        </View>
        <View style={styles.trophyWrap}>
          <Text style={{ fontSize: 36 }}>🏆</Text>
        </View>
      </LinearGradient>

      {/* My Rank Banner */}
      {myRank && (
        <View style={styles.myRankBanner}>
          <Image
            source={{ uri: myRank.avatar || `https://i.pravatar.cc/150?u=${myRank.userId}` }}
            style={styles.myRankAvatar}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.myRankName}>Your Ranking</Text>
            <Text style={styles.myRankPts}>{myRank.points} pts · {myRank.tier || 'Eco Newcomer'} {TIER_ICONS[myRank.tier || 'Eco Newcomer']}</Text>
          </View>
          <View style={styles.myRankNumWrap}>
            <Text style={styles.myRankNum}>#{myRank.rank || '–'}</Text>
          </View>
        </View>
      )}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#16a34a" />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#16a34a" />}
        >
          {/* ── Podium (Top 3) ── */}
          {top3.length >= 1 && (
            <View style={styles.podiumWrap}>
              {/* 2nd */}
              {top3[1] && <PodiumCard entry={top3[1]} rank={2} height={110} />}
              {/* 1st */}
              {top3[0] && <PodiumCard entry={top3[0]} rank={1} height={140} />}
              {/* 3rd */}
              {top3[2] && <PodiumCard entry={top3[2]} rank={3} height={90} />}
            </View>
          )}

          {/* ── Rest of list ── */}
          <View style={styles.listSection}>
            {rest.map((entry, i) => (
              <RankRow key={entry._id || i} entry={entry} rank={i + 4} isYou={entry.userId === user?._id} />
            ))}

            {page < totalPages && (
              <TouchableOpacity style={styles.loadMoreBtn} onPress={loadMore}>
                <Text style={styles.loadMoreText}>Load More</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </View>
  );
}

function PodiumCard({ entry, rank, height }: { entry: any; rank: number; height: number }) {
  const podiumColors: Record<number, [string, string]> = {
    1: ['#f59e0b', '#fcd34d'],
    2: ['#6b7280', '#9ca3af'],
    3: ['#b45309', '#d97706'],
  };
  const medals = { 1: '🥇', 2: '🥈', 3: '🥉' };
  const [c1, c2] = podiumColors[rank];
  return (
    <View style={[styles.podiumCard, { alignSelf: 'flex-end' }]}>
      <Image
        source={{ uri: entry.avatar || `https://i.pravatar.cc/150?u=${entry.userId}` }}
        style={styles.podiumAvatar}
      />
      <Text style={styles.podiumMedal}>{medals[rank as 1 | 2 | 3]}</Text>
      <Text style={styles.podiumName} numberOfLines={1}>{entry.username || 'Eco Hero'}</Text>
      <Text style={styles.podiumPts}>{entry.points} pts</Text>
      <LinearGradient colors={[c1, c2]} style={[styles.podiumBase, { height }]}>
        <Text style={styles.podiumRankNum}>#{rank}</Text>
      </LinearGradient>
    </View>
  );
}

function RankRow({ entry, rank, isYou }: { entry: any; rank: number; isYou: boolean }) {
  const tierColor = TIER_COLORS[entry.tier] || '#94a3b8';
  const tierIcon = TIER_ICONS[entry.tier] || '🌱';
  return (
    <View style={[styles.rankRow, isYou && styles.rankRowYou]}>
      <Text style={styles.rankNum}>#{rank}</Text>
      <Image
        source={{ uri: entry.avatar || `https://i.pravatar.cc/150?u=${entry.userId}` }}
        style={styles.rankAvatar}
      />
      <View style={{ flex: 1 }}>
        <View style={styles.rankNameRow}>
          <Text style={styles.rankName} numberOfLines={1}>{entry.username || 'Eco Hero'}</Text>
          {isYou && <View style={styles.youBadge}><Text style={styles.youBadgeText}>You</Text></View>}
        </View>
        <View style={styles.rankTierRow}>
          <View style={[styles.tierDot, { backgroundColor: tierColor }]} />
          <Text style={[styles.rankTier, { color: tierColor }]}>{tierIcon} {entry.tier || 'Eco Newcomer'}</Text>
        </View>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.rankPts}>{entry.points}</Text>
        <Text style={styles.rankPtsLabel}>pts</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  header: { paddingTop: 56, paddingBottom: 24, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { padding: 4 },
  headerTitle: { color: 'white', fontSize: 24, fontWeight: '900' },
  headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600', marginTop: 2 },
  trophyWrap: { backgroundColor: 'rgba(255,255,255,0.15)', padding: 10, borderRadius: 20 },
  myRankBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#14532d', marginHorizontal: 16, marginTop: -10, borderRadius: 20, padding: 14, gap: 12, shadowColor: '#14532d', shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 8 },
  myRankAvatar: { width: 40, height: 40, borderRadius: 12, borderWidth: 2, borderColor: '#22c55e' },
  myRankName: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  myRankPts: { color: 'white', fontSize: 13, fontWeight: '800', marginTop: 2 },
  myRankNumWrap: { backgroundColor: '#f59e0b', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14 },
  myRankNum: { color: 'white', fontWeight: '900', fontSize: 16 },
  podiumWrap: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', paddingHorizontal: 16, paddingTop: 24, paddingBottom: 0, gap: 8 },
  podiumCard: { alignItems: 'center', flex: 1 },
  podiumAvatar: { width: 56, height: 56, borderRadius: 20, borderWidth: 3, borderColor: 'white', marginBottom: 6, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 6, elevation: 4 },
  podiumMedal: { fontSize: 22, marginBottom: 2 },
  podiumName: { fontSize: 11, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 2 },
  podiumPts: { fontSize: 11, fontWeight: '600', color: '#6b7280', marginBottom: 6 },
  podiumBase: { width: '100%', borderTopLeftRadius: 16, borderTopRightRadius: 16, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 10 },
  podiumRankNum: { color: 'white', fontWeight: '900', fontSize: 18 },
  listSection: { padding: 16, gap: 8 },
  rankRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 20, padding: 14, gap: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  rankRowYou: { borderWidth: 2, borderColor: '#86efac', backgroundColor: '#f0fdf4' },
  rankNum: { width: 28, color: '#9ca3af', fontWeight: '800', fontSize: 13, textAlign: 'center' },
  rankAvatar: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#e5e7eb' },
  rankNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rankName: { fontSize: 14, fontWeight: '800', color: '#111827', maxWidth: 130 },
  youBadge: { backgroundColor: '#dcfce7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  youBadgeText: { color: '#16a34a', fontSize: 10, fontWeight: '800' },
  rankTierRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  tierDot: { width: 6, height: 6, borderRadius: 3 },
  rankTier: { fontSize: 11, fontWeight: '700' },
  rankPts: { fontSize: 16, fontWeight: '900', color: '#111827' },
  rankPtsLabel: { fontSize: 10, color: '#9ca3af', fontWeight: '600', textAlign: 'right' },
  loadMoreBtn: { alignSelf: 'center', paddingHorizontal: 24, paddingVertical: 12, backgroundColor: '#16a34a', borderRadius: 16, marginTop: 8 },
  loadMoreText: { color: 'white', fontWeight: '700' },
});
