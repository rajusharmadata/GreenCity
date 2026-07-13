import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Animated,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import api from '../../src/utils/api';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights } from '../../src/styles/theme';

interface Issue {
  _id: string;
  title?: string;
  address?: string;
  category?: string;
  status?: string;
  image?: string;
}

export default function DashboardScreen() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setError(null);
    try {
      const [userRes, issuesRes] = await Promise.all([
        api.get('/auth/me'),
        api.get('/issues?limit=5'),
      ]);

      setUser(userRes.data.data.user, null); // keep existing token
      // NOTE: getIssues responds as { success, data: { issues, total, ... } } —
      // reading .data.issues directly (rather than .data.data.issues) would
      // silently leave this feed empty.
      setIssues(issuesRes.data.data.issues || []);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError("Couldn't load your dashboard. Pull down to try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Animate the weekly-goal progress bar in on load, rather than snapping to width.
  const progressAnim = useRef(new Animated.Value(0)).current;
  const progressPct = Math.min((user?.points || 0) % 100, 100);
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progressPct,
      duration: 700,
      useNativeDriver: false,
    }).start();
  }, [progressPct]);
  const animatedProgressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary[500]}
          />
        }
      >
        {/* Header */}
        <LinearGradient
          colors={[Colors.primary[900], Colors.primary[500], '#22c55e']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerWelcome}>Welcome back</Text>
              <Text style={styles.headerName}>{user?.name || 'Eco Warrior'}</Text>
            </View>
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => router.push('/')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="notifications-outline" size={22} color={Colors.neutral[0]} />
            </TouchableOpacity>
          </View>

          {/* Points card */}
          <View style={styles.pointsCard}>
            <View>
              <Text style={styles.pointsLabel}>Impact Points</Text>
              <Text style={styles.pointsValue}>{user?.points ?? 0}</Text>
            </View>
            <View style={styles.pointsIcon}>
              <Ionicons name="flash" size={28} color={Colors.neutral[0]} />
            </View>
          </View>

          {/* Quick stats */}
          <View style={styles.statsContainer}>
            <StatItem icon="document-text" value={(user?.reportsCount ?? 0).toString()} label="Reports" />
            <View style={styles.statDivider} />
            <StatItem icon="leaf" value={`${(user?.reportsCount ?? 0) * 5}kg`} label="CO2 Saved" />
            <View style={styles.statDivider} />
            <StatItem icon="trending-up" value={((user?.points ?? 0) / 100).toFixed(1)} label="Level" />
          </View>
        </LinearGradient>

        {/* Main content */}
        <View style={styles.contentSection}>
          {error && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={16} color="#b45309" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.actionCardsRow}>
            <ActionCard
              icon="camera"
              title="Report"
              color={Colors.primary[500]}
              desc="AI Analysis"
              onPress={() => router.push('/(tabs)/report')}
            />
            <ActionCard
              icon="leaf"
              title="Eco Routes"
              color="#0ea5e9"
              desc="Save CO2"
              onPress={() => router.push('/(tabs)/eco-routes')}
            />
          </View>

          {/* Weekly challenge */}
          <Text style={styles.sectionTitle}>Challenges</Text>
          <View style={styles.challengeCard}>
            <View style={styles.challengeHeader}>
              <View style={styles.challengeInfo}>
                <View style={styles.trophyIcon}>
                  <Ionicons name="trophy" size={22} color="#f59e0b" />
                </View>
                <View style={styles.challengeDetails}>
                  <Text style={styles.challengeTitle}>Weekly Goal</Text>
                  <Text style={styles.challengeSubtitle}>Reach 100 points</Text>
                </View>
              </View>
              <Text style={styles.challengePoints}>+50 pts</Text>
            </View>

            <View style={styles.progressBarContainer}>
              <Animated.View style={[styles.progressBar, { width: animatedProgressWidth }]} />
            </View>
          </View>

          {/* Community activity */}
          <View style={styles.activityHeader}>
            <Text style={styles.sectionTitle}>Community Activity</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/community')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.seeAllLink}>See All</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View>
              <IssueCardSkeleton />
              <IssueCardSkeleton />
            </View>
          ) : issues.length === 0 ? (
            <View style={styles.emptyStateWrap}>
              <Ionicons name="leaf-outline" size={28} color={Colors.neutral[300]} />
              <Text style={styles.emptyState}>No reports yet in your community.</Text>
            </View>
          ) : (
            issues.map((issue, i) => (
              <TouchableOpacity
                key={issue._id}
                style={styles.issueCard}
                onPress={() => router.push(`/report-detail?id=${issue._id}`)}
                activeOpacity={0.85}
              >
                <Image
                  source={{ uri: issue.image || `https://picsum.photos/200/200?random=${i}` }}
                  style={styles.issueImage}
                />
                <View style={styles.issueContent}>
                  <Text style={styles.issueTitle} numberOfLines={1}>
                    {issue.title || 'Untitled Issue'}
                  </Text>
                  <Text style={styles.issueAddress} numberOfLines={1}>
                    {issue.address || 'Location Unknown'}
                  </Text>
                  <View style={styles.issueMetaTags}>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: issue.status === 'Resolved' ? Colors.primary[100] : '#fed7aa' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: issue.status === 'Resolved' ? Colors.primary[500] : '#d97706' },
                        ]}
                      >
                        {issue.status}
                      </Text>
                    </View>
                    <Text style={styles.categoryTag}>{issue.category}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.neutral[300]} />
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatItem({ icon, value, label }: { icon: any; value: string; label: string }) {
  return (
    <View style={styles.statItem}>
      <Ionicons name={icon} size={14} color="rgba(255,255,255,0.7)" style={{ marginBottom: 2 }} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ActionCard({ icon, title, color, desc, onPress }: any) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.actionCard} activeOpacity={0.85}>
      <LinearGradient
        colors={[`${color}20`, `${color}05`]}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={[styles.actionCardIcon, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <Text style={styles.actionCardTitle}>{title}</Text>
      <Text style={styles.actionCardDesc}>{desc}</Text>
    </TouchableOpacity>
  );
}

function IssueCardSkeleton() {
  return (
    <View style={[styles.issueCard, styles.skeletonCard]}>
      <View style={[styles.issueImage, styles.skeletonBlock]} />
      <View style={{ flex: 1, marginLeft: Spacing.md, gap: 8 }}>
        <View style={[styles.skeletonBlock, { height: 14, width: '70%', borderRadius: 6 }]} />
        <View style={[styles.skeletonBlock, { height: 11, width: '45%', borderRadius: 6 }]} />
        <View style={[styles.skeletonBlock, { height: 18, width: '35%', borderRadius: 8 }]} />
      </View>
    </View>
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
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  headerGradient: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: 64,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  headerWelcome: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: '#dcfce7',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  headerName: {
    fontSize: FontSizes['3xl'],
    fontWeight: FontWeights.bold,
    color: Colors.neutral[0],
    marginTop: Spacing.sm,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius['3xl'],
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsLabel: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold,
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pointsValue: {
    fontSize: FontSizes['4xl'],
    fontWeight: FontWeights.extrabold,
    color: Colors.neutral[0],
    marginTop: Spacing.sm,
  },
  pointsIcon: {
    backgroundColor: '#fbbf24',
    width: 52,
    height: 52,
    borderRadius: BorderRadius['3xl'],
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '8deg' }],
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.sm,
  },
  statItem: { alignItems: 'center', flex: 1 },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 4,
  },
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
  contentSection: {
    paddingHorizontal: Spacing.lg,
    marginTop: -Spacing['2xl'],
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fefce8',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
  },
  errorText: { flex: 1, color: '#78350f', fontSize: FontSizes.xs, fontWeight: FontWeights.semibold },
  actionCardsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
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
  sectionTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.extrabold,
    color: Colors.neutral[800],
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  challengeCard: {
    backgroundColor: Colors.neutral[0],
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius['3xl'],
    borderWidth: 1,
    borderColor: Colors.primary[100],
    ...cardShadow,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  challengeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  trophyIcon: {
    backgroundColor: '#fef3c7',
    width: 44,
    height: 44,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  challengeDetails: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  challengeTitle: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.bold,
    color: Colors.neutral[900],
  },
  challengeSubtitle: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.normal,
    color: Colors.neutral[400],
  },
  challengePoints: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.bold,
    color: Colors.primary[500],
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.neutral[100],
    borderRadius: BorderRadius.full,
    marginTop: Spacing.md,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#22c55e',
    borderRadius: BorderRadius.full,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  seeAllLink: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.bold,
    color: Colors.primary[500],
  },
  emptyStateWrap: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    gap: 8,
  },
  emptyState: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.normal,
    color: Colors.neutral[400],
    textAlign: 'center',
  },
  issueCard: {
    backgroundColor: Colors.neutral[0],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius['3xl'],
    marginBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.neutral[100],
    ...cardShadow,
  },
  skeletonCard: { shadowOpacity: 0, elevation: 0 },
  skeletonBlock: { backgroundColor: Colors.neutral[100] },
  issueImage: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.neutral[100],
  },
  issueContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  issueTitle: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.bold,
    color: Colors.neutral[900],
  },
  issueAddress: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.normal,
    color: Colors.neutral[400],
    marginTop: 4,
  },
  issueMetaTags: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: 10,
    fontWeight: FontWeights.extrabold,
    textTransform: 'uppercase',
  },
  categoryTag: {
    fontSize: 10,
    fontWeight: FontWeights.bold,
    color: Colors.neutral[300],
    marginLeft: Spacing.md,
    textTransform: 'uppercase',
  },
  bottomSpacer: {
    height: 80,
  },
});