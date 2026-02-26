import React from 'react';
import { motion } from 'framer-motion';
import {
  FiCamera,
  FiSend,
  FiEye,
  FiAward,
  FiBarChart2,
  FiUsers,
  FiArrowRight,
  FiZap,
  FiTarget,
  FiTrendingUp,
  FiCheckCircle,
  FiActivity
} from 'react-icons/fi';
import { FaLeaf } from 'react-icons/fa';

const steps = [
  {
    number: 1,
    icon: FiCamera,
    title: 'Detect Anomaly',
    description: 'Found a garbage dump, pothole, or broken light? Capture the environmental anomaly instantly with your device.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    number: 2,
    icon: FiSend,
    title: 'Localized Uplink',
    description: 'Submit your report with precise telemetry and metadata. It only takes seconds to synchronize with the grid.',
    color: 'from-emerald-500 to-emerald-600',
  },
  {
    number: 3,
    icon: FiEye,
    title: 'Monitor Resolution',
    description: 'Track the status of your report in real-time. Watch as district authorities deploy countermeasures to resolve the issue.',
    color: 'from-purple-500 to-purple-600',
  },
  {
    number: 4,
    icon: FiAward,
    title: 'Earn Impact Merit',
    description: 'Every valid report increases your collective merit score. Get rewarded with impact points for active citizenship.',
    color: 'from-amber-500 to-amber-600',
  },
  {
    number: 5,
    icon: FiBarChart2,
    title: 'System Analytics',
    description: 'Analyze how your sector is improving with high-fidelity telemetry, heatmaps, and progress tracking.',
    color: 'from-teal-500 to-teal-600',
  },
  {
    number: 6,
    icon: FiUsers,
    title: 'Collaborative Sync',
    description: 'Assemble with other citizens, participate in green mandates, and manufacture a cleaner future together.',
    color: 'from-rose-500 to-rose-600',
  },
];

const features = [
  {
    icon: FiZap,
    title: 'Instant Ingress',
    description: 'Report issues in seconds with our optimized data pipeline',
    color: 'text-amber-400',
  },
  {
    icon: FiTarget,
    title: 'GPS Telemetry',
    description: 'Pinpoint exact coordinates with multi-satellite integration',
    color: 'text-blue-400',
  },
  {
    icon: FiTrendingUp,
    title: 'Real-time Sync',
    description: 'Live status updates directly from the resolution teams',
    color: 'text-emerald-400',
  },
  {
    icon: FiCheckCircle,
    title: 'Verified Closure',
    description: 'Every resolution is cryptographically verified by the grid',
    color: 'text-emerald-500',
  },
];

function HowItWorks() {
  return (
    <div className="min-h-screen bg-[#030d0a] text-slate-200">

      {/* ─── HERO SECTION ─── */}
      <section className="relative pt-48 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/5 blur-[120px] pointer-events-none" />

        <div className="container mx-auto max-w-7xl relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8">
              <FiActivity className="h-3 w-3 text-emerald-400" />
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.2em] font-mono">System Protocol v4.0</span>
            </div>

            <h1 className="text-6xl md:text-9xl font-bold tracking-tighter text-white mb-8 leading-none" style={{ fontFamily: 'Outfit' }}>
              How We <br />
              <span className="text-emerald-500 italic">Interface.</span>
            </h1>

            <p className="text-xl text-slate-400 font-medium max-w-3xl mx-auto leading-relaxed" style={{ fontFamily: 'Inter' }}>
              The GreenCity ecosystem is built on a foundation of high-fidelity community interaction.
              Our protocol simplifies civic action into a seamless digital journey.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── STEPS SECTION ─── */}
      <section className="py-24 px-6 relative">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group relative"
                >
                  <div className="bio-card p-10 h-full flex flex-col items-start hover:border-emerald-500/40 transition-all duration-500">
                    {/* Step Number Badge */}
                    <div className="absolute top-6 right-8 text-4xl font-black text-white/5 font-mono select-none">
                      0{step.number}
                    </div>

                    {/* Icon */}
                    <div className={`mb-8 w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/40 transition-all duration-500 shadow-inner`}>
                      <Icon className="h-6 w-6 text-emerald-400" />
                    </div>

                    {/* Content */}
                    <h3 className="text-2xl font-bold text-white mb-4 uppercase tracking-tight" style={{ fontFamily: 'Outfit' }}>
                      {step.title}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed font-medium mb-8" style={{ fontFamily: 'Inter' }}>
                      {step.description}
                    </p>

                    <div className="mt-auto flex items-center gap-2 text-emerald-500 text-[10px] font-bold uppercase tracking-widest font-mono opacity-40 group-hover:opacity-100 transition-opacity">
                      Protocol Active <FiArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── FEATURES SECTION ─── */}
      <section className="py-32 px-6 bg-white/[0.01] border-y border-white/5">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tighter mb-6" style={{ fontFamily: 'Outfit' }}>
              Why The <span className="text-emerald-500 italic">Grid?</span>
            </h2>
            <p className="text-slate-400 font-medium max-w-2xl mx-auto" style={{ fontFamily: 'Inter' }}>
              Built for performance, scalability, and radical transparency.
              The infrastructure of future-ready urban management.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center group"
                >
                  <div className="inline-flex p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 mb-6 group-hover:border-emerald-500/30 transition-all duration-500">
                    <Icon className={`h-8 w-8 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3 uppercase tracking-tight" style={{ fontFamily: 'Outfit' }}>
                    {feature.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed font-mono uppercase tracking-wider">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── CTA SECTION ─── */}
      <section className="py-32 px-6 overflow-hidden relative">
        <div className="absolute inset-0 bg-emerald-500/[0.02] -z-10" />
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bio-card p-16 text-center relative overflow-hidden"
          >
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-500/10 blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-teal-500/10 blur-[100px] pointer-events-none" />

            <FaLeaf className="w-12 h-12 text-emerald-500 mx-auto mb-8 opacity-50" />
            <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tighter mb-8 leading-tight" style={{ fontFamily: 'Outfit' }}>
              Ready to Expand <br />
              the <span className="text-emerald-500 italic">Collective?</span>
            </h2>
            <p className="text-lg text-slate-400 mb-12 max-w-2xl mx-auto" style={{ fontFamily: 'Inter' }}>
              Thousands are already syncing their efforts with the GreenCity network.
              Initialize your profile today.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <motion.a
                href="/register/user"
                className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-emerald-500 text-black font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-emerald-400 transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)]"
              >
                Join Network
                <FiArrowRight className="h-4 w-4" />
              </motion.a>
              <motion.a
                href="/report-issue"
                className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-white/5 border-2 border-white/5 text-white font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-white/10 hover:text-white transition-all font-mono"
              >
                Localize Issue
                <FiTarget className="h-4 w-4" />
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default HowItWorks;
