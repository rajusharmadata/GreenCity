import React, { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import { API_ROOT } from '../config/api';

const OAuthButtons = () => {
  const [loading, setLoading] = useState({ google: false, github: false });
  const [status, setStatus] = useState('');

  const handleRedirect = (provider) => {
    setStatus(`Redirecting to ${provider === 'google' ? 'Google' : 'GitHub'}...`);
    setLoading((prev) => ({ ...prev, [provider]: true }));

    try {
      const oauthUrl = `${API_ROOT}/auth/${provider}`;
      window.location.href = oauthUrl;
    } catch (error) {
      console.error(`${provider} login error:`, error);
      setStatus(`${provider === 'google' ? 'Google' : 'GitHub'} login failed. Please try again later.`);
      setLoading({ google: false, github: false });
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      {status && (
        <p className="text-center text-xs text-slate-500" aria-live="polite">
          {status}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleRedirect('google')}
          disabled={loading.google || loading.github}
          className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {loading.google ? (
            <div className="w-4 h-4 border-2 border-gray-300 border-t-emerald-500 rounded-full animate-spin" />
          ) : (
            <>
              <FcGoogle className="w-5 h-5 mr-2" />
              Google
            </>
          )}
        </button>

        <button
          onClick={() => handleRedirect('github')}
          disabled={loading.google || loading.github}
          className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {loading.github ? (
            <div className="w-4 h-4 border-2 border-gray-300 border-t-emerald-500 rounded-full animate-spin" />
          ) : (
            <>
              <FaGithub className="w-5 h-5 mr-2" />
              GitHub
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default OAuthButtons;
