import React, { useState, useEffect } from 'react';
import axiosInstance from '../config/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/authcontext';
import { API_ENDPOINTS } from '../config/api';
import { 
  Trophy, 
  Medal, 
  Star, 
  TrendingUp,
  Users,
  Target,
  Zap,
  Crown,
  Award,
  ChevronUp,
  ChevronDown,
  Filter,
  Search,
  Calendar,
  MapPin,
  Activity
} from 'lucide-react';

function Gamification() {
  const { user, isAuthenticated } = useAuth();
  const [rankings, setRankings] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [timeRange, setTimeRange] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

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
          if (currentUser) {
            setUserRank(currentUser);
          }
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
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-orange-600" />;
    if (rank <= 10) return <Star className="w-5 h-5 text-purple-500" />;
    return <span className="text-gray-500 font-bold">#{rank}</span>;
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
    if (rank === 3) return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white';
    if (rank <= 10) return 'bg-gradient-to-r from-purple-400 to-purple-600 text-white';
    return 'bg-gray-100 text-gray-700';
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'bg-gradient-to-r from-green-500 to-emerald-500';
    if (percentage >= 50) return 'bg-gradient-to-r from-blue-500 to-cyan-500';
    if (percentage >= 30) return 'bg-gradient-to-r from-yellow-500 to-orange-500';
    return 'bg-gradient-to-r from-gray-400 to-gray-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-yellow-50 via-green-50 to-blue-50">
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="relative">
              <Trophy className="w-16 h-16 text-green-600 mx-auto animate-pulse" />
              <div className="absolute -top-2 -right-2">
                <Zap className="w-6 h-6 text-yellow-500 animate-ping" />
              </div>
            </div>
            <p className="mt-4 text-green-700 font-medium">Loading leaderboard...</p>
            <div className="mt-4 flex justify-center space-x-2">
              <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-yellow-50 via-green-50 to-blue-50">
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center mb-4">
              <Trophy className="w-12 h-12 text-yellow-500 mr-3" />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Leaderboard
              </h1>
              <Trophy className="w-12 h-12 text-yellow-500 ml-3 transform scale-x-[-1]" />
            </div>
            <p className="text-gray-600 text-lg">See how you rank among eco-warriors!</p>
            <div className="mt-4 flex justify-center items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                <span>{rankings.length} Participants</span>
              </div>
              <div className="flex items-center">
                <Activity className="w-4 h-4 mr-1" />
                <span>Last updated: Just now</span>
              </div>
            </div>
          </motion.div>

          {/* User Stats Card - Enhanced */}
          <AnimatePresence>
            {isAuthenticated && userRank && (
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className="bg-gradient-to-r from-green-600 via-green-500 to-emerald-500 text-white rounded-3xl shadow-2xl p-8 mb-8 transform hover:scale-[1.02] transition-all duration-300"
              >
                <div className="flex flex-col lg:flex-row items-center justify-between">
                  <div className="text-center lg:text-left mb-6 lg:mb-0">
                    <h2 className="text-3xl font-bold mb-2 flex items-center">
                      <Star className="w-8 h-8 mr-2 text-yellow-300" />
                      Your Ranking
                    </h2>
                    <p className="text-green-100 text-lg">Keep contributing to climb higher!</p>
                    <div className="mt-4 flex items-center space-x-4">
                      <div className={`px-4 py-2 rounded-full ${getRankBadge(userRank.rank)} font-bold`}>
                        Rank #{userRank.rank}
                      </div>
                      {userRank.rank <= rankings.length * 0.1 && (
                        <div className="flex items-center text-yellow-300">
                          <Trophy className="w-5 h-5 mr-1" />
                          <span className="font-semibold">Top 10%</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-8 text-center">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="bg-white/20 backdrop-blur-sm rounded-2xl p-4"
                    >
                      <div className="text-4xl font-bold">#{userRank.rank}</div>
                      <div className="text-green-100 text-sm mt-1">Rank</div>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="bg-white/20 backdrop-blur-sm rounded-2xl p-4"
                    >
                      <div className="text-4xl font-bold">{userRank.points}</div>
                      <div className="text-green-100 text-sm mt-1">Points</div>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="bg-white/20 backdrop-blur-sm rounded-2xl p-4"
                    >
                      <div className="text-4xl font-bold">{userRank.issuecount}</div>
                      <div className="text-green-100 text-sm mt-1">Issues</div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!isAuthenticated && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg mb-8"
            >
              <p className="text-yellow-800 flex items-center">
                <Star className="w-5 h-5 mr-2" />
                <span className="font-semibold">Login required!</span> Please login to see your ranking and compete with others.
              </p>
            </motion.div>
          )}

          {/* Filters and Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-8"
          >
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === 'all' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('top10')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === 'top10' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Top 10
                </button>
                <button
                  onClick={() => setFilter('top50')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === 'top50' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Top 50
                </button>
              </div>
            </div>
          </motion.div>

          {/* Leaderboard Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6">
              <h2 className="text-2xl font-bold flex items-center">
                <Trophy className="w-6 h-6 mr-2" />
                Top Contributors
              </h2>
            </div>
            
            {filteredRankings.length > 0 ? (
              <div className="p-6">
                <div className="space-y-3">
                  <AnimatePresence>
                    {filteredRankings.map((rank, index) => {
                      const isCurrentUser = user && rank._id === user._id;
                      const maxPoints = rankings[0]?.points || 1;
                      const percentage = (rank.points / maxPoints) * 100;
                      
                      return (
                        <motion.div
                          key={rank._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.02 }}
                          className={`relative overflow-hidden rounded-xl border-2 transition-all ${
                            isCurrentUser 
                              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-400 shadow-lg' 
                              : 'bg-gray-50 border-gray-200 hover:border-green-300 hover:shadow-md'
                          }`}
                        >
                          <div className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-md">
                                  {getRankIcon(rank.rank)}
                                </div>
                                <div>
                                  <h3 className={`font-bold text-lg flex items-center ${isCurrentUser ? 'text-green-700' : 'text-gray-800'}`}>
                                    {rank.username}
                                    {isCurrentUser && (
                                      <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full font-semibold">
                                        You
                                      </span>
                                    )}
                                  </h3>
                                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                                    <div className="flex items-center">
                                      <MapPin className="w-4 h-4 mr-1" />
                                      <span>Issues: {rank.issuecount}</span>
                                    </div>
                                    <div className="flex items-center">
                                      <Target className="w-4 h-4 mr-1" />
                                      <span>Rank: #{rank.rank}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-3xl font-bold text-green-600">{rank.points}</div>
                                <div className="text-xs text-gray-500">Points</div>
                                {index > 0 && rank.rank < rankings[index - 1]?.rank && (
                                  <div className="flex items-center text-green-500 text-xs mt-1">
                                    <ChevronUp className="w-3 h-3" />
                                    <span>Up {rankings[index - 1].rank - rank.rank}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="mt-3 w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(percentage, 100)}%` }}
                                transition={{ delay: 0.5 + index * 0.05, duration: 0.8 }}
                                className={`h-full rounded-full ${getProgressColor(percentage)}`}
                              />
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No rankings available yet. Be the first to contribute!</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Gamification;
