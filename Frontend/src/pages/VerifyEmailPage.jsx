import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/authcontext';
import { useNotification } from '../context/NotificationContext';
import {
  Mail,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Shield,
  Clock
} from 'lucide-react';

function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyEmail, resendVerificationEmail } = useAuth();
  const { success, error: showError } = useNotification();
  
  const [otp, setOtp] = useState('');
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState('user'); // 'user' or 'organization'
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    const emailParam = searchParams.get('email');
    const typeParam = searchParams.get('type'); // 'user' or 'organization'
    
    if (tokenParam) setToken(tokenParam);
    if (emailParam) setEmail(decodeURIComponent(emailParam));
    if (typeParam) setUserType(typeParam);
    else {
      // Try to detect from localStorage
      const storedType = localStorage.getItem('userType');
      if (storedType === 'organization') setUserType('organization');
    }
    
    // Auto-verify if token and email are present (but not OTP)
    if (tokenParam && emailParam && tokenParam.length > 6 && !loading && !verified) {
      handleVerify(tokenParam, decodeURIComponent(emailParam));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleVerify = async (verifyTokenOrOtp, verifyEmailAddr) => {
    if (!verifyTokenOrOtp || !verifyEmailAddr) {
      setError('OTP/Token and email are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await verifyEmail(verifyTokenOrOtp, verifyEmailAddr, userType);
      setVerified(true);
      success('Email verified successfully!');
      
      // Redirect to appropriate login page after 2 seconds
      setTimeout(() => {
        const loginPath = userType === 'organization' ? '/login/org' : '/login/user';
        navigate(loginPath, { 
          state: { message: 'Email verified! You can now login.' }
        });
      }, 2000);
    } catch (err) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setResending(true);
    setError('');

    try {
      await resendVerificationEmail(email, userType);
      success('Verification email sent! Please check your inbox.');
    } catch (err) {
      setError(err.message || 'Failed to resend verification email.');
    } finally {
      setResending(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    const verifyValue = otp || token;
    if (!verifyValue) {
      setError('Please enter OTP or token');
      return;
    }
    handleVerify(verifyValue, email);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-blue-600 p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4"
            >
              <Shield className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-2">Verify Your Email</h1>
            <p className="text-green-100">
              {verified ? 'Email verified successfully!' : 'Please verify your email to continue'}
            </p>
          </div>

          <div className="p-8">
            {verified ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h2>
                <p className="text-gray-600 mb-6">
                  Your email has been successfully verified. You can now access all features.
                </p>
                <Link
                  to={userType === 'organization' ? '/login/org' : '/login/user'}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all font-medium"
                >
                  Go to Login
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </motion.div>
            ) : (
              <>
                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start"
                  >
                    <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-red-700 text-sm font-medium">Verification Failed</p>
                      <p className="text-red-600 text-sm mt-1">{error}</p>
                    </div>
                  </motion.div>
                )}

                {/* Info Message */}
                <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <Mail className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-blue-800 text-sm font-medium mb-1">
                        Check your email inbox
                      </p>
                      <p className="text-blue-700 text-sm">
                        We've sent a 6-digit OTP code to your email address. Enter it below to verify your account.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Manual Verification Form */}
                <form onSubmit={handleManualSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="your@email.com"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                      OTP Code (6 digits)
                    </label>
                    <input
                      id="otp"
                      type="text"
                      value={otp}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setOtp(value);
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-2xl text-center tracking-widest"
                      placeholder="000000"
                      maxLength={6}
                      pattern="[0-9]{6}"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Enter the 6-digit code sent to your email</p>
                  </div>

                  <div className="text-center text-sm text-gray-500">or</div>

                  <div>
                    <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
                      Verification Token (Alternative)
                    </label>
                    <input
                      id="token"
                      type="text"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
                      placeholder="Paste verification token here (if you have one)"
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-4 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Verify Email
                      </>
                    )}
                  </motion.button>
                </form>

                {/* Divider */}
                <div className="my-6 flex items-center">
                  <div className="flex-1 border-t border-gray-300"></div>
                  <span className="px-4 text-sm text-gray-500">or</span>
                  <div className="flex-1 border-t border-gray-300"></div>
                </div>

                {/* Resend Verification */}
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    Didn't receive the email? Check your spam folder or resend the verification OTP.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleResend}
                    disabled={resending || !email}
                    className="inline-flex items-center px-6 py-3 border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resending ? (
                      <>
                        <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-5 h-5 mr-2" />
                        Resend Verification Email
                      </>
                    )}
                  </motion.button>
                </div>

                {/* Help Text */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start">
                    <Clock className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">OTP Expires</p>
                      <p className="text-xs text-gray-600">
                        The OTP code is valid for 10 minutes. If it expires, you can request a new one.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Back to Login */}
                <div className="mt-6 text-center">
                  <Link
                    to={userType === 'organization' ? '/login/org' : '/login/user'}
                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    Back to Login
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default VerifyEmailPage;

