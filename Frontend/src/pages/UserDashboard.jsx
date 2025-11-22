import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  CircleDot,
  Clock4,
  Compass,
  MapPin,
  Radio,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap
} from 'lucide-react';
import { useAuth } from '../context/authcontext';
import axiosInstance from '../config/axios';
import { API_ENDPOINTS } from '../config/api';

const REFRESH_INTERVAL = 30000;

const StatusPill = ({ active, label }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold backdrop-blur-sm border ${
      active
        ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-200'
        : 'bg-slate-800/70 border-slate-600/60 text-slate-200'
    }`}
  >
    <CircleDot
      className={`h-3 w-3 ${
        active ? 'text-emerald-300 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'text-slate-400'
      }`}
    />
    {label}
  </span>
);

const StatCard = ({ label, value, subtext, icon: Icon, accent }) => (
  <div className="rounded-3xl border border-emerald-500/15 bg-gradient-to-br from-emerald-400/10 via-slate-900/80 to-emerald-950/60 p-5 shadow-lg shadow-emerald-900/40 backdrop-blur-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-200/80">{label}</p>
        <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
        {subtext && <p className="mt-1 text-xs text-slate-300/70">{subtext}</p>}
      </div>
      <div className={`rounded-2xl p-3 shadow-inner shadow-emerald-500/30 ${accent}`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </div>
);

function UserDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [personalIssues, setPersonalIssues] = useState([]);
  const [communityIssues, setCommunityIssues] = useState([]);
  const [transports, setTransports] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [resolvedIssues, setResolvedIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [liveUpdates, setLiveUpdates] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchDashboard = useCallback(async (silent = false) => {
    if (!currentUser) return;

    if (!silent) {
      setLoading(true);
    } else {
      setIsRefreshing(true);
    }
      setError('');

      try {
      const requests = [
          axiosInstance.get(API_ENDPOINTS.GET_USER_ISSUES),
        axiosInstance.get(API_ENDPOINTS.GET_ALL_ISSUES),
          axiosInstance.get(API_ENDPOINTS.GET_ALL_TRANSPORTS).catch(() => ({ data: [] })),
        axiosInstance.get(API_ENDPOINTS.USER_RANK),
        axiosInstance.get(API_ENDPOINTS.USER_RESOLVED_ISSUES).catch(() => ({ data: [] }))
      ];

      const [personalRes, communityRes, transportRes, leaderboardRes, resolvedRes] = await Promise.allSettled(requests);

      if (!mountedRef.current) return;

      if (personalRes.status === 'fulfilled') {
        setPersonalIssues(personalRes.value.data || []);
      }
      if (communityRes.status === 'fulfilled') {
        setCommunityIssues(communityRes.value.data || []);
      }
      if (transportRes.status === 'fulfilled') {
        setTransports(transportRes.value.data?.slice(0, 5) || []);
      }
      if (leaderboardRes.status === 'fulfilled') {
        setLeaderboard(leaderboardRes.value.data || []);
      }
      if (resolvedRes.status === 'fulfilled') {
        setResolvedIssues(resolvedRes.value.data || []);
      }

      setLastUpdatedAt(new Date());
      } catch (err) {
      console.error('Dashboard data load failed', err);
      if (mountedRef.current) {
        setError('We could not reach the live data services. Please retry in a moment.');
      }
      } finally {
      if (!mountedRef.current) return;
        setLoading(false);
      setIsRefreshing(false);
      }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;

    fetchDashboard(false);

    if (!liveUpdates) {
      return;
    }

    const interval = setInterval(() => {
      fetchDashboard(true);
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [currentUser, liveUpdates, fetchDashboard]);

  const userStats = useMemo(() => {
    const openReports = personalIssues.length;
    const resolvedCount = resolvedIssues.length;
    const totalReports =
      typeof currentUser?.issuecount === 'number'
        ? currentUser.issuecount
        : openReports + resolvedCount;
    const uniqueLocations = new Set(
      personalIssues.map((issue) => issue.location?.trim()).filter(Boolean)
    ).size;
    const points = currentUser?.points || 0;
    const leaderboardEntry = leaderboard.find((entry) => entry._id === currentUser?._id);
    const rankLabel = leaderboardEntry ? `#${leaderboardEntry.rank}` : '—';
  const communityAvgPoints = leaderboard.length
    ? Math.round(
        leaderboard.reduce((sum, entry) => sum + (entry.points || 0), 0) / leaderboard.length
      )
    : 0;

    return {
      totalReports,
      resolvedCount,
      openReports,
      uniqueLocations,
      points,
      rankLabel,
      communityAvgPoints
    };
  }, [personalIssues, resolvedIssues, leaderboard, currentUser]);

  const activityTicker = useMemo(() => communityIssues.slice(0, 6), [communityIssues]);
  const personalTimeline = useMemo(() => personalIssues.slice(0, 6), [personalIssues]);
  const resolvedTimeline = useMemo(() => resolvedIssues.slice(0, 6), [resolvedIssues]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-lg text-slate-200">Login to view your personalized dashboard.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-950 to-slate-900 px-4 py-6 text-white sm:px-6 lg:px-10"
    >
      <section className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/30 via-emerald-600/20 to-slate-900/80 p-8 shadow-2xl shadow-emerald-900/50">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
            <p className="text-xs uppercase tracking-[0.4em] text-emerald-200/80">Live mission control</p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight">
              Welcome back, {currentUser?.firstName || currentUser?.username || 'Eco Champion'}
              </h1>
            <p className="mt-2 text-sm text-emerald-50/80 max-w-2xl">
              Monitor city-wide activity, track your personal impact and stream real-time updates from
              the GreenCity network.
              </p>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-100/80">
              <StatusPill active={liveUpdates} label={liveUpdates ? 'Live feed on' : 'Live feed paused'} />
              {lastUpdatedAt && (
                <span className="rounded-full bg-white/10 px-3 py-1">
                  Last synced {lastUpdatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setLiveUpdates((prev) => !prev)}
              className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                liveUpdates ? 'bg-slate-900/60 text-white' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {liveUpdates ? 'Pause live feed' : 'Resume live feed'}
            </button>
            <button
              onClick={() => fetchDashboard(true)}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 rounded-2xl bg-white/90 px-4 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-emerald-500/20 disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Sync now
            </button>
              </div>
          </div>
        </section>

        {error && (
          <div className="mt-6 rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        {/* Tab navigation to organize dashboard content */}
        <div className="mt-6 flex flex-wrap gap-2 rounded-2xl bg-emerald-900/40 p-2 text-xs sm:text-sm">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'reports', label: 'My reports' },
            { id: 'community', label: 'Community' },
            { id: 'transport', label: 'Transport' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 rounded-xl px-3 py-2 font-medium transition-colors sm:flex-none sm:px-4 ${
                activeTab === tab.id
                  ? 'bg-emerald-400 text-emerald-950 shadow shadow-emerald-500/50'
                  : 'bg-emerald-950/40 text-slate-200 hover:bg-emerald-900/70'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-32 animate-pulse rounded-3xl bg-white/5" />
            ))}
          </div>
        ) : (
          <>
            {/* Overview tab: key stats and quick actions */}
            {activeTab === 'overview' && (
              <>
                <section className="mt-8 grid gap-5 lg:grid-cols-4">
                  <StatCard
                    label="Reports submitted"
                    value={userStats.totalReports}
                    subtext="All-time contributions"
                    icon={AlertTriangle}
                    accent="bg-amber-500/10 text-amber-300"
                  />
                  <StatCard
                    label="Reports resolved"
                    value={userStats.resolvedCount}
                    subtext={`Open now: ${userStats.openReports}`}
                    icon={CheckCircle2}
                    accent="bg-emerald-500/10 text-emerald-300"
                  />
                  <StatCard
                    label="Impact points"
                    value={userStats.points}
                    subtext={`Community avg ${userStats.communityAvgPoints}`}
                    icon={TrendingUp}
                    accent="bg-purple-500/10 text-purple-300"
                  />
                  <StatCard
                    label="Leaderboard"
                    value={userStats.rankLabel}
                    subtext="Global ranking"
                    icon={BarChart3}
                    accent="bg-sky-500/10 text-sky-300"
                  />
                </section>

                <section className="mt-8 grid gap-6 lg:grid-cols-3">
                  <div className="rounded-3xl border border-white/5 bg-white/5 p-6 shadow-lg shadow-emerald-900/20 lg:col-span-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/70">City pulse</p>
                        <h2 className="mt-1 text-xl font-semibold">Live incident feed</h2>
                      </div>
                      <StatusPill active label="Streaming" />
                    </div>
                    <div className="mt-5 space-y-4">
                      {activityTicker.length === 0 && (
                        <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 text-sm text-slate-300/90">
                          No live incidents yet. Be the first to report an issue.
                        </div>
                      )}
                      {activityTicker.map((issue) => (
                        <div
                          key={issue._id}
                          className="rounded-2xl border border-white/5 bg-slate-900/60 p-4 text-sm"
                        >
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-white">{issue.title}</p>
                            <span className="text-xs text-slate-400">
                              {issue.createdAt
                                ? new Date(issue.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })
                                : 'Just now'}
                            </span>
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-300/80">
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {issue.location || 'Unknown'}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Radio className="h-3.5 w-3.5" />
                              Code {issue.issueCode}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/5 bg-white/5 p-6 shadow-lg shadow-emerald-900/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/70">Action centre</p>
                        <h2 className="mt-1 text-xl font-semibold">Quick commands</h2>
                      </div>
                    </div>
                    <div className="mt-5 space-y-4 text-sm text-slate-200/80">
                      <button
                        onClick={() => navigate('/report-issue')}
                        className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-left transition hover:border-emerald-400/40"
                      >
                        <div className="flex items-center justify-between">
                          <span>Report new issue</span>
                          <AlertTriangle className="h-4 w-4 text-amber-300" />
                        </div>
                        <p className="mt-1 text-xs text-slate-400">
                          Log hazards or civic incidents in under two minutes.
                        </p>
                      </button>
                      <button
                        onClick={() => navigate('/eco-transport')}
                        className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-left transition hover:border-emerald-400/40"
                      >
                        <div className="flex items-center justify-between">
                          <span>Browse eco transport</span>
                          <Zap className="h-4 w-4 text-yellow-300" />
                        </div>
                        <p className="mt-1 text-xs text-slate-400">
                          Discover low-emission options in your corridor.
                        </p>
                      </button>
                      <button
                        onClick={() => navigate('/gamification')}
                        className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-left transition hover:border-emerald-400/40"
                      >
                        <div className="flex items-center justify-between">
                          <span>Boost impact points</span>
                          <Sparkles className="h-4 w-4 text-emerald-300" />
                        </div>
                        <p className="mt-1 text-xs text-slate-400">Complete weekly sustainability quests.</p>
                      </button>
                    </div>
                  </div>
                </section>
              </>
            )}

            {/* My reports tab: personal and resolved issues */}
            {activeTab === 'reports' && (
              <>
                <section className="mt-8 grid gap-6 lg:grid-cols-2">
                  <div className="rounded-3xl border border-white/5 bg-white/5 p-6 shadow-lg shadow-emerald-900/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/70">Your missions</p>
                        <h2 className="mt-1 text-xl font-semibold">Personal timeline</h2>
                      </div>
                      <StatusPill
                        active={personalTimeline.length > 0}
                        label={`${personalTimeline.length} active`}
                      />
                    </div>
                    <div className="mt-5 space-y-4">
                      {personalTimeline.length === 0 && (
                        <p className="rounded-2xl border border-white/10 bg-slate-900/50 p-5 text-sm text-slate-300/80">
                          You have no recorded missions yet.
                        </p>
                      )}
                      {personalTimeline.map((issue) => (
                        <div
                          key={issue._id}
                          className="rounded-2xl border border-white/10 bg-slate-900/60 p-4"
                        >
                          <p className="text-sm font-semibold text-white">{issue.title}</p>
                          <p className="text-xs text-slate-400">
                            {issue.createdAt
                              ? new Date(issue.createdAt).toLocaleDateString()
                              : 'Timestamp unavailable'}
                          </p>
                          <p className="mt-2 text-xs text-slate-300/80 truncate">
                            {issue.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/5 bg-white/5 p-6 shadow-lg shadow-emerald-900/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/70">Resolution log</p>
                        <h2 className="mt-1 text-xl font-semibold">Closed reports</h2>
                      </div>
                      <StatusPill
                        active={resolvedTimeline.length > 0}
                        label={`${resolvedTimeline.length} recorded`}
                      />
                    </div>
                    <div className="mt-5 space-y-4">
                      {resolvedTimeline.length === 0 ? (
                        <p className="rounded-2xl border border-white/10 bg-slate-900/50 p-5 text-sm text-slate-300/80">
                          Organizations will update this list once they confirm your reported issues are
                          resolved.
                        </p>
                      ) : (
                        resolvedTimeline.map((entry) => (
                          <div
                            key={entry.issueCode}
                            className="rounded-2xl border border-white/10 bg-slate-900/60 p-4"
                          >
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-semibold text-white">
                                {entry.title || entry.issueCode}
                              </p>
                              <span className="text-xs text-emerald-300">
                                {entry.solvedAt
                                  ? new Date(entry.solvedAt).toLocaleDateString()
                                  : 'Recently'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400">#{entry.issueCode}</p>
                            <p className="mt-2 text-xs text-slate-300/80 line-clamp-2">
                              {entry.description || 'Resolved report'}
                            </p>
                            <p className="mt-2 text-xs text-slate-400">
                              <MapPin className="mr-1 inline h-3.5 w-3.5" />
                              {entry.location || 'Location unavailable'}
                            </p>
                            <p className="mt-2 text-[11px] uppercase tracking-[0.25em] text-slate-500">
                              Closed by {entry.solvedBy || 'GreenCity partner'}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </section>
              </>
            )}

            {/* Community tab: live feed and leaderboard */}
            {activeTab === 'community' && (
              <section className="mt-8 grid gap-6 lg:grid-cols-3">
                <div className="rounded-3xl border border-white/5 bg-white/5 p-6 shadow-lg shadow-emerald-900/20 lg:col-span-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/70">City pulse</p>
                      <h2 className="mt-1 text-xl font-semibold">Live incident feed</h2>
                    </div>
                    <StatusPill active label="Streaming" />
                  </div>
                  <div className="mt-5 space-y-4">
                    {activityTicker.length === 0 && (
                      <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 text-sm text-slate-300/90">
                        No live incidents yet. Be the first to report an issue.
                      </div>
                    )}
                    {activityTicker.map((issue) => (
                      <div
                        key={issue._id}
                        className="rounded-2xl border border-white/5 bg-slate-900/60 p-4 text-sm"
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-white">{issue.title}</p>
                          <span className="text-xs text-slate-400">
                            {issue.createdAt
                              ? new Date(issue.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : 'Just now'}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-300/80">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {issue.location || 'Unknown'}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Radio className="h-3.5 w-3.5" />
                            Code {issue.issueCode}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-white/5 bg-white/5 p-6 shadow-lg shadow-emerald-900/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/70">Leaderboard</p>
                      <h2 className="mt-1 text-xl font-semibold">Impact standings</h2>
                    </div>
                    <StatusPill active label="Updated" />
                  </div>
                  <div className="mt-5 space-y-4">
                    {leaderboard.slice(0, 5).map((entry, index) => (
                      <div
                        key={entry._id}
                        className="rounded-2xl border border-white/10 bg-slate-900/60 p-4"
                      >
                        <div className="flex items-center justify-between text-sm font-semibold">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">#{index + 1}</span>
                            <span className="text-white">{entry.username}</span>
                          </div>
                          <span className="text-emerald-300">{entry.points} pts</span>
                        </div>
                        <div className="mt-3 h-2 rounded-full bg-white/5">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-200"
                            style={{
                              width: `${Math.min(
                                100,
                                (entry.points / (leaderboard[0]?.points || 1)) * 100
                              )}%`
                            }}
                          />
                        </div>
                        <p className="mt-2 text-xs text-slate-400">
                          {entry.issuecount} missions completed
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Transport tab: detailed transport telemetry */}
            {activeTab === 'transport' && (
              <section className="mt-8 rounded-3xl border border-white/5 bg-white/5 p-6 shadow-lg shadow-emerald-900/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/70">Network</p>
                    <h2 className="mt-1 text-xl font-semibold">Transport telemetry</h2>
                  </div>
                  <StatusPill active label="Online" />
                </div>
                <div className="mt-5 space-y-4">
                  {transports.length === 0 && (
                    <p className="rounded-2xl border border-white/10 bg-slate-900/50 p-5 text-sm text-slate-300/80">
                      No transport telemetry available yet.
                    </p>
                  )}
                  {transports.map((entry) => (
                    <div
                      key={entry._id}
                      className="rounded-2xl border border-white/10 bg-slate-900/60 p-4"
                    >
                      <p className="text-sm font-semibold text-white">{entry.agencyName}</p>
                      <p className="text-xs text-slate-400">{entry.transportType}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-200/80">
                        <span className="inline-flex items-center gap-1">
                          <Compass className="h-3.5 w-3.5" />
                          {entry.from} → {entry.to}
                        </span>
                        {entry.frequency && (
                          <span className="inline-flex items-center gap-1">
                            <Clock4 className="h-3.5 w-3.5" />
                            {entry.frequency}
                          </span>
                        )}
                        {entry.fare && (
                          <span className="inline-flex items-center gap-1">
                            <Activity className="h-3.5 w-3.5" />₹{entry.fare}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
    </motion.div>
  );
}

export default UserDashboard;
