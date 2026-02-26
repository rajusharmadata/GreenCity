import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCheckCircle,
  FiAlertCircle,
  FiInfo,
  FiAlertTriangle,
  FiX
} from 'react-icons/fi';

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
      return recentEntry.id;
    }

    const id = now.toString() + Math.random().toString(36).substr(2, 9);
    const newNotification = { id, ...notification };

    recentNotificationsRef.current.set(messageKey, { id, timestamp: now });

    // Clean up old entries (older than 5 seconds)
    for (const [key, value] of recentNotificationsRef.current.entries()) {
      if (now - value.timestamp > 5000) {
        recentNotificationsRef.current.delete(key);
      }
    }

    setNotifications(prev => [...prev, newNotification]);

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

  const typeConfig = {
    success: {
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-950/40',
      text: 'text-emerald-400',
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.1)]',
      icon: <FiCheckCircle className="text-xl" />
    },
    error: {
      border: 'border-rose-500/30',
      bg: 'bg-rose-950/40',
      text: 'text-rose-400',
      glow: 'shadow-[0_0_20px_rgba(244,63,94,0.1)]',
      icon: <FiAlertCircle className="text-xl" />
    },
    info: {
      border: 'border-cyan-500/30',
      bg: 'bg-cyan-950/40',
      text: 'text-cyan-400',
      glow: 'shadow-[0_0_20px_rgba(34,211,238,0.1)]',
      icon: <FiInfo className="text-xl" />
    },
    warning: {
      border: 'border-amber-500/30',
      bg: 'bg-amber-950/40',
      text: 'text-amber-400',
      glow: 'shadow-[0_0_20px_rgba(245,158,11,0.1)]',
      icon: <FiAlertTriangle className="text-xl" />
    }
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed top-6 right-6 z-[9999] flex max-w-sm flex-col gap-4">
        <AnimatePresence>
          {notifications.map((notification) => {
            const config = typeConfig[notification.type] || typeConfig.info;
            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: 50, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.95, transition: { duration: 0.2 } }}
                layout
                className={`pointer-events-auto flex items-center gap-4 rounded-2xl border backdrop-blur-xl px-5 py-4 ${config.border} ${config.bg} ${config.text} ${config.glow} relative overflow-hidden group`}
              >
                {/* Background Progress Bar (Optional Visual) */}
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: (notification.duration || 5000) / 1000, ease: 'linear' }}
                  className={`absolute bottom-0 left-0 h-[1.5px] bg-current opacity-20`}
                />

                <div className="shrink-0">
                  {config.icon}
                </div>

                <div className="flex-1 text-[11px] font-black uppercase tracking-widest font-mono leading-tight">
                  {notification.message}
                </div>

                <button
                  onClick={() => removeNotification(notification.id)}
                  className="p-2 rounded-lg hover:bg-white/5 text-current/40 hover:text-current transition-colors"
                  aria-label="Dismiss"
                >
                  <FiX />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
