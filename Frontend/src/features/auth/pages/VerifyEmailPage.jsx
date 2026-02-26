import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/authcontext';
import { useNotification } from '../../../context/NotificationContext';
import {
  FiShield,
  FiCheckCircle,
  FiMail,
  FiRotateCcw,
  FiClock,
  FiArrowRight,
  FiActivity,
  FiAlertCircle,
  FiZap
} from 'react-icons/fi';

function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyEmail, resendVerificationEmail } = useAuth();
  const { success: notifySuccess } = useNotification();

  const [otp, setOtp] = useState('');
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState('user');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    const emailParam = searchParams.get('email');
    const typeParam = searchParams.get('type');

    if (tokenParam) setToken(tokenParam);
    if (emailParam) setEmail(decodeURIComponent(emailParam));
    if (typeParam) setUserType(typeParam);
    else {
      const storedType = localStorage.getItem('userType');
      if (storedType === 'organization') setUserType('organization');
    }

    if (tokenParam && emailParam && tokenParam.length > 6 && !loading && !verified) {
      handleVerify(tokenParam, decodeURIComponent(emailParam));
    }
  }, [searchParams]);

  const handleVerify = async (verifyTokenOrOtp, verifyEmailAddr) => {
    if (!verifyTokenOrOtp || !verifyEmailAddr) {
      setError('Verification Cipher missing');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await verifyEmail(verifyTokenOrOtp, verifyEmailAddr, userType);
      setVerified(true);
      notifySuccess('Identity Synchronized. Channel stabilized.');

      setTimeout(() => {
        const loginPath = userType === 'organization' ? '/login/org' : '/login/user';
        navigate(loginPath, {
          state: { message: 'Verification established. Ingress authorized.' }
        });
      }, 2500);
    } catch (err) {
      setError(err.message || 'Key Validation Failure');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError('Sector address required for re-transmission');
      return;
    }

    setResending(true);
    setError('');

    try {
      await resendVerificationEmail(email, userType);
      notifySuccess('Verification signal transmitted. Intercept expected.');
    } catch (err) {
      setError(err.message || 'Signal transmission failure');
    } finally {
      setResending(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    const verifyValue = otp || token;
    if (!verifyValue) {
      setError('Provide Sync Code or Token');
      return;
    }
    handleVerify(verifyValue, email);
  };

  return (
    <div className="min-h-screen bg-[#030d0a] flex items-center justify-center p-6 relative overflow-hidden selection:bg-emerald-500/20">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-emerald-500/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-teal-500/5 blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-lg"
      >
        <div className="bio-card border-white/10 overflow-hidden shadow-2xl">
          {/* Status Header */}
          <div className="p-12 text-center border-b border-white/5 relative bg-emerald-500/[0.02]">
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="inline-flex p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-8 shadow-[0_0_30px_rgba(16,185,129,0.2)]"
            >
              <FiShield className="text-4xl text-emerald-500" />
            </motion.div>
            <h1 className="text-4xl font-black text-white tracking-tighter mb-2" style={{ fontFamily: 'Outfit' }}>
              Identity Sync.
            </h1>
            <p className="text-[10px] font-black text-emerald-500/40 uppercase tracking-[0.4em] font-mono">
              Secure Verification Nexus
            </p>
          </div>

          <div className="p-12">
            <AnimatePresence mode="wait">
              {verified ? (
                <motion.div
                  key="verified"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-8"
                >
                  <div className="inline-flex p-6 rounded-full bg-emerald-500/10 mb-8 shadow-xl shadow-emerald-500/10 border border-emerald-500/30">
                    <FiCheckCircle className="text-6xl text-emerald-500 animate-pulse" />
                  </div>
                  <h2 className="text-4xl font-black text-white mb-4 tracking-tighter uppercase" style={{ fontFamily: 'Outfit' }}>Synchronized.</h2>
                  <p className="text-slate-400 text-sm mb-12 leading-relaxed font-medium" style={{ fontFamily: 'Inter' }}>
                    Your citizen ID has been successfully stabilized. <br /><span className="text-emerald-500/60 font-mono text-[10px] uppercase tracking-widest font-black">Establishing secure portal redirect...</span>
                  </p>
                  <Link
                    to={userType === 'organization' ? '/login/org' : '/login/user'}
                    className="w-full inline-flex items-center justify-center p-6 bg-emerald-500 text-black rounded-2xl font-black uppercase tracking-[0.3em] text-[11px] font-mono hover:bg-emerald-400 transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                  >
                    Enter Portal Now <FiArrowRight className="ml-3 text-lg" />
                  </Link>
                </motion.div>
              ) : (
                <div className="space-y-10">
                  {/* Error & Info */}
                  <AnimatePresence>
                    {error && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-4">
                        <FiAlertCircle className="text-rose-400 text-2xl shrink-0" />
                        <span className="text-[10px] font-black text-rose-200 uppercase tracking-widest font-mono">{error}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="p-6 bio-card border-white/5 bg-white/[0.02] flex gap-5 items-start">
                    <FiMail className="text-emerald-500 text-2xl mt-1 shrink-0" />
                    <div>
                      <p className="text-[10px] font-black text-white uppercase tracking-widest font-mono mb-2">Incoming Sync Frequency</p>
                      <p className="text-sm text-slate-400 leading-relaxed font-medium" style={{ fontFamily: 'Inter' }}>
                        We have transmitted a 6-digit synchronization code to your sector-registered email. Input the cipher below to stabilize your ID.
                      </p>
                    </div>
                  </div>

                  {/* Manual Entry Form */}
                  <form onSubmit={handleManualSubmit} className="space-y-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 font-mono px-2">Sector Address (Email)</label>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-sm text-white focus:outline-none focus:border-emerald-500/30 font-mono uppercase tracking-widest"
                        placeholder="CITIZEN@GREENCITY.COM" required />
                    </div>

                    <div className="space-y-3 text-center">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 font-mono inline-block mb-2">6-Digit Sync Cipher</label>
                      <input type="text" value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-8 text-5xl text-center text-white font-black tracking-[0.5em] focus:outline-none focus:border-emerald-500/30 placeholder:opacity-5 transition-all font-mono"
                        placeholder="000000" maxLength={6} required />
                    </div>

                    <div className="relative text-center py-2">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                      <span className="relative bg-[#0d261a] px-5 text-[9px] font-black text-slate-700 uppercase tracking-widest font-mono">Alternative Token Stream</span>
                    </div>

                    <input type="text" value={token} onChange={(e) => setToken(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-[10px] font-mono text-slate-600 focus:outline-none focus:border-emerald-500/30 uppercase tracking-widest"
                      placeholder="PASTE AUTHENTICATION TOKEN SIGNATURE" />

                    <button
                      type="submit" disabled={loading}
                      className="group w-full py-6 rounded-2xl bg-emerald-500 text-black font-black uppercase tracking-[0.3em] text-[11px] font-mono hover:bg-emerald-400 active:scale-98 transition-all shadow-[0_0_30px_rgba(16,185,129,0.2)] disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                      {loading ? <FiActivity className="animate-spin" /> : <FiZap />}
                      {loading ? 'Stabilizing Signal...' : 'Synchronize Identity'}
                    </button>
                  </form>

                  {/* Footer Controls */}
                  <div className="pt-8 border-t border-white/5 text-center space-y-8">
                    <button
                      onClick={handleResend} disabled={resending || !email}
                      className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500/60 hover:text-emerald-500 transition-all flex items-center justify-center gap-3 mx-auto disabled:opacity-30 font-mono"
                    >
                      {resending ? <FiActivity className="animate-spin" /> : <FiRotateCcw className="text-lg" />}
                      Retransmit Sync Signal
                    </button>

                    <div className="flex items-center justify-center gap-10">
                      <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.4em] text-slate-700 font-mono">
                        <FiClock className="text-emerald-500/40" /> 10M TTL
                      </div>
                      <Link
                        to={userType === 'organization' ? '/login/org' : '/login/user'}
                        className="text-[9px] font-black text-slate-600 hover:text-emerald-500 transition-colors uppercase tracking-[0.3em] font-mono underline decoration-white/5 underline-offset-8"
                      >
                        Exit Portal
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default VerifyEmailPage;
