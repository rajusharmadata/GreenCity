import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ImpactProfile from './ImpactProfile';
import Leaderboard from './Leaderboard';
import Achievements from './Achievements';

const TABS = [
    { id: 'impact', label: 'My Impact' },
    { id: 'leaderboard', label: 'Leaderboard' },
    { id: 'achievements', label: 'Achievements' }
];

export default function ImpactScreen() {
    const [activeTab, setActiveTab] = useState('impact');

    return (
        <div className="min-h-screen bg-[#030d0a] text-white pt-28 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
                {/* HEADER SECTION */}
                <div className="mb-10 text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400/50 mb-2">
                        Metropolis Impact Grid
                    </p>
                    <h1 className="text-4xl sm:text-5xl font-black font-syne uppercase tracking-tighter text-white">
                        Civic <span className="text-emerald-400">Contribution.</span>
                    </h1>
                </div>

                {/* TAB NAVIGATION */}
                <div className="relative flex justify-center mb-12 border-b border-white/5">
                    <div className="flex gap-8 relative">
                        {TABS.map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`relative pb-4 text-[11px] font-black uppercase tracking-widest transition-colors duration-300 ${isActive ? 'text-emerald-400' : 'text-white/30 hover:text-white/60'
                                        }`}
                                >
                                    {tab.label}
                                    {isActive && (
                                        <motion.div
                                            layoutId="tab-indicator"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 shadow-[0_0_10px_#34d399]"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* TAB CONTENT */}
                <div className="min-h-[60vh]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                        >
                            {activeTab === 'impact' && <ImpactProfile />}
                            {activeTab === 'leaderboard' && <Leaderboard />}
                            {activeTab === 'achievements' && <Achievements />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
