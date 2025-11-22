import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/authcontext.jsx';
import { useNotification } from '../context/NotificationContext';
import { ClipLoader } from 'react-spinners';

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithOAuth } = useAuth();
  const { success: notifySuccess, error: notifyError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const processedRef = useRef(false); // Prevent multiple executions

  useEffect(() => {
    // Prevent multiple executions
    if (processedRef.current) {
      return;
    }

    const handleOAuthCallback = async () => {
      // Mark as processed immediately
      processedRef.current = true;

      try {
        const token = searchParams.get('token');
        const userStr = searchParams.get('user');
        
        if (!token || !userStr) {
          throw new Error('Missing authentication data');
        }

        const userData = JSON.parse(decodeURIComponent(userStr));
        
        // Check if already authenticated to prevent duplicate processing
        const existingToken = localStorage.getItem('token');
        if (existingToken === token) {
          // Already processed, just redirect
          const redirectPath = userData.role === 'admin' ? '/admin-dashboard' : '/user-dashboard';
          navigate(redirectPath, { replace: true });
          return;
        }
        
        // Store in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('userType', userData.role === 'admin' ? 'admin' : 'user');
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Update auth context
        await loginWithOAuth(userData, token);
        
        // Show success notification only once
        notifySuccess(`Welcome back, ${userData.firstName || userData.username || 'GreenCitizen'}!`);
        
        // Redirect based on user role
        const redirectPath = userData.role === 'admin' ? '/admin-dashboard' : '/user-dashboard';
        navigate(redirectPath, { replace: true });
        
      } catch (error) {
        console.error('OAuth callback error:', error);
        setError(error.message || 'Authentication failed');
        notifyError('Authentication failed. Please try again.');
        
        // Reset processed flag on error to allow retry
        processedRef.current = false;
        
        // Redirect to login after a delay
        setTimeout(() => {
          navigate('/login/user', { replace: true });
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    handleOAuthCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <ClipLoader size={50} color="#10b981" />
          <p className="mt-4 text-gray-600">Completing authentication...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Failed</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default OAuthCallback;
