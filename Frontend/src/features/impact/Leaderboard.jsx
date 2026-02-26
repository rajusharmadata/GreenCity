import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaTrophy,
  FaMedal,
  FaChevronUp,
  FaChevronDown,
  FaMinus,
} from 'react-icons/fa'
import axiosInstance from '../../config/axios'
import { API_ENDPOINTS } from '../../config/api'
import { useAuth } from '../auth/context/authcontext'

const RankingRow = ({ rank, user, isCurrentUser, index }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.05 }}
    className={`flex items-center gap-4 p-4 rounded-2xl mb-2 transition-all ${
      isCurrentUser
        ? 'bg-emerald-500/10 border-l-4 border-l-emerald-400 border-emerald-500/20 shadow-lg shadow-emerald-500/5'
        : 'bg-white/5 border border-white/5'
    }`}
  >
    <div className="w-8 text-[11px] font-black text-emerald-100/30 text-center">
      #{rank}
    </div>

    <div className="relative flex-shrink-0">
      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs text-white uppercase overflow-hidden">
        {user.avatar ? (
          <img
            src={user.avatar}
            className="w-full h-full object-cover"
            alt=""
          />
        ) : (
          user.name.charAt(0)
        )}
      </div>
    </div>

    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <h4 className="text-sm font-bold text-white truncate">{user.name}</h4>
        {isCurrentUser && (
          <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-400 text-[#030d0a]">
            You
          </span>
        )}
      </div>
      <p className="text-[10px] font-bold text-emerald-100/30 uppercase tracking-tighter">
        {user.tier || 'Scout'}
      </p>
    </div>

    <div className="flex flex-col items-end gap-1">
      <div className="text-sm font-black text-emerald-400 font-syne">
        {user.points.toLocaleString()}
      </div>
      <div className="flex items-center gap-1">
        {user.change > 0 ? (
          <>
            <FaChevronUp className="w-1.5 h-1.5 text-emerald-500" />
            <span className="text-[8px] font-black text-emerald-500">
              ▲{user.change}
            </span>
          </>
        ) : user.change < 0 ? (
          <>
            <FaChevronDown className="w-1.5 h-1.5 text-rose-500" />
            <span className="text-[8px] font-black text-rose-500">
              ▼{Math.abs(user.change)}
            </span>
          </>
        ) : (
          <FaMinus className="w-1.5 h-1.5 text-white/20" />
        )}
      </div>
    </div>
  </motion.div>
)

const PodiumBlock = ({ rank, user, height, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.6 }}
    className="flex flex-col items-center flex-1 max-w-[100px]"
  >
    <div className="relative mb-4">
      <div
        className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white border-2 overflow-hidden shadow-2xl ${
          rank === 1
            ? 'border-yellow-400 scale-125'
            : rank === 2
              ? 'border-neutral-300'
              : 'border-amber-700'
        }`}
      >
        {user?.avatar ? (
          <img
            src={user.avatar}
            className="w-full h-full object-cover"
            alt=""
          />
        ) : (
          user?.name?.charAt(0) || '?'
        )}
      </div>
      <div
        className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-xl ${
          rank === 1
            ? 'bg-yellow-400'
            : rank === 2
              ? 'bg-neutral-300'
              : 'bg-amber-700'
        }`}
      >
        {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
      </div>
      {rank === 1 && (
        <motion.div
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-yellow-400/20 blur-2xl rounded-full"
        />
      )}
    </div>

    <div className="text-center w-full">
      <h3 className="text-[10px] font-black text-white uppercase tracking-widest truncate mb-1">
        {user?.name || '---'}
      </h3>
      <div className="text-sm font-black text-emerald-400 font-syne">
        {user?.points?.toLocaleString() || '0'}
      </div>
    </div>

    <div
      className={`w-full mt-4 rounded-t-2xl transition-all duration-1000 ${
        rank === 1
          ? 'bg-yellow-400/10 border-t-2 border-yellow-400'
          : rank === 2
            ? 'bg-neutral-300/10 border-t-2 border-neutral-300'
            : 'bg-amber-700/10 border-t-2 border-amber-700'
      }`}
      style={{ height }}
    />
  </motion.div>
)

const LeaderboardSkeleton = () => (
  <div className="space-y-3">
    {[1, 2, 3, 4, 5].map((i) => (
      <div
        key={i}
        className="h-20 w-full bg-white/5 rounded-2xl animate-pulse"
      />
    ))}
  </div>
)

export default function Leaderboard() {
  const { currentUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [rankings, setRankings] = useState([])

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const response = await axiosInstance.get(API_ENDPOINTS.USER_RANK)
        setRankings(response.data.data || [])
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchRankings()
  }, [])

  const topThree = rankings.slice(0, 3)
  const others = rankings.slice(3)

  return (
    <div className="space-y-10 pb-12">
      {/* PODIUM */}
      <div className="flex items-end justify-center pt-8 px-4 gap-2 h-64">
        {/* 2nd Place */}
        <PodiumBlock rank={2} user={topThree[1]} height="40%" delay={0.2} />
        {/* 1st Place */}
        <PodiumBlock rank={1} user={topThree[0]} height="60%" delay={0} />
        {/* 3rd Place */}
        <PodiumBlock rank={3} user={topThree[2]} height="30%" delay={0.4} />
      </div>

      {/* LIST */}
      <div className="space-y-2">
        <div className="flex justify-between items-center px-4 mb-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-emerald-100/30">
            Current Rankings
          </h3>
          <span className="text-[10px] font-bold text-emerald-400/60 uppercase">
            Updated Hourly
          </span>
        </div>

        {loading ? (
          <LeaderboardSkeleton />
        ) : (
          <AnimatePresence>
            {others.map((user, idx) => (
              <RankingRow
                key={user.id || user._id}
                rank={idx + 4}
                user={user}
                index={idx}
                isCurrentUser={currentUser?._id === (user.id || user._id)}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
