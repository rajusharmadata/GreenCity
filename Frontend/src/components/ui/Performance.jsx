import React, { useMemo, useCallback, useRef, useEffect, useState } from 'react';

// Memoized component wrapper
export const Memoized = ({ children, dependencies = [] }) => {
  return useMemo(() => children, dependencies);
};

// Debounced hook for search inputs
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Throttled hook for scroll events
export const useThrottle = (func, delay) => {
  const lastRun = useRef(Date.now());

  return useCallback((...args) => {
    if (Date.now() - lastRun.current >= delay) {
      func(...args);
      lastRun.current = Date.now();
    }
  }, [func, delay]);
};

// Virtual list for large datasets
export const VirtualList = ({ 
  items, 
  itemHeight = 40, 
  containerHeight = 400, 
  renderItem,
  overscan = 5 
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);

  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight),
    items.length - 1
  );

  const visibleItems = useMemo(() => {
    const start = Math.max(0, visibleStart - overscan);
    const end = Math.min(items.length - 1, visibleEnd + overscan);
    return items.slice(start, end + 1).map((item, index) => ({
      item,
      index: start + index
    }));
  }, [items, visibleStart, visibleEnd, overscan]);

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: index * itemHeight,
              height: itemHeight,
              width: '100%'
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
};

// Lazy image component
export const LazyImage = ({ 
  src, 
  alt, 
  placeholder = '/api/placeholder/400/300',
  className = '',
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className={`relative ${className}`}>
      <img
        src={isInView ? src : placeholder}
        alt={alt}
        onLoad={() => setIsLoaded(true)}
        className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-50'}`}
        {...props}
      />
    </div>
  );
};

// Performance monitor component
export const PerformanceMonitor = ({ children }) => {
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    componentCount: 0,
    reRenders: 0
  });

  const startTime = useRef(performance.now());
  const renderCount = useRef(0);

  useEffect(() => {
    const endTime = performance.now();
    renderCount.current += 1;
    
    setMetrics({
      renderTime: endTime - startTime.current,
      componentCount: document.querySelectorAll('[data-react-component]').length,
      reRenders: renderCount.current
    });

    startTime.current = performance.now();
  });

  return (
    <>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black text-white p-2 rounded text-xs">
          <div>Render: {metrics.renderTime.toFixed(2)}ms</div>
          <div>Components: {metrics.componentCount}</div>
          <div>Re-renders: {metrics.reRenders}</div>
        </div>
      )}
    </>
  );
};

// Optimized pagination hook
export const usePagination = (items, itemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  }, [items, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => 
    Math.ceil(items.length / itemsPerPage), 
    [items.length, itemsPerPage]
  );

  const goToPage = useCallback((page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  return {
    currentPage,
    totalPages,
    paginatedItems,
    goToPage,
    nextPage,
    prevPage
  };
};

// Optimized search hook
export const useSearch = (items, searchKeys, searchTerm) => {
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filteredItems = useMemo(() => {
    if (!debouncedSearchTerm) return items;

    const term = debouncedSearchTerm.toLowerCase();
    return items.filter(item =>
      searchKeys.some(key => {
        const value = item[key];
        return value && value.toString().toLowerCase().includes(term);
      })
    );
  }, [items, searchKeys, debouncedSearchTerm]);

  return filteredItems;
};

// Optimized sort hook
export const useSort = (items, sortKey, sortDirection = 'asc') => {
  const sortedItems = useMemo(() => {
    if (!sortKey) return items;

    return [...items].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });
  }, [items, sortKey, sortDirection]);

  return sortedItems;
};

// Bundle size analyzer
export const BundleAnalyzer = () => {
  const [bundleInfo, setBundleInfo] = useState(null);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // This would typically be done with webpack-bundle-analyzer
      // For now, we'll show basic component count
      const components = document.querySelectorAll('[data-react-component]');
      setBundleInfo({
        componentCount: components.length,
        estimatedSize: `${(components.length * 2.5).toFixed(1)}KB (estimated)`
      });
    }
  }, []);

  if (!bundleInfo || process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 bg-yellow-100 border border-yellow-400 p-3 rounded text-sm">
      <div className="font-semibold">Bundle Info</div>
      <div>Components: {bundleInfo.componentCount}</div>
      <div>Est. Size: {bundleInfo.estimatedSize}</div>
    </div>
  );
};

// Memory usage monitor
export const MemoryMonitor = () => {
  const [memoryInfo, setMemoryInfo] = useState(null);

  useEffect(() => {
    if ('memory' in performance) {
      const updateMemoryInfo = () => {
        setMemoryInfo({
          used: `${(performance.memory.usedJSHeapSize / 1048576).toFixed(2)}MB`,
          total: `${(performance.memory.totalJSHeapSize / 1048576).toFixed(2)}MB`,
          limit: `${(performance.memory.jsHeapSizeLimit / 1048576).toFixed(2)}MB`
        });
      };

      updateMemoryInfo();
      const interval = setInterval(updateMemoryInfo, 5000);
      return () => clearInterval(interval);
    }
  }, []);

  if (!memoryInfo || process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-blue-100 border border-blue-400 p-3 rounded text-sm">
      <div className="font-semibold">Memory Usage</div>
      <div>Used: {memoryInfo.used}</div>
      <div>Total: {memoryInfo.total}</div>
      <div>Limit: {memoryInfo.limit}</div>
    </div>
  );
};

// Optimized context provider
export const OptimizedContext = React.createContext();

export const OptimizedProvider = ({ children, value }) => {
  const memoizedValue = useMemo(() => value, [value]);
  
  return (
    <OptimizedContext.Provider value={memoizedValue}>
      {children}
    </OptimizedContext.Provider>
  );
};

// Component to prevent unnecessary re-renders
export const StableComponent = React.memo(({ children }) => {
  return children;
});

// Higher-order component for performance optimization
export const withPerformanceOptimization = (Component) => {
  return React.memo((props) => {
    return <Component {...props} />;
  });
};

export default {
  Memoized,
  useDebounce,
  useThrottle,
  VirtualList,
  LazyImage,
  PerformanceMonitor,
  usePagination,
  useSearch,
  useSort,
  BundleAnalyzer,
  MemoryMonitor,
  OptimizedContext,
  OptimizedProvider,
  StableComponent,
  withPerformanceOptimization
};
