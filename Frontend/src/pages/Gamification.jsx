import React, { useState, useEffect } from 'react';
import axiosInstance from '../config/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../features/auth/context/authcontext';
import { API_ENDPOINTS } from '../config/api';
import {
  FiTrophy,
  FiAward,
  FiStar,
  FiTrendingUp,
  FiUsers,
  FiTarget,
  FiZap,
  FiChevronUp,
  FiFilter,
  FiSearch,
  FiMapPin,
  FiActivity,
  FiShield,
  FiCpu
} from 'react-icons/fi';
import { FaCrown, FaMedal } from 'react-icons/fa';

/**
 * Gamification Component
 * Redesigned for High-Fidelity GreenCity Leaderboard
 */
function Gamification() {
  const { user, isAuthenticated } = useAuth();
  const [rankings, setRankings] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRankings();
  }, []);

  const fetchRankings = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_ENDPOINTS.USER_RANK);
      if (response.data) {
        setRankings(response.data);
        if (user && user._id) {
          const currentUser = response.data.find(r => r._id === user._id);
          if (currentUser) setUserRank(currentUser);
        }
      }
    } catch (error) {
      console.error('Error fetching rankings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRankings = rankings.filter(rank => {
    const matchesSearch = rank.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' ||
      (filter === 'top10' && rank.rank <= 10) ||
      (filter === 'top50' && rank.rank <= 50);
    return matchesSearch && matchesFilter;
  });

  const getRankIcon = (rank) => {
    if (rank === 1) return <FaCrown className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <FaMedal className="w-6 h-6 text-slate-400" />;
    if (rank === 3) return <FiAward className="w-6 h-6 text-orange-500" />;
    if (rank <= 10) return <FiStar className="w-5 h-5 text-emerald-400" />;
    return <span className="text-slate-500 font-black font-mono">#{rank}</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030d0a] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <FiCpu className="w-12 h-12 text-emerald-500 mx-auto animate-spin mb-6" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500/60 font-mono">Syncing Leaderboard Grid...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030d0a] text-slate-200 selection:bg-emerald-500/20">
      <div className="container mx-auto px-6 pt-48 pb-24 max-w-7xl">

        {/* ─── HEADER ─── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8">
            <FiTrophy className="h-4 w-4 text-emerald-400" />
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-emerald-400 font-mono">Merit Hierarchy v4.0</span>
          </div>
          <h1 className="text-7xl md:text-9xl font-bold tracking-tighter text-white mb-8 leading-none" style={{ fontFamily: 'Outfit' }}>
            Impact <br />
            <span className="text-emerald-500 italic">Vanguard.</span>
          </h1>
          <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed" style={{ fontFamily: 'Inter' }}>
            Telemetry of the most active citizens within the GreenCity network.
            Real-time contribution analysis across all sectors.
          </p>
        </motion.div>

        {/* ─── USER RANK CARD ─── */}
        <AnimatePresence>
          {isAuthenticated && userRank && (
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="bio-card p-10 mb-16 bg-emerald-500/[0.03] border-emerald-500/20 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 blur-[120px] pointer-events-none" />
              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
                <div className="flex items-center gap-8">
                  <div className="w-24 h-24 rounded-[2rem] bg-emerald-500 text-black flex items-center justify-center text-4xl font-black shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                    {userRank.rank}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white uppercase tracking-tight" style={{ fontFamily: 'Outfit' }}>Your Standing</h2>
                    <p className="text-sm font-bold text-emerald-500/60 uppercase tracking-widest font-mono mt-1">Status: Active Node</p>
                    <div className="flex gap-4 mt-6">
                      <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest font-mono text-slate-400">
                        Top {Math.ceil((userRank.rank / rankings.length) * 100)}%
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-6">
                  {[
                    { label: 'Impact Points', value: userRank.points, icon: FiZap },
                    { label: 'Incidents Logged', value: userRank.issuecount, icon: FiActivity }
                  ].map((stat, i) => (
                    <div key={i} className="px-8 py-6 rounded-3xl bg-white/[0.03] border border-white/5 text-center min-w-[160px]">
                      <stat.icon className="w-4 h-4 text-emerald-500 mx-auto mb-3" />
                      <p className="text-3xl font-black text-white" style={{ fontFamily: 'Outfit' }}>{stat.value}</p>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono mt-2">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── FILTERS & SEARCH ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
          <div className="lg:col-span-2 relative group">
            <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="text"
              placeholder="Query node identity..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/[0.03] border-2 border-white/5 rounded-2xl pl-16 pr-8 py-5 text-sm font-bold text-white outline-none focus:border-emerald-500/20 transition-all font-mono uppercase tracking-widest"
            />
          </div>
          <div className="lg:col-span-2 flex gap-3">
            {['all', 'top10', 'top50'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 py-5 rounded-2xl border-2 font-mono text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' : 'border-white/5 bg-white/[0.02] text-slate-500 hover:text-white hover:border-white/10'}`}
              >
                {f.replace('top', 'Top ')}
              </button>
            ))}
          </div>
        </div>

        {/* ─── LEADERBOARD GRID ─── */}
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence>
            {filteredRankings.map((rank, index) => {
              const isCurrentUser = user && rank._id === user._id;
              return (
                <motion.div
                  key={rank._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bio-card p-5 lg:p-6 group ${isCurrentUser ? 'border-emerald-500/30 bg-emerald-500/[0.02]' : 'border-white/5 animate-none transform-none'}`}
                  style={{ borderRadius: '1.25rem' }}
                >
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-6 flex-1 min-w-0">
                      <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        {getRankIcon(rank.rank)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-bold text-white truncate uppercase tracking-tight" style={{ fontFamily: 'Outfit' }}>
                            {rank.username}
                          </h3>
                          {isCurrentUser && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-black text-[9px] font-black uppercase tracking-widest font-mono">You</span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                          <span className="flex items-center gap-1.5"><FiActivity className="text-emerald-500/60" /> {rank.issuecount} Reports</span>
                          <span className="flex items-center gap-1.5"><FiMapPin className="text-emerald-500/60" /> Sector Alpha</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-3xl font-black text-emerald-500 leading-none" style={{ fontFamily: 'Outfit' }}>
                        {rank.points}
                      </p>
                      <p className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em] font-mono mt-2">Impact Points</p>
                    </div>
                  </div>

                  {/* Progress bar visual */}
                  <div className="mt-6 h-1 w-full bg-white/[0.03] rounded-full overflow-hidden border border-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((rank.points / (rankings[0]?.points || 1)) * 100, 100)}%` }}
                      transition={{ duration: 1.5, delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400"
                    />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredRankings.length === 0 && (
            <div className="py-32 text-center bio-card border-dashed border-white/10">
              <FiTarget className="w-12 h-12 text-slate-700 mx-auto mb-6" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 font-mono">No telemetry matching query.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Gamification;
