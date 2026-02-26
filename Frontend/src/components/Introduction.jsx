import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Leaf, Globe, Users, Zap, ArrowRight } from 'lucide-react';

const features = [
  { icon: Leaf, label: 'Eco-Friendly', desc: 'Carbon-neutral by design' },
  { icon: Globe, label: 'Global Impact', desc: 'World-scale thinking' },
  { icon: Users, label: 'Community', desc: 'Citizen-first approach' },
  { icon: Zap, label: 'Smart Data', desc: 'AI-powered analytics' },
];

const ITEM = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } },
};

function IntroSection() {
  return (
    <section
      className="relative py-28 px-4 overflow-hidden"
      style={{ background: '#0a1410' }}
    >
      {/* Diagonal top cut */}
      <div
        className="absolute top-0 inset-x-0 h-16 pointer-events-none"
        style={{
          background: '#080d0a',
          clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 0)',
        }}
      />
      {/* Diagonal bottom cut */}
      <div
        className="absolute bottom-0 inset-x-0 h-16 pointer-events-none"
        style={{
          background: '#080d0a',
          clipPath: 'polygon(0 100%, 100% 0, 100% 100%)',
        }}
      />

      {/* Background accent */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(57,255,128,0.04) 0%, transparent 70%)' }} />

      {/* Hex dot texture */}
      <div className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(57,255,128,0.06) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Two-column editorial split */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">

          {/* Left: big heading */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          >
            <motion.p variants={ITEM} className="mono-label mb-4" style={{ color: 'rgba(57,255,128,0.6)', fontSize: '0.7rem' }}>
              01 — Platform Introduction
            </motion.p>
            <motion.h2
              variants={ITEM}
              className="text-5xl md:text-6xl font-extrabold leading-none mb-6"
              style={{ fontFamily: 'Syne', color: '#e8f5ee', letterSpacing: '-0.03em' }}
            >
              Welcome to{' '}
              <br />
              <span style={{ color: '#39ff80' }}>Green City</span>
            </motion.h2>

            {/* Decorative line */}
            <motion.div
              variants={ITEM}
              className="w-20 h-px mb-8"
              style={{ background: 'linear-gradient(to right, #39ff80, transparent)' }}
            />

            <motion.div variants={ITEM}>
              <Link
                to="/eco-transport"
                className="btn-neon inline-flex items-center gap-3 px-8 py-3.5 rounded-full text-sm"
              >
                Explore Platform
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Right: description + feature tags */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
            className="space-y-8"
          >
            <p
              className="text-base leading-relaxed"
              style={{ fontFamily: 'DM Mono', color: 'rgba(230,245,236,0.5)', lineHeight: '2' }}
            >
              Transform your urban lifestyle with our platform connecting you to
              eco-friendly initiatives, sustainable transport corridors, and
              green community projects that make a measurable difference.
            </p>

            <div className="flex flex-wrap gap-3">
              {['Eco-Friendly', 'AI-Powered', 'Citizen-First', 'Real-Time'].map(tag => (
                <span
                  key={tag}
                  className="px-4 py-1.5 rounded-full text-xs"
                  style={{
                    fontFamily: 'DM Mono',
                    background: 'rgba(57,255,128,0.05)',
                    color: 'rgba(57,255,128,0.65)',
                    border: '1px solid rgba(57,255,128,0.12)',
                    letterSpacing: '0.08em',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Feature icon grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map((feat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
              className="bio-card p-6 flex flex-col items-start gap-4 group"
            >
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                style={{
                  background: 'rgba(57,255,128,0.07)',
                  border: '1px solid rgba(57,255,128,0.12)',
                }}
              >
                <feat.icon className="w-5 h-5" style={{ color: '#39ff80' }} />
              </div>
              <div>
                <h3
                  className="text-sm font-bold mb-1"
                  style={{ fontFamily: 'Syne', color: '#e8f5ee' }}
                >
                  {feat.label}
                </h3>
                <p className="text-xs" style={{ fontFamily: 'DM Mono', color: 'rgba(230,245,236,0.4)' }}>
                  {feat.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default IntroSection;