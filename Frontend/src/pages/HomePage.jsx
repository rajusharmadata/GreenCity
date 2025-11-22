import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Leaf,
  MapPin,
  Users,
  Award,
  ArrowRight,
  Star,
  TrendingUp,
  Shield,
  Zap,
  Globe,
  Heart,
  Recycle
} from 'lucide-react';
import { useAuth } from '../context/authcontext';
import { useNotification } from '../context/NotificationContext';
import { PageLoader, SkeletonLoader } from '../components/ui/LoadingSpinner';
import Header from '../components/Header';
import Introduction from '../components/Introduction';
import Aboutsection from '../components/Aboutsection';
import HowItWorksSection from '../components/howit';

const HomePage = () => {
  const { loading: authLoading, error: authError, clearError } = useAuth();
  const { success, error } = useNotification();
  const [currentStat, setCurrentStat] = useState(0);
  const [pageLoading, setPageLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  // Memoize stats to prevent unnecessary re-renders
  const stats = useMemo(() => [
    { icon: Users, label: 'Active Users', value: '10,000+', color: 'text-blue-600' },
    { icon: Leaf, label: 'CO₂ Saved', value: '500 tons', color: 'text-green-600' },
    { icon: MapPin, label: 'Green Routes', value: '250+', color: 'text-purple-600' },
    { icon: Award, label: 'Eco Points', value: '1M+', color: 'text-yellow-600' }
  ], []);

  // Memoize features data
  const features = useMemo(() => [
    {
      icon: Globe,
      title: 'Smart City Navigation',
      description: 'Navigate your city with eco-friendly routes and real-time environmental data.',
      color: 'from-blue-500 to-cyan-500',
      features: ['Real-time Data', 'Route Optimization', 'Environmental Impact']
    },
    {
      icon: TrendingUp,
      title: 'Eco Transport Tracking',
      description: 'Find and track sustainable transport options with AI-powered route optimization.',
      color: 'from-green-500 to-emerald-500',
      features: ['Route Planning', 'Carbon Tracking', 'Live Updates']
    },
    {
      icon: Award,
      title: 'Gamification System',
      description: 'Earn points, badges, and rewards for contributing to sustainable initiatives.',
      color: 'from-purple-500 to-indigo-500',
      features: ['Leaderboards', 'Achievements', 'Rewards']
    }
  ], []);

  // Handle auth errors with useCallback
  const handleAuthError = useCallback(() => {
    if (authError) {
      error(authError);
      clearError();
    }
  }, [authError, error, clearError]);

  // Check if we're on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle auth errors
  useEffect(() => {
    handleAuthError();
  }, [handleAuthError]);

  // Simulate page loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
      success('Welcome to GreenCity! 🌱');
    }, 1000);

    return () => clearTimeout(timer);
  }, [success]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Show page loader while loading
  if (pageLoading || authLoading) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 overflow-hidden">
      {/* <Header /> */}

      {/* Enhanced Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-emerald-300 to-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-40"
          />
          <motion.div
            animate={{
              x: [0, -100, 0],
              y: [0, 100, 0],
              scale: [1, 0.9, 1],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-r from-cyan-300 to-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-40"
          />
          <motion.div
            animate={{
              x: [50, -50, 50],
              y: [50, 50, -50],
              scale: [0.9, 1.1, 0.9],
            }}
            transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-20 left-1/2 w-80 h-80 bg-gradient-to-r from-blue-300 to-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30"
          />
        </div>

      <main>
        <section className="relative py-24 px-4 text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="max-w-6xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center px-4 py-2 bg-emerald-100 border border-emerald-200 rounded-full mb-6"
            >
              <Leaf className="w-4 h-4 text-emerald-600 mr-2" />
              <span className="text-emerald-700 text-sm font-medium">Sustainable Urban Living</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent mb-6 leading-tight"
            >
              GreenCity
              <span className="block text-3xl md:text-4xl text-gray-600 mt-4 font-normal">
                Transforming Urban Transport Together
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed"
            >
              Join the movement towards sustainable cities. Report environmental issues,
              discover eco-friendly transport options, and earn rewards while making a real impact.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link
                to="/register/user"
                className="group px-8 py-4 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-xl hover:shadow-2xl transition-all duration-300 font-semibold text-lg flex items-center space-x-2 transform hover:scale-105"
              >
                <Users className="w-5 h-5" />
                <span>Join as User</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/register/admin"
                className="group px-8 py-4 bg-white border-2 border-gray-200 text-gray-800 rounded-xl hover:border-blue-300 hover:shadow-xl transition-all duration-300 font-semibold text-lg flex items-center space-x-2 transform hover:scale-105"
              >
                <Shield className="w-5 h-5" />
                <span>Join as Organization</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            {/* Animated Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-white/20 shadow-lg"
                >
                  <stat.icon className={`w-6 h-6 ${stat.color} mb-2 mx-auto`} />
                  <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        <Introduction />
        <Aboutsection />
        <HowItWorksSection />

        {/* Enhanced Features Section */}
        <section className="py-20 px-4 relative z-10">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
                Powerful Features
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Everything you need to make your city more sustainable and connected
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: MapPin,
                  title: 'Smart Issue Reporting',
                  description: 'Report environmental and transport issues with photos, location data, and real-time tracking.',
                  color: 'from-red-500 to-pink-500',
                  features: ['Photo Upload', 'GPS Location', 'Real-time Status']
                },
                {
                  icon: TrendingUp,
                  title: 'Eco Transport Tracking',
                  description: 'Find and track sustainable transport options with AI-powered route optimization.',
                  color: 'from-green-500 to-emerald-500',
                  features: ['Route Planning', 'Carbon Tracking', 'Live Updates']
                },
                {
                  icon: Award,
                  title: 'Gamification System',
                  description: 'Earn points, badges, and rewards for contributing to sustainable initiatives.',
                  color: 'from-purple-500 to-indigo-500',
                  features: ['Leaderboards', 'Achievements', 'Rewards']
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  whileHover={{ y: -10 }}
                  className="group"
                >
                  <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
                    <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">{feature.title}</h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">{feature.description}</p>
                    <ul className="space-y-2">
                      {feature.features.map((item, idx) => (
                        <li key={idx} className="flex items-center text-sm text-gray-600">
                          <Zap className="w-4 h-4 text-yellow-500 mr-2" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced CTA Section */}
        <section className="py-20 px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="max-w-6xl mx-auto"
          >
            <div className="relative bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 rounded-3xl p-12 md:p-16 overflow-hidden">
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />
              </div>

              <div className="relative z-10 text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full mb-6"
                >
                  <Heart className="w-4 h-4 text-white mr-2" />
                  <span className="text-white text-sm font-medium">Join Our Community</span>
                </motion.div>

                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl md:text-5xl font-bold text-white mb-6"
                >
                  Ready to Make a Difference?
                </motion.h2>

                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-xl text-white/90 mb-10 max-w-2xl mx-auto"
                >
                  Join thousands of citizens and organizations working towards greener,
                  more sustainable cities. Every action counts.
                </motion.p>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                >
                  <Link
                    to="/eco-transport"
                    className="group px-8 py-4 bg-white text-emerald-600 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold text-lg flex items-center space-x-2 transform hover:scale-105 shadow-lg"
                  >
                    <Globe className="w-5 h-5" />
                    <span>Explore Transport</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/report-issue"
                    className="group px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl hover:bg-white hover:text-emerald-600 transition-all duration-300 font-semibold text-lg flex items-center space-x-2 transform hover:scale-105"
                  >
                    <Recycle className="w-5 h-5" />
                    <span>Report Issue</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>

                {/* Trust indicators */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-12 flex flex-wrap justify-center gap-8"
                >
                  {[
                    { icon: Users, text: '10K+ Active Users' },
                    { icon: Star, text: '4.9 Rating' },
                    { icon: Shield, text: 'Secure Platform' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center text-white/80">
                      <item.icon className="w-5 h-5 mr-2" />
                      <span className="text-sm">{item.text}</span>
                    </div>
                  ))}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
