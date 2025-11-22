import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

// Notification context for managing app-wide notifications
const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const recentNotificationsRef = useRef(new Map()); // Track recent notifications to prevent duplicates

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    recentNotificationsRef.current.delete(id);
  }, []);

  const addNotification = useCallback((notification) => {
    const now = Date.now();
    const messageKey = notification.message;
    
    // Check if same message was shown recently (within 2 seconds)
    const recentEntry = recentNotificationsRef.current.get(messageKey);
    if (recentEntry && (now - recentEntry.timestamp) < 2000) {
      return recentEntry.id; // Return existing ID, don't add duplicate
    }
    
    const id = now.toString() + Math.random().toString(36).substr(2, 9);
    const newNotification = { id, ...notification };
    
    // Track this notification
    recentNotificationsRef.current.set(messageKey, { id, timestamp: now });
    
    // Clean up old entries (older than 5 seconds)
    for (const [key, value] of recentNotificationsRef.current.entries()) {
      if (now - value.timestamp > 5000) {
        recentNotificationsRef.current.delete(key);
      }
    }
    
    setNotifications(prev => [...prev, newNotification]);

    // Auto remove after duration
    if (notification.duration !== 0) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration || 5000);
    }

    return id;
  }, [removeNotification]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const success = useCallback((message, options = {}) => {
    return addNotification({ type: 'success', message, ...options });
  }, [addNotification]);

  const error = useCallback((message, options = {}) => {
    return addNotification({ type: 'error', message, ...options });
  }, [addNotification]);

  const info = useCallback((message, options = {}) => {
    return addNotification({ type: 'info', message, ...options });
  }, [addNotification]);

  const warning = useCallback((message, options = {}) => {
    return addNotification({ type: 'warning', message, ...options });
  }, [addNotification]);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    success,
    error,
    info,
    warning
  };

  const typeStyles = {
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    error: 'border-rose-200 bg-rose-50 text-rose-800',
    info: 'border-sky-200 bg-sky-50 text-sky-800',
    warning: 'border-amber-200 bg-amber-50 text-amber-800'
  };

  const typeIcon = {
    success: '✅',
    error: '⚠️',
    info: 'ℹ️',
    warning: '🚧'
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed top-4 right-4 z-[999] flex max-w-sm flex-col gap-3">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-lg shadow-black/5 ${typeStyles[notification.type] || typeStyles.info}`}
          >
            <span className="text-lg leading-none">{typeIcon[notification.type] || typeIcon.info}</span>
            <div className="flex-1 text-sm font-medium">
              {notification.message}
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="text-xs font-bold text-slate-500 hover:text-slate-700"
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
