import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const badgeVariants = {
  default: "bg-gray-100 text-gray-800 border-gray-200",
  primary: "bg-blue-100 text-blue-800 border-blue-200",
  secondary: "bg-gray-100 text-gray-800 border-gray-200",
  destructive: "bg-red-100 text-red-800 border-red-200",
  warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
  success: "bg-green-100 text-green-800 border-green-200",
  info: "bg-cyan-100 text-cyan-800 border-cyan-200",
  outline: "text-gray-800 border-gray-300 bg-transparent",
};

const badgeSizes = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-0.5 text-sm",
  lg: "px-3 py-1 text-base",
};

const Badge = React.forwardRef(({ 
  className, 
  variant = "default", 
  size = "md",
  children, 
  ...props 
}, ref) => {
  return (
    <motion.div
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full border font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        badgeVariants[variant],
        badgeSizes[size],
        className
      )}
      {...props}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.div>
  );
});
Badge.displayName = "Badge";

export { Badge, badgeVariants, badgeSizes };
