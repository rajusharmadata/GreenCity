import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FiHome,
  FiZap,
  FiInfo,
  FiMail,
  FiShield,
  FiGrid,
  FiLogOut,
  FiUser,
  FiSettings,
  FiAward,
  FiPieChart,
  FiActivity,
  FiMenu,
  FiX
} from 'react-icons/fi';
import { useAuth } from '../features/auth/context/authcontext';

const staticLinks = [
  { label: 'Infrastructure', href: '/', icon: FiHome },
  { label: 'Eco-Grid', href: '/eco-transport', icon: FiZap },
  { label: 'Protocols', href: '/how-it-works', icon: FiInfo },
  { label: 'Terminal', href: '/contact', icon: FiMail },
];

const contextualLinks = [
  { label: 'Report Issue', href: '/report-issue', roles: ['user', 'admin'], icon: FiShield },
  { label: 'Impact', href: '/gamification', roles: ['user', 'admin'], icon: FiAward },
  { label: 'Dashboard', href: '/user-dashboard', roles: ['user'], icon: FiGrid },
  { label: 'Org Console', href: '/organization-dashboard', roles: ['organization'], icon: FiPieChart },
  { label: 'Admin Console', href: '/admin-dashboard', roles: ['admin'], icon: FiSettings },
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, logout, user, organization } = useAuth();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roleLinks = useMemo(() => {
    if (!currentUser) return [];
    return contextualLinks.filter(link => link.roles?.includes(currentUser.role));
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      setUserMenuOpen(false);
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const getUserDisplayName = () => {
    if (!currentUser) return '';
    if (currentUser.role === 'organization') {
      return organization?.organizationName || organization?.name || 'Organization';
    }
    return user?.firstName || user?.username || currentUser?.firstName || currentUser?.username || 'User';
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const actionCta = isAuthenticated
    ? currentUser?.role === 'admin'
      ? { label: 'Admin Console', href: '/admin-dashboard', icon: FiSettings }
      : currentUser?.role === 'organization'
        ? { label: 'Org Console', href: '/organization-dashboard', icon: FiPieChart }
        : { label: 'Dashboard', href: '/user-dashboard', icon: FiGrid }
    : { label: 'Sync Network', href: '/register/user', icon: FiActivity };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-700 ${isScrolled ? 'bg-[#030d0a]/80 backdrop-blur-xl border-b border-white/5 py-4' : 'bg-transparent py-8'
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-4 group">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/20 transition-all duration-500 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                <FiZap className="text-emerald-500 w-6 h-6 group-hover:scale-110 transition-transform" />
              </div>
              <div className="absolute inset-0 bg-emerald-500/20 blur-xl opacity-0 group-hover:opacity-40 transition-opacity" />
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

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-2">
            {staticLinks.map(link => {
              const Icon = link.icon;
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.label}
                  to={link.href}
                  className={`relative px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-500 flex items-center gap-3 font-mono ${isActive ? 'text-emerald-500 bg-emerald-500/5' : 'text-slate-500 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-500' : 'text-slate-600'}`} />
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-glow"
                      className="absolute inset-0 rounded-xl border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Action Area */}
          <div className="hidden lg:flex items-center gap-8">
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-4 group"
                >
                  <div className="text-right">
                    <p className="text-sm font-bold text-white leading-none uppercase tracking-tight" style={{ fontFamily: 'Outfit' }}>
                      {getUserDisplayName()}
                    </p>
                    <p className="text-[9px] font-bold text-emerald-500/60 uppercase tracking-widest font-mono mt-1">
                      {currentUser?.role} Node
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xs font-black text-emerald-500 font-mono group-hover:border-emerald-500/40 transition-all shadow-inner">
                    {getUserInitials()}
                  </div>
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.95 }}
                      className="absolute right-0 mt-6 w-72 bio-card p-3 shadow-2xl overflow-hidden"
                    >
                      <div className="p-6 border-b border-white/5 mb-2">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono mb-2">Logged in address</p>
                        <p className="text-sm font-bold text-white truncate" style={{ fontFamily: 'Inter' }}>
                          {user?.email || organization?.email || currentUser?.email}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <Link
                          to={actionCta.href}
                          className="flex items-center gap-4 px-6 py-4 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white hover:bg-emerald-500/5 transition-all font-mono"
                        >
                          <actionCta.icon className="w-4 h-4 text-emerald-500" />
                          {actionCta.label}
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-4 px-6 py-4 rounded-xl text-xs font-bold uppercase tracking-widest text-red-500/60 hover:text-red-500 hover:bg-red-500/5 transition-all font-mono"
                        >
                          <FiLogOut className="w-4 h-4" />
                          Terminate
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-6">
                <Link
                  to="/login/user"
                  className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-emerald-500 transition-colors font-mono"
                >
                  Authorize
                </Link>
                <Link
                  to={actionCta.href}
                  className="px-8 py-3.5 rounded-2xl bg-emerald-500 text-black font-black uppercase text-[10px] tracking-widest hover:bg-emerald-400 transition-all shadow-[0_0_25px_rgba(16,185,129,0.2)]"
                >
                  {actionCta.label}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-500"
          >
            {mobileOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -20 }}
            className="lg:hidden fixed inset-x-0 top-28 mx-6 p-6 bio-card shadow-2xl z-40"
          >
            <div className="space-y-2">
              {[...staticLinks, ...roleLinks].map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="flex items-center gap-5 px-6 py-5 rounded-2xl bg-white/[0.03] border border-white/5 text-sm font-bold text-slate-400 hover:text-emerald-400 hover:border-emerald-500/20 transition-all font-mono uppercase tracking-widest"
                >
                  <link.icon className="w-5 h-5 text-emerald-500" />
                  {link.label}
                </Link>
              ))}
              <div className="pt-6 mt-4 border-t border-white/5">
                {isAuthenticated ? (
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-4 px-6 py-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 font-black uppercase text-xs tracking-widest font-mono"
                  >
                    <FiLogOut className="w-5 h-5" />
                    Terminate Connection
                  </button>
                ) : (
                  <Link
                    to="/register/user"
                    className="w-full flex items-center justify-center gap-4 px-6 py-5 rounded-2xl bg-emerald-500 text-black font-black uppercase text-xs tracking-widest"
                  >
                    <FiActivity className="w-5 h-5" />
                    Sync Network
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
