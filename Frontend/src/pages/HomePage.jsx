import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowRight, FiUsers, FiShield, FiMapPin, FiTrendingUp, FiAward,
  FiZap, FiGlobe, FiLeaf, FiCheckCircle
} from 'react-icons/fi';
import { HiOutlineLightBulb } from 'react-icons/hi';
import { useAuth } from '../features/auth/context/authcontext';
import { useNotification } from '../context/NotificationContext';
import { PageLoader } from '../components/ui/LoadingSpinner';
import Introduction from '../components/Introduction';
import Aboutsection from '../components/Aboutsection';
import HowItWorksSection from '../components/howit';

const STAGGER = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } } },
  item: { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } } },
};

const HomePage = () => {
  const { loading: authLoading, error: authError, clearError } = useAuth();
  const { success, error } = useNotification();
  const [pageLoading, setPageLoading] = useState(true);

  const stats = useMemo(() => [
    { label: 'Active Users', value: '10,000+', sublabel: 'Citizens' },
    { label: 'CO₂ Saved', value: '500 T', sublabel: 'Tonnes' },
    { label: 'Green Routes', value: '250+', sublabel: 'Corridors' },
    { label: 'Eco Points', value: '1M+', sublabel: 'Distributed' },
  ], []);

  const handleAuthError = useCallback(() => {
    if (authError) { error(authError); clearError(); }
  }, [authError, error, clearError]);

  useEffect(() => { handleAuthError(); }, [handleAuthError]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
      success('Welcome back to the Grid 🌿');
    }, 1000);
    return () => clearTimeout(timer);
  }, [success]);

  if (pageLoading || authLoading) return <PageLoader />;

  return (
    <div className="min-h-screen bg-[#030d0a] text-slate-200 selection:bg-emerald-500/30">

      {/* ─── HERO ─── */}
      <section className="relative min-h-[95vh] flex flex-col justify-center overflow-hidden pt-20">
        {/* Animated Background Gradients */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div variants={STAGGER.container} initial="hidden" animate="show" className="max-w-4xl">

            {/* Tagline */}
            <motion.div variants={STAGGER.item} className="flex items-center gap-3 mb-8">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold tracking-widest uppercase font-mono">
                System Active — v2.4.0
              </span>
              <div className="h-[1px] w-12 bg-emerald-500/20" />
            </motion.div>

            {/* Main Title */}
            <motion.h1
              variants={STAGGER.item}
              className="text-6xl md:text-8xl lg:text-9xl font-bold leading-[0.9] tracking-tighter mb-8"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Future-Proofing
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500">
                Urban Habitats.
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={STAGGER.item}
              className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12 leading-relaxed"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Join a high-fidelity civic infrastructure designed for modular sustainability.
              Track impact, optimize routes, and earn rewards within
              a gamified urban ecosystem.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={STAGGER.item} className="flex flex-wrap gap-5 mb-20">
              <Link
                to="/register/user"
                className="group relative px-8 py-4 bg-emerald-500 text-black font-bold rounded-2xl transition-all hover:bg-emerald-400 hover:scale-105 hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] flex items-center gap-3"
              >
                <FiUsers className="w-5 h-5" />
                Join the Citizenry
                <FiArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/about"
                className="px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl backdrop-blur-md transition-all hover:bg-white/10 flex items-center gap-3"
              >
                <FiShield className="w-5 h-5" />
                Infrastructure Overview
              </Link>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              variants={STAGGER.item}
              className="grid grid-cols-2 md:grid-cols-4 gap-6"
            >
              {stats.map((stat, i) => (
                <div key={i} className="group cursor-default">
                  <div className="text-3xl font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors" style={{ fontFamily: 'Outfit' }}>
                    {stat.value}
                  </div>
                  <div className="text-[10px] font-bold tracking-widest uppercase text-slate-500 font-mono">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── MODULAR SECTIONS ─── */}
      <div className="relative z-10 border-t border-white/5">
        <Introduction />
      </div>

      <div className="bg-[#050f0c]">
        <Aboutsection />
      </div>

      <HowItWorksSection />

      {/* ─── FEATURES ─── */}
      <section className="py-32 px-6 lg:px-8 bg-[#030d0a]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-4 mb-6"
            >
              <div className="h-[1px] w-8 bg-emerald-500/40" />
              <span className="text-emerald-500 text-xs font-bold tracking-[0.3em] uppercase">Core Protocols</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tighter"
              style={{ fontFamily: 'Outfit' }}
            >
              Architecting <br /> <span className="text-emerald-500">Modular Sustainability.</span>
            </motion.h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: FiMapPin,
                title: 'Impact Logging',
                desc: 'Precision environmental reporting with automated GPS triangulation and metadata verification.',
                color: 'emerald'
              },
              {
                icon: FiTrendingUp,
                title: 'Neural Routes',
                desc: 'Optimize urban movement using real-time carbon data and eco-friendly transit corridors.',
                color: 'blue'
              },
              {
                icon: FiAward,
                title: 'Civic Merit',
                desc: 'Tokenized rewards engine that translates sustainable actions into tangible community status.',
                color: 'purple'
              }
            ].map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bio-card group p-10 bg-white/[0.02]"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-black transition-all duration-500 shadow-lg group-hover:shadow-emerald-500/20`}>
                  <feat.icon className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: 'Outfit' }}>{feat.title}</h3>
                <p className="text-slate-400 leading-relaxed mb-6">{feat.desc}</p>
                <div className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500/60 font-mono">Protocol Active</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="py-32 px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto rounded-[3rem] overflow-hidden relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-teal-800 opacity-90 transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay opacity-30" />

          <div className="relative z-10 px-8 py-20 md:p-24 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/20 backdrop-blur-md border border-white/10 mb-10"
            >
              <FiZap className="w-4 h-4 text-emerald-300" />
              <span className="text-white text-[10px] font-bold tracking-widest uppercase font-mono">Initialization Ready</span>
            </motion.div>

            <h2 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-10 tracking-tighter" style={{ fontFamily: 'Outfit' }}>
              Building Tomorrow's <br className="hidden md:block" /> Grid. Today.
            </h2>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
              <Link
                to="/eco-transport"
                className="w-full sm:w-auto px-10 py-5 bg-white text-black font-bold rounded-2xl transition-all hover:scale-105 hover:shadow-2xl flex items-center justify-center gap-3"
              >
                Launch Protocol
                <FiArrowRight />
              </Link>
              <Link
                to="/how-it-works"
                className="w-full sm:w-auto px-10 py-5 bg-black/30 backdrop-blur-xl border border-white/20 text-white font-bold rounded-2xl transition-all hover:bg-black/50 flex items-center justify-center gap-3"
              >
                System Documentation
                <HiOutlineLightBulb className="w-5 h-5 text-emerald-400" />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default HomePage;
