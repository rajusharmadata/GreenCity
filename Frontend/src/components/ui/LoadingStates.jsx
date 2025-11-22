import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, RefreshCw, Wifi, WifiOff } from 'lucide-react';

// Full page loader
export const PageLoader = ({ message = 'Loading...', size = 'default' }) => {
  const sizes = {
    sm: 'w-6 h-6',
    default: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className={`mx-auto mb-4 ${sizes[size]}`}
        >
          <Loader2 className="w-full h-full text-green-600" />
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-gray-600 font-medium"
        >
          {message}
        </motion.p>
      </motion.div>
    </div>
  );
};

// Skeleton loader for cards
export const CardSkeleton = ({ count = 1 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <div className="animate-pulse space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            </div>
            <div className="flex justify-between items-center pt-4">
              <div className="h-8 bg-gray-200 rounded w-20"></div>
              <div className="h-8 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Skeleton loader for lists
export const ListSkeleton = ({ count = 5, showAvatar = true }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center space-x-4 p-4 bg-white rounded-lg"
        >
          {showAvatar && <div className="w-10 h-10 bg-gray-200 rounded-full"></div>}
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded w-20"></div>
        </motion.div>
      ))}
    </div>
  );
};

// Table skeleton loader
export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {Array.from({ length: columns }).map((_, index) => (
              <th key={index} className="px-6 py-3">
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Inline spinner for buttons and forms
export const Spinner = ({ size = 'sm', className = '' }) => {
  const sizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    default: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={`${sizes[size]} ${className}`}
    >
      <Loader2 className="w-full h-full text-current" />
    </motion.div>
  );
};

// Loading states for different contexts
export const LoadingStates = {
  // Authentication loading
  Auth: () => (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 mx-auto mb-4"
        >
          <Loader2 className="w-full h-full text-green-600" />
        </motion.div>
        <p className="text-gray-600 font-medium">Authenticating...</p>
      </motion.div>
    </div>
  ),

  // Data fetching loading
  Data: ({ message = 'Loading data...' }) => (
    <div className="flex flex-col items-center justify-center py-12">
      <Spinner size="lg" className="text-green-600 mb-4" />
      <p className="text-gray-500 text-sm">{message}</p>
    </div>
  ),

  // Form submission loading
  Form: () => (
    <div className="flex items-center justify-center py-8">
      <Spinner size="sm" className="text-gray-600 mr-2" />
      <span className="text-gray-600 text-sm">Submitting...</span>
    </div>
  ),

  // Network error state
  NetworkError: ({ onRetry }) => (
    <div className="flex flex-col items-center justify-center py-12">
      <WifiOff className="w-12 h-12 text-red-500 mb-4" />
      <p className="text-gray-600 font-medium mb-2">Connection Error</p>
      <p className="text-gray-500 text-sm mb-4">Please check your internet connection</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </button>
      )}
    </div>
  ),

  // Empty state
  Empty: ({ message = 'No data available', icon: Icon }) => (
    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
      {Icon && <Icon className="w-12 h-12 mb-4 text-gray-400" />}
      <p className="text-medium">{message}</p>
    </div>
  ),

  // Success state
  Success: ({ message = 'Success!' }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center justify-center py-8 text-green-600"
    >
      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </div>
      <span className="font-medium">{message}</span>
    </motion.div>
  )
};

// Progressive loading component
export const ProgressiveLoader = ({ 
  isLoading, 
  error, 
  data, 
  children, 
  loadingComponent = <LoadingStates.Data />,
  errorComponent = <LoadingStates.NetworkError />,
  emptyComponent = <LoadingStates.Empty />
}) => {
  if (isLoading) return loadingComponent;
  if (error) return errorComponent;
  if (!data || (Array.isArray(data) && data.length === 0)) return emptyComponent;
  return children;
};

// Online status indicator
export const OnlineStatus = ({ isOnline }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center space-x-2"
    >
      {isOnline ? (
        <>
          <Wifi className="w-4 h-4 text-green-500" />
          <span className="text-xs text-green-600 font-medium">Online</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4 text-red-500" />
          <span className="text-xs text-red-600 font-medium">Offline</span>
        </>
      )}
    </motion.div>
  );
};

export default {
  PageLoader,
  CardSkeleton,
  ListSkeleton,
  TableSkeleton,
  Spinner,
  LoadingStates,
  ProgressiveLoader,
  OnlineStatus
};
