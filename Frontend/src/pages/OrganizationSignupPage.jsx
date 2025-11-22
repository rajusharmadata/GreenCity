import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Bus,
  Train,
  Car
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/authcontext';
import { useNotification } from '../context/NotificationContext';
  
const initialState = {
    organizationName: '',
    organizationId: '',
    email: '',
    phone: '',
    address: '',
    transportTypes: [],
    password: '',
    confirmPassword: ''
};

const TRANSPORT_OPTIONS = [
  { value: 'Bus', label: 'Bus', icon: '🚌' },
  { value: 'Train', label: 'Train', icon: '🚆' },
  { value: 'Metro', label: 'Metro', icon: '🚇' },
  { value: 'SharedCab', label: 'Shared Cab', icon: '🚗' },
  { value: 'Car', label: 'Car/Taxi', icon: '🚕' },
  { value: 'Bike', label: 'Bike/Scooter', icon: '🏍️' },
  { value: 'Other', label: 'Other', icon: '🚲' }
];

const OrganizationSignupPage = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { success } = useNotification();

  const [formData, setFormData] = useState(initialState);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState({});

  const sanitizedPhone = useMemo(() => formData.phone.replace(/\D/g, ''), [formData.phone]);

  const handleChange = (event) => {
    const { id, value, type, checked } = event.target;
    
    if (type === 'checkbox') {
      // Handle transport types selection
      if (id.startsWith('transport-')) {
        const transportType = id.replace('transport-', '');
        setFormData((prev) => ({
          ...prev,
          transportTypes: checked
            ? [...prev.transportTypes, transportType]
            : prev.transportTypes.filter(t => t !== transportType)
        }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [id]: value }));
    }
    
    // Clear field error when user types
    if (fieldErrors[id]) {
      setFieldErrors((prev) => ({ ...prev, [id]: '' }));
    }
    if (error) setError('');
  };

  const handleBlur = (fieldId) => {
    setTouched((prev) => ({ ...prev, [fieldId]: true }));
    validateField(fieldId);
  };

  const validateField = (fieldId) => {
    const errors = { ...fieldErrors };
    
    switch (fieldId) {
      case 'organizationName':
        if (!formData.organizationName.trim()) {
          errors.organizationName = 'Organization name is required';
        }
        break;
      case 'organizationId':
        if (!formData.organizationId.trim()) {
          errors.organizationId = 'Organization ID is required';
        }
        break;
      case 'address':
        if (!formData.address.trim()) {
          errors.address = 'Address is required';
        }
        break;
      case 'email':
        if (!formData.email.trim()) {
          errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
          errors.email = 'Please enter a valid email address';
        }
        break;
      case 'phone':
        if (!sanitizedPhone || sanitizedPhone.length < 10) {
          errors.phone = 'Enter a valid phone number (minimum 10 digits)';
        }
        break;
      case 'password':
        if (!formData.password) {
          errors.password = 'Password is required';
        } else if (formData.password.length < 8) {
          errors.password = 'Password must be at least 8 characters';
        }
        break;
      case 'confirmPassword':
        if (!formData.confirmPassword) {
          errors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
          errors.confirmPassword = 'Passwords do not match';
        }
        break;
      case 'transportTypes':
        if (!formData.transportTypes || formData.transportTypes.length === 0) {
          errors.transportTypes = 'Please select at least one transport type';
        }
        break;
    }
    
    setFieldErrors(errors);
    return !errors[fieldId];
  };

  const validateForm = () => {
    const fields = ['organizationName', 'organizationId', 'address', 'email', 'phone', 'transportTypes', 'password', 'confirmPassword'];
    let isValid = true;
    
    fields.forEach((field) => {
      if (!validateField(field)) {
        isValid = false;
      }
    });
    
    return isValid;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const result = await signup(
        {
          organizationName: formData.organizationName.trim(),
          organizationId: formData.organizationId.trim(),
          address: formData.address.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: Number(sanitizedPhone),
          transportTypes: formData.transportTypes,
          password: formData.password
        },
        'organization'
      );

      if (result?.requiresVerification) {
        success('Organization registered successfully! Please check your email for the OTP to verify your account.');
        setTimeout(() => {
          navigate(`/verify-email?email=${encodeURIComponent(formData.email.trim().toLowerCase())}&type=organization`, { replace: true });
        }, 1500);
      } else {
        success('Organization registered successfully! Await approval from GreenCity.');
        navigate('/login/org', { replace: true });
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-10 text-white sm:px-6 lg:px-10 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.2),_transparent_55%)]" />
      <motion.div 
        className="absolute inset-0 opacity-20"
        animate={{
          background: [
            'radial-gradient(circle at 20% 50%, rgba(16,185,129,0.15), transparent 50%)',
            'radial-gradient(circle at 80% 50%, rgba(59,130,246,0.15), transparent 50%)',
            'radial-gradient(circle at 20% 50%, rgba(16,185,129,0.15), transparent 50%)',
          ]
        }}
        transition={{ duration: 10, repeat: Infinity, repeatType: 'reverse' }}
      />

      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl border border-white/20 bg-white/5 backdrop-blur-md shadow-2xl shadow-emerald-900/40 lg:grid lg:grid-cols-[1.1fr_1fr] overflow-hidden"
        >
          {/* Left side - Information panel */}
          <motion.section 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="border-b border-white/10 bg-gradient-to-br from-emerald-600/50 via-emerald-700/40 to-slate-950/80 p-8 backdrop-blur-sm lg:border-b-0 lg:border-r lg:p-12"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-emerald-50/90 backdrop-blur-sm"
            >
              <ShieldCheck className="h-4 w-4 text-emerald-200" />
              Trusted Organization Portal
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8 text-4xl font-bold leading-tight tracking-tight sm:text-5xl"
            >
              Register Your Transport Organization
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-4 text-lg text-emerald-50/90"
            >
              Join GreenCity as a transport provider. Register your vehicles (Bus, Car, Train, etc.) 
              and help citizens find sustainable transportation options.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-10 space-y-4 text-sm text-emerald-50/90"
            >
              {[
                'Register and manage your transport fleet (Bus, Car, Train, etc.)',
                'List routes, schedules, and fares for citizens to discover',
                'Track your transport usage and environmental impact',
                'Connect with citizens looking for sustainable transport options'
              ].map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-300 flex-shrink-0" />
                  <p>{item}</p>
                </motion.div>
              ))}
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="mt-12 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-6 text-sm text-emerald-50/90"
            >
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-emerald-300" />
                <p className="font-semibold text-white text-base">Need Help?</p>
              </div>
              <p className="text-emerald-100/80">support@greencity.gov</p>
              <p className="text-emerald-100/70 text-xs mt-1">Available 24/7 for assistance</p>
            </motion.div>
          </motion.section>

          {/* Right side - Registration form */}
          <motion.section
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 sm:p-8 lg:p-10 bg-white/5 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col gap-2 mb-6"
            >
              <div className="flex items-center gap-2">
                <Bus className="h-5 w-5 text-emerald-400" />
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
                  Transport Organization Registration
                </p>
              </div>
              <h2 className="text-3xl font-bold text-white">Register Your Transport Company</h2>
              <p className="text-sm text-emerald-100/80">
                Provide your transport organization details and select the types of vehicles you operate
              </p>
            </motion.div>
          
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 rounded-xl border border-red-400/50 bg-red-500/20 px-4 py-3 text-sm text-red-200 flex items-start gap-2 backdrop-blur-sm"
                >
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>
              
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Organization Details Section */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                  <Building2 className="h-4 w-4 text-emerald-400" />
                  <label className="text-sm font-semibold text-emerald-50/90">Organization Details</label>
                </div>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <label htmlFor="organizationName" className="text-xs font-medium text-emerald-100/80">
                      Organization Name <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Building2 className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-emerald-300/70" />
                      <input
                        id="organizationName"
                        type="text"
                        value={formData.organizationName}
                        onChange={handleChange}
                        onBlur={() => handleBlur('organizationName')}
                        placeholder="e.g., Green Solutions Inc."
                        className={`w-full rounded-xl border ${
                          fieldErrors.organizationName 
                            ? 'border-red-400/50 bg-red-500/10' 
                            : 'border-white/20 bg-white/5'
                        } py-3 pl-11 pr-4 text-white placeholder:text-emerald-100/40 focus:border-emerald-400/60 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 transition-all`}
                      />
                    </div>
                    {touched.organizationName && fieldErrors.organizationName && (
                      <p className="text-xs text-red-300 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {fieldErrors.organizationName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="organizationId" className="text-xs font-medium text-emerald-100/80">
                      Organization ID <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <ShieldCheck className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-emerald-300/70" />
                      <input
                        id="organizationId"
                        type="text"
                        value={formData.organizationId}
                        onChange={handleChange}
                        onBlur={() => handleBlur('organizationId')}
                        placeholder="e.g., ORG-2024-001"
                        className={`w-full rounded-xl border ${
                          fieldErrors.organizationId 
                            ? 'border-red-400/50 bg-red-500/10' 
                            : 'border-white/20 bg-white/5'
                        } py-3 pl-11 pr-4 text-white placeholder:text-emerald-100/40 focus:border-emerald-400/60 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 transition-all`}
                      />
                    </div>
                    {touched.organizationId && fieldErrors.organizationId && (
                      <p className="text-xs text-red-300 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {fieldErrors.organizationId}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="address" className="text-xs font-medium text-emerald-100/80">
                      Registered Address <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-emerald-300/70" />
                      <textarea
                        id="address"
                        rows={3}
                        value={formData.address}
                        onChange={handleChange}
                        onBlur={() => handleBlur('address')}
                        placeholder="Enter your complete registered office address"
                        className={`w-full rounded-xl border ${
                          fieldErrors.address 
                            ? 'border-red-400/50 bg-red-500/10' 
                            : 'border-white/20 bg-white/5'
                        } py-3 pl-11 pr-4 text-white placeholder:text-emerald-100/40 focus:border-emerald-400/60 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 transition-all resize-none`}
                      />
                    </div>
                    {touched.address && fieldErrors.address && (
                      <p className="text-xs text-red-300 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {fieldErrors.address}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Transport Types Section */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                  <Bus className="h-4 w-4 text-emerald-400" />
                  <label className="text-sm font-semibold text-emerald-50/90">
                    Transport Types <span className="text-red-400">*</span>
                  </label>
                </div>
                <p className="text-xs text-emerald-100/70">
                  Select all transport types your organization operates
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {TRANSPORT_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                        formData.transportTypes.includes(option.value)
                          ? 'border-emerald-400 bg-emerald-500/20 text-white'
                          : 'border-white/20 bg-white/5 text-emerald-100/70 hover:border-emerald-300/50 hover:bg-white/10'
                      }`}
                    >
                      <input
                        type="checkbox"
                        id={`transport-${option.value}`}
                        checked={formData.transportTypes.includes(option.value)}
                        onChange={handleChange}
                        onBlur={() => handleBlur('transportTypes')}
                        className="rounded border-white/30 text-emerald-500 focus:ring-emerald-400 cursor-pointer"
                      />
                      <span className="text-lg">{option.icon}</span>
                      <span className="text-sm font-medium">{option.label}</span>
                    </label>
                  ))}
                </div>
                {touched.transportTypes && fieldErrors.transportTypes && (
                  <p className="text-xs text-red-300 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {fieldErrors.transportTypes}
                  </p>
                )}
              </div>

              {/* Contact Information Section */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                  <Mail className="h-4 w-4 text-emerald-400" />
                  <label className="text-sm font-semibold text-emerald-50/90">Contact Information</label>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-xs font-medium text-emerald-100/80">
                      Email Address <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-emerald-300/70" />
                      <input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={() => handleBlur('email')}
                        placeholder="contact@organization.com"
                        className={`w-full rounded-xl border ${
                          fieldErrors.email 
                            ? 'border-red-400/50 bg-red-500/10' 
                            : 'border-white/20 bg-white/5'
                        } py-3 pl-11 pr-4 text-white placeholder:text-emerald-100/40 focus:border-emerald-400/60 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 transition-all`}
                      />
                    </div>
                    {touched.email && fieldErrors.email && (
                      <p className="text-xs text-red-300 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {fieldErrors.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-xs font-medium text-emerald-100/80">
                      Phone Number <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-emerald-300/70" />
                      <input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        onBlur={() => handleBlur('phone')}
                        placeholder="+91 9876543210"
                        className={`w-full rounded-xl border ${
                          fieldErrors.phone 
                            ? 'border-red-400/50 bg-red-500/10' 
                            : 'border-white/20 bg-white/5'
                        } py-3 pl-11 pr-4 text-white placeholder:text-emerald-100/40 focus:border-emerald-400/60 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 transition-all`}
                      />
                    </div>
                    {touched.phone && fieldErrors.phone && (
                      <p className="text-xs text-red-300 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {fieldErrors.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>
                  
              {/* Password Section */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                  <KeyRound className="h-4 w-4 text-emerald-400" />
                  <label className="text-sm font-semibold text-emerald-50/90">Secure Access</label>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="password" className="text-xs font-medium text-emerald-100/80">
                      Password <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <KeyRound className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-emerald-300/70" />
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={() => handleBlur('password')}
                        placeholder="Create a strong password"
                        className={`w-full rounded-xl border ${
                          fieldErrors.password 
                            ? 'border-red-400/50 bg-red-500/10' 
                            : 'border-white/20 bg-white/5'
                        } py-3 pl-11 pr-12 text-white placeholder:text-emerald-100/40 focus:border-emerald-400/60 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 transition-all`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-3.5 rounded-lg p-1.5 text-emerald-100/70 hover:text-white hover:bg-white/10 transition-all"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {touched.password && fieldErrors.password && (
                      <p className="text-xs text-red-300 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {fieldErrors.password}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-xs font-medium text-emerald-100/80">
                      Confirm Password <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <KeyRound className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-emerald-300/70" />
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        onBlur={() => handleBlur('confirmPassword')}
                        placeholder="Re-enter your password"
                        className={`w-full rounded-xl border ${
                          fieldErrors.confirmPassword 
                            ? 'border-red-400/50 bg-red-500/10' 
                            : 'border-white/20 bg-white/5'
                        } py-3 pl-11 pr-12 text-white placeholder:text-emerald-100/40 focus:border-emerald-400/60 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 transition-all`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="absolute right-3 top-3.5 rounded-lg p-1.5 text-emerald-100/70 hover:text-white hover:bg-white/10 transition-all"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {touched.confirmPassword && fieldErrors.confirmPassword && (
                      <p className="text-xs text-red-300 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {fieldErrors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-xs text-emerald-100/60 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  Password must be at least 8 characters long
                </p>
              </div>
                
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-sky-500 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-800/40 transition-all hover:shadow-emerald-800/60 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Submitting Request...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="mr-2 h-5 w-5" />
                    Submit Registration
                  </>
                )}
              </motion.button>

              <p className="text-center text-xs text-emerald-100/70">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login/org')}
                  className="font-semibold text-emerald-300 hover:text-white transition-colors"
                >
                  Sign In Here
                </button>
              </p>
            </form>
          </motion.section>
        </motion.div>
      </div>
    </div>
  );
};

export default OrganizationSignupPage;
