import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSearch,
  FiFilter,
  FiArrowRight,
  FiRefreshCw,
  FiMapPin,
  FiCompass,
  FiShield,
  FiActivity
} from 'react-icons/fi';
import { BiLoaderAlt } from 'react-icons/bi';
import { HiX } from 'react-icons/hi';
import axiosInstance from "../../../config/axios";
import { API_ENDPOINTS } from "../../../config/api";
import TransportGrid from "../TransportGrid";

/**
 * EcoTransport Page
 * High-fidelity redesign for GreenCity global UI unification.
 */
function EcoTransport() {
  const [start, setStart] = useState("");
  const [destination, setDestination] = useState("");
  const [transportType, setTransportType] = useState("");
  const [transportOptions, setTransportOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [allTransports, setAllTransports] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchAllTransports();
  }, []);

  const fetchAllTransports = async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.GET_ALL_TRANSPORTS);
      if (response.data) setAllTransports(response.data);
    } catch (err) {
      console.error("Error fetching transports:", err);
    }
  };

  const findTransport = async () => {
    if (!start.trim() || !destination.trim()) {
      setError("Routing error: origin and destination nodes required.");
      return;
    }
    setLoading(true);
    setError("");
    setTransportOptions([]);
    setIsSearching(true);

    try {
      const response = await axiosInstance.post(API_ENDPOINTS.TRANSPORT_QUERY, {
        from: start.trim(),
        to: destination.trim(),
        transportType: transportType || undefined,
      });

      if (response.data?.data) {
        const results = response.data.data;
        setTransportOptions(results);
        if (results.length === 0)
          setError("No active vectors found for this corridor. Browse all routes below.");
      } else {
        setError("Network response empty. Check all available routes below.");
      }
    } catch (err) {
      if (err.response?.status === 404)
        setError("No exact telemetry matches found. Try different search terms.");
      else
        setError(err.response?.data?.message || "Infrastrucure query failed. Link unstable.");
      console.error("Error fetching transport:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setStart("");
    setDestination("");
    setTransportType("");
    setTransportOptions([]);
    setError("");
    setIsSearching(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") findTransport();
  };

  const handleRouteClick = useCallback((transport) => {
    setStart(transport.from);
    setDestination(transport.to);
    setTransportType("");
    window.scrollTo({ top: 0, behavior: "smooth" });
    // Trigger search after selecting popular route
    setTimeout(() => findTransport(), 500);
  }, []);

  return (
    <div className="min-h-screen bg-[#030d0a] text-slate-200">

      {/* ─── HERO ─── */}
      <section className="relative pt-48 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.03] to-teal-500/[0.03] -z-10" />
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-emerald-500/[0.05] blur-[150px] -z-10 animate-pulse" />

        <div className="container mx-auto max-w-7xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <span className="w-12 h-[1px] bg-emerald-500/40" />
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-emerald-500/60 font-mono">
                Logistics Infrastructure — Grid 2.0
              </p>
            </div>

            <h1 className="text-7xl md:text-9xl font-bold tracking-tighter text-white mb-8 leading-[0.85]" style={{ fontFamily: 'Outfit' }}>
              Find Your <br />
              <span className="text-emerald-500 italic">Corridor.</span>
            </h1>

            <p className="text-xl text-slate-400 font-medium max-w-2xl leading-relaxed mb-12" style={{ fontFamily: 'Inter' }}>
              Query the high-fidelity GreenCity navigation grid. Modular transport protocols
              calibrated for maximum efficiency and minimum footprint.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── SEARCH PANEL ─── */}
      <section className="px-6 -mt-10 relative z-20">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bio-card p-10 lg:p-14"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
              {/* Origin */}
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono ml-1">Origin Node</p>
                <div className="relative group">
                  <FiMapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-500 w-5 h-5 group-focus-within:scale-110 transition-transform" />
                  <input
                    type="text"
                    className="w-full bg-white/[0.03] border-2 border-white/5 rounded-2xl pl-14 pr-6 py-5 text-sm font-bold text-white placeholder:text-slate-600 focus:border-emerald-500/30 focus:bg-white/[0.05] transition-all outline-none"
                    placeholder="Enter starting point..."
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                    onKeyPress={handleKeyPress}
                    style={{ fontFamily: 'Inter' }}
                  />
                </div>
              </div>

              {/* Destination */}
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono ml-1">Terminal Node</p>
                <div className="relative group">
                  <FiCompass className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-500 w-5 h-5 group-focus-within:scale-110 transition-transform" />
                  <input
                    type="text"
                    className="w-full bg-white/[0.03] border-2 border-white/5 rounded-2xl pl-14 pr-6 py-5 text-sm font-bold text-white placeholder:text-slate-600 focus:border-emerald-500/30 focus:bg-white/[0.05] transition-all outline-none"
                    placeholder="Enter final destination..."
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    onKeyPress={handleKeyPress}
                    style={{ fontFamily: 'Inter' }}
                  />
                </div>
              </div>

              {/* Modality */}
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono ml-1">Preferred Modality</p>
                <div className="relative">
                  <select
                    className="w-full bg-white/[0.03] border-2 border-white/5 rounded-2xl px-6 py-5 text-sm font-bold text-white appearance-none focus:border-emerald-500/30 focus:bg-white/[0.05] transition-all outline-none cursor-pointer"
                    value={transportType}
                    onChange={(e) => setTransportType(e.target.value)}
                    style={{ fontFamily: 'Inter' }}
                  >
                    <option value="" className="bg-[#030d0a]">All Grid Modalities</option>
                    <option value="Bus" className="bg-[#030d0a]">Rapid Transit Bus</option>
                    <option value="Train" className="bg-[#030d0a]">Intercity Rail</option>
                    <option value="Metro" className="bg-[#030d0a]">Urban Metro</option>
                    <option value="SharedCab" className="bg-[#030d0a]">Shared EV Pod</option>
                    <option value="Other" className="bg-[#030d0a]">Unspecified Relay</option>
                  </select>
                  <FiFilter className="absolute right-6 top-1/2 -translate-y-1/2 text-emerald-500 w-4 h-4 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={findTransport}
                disabled={loading || !start.trim() || !destination.trim()}
                className="flex-1 group flex items-center justify-center gap-3 py-5 rounded-2xl bg-emerald-500 text-black font-black uppercase text-xs tracking-widest disabled:opacity-30 disabled:cursor-not-allowed hover:bg-emerald-400 transition-all shadow-[0_0_30px_rgba(16,185,129,0.2)]"
              >
                {loading ? <FiRefreshCw className="w-4 h-4 animate-spin" /> : <FiSearch className="group-hover:scale-125 transition-transform w-4 h-4" />}
                Init Grid Query
              </button>
              {(start || destination || transportType) && (
                <button
                  onClick={handleClearSearch}
                  className="px-10 py-5 rounded-2xl bg-white/5 border-2 border-white/5 text-slate-400 font-black uppercase text-xs tracking-widest hover:bg-white/10 hover:text-white transition-all font-mono flex items-center justify-center gap-2"
                >
                  <HiX className="w-4 h-4" />
                  Reset
                </button>
              )}
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 p-6 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-4"
              >
                <FiActivity className="text-red-500 w-5 h-5 flex-shrink-0" />
                <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest font-mono">
                  {error}
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ─── GRID RESULTS ─── */}
      <section className="py-24 px-6 overflow-hidden">
        <div className="container mx-auto max-w-7xl">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-32"
              >
                <div className="w-24 h-24 relative mb-8">
                  <div className="absolute inset-0 border-4 border-emerald-500/10 rounded-full" />
                  <div className="absolute inset-0 border-4 border-t-emerald-500 rounded-full animate-spin" />
                </div>
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.4em] font-mono animate-pulse">
                  Querying Global Grid Telemetry...
                </p>
              </motion.div>
            ) : isSearching ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex items-center justify-between mb-16 px-2">
                  <div>
                    <h2 className="text-4xl font-bold text-white tracking-tighter" style={{ fontFamily: 'Outfit' }}>
                      Active <span className="text-emerald-500">Matches.</span>
                    </h2>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono mt-2">
                      Showing routes from <span className="text-emerald-500">{start}</span> to <span className="text-emerald-500">{destination}</span>
                    </p>
                  </div>
                  <div className="hidden lg:flex items-center gap-3">
                    <FiShield className="text-emerald-500" />
                    <span className="text-[9px] font-bold text-emerald-500/60 uppercase tracking-widest font-mono">Verified Grid Nodes</span>
                  </div>
                </div>

                <TransportGrid transports={transportOptions} />
              </motion.div>
            ) : (
              <motion.div
                key="discover"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 px-2 gap-8">
                  <div>
                    <h2 className="text-5xl font-bold text-white tracking-tighter" style={{ fontFamily: 'Outfit' }}>
                      Prime <span className="text-emerald-500">Corridors.</span>
                    </h2>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono mt-4">
                      High-frequency eco-transit packets ready for deployment.
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs font-bold text-white uppercase tracking-tight" style={{ fontFamily: 'Outfit' }}>2.4k Citizens</p>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">Syncing Active Transits</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <FiActivity className="text-emerald-500 w-6 h-6" />
                    </div>
                  </div>
                </div>

                {/* We use allTransports here as initial/suggested routes */}
                <TransportGrid />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

    </div>
  );
}

export default EcoTransport;
