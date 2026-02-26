import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Target, Users, Award, CheckCircle, Leaf, Globe, ArrowRight } from 'lucide-react';

const ITEM = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } },
};

const missions = [
  {
    icon: Target,
    title: 'Our Mission',
    description: 'Promote sustainability and environmental awareness through community-driven urban initiatives.',
    accentColor: '#39ff80',
  },
  {
    icon: Users,
    title: 'Community Driven',
    description: 'Connect citizens, organisations, and local governments for collaborative measurable impact.',
    accentColor: '#c96a3a',
  },
  {
    icon: Award,
    title: 'Recognition',
    description: 'Celebrate and reward contributions to sustainable urban development globally.',
    accentColor: '#39ff80',
    featured: true,
  },
];

const steps = [
  { icon: CheckCircle, label: 'Sign up as user or admin', num: '01' },
  { icon: Leaf, label: 'Explore eco-friendly projects', num: '02' },
  { icon: Globe, label: 'Contribute and track impact', num: '03' },
  { icon: Award, label: 'Earn rewards and recognition', num: '04' },
];

function AboutSection() {
  return (
    <section
      className="relative py-28 px-4 overflow-hidden"
      style={{ background: '#080d0a' }}
    >
      {/* Ambient glow */}
      <div className="absolute left-0 top-1/3 w-96 h-96 pointer-events-none rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(201,106,58,0.05) 0%, transparent 70%)' }} />
      <div className="absolute right-0 bottom-1/4 w-64 h-64 pointer-events-none rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(57,255,128,0.04) 0%, transparent 70%)' }} />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Section header */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          className="mb-20"
        >
          <motion.p variants={ITEM} className="mono-label mb-4" style={{ color: 'rgba(57,255,128,0.6)', fontSize: '0.7rem' }}>
            02 — About GreenCity
          </motion.p>
          <motion.h2
            variants={ITEM}
            className="text-5xl md:text-7xl font-extrabold leading-none"
            style={{ fontFamily: 'Syne', color: '#e8f5ee', letterSpacing: '-0.03em' }}
          >
            Building Sustainable{' '}
            <span style={{ color: 'var(--terra)', textShadow: '0 0 30px rgba(201,106,58,0.25)' }}>
              Communities.
            </span>
          </motion.h2>
          <motion.div
            variants={ITEM}
            className="w-24 h-px mt-8"
            style={{ background: 'linear-gradient(to right, var(--terra), transparent)' }}
          />
        </motion.div>

        {/* Mission cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
          {missions.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
              className="bio-card overflow-hidden group"
              style={m.featured ? {
                border: '1px solid rgba(57,255,128,0.2)',
                background: 'rgba(57,255,128,0.025)',
              } : {}}
            >
              {/* Top accent line */}
              <div
                className="h-0.5 w-full"
                style={{ background: m.accentColor, opacity: 0.6, boxShadow: `0 0 12px ${m.accentColor}44` }}
              />

              <div className="p-8">
                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110"
                  style={{
                    background: `${m.accentColor}10`,
                    border: `1px solid ${m.accentColor}20`,
                  }}
                >
                  <m.icon className="w-5 h-5" style={{ color: m.accentColor }} />
                </div>

                <h3
                  className="text-lg font-bold mb-3"
                  style={{ fontFamily: 'Syne', color: '#e8f5ee' }}
                >
                  {m.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ fontFamily: 'DM Mono', color: 'rgba(230,245,236,0.45)', lineHeight: '1.9' }}
                >
                  {m.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* How it works — numbered timeline row */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="rounded-3xl p-10 md:p-14 overflow-hidden relative"
          style={{
            background: '#0a1410',
            border: '1px solid rgba(57,255,128,0.1)',
          }}
        >
          {/* Subtle grid bg */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(57,255,128,0.06) 1px, transparent 0)',
              backgroundSize: '20px 20px',
            }}
          />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-10">
              <p className="mono-label" style={{ color: 'rgba(57,255,128,0.6)', fontSize: '0.68rem' }}>
                Get Started in 4 Steps
              </p>
            </div>

            <h3
              className="text-3xl md:text-4xl font-extrabold mb-12"
              style={{ fontFamily: 'Syne', color: '#e8f5ee', letterSpacing: '-0.02em' }}
            >
              From zero to impact,{' '}
              <span style={{ color: '#39ff80' }}>fast.</span>
            </h3>

            {/* Steps grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {steps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="relative group"
                >
                  {/* Connector line (not last) */}
                  {i < steps.length - 1 && (
                    <div
                      className="hidden lg:block absolute top-5 left-full w-full h-px -translate-y-1/2 z-0"
                      style={{ background: 'linear-gradient(to right, rgba(57,255,128,0.3), transparent)', width: '100%' }}
                    />
                  )}

                  <div className="relative z-10">
                    {/* Number */}
                    <div
                      className="text-5xl font-extrabold leading-none mb-4 select-none"
                      style={{
                        fontFamily: 'DM Mono',
                        color: 'rgba(57,255,128,0.08)',
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {step.num}
                    </div>

                    {/* Icon node */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
                      style={{
                        background: 'rgba(57,255,128,0.07)',
                        border: '1px solid rgba(57,255,128,0.2)',
                        boxShadow: '0 0 0 0 rgba(57,255,128,0)',
                      }}
                      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 16px rgba(57,255,128,0.25)'}
                      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 0 0 rgba(57,255,128,0)'}
                    >
                      <step.icon className="w-4 h-4" style={{ color: '#39ff80' }} />
                    </div>

                    <p
                      className="text-sm leading-snug"
                      style={{ fontFamily: 'DM Mono', color: 'rgba(230,245,236,0.55)' }}
                    >
                      {step.label}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <Link
              to="/register/user"
              className="btn-neon inline-flex items-center gap-3 px-8 py-3.5 rounded-full text-sm"
            >
              Join GreenCity Today
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default AboutSection;
