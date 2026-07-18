/**
 * Error Toast Integration
 * Centralized error toast display with different styles based on error severity
 */

import { AppError, getErrorSeverity, createError } from './errorHandler';
import { showErrorToast as uiShowErrorToast, showWarningToast, showInfoToast } from '../components/ui/Toast';

/**
 * Show error as toast with appropriate styling based on severity
 */
export const showErrorToast = (error: AppError) => {
  const severity = getErrorSeverity(error);
  
  switch (severity) {
    case 'high':
      uiShowErrorToast(error.message);
      break;
    case 'medium':
      showWarningToast(error.message);
      break;
    case 'low':
      showInfoToast(error.message);
      break;
  }
};

/**
 * Show network error toast
 */
export const showNetworkErrorToast = () => {
  const error = createError('Unable to connect. Please check your internet connection.', 'NETWORK_ERROR');
  showErrorToast(error);
};

/**
 * Show server error toast
 */
export const showServerErrorToast = () => {
  const error = createError('Server error. Our team has been notified.', 'SERVER_ERROR');
  showErrorToast(error);
};

/**
 * Show auth error toast
 */
export const showAuthErrorToast = () => {
  const error = createError('Please login to continue.', 'AUTH_ERROR');
  showErrorToast(error);
};

/**
 * Show validation error toast
 */
export const showValidationErrorToast = (message: string) => {
  const error = createError(message, 'VALIDATION_ERROR');
  showErrorToast(error);
};

/**
 * Show rate limit error toast
 */
export const showRateLimitErrorToast = () => {
  const error = createError('Too many requests. Please wait a moment and try again.', 'RATE_LIMIT_ERROR');
  showErrorToast(error);
};
