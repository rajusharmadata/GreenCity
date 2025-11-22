import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, CheckCircle, X } from 'lucide-react';

const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <Loader2 className={`${sizeClasses[size]} text-green-600`} />
      </motion.div>
      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-gray-600"
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

const PageLoader = () => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        <LoadingSpinner size="xl" text="Loading..." />
      </motion.div>
    </div>
  );
};

const ErrorNotification = ({ error, onClose, type = 'error' }) => {
  const icons = {
    error: AlertCircle,
    success: CheckCircle,
    warning: AlertCircle,
    info: AlertCircle
  };

  const colors = {
    error: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  const Icon = icons[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-lg border shadow-lg max-w-md ${colors[type]}`}
    >
      <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
      <p className="text-sm font-medium flex-1">{error}</p>
      <button
        onClick={onClose}
        className="ml-3 hover:opacity-70 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

const FormLoader = ({ isLoading, children }) => {
  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
          <LoadingSpinner size="md" />
        </div>
      )}
      {children}
    </div>
  );
};

const ButtonLoader = ({ isLoading, children, disabled = false, ...props }) => {
  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={`
        relative inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200
        ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg transform hover:scale-105'}
      `}
    >
      {isLoading && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="absolute left-2"
        >
          <Loader2 className="w-4 h-4" />
        </motion.div>
      )}
      <span className={isLoading ? 'ml-6' : ''}>{children}</span>
    </button>
  );
};

const SkeletonLoader = ({ className = '', lines = 3 }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.1 }}
          className="h-4 bg-gray-200 rounded animate-pulse"
          style={{ width: `${Math.random() * 40 + 60}%` }}
        />
      ))}
    </div>
  );
};

const CardSkeleton = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-lg shadow-md p-6 space-y-4"
    >
      <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
      </div>
      <div className="h-10 bg-gray-200 rounded w-1/2 animate-pulse" />
    </motion.div>
  );
};

export {
  LoadingSpinner,
  PageLoader,
  ErrorNotification,
  FormLoader,
  ButtonLoader,
  SkeletonLoader,
  CardSkeleton
};

export default LoadingSpinner;
