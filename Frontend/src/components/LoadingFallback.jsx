import React from 'react';
import { FiLoader } from 'react-icons/fi';

const LoadingFallback = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="text-center">
        <div className="relative">
          <div className="absolute inset-0 bg-green-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
          <FiLoader className="h-16 w-16 text-green-600 mx-auto animate-spin relative z-10" />
        </div>
        <p className="mt-6 text-green-700 font-medium text-lg">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingFallback;
