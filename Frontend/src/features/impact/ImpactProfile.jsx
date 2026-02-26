import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaAward, FaCheckCircle, FaUsers, FaCalendarAlt, FaLock, FaLeaf, FaShieldAlt, FaTrophy, FaWater, FaVolumeUp, FaGlobe } from 'react-icons/fa';
import { HiLightningBolt, HiTrendingUp } from 'react-icons/hi';
import { BiInfoCircle } from 'react-icons/bi';
import { useAuth } from '../auth/context/authcontext';

const TIERS = [
    { name: 'Legend', min: 10000, color: '#FFD700', emoji: '👑' },
    { name: 'Champion', min: 6000, color: '#C0C0C0', emoji: '🏆' },
    { name: 'Guardian', min: 3000, color: '#34d399', emoji: '🛡️' },
    { name: 'Ranger', min: 1000, color: '#22d3ee', emoji: '🏹' },
    { name: 'Scout', min: 0, color: '#A5D6A7', emoji: '🔭' }
];

const BADGES = [
    { id: 'first_report', icon: <FaLeaf />, label: 'First Report', desc: 'Submitted your first civic issue.', condition: (stats) => stats.reports > 0 },
    { id: 'fast_responder', icon: <HiLightningBolt />, label: 'Fast Responder', desc: 'Resolved an issue within 1 hour.', condition: (stats) => stats.fastResolves > 0 },
    { id: 'top_contributor', icon: <FaTrophy />, label: 'Top Contributor', desc: 'Reached the top 10 on the leaderboard.', condition: (stats) => stats.isTopTen },
    { id: 'eco_warrior', icon: <FaShieldAlt />, label: 'Eco Warrior', desc: 'Earned 5,000 eco points.', condition: (stats) => stats.points >= 5000 },
    { id: 'water_guardian', icon: <FaWater />, label: 'Water Guardian', desc: 'Resolved 3 water issues.', condition: (stats) => stats.waterIssues >= 3 },
    { id: 'noise_buster', icon: <FaVolumeUp />, label: 'Noise Buster', desc: 'Reported 5 noise complaints.', condition: (stats) => stats.noiseIssues >= 5 },
    { id: 'city_legend', icon: <FaGlobe />, label: 'City Legend', desc: 'Reached the Legend tier.', condition: (stats) => stats.points >= 10000 },
];

const CountUp = ({ end, duration = 2 }) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        let start = 0;
        const increment = end / (duration * 60);
        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 1000 / 60);
        return () => clearInterval(timer);
    }, [end, duration]);
    return <span>{count.toLocaleString()}</span>;
};

export default function ImpactProfile() {
    const { currentUser } = useAuth();
    const points = currentUser?.points || 0;

    // Stats - these would ideally come from currentUser or another context
    const stats = {
        reports: currentUser?.reportsSubmitted || 0,
        resolved: currentUser?.issuesResolved || 0,
        upvotes: currentUser?.upvotesReceived || 0,
        daysActive: currentUser?.daysActive || 1,
        points: points,
        fastResolves: currentUser?.fastResolves || 0,
        isTopTen: currentUser?.isTopTen || false,
        waterIssues: currentUser?.waterIssuesResolved || 0,
        noiseIssues: currentUser?.noiseIssuesReported || 0,
    };

    const currentTier = TIERS.find(t => points >= t.min) || TIERS[TIERS.length - 1];
    const nextTier = TIERS[TIERS.indexOf(currentTier) - 1];
    const progress = nextTier ? ((points - currentTier.min) / (nextTier.min - currentTier.min)) * 100 : 100;

    return (
        <div className="space-y-8 pb-12">
            {/* HERO CARD */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-[2.5rem] p-10 flex flex-col items-center text-center"
                style={{
                    background: 'rgba(10, 30, 20, 0.7)',
                    border: '1px solid rgba(52, 211, 153, 0.2)',
                    backdropFilter: 'blur(20px)',
                }}
            >
                <div className="relative mb-6">
                    <div
                        className="w-32 h-32 rounded-full flex items-center justify-center text-3xl font-bold text-white bg-white/5"
                        style={{
                            boxShadow: `0 0 20px ${currentTier.color}, 0 0 40px ${currentTier.color}40`,
                            border: `4px solid ${currentTier.color}`,
                        }}
                    >
                        {currentUser?.name?.charAt(0) || 'U'}
                    </div>
                </div>

                <h2 className="text-3xl font-extrabold font-syne text-white mb-1">
                    {currentUser?.name || 'Green Citizen'}
                </h2>
                <div className="flex items-center gap-2 mb-6">
                    <span className="text-xl">{currentTier.emoji}</span>
                    <span className="text-sm font-bold uppercase tracking-widest" style={{ color: currentTier.color }}>
                        {currentTier.name}
                    </span>
                </div>

                <div className="flex flex-col items-center">
                    <div className="text-6xl font-black font-syne text-emerald-400">
                        <CountUp end={points} />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-500/50 mt-2">
                        Eco Points
                    </p>
                </div>
            </motion.div>

            {/* XP PROGRESS BAR */}
            <div className="space-y-4 px-2">
                <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-widest text-[#34d399]/40">
                    <span>{currentTier.name}</span>
                    {nextTier && <span>{nextTier.name}</span>}
                </div>

                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="h-full bg-emerald-400 rounded-full shadow-[0_0_10px_#34d399]"
                    />
                </div>

                {nextTier && (
                    <p className="text-center text-[10px] font-bold text-[#34d399]/60 uppercase tracking-widest">
                        {nextTier.min - points} more points to reach {nextTier.name}
                    </p>
                )}
            </div>

            {/* STATS GRID */}
            <div className="grid grid-cols-2 gap-4">
                {[
                    { label: 'Reports Submitted', value: stats.reports, icon: <HiTrendingUp className="text-emerald-400" /> },
                    { label: 'Issues Resolved', value: stats.resolved, icon: <FaCheckCircle className="text-blue-400" /> },
                    { label: 'Upvotes Received', value: stats.upvotes, icon: <FaAward className="text-yellow-400" /> },
                    { label: 'Days Active', value: stats.daysActive, icon: <FaCalendarAlt className="text-purple-400" /> },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-6 rounded-[2rem] bg-white/5 border border-white/5 flex flex-col items-center text-center"
                    >
                        <div className="text-2xl mb-3">{stat.icon}</div>
                        <div className="text-2xl font-black font-syne text-white">
                            <CountUp end={stat.value} />
                        </div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mt-1">
                            {stat.label}
                        </p>
                    </motion.div>
                ))}
            </div>

            {/* BADGE SHELF */}
            <div className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-[#34d399]/60 px-2 flex items-center gap-2">
                    Earned Badges <span className="h-px flex-1 bg-white/5" />
                </h3>

                <div className="flex flex-wrap gap-3">
                    {BADGES.map((badge) => {
                        const isEarned = badge.condition(stats);
                        return (
                            <div key={badge.id} className="group relative">
                                <div
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${isEarned
                                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 cursor-help'
                                            : 'bg-white/5 border-white/5 text-white/20 grayscale select-none'
                                        }`}
                                    style={{ border: '1px solid' }}
                                >
                                    {isEarned ? badge.icon : <FaLock className="w-2.5 h-2.5" />}
                                    {badge.label}
                                </div>

                                {isEarned && (
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 p-3 rounded-xl bg-[#0a1e14] border border-emerald-500/20 text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 backdrop-blur-xl">
                                        <p className="text-[10px] font-black text-emerald-400 mb-1">{badge.label}</p>
                                        <p className="text-[9px] text-[#34d399]/60 leading-relaxed font-bold">{badge.desc}</p>
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-[#0a1e14]" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
