import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/authcontext';
import { useNotification } from '../../../context/NotificationContext';
import {
  FiUser,
  FiEye,
  FiEyeOff,
  FiMail,
  FiPhone,
  FiMapPin,
  FiShield,
  FiArrowRight,
  FiActivity,
  FiZap,
  FiCheckCircle,
  FiAlertCircle,
  FiCpu,
  FiLock,
  FiGlobe
} from 'react-icons/fi';
import { FaLeaf } from 'react-icons/fa';

function UserSignupPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset
  } = useForm();

  const navigate = useNavigate();
  const { signup } = useAuth();
  const { success: notifySuccess } = useNotification();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [step, setStep] = useState(1);

  const password = watch('password');

  const onSubmitStep1 = () => setStep(2);

  const onSubmit = async (data) => {
    setLoading(true);
    setFormError('');

    try {
      const result = await signup({
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
        email: data.email,
        phone: data.phone,
        address: data.address,
        password: data.password
      }, 'user');

      if (result?.requiresVerification) {
        notifySuccess('Identity Issued. Verification protocol required.');
        reset();
        setTimeout(() => navigate(`/verify-email?email=${encodeURIComponent(data.email)}`), 1500);
      } else {
        notifySuccess('Citizen Node Registered. Welcome.');
        reset();
        setTimeout(() => navigate('/login/user'), 1500);
      }
    } catch (error) {
      setFormError(error.message || 'Registration Interrupted');
    } finally {
      setLoading(false);
    }
  };

  const strengthInfo = (pass) => {
    if (!pass) return { s: 0, t: 'NONE', c: 'bg-white/5' };
    let s = 0;
    if (pass.length >= 8) s++;
    if (/[A-Z]/.test(pass)) s++;
    if (/\d/.test(pass)) s++;
    if (/[^a-zA-Z\d]/.test(pass)) s++;
    const levels = [
      { t: 'VULNERABLE', c: 'bg-rose-500' },
      { t: 'WEAK', c: 'bg-amber-500' },
      { t: 'MODERATE', c: 'bg-yellow-400' },
      { t: 'SECURE', c: 'bg-emerald-400' },
      { t: 'MASTER', c: 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]' }
    ];
    return { s, ...levels[s] };
  };

  return (
    <div className="min-h-screen bg-[#030d0a] flex items-center justify-center p-6 relative overflow-hidden selection:bg-emerald-500/20">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[130px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-500/5 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left Side: Brand Narrative */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:block space-y-12"
        >
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <FaLeaf className="text-3xl text-emerald-500" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter" style={{ fontFamily: 'Outfit' }}>GreenCity <span className="text-emerald-500">Network</span>.</h1>
          </div>

          <h2 className="text-7xl font-black text-white leading-[0.9] tracking-tighter font-outfit uppercase">
            Join the <br />
            <span className="text-emerald-500 italic">Next Gen</span> <br />
            Eco-Society.
          </h2>

          <div className="space-y-6">
            {[
              { icon: <FiGlobe />, title: 'Planet First', desc: 'Every deployment contributes to a sustainable future.' },
              { icon: <FiHeart />, title: 'Community Built', desc: 'Secure your place in the decentralized eco-collective.' },
              { icon: <FiTrendingUp />, title: 'Merit Progression', desc: 'Earn carbon credits and gain architectural influence.' }
            ].map((item, i) => (
              <div key={i} className="flex gap-4 group">
                <div className="mt-1 text-emerald-500 text-xl group-hover:scale-125 transition-transform">{item.icon}</div>
                <div>
                  <h4 className="font-bold text-white text-xs uppercase tracking-widest font-mono mb-1">{item.title}</h4>
                  <p className="text-sm text-slate-400 leading-relaxed font-medium" style={{ fontFamily: 'Inter' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-10 bio-card border-emerald-500/10 bg-emerald-500/[0.02]">
            <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500/60 mb-8 font-mono">Mission Directives</h5>
            <div className="grid grid-cols-2 gap-6">
              {['Anomaly Reports', 'Transport Share', 'Carbon Tracking', 'Community Voting'].map((text, i) => (
                <div key={i} className="flex items-center gap-3">
                  <FiCheckCircle className="text-emerald-500 text-sm" />
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest font-mono">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right Side: Identity Creation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg mx-auto"
        >
          <div className="bio-card border-white/10 p-12 shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              {/* Progress Header */}
              <div className="mb-12 flex items-center justify-between">
                <div>
                  <h3 className="text-4xl font-black text-white tracking-tighter" style={{ fontFamily: 'Outfit' }}>Create ID.</h3>
                  <p className="text-[10px] font-black text-emerald-500/40 uppercase tracking-[0.3em] font-mono">Citizen Enrollment Active</p>
                </div>
                <div className="flex gap-3">
                  <div className={`w-3 h-3 rounded-full transition-all duration-500 ${step === 1 ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-white/10'}`} />
                  <div className={`w-3 h-3 rounded-full transition-all duration-500 ${step === 2 ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-white/10'}`} />
                </div>
              </div>

              {/* Error Display */}
              <AnimatePresence>
                {formError && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="mb-8 p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-4">
                    <FiAlertCircle className="text-rose-400 text-xl" />
                    <span className="text-[10px] font-black text-rose-200 uppercase tracking-widest font-mono">{formError}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.form key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    onSubmit={handleSubmit(onSubmitStep1)} className="space-y-8">

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono px-2">First Name</label>
                        <div className="relative group">
                          <FiUser className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-500 transition-colors" />
                          <input type="text" {...register('firstName', { required: true })} placeholder="JOHN"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500/30 font-mono uppercase tracking-widest" />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono px-2">Last Name</label>
                        <input type="text" {...register('lastName', { required: true })} placeholder="DOE"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-sm text-white focus:outline-none focus:border-emerald-500/30 font-mono uppercase tracking-widest" />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono px-2">Chosen Identifier</label>
                      <input type="text" {...register('username', { required: true })} placeholder="ECO_WARRIOR"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-sm text-white focus:outline-none focus:border-emerald-500/30 font-mono uppercase tracking-widest" />
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono px-2">Digital Sector (Email)</label>
                      <div className="relative group">
                        <FiMail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-500 transition-colors text-xl" />
                        <input type="email" {...register('email', { required: true })} placeholder="CITIZEN@GREENCITY.COM"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500/30 font-mono uppercase tracking-widest" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono px-2">Comm Link</label>
                        <div className="relative group">
                          <FiPhone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-500 transition-colors" />
                          <input type="tel" {...register('phone')} placeholder="+1"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500/30 font-mono" />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono px-2">Sector Node</label>
                        <div className="relative group">
                          <FiMapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-500 transition-colors text-xl" />
                          <input type="text" {...register('address')} placeholder="CITY HUB"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500/30 font-mono uppercase tracking-widest" />
                        </div>
                      </div>
                    </div>

                    <button type="submit" className="group w-full py-6 rounded-2xl bg-emerald-500 text-black font-black uppercase tracking-[0.3em] text-[11px] font-mono hover:bg-emerald-400 active:scale-95 transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] flex items-center justify-center gap-3">
                      Proceed to Identity Verification <FiArrowRight className="text-lg group-hover:translate-x-2 transition-transform" />
                    </button>
                  </motion.form>
                ) : (
                  <motion.form key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                    <div className="space-y-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono px-2">Access Cipher</label>
                        <div className="relative group">
                          <FiLock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-500 transition-colors text-xl" />
                          <input type={showPassword ? 'text' : 'password'} {...register('password', { required: true, minLength: 8 })} placeholder="••••••••"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-12 text-sm text-white focus:outline-none focus:border-emerald-500/30 font-mono" />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-emerald-500">
                            {showPassword ? <FiEyeOff /> : <FiEye />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono px-2">Cipher Confirmation</label>
                        <div className="relative group">
                          <FiLock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-500 transition-colors text-xl" />
                          <input type={showConfirmPassword ? 'text' : 'password'} {...register('confirmPassword', { validate: v => v === password })} placeholder="••••••••"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-12 text-sm text-white focus:outline-none focus:border-emerald-500/30 font-mono" />
                          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-emerald-500">
                            {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Cipher Strength Meter */}
                    <div className="p-8 bio-card border-white/5 bg-white/[0.02] space-y-4">
                      <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.2em] font-mono">
                        <span className="text-slate-600">Cipher Complexity</span>
                        <span className={strengthInfo(password).t === 'MASTER' ? 'text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.3)]' : 'text-emerald-500'}>{strengthInfo(password).t}</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex gap-1.5">
                        {[1, 2, 3, 4, 5].map(i => (
                          <div key={i} className={`h-full flex-1 transition-all duration-1000 ease-out ${i <= strengthInfo(password).s ? strengthInfo(password).c : 'bg-white/5'}`} />
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-6 pt-6">
                      <button type="button" onClick={() => setStep(1)} className="flex-1 py-5 rounded-2xl border-2 border-white/5 text-slate-500 font-black uppercase text-[10px] tracking-widest font-mono hover:text-white transition-all">Back</button>
                      <button type="submit" disabled={loading} className="flex-[2] py-5 rounded-2xl bg-emerald-500 text-black font-black uppercase tracking-widest text-[11px] font-mono hover:bg-emerald-400 disabled:opacity-50 transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] flex items-center justify-center gap-3">
                        {loading ? <FiActivity className="animate-spin" /> : <><FiZap /> Initialize ID</>}
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              <div className="mt-12 text-center border-t border-white/5 pt-12">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                  Existing Citizen Ingress?
                  <Link to="/login/user" className="ml-2 text-emerald-500 font-black hover:underline transition-all underline-offset-4 decoration-emerald-500/30">Portal Login</Link>
                </p>
                <div className="mt-10 flex items-center justify-center gap-8 opacity-20 group-hover:opacity-40 transition-opacity">
                  <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.4em] font-mono text-white"><FiShield /> AES-256</div>
                  <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.4em] font-mono text-white"><FiCpu /> Encrypted Hub</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default UserSignupPage;
