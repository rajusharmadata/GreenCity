import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/authcontext';
import OAuthButtons from './OAuthButtons.jsx';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle,
  CheckCircle,
  ArrowRight,
  User,
  Shield,
  Loader2
} from 'lucide-react';

function LoginForm({ onClose }) {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock login logic - in real app, this would be an API call
      if (formData.email === 'test@example.com' && formData.password === 'password') {
        // Simulate successful login
        const userData = {
          email: formData.email,
          name: 'Test User',
          role: 'user'
        };
        
        await login(userData);
        setErrors({});
        setIsSuccess(true);
        
        setTimeout(() => {
          onClose();
          navigate('/user-dashboard');
        }, 1500);
      } else if (formData.email === 'admin@greencity.com' && formData.password === 'admin123') {
        // Simulate admin login
        const adminData = {
          email: formData.email,
          name: 'Admin User',
          role: 'admin'
        };
        
        await login(adminData);
        setErrors({});
        setIsSuccess(true);
        
        setTimeout(() => {
          onClose();
          navigate('/admin-dashboard');
        }, 1500);
      } else {
        setErrors({ submit: 'Invalid email or password. Please try again.' });
      }
    } catch (err) {
      setErrors({ submit: 'Login failed. Please try again.' });
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role) => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const demoData = role === 'admin' 
        ? { email: 'admin@greencity.com', name: 'Demo Admin', role: 'admin' }
        : { email: 'user@greencity.com', name: 'Demo User', role: 'user' };
      
      await login(demoData);
      setIsSuccess(true);
      
      setTimeout(() => {
        onClose();
        navigate(role === 'admin' ? '/admin-dashboard' : '/user-dashboard');
      }, 1500);
    } catch (err) {
      setErrors({ submit: 'Demo login failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Success Message */}
      {isSuccess && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-3"
        >
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-green-700 font-medium">Login successful! Redirecting...</p>
        </motion.div>
      )}

      {/* Error Message */}
      {errors.submit && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3"
        >
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-700 font-medium">{errors.submit}</p>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Field */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full pl-10 pr-3 py-3 border ${errors.email ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200`}
              placeholder="john@example.com"
              disabled={isLoading}
            />
          </div>
          {errors.email && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1 text-sm text-red-600 flex items-center space-x-1"
            >
              <AlertCircle className="w-3 h-3" />
              <span>{errors.email}</span>
            </motion.p>
          )}
        </motion.div>

        {/* Password Field */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`w-full pl-10 pr-10 py-3 border ${errors.password ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200`}
              placeholder="••••••••"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
          {errors.password && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1 text-sm text-red-600 flex items-center space-x-1"
            >
              <AlertCircle className="w-3 h-3" />
              <span>{errors.password}</span>
            </motion.p>
          )}
        </motion.div>

        {/* Remember Me & Forgot Password */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex items-center justify-between"
        >
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleInputChange}
              className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
              disabled={isLoading}
            />
            <span className="text-sm text-gray-600">Remember me</span>
          </label>
          
          <Link 
            to="/forgot-password" 
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            onClick={onClose}
          >
            Forgot password?
          </Link>
        </motion.div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <motion.button
            type="submit"
            disabled={isLoading || isSuccess}
            whileHover={{ scale: isLoading || isSuccess ? 1 : 1.02 }}
            whileTap={{ scale: isLoading || isSuccess ? 1 : 0.98 }}
            className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>Success!</span>
              </>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </motion.div>

        {/* Demo Accounts */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="space-y-3"
        >
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Demo Accounts</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              type="button"
              onClick={() => handleDemoLogin('user')}
              disabled={isLoading || isSuccess}
              whileHover={{ scale: isLoading || isSuccess ? 1 : 1.02 }}
              whileTap={{ scale: isLoading || isSuccess ? 1 : 0.98 }}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <User className="w-4 h-4" />
              <span>Demo User</span>
            </motion.button>
            
            <motion.button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              disabled={isLoading || isSuccess}
              whileHover={{ scale: isLoading || isSuccess ? 1 : 1.02 }}
              whileTap={{ scale: isLoading || isSuccess ? 1 : 0.98 }}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Shield className="w-4 h-4" />
              <span>Demo Admin</span>
            </motion.button>
          </div>
          
          <p className="text-xs text-gray-500 text-center">
            Use demo accounts to explore the platform
          </p>
        </motion.div>
        
        <OAuthButtons userType={userType} />
      </form>
    </motion.div>
  );
}

export default LoginForm;