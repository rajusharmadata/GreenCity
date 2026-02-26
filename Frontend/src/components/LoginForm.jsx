import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../features/auth/context/authcontext';
import OAuthButtons from './OAuthButtons.jsx';
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiAlertCircle,
  FiCheckCircle,
  FiArrowRight,
  FiUser,
  FiShield,
  FiActivity
} from 'react-icons/fi';

function LoginForm({ onClose, userType = 'user' }) {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Sector Address Required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid Cipher Format';
    }

    if (!formData.password) {
      newErrors.password = 'Auth Key Required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await login(formData.email, formData.password, userType);
      setErrors({});
      setIsSuccess(true);

      setTimeout(() => {
        onClose?.();
        navigate(userType === 'admin' ? '/admin-dashboard' : '/user-dashboard');
      }, 1500);
    } catch (err) {
      setErrors({ submit: err.message || 'Uplink Failed. Cipher mismatch.' });
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role) => {
    setIsLoading(true);

    try {
      // Logic handled in authcontext for demo credentials if applicable, 
      // or we just call login with known demo creds
      const email = role === 'admin' ? 'admin@greencity.com' : 'user@greencity.com';
      const password = role === 'admin' ? 'admin123' : 'password123';

      await login(email, password, role);
      setIsSuccess(true);

      setTimeout(() => {
        onClose?.();
        navigate(role === 'admin' ? '/admin-dashboard' : '/user-dashboard');
      }, 1500);
    } catch (err) {
      setErrors({ submit: 'Demo authorization failure.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Success Ingress */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-8 p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-4 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
          >
            <FiCheckCircle className="w-6 h-6 text-emerald-500" />
            <p className="text-emerald-200 text-xs font-black uppercase tracking-widest font-mono">Uplink Stable. Redirecting...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Anomaly */}
      <AnimatePresence>
        {errors.submit && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-8 p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-4 shadow-[0_0_20px_rgba(244,63,94,0.1)]"
          >
            <FiAlertCircle className="w-6 h-6 text-rose-500" />
            <p className="text-rose-200 text-xs font-black uppercase tracking-widest font-mono">{errors.submit}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 font-mono px-2">Access Email</label>
          <div className="relative group">
            <FiMail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-500 transition-colors text-lg" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full bg-white/5 border ${errors.email ? 'border-rose-500/30' : 'border-white/10'} rounded-2xl py-5 pl-14 pr-6 text-sm text-white focus:outline-none focus:border-emerald-500/30 transition-all font-mono uppercase tracking-widest`}
              placeholder="SECTOR@HUB.COM"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 font-mono px-2">Access Cipher</label>
          <div className="relative group">
            <FiLock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-500 transition-colors text-lg" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`w-full bg-white/5 border ${errors.password ? 'border-rose-500/30' : 'border-white/10'} rounded-2xl py-5 pl-14 pr-12 text-sm text-white focus:outline-none focus:border-emerald-500/30 transition-all font-mono`}
              placeholder="••••••••"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-emerald-500 transition-colors"
            >
              {showPassword ? <FiEyeOff className="text-lg" /> : <FiEye className="text-lg" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between px-2 text-[10px] font-black uppercase tracking-[0.2em] font-mono">
          <label className="flex items-center gap-3 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer select-none">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleInputChange}
              className="w-4 h-4 rounded border-white/10 bg-white/5 accent-emerald-500"
              disabled={isLoading}
            />
            Bio-Persistence
          </label>

          <Link
            to="/forgot-password"
            className="text-emerald-500 hover:text-white transition-colors"
            onClick={onClose}
          >
            Cipher Lost?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading || isSuccess}
          className="group w-full py-6 rounded-2xl bg-emerald-500 text-black font-black uppercase tracking-[0.3em] text-[11px] font-mono hover:bg-emerald-400 active:scale-98 transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {isLoading ? (
            <>
              <FiActivity className="animate-spin text-lg" />
              <span>Authenticating...</span>
            </>
          ) : isSuccess ? (
            <>
              <FiCheckCircle className="text-lg" />
              <span>Verified</span>
            </>
          ) : (
            <>
              <FiShield className="text-lg" />
              <span>Initiate Link</span>
              <FiArrowRight className="text-lg group-hover:translate-x-2 transition-transform" />
            </>
          )}
        </button>

        {/* Demo Frequency */}
        <div className="space-y-6 pt-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5" />
            </div>
            <div className="relative flex justify-center text-[9px] font-black uppercase tracking-[0.4em] font-mono">
              <span className="px-4 bg-[#0d261a] text-slate-700">Demo Frequency</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleDemoLogin('user')}
              disabled={isLoading || isSuccess}
              className="px-4 py-4 bio-card border-white/5 bg-white/[0.02] hover:bg-white/5 text-slate-400 hover:text-white text-[10px] font-black uppercase tracking-widest font-mono transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
              <FiUser className="text-base" />
              <span>Citizen</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              disabled={isLoading || isSuccess}
              className="px-4 py-4 bio-card border-white/5 bg-white/[0.02] hover:bg-white/5 text-slate-400 hover:text-white text-[10px] font-black uppercase tracking-widest font-mono transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
              <FiShield className="text-base" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        <div className="pt-4">
          <OAuthButtons />
        </div>
      </form>
    </div>
  );
}

export default LoginForm;
