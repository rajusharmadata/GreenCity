import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, Home, Info, Phone, Mail, User, LogOut, Shield, Settings } from 'lucide-react';
import { useAuth, ROLES, PERMISSIONS } from '../features/auth/context/authcontext';

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, organization, logout, hasPermission, hasRole } = useAuth();

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getCurrentUser = () => {
    if (user) return user;
    if (organization) return organization;
    return null;
  };

  const currentUser = getCurrentUser();

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative bg-white/80 backdrop-blur-sm border-b border-gray-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Section */}
          <motion.div
            className="flex items-center space-x-4"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
              <Leaf className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                GreenCity Project
              </h1>
              <p className="text-xs text-gray-500 font-medium">Sustainable Urban Transport</p>
            </div>
          </motion.div>

          {/* Navigation */}
          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              to="/"
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                isActiveLink('/')
                  ? 'bg-gradient-to-r from-emerald-50 to-cyan-50 text-emerald-700 border border-emerald-200'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>

            {/* Authenticated navigation */}
            {isAuthenticated && (
              <>
                {hasPermission(PERMISSIONS.VIEW_DASHBOARD) && (
                  <Link
                    to="/user-dashboard"
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                      isActiveLink('/user-dashboard')
                        ? 'bg-gradient-to-r from-emerald-50 to-cyan-50 text-emerald-700 border border-emerald-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                )}

                {hasPermission(PERMISSIONS.REPORT_ISSUE) && (
                  <Link
                    to="/report-issue"
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                      isActiveLink('/report-issue')
                        ? 'bg-gradient-to-r from-emerald-50 to-cyan-50 text-emerald-700 border border-emerald-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Mail className="w-4 h-4" />
                    <span>Report Issue</span>
                  </Link>
                )}

                {hasPermission(PERMISSIONS.MANAGE_TRANSPORT) && (
                  <Link
                    to="/transport-entry"
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                      isActiveLink('/transport-entry')
                        ? 'bg-gradient-to-r from-emerald-50 to-cyan-50 text-emerald-700 border border-emerald-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Settings className="w-4 h-4" />
                    <span>Transport</span>
                  </Link>
                )}
              </>
            )}

            <Link
              to="/about"
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                isActiveLink('/about')
                  ? 'bg-gradient-to-r from-emerald-50 to-cyan-50 text-emerald-700 border border-emerald-200'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Info className="w-4 h-4" />
              <span>About</span>
            </Link>
            <Link
              to="/contact"
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                isActiveLink('/contact')
                  ? 'bg-gradient-to-r from-emerald-50 to-cyan-50 text-emerald-700 border border-emerald-200'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Phone className="w-4 h-4" />
              <span>Contact</span>
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
                  {hasRole(ROLES.ADMIN) && <Shield className="w-4 h-4 text-purple-600" />}
                  {hasRole(ROLES.USER) && <User className="w-4 h-4 text-blue-600" />}
                  {hasRole(ROLES.ORGANIZATION) && <Settings className="w-4 h-4 text-green-600" />}
                  <span className="text-sm font-medium text-gray-700">
                    {currentUser?.firstName || currentUser?.organizationName || 'User'}
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium shadow hover:bg-red-600 transition-all duration-200 flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </motion.button>
              </div>
            ) : (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/login/user"
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>Get Started</span>
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}

export default Header;
