import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const Progress = React.forwardRef(({ 
  className, 
  value = 0,
  max = 100,
  size = 'md',
  color = 'primary',
  showLabel = false,
  label,
  ...props 
}, ref) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
    xl: 'h-4'
  };

  const colorClasses = {
    primary: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    info: 'bg-cyan-500'
  };

  return (
    <div className="space-y-2">
      {(showLabel || label) && (
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">
            {label}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div
        ref={ref}
        className={cn(
          "relative w-full bg-gray-200 rounded-full overflow-hidden",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        <motion.div
          className={cn(
            "h-full rounded-full transition-all duration-300 ease-out",
            colorClasses[color]
          )}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
});
Progress.displayName = "Progress";

export { Progress };
