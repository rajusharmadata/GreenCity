import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiClock,
  FiZap,
  FiDollarSign,
  FiUsers,
  FiArrowRight,
  FiShield,
  FiCheckCircle,
  FiAlertTriangle,
} from 'react-icons/fi'
import { FaLeaf } from 'react-icons/fa'

/**
 * RouteCard Component
 * Redesigned for High-Fidelity GreenCity Redesign
 */
const RouteCard = ({ route, isExpanded, onToggle, onPlan }) => {
  // Simulated live occupancy data
  const [capacity] = useState(Math.floor(Math.random() * 70) + 20)

  const getStatusStyles = (status) => {
    switch (status) {
      case 'On Time':
        return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
      case 'Delayed':
        return 'bg-red-500/10 border-red-500/20 text-red-500'
      case 'Available':
        return 'bg-blue-500/10 border-blue-500/20 text-blue-400'
      default:
        return 'bg-slate-500/10 border-slate-500/20 text-slate-400'
    }
  }

  const getDepartureColor = (minutes) => {
    if (route.status === 'Delayed') return 'text-red-500'
    if (minutes <= 5) return 'text-emerald-400'
    if (minutes <= 15) return 'text-amber-400'
    return 'text-slate-400'
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Bus':
        return '🚌'
      case 'Train':
        return '🚂'
      case 'Metro':
        return '🚇'
      case 'Bike':
        return '🚲'
      case 'Ferry':
        return '⛵'
      case 'Shuttle':
        return '⚡'
      default:
        return '📍'
    }
  }

  return (
    <motion.div
      layout
      onClick={onToggle}
      className={`bio-card group cursor-pointer transition-all duration-500 ${
        isExpanded
          ? 'ring-2 ring-emerald-500/30 bg-emerald-500/5'
          : 'hover:border-emerald-500/30'
      }`}
    >
      <div className="p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-inner">
              {getTypeIcon(route.type || route.transportType)}
            </div>
            <div>
              <h3
                className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors uppercase tracking-tight"
                style={{ fontFamily: 'Outfit' }}
              >
                {route.name || route.agencyName}
              </h3>
              <p className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-widest font-mono">
                {route.type || route.transportType} Module — 0
                {Math.floor(Math.random() * 9) + 1}
              </p>
            </div>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyles(route.status || 'On Time')}`}
          >
            {route.status || 'ACTIVE'}
          </div>
        </div>

        {/* Route Visualizer */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 space-y-1">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-mono">
              Origin
            </p>
            <p
              className="text-sm font-bold text-white truncate uppercase"
              style={{ fontFamily: 'Outfit' }}
            >
              {route.from}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <div className="w-12 h-[1px] bg-emerald-500/20 relative overflow-hidden">
              <motion.div
                animate={{ x: [0, 48] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                className="absolute inset-y-0 w-4 bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent"
              />
            </div>
            <FiArrowRight className="text-emerald-500 w-4 h-4" />
          </div>
          <div className="flex-1 space-y-1 text-right">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-mono">
              Target
            </p>
            <p
              className="text-sm font-bold text-white truncate uppercase"
              style={{ fontFamily: 'Outfit' }}
            >
              {route.to}
            </p>
          </div>
        </div>

        {/* Primary Metric */}
        <div className="text-center mb-8 py-6 rounded-2xl bg-white/[0.02] border border-white/5">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-mono mb-1">
            Estimated Ingress
          </p>
          <div
            className={`text-4xl font-bold tracking-tighter ${getDepartureColor(route.departure || 10)}`}
            style={{ fontFamily: 'Outfit' }}
          >
            {route.status === 'Delayed'
              ? 'STALLED'
              : route.departure
                ? `${route.departure} MIN`
                : 'NOW'}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/5">
          <div className="flex flex-col items-center gap-1">
            <FiClock className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[10px] font-bold text-white font-mono">
              {route.frequency || '15M'}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <FiZap className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px] font-bold text-white font-mono">
              ₹{route.fare || '15'}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <FaLeaf className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[10px] font-bold text-emerald-500 font-mono">
              {route.emissions || '0.2G'}
            </span>
          </div>
        </div>

        {/* Expanded Details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-8 space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono flex items-center gap-2">
                      <FiUsers className="w-3 h-3" /> Occupancy Load
                    </h4>
                    <span className="text-[10px] font-bold text-white font-mono">
                      {capacity}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${capacity}%` }}
                      className={`h-full rounded-full transition-colors duration-500 ${
                        capacity > 80
                          ? 'bg-red-500'
                          : capacity > 50
                            ? 'bg-amber-400'
                            : 'bg-emerald-500'
                      }`}
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-3">
                  <FiShield className="text-emerald-400 w-4 h-4" />
                  <p className="text-[10px] font-medium text-emerald-400/80 uppercase tracking-wider font-mono">
                    Carbon Offset Verified — Tier Alpha
                  </p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onPlan(route)
                  }}
                  className="w-full py-4 rounded-xl bg-emerald-500 text-white font-black uppercase text-[10px] tracking-widest hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                >
                  Initialize Vector
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default RouteCard
