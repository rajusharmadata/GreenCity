import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiSend,
  FiMessageSquare,
  FiClock,
  FiGlobe,
  FiActivity,
  FiZap,
  FiTarget,
  FiCheckCircle,
  FiRefreshCw
} from 'react-icons/fi';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

const contactMethods = [
  {
    icon: FiMail,
    title: 'Digital Uplink',
    description: 'Direct data transmission for all queries.',
    contact: 'sync@greencity.eco',
    link: 'mailto:sync@greencity.eco',
  },
  {
    icon: FiPhone,
    title: 'Voice Logic',
    description: 'Active frequency: Mon-Fri 09:00-18:00.',
    contact: '+1 (234) GRID-777',
    link: 'tel:+1234567890',
  },
  {
    icon: FiMapPin,
    title: 'Node Location',
    description: 'Central Sector Alpha, Eco City.',
    contact: '123 Green Corridor, Node 1',
    link: '#',
  },
];

const socialLinks = [
  { icon: FaFacebook, name: 'Facebook', href: '#' },
  { icon: FaTwitter, name: 'Twitter', href: '#' },
  { icon: FaInstagram, name: 'Instagram', href: '#' },
  { icon: FaLinkedin, name: 'LinkedIn', href: '#' },
];

function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate high-fidelity data ingress
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setIsSubmitted(false), 5000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#030d0a] text-slate-200">

      {/* ─── HERO SECTION ─── */}
      <section className="relative pt-48 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.03] to-teal-500/[0.03] -z-10" />
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-emerald-500/[0.05] blur-[150px] -z-10 animate-pulse" />

        <div className="container mx-auto max-w-7xl relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8">
              <FiZap className="h-4 w-4 text-emerald-400" />
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.4em] font-mono">Transmission Active</span>
            </div>
            <h1 className="text-7xl md:text-9xl font-bold tracking-tighter text-white mb-8 leading-none" style={{ fontFamily: 'Outfit' }}>
              Initialize <br />
              <span className="text-emerald-500 italic">Contact.</span>
            </h1>
            <p className="text-xl text-slate-400 font-medium max-w-3xl mx-auto leading-relaxed" style={{ fontFamily: 'Inter' }}>
              Establish a direct link with the GreenCity orchestrators.
              Whether you have technical queries or ecosystem suggestions, the grid is listening.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── CONTACT CHIPS ─── */}
      <section className="px-6 -mt-12 relative z-20">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactMethods.map((method, index) => {
              const Icon = method.icon;
              return (
                <motion.a
                  key={method.title}
                  href={method.link}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bio-card p-8 group hover:border-emerald-500/30 transition-all duration-500"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 group-hover:bg-emerald-500/10 transition-all shadow-inner">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white uppercase tracking-tight mb-2" style={{ fontFamily: 'Outfit' }}>{method.title}</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-4">{method.description}</p>
                  <p className="text-emerald-500 font-bold font-mono text-sm group-hover:text-emerald-400 transition-colors uppercase tracking-wider">{method.contact}</p>
                </motion.a>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── MAIN CONTENT ─── */}
      <section className="py-24 px-6 relative">
        <div className="container mx-auto max-w-7xl lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bio-card p-12 lg:p-16 border-white/5"
            >
              <div className="flex items-center gap-4 mb-10">
                <FiMessageSquare className="text-emerald-500 w-6 h-6" />
                <h2 className="text-3xl font-bold text-white uppercase tracking-tight" style={{ fontFamily: 'Outfit' }}>Data Ingress</h2>
              </div>

              {isSubmitted && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-10 p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-4"
                >
                  <FiCheckCircle className="h-6 w-6 text-emerald-400" />
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest font-mono">Telemetry received. Ingress successful.</p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono ml-1">Identity Designation</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full bg-white/[0.03] border-2 border-white/5 rounded-xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-emerald-500/20 transition-all font-inter"
                    placeholder="e.g. Citizen 01"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono ml-1">Encryption Endpoint (Email)</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-white/[0.03] border-2 border-white/5 rounded-xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-emerald-500/20 transition-all font-inter"
                    placeholder="user@grid.eco"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono ml-1">Subject Protocol</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full bg-white/[0.03] border-2 border-white/5 rounded-xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-emerald-500/20 transition-all font-inter"
                    placeholder="Initialize query..."
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono ml-1">Payload Content</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full bg-white/[0.03] border-2 border-white/5 rounded-xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-emerald-500/20 transition-all font-inter resize-none"
                    placeholder="Describe the inquiry telemetry..."
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full group flex items-center justify-center gap-4 py-5 rounded-2xl bg-emerald-500 text-black font-black uppercase text-xs tracking-widest disabled:opacity-50 hover:bg-emerald-400 transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                >
                  {isSubmitting ? (
                    <FiRefreshCw className="h-5 w-5 animate-spin" />
                  ) : (
                    <FiSend className="h-5 w-5 group-hover:scale-125 transition-transform" />
                  )}
                  Transmit Payload
                </motion.button>
              </form>
            </motion.div>

            {/* Side Info */}
            <div className="space-y-8">
              {/* Hours */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bio-card p-10 border-white/5"
              >
                <div className="flex items-center gap-4 mb-8">
                  <FiClock className="text-emerald-500 w-5 h-5" />
                  <h3 className="text-xl font-bold text-white uppercase tracking-tight" style={{ fontFamily: 'Outfit' }}>Cycle Intervals</h3>
                </div>
                <div className="space-y-6">
                  {[
                    { label: 'Workday Cycle', value: '09:00 - 18:00' },
                    { label: 'Weekend Shift', value: '10:00 - 14:00' },
                    { label: 'Network Idle', value: 'Sunday (Offline)' }
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-4 border-b border-white/5 last:border-0 font-mono">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.label}</span>
                      <span className="text-xs font-black text-white uppercase tracking-tighter">{item.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Location Map Placeholder */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bio-card p-10 border-white/5 group"
              >
                <div className="flex items-center gap-4 mb-8">
                  <FiTarget className="text-emerald-500 w-5 h-5" />
                  <h3 className="text-xl font-bold text-white uppercase tracking-tight" style={{ fontFamily: 'Outfit' }}>Node Telemetry</h3>
                </div>
                <div className="aspect-video relative rounded-2xl overflow-hidden border-2 border-white/5 group-hover:border-emerald-500/20 transition-all duration-700">
                  <div className="absolute inset-0 bg-emerald-500/5 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-center">
                      <FiActivity className="h-10 w-10 text-emerald-500/60 mx-auto mb-4 animate-pulse" />
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono">Scanning Grid Coordinates...</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Socials */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bio-card p-10 border-white/5"
              >
                <div className="flex items-center gap-4 mb-8">
                  <FiGlobe className="text-emerald-500 w-5 h-5" />
                  <h3 className="text-xl font-bold text-white uppercase tracking-tight" style={{ fontFamily: 'Outfit' }}>Global Presense</h3>
                </div>
                <div className="flex flex-wrap gap-4">
                  {socialLinks.map((social) => {
                    const Icon = social.icon;
                    return (
                      <a
                        key={social.name}
                        href={social.href}
                        className="p-4 rounded-xl bg-white/[0.03] border border-white/5 text-slate-500 hover:border-emerald-500/30 hover:text-emerald-500 hover:bg-emerald-500/5 transition-all text-xl"
                      >
                        <Icon />
                      </a>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ContactPage;
