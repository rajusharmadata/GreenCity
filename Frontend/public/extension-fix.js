// Fix for browser extension conflicts - Minimal and targeted approach
(function() {
  // Store original console methods
  const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info
  };

  // Helper function to check if content is extension-related
  function isExtensionContent(args) {
    try {
      return args.some(arg => {
        if (typeof arg === 'string') {
          return arg.includes('chrome-extension://') || 
                 arg.includes('contentScript.bundle.js') ||
                 arg.includes('installHook.js') ||
                 (arg.includes('Cannot convert object to primitive value') && arg.includes('extension'));
        }
        return false;
      });
    } catch (e) {
      return false;
    }
  }

  // Only override console.error to filter extension errors
  console.error = function(...args) {
    // Only filter if it's clearly extension-related
    if (isExtensionContent(args)) {
      return; // Silently ignore extension errors
    }
    
    // Call original console.error for everything else
    try {
      originalConsole.error.apply(console, args);
    } catch (e) {
      // If original fails, use a different method to report
      try {
        // Try using console.log instead to avoid recursion
        originalConsole.log('[ERROR]', ...args);
      } catch (e2) {
        // Final fallback - try native console if available
        if (typeof console !== 'undefined' && console.error) {
          // Use setTimeout to break any potential call stack issues
          setTimeout(() => {
            try {
              console.error('Console error occurred', ...args);
            } catch (e3) {
              // Silent final fallback
            }
          }, 0);
        }
      }
    }
  };

  // Override console.warn for extension warnings only
  console.warn = function(...args) {
    // Only filter if it's clearly extension-related
    if (isExtensionContent(args)) {
      return; // Silently ignore extension warnings
    }
    
    // Call original console.warn for everything else
    try {
      originalConsole.warn.apply(console, args);
    } catch (e) {
      // Silent fallback
    }
  };

  // Prevent extension from interfering with React DevTools
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    const originalOnError = window.__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberRoot;
    if (originalOnError) {
      window.__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberRoot = function(...args) {
        try {
          return originalOnError.apply(this, args);
        } catch (e) {
          // Silently fail React DevTools errors
          return;
        }
      };
    }
  }
})();
