import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiActivity,
  FiAlertTriangle,
  FiArrowRight,
  FiArrowUpRight,
  FiBarChart2,
  FiCheckCircle,
  FiCircle,
  FiClock,
  FiCompass,
  FiMapPin,
  FiRadio,
  FiRefreshCw,
  FiShield,
  FiZap,
  FiStar
} from 'react-icons/fi';
import { useAuth } from '../../../features/auth/context/authcontext';
import axiosInstance from '../../../config/axios';
import { API_ENDPOINTS } from '../../../config/api';

const REFRESH_INTERVAL = 30000;

const StatusPill = ({ active, label }) => (
  <span
    className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest backdrop-blur-md border transition-all duration-500 ${active
      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/5'
      : 'bg-white/5 border-white/10 text-slate-500 uppercase font-mono'
      }`}
  >
    <FiCircle
      className={`h-2 w-2 ${active ? 'fill-emerald-400 animate-pulse' : 'text-slate-600'
        }`}
    />
    {label}
  </span>
);

const StatCard = ({ label, value, subtext, icon: Icon, accent }) => (
  <div className="bio-card p-8 group relative">
    <div className="flex items-start justify-between">
      <div className="space-y-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500/60 font-mono">{label}</p>
        <div className="space-y-1">
          <p className="text-4xl font-bold tracking-tighter text-white" style={{ fontFamily: 'Outfit' }}>{value}</p>
          {subtext && <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">{subtext}</p>}
        </div>
      </div>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg ${accent} bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-black`}>
        <Icon className="h-6 w-6" />
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
        setError('Infrastructure downlink unstable. Retrying connection...');
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
      <div className="min-h-screen bg-[#030d0a] text-white flex items-center justify-center">
        <p className="text-lg text-slate-400 font-mono">AUTHENTICATION REQUIRED // ACCESS DENIED</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030d0a] text-slate-200">
      <div className="container mx-auto px-6 py-32 max-w-7xl">

        {/* ─── HEADER SECTION ─── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bio-card p-12 lg:p-16 mb-12"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 blur-[120px] -z-10 animate-pulse" />

          <div className="flex flex-col gap-12 lg:flex-row lg:items-end lg:justify-between relative z-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <FiShield className="h-4 w-4 text-emerald-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 font-mono">Mission Control — Active</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-white leading-[0.9]" style={{ fontFamily: 'Outfit' }}>
                System Ready, <br />
                <span className="text-emerald-500 italic">{currentUser?.firstName || currentUser?.username || 'Eco Champion'}.</span>
              </h1>
              <p className="text-lg text-slate-400 font-medium leading-relaxed max-w-2xl" style={{ fontFamily: 'Inter' }}>
                Monitor city-wide activity and track your personal impact within the high-fidelity GreenCity network. All protocols synchronized.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <StatusPill active={liveUpdates} label={liveUpdates ? 'Intel Stream: Online' : 'Intel Stream: Paused'} />
                {lastUpdatedAt && (
                  <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">
                    <FiClock className="w-3 h-3" />
                    Last Synced {lastUpdatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => setLiveUpdates((prev) => !prev)}
                className={`px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all duration-500 border-2 ${liveUpdates
                  ? 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                  }`}
              >
                {liveUpdates ? 'Pause Local Uplink' : 'Resume Local Uplink'}
              </button>
              <button
                onClick={() => fetchDashboard(true)}
                disabled={isRefreshing}
                className="group flex items-center gap-3 px-10 py-4 bg-emerald-500 text-black rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all duration-500 disabled:opacity-50 hover:bg-emerald-400"
              >
                <FiRefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'}`} />
                <span>Sync Node</span>
              </button>
            </div>
          </div>
        </motion.section>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-12 p-6 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center gap-4"
          >
            <FiAlertTriangle className="w-6 h-6 text-red-500" />
            <p className="text-xs font-bold uppercase tracking-widest text-red-500 font-mono">{error}</p>
          </motion.div>
        )}

        {/* ─── NAVIGATION ─── */}
        <div className="flex flex-wrap gap-4 mb-12">
          {[
            { id: 'overview', label: 'Primary Intel' },
            { id: 'reports', label: 'My Deployments' },
            { id: 'community', label: 'City Pulse' },
            { id: 'transport', label: 'Eco Logistics' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-8 py-4 rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] transition-all duration-500 border-2 ${activeTab === tab.id
                ? 'bg-emerald-500 border-emerald-500 text-black scale-105 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/10 hover:text-white'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-48 animate-pulse rounded-3xl bg-white/5 border border-white/10" />
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'overview' && (
                <>
                  <section className="grid gap-6 lg:grid-cols-4">
                    <StatCard
                      label="Deployments Tracked"
                      value={userStats.totalReports}
                      subtext="Status: Active"
                      icon={FiActivity}
                      accent=""
                    />
                    <StatCard
                      label="Nodes Resolved"
                      value={userStats.resolvedCount}
                      subtext={`Pending: ${userStats.openReports}`}
                      icon={FiCheckCircle}
                      accent=""
                    />
                    <StatCard
                      label="Impact Quotient"
                      value={userStats.points}
                      subtext={`Global Rank: ${userStats.rankLabel}`}
                      icon={FiZap}
                      accent=""
                    />
                    <StatCard
                      label="Global Standing"
                      value={userStats.rankLabel}
                      subtext="Citizen Tier Alpha"
                      icon={FiStar}
                      accent=""
                    />
                  </section>

                  <section className="mt-12 grid gap-8 lg:grid-cols-3">
                    <div className="bio-card p-10 lg:col-span-2">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-500/60 font-mono">Data Stream</p>
                          <h2 className="text-3xl font-bold text-white mt-1" style={{ fontFamily: 'Outfit' }}>City Pulse: Live Feed</h2>
                        </div>
                        <StatusPill active label="Uplink Ready" />
                      </div>
                      <div className="space-y-4">
                        {activityTicker.length === 0 && (
                          <div className="p-12 text-center rounded-3xl border border-white/5 bg-white/[0.02]">
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 font-mono italic">No broadcast signals detected.</p>
                          </div>
                        )}
                        {activityTicker.map((issue) => (
                          <div
                            key={issue._id}
                            className="p-5 rounded-2xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.05] transition-all group"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-bold text-white group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{issue.title}</p>
                              <span className="text-[10px] font-bold text-slate-500 font-mono">
                                {issue.createdAt ? new Date(issue.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'NOW'}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                              <span className="flex items-center gap-1.5">
                                <FiMapPin className="h-3 w-3 text-emerald-500" />
                                {issue.location || 'Quadrant Alpha'}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <FiRadio className="h-3 w-3 text-blue-500" />
                                Protocol {issue.issueCode}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bio-card p-10">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-500/60 font-mono">Quick Access</p>
                          <h2 className="text-3xl font-bold text-white mt-1" style={{ fontFamily: 'Outfit' }}>Directives</h2>
                        </div>
                      </div>
                      <div className="space-y-4">
                        {[
                          { path: '/report-issue', label: 'Deploy New Report', sub: 'Log environmental hazards instantly.', icon: FiAlertTriangle, color: 'text-amber-400' },
                          { path: '/eco-transport', label: 'Route Optimization', sub: 'Calculated low-emission transit.', icon: FiCompass, color: 'text-blue-400' },
                          { path: '/gamification', label: 'Reputation Engine', sub: 'Verify impact and claim ranking.', icon: FiZap, color: 'text-emerald-400' }
                        ].map((action, i) => (
                          <button
                            key={i}
                            onClick={() => navigate(action.path)}
                            className="w-full p-6 rounded-2xl border border-white/5 bg-white/[0.03] text-left transition-all hover:bg-white/[0.1] hover:border-emerald-500/30 group"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-white group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{action.label}</span>
                              <action.icon className={`h-4 w-4 ${action.color}`} />
                            </div>
                            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest font-mono line-clamp-2">
                              {action.sub}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </section>
                </>
              )}

              {activeTab === 'reports' && (
                <section className="grid gap-8 lg:grid-cols-2">
                  <div className="bio-card p-10">
                    <div className="flex items-center justify-between mb-10">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-500/60 font-mono">Deployment Archive</p>
                        <h2 className="text-3xl font-bold text-white mt-1" style={{ fontFamily: 'Outfit' }}>Personnel Timeline</h2>
                      </div>
                      <StatusPill active={personalTimeline.length > 0} label={`${personalTimeline.length} Vectors Registered`} />
                    </div>
                    <div className="space-y-4">
                      {personalTimeline.length === 0 && (
                        <div className="p-12 text-center rounded-3xl border border-white/5 bg-white/[0.02]">
                          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 font-mono italic">Sector quiet. No deployments found.</p>
                        </div>
                      )}
                      {personalTimeline.map((issue) => (
                        <motion.div
                          key={issue._id}
                          whileHover={{ x: 5 }}
                          className="p-6 rounded-2xl border border-white/5 bg-white/[0.03] group hover:bg-white/[0.06] transition-all"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-white group-hover:text-emerald-400 transition-colors uppercase">{issue.title}</h3>
                            <span className="text-[10px] font-bold text-slate-500 font-mono">
                              {issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : 'ACTIVE'}
                            </span>
                          </div>
                          <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest font-mono leading-relaxed line-clamp-2">
                            {issue.description}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="bio-card p-10 border-white/10 bg-emerald-500/[0.01]">
                    <div className="flex items-center justify-between mb-10">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-indigo-400 font-mono">Verified Records</p>
                        <h2 className="text-3xl font-bold text-white mt-1" style={{ fontFamily: 'Outfit' }}>Closed Directives</h2>
                      </div>
                      <div className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold uppercase tracking-widest text-indigo-400 font-mono">
                        ARCHIVED
                      </div>
                    </div>
                    <div className="space-y-4">
                      {resolvedTimeline.length === 0 ? (
                        <div className="p-12 text-center rounded-3xl border border-white/5 bg-white/[0.02]">
                          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 font-mono italic">Awaiting node closure protocols.</p>
                        </div>
                      ) : (
                        resolvedTimeline.map((entry) => (
                          <motion.div
                            key={entry.issueCode}
                            whileHover={{ x: 5 }}
                            className="p-6 rounded-2xl bg-white/[0.05] border border-white/5 shadow-xl shadow-black/50 group"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-bold text-emerald-400 group-hover:text-amber-400 transition-colors uppercase tracking-tight">{entry.title || `PROTOCOL ${entry.issueCode}`}</h3>
                              <span className="text-[10px] font-bold text-emerald-500/40 font-mono">
                                RESOLVED // {entry.solvedAt ? new Date(entry.solvedAt).toLocaleDateString() : 'SYNCED'}
                              </span>
                            </div>
                            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest font-mono leading-relaxed line-clamp-2 mb-4">
                              {entry.description || 'Structural integrity restored at specified node.'}
                            </p>
                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                              <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase font-mono">
                                <FiMapPin className="h-3 w-3 text-emerald-500" />
                                {entry.location || 'Quadrant Alpha'}
                              </span>
                              <span className="text-[10px] font-bold text-slate-600 uppercase font-mono">
                                Verified by {entry.solvedBy || 'District Node'}
                              </span>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </div>
                </section>
              )}

              {activeTab === 'community' && (
                <section className="grid gap-8 lg:grid-cols-3">
                  <div className="lg:col-span-2 bio-card p-10">
                    <div className="flex items-center justify-between mb-10">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-500/60 font-mono">Global Grid</p>
                        <h2 className="text-3xl font-bold text-white mt-1" style={{ fontFamily: 'Outfit' }}>Personnel Activity</h2>
                      </div>
                      <StatusPill active label="Stream Synchronized" />
                    </div>
                    <div className="space-y-4">
                      {activityTicker.map((issue) => (
                        <div
                          key={issue._id}
                          className="flex items-center gap-6 p-6 rounded-2xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.06] transition-all group"
                        >
                          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-black transition-all">
                            <FiRadio className="w-6 h-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-white mb-1 uppercase tracking-tight">{issue.title}</h3>
                            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                              <span className="flex items-center gap-1.5">
                                <FiMapPin className="h-3 w-3 text-emerald-500" />
                                {issue.location}
                              </span>
                              <span className="text-emerald-500/60 italic">Live Feed Target</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bio-card p-10 bg-white/[0.01]">
                    <div className="flex items-center justify-between mb-10">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-500/60 font-mono">Network Standing</p>
                        <h2 className="text-3xl font-bold text-white mt-1" style={{ fontFamily: 'Outfit' }}>Leaderboard</h2>
                      </div>
                    </div>
                    <div className="space-y-8">
                      {leaderboard.slice(0, 6).map((entry, index) => (
                        <div key={entry._id} className="space-y-2 group">
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-bold uppercase tracking-widest font-mono ${entry._id === currentUser._id ? 'text-emerald-400' : 'text-slate-500'}`}>
                              NODE {index + 1} // {entry.username} {entry._id === currentUser._id && '(YOU)'}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-500 font-mono">{entry.points} IMPACT</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, (entry.points / (leaderboard[0]?.points || 1)) * 100)}%` }}
                              className={`h-full ${entry._id === currentUser._id ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-slate-700'}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {activeTab === 'transport' && (
                <section className="bio-card p-10">
                  <div className="flex items-center justify-between mb-10">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-400 font-mono">Infrastructure Grid</p>
                      <h2 className="text-3xl font-bold text-white mt-1" style={{ fontFamily: 'Outfit' }}>Eco Logistics Telemetry</h2>
                    </div>
                    <StatusPill active label="Uplink Verified" />
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    {transports.length === 0 && (
                      <div className="md:col-span-2 p-12 text-center rounded-3xl border border-white/5 bg-white/[0.02]">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 font-mono italic">No logistics packets detected in network.</p>
                      </div>
                    )}
                    {transports.map((entry) => (
                      <motion.div
                        key={entry._id}
                        whileHover={{ y: -5 }}
                        className="p-8 rounded-3xl border border-white/5 bg-white/[0.03] group hover:bg-white/[0.06] hover:border-emerald-500/20 transition-all"
                      >
                        <div className="flex items-center justify-between mb-8">
                          <h3 className="text-2xl font-bold text-white group-hover:text-emerald-400 transition-colors uppercase tracking-tight" style={{ fontFamily: 'Outfit' }}>{entry.agencyName}</h3>
                          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">{entry.transportType}</span>
                        </div>
                        <div className="space-y-6">
                          <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                            <FiCompass className="h-4 w-4 text-emerald-500" />
                            {entry.from} <FiArrowRight className="h-3 w-3 inline mx-1 text-slate-600" /> {entry.to}
                          </div>
                          <div className="flex items-center justify-between pt-6 border-t border-white/5">
                            {entry.frequency && (
                              <span className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                                <FiClock className="h-3.5 w-3.5 text-blue-500" />
                                {entry.frequency}
                              </span>
                            )}
                            {entry.fare && (
                              <span className="text-xl font-bold text-white" style={{ fontFamily: 'Outfit' }}>₹{entry.fare}</span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;
