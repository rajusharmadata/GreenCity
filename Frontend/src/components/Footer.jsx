import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiZap,
  FiGithub,
  FiTwitter,
  FiLinkedin,
  FiArrowRight,
  FiTerminal,
  FiShield,
  FiActivity
} from 'react-icons/fi';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const links = {
    Ecosystem: [
      { label: 'Infrastructure Grid', href: '/eco-transport' },
      { label: 'Network Reports', href: '/report-issue' },
      { label: 'Impact Mandates', href: '/how-it-works' },
    ],
    Platform: [
      { label: 'About Node', href: '/about' },
      { label: 'Uplink Support', href: '/contact' },
      { label: 'Protocol Terms', href: '/terms' },
    ],
  };

  const socials = [
    { icon: FiTwitter, href: '#' },
    { icon: FiGithub, href: '#' },
    { icon: FiLinkedin, href: '#' }
  ];

  return (
    <footer className="relative bg-[#030d0a] border-t border-white/5 pt-32 pb-12 overflow-hidden">

      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/[0.02] to-transparent pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/[0.05] blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20 mb-24">

          {/* Brand Column */}
          <div className="lg:col-span-1 space-y-10">
            <Link to="/" className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center transition-all group-hover:bg-emerald-500/20 shadow-inner">
                <FiZap className="text-emerald-500 w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold tracking-tighter text-white leading-none" style={{ fontFamily: 'Outfit' }}>
                  Green<span className="text-emerald-500 italic">City.</span>
                </span>
                <span className="text-[9px] font-bold text-emerald-500/40 uppercase tracking-[0.4em] font-mono mt-1">
                  Urban Eco-Grid
                </span>
              </div>
            </Link>

            <p className="text-sm text-slate-500 leading-relaxed font-medium max-w-xs" style={{ fontFamily: 'Inter' }}>
              Building high-fidelity urban infrastructure for sustainable living through decentralized community action.
            </p>

            <div className="flex gap-4">
              {socials.map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:text-emerald-500 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all"
                >
                  <s.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(links).map(([heading, items]) => (
            <div key={heading}>
              <h4 className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-[0.4em] font-mono mb-10">
                {heading}
              </h4>
              <ul className="space-y-6">
                {items.map(item => (
                  <li key={item.label}>
                    <Link
                      to={item.href}
                      className="group flex items-center gap-3 text-sm font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-tight font-inter"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/20 group-hover:bg-emerald-500 transition-colors" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter / Terminal */}
          <div className="bio-card p-8 bg-emerald-500/[0.02] border-emerald-500/10 h-fit">
            <div className="flex items-center gap-3 mb-6">
              <FiTerminal className="text-emerald-500" />
              <h4 className="text-[10px] font-bold text-white uppercase tracking-widest font-mono">Intel Stream</h4>
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6" style={{ fontFamily: 'Inter' }}>
              Subscribe to localized impact telemetry and grid updates.
            </p>
            <div className="space-y-3">
              <input
                type="email"
                placeholder="citizen@address.eco"
                className="w-full bg-[#030d0a] border border-white/5 rounded-xl px-5 py-3 text-xs font-bold text-white placeholder:text-slate-700 focus:border-emerald-500/20 transition-all outline-none"
              />
              <button className="w-full py-3.5 rounded-xl bg-emerald-500 text-black font-black uppercase text-[10px] tracking-widest hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                Initialize Sync
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest font-mono">
            © {currentYear} GreenCity Operations. High-Fidelity Verified.
          </p>

          <div className="flex gap-10">
            {['Privacy Protocol', 'Network Terms'].map(label => (
              <a
                key={label}
                href="#"
                className="text-[10px] font-bold text-slate-600 hover:text-emerald-500 transition-colors uppercase tracking-widest font-mono"
              >
                {label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-emerald-500/5 border border-emerald-500/10">
            <FiActivity className="text-emerald-500 w-3 h-3 animate-pulse" />
            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest font-mono">
              System Nominal
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
