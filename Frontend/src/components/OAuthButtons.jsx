import React, { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import { FiActivity } from 'react-icons/fi';
import { API_ROOT } from '../config/api';

const OAuthButtons = () => {
  const [loading, setLoading] = useState({ google: false, github: false });
  const [status, setStatus] = useState('');

  const handleRedirect = (provider) => {
    setStatus(`Routing to ${provider === 'google' ? 'Google' : 'GitHub'} Node...`);
    setLoading((prev) => ({ ...prev, [provider]: true }));

    try {
      const oauthUrl = `${API_ROOT}/auth/${provider}`;
      window.location.href = oauthUrl;
    } catch (error) {
      console.error(`${provider} login error:`, error);
      setStatus(`${provider === 'google' ? 'Google' : 'GitHub'} Signal Offline.`);
      setLoading({ google: false, github: false });
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/5" />
        </div>
        <div className="relative flex justify-center text-[9px] font-black uppercase tracking-[0.4em] font-mono">
          <span className="px-4 bg-[#0d261a] text-slate-700">External Pulse</span>
        </div>
      </div>

      {status && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-[9px] font-black text-emerald-500/40 uppercase tracking-widest font-mono"
        >
          {status}
        </motion.p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => handleRedirect('google')}
          disabled={loading.google || loading.github}
          className="flex items-center justify-center gap-3 px-6 py-4 bio-card border-white/5 bg-white/[0.02] hover:bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all disabled:opacity-50 font-mono"
        >
          {loading.google ? (
            <FiActivity className="animate-spin text-emerald-500" />
          ) : (
            <>
              <FcGoogle className="text-lg" />
              Google
            </>
          )}
        </button>

        <button
          onClick={() => handleRedirect('github')}
          disabled={loading.google || loading.github}
          className="flex items-center justify-center gap-3 px-6 py-4 bio-card border-white/5 bg-white/[0.02] hover:bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all disabled:opacity-50 font-mono"
        >
          {loading.github ? (
            <FiActivity className="animate-spin text-emerald-500" />
          ) : (
            <>
              <FaGithub className="text-lg text-white" />
              GitHub
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default OAuthButtons;
