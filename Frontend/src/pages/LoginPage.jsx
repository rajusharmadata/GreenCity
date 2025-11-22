import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, KeyRound, Eye, EyeOff, Mail, Building2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/authcontext';
import { useNotification } from '../context/NotificationContext';
import OAuthButtons from '../components/OAuthButtons.jsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/button';

function LoginPage({ isAdmin = false }) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { success } = useNotification();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const roleLabel = isAdmin ? 'Admin' : 'Organization';
  const accent = isAdmin
    ? 'from-slate-900 via-slate-800 to-slate-900'
    : 'from-emerald-600 via-emerald-500 to-sky-500';

  const handleChange = (event) => {
    const { id, value } = event.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    // Clear field-specific error when user types
    if (fieldErrors[id]) {
      setFieldErrors((prev) => ({ ...prev, [id]: '' }));
    }
    if (error) setError('');
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setFieldErrors({});

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const userType = isAdmin ? 'admin' : 'organization';
      await login(formData.email.trim(), formData.password, userType);
      success('Login successful!');

      const destination = isAdmin ? '/admin-dashboard' : '/organization-dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      if (err.requiresVerification) {
        setError('Please verify your email before logging in.');
        const userType = isAdmin ? 'admin' : 'organization';
        setTimeout(() => navigate(`/verify-email?email=${encodeURIComponent(formData.email)}&type=${userType}`), 1400);
      } else {
        const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Login failed. Please double-check your credentials.';
        setError(errorMessage);
      }
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-10 sm:px-6 lg:px-12 overflow-hidden">
      {/* Animated background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.15),_transparent_55%)]" />
      <div className="absolute inset-y-0 right-0 w-2/3 bg-[radial-gradient(circle_at_70%_20%,rgba(16,185,129,0.2),transparent)]" />
      <motion.div 
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            'radial-gradient(circle at 20% 50%, rgba(16,185,129,0.1), transparent 50%)',
            'radial-gradient(circle at 80% 50%, rgba(59,130,246,0.1), transparent 50%)',
            'radial-gradient(circle at 20% 50%, rgba(16,185,129,0.1), transparent 50%)',
          ]
        }}
        transition={{ duration: 10, repeat: Infinity, repeatType: 'reverse' }}
      />

      <div className="relative mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr] items-center">
        {/* Left side - Information panel */}
        <motion.section
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className={`hidden rounded-3xl border border-white/10 bg-gradient-to-br ${accent} p-10 text-white shadow-2xl shadow-emerald-900/30 lg:flex lg:flex-col backdrop-blur-sm`}
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3 text-white/90"
          >
            <div className="rounded-2xl bg-white/20 p-3 backdrop-blur-sm">
              {isAdmin ? <Shield className="h-6 w-6" /> : <Building2 className="h-6 w-6" />}
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] font-semibold">GreenCity Secure Access</p>
              <p className="text-base font-medium">{roleLabel} Portal</p>
            </div>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 text-4xl font-bold leading-tight"
          >
            {isAdmin 
              ? 'Admin Dashboard Access'
              : 'Transport Organization Login'
            }
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-4 text-lg text-white/80"
          >
            {isAdmin
              ? 'Manage city infrastructure, view reports, validate eco initiatives, and oversee community programs.'
              : 'Access your transport organization dashboard to manage routes, schedules, and vehicle registrations.'
            }
          </motion.p>

          <motion.ul 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-10 space-y-4 text-sm text-white/90"
          >
            {[
              isAdmin 
                ? 'View comprehensive reports and analytics'
                : 'Register and manage your transport fleet (Bus, Car, Train, etc.)',
              isAdmin
                ? 'Manage city infrastructure and validate initiatives'
                : 'List routes, schedules, and fares for citizens',
              isAdmin
                ? 'Oversee community programs and citizen issues'
                : 'Track transport usage and environmental impact'
            ].map((item, index) => (
              <motion.li 
                key={item}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="flex items-start gap-3"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-200 flex-shrink-0" />
                <span>{item}</span>
              </motion.li>
            ))}
          </motion.ul>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mt-auto rounded-2xl bg-white/10 backdrop-blur-sm p-5 text-sm border border-white/20"
          >
            <p className="text-white/70 mb-1">Need help or facing issues?</p>
            <p className="text-lg font-semibold text-white">support@greencity.gov</p>
            <p className="text-white/70 text-xs mt-1">24/7 Support Available</p>
          </motion.div>
        </motion.section>

        {/* Right side - Login form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="rounded-3xl border border-white/20 bg-white/95 backdrop-blur-md p-8 shadow-2xl shadow-black/20">
            <CardHeader className="space-y-3 pb-6">
              <div className="flex items-center gap-2">
                {!isAdmin && <Building2 className="h-5 w-5 text-emerald-500" />}
                {isAdmin && <Shield className="h-5 w-5 text-slate-600" />}
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">
                  {isAdmin ? 'Admin Access' : 'Transport Organization Access'}
                </p>
              </div>
              <CardTitle className="text-3xl font-bold text-slate-900">
                {isAdmin ? 'Admin Sign In' : 'Transport Organization Sign In'}
              </CardTitle>
              <CardDescription className="text-slate-600 text-base">
                {isAdmin 
                  ? 'Enter your admin credentials to access the management dashboard'
                  : 'Enter your credentials to manage your transport fleet and routes'
                }
              </CardDescription>
            </CardHeader>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mx-6 mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-start gap-2"
                >
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-slate-500" />
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your.email@organization.com"
                      required
                      error={fieldErrors.email}
                      className={`rounded-xl border-slate-300 bg-white pl-11 pr-4 py-3 transition-all ${
                        fieldErrors.email ? 'border-red-400 focus:border-red-500' : 'focus:border-emerald-500'
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-slate-500" />
                    Password
                  </label>
                  <div className="relative">
                    <KeyRound className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      required
                      error={fieldErrors.password}
                      className={`rounded-xl border-slate-300 bg-white pl-11 pr-12 py-3 transition-all ${
                        fieldErrors.password ? 'border-red-400 focus:border-red-500' : 'focus:border-emerald-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-3.5 rounded-lg p-1.5 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-emerald-500 focus:ring-emerald-200 cursor-pointer"
                    />
                    <span>Remember me</span>
                  </label>
                  <button 
                    type="button" 
                    className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                <Button
                  type="submit"
                  loading={loading}
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-sky-500 text-base font-semibold text-white py-6 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all"
                >
                  {loading ? 'Signing in...' : 'Sign In Securely'}
                </Button>
              </form>

              {!isAdmin && (
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-slate-500">Or continue with</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <OAuthButtons />
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col gap-3 text-sm pt-6 border-t border-slate-200">
              {!isAdmin ? (
                <div className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center">
                  <span className="text-slate-600">Don't have an account? </span>
                  <button
                    onClick={() => navigate('/register/org')}
                    className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    Register Transport Organization
                  </button>
                </div>
              ) : (
                <div className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-slate-600">
                  Admin access is separate from transport organizations. Contact the platform administrator.
                </div>
              )}
              <div className="text-center text-xs text-slate-400">
                <button
                  onClick={() => navigate('/login/user')}
                  className="font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  Switch to User Login
                </button>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default LoginPage;
