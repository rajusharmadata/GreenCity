import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/authcontext';
import { useNotification } from '../context/NotificationContext';
import OAuthButtons from '../components/OAuthButtons';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/button';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  User,
  Leaf,
  Shield,
  Zap,
  CheckCircle,
  Globe,
  Heart,
  TrendingUp
} from 'lucide-react';

function UserLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, error: authError, clearError, loading: authLoading } = useAuth();
  const { success, error: showError } = useNotification();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const from = location.state?.from?.pathname || '/user-dashboard';

  useEffect(() => {
    return () => {
      clearError();
      setFormError('');
    };
  }, []);

  useEffect(() => {
    if (authError) {
      setFormError(authError);
    }
  }, [authError]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value.trim()
    }));

    if (formError) {
      setFormError('');
      clearError();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setFormError('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      await login(formData.email, formData.password, "user");
      success('Welcome back! You have successfully logged in.');
      navigate(from, { replace: true });
    } catch (err) {
      // Handle email verification requirement
      if (err.requiresVerification) {
        setFormError('Please verify your email before logging in.');
        setTimeout(() => {
          navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);
        }, 2000);
      } else {
        setFormError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex">
      {/* Left Side - Illustration & Info */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 to-blue-600 text-white p-12 flex-col justify-center"
      >
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex items-center mb-6">
              <Leaf className="w-12 h-12 mr-3" />
              <h1 className="text-4xl font-bold">GreenCity</h1>
            </div>
            <p className="text-xl text-green-100">
              Join our community in making cities more sustainable and eco-friendly
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            <div className="flex items-start space-x-4">
              <div className="bg-white/20 rounded-lg p-3">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Track Your Impact</h3>
                <p className="text-green-100 text-sm">
                  Monitor your eco-friendly activities and see your positive impact on the
                  environment
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-white/20 rounded-lg p-3">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Community Driven</h3>
                <p className="text-green-100 text-sm">
                  Connect with like-minded individuals working towards a greener future
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-white/20 rounded-lg p-3">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Earn Rewards</h3>
                <p className="text-green-100 text-sm">
                  Get eco points for your contributions and climb the leaderboard
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 bg-white/10 rounded-xl p-6 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Active Users</span>
              <span className="text-2xl font-bold">10,234</span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Issues Resolved</span>
              <span className="text-2xl font-bold">5,678</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Trees Saved</span>
              <span className="text-2xl font-bold">1,234</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side - Login Form */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full lg:w-1/2 flex items-center justify-center p-8"
      >
        <Card className="w-full max-w-md border border-white/40 shadow-2xl">
          <CardHeader className="text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
              <Shield className="h-6 w-6 text-emerald-600" />
            </div>
            <CardTitle className="text-3xl">Welcome Back</CardTitle>
            <CardDescription>Sign in to your citizen dashboard</CardDescription>
          </CardHeader>

          {formError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-6 mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="font-medium">{formError}</p>
                  {formError.includes('verify') && (
                    <p className="text-xs text-red-600">
                      Check your inbox for the verification email or request a fresh link.
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          <CardContent>
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute inset-y-0 left-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    className="pl-"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute inset-y-0 left-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-gray-600">
                  <input
                    id="remember"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  Remember me
                </label>
                <Link to="/forgot-password" className="font-medium text-emerald-600 hover:text-emerald-700">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                loading={isSubmitting || authLoading}
                className="w-full bg-gradient-to-r from-emerald-600 to-sky-600 text-white hover:from-emerald-700 hover:to-sky-700"
              >
                {isSubmitting || authLoading ? (
                  'Signing in...'
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </motion.form>
          </CardContent>

          <CardFooter className="flex flex-col gap-6">
            <p className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register/user" className="font-semibold text-emerald-600 hover:text-emerald-700">
                Create a free account
              </Link>
            </p>
            <div className="w-full">
              <OAuthButtons />
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}

export default UserLoginPage;
