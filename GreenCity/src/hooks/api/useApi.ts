import { useState, useCallback } from 'react';
import { API_BASE_URL } from '../../constants/app';
import { showSuccessToast, showErrorToast } from '../../components/ui/Toast';
import { parseApiError, getUserFriendlyMessage, isAuthError, logError, AppError } from '../../utils/errorHandler';

interface UseApiOptions {
  showToast?: boolean;
  successMessage?: string;
  skipErrorHandling?: boolean;
}

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const request = useCallback(
    async <T = any>(
      endpoint: string,
      options: RequestInit = {},
      apiOptions: UseApiOptions = {}
    ): Promise<T | null> => {
      const { showToast = true, successMessage, skipErrorHandling = false } = apiOptions;
      
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token');
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          ...(options.headers as Record<string, string>),
        };

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          headers,
        });

        const data = await response.json();

        if (!response.ok) {
          const apiError = parseApiError({ response, data });
          throw apiError;
        }

        if (showToast && successMessage) {
          showSuccessToast(successMessage);
        }

        return data;
      } catch (err: any) {
        const parsedError = parseApiError(err);
        setError(parsedError);
        
        logError(parsedError, `API Request: ${endpoint}`);

        if (!skipErrorHandling && showToast) {
          const userMessage = getUserFriendlyMessage(parsedError);
          showErrorToast(userMessage);
        }

        // Handle auth errors - could trigger logout here
        if (isAuthError(parsedError)) {
          console.log('Auth error detected - should redirect to login');
          // You could add: navigation.navigate('/login');
        }
        
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const get = useCallback(
    <T = any>(endpoint: string, options?: UseApiOptions) => 
      request<T>(endpoint, { method: 'GET' }, options),
    [request]
  );

  const post = useCallback(
    <T = any>(endpoint: string, body: any, options?: UseApiOptions) => 
      request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }, options),
    [request]
  );

  const put = useCallback(
    <T = any>(endpoint: string, body: any, options?: UseApiOptions) => 
      request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }, options),
    [request]
  );

  const patch = useCallback(
    <T = any>(endpoint: string, body: any, options?: UseApiOptions) => 
      request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) }, options),
    [request]
  );

  const del = useCallback(
    <T = any>(endpoint: string, options?: UseApiOptions) => 
      request<T>(endpoint, { method: 'DELETE' }, options),
    [request]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    request,
    get,
    post,
    put,
    patch,
    delete: del,
    clearError,
  };
};
