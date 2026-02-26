import React from 'react';
import { motion } from 'framer-motion';
import { FiTarget, FiGlobe, FiLayers, FiShield, FiArrowRight, FiActivity } from 'react-icons/fi';
import { FaLeaf } from 'react-icons/fa';

/**
 * AboutPage Component
 * Redesigned for High-Fidelity GreenCity Redesign
 */
function AboutPage() {
  return (
    <div className="min-h-screen bg-[#030d0a] text-slate-200">

      {/* ─── HERO SECTION ─── */}
      <section className="relative pt-48 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent -z-10" />
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-emerald-500/10 blur-[150px] -z-10 animate-pulse" />

        <div className="container mx-auto max-w-7xl relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center gap-3 mb-8">
              <span className="w-12 h-[1px] bg-emerald-500/40" />
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-emerald-500/60 font-mono">
                The Narrative Grid — Node Identity
              </p>
              <span className="w-12 h-[1px] bg-emerald-500/40" />
            </div>

            <h1 className="text-7xl md:text-9xl font-bold tracking-tighter text-white mb-8 leading-none" style={{ fontFamily: 'Outfit' }}>
              Defining <br />
              <span className="text-emerald-500 italic text-6xl md:text-8xl">GreenCity.</span>
            </h1>

            <p className="text-xl text-slate-400 font-medium max-w-3xl mx-auto leading-relaxed" style={{ fontFamily: 'Inter' }}>
              An intelligent, decentralized infrastructure for sustainable urban growth.
              We are manufacturing a future where technology and ecology exist in high-fidelity harmony.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── CONTENT GRID ─── */}
      <section className="py-24 px-6 relative">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-32">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="flex items-center gap-4">
                <FiTarget className="text-emerald-500 w-8 h-8" />
                <h2 className="text-3xl font-bold text-white uppercase tracking-tight" style={{ fontFamily: 'Outfit' }}>The Mandate</h2>
              </div>
              <p className="text-lg text-slate-400 font-medium leading-relaxed" style={{ fontFamily: 'Inter' }}>
                Our mission is to foster a high-performance culture of sustainability by connecting people, ideas, and actionable vectors.
                Our goal is to reduce environmental friction through modern digital protocols.
              </p>
              <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 font-mono text-[10px] uppercase tracking-widest text-emerald-400 flex items-center gap-3">
                <FiShield className="w-4 h-4" />
                Infrastructure Integrity Verified — v2.0
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bio-card p-10 bg-emerald-500/5 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[60px]" />
              <div className="space-y-6 relative z-10">
                <h3 className="text-xl font-bold text-white uppercase tracking-tight" style={{ fontFamily: 'Outfit' }}>Operations Matrix</h3>
                <ul className="space-y-4">
                  {[
                    'Anomaly reporting & localization',
                    'Civic resolution tracking',
                    'Real-time network telemetry',
                    'Impact quotient merit system'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-400 font-mono uppercase tracking-wider">
                      <FiActivity className="text-emerald-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bio-card p-16 text-center border-emerald-500/10"
          >
            <div className="inline-flex p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 mb-8">
              <FiGlobe className="h-10 w-10 text-emerald-500" />
            </div>
            <h2 className="text-4xl font-bold text-white tracking-tighter mb-6" style={{ fontFamily: 'Outfit' }}>Critical Context</h2>
            <p className="text-lg text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed mb-10" style={{ fontFamily: 'Inter' }}>
              Urban centers generate over 70% of global carbon emissions. By deploying high-fidelity community interfaces,
              we can optimize resource conservation and manufacture truly sustainable nodes.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button className="px-10 py-5 bg-emerald-500 text-black font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-emerald-400 transition-all shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                Initialize Action
              </button>
              <button className="px-10 py-5 bg-white/5 border-2 border-white/5 text-white font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-white/10 transition-all font-mono">
                View Repository
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER INFO ─── */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="container mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
          <div className="space-y-4">
            <p className="text-[10px] font-black text-emerald-500/60 uppercase tracking-[0.4em] font-mono">Decentralized Power</p>
            <p className="text-sm text-slate-500 font-medium" style={{ fontFamily: 'Inter' }}>
              Built on a foundation of community data and radical transparency.
            </p>
          </div>
          <div className="space-y-4">
            <p className="text-[10px] font-black text-emerald-500/60 uppercase tracking-[0.4em] font-mono">Open Protocol</p>
            <p className="text-sm text-slate-500 font-medium" style={{ fontFamily: 'Inter' }}>
              Designed for scalability across global urban infrastructure patterns.
            </p>
          </div>
          <div className="space-y-4">
            <p className="text-[10px] font-black text-emerald-500/60 uppercase tracking-[0.4em] font-mono">Impact First</p>
            <p className="text-sm text-slate-500 font-medium" style={{ fontFamily: 'Inter' }}>
              Calculated metrics ensuring every citizen contributes to the grid.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AboutPage;
