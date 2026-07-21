import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useApi } from '../hooks/api/useApi';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights } from '../styles/theme';
import { showErrorToast } from '../components/ui/Toast';
import { StatItem } from '../components/dashboard/StatItem';
import { ActionCard } from '../components/dashboard/ActionCard';
import { IssueCardSkeleton } from '../components/dashboard/IssueCardSkeleton';
import { dashboardStyles } from '../styles/dashboard';

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
  const { get } = useApi();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchData = async () => {
    setError(null);
    const [userResult, issuesResult] = await Promise.allSettled([
      get('/auth/me', { showToast: false }),
      get('/issues?limit=5', { showToast: false }),
    ]);

    if (!isMounted.current) return;

    if (userResult.status === 'fulfilled' && userResult.value?.data?.data?.user) {
      setUser(userResult.value.data.data.user, null);
    }

    if (issuesResult.status === 'fulfilled' && issuesResult.value?.data?.data?.issues) {
      setIssues(issuesResult.value.data.data.issues || []);
    }

    if (userResult.status === 'rejected' && issuesResult.status === 'rejected') {
      setError("Couldn't load your dashboard. Pull down to try again.");
    } else if (issuesResult.status === 'rejected') {
      setError("Couldn't load community activity. Pull down to try again.");
    } else if (userResult.status === 'rejected') {
      setError("Couldn't refresh your profile. Pull down to try again.");
    }

    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

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

const styles = dashboardStyles;