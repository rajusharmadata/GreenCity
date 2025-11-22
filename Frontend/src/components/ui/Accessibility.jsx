import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

// Custom hook for keyboard navigation
export const useKeyboardNavigation = (items, onSelect, options = {}) => {
  const [activeIndex, setActiveIndex] = useState(options.initialIndex || 0);
  const { orientation = 'vertical', loop = true } = options;

  useEffect(() => {
    const handleKeyDown = (event) => {
      const { key } = event;
      
      switch (key) {
        case 'ArrowDown':
        case 'ArrowRight':
          if (orientation === 'vertical' || key === 'ArrowRight') {
            event.preventDefault();
            setActiveIndex(prev => {
              const next = prev + 1;
              return next >= items.length ? (loop ? 0 : prev) : next;
            });
          }
          break;
          
        case 'ArrowUp':
        case 'ArrowLeft':
          if (orientation === 'vertical' || key === 'ArrowLeft') {
            event.preventDefault();
            setActiveIndex(prev => {
              const next = prev - 1;
              return next < 0 ? (loop ? items.length - 1 : prev) : next;
            });
          }
          break;
          
        case 'Enter':
        case ' ':
          event.preventDefault();
          if (items[activeIndex]) {
            onSelect(items[activeIndex], activeIndex);
          }
          break;
          
        case 'Home':
          event.preventDefault();
          setActiveIndex(0);
          break;
          
        case 'End':
          event.preventDefault();
          setActiveIndex(items.length - 1);
          break;
          
        case 'Escape':
          if (options.onEscape) {
            event.preventDefault();
            options.onEscape();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [items, activeIndex, onSelect, orientation, loop, options.onEscape]);

  return { activeIndex, setActiveIndex };
};

// Focus trap hook for modals and dropdowns
export const useFocusTrap = (isActive) => {
  const containerRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!isActive) return;

    // Store the previously focused element
    previousFocusRef.current = document.activeElement;

    const container = containerRef.current;
    if (!container) return;

    // Get all focusable elements
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    
    // Focus the first element
    if (firstElement) {
      firstElement.focus();
    }

    return () => {
      container.removeEventListener('keydown', handleTabKey);
      
      // Restore focus to the previously focused element
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isActive]);

  return containerRef;
};

// Skip link component for accessibility
export const SkipLink = ({ href = '#main-content', children = 'Skip to main content' }) => {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-green-600 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 z-50"
    >
      {children}
    </a>
  );
};

// Live region for screen readers
export const LiveRegion = ({ politeness = 'polite', children }) => {
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    if (children) {
      setAnnouncement(children);
      const timer = setTimeout(() => setAnnouncement(''), 1000);
      return () => clearTimeout(timer);
    }
  }, [children]);

  return (
    <div
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  );
};

// Accessible form field wrapper
export const AccessibleField = ({ 
  label, 
  error, 
  hint, 
  required, 
  children, 
  id 
}) => {
  const fieldId = id || `field-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;

  return (
    <div className="space-y-2">
      {label && (
        <label 
          htmlFor={fieldId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
        </label>
      )}
      
      <div className="relative">
        {React.cloneElement(children, {
          id: fieldId,
          'aria-describedby': [
            hint ? hintId : null,
            error ? errorId : null
          ].filter(Boolean).join(' '),
          'aria-invalid': Boolean(error),
          'aria-required': required
        })}
      </div>
      
      {hint && (
        <p id={hintId} className="text-sm text-gray-500">
          {hint}
        </p>
      )}
      
      {error && (
        <p id={errorId} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

// Accessible progress bar
export const AccessibleProgress = ({ value, max = 100, label, showValue = true }) => {
  const percentage = Math.round((value / max) * 100);
  
  return (
    <div className="space-y-2">
      {label && (
        <div className="flex justify-between text-sm text-gray-600">
          <span>{label}</span>
          {showValue && <span>{percentage}%</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label || `Progress ${percentage}%`}
        className="w-full bg-gray-200 rounded-full h-2"
      >
        <motion.div
          className="bg-green-600 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};

// Accessible tooltip
export const AccessibleTooltip = ({ content, children, placement = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipId = `tooltip-${Math.random().toString(36).substr(2, 9)}`;

  const placementClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        aria-describedby={isVisible ? tooltipId : undefined}
      >
        {children}
      </div>
      
      {isVisible && (
        <motion.div
          id={tooltipId}
          role="tooltip"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`absolute z-50 px-2 py-1 text-sm text-white bg-gray-900 rounded ${placementClasses[placement]}`}
        >
          {content}
          <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45" />
        </motion.div>
      )}
    </div>
  );
};

// Screen reader only component
export const ScreenReaderOnly = ({ children, as: Component = 'span' }) => {
  return (
    <Component className="sr-only">
      {children}
    </Component>
  );
};

// Visually hidden but accessible component
export const VisuallyHidden = ({ children }) => {
  return (
    <div
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: '0',
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: '0'
      }}
    >
      {children}
    </div>
  );
};

// Accessible announcement system
export const useAnnouncement = () => {
  const [announcement, setAnnouncement] = useState('');

  const announce = (message, politeness = 'polite') => {
    setAnnouncement({ message, politeness });
    setTimeout(() => setAnnouncement(''), 1000);
  };

  const AnnouncementComponent = () => {
    if (!announcement) return null;
    
    return (
      <div
        aria-live={announcement.politeness}
        aria-atomic="true"
        className="sr-only"
      >
        {announcement.message}
      </div>
    );
  };

  return { announce, AnnouncementComponent };
};

// Color contrast checker utility
export const checkColorContrast = (foreground, background) => {
  // This is a simplified version - in production, you'd want a more robust implementation
  const getLuminance = (hex) => {
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const luminance1 = getLuminance(foreground);
  const luminance2 = getLuminance(background);
  
  const contrast = luminance1 > luminance2
    ? (luminance1 + 0.05) / (luminance2 + 0.05)
    : (luminance2 + 0.05) / (luminance1 + 0.05);

  return {
    ratio: contrast.toFixed(2),
    passesAA: contrast >= 4.5,
    passesAAA: contrast >= 7,
    passesAALarge: contrast >= 3,
    passesAAALarge: contrast >= 4.5
  };
};

export {
  SkipLink,
  LiveRegion,
  AccessibleField,
  AccessibleProgress,
  AccessibleTooltip,
  ScreenReaderOnly,
  VisuallyHidden
};
