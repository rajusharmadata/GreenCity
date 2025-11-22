import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, LogOut, ShieldCheck, User, ChevronDown, Home, Bus, Info, Mail, FileText, LayoutDashboard, Building2, Settings } from 'lucide-react';
import { useAuth } from '../context/authcontext';

const staticLinks = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Eco Transport', href: '/eco-transport', icon: Bus },
  { label: 'How It Works', href: '/how-it-works', icon: Info },
  { label: 'Contact', href: '/contact', icon: Mail },
];

const contextualLinks = [
  { label: 'Report Issue', href: '/report-issue', roles: ['user', 'admin'], icon: FileText },
  { label: 'User Dashboard', href: '/user-dashboard', roles: ['user'], icon: LayoutDashboard },
  { label: 'Organization Console', href: '/organization-dashboard', roles: ['organization'], icon: Building2 },
  { label: 'Admin Console', href: '/admin-dashboard', roles: ['admin'], icon: Settings },
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

  // Close user menu when clicking outside
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

  // Get user display name
  const getUserDisplayName = () => {
    if (!currentUser) return '';
    if (currentUser.role === 'organization') {
      return organization?.organizationName || organization?.name || 'Organization';
    }
    return user?.firstName || user?.username || currentUser?.firstName || currentUser?.username || 'User';
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    const name = getUserDisplayName();
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const actionCta = isAuthenticated
    ? currentUser?.role === 'admin'
      ? { label: 'Admin Console', href: '/admin-dashboard', icon: Settings }
      : currentUser?.role === 'organization'
      ? { label: 'Org Console', href: '/organization-dashboard', icon: Building2 }
      : { label: 'Dashboard', href: '/user-dashboard', icon: LayoutDashboard }
    : { label: 'Join the Mission', href: '/register/user', icon: ShieldCheck };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/98 backdrop-blur-xl shadow-md border-b border-slate-200/50'
          : 'bg-white/95 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        <div className="flex h-16 sm:h-18 lg:h-20 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group flex-shrink-0">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl sm:rounded-2xl blur-md opacity-50 group-hover:opacity-70 transition-opacity duration-300" />
              <div className="relative h-9 w-9 sm:h-10 sm:w-10 lg:h-11 lg:w-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 text-white flex items-center justify-center font-bold text-sm sm:text-base lg:text-lg shadow-lg shadow-emerald-500/30 group-hover:shadow-emerald-500/50 transition-all duration-300 group-hover:scale-105">
                GC
              </div>
            </div>
            <div className="hidden sm:block">
              <p className="text-base sm:text-lg font-bold text-slate-900 leading-tight tracking-tight">
                GreenCity
              </p>
              <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.4em] sm:tracking-[0.5em] text-emerald-600 font-semibold">
                Live Impact
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 text-sm font-medium">
            {staticLinks.map(link => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.label}
                  to={link.href}
                  className="relative px-3 xl:px-4 py-2 text-slate-700 hover:text-emerald-600 transition-colors duration-200 group rounded-lg"
                >
                  <span className="relative z-10 flex items-center gap-1.5">
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </span>
                  {location.pathname === link.href && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute bottom-1 left-2 right-2 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
            {roleLinks.length > 0 && (
              <div className="h-6 w-px bg-gradient-to-b from-transparent via-slate-300 to-transparent mx-1 xl:mx-2" />
            )}
            {roleLinks.map(link => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.label}
                  to={link.href}
                  className="relative px-3 xl:px-4 py-2 text-slate-700 hover:text-emerald-600 transition-colors duration-200 rounded-lg"
                >
                  <span className="relative z-10 flex items-center gap-1.5">
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </span>
                  {location.pathname === link.href && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute bottom-1 left-2 right-2 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-3">
            {isAuthenticated ? (
              <>
                {/* User Menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100/50 hover:border-emerald-200 hover:shadow-sm transition-all duration-200 group"
                  >
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
                      {getUserInitials()}
                    </div>
                    <div className="text-left hidden xl:block">
                      <p className="text-xs font-semibold text-slate-900 leading-tight">
                        {getUserDisplayName()}
                      </p>
                      <p className="text-[10px] text-slate-500 capitalize">
                        {currentUser?.role || 'User'}
                      </p>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-slate-600 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* User Dropdown Menu */}
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200/50 overflow-hidden"
                      >
                        <div className="p-3 border-b border-slate-100">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {getUserDisplayName()}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {user?.email || organization?.email || currentUser?.email || ''}
                          </p>
                        </div>
                        <div className="p-1">
                          <Link
                            to={actionCta.href}
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-emerald-50 transition-colors"
                          >
                            {actionCta.icon && <actionCta.icon className="h-4 w-4" />}
                            {actionCta.label}
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="h-4 w-4" />
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <div className="relative group">
                  <button className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-emerald-600 transition-colors flex items-center gap-1">
                    Sign In
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-slate-200 bg-white shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                      <Link
                        to="/login/user"
                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                      >
                        <User className="inline h-4 w-4 mr-2" />
                        User Login
                      </Link>
                      <Link
                        to="/login/org"
                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                      >
                        <Building2 className="inline h-4 w-4 mr-2" />
                        Organization Login
                      </Link>
                      <Link
                        to="/login/admin"
                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                      >
                        <ShieldCheck className="inline h-4 w-4 mr-2" />
                        Admin Login
                      </Link>
                    </div>
                  </div>
                </div>
                <Link
                  to={actionCta.href}
                  className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-200 hover:scale-105"
                >
                  <actionCta.icon className="h-4 w-4" />
                  {actionCta.label}
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(prev => !prev)}
            className="lg:hidden relative inline-flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all duration-200"
            aria-label="Toggle navigation"
          >
            <AnimatePresence mode="wait">
              {mobileOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-5 w-5" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="h-5 w-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="lg:hidden border-t border-slate-200 bg-white/98 backdrop-blur-xl shadow-lg overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1 max-h-[calc(100vh-4.5rem)] overflow-y-auto">
              {/* User Info Section */}
              {isAuthenticated && (
                <div className="mb-4 pb-4 border-b border-slate-200">
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
                      {getUserInitials()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {getUserDisplayName()}
                      </p>
                      <p className="text-xs text-slate-500 capitalize truncate">
                        {currentUser?.role || 'User'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              {[...staticLinks, ...roleLinks].map((link, index) => {
                const Icon = link.icon;
                return (
                  <motion.div
                    key={link.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <Link
                      to={link.href}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                        location.pathname === link.href
                          ? 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 shadow-sm'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      {link.label}
                    </Link>
                  </motion.div>
                );
              })}

              {/* Action Buttons */}
              <div className="pt-4 space-y-2 border-t border-slate-200">
                {isAuthenticated ? (
                  <>
                    <Link
                      to={actionCta.href}
                      className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30"
                    >
                      {actionCta.icon && <actionCta.icon className="h-5 w-5" />}
                      {actionCta.label}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                    >
                      <LogOut className="h-5 w-5" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Link
                        to="/login/user"
                        className="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:border-emerald-200 hover:bg-emerald-50 transition-all duration-200"
                      >
                        <User className="h-5 w-5" />
                        User Login
                      </Link>
                      <Link
                        to="/login/org"
                        className="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:border-emerald-200 hover:bg-emerald-50 transition-all duration-200"
                      >
                        <Building2 className="h-5 w-5" />
                        Organization Login
                      </Link>
                      <Link
                        to="/login/admin"
                        className="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:border-emerald-200 hover:bg-emerald-50 transition-all duration-200"
                      >
                        <ShieldCheck className="h-5 w-5" />
                        Admin Login
                      </Link>
                    </div>
                    <Link
                      to={actionCta.href}
                      className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30"
                    >
                      {actionCta.icon && <actionCta.icon className="h-5 w-5" />}
                      {actionCta.label}
                    </Link>
                  </>
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
