import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiShield,
  FiBriefcase,
  FiEye,
  FiEyeOff,
  FiMail,
  FiLock,
  FiAlertCircle,
  FiCheckCircle,
  FiArrowRight,
  FiActivity,
  FiZap
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/authcontext';
import { useNotification } from '../../../context/NotificationContext';
import OAuthButtons from '../../../components/OAuthButtons.jsx';

function LoginPage({ isAdmin = false }) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { success: notifySuccess } = useNotification();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const roleLabel = isAdmin ? 'Admin' : 'Organization';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((p) => ({ ...p, [name]: '' }));
    if (error) setError('');
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.email.trim()) errors.email = 'Email required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) errors.email = 'Invalid sector address';
    if (!formData.password) errors.password = 'Passkey required';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const userType = isAdmin ? 'admin' : 'organization';
      await login(formData.email.trim(), formData.password, userType);
      notifySuccess('Access Granted. Uplink established.');
      setTimeout(() => navigate(isAdmin ? '/admin-dashboard' : '/organization-dashboard'), 1000);
    } catch (err) {
      if (err.requiresVerification) {
        setError('Verification Required');
        setTimeout(() => navigate(`/verify-email?email=${encodeURIComponent(formData.email)}&type=${isAdmin ? 'admin' : 'organization'}`), 1500);
      } else {
        setError(err.message || 'Authentication Failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030d0a] flex items-center justify-center p-6 relative overflow-hidden selection:bg-emerald-500/20">
      {/* Background Bio-Luminesence */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-teal-500/10 blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left Side: Narrative Grid */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:block space-y-10"
        >
          <div className="inline-flex items-center gap-5 p-5 bio-card border-white/5">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]`}>
              {isAdmin ? <FiShield className="text-2xl" /> : <FiBriefcase className="text-2xl" />}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 font-mono">High Security Channel</p>
              <h4 className="text-xl font-bold text-white tracking-tighter" style={{ fontFamily: 'Outfit' }}>{roleLabel} Console.</h4>
            </div>
          </div>

          <h1 className="text-7xl font-black text-white leading-[0.9] tracking-tighter font-outfit">
            {isAdmin ? 'Operational' : 'Network'} <br />
            <span className="text-emerald-500 italic">Access.</span>
          </h1>

          <p className="text-xl text-slate-400 font-medium max-w-md leading-relaxed" style={{ fontFamily: 'Inter' }}>
            {isAdmin
              ? 'Calibrate global sustainability vectors and manage decentralized citizen intelligence.'
              : 'Optimize transport telemetry and manage regional environmental impact data.'}
          </p>

          <div className="space-y-5">
            {[
              isAdmin ? 'Detailed Infrastructure Oversight' : 'Fleet Telemetry Management',
              isAdmin ? 'Citizen Signal Moderation' : 'Route Network Optimization',
              isAdmin ? 'System-Wide Root Access' : 'Org-Level Impact Analytics'
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                  <FiCheckCircle className="text-emerald-500 text-xs" />
                </div>
                <span className="text-slate-300 font-bold uppercase text-[11px] tracking-widest font-mono">{text}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right Side: Auth Ingress */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="bio-card border-white/10 p-12 shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="mb-12">
                <h3 className="text-4xl font-black text-white mb-2 tracking-tighter" style={{ fontFamily: 'Outfit' }}>Authenticate.</h3>
                <p className="text-[10px] font-black text-emerald-500/40 uppercase tracking-[0.3em] font-mono">Uplink Encryption Active</p>
              </div>

              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mb-8 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4"
                  >
                    <FiAlertCircle className="text-red-400 text-xl" />
                    <span className="text-[10px] font-black text-red-200 uppercase tracking-widest font-mono">{error}</span>
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
                      onChange={handleChange}
                      placeholder="HUB-ID@SECTOR.COM"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-sm text-white placeholder:text-slate-700 outline-none focus:border-emerald-500/30 transition-all font-mono uppercase tracking-widest"
                    />
                  </div>
                  {fieldErrors.email && <p className="text-[9px] font-black text-red-400 px-2 uppercase font-mono">{fieldErrors.email}</p>}
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 font-mono px-2">Access Key</label>
                  <div className="relative group">
                    <FiLock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-500 transition-colors text-lg" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-14 text-sm text-white placeholder:text-slate-700 outline-none focus:border-emerald-500/30 transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-emerald-500 transition-colors"
                    >
                      {showPassword ? <FiEyeOff className="text-lg" /> : <FiEye className="text-lg" />}
                    </button>
                  </div>
                  {fieldErrors.password && <p className="text-[9px] font-black text-red-400 px-2 uppercase font-mono">{fieldErrors.password}</p>}
                </div>

                <div className="flex items-center justify-between px-2 text-[10px] font-black uppercase tracking-[0.2em] font-mono">
                  <label className="flex items-center gap-3 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer select-none">
                    <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-white/5 accent-emerald-500" />
                    Persistent Uplink
                  </label>
                  <button type="button" className="text-emerald-500 hover:text-white transition-colors">Key Recovery</button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group w-full py-5 rounded-2xl bg-emerald-500 text-black font-black uppercase tracking-[0.3em] text-[11px] font-mono hover:bg-emerald-400 active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(16,185,129,0.2)] disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <FiActivity className="animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      Initialize Connection
                      <FiArrowRight className="group-hover:translate-x-2 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              {!isAdmin && (
                <div className="mt-12 pt-12 border-t border-white/5">
                  <div className="relative mb-10 text-center">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                    <span className="relative bg-[#0d261a] px-4 text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] font-mono">External Credentials</span>
                  </div>
                  <OAuthButtons />
                </div>
              )}

              <div className="mt-10 text-center space-y-6">
                {!isAdmin ? (
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                    New Sector Node?
                    <button onClick={() => navigate('/register/org')} className="ml-2 text-emerald-400 font-black hover:underline transition-all">Register Registry</button>
                  </p>
                ) : (
                  <p className="text-[10px] font-black text-red-500/40 uppercase tracking-[0.3em] font-mono">Restricted Command Frequency</p>
                )}
                <button
                  onClick={() => navigate('/login/user')}
                  className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-700 hover:text-emerald-500 transition-all border-b border-white/5 pb-1 block w-full"
                >
                  Switch to Citizen Ingress
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default LoginPage;
