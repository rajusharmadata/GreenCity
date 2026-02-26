import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiBox,
    FiFilter,
    FiRefreshCw,
    FiZap,
    FiMapPin,
    FiShield,
    FiArrowRight
} from 'react-icons/fi';
import { BiErrorCircle } from 'react-icons/bi';
import { FaLeaf } from 'react-icons/fa';
import axiosInstance from '../../config/axios';
import { useCountUp } from '../../hooks/useCountUp';
import RouteCard from './RouteCard';
import { API_ENDPOINTS } from '../../config/api';

// ─── Design Tokens ────────────────────────────────────────────────────────────
const FILTERS = [
    { id: 'All', label: 'All Grid', icon: FiBox },
    { id: 'Bus', label: 'Electric Bus', icon: FiZap },
    { id: 'Train', label: 'Intercity Rail', icon: FiZap },
    { id: 'Metro', label: 'Urban Metro', icon: FiZap },
    { id: 'Shuttle', label: 'EV Shuttle', icon: FiZap },
    { id: 'Ferry', label: 'Solar Ferry', icon: FiZap }
];

// ─── Section 1: Eco Impact Banner ─────────────────────────────────────────────
const EcoImpactBanner = () => {
    const cars = useCountUp(842, 2000);
    const co2 = useCountUp(2400, 2000); // We'll divide by 1000 in render
    const rides = useCountUp(5840, 2000);

    return (
        <div className="bio-card p-10 mb-12 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                <div className="space-y-2">
                    <p className="text-4xl font-bold text-white tracking-tighter" style={{ fontFamily: 'Outfit' }}>{cars.toLocaleString()}</p>
                    <p className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-widest font-mono">Car Trips Avoided Today</p>
                </div>
                <div className="space-y-2">
                    <p className="text-4xl font-bold text-emerald-400 tracking-tighter" style={{ fontFamily: 'Outfit' }}>{(co2 / 1000).toFixed(1)}t</p>
                    <p className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-widest font-mono">Carbon Emissions Saved</p>
                </div>
                <div className="space-y-2">
                    <p className="text-4xl font-bold text-white tracking-tighter" style={{ fontFamily: 'Outfit' }}>{rides.toLocaleString()}</p>
                    <p className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-widest font-mono">Eco-Rides Synchronized</p>
                </div>
            </div>

            <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-center gap-4 text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Network status: High-Fidelity Performance
            </div>
        </div>
    );
};

// ─── Filter Chips ─────────────────────────────────────────────────────────────
const FilterChips = ({ active, onChange }) => {
    return (
        <div className="flex gap-4 overflow-x-auto pb-8 no-scrollbar scroll-smooth">
            {FILTERS.map((f) => {
                const isActive = active === f.id;
                const Icon = f.icon;
                return (
                    <button
                        key={f.id}
                        onClick={() => onChange(f.id)}
                        className={`group flex-shrink-0 flex items-center gap-3 px-8 py-3.5 rounded-2xl border-2 transition-all duration-500 ${isActive
                                ? 'bg-emerald-500 border-emerald-500 text-black shadow-lg shadow-emerald-500/20 scale-105'
                                : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/10 hover:text-white'
                            }`}
                    >
                        <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-emerald-500'}`} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{f.label}</span>
                    </button>
                );
            })}
        </div>
    );
};

// ─── Skeleton Loading State ──────────────────────────────────────────────────
const SkeletonCard = () => (
    <div className="h-96 rounded-[2rem] bg-white/5 border border-white/10 relative overflow-hidden animate-pulse">
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white/5 to-transparent" />
    </div>
);

// ─── Route Planning Modal ─────────────────────────────────────────────────────
const RoutePlanningModal = ({ isOpen, onClose, route }) => {
    if (!route) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 30 }}
                        className="relative w-full max-w-xl bio-card overflow-hidden shadow-2xl"
                    >
                        {/* Header */}
                        <div className="p-10 border-b border-white/5 flex justify-between items-start">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-bold text-emerald-400 uppercase tracking-widest font-mono mb-4">
                                    Vector Calibration
                                </div>
                                <h2 className="text-3xl font-bold text-white tracking-tighter" style={{ fontFamily: 'Outfit' }}>
                                    Confirm <span className="text-emerald-500 italic">Route.</span>
                                </h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all active:scale-90"
                            >
                                <FiRefreshCw className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-10 space-y-8">
                            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-white uppercase tracking-tight" style={{ fontFamily: 'Outfit' }}>{route.name || route.agencyName}</h3>
                                    <span className="text-[10px] font-bold text-emerald-500 font-mono">₹{route.fare || '15'}</span>
                                </div>
                                <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                                    <FiMapPin className="text-emerald-500" />
                                    <span>{route.from}</span>
                                    <FiArrowRight className="text-slate-700" />
                                    <span>{route.to}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-mono">Impact Summary</p>
                                    <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center justify-center text-center">
                                        <FaLeaf className="w-8 h-8 text-emerald-400 mb-2" />
                                        <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider font-mono">4.2kg Carbon Save</p>
                                    </div>
                                </div>
                                <div className="space-y-4 text-right">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-mono">System Merit</p>
                                    <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col items-center justify-center text-center">
                                        <FiZap className="w-8 h-8 text-amber-400 mb-2" />
                                        <p className="text-[10px] font-bold text-white uppercase tracking-wider font-mono">+25 Impact Pts</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-10 pt-0">
                            <button className="w-full py-5 rounded-2xl bg-emerald-500 text-black font-black uppercase text-xs tracking-[0.25em] hover:bg-emerald-400 transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                                Synchronize Vector
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default function TransportGrid() {
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeFilter, setActiveFilter] = useState('All');
    const [expandedId, setExpandedId] = useState(null);
    const [selectedRoute, setSelectedRoute] = useState(null);

    const fetchTransport = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.GET_ALL_TRANSPORTS);
            setRoutes(response.data || []);
        } catch (err) {
            console.error('Transport fetch error:', err);
            // If the main endpoint is empty, show a few mock items for UI demonstration
            setRoutes(MOCK_ROUTES);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransport();
    }, []);

    const filteredRoutes = useMemo(() => {
        if (activeFilter === 'All') return routes;
        return routes.filter(r => (r.type || r.transportType) === activeFilter);
    }, [routes, activeFilter]);

    return (
        <div className="w-full max-w-7xl mx-auto px-6 py-24 min-h-screen">
            {/* Header */}
            <div className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                    <span className="w-12 h-[1px] bg-emerald-500/40" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-emerald-500/60 font-mono">Transport Infrastructure</p>
                </div>
                <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-white mb-6" style={{ fontFamily: 'Outfit' }}>
                    Eco-Grid <br />
                    <span className="text-emerald-500 italic">Logistics.</span>
                </h1>
                <p className="text-lg text-slate-400 font-medium max-w-2xl" style={{ fontFamily: 'Inter' }}>
                    Calculated high-fidelity transit protocols for the modern GreenCity landscape.
                    Real-time telemetry and carbon offset optimization active.
                </p>
            </div>

            <EcoImpactBanner />

            <div className="flex flex-col gap-1 my-8">
                <p className="text-[10px] font-black text-emerald-500/60 uppercase tracking-widest font-mono mb-4 ml-2">Modality Filter</p>
                <FilterChips active={activeFilter} onChange={setActiveFilter} />
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
                    {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
                </div>
            ) : error ? (
                <div className="bio-card flex flex-col items-center justify-center py-32 text-center">
                    <BiErrorCircle className="w-20 h-20 text-red-500 mb-6 opacity-50" />
                    <h2 className="text-2xl font-bold text-white uppercase tracking-tight mb-4" style={{ fontFamily: 'Outfit' }}>Network Downtime Observed</h2>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest font-mono mb-8">Unable to query the transport infrastructure.</p>
                    <button
                        onClick={fetchTransport}
                        className="flex items-center gap-3 px-10 py-4 rounded-2xl bg-emerald-500 text-black font-black uppercase tracking-widest text-[10px] hover:bg-emerald-400 transition-all font-mono"
                    >
                        <FiRefreshCw className="w-4 h-4" />
                        Re-initialize
                    </button>
                </div>
            ) : (
                <motion.div
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12"
                >
                    <AnimatePresence mode="popLayout">
                        {filteredRoutes.map((route) => (
                            <RouteCard
                                key={route.id || route._id}
                                route={route}
                                isExpanded={expandedId === (route.id || route._id)}
                                onToggle={() => setExpandedId(expandedId === (route.id || route._id) ? null : (route.id || route._id))}
                                onPlan={(r) => setSelectedRoute(r)}
                            />
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}

            <RoutePlanningModal
                isOpen={!!selectedRoute}
                onClose={() => setSelectedRoute(null)}
                route={selectedRoute}
            />
        </div>
    );
}

const MOCK_ROUTES = [
    { id: 'm1', name: 'Greenway Express', type: 'Bus', status: 'On Time', from: 'Central Hub', to: 'North Sector', departure: 5, frequency: '10 min', fare: '₹25', emissions: '0.2kg' },
    { id: 'm2', name: 'SkyRail Alpha', type: 'Metro', status: 'On Time', from: 'Eco Park', to: 'Business District', departure: 2, frequency: '5 min', fare: '₹40', emissions: '0.05kg' },
    { id: 'm3', name: 'Oceanic Ferry', type: 'Ferry', status: 'Delayed', from: 'West Port', to: 'Island Node', departure: 45, frequency: '60 min', fare: '₹120', emissions: '0kg' }
];

