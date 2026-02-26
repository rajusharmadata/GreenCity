import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Leaf, Globe, Award, ArrowRight, Users, Target, Zap } from 'lucide-react';

const steps = [
  {
    icon: CheckCircle,
    num: '01',
    title: 'Sign Up',
    description: 'Create your account as a user or organisation admin in under 2 minutes.',
    accentColor: '#39ff80',
  },
  {
    icon: Leaf,
    num: '02',
    title: 'Explore Projects',
    description: 'Discover eco-friendly initiatives, sustainable transport, and live city intel.',
    accentColor: '#c96a3a',
  },
  {
    icon: Globe,
    num: '03',
    title: 'Contribute',
    description: 'Report issues, log trips, and participate in green activities to track your impact.',
    accentColor: '#39ff80',
  },
  {
    icon: Award,
    num: '04',
    title: 'Get Rewarded',
    description: 'Earn eco-points and recognised rankings for verified sustainable contributions.',
    accentColor: '#c96a3a',
  },
];

const benefits = [
  { icon: Users, label: 'Join 10,000+ eco-warriors' },
  { icon: Target, label: 'Track your carbon footprint' },
  { icon: Zap, label: 'Smart transport solutions' },
];

function HowItWorksSection() {
  return (
    <section
      className="relative py-28 px-4 overflow-hidden"
      style={{ background: '#0a1410' }}
    >
      {/* Diagonal top divider */}
      <div
        className="absolute top-0 inset-x-0 h-16 pointer-events-none"
        style={{
          background: '#080d0a',
          clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 100%)',
        }}
      />

      {/* Ambient glows */}
      <div className="absolute right-1/4 top-1/3 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(57,255,128,0.04) 0%, transparent 70%)' }} />
      <div className="absolute left-0 bottom-0 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(201,106,58,0.04) 0%, transparent 70%)' }} />

      {/* Hex dot texture */}
      <div className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(57,255,128,0.06) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <p className="mono-label mb-4" style={{ color: 'rgba(57,255,128,0.6)', fontSize: '0.7rem' }}>
            03 — The Process
          </p>
          <h2
            className="text-5xl md:text-7xl font-extrabold leading-none"
            style={{ fontFamily: 'Syne', color: '#e8f5ee', letterSpacing: '-0.03em' }}
          >
            How it{' '}
            <span style={{ color: '#39ff80', textShadow: '0 0 40px rgba(57,255,128,0.2)' }}>
              Works.
            </span>
          </h2>
          <p
            className="text-sm mt-6 max-w-lg leading-relaxed"
            style={{ fontFamily: 'DM Mono', color: 'rgba(230,245,236,0.45)', lineHeight: '2' }}
          >
            Four modular steps to transform your urban footprint and gain verified recognition.
          </p>
        </motion.div>

        {/* Steps — vertical timeline on mobile, 4-col on desktop */}
        <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {/* Horizontal connector line (desktop) */}
          <div
            className="hidden lg:block absolute top-14 left-[12.5%] right-[12.5%] h-px z-0"
            style={{ background: 'linear-gradient(to right, rgba(57,255,128,0.08), rgba(57,255,128,0.25), rgba(57,255,128,0.08))' }}
          />

          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
              className="relative z-10"
            >
              <div
                className="bio-card p-8 h-full group"
                style={{
                  border: `1px solid ${step.accentColor}18`,
                }}
              >
                {/* Neon node dot above card */}
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-125"
                  style={{
                    background: `${step.accentColor}15`,
                    border: `1.5px solid ${step.accentColor}50`,
                    boxShadow: `0 0 0 0 ${step.accentColor}`,
                  }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = `0 0 16px ${step.accentColor}60`}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = `0 0 0 0 ${step.accentColor}`}
                >
                  <step.icon className="w-3.5 h-3.5" style={{ color: step.accentColor }} />
                </div>

                {/* Watermark number */}
                <div
                  className="text-6xl font-extrabold leading-none mb-4 select-none"
                  style={{
                    fontFamily: 'DM Mono',
                    color: `${step.accentColor}08`,
                    letterSpacing: '-0.04em',
                  }}
                >
                  {step.num}
                </div>

                <h3
                  className="text-base font-bold mb-3"
                  style={{ fontFamily: 'Syne', color: '#e8f5ee' }}
                >
                  {step.title}
                </h3>
                <p
                  className="text-xs leading-relaxed"
                  style={{ fontFamily: 'DM Mono', color: 'rgba(230,245,236,0.45)', lineHeight: '1.9' }}
                >
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Benefits panel */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="rounded-3xl p-10 md:p-14 overflow-hidden relative"
          style={{
            background: '#080d0a',
            border: '1px solid rgba(57,255,128,0.1)',
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {benefits.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4 group"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110"
                  style={{ background: 'rgba(57,255,128,0.07)', border: '1px solid rgba(57,255,128,0.15)' }}
                >
                  <b.icon className="w-4 h-4" style={{ color: '#39ff80' }} />
                </div>
                <p className="text-sm" style={{ fontFamily: 'DM Mono', color: 'rgba(230,245,236,0.55)' }}>
                  {b.label}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Divider */}
          <div className="h-px mb-10" style={{ background: 'rgba(57,255,128,0.07)' }} />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h3
                className="text-2xl font-extrabold mb-1"
                style={{ fontFamily: 'Syne', color: '#e8f5ee' }}
              >
                Why Join <span style={{ color: '#39ff80' }}>GreenCity?</span>
              </h3>
              <p className="text-xs" style={{ fontFamily: 'DM Mono', color: 'rgba(230,245,236,0.4)' }}>
                Documented impact. Open source. Carbon neutral.
              </p>
            </div>
            <Link
              to="/register/user"
              className="btn-neon inline-flex items-center gap-3 px-8 py-3.5 rounded-full text-sm flex-shrink-0"
            >
              Start Your Journey
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default HowItWorksSection;