import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const Textarea = React.forwardRef(({ 
  className, 
  error,
  label,
  helperText,
  required,
  disabled,
  rows = 4,
  ...props 
}, ref) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <motion.div
        whileFocus={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <textarea
          rows={rows}
          className={cn(
            "flex min-h-[80px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500 focus-visible:ring-red-500",
            disabled && "bg-gray-50 cursor-not-allowed",
            className
          )}
          ref={ref}
          disabled={disabled}
          {...props}
        />
      </motion.div>
      {(error || helperText) && (
        <p className={cn(
          "text-xs",
          error ? "text-red-500" : "text-gray-500"
        )}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
