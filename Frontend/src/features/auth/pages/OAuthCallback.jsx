import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiShield,
  FiActivity,
  FiAlertCircle,
  FiLoader,
  FiZap,
  FiCheckCircle
} from 'react-icons/fi';
import { useAuth } from '../context/authcontext.jsx';
import { useNotification } from '../../../context/NotificationContext';

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithOAuth } = useAuth();
  const { success: notifySuccess, error: notifyError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;

    const handleOAuthCallback = async () => {
      processedRef.current = true;
      try {
        const token = searchParams.get('token');
        const userStr = searchParams.get('user');

        if (!token || !userStr) throw new Error('Missing sectoral data');

        const userData = JSON.parse(decodeURIComponent(userStr));
        const existingToken = localStorage.getItem('token');

        if (existingToken === token) {
          const redirectPath = userData.role === 'admin' ? '/admin-dashboard' : '/user-dashboard';
          navigate(redirectPath, { replace: true });
          return;
        }

        localStorage.setItem('token', token);
        localStorage.setItem('userType', userData.role === 'admin' ? 'admin' : 'user');
        localStorage.setItem('userData', JSON.stringify(userData));

        await loginWithOAuth(userData, token);
        notifySuccess(`Uplink verified. Welcome, ${userData.firstName || userData.username || 'Citizen'}.`);

        const redirectPath = userData.role === 'admin' ? '/admin-dashboard' : '/user-dashboard';
        navigate(redirectPath, { replace: true });

      } catch (error) {
        console.error('OAuth callback error:', error);
        setError(error.message || 'Authentication sequence failed');
        notifyError('Uplink failed. Retrying in secondary mode.');
        processedRef.current = false;
        setTimeout(() => navigate('/login/user', { replace: true }), 3000);
      } finally {
        setLoading(false);
      }
    };

    handleOAuthCallback();
  }, [loginWithOAuth, navigate, notifyError, notifySuccess, searchParams]);

  return (
    <div className="min-h-screen bg-[#030d0a] flex items-center justify-center p-6 relative overflow-hidden selection:bg-emerald-500/20">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-emerald-500/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-teal-500/5 blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-md text-center"
      >
        <div className="bio-card border-white/10 p-12 shadow-2xl relative overflow-hidden">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-10">
                <div className="relative inline-block">
                  <div className="p-8 rounded-[2rem] bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                    <FiActivity className="text-6xl text-emerald-500 animate-pulse" />
                  </div>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-3 -right-3 p-3 bg-emerald-500 text-black rounded-full shadow-xl"
                  >
                    <FiShield className="text-sm" />
                  </motion.div>
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white tracking-tighter mb-2" style={{ fontFamily: 'Outfit' }}>Establishing Link.</h3>
                  <p className="text-[10px] font-black text-emerald-500/40 uppercase tracking-[0.4em] font-mono">Synchronizing Neural Credentials</p>
                </div>
                <div className="flex justify-center gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" />
                </div>
              </motion.div>
            ) : error ? (
              <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-10">
                <div className="p-8 rounded-[2rem] bg-rose-500/10 border border-rose-500/20 inline-block">
                  <FiAlertCircle className="text-6xl text-rose-400" />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white tracking-tighter mb-2" style={{ fontFamily: 'Outfit' }}>Uplink Failed.</h3>
                  <p className="text-sm text-slate-400 font-medium px-4 leading-relaxed" style={{ fontFamily: 'Inter' }}>{error}</p>
                </div>
                <div className="pt-4">
                  <p className="text-[9px] text-rose-500/40 uppercase tracking-[0.3em] font-mono animate-pulse">Redirecting to Regional Portal...</p>
                </div>
              </motion.div>
            ) : (
              <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                <div className="p-8 rounded-[2rem] bg-emerald-500/10 border border-emerald-500/20 inline-block">
                  <FiCheckCircle className="text-6xl text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white tracking-tighter mb-2" style={{ fontFamily: 'Outfit' }}>Link Verified.</h3>
                  <p className="text-[10px] font-black text-emerald-500/40 uppercase tracking-[0.4em] font-mono">Access Status: Stable</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default OAuthCallback;
