import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ResponsiveLayout = ({ 
  children, 
  sidebar = null, 
  header = null,
  footer = null,
  className = '',
  sidebarWidth = 'w-64',
  sidebarCollapsedWidth = 'w-16'
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(false); // Reset mobile sidebar state
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const sidebarClasses = `
    fixed md:relative inset-y-0 left-0 z-50 
    ${sidebarCollapsed && !isMobile ? sidebarCollapsedWidth : sidebarWidth}
    ${isMobile ? (sidebarOpen ? 'translate-x-0' : '-translate-x-full') : ''}
    md:translate-x-0
    transition-all duration-300 ease-in-out
    bg-white border-r border-gray-200
  `;

  const overlayClasses = `
    fixed inset-0 bg-black bg-opacity-50 z-40
    ${isMobile && sidebarOpen ? 'block' : 'hidden'}
    md:hidden
  `;

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Mobile overlay */}
      {isMobile && (
        <motion.div
          className={overlayClasses}
          initial={{ opacity: 0 }}
          animate={{ opacity: sidebarOpen ? 1 : 0 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        {sidebar && (
          <motion.aside
            className={sidebarClasses}
            initial={{ x: -250 }}
            animate={{ x: sidebarOpen || !isMobile ? 0 : -250 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {sidebar({ 
              collapsed: sidebarCollapsed, 
              toggleSidebar, 
              isMobile,
              onClose: () => setSidebarOpen(false)
            })}
          </motion.aside>
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          {header && (
            <header className="bg-white border-b border-gray-200 z-30">
              {header({ toggleSidebar, sidebarCollapsed, isMobile })}
            </header>
          )}

          {/* Main content area */}
          <main className="flex-1 overflow-y-auto bg-gray-50">
            <div className="container mx-auto px-4 py-6">
              {children}
            </div>
          </main>

          {/* Footer */}
          {footer && (
            <footer className="bg-white border-t border-gray-200">
              {footer()}
            </footer>
          )}
        </div>
      </div>
    </div>
  );
};

// Grid system components
const Grid = ({ children, cols = 1, gap = 4, className = '' }) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
    12: 'grid-cols-12'
  };

  const gapSizes = {
    1: 'gap-1',
    2: 'gap-2',
    3: 'gap-3',
    4: 'gap-4',
    6: 'gap-6',
    8: 'gap-8'
  };

  return (
    <div className={`grid ${gridCols[cols]} ${gapSizes[gap]} ${className}`}>
      {children}
    </div>
  );
};

const Container = ({ children, size = 'default', className = '' }) => {
  const sizes = {
    sm: 'max-w-2xl',
    default: 'max-w-7xl',
    lg: 'max-w-full',
    full: 'w-full'
  };

  return (
    <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${sizes[size]} ${className}`}>
      {children}
    </div>
  );
};

const Flex = ({ 
  children, 
  direction = 'row', 
  align = 'start', 
  justify = 'start', 
  wrap = 'nowrap',
  gap = 4,
  className = '' 
}) => {
  const directions = {
    row: 'flex-row',
    col: 'flex-col',
    'row-reverse': 'flex-row-reverse',
    'col-reverse': 'flex-col-reverse'
  };

  const alignments = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
    baseline: 'items-baseline'
  };

  const justifications = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly'
  };

  const wraps = {
    wrap: 'flex-wrap',
    nowrap: 'flex-nowrap',
    'wrap-reverse': 'flex-wrap-reverse'
  };

  const gapSizes = {
    1: 'gap-1',
    2: 'gap-2',
    3: 'gap-3',
    4: 'gap-4',
    6: 'gap-6',
    8: 'gap-8'
  };

  return (
    <div className={`
      flex 
      ${directions[direction]} 
      ${alignments[align]} 
      ${justifications[justify]}
      ${wraps[wrap]}
      ${gapSizes[gap]}
      ${className}
    `}>
      {children}
    </div>
  );
};

// Responsive breakpoint hook
const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState('sm');

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 640) setBreakpoint('xs');
      else if (width < 768) setBreakpoint('sm');
      else if (width < 1024) setBreakpoint('md');
      else if (width < 1280) setBreakpoint('lg');
      else setBreakpoint('xl');
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return breakpoint;
};

export { ResponsiveLayout, Grid, Container, Flex, useBreakpoint };
