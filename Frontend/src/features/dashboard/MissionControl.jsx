import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiBell, FiPlus, FiTrendingUp, FiTrendingDown, FiMapPin, FiClock,
    FiChevronRight, FiRefreshCw, FiAlertTriangle, FiCheckCircle,
    FiBarChart2, FiZap, FiShield, FiRadio
} from 'react-icons/fi';
import { useAuth } from '../auth/context/authcontext';
import { useIssues } from '../../context/IssuesContext';
import { useCountUp } from '../../hooks/useCountUp';

// ─── Tier System ──────────────────────────────────────────────────────────────
const TIERS = [
    { name: 'Scout', min: 0, icon: '🌱' },
    { name: 'Ranger', min: 1000, icon: '🌿' },
    { name: 'Guardian', min: 3000, icon: '🌳' },
    { name: 'Champion', min: 6000, icon: '⚡' },
    { name: 'Legend', min: 10000, icon: '🏆' },
];

function getTier(points) {
    let current = TIERS[0];
    let next = TIERS[1];
    for (let i = TIERS.length - 1; i >= 0; i--) {
        if (points >= TIERS[i].min) {
            current = TIERS[i];
            next = TIERS[i + 1] || null;
            break;
        }
    }
    return { current, next };
}

function timeAgo(dateStr) {
    if (!dateStr) return 'Just now';
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'Just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    return `${d}d ago`;
}

const STATUS_COLORS = {
    Resolved: 'text-emerald-400',
    'In Progress': 'text-amber-400',
    Pending: 'text-red-400',
};

// ─── Sub-components ─────────────────────────────────────────────────────────

function Avatar({ name, size = 36 }) {
    const initials = (name || 'GC')
        .split(' ')
        .map(w => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
    return (
        <div
            className="rounded-full flex items-center justify-center font-bold text-black bg-gradient-to-br from-emerald-400 to-teal-500 shadow-[0_0_15px_rgba(52,211,153,0.3)] transition-transform hover:scale-110 cursor-pointer"
            style={{ width: size, height: size, fontSize: size * 0.35, fontFamily: 'Outfit' }}
        >
            {initials}
        </div>
    );
}

function SkeletonRow() {
    return (
        <div className="h-20 rounded-2xl animate-pulse bg-white/5 border border-white/10" />
    );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, target, unit = '', trend, delay }) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { const t = setTimeout(() => setMounted(true), delay * 1000 + 200); return () => clearTimeout(t); }, [delay]);
    const displayVal = useCountUp(target, 1500, mounted);

    const trendUp = trend >= 0;
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay, ease: [0.23, 1, 0.32, 1] }}
            className="flex-shrink-0 bio-card p-6 min-w-[200px]"
        >
            <div className="absolute top-0 right-0 w-20 h-20 rounded-full pointer-events-none bg-emerald-500/[0.03] blur-2xl" />

            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Icon className="w-5 h-5" />
            </div>

            <div className="text-3xl font-bold text-white mb-1" style={{ fontFamily: 'Outfit' }}>
                {displayVal.toLocaleString()}{unit}
            </div>

            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono mb-4">
                {label}
            </p>

            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold font-mono ${trendUp ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                {trendUp ? <FiTrendingUp className="w-3 h-3" /> : <FiTrendingDown className="w-3 h-3" />}
                {Math.abs(trend)}%
            </div>
        </motion.div>
    );
}

// ─── Live City Feed ──────────────────────────────────────────────────────────
function LiveCityFeed({ issues, loading }) {
    const recent = useMemo(
        () => [...issues].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5),
        [issues]
    );

    return (
        <div className="bio-card flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,1)]" />
                    <h2 className="text-lg font-bold text-white uppercase tracking-tight" style={{ fontFamily: 'Outfit' }}>
                        Live Intel Stream
                    </h2>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                    Node Active
                </span>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ maxHeight: 400 }}>
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        [1, 2, 3, 4].map(i => <SkeletonRow key={i} />)
                    ) : recent.length === 0 ? (
                        <div className="py-20 text-center">
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 font-mono italic">
                                No active incidents detected. Sector quiet. 🌿
                            </p>
                        </div>
                    ) : recent.map((issue, i) => {
                        const status = issue.status || 'Pending';
                        const colorClass = STATUS_COLORS[status] || 'text-red-400';
                        return (
                            <motion.div
                                key={issue._id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ delay: i * 0.05, duration: 0.4 }}
                                className="flex items-start gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-emerald-500/20 transition-all group"
                            >
                                {/* Status dot */}
                                <div className="flex-shrink-0 mt-1.5">
                                    <div className={`w-2 h-2 rounded-full ${colorClass.replace('text', 'bg')} shadow-lg`} />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors uppercase tracking-tight mb-2 truncate">
                                        {issue.title || 'Untitled Report'}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-3">
                                        {issue.category && (
                                            <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                                                {issue.category}
                                            </span>
                                        )}
                                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/5 border border-white/10 font-mono ${colorClass}`}>
                                            {status}
                                        </span>
                                        {issue.location && (
                                            <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-slate-500 font-mono">
                                                <FiMapPin className="w-3 h-3 text-emerald-500" />
                                                {issue.location}
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-slate-600 font-mono ml-auto">
                                            <FiClock className="w-3 h-3" />
                                            {timeAgo(issue.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Footer link */}
            <div className="px-8 py-4 border-t border-white/5 flex justify-end">
                <Link
                    to="/user-dashboard"
                    className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors font-mono"
                >
                    Expand Logistics <FiChevronRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    );
}

// ─── Impact SVG Ring ─────────────────────────────────────────────────────────
function ImpactRing({ points = 0 }) {
    const R = 52;
    const CIRCUMFERENCE = 2 * Math.PI * R;
    const { current, next } = getTier(points);
    const [animated, setAnimated] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setAnimated(true), 300);
        return () => clearTimeout(t);
    }, []);

    const pct = next
        ? Math.min(1, (points - current.min) / (next.min - current.min))
        : 1;

    const offset = CIRCUMFERENCE - pct * CIRCUMFERENCE;
    const displayPoints = useCountUp(points, 1200, animated);
    const ptsToNext = next ? next.min - points : 0;

    return (
        <div className="bio-card flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="px-8 py-6 border-b border-white/5">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500/60 font-mono mb-1">
                    System Merit
                </p>
                <h2 className="text-lg font-bold text-white uppercase tracking-tight" style={{ fontFamily: 'Outfit' }}>
                    Impact Quotient
                </h2>
            </div>

            {/* Ring */}
            <div className="flex flex-col items-center py-10 px-8 gap-8">
                <div className="relative">
                    <svg width="140" height="140" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                        <motion.circle
                            cx="60" cy="60" r={R} fill="none"
                            stroke="url(#impactGradient)"
                            strokeWidth="10"
                            strokeLinecap="round"
                            strokeDasharray={CIRCUMFERENCE}
                            initial={{ strokeDashoffset: CIRCUMFERENCE }}
                            animate={{ strokeDashoffset: animated ? offset : CIRCUMFERENCE }}
                            transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1], delay: 0.5 }}
                            style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}
                        />
                        <defs>
                            <linearGradient id="impactGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#34d399" />
                                <stop offset="100%" stopColor="#22d3ee" />
                            </linearGradient>
                        </defs>
                    </svg>
                    {/* Center text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-white" style={{ fontFamily: 'Outfit' }}>
                            {displayPoints.toLocaleString()}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">
                            PTS
                        </span>
                    </div>
                </div>

                {/* Tier info */}
                <div className="w-full space-y-6">
                    <div className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.03] border border-white/10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-2xl border border-emerald-500/20">
                                {current.icon}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white uppercase tracking-tight" style={{ fontFamily: 'Outfit' }}>
                                    {current.name}
                                </p>
                                <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-500/60 font-mono">
                                    Current Rank
                                </p>
                            </div>
                        </div>
                        {next && (
                            <div className="text-right">
                                <p className="text-xs font-bold text-white uppercase tracking-tight" style={{ fontFamily: 'Outfit' }}>
                                    {ptsToNext.toLocaleString()} PTS
                                </p>
                                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 font-mono">
                                    to {next.name} {next.icon}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Tier bar */}
                    <div className="space-y-2">
                        <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct * 100}%` }}
                                transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1], delay: 0.8 }}
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(52,211,153,0.3)]"
                            />
                        </div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-center text-slate-500 font-mono">
                            {Math.round(pct * 100)}% to {next ? next.name : 'Max'} standing
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function MissionControl() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { issues, userIssues, resolvedIssues, loading } = useIssues();

    const [scrolled, setScrolled] = useState(false);
    const [notifications] = useState(3);

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handler, { passive: true });
        return () => window.removeEventListener('scroll', handler);
    }, []);

    // Derived stats
    const stats = useMemo(() => {
        const totalIssues = typeof currentUser?.issuecount === 'number'
            ? currentUser.issuecount
            : (userIssues.length + resolvedIssues.length);
        const resolved = resolvedIssues.length;
        const points = currentUser?.points ?? 0;
        const rank = currentUser?.rank ?? 4;
        return { totalIssues, resolved, points, rank };
    }, [currentUser, userIssues, resolvedIssues]);

    if (!currentUser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#030d0a]">
                <div className="text-center space-y-6 bio-card p-12">
                    <FiShield className="w-16 h-16 mx-auto text-emerald-500 animate-pulse" />
                    <h2 className="text-2xl font-bold text-white uppercase tracking-tight" style={{ fontFamily: 'Outfit' }}>
                        Authentication Required
                    </h2>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest font-mono">
                        Access Restricted to Authorized Citizens Only
                    </p>
                    <Link to="/login/user"
                        className="inline-block px-10 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest bg-emerald-500 text-black hover:bg-emerald-400 transition-all font-mono">
                        Initialize Session
                    </Link>
                </div>
            </div>
        );
    }

    const displayName = currentUser?.firstName
        ? `${currentUser.firstName} ${currentUser.lastName || ''}`.trim()
        : currentUser?.username || 'Eco Warrior';

    return (
        <div className="min-h-screen bg-[#030d0a] pb-32">

            {/* ─── STICKY HEADER ─────────────────────────────────────── */}
            <header
                className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 px-6 ${scrolled ? 'bg-[#030d0a]/80 backdrop-blur-xl border-b border-white/5 py-4' : 'bg-transparent py-8'
                    }`}
            >
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <FiZap className="w-5 h-5 text-emerald-500" />
                        </div>
                        <span className="text-xl font-bold text-white uppercase tracking-tighter" style={{ fontFamily: 'Outfit' }}>
                            GreenCity <span className="text-emerald-500">.</span>
                        </span>
                    </Link>

                    <div className="flex items-center gap-6">
                        <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 font-mono">
                            <FiZap className="w-4 h-4 text-emerald-400" />
                            <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                                {(stats.points).toLocaleString()} CREDITS
                            </span>
                        </div>

                        <button className="relative p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                            <FiBell className="w-5 h-5 text-slate-400" />
                            {notifications > 0 && (
                                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                            )}
                        </button>

                        <Avatar name={displayName} size={42} />
                    </div>
                </div>
            </header>

            {/* ─── MAIN CONTENT ──────────────────────────────────────── */}
            <main className="max-w-7xl mx-auto px-6 pt-32 space-y-12 relative z-10">

                {/* Background Decor */}
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full h-[600px] bg-emerald-500/[0.02] blur-[150px] -z-10" />

                {/* Welcome line */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <span className="w-8 h-[1px] bg-emerald-500/40" />
                        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-emerald-500/60 font-mono">
                            Mission Control — V4.2
                        </p>
                    </div>
                    <h1
                        className="text-5xl md:text-7xl font-bold text-white tracking-tighter leading-none"
                        style={{ fontFamily: 'Outfit' }}
                    >
                        Active Session: <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
                            {displayName.split(' ')[0]}.
                        </span>
                    </h1>
                </motion.div>

                {/* ─── STAT CARDS ─── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard icon={FiAlertTriangle} label="Issues Logged" target={stats.totalIssues} trend={12} delay={0.1} />
                    <StatCard icon={FiCheckCircle} label="Verified Solved" target={stats.resolved} trend={5} delay={0.2} />
                    <StatCard icon={FiZap} label="Merit Gained" target={stats.points} trend={8} delay={0.3} />
                    <StatCard icon={FiBarChart2} label="Global Standing" target={stats.rank} trend={-2} delay={0.4} />
                </div>

                {/* ─── FEED + IMPACT ─── */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-3">
                        <LiveCityFeed issues={issues} loading={loading} />
                    </div>
                    <div className="lg:col-span-2">
                        <ImpactRing points={stats.points} />
                    </div>
                </div>

                {/* ─── QUICK ACTIONS ─── */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                    {[
                        { to: '/report-issue', icon: FiAlertTriangle, label: 'Report Incident', sub: 'Log local infrastructure hazards', color: 'text-amber-400' },
                        { to: '/eco-transport', icon: FiRefreshCw, label: 'Optimization', sub: 'Calculate low-impact transit', color: 'text-blue-400' },
                        { to: '/gamification', label: 'Reputation', sub: 'Claim rewards and view badges', icon: FiZap, color: 'text-emerald-400' },
                    ].map(({ to, icon: Icon, label, sub, color }) => (
                        <Link
                            key={to}
                            to={to}
                            className="bio-card p-6 flex items-center gap-6 hover:border-emerald-500/30 transition-all group"
                        >
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 group-hover:scale-110 transition-transform ${color}`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-white uppercase tracking-tight group-hover:text-emerald-400 transition-colors" style={{ fontFamily: 'Outfit' }}>
                                    {label}
                                </h3>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">
                                    {sub}
                                </p>
                            </div>
                            <FiChevronRight className="w-5 h-5 ml-auto text-slate-600 group-hover:text-emerald-400 transition-colors" />
                        </Link>
                    ))}
                </motion.div>
            </main>

            {/* ─── MOBILE FAB ─── */}
            <div className="fixed bottom-8 right-8 lg:hidden z-50">
                <button
                    onClick={() => navigate('/report-issue')}
                    className="w-16 h-16 rounded-2xl flex items-center justify-center bg-emerald-500 text-black shadow-[0_0_30px_rgba(52,211,153,0.4)] hover:bg-emerald-400 transition-all active:scale-90"
                >
                    <FiPlus className="w-8 h-8" />
                </button>
            </div>
        </div>
    );
}
