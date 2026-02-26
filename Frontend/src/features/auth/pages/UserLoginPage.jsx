import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/authcontext';
import { useNotification } from '../../../context/NotificationContext';
import OAuthButtons from '../../../components/OAuthButtons';
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiShield,
  FiArrowRight,
  FiActivity,
  FiZap,
  FiGlobe,
  FiHeart,
  FiTrendingUp,
  FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi';
import { FaLeaf } from 'react-icons/fa';

function UserLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, error: authError, clearError, loading: authLoading } = useAuth();
  const { success: notifySuccess } = useNotification();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const from = location.state?.from?.pathname || '/user-dashboard';

  useEffect(() => {
    return () => {
      clearError();
      setFormError('');
    };
  }, [clearError]);

  useEffect(() => {
    if (authError) setFormError(authError);
  }, [authError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value.trim() }));
    if (formError) {
      setFormError('');
      clearError();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setFormError('Mandatory criteria missing');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      await login(formData.email, formData.password, "user");
      notifySuccess('Citizen uplink verified. Welcome.');
      navigate(from, { replace: true });
    } catch (err) {
      if (err.requiresVerification) {
        setFormError('Identity verification required');
        setTimeout(() => navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`), 2000);
      } else {
        setFormError(err.message || 'Cipher mismatch detected');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030d0a] flex items-center justify-center p-6 relative overflow-hidden selection:bg-emerald-500/20">
      {/* Bio-Luminesence Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-15%] right-[-5%] w-[50%] h-[50%] bg-emerald-500/10 blur-[130px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-500/5 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left Side: Citizen Manifesto */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:block space-y-12"
        >
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <FaLeaf className="text-3xl text-emerald-500" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500/60 font-mono">Citizen Network Protocol</p>
              <h1 className="text-4xl font-black text-white tracking-tighter" style={{ fontFamily: 'Outfit' }}>GreenCity <span className="text-emerald-500">Node</span>.</h1>
            </div>
          </div>

          <h2 className="text-7xl font-black text-white leading-none tracking-tighter" style={{ fontFamily: 'Outfit' }}>
            Empowering the <br />
            <span className="text-emerald-500 italic">Eco-Statis.</span>
          </h2>

          <div className="space-y-6">
            {[
              { icon: <FiGlobe />, title: 'Planetary Impact', desc: 'Track your bio-contribution to site-wide stabilization goals.' },
              { icon: <FiHeart />, title: 'Collective Pulse', desc: 'Sync with the hub for local initiatives and data validation.' },
              { icon: <FiTrendingUp />, title: 'Credit Multiplier', desc: 'Acquire carbon merit for every sustainable deployment.' }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + (i * 0.1) }}
                className="flex items-start gap-5 p-6 bio-card border-white/5 group hover:border-emerald-500/20"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 text-xl flex items-center justify-center shrink-0 border border-emerald-500/20 transition-all group-hover:bg-emerald-500 group-hover:text-black">
                  {item.icon}
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1 uppercase text-xs tracking-widest font-mono">{item.title}</h4>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed" style={{ fontFamily: 'Inter' }}>{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex gap-12 p-8 bio-card border-emerald-500/10 bg-emerald-500/5">
            <div className="space-y-1">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 font-mono">Active Citizens</p>
              <p className="text-3xl font-black text-white" style={{ fontFamily: 'Outfit' }}>12,840</p>
            </div>
            <div className="w-[1px] bg-white/10" />
            <div className="space-y-1">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 font-mono">Carbon Absorbed</p>
              <p className="text-3xl font-black text-emerald-500" style={{ fontFamily: 'Outfit' }}>840.4t</p>
            </div>
          </div>
        </motion.div>

        {/* Right Side: Identity Ingress */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="bio-card border-white/10 p-12 shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="mb-12">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-8">
                  <FiShield className="text-4xl text-emerald-500" />
                </div>
                <h3 className="text-4xl font-black text-white mb-2 tracking-tighter" style={{ fontFamily: 'Outfit' }}>Citizen Ingress.</h3>
                <p className="text-[10px] font-black text-emerald-500/40 uppercase tracking-[0.3em] font-mono">Identity Confirmation Required</p>
              </div>

              <AnimatePresence mode="wait">
                {formError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mb-8 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4"
                  >
                    <FiAlertCircle className="text-red-400 text-xl" />
                    <span className="text-[10px] font-black text-red-200 uppercase tracking-widest font-mono">{formError}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 font-mono px-2">Sector Email</label>
                  <div className="relative group">
                    <FiMail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-500 transition-colors text-lg" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="citizen@greencity.com"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-sm text-white placeholder:text-slate-700 outline-none focus:border-emerald-500/30 transition-all font-mono uppercase tracking-widest"
                    />
                  </div>
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
                </div>

                <div className="flex items-center justify-between px-2 text-[10px] font-black uppercase tracking-[0.2em] font-mono">
                  <label className="flex items-center gap-3 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer select-none">
                    <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-white/5 accent-emerald-500" />
                    Bio-Link Persistence
                  </label>
                  <Link to="/forgot-password" core="Recover Protocol" className="text-emerald-500 hover:text-white transition-colors">Key Lost?</Link>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || authLoading}
                  className="group w-full py-5 rounded-2xl bg-emerald-500 text-black font-black uppercase tracking-[0.3em] text-[11px] font-mono hover:bg-emerald-400 active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(16,185,129,0.2)] disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isSubmitting || authLoading ? (
                    <>
                      <FiActivity className="animate-spin" />
                      De-crypting...
                    </>
                  ) : (
                    <>
                      Establish Link
                      <FiArrowRight className="group-hover:translate-x-2 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-12 pt-12 border-t border-white/5">
                <div className="relative mb-8 text-center">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                  <span className="relative bg-[#0d261a] px-4 text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] font-mono">Neural Linkage</span>
                </div>
                <OAuthButtons />
              </div>

              <div className="mt-10 text-center space-y-6">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                  New Citizen Node?
                  <Link to="/register/user" className="ml-2 text-emerald-400 font-black hover:underline transition-all underline-offset-4 decoration-emerald-500/30">Issue New ID</Link>
                </p>
                <div className="flex items-center justify-center gap-6 text-[8px] font-black uppercase tracking-[0.4em] text-slate-700 font-mono">
                  <div className="flex items-center gap-2"><FiZap className="text-emerald-500" /> Kinetic Access</div>
                  <div className="flex items-center gap-2"><FiCheckCircle className="text-emerald-500" /> Stabilized</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default UserLoginPage;
