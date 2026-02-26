import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaLock, FaCheckCircle, FaChevronDown, FaZap } from 'react-icons/fa';
import { useAuth } from '../auth/context/authcontext';

const ACHIEVEMENTS = [
    { id: 1, icon: "🌱", title: "First Report", desc: "Submit your first civic issue report", xp: 50, conditionText: "Submit 1 report", check: (s) => s.reports >= 1 },
    { id: 2, icon: "⚡", title: "Fast Responder", desc: "Submit a report within 1 hour of an incident", xp: 100, conditionText: "Report within 1hr of incident", check: (s) => s.fastResolves >= 1 },
    { id: 3, icon: "🏆", title: "Top Contributor", desc: "Reach the top 10 on the leaderboard", xp: 500, conditionText: "Reach top 10", check: (s) => s.isTopTen },
    { id: 4, icon: "🌿", title: "Eco Warrior", desc: "Earn 5,000 eco points", xp: 300, conditionText: "Earn 5000 points", check: (s) => s.points >= 5000 },
    { id: 5, icon: "👥", title: "Community Builder", desc: "Get 50 upvotes on your reports", xp: 200, conditionText: "Get 50 upvotes", check: (s) => s.upvotes >= 50 },
    { id: 6, icon: "📍", title: "City Explorer", desc: "Report issues in 5 different city zones", xp: 150, conditionText: "Report in 5 zones", check: (s) => s.zonesCount >= 5 },
    { id: 7, icon: "💧", title: "Water Guardian", desc: "Report 3 water-related issues", xp: 120, conditionText: "Report 3 water issues", check: (s) => s.waterIssues >= 3 },
    { id: 8, icon: "🌍", title: "City Legend", desc: "Reach the Eco Legend tier", xp: 1000, conditionText: "Reach Eco Legend tier", check: (s) => s.points >= 10000 }
];

const AchievementCard = ({ achievement, isUnlocked, stats }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="relative">
            <motion.div
                layout
                onClick={() => isUnlocked ? setIsExpanded(!isExpanded) : null}
                className={`relative overflow-hidden rounded-[2rem] p-6 border transition-all cursor-pointer ${isUnlocked
                        ? 'bg-white/5 border-emerald-500/20 hover:bg-white/10'
                        : 'bg-white/[0.02] border-white/5 grayscale pointer-events-none'
                    }`}
            >
                <div className="flex items-start gap-4">
                    <div className="text-4xl bg-white/5 w-16 h-16 rounded-2xl flex items-center justify-center border border-white/5">
                        {achievement.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-white mb-1 truncate font-syne uppercase">
                            {achievement.title}
                        </h4>
                        <p className="text-[10px] text-emerald-100/40 leading-relaxed line-clamp-2">
                            {achievement.desc}
                        </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        <div className="bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg flex items-center gap-1">
                            <FaZap className="w-2 h-2 text-emerald-400" />
                            <span className="text-[9px] font-black text-emerald-400">+{achievement.xp}</span>
                        </div>
                        {isUnlocked && <FaCheckCircle className="text-emerald-400 w-4 h-4" />}
                    </div>
                </div>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-6 pt-6 border-t border-white/5"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-100/30">Status</span>
                                <span className="text-[10px] font-bold text-emerald-400 uppercase">Completed</span>
                            </div>
                            <p className="text-[11px] text-emerald-100/60 leading-relaxed font-bold italic">
                                "Outstanding contribution to the city's environmental health. This achievement marks your dedication to a greener future."
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Locked Overlay */}
                {!isUnlocked && (
                    <div className="absolute inset-0 bg-[#030d0a]/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center group peer">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-2">
                            <FaLock className="w-4 h-4 text-white/40" />
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Locked Tooltip - using peer-hover since direct hover is disabled by pointer-events-none */}
            {!isUnlocked && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-auto cursor-help opacity-0 hover:opacity-100 transition-opacity">
                    {/* Invisible hover area over the card */}
                    <div className="w-48 p-4 rounded-2xl bg-[#0a1e14] border border-white/10 shadow-2xl text-center backdrop-blur-3xl">
                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Locked</p>
                        <p className="text-[9px] text-white/60 font-bold uppercase tracking-tighter leading-tight">
                            Complete: {achievement.conditionText}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default function Achievements() {
    const { currentUser } = useAuth();

    // Dummy stats for evaluation
    const stats = {
        points: currentUser?.points || 0,
        reports: currentUser?.reportsSubmitted || 0,
        resolved: currentUser?.issuesResolved || 0,
        upvotes: currentUser?.upvotesReceived || 0,
        fastResolves: currentUser?.fastResolves || 0,
        isTopTen: currentUser?.isTopTen || false,
        zonesCount: currentUser?.zonesExplored || 0,
        waterIssues: currentUser?.waterIssuesResolved || 0,
    };

    const unlockedCount = ACHIEVEMENTS.filter(a => a.check(stats)).length;
    const progress = (unlockedCount / ACHIEVEMENTS.length) * 100;

    return (
        <div className="space-y-10 pb-12">
            {/* HEADER */}
            <div className="space-y-6 px-2">
                <div className="flex justify-between items-end">
                    <div className="space-y-1">
                        <h3 className="text-xs font-black uppercase tracking-widest text-emerald-100/30">Progress</h3>
                        <p className="text-3xl font-black text-white font-syne uppercase">
                            {unlockedCount} / {ACHIEVEMENTS.length} <span className="text-emerald-400">Unlocked</span>
                        </p>
                    </div>
                    <span className="text-sm font-black text-emerald-400 font-syne">{Math.round(progress)}%</span>
                </div>

                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="h-full bg-emerald-400 rounded-full"
                    />
                </div>
            </div>

            {/* GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ACHIEVEMENTS.map((achievement) => (
                    <AchievementCard
                        key={achievement.id}
                        achievement={achievement}
                        isUnlocked={achievement.check(stats)}
                        stats={stats}
                    />
                ))}
            </div>
        </div>
    );
}
