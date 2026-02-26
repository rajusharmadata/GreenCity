import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiShield,
  FiUser,
  FiHash,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiActivity,
  FiZap,
  FiCheckCircle,
  FiAlertCircle,
  FiGlobe
} from 'react-icons/fi';
import { FaLeaf } from 'react-icons/fa';
import { useAuth } from '../context/authcontext';
import { useNotification } from '../../../context/NotificationContext';

function AdminSignupPage() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();
  const { signup } = useAuth();
  const { success: notifySuccess } = useNotification();
  const password = watch('password');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    try {
      const result = await signup(
        {
          firstName: data.firstName,
          lastName: data.lastName,
          username: data.username,
          email: data.email,
          password: data.password,
        },
        'admin',
      );

      if (result) {
        notifySuccess('Admin Privileges Granted. Welcome to High Command.');
        setTimeout(() => navigate('/login/admin'), 1500);
      }
    } catch (err) {
      setError(err.message || 'Enrollment Interrupted');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030d0a] flex items-center justify-center p-6 relative overflow-hidden selection:bg-emerald-500/20">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-emerald-500/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-teal-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left Side: Admin Authority */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:block space-y-12"
        >
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <FiShield className="text-4xl text-emerald-500" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500/60 font-mono">Restricted Terminal</p>
              <h1 className="text-4xl font-black text-white tracking-tighter" style={{ fontFamily: 'Outfit' }}>GreenCity <span className="text-emerald-500">Ops</span>.</h1>
            </div>
          </div>

          <h2 className="text-7xl font-black text-white leading-none tracking-tighter font-outfit uppercase">
            Oversee the <br />
            <span className="text-emerald-500 italic">Ecosystem.</span>
          </h2>

          <div className="space-y-6">
            {[
              { icon: <FiShield />, title: 'Core Governance', desc: 'Secure management of regional transit nodes and intelligence reports.' },
              { icon: <FiActivity />, title: 'Advanced Analytics', desc: 'High-level access to real-time sectoral impact dashboards.' },
              { icon: <FiZap />, title: 'Fast Response', desc: 'Deploy community escalations with directive-level authority tools.' }
            ].map((item, i) => (
              <div key={i} className="flex gap-4 group">
                <div className="mt-1 text-emerald-500 text-xl group-hover:scale-125 transition-transform">{item.icon}</div>
                <div>
                  <h4 className="font-bold text-white text-xs uppercase tracking-widest font-mono mb-1">{item.title}</h4>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed" style={{ fontFamily: 'Inter' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-10 bio-card border-emerald-500/10 bg-emerald-500/[0.02]">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500/40 mb-4 font-mono">Priority Hub</p>
            <p className="text-2xl font-black text-white" style={{ fontFamily: 'Outfit' }}>ops@greencity.gov</p>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2 font-mono">24/7 Command Authorization Protocol</p>
          </div>
        </motion.div>

        {/* Right Side: Command Enrollment */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg mx-auto"
        >
          <div className="bio-card border-white/10 p-12 shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="mb-12">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-8">
                  <FiShield className="text-4xl text-emerald-500" />
                </div>
                <h3 className="text-4xl font-black text-white mb-2 tracking-tighter" style={{ fontFamily: 'Outfit' }}>Admin Enrollment.</h3>
                <p className="text-[10px] font-black text-emerald-500/40 uppercase tracking-[0.3em] font-mono">Authorized Personnel Verification</p>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="mb-8 p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-4">
                    <FiAlertCircle className="text-rose-400 text-xl" />
                    <span className="text-[10px] font-black text-rose-200 uppercase tracking-widest font-mono">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono px-2">First Name</label>
                    <div className="relative group">
                      <FiUser className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-500 transition-colors" />
                      <input type="text" {...register('firstName', { required: true })} placeholder="ADMIN"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500/30 transition-all font-mono uppercase tracking-widest" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono px-2">Last Name</label>
                    <input type="text" {...register('lastName', { required: true })} placeholder="OFFICER"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-sm text-white focus:outline-none focus:border-emerald-500/30 transition-all font-mono uppercase tracking-widest" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono px-2">Username</label>
                    <div className="relative group">
                      <FiHash className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-500 transition-colors" />
                      <input type="text" {...register('username', { required: true })} placeholder="ADMIN_NODE"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500/30 transition-all font-mono uppercase tracking-widest" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono px-2">Comm (Email)</label>
                    <div className="relative group">
                      <FiMail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-500 transition-colors text-xl" />
                      <input type="email" {...register('email', { required: true })} placeholder="HQ@GREENCITY.GOV"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500/30 transition-all font-mono uppercase tracking-widest" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono px-2">Master Key</label>
                    <div className="relative group">
                      <FiLock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-500 transition-colors" />
                      <input type={showPassword ? 'text' : 'password'} {...register('password', { required: true, minLength: 8 })} placeholder="••••••••"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-12 text-sm text-white focus:outline-none focus:border-emerald-500/30 transition-all font-mono" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-emerald-500">
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono px-2">Confirm Key</label>
                    <input type="password" {...register('confirmPassword', { validate: (v) => v === password })} placeholder="••••••••"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-sm text-white focus:outline-none focus:border-emerald-500/30 transition-all font-mono" />
                  </div>
                </div>

                <div className="pt-6 flex gap-6">
                  <button type="button" onClick={() => navigate('/')} className="flex-1 py-5 rounded-2xl border-2 border-white/5 text-slate-500 font-black uppercase text-[10px] tracking-widest font-mono hover:text-white transition-all">Abort</button>
                  <button type="submit" disabled={loading} className="flex-[2] py-5 rounded-2xl bg-emerald-500 text-black font-black uppercase tracking-widest text-[11px] font-mono hover:bg-emerald-400 disabled:opacity-50 transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] flex items-center justify-center gap-3">
                    {loading ? <FiActivity className="animate-spin" /> : <><FiShield /> Establish Admin ID</>}
                  </button>
                </div>
              </form>

              <div className="mt-12 pt-12 border-t border-white/5 text-center">
                <p className="text-[10px] text-slate-600 uppercase tracking-widest font-black font-mono">
                  Enrollment implies adherence to the <span className="text-emerald-500/60">Governance Directives</span>
                </p>
                <div className="mt-8 flex items-center justify-center gap-6 opacity-20">
                  <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.4em] font-mono text-white"><FiCheckCircle /> Stabilized</div>
                  <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.4em] font-mono text-white"><FiGlobe /> Global</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default AdminSignupPage;
