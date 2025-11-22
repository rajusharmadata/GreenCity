import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Leaf, Zap } from 'lucide-react';

// Loading Spinner Component
export const LoadingSpinner = ({ size = 'md', color = 'green' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  return (
    <div className={`flex items-center justify-center ${sizeClasses[size]}`}>
      <Loader2 className={`w-full h-full text-${color}-600 animate-spin`} />
    </div>
  );
};

// Full Page Loading Component
export const FullPageLoading = ({ message = 'Loading...' }) => (
  <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center"
    >
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 mx-auto mb-4"
        >
          <Leaf className="w-full h-full text-green-600" />
        </motion.div>
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Zap className="w-8 h-8 text-yellow-500" />
        </motion.div>
      </div>
      <p className="text-gray-600 font-medium">{message}</p>
    </motion.div>
  </div>
);

// Card Loading Skeleton
export const CardSkeleton = ({ lines = 3 }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="bg-white rounded-lg shadow-md p-6 space-y-4"
  >
    <div className="animate-pulse">
      <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
      <div className="space-y-2">
        {[...Array(lines)].map((_, i) => (
          <div key={i} className="h-3 bg-gray-200 rounded"></div>
        ))}
      </div>
    </div>
  </motion.div>
);

// Table Loading Skeleton
export const TableSkeleton = ({ rows = 5, columns = 4 }) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden">
    <div className="animate-pulse">
      <div className="bg-gray-50 p-4 border-b">
        <div className="grid grid-cols-4 gap-4">
          {[...Array(columns)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-300 rounded"></div>
          ))}
        </div>
      </div>
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="p-4 border-b">
          <div className="grid grid-cols-4 gap-4">
            {[...Array(columns)].map((_, j) => (
              <div key={j} className="h-3 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Form Loading Overlay
export const FormLoadingOverlay = ({ message = 'Submitting...' }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg z-10"
  >
    <div className="text-center">
      <LoadingSpinner size="lg" />
      <p className="mt-2 text-gray-600 font-medium">{message}</p>
    </div>
  </motion.div>
);

// Button Loading State
export const LoadingButton = ({ children, loading, disabled, ...props }) => (
  <button
    {...props}
    disabled={loading || disabled}
    className={`flex items-center justify-center ${props.className || ''}`}
  >
    {loading && <LoadingSpinner size="sm" />}
    {loading && <span className="ml-2">{children}</span>}
    {!loading && children}
  </button>
);

// Progress Bar
export const ProgressBar = ({ progress = 0, color = 'green' }) => (
  <div className="w-full bg-gray-200 rounded-full h-2">
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${progress}%` }}
      transition={{ duration: 0.5 }}
      className={`bg-${color}-500 h-2 rounded-full`}
    />
  </div>
);

// Staggered Loading Animation
export const StaggeredLoading = ({ items = 6 }) => (
  <div className="flex items-center justify-center space-x-2">
    {[...Array(items)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          duration: 0.5,
          delay: i * 0.1,
          repeat: Infinity,
          repeatType: "reverse"
        }}
        className="w-2 h-2 bg-green-600 rounded-full"
      />
    ))}
  </div>
);

// Pulse Loading Animation
export const PulseLoading = () => (
  <div className="flex items-center justify-center">
    <motion.div
      animate={{
        scale: [1, 1.2, 1],
        opacity: [1, 0.7, 1]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className="w-8 h-8 bg-green-600 rounded-full"
    />
  </div>
);
