import { motion } from 'framer-motion';
import { useState } from 'react';

// Animation Variants
export const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

export const slideUpVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -30 }
};

export const slideDownVariants = {
  hidden: { opacity: 0, y: -30 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 30 }
};

export const slideLeftVariants = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 }
};

export const slideRightVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 30 }
};

export const scaleVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 }
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Interactive Button Component
export const InteractiveButton = ({ children, onClick, className = '', ...props }) => {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`transition-all duration-200 ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};

// Hover Card Component
export const HoverCard = ({ children, className = '' }) => (
  <motion.div
    whileHover={{ 
      y: -5, 
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    }}
    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    className={`transition-all duration-300 ${className}`}
  >
    {children}
  </motion.div>
);

// Animated List Item
export const AnimatedListItem = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, type: 'spring', stiffness: 300 }}
    className="list-item"
  >
    {children}
  </motion.div>
);

// Pulse Animation Component
export const PulseAnimation = ({ children, className = '' }) => (
  <motion.div
    animate={{
      scale: [1, 1.05, 1],
      opacity: [1, 0.8, 1]
    }}
    transition={{
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    className={className}
  >
    {children}
  </motion.div>
);

// Bounce Animation Component
export const BounceAnimation = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ y: -20 }}
    animate={{
      y: [0, -10, 0]
    }}
    transition={{
      duration: 1,
      repeat: Infinity,
      delay,
      ease: "easeInOut"
    }}
  >
    {children}
  </motion.div>
);

// Rotate Animation Component
export const RotateAnimation = ({ children, duration = 2 }) => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ duration, repeat: Infinity, ease: "linear" }}
  >
    {children}
  </motion.div>
);

// Typewriter Effect Hook
export const useTypewriter = (text, speed = 50) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useState(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, speed]);

  return displayText;
};

// Number Counter Animation Hook
export const useCounter = (target, duration = 2000) => {
  const [count, setCount] = useState(0);

  useState(() => {
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      setCount(prev => {
        if (prev + increment >= target) {
          clearInterval(timer);
          return target;
        }
        return prev + increment;
      });
    }, 16);

    return () => clearInterval(timer);
  }, [target, duration]);

  return Math.round(count);
};

// Progress Animation Component
export const ProgressAnimation = ({ value, max = 100, color = 'green', className = '' }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${(value / max) * 100}%` }}
      transition={{ duration: 1, ease: "easeOut" }}
      className={`bg-${color}-500 h-2 rounded-full`}
    />
  </div>
);

// Shake Animation Component
export const ShakeAnimation = ({ children, trigger = false }) => (
  <motion.div
    animate={trigger ? {
      x: [0, -10, 10, -10, 10, 0]
    } : {}}
    transition={{ duration: 0.5 }}
  >
    {children}
  </motion.div>
);

// Floating Animation Component
export const FloatingAnimation = ({ children, delay = 0 }) => (
  <motion.div
    animate={{
      y: [0, -10, 0]
    }}
    transition={{
      duration: 3,
      repeat: Infinity,
      delay,
      ease: "easeInOut"
    }}
  >
    {children}
  </motion.div>
);

// Morph Animation Component
export const MorphAnimation = ({ children }) => (
  <motion.div
    animate={{
      borderRadius: ['20%', '50%', '20%'],
      rotate: [0, 180, 360]
    }}
    transition={{
      duration: 4,
      repeat: Infinity,
      ease: "linear"
    }}
  >
    {children}
  </motion.div>
);

// Staggered Grid Animation
export const StaggeredGrid = ({ children, className = '' }) => (
  <motion.div
    variants={staggerContainer}
    initial="hidden"
    animate="visible"
    className={`grid ${className}`}
  >
    {children}
  </motion.div>
);

// Page Transition Component
export const PageTransition = ({ children }) => (
  <motion.div
    initial="hidden"
    animate="visible"
    exit="exit"
    variants={fadeInVariants}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

// Hover Reveal Component
export const HoverReveal = ({ children, hoverContent, className = '' }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={`relative ${className}`}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {children}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ 
          opacity: isHovered ? 1 : 0,
          y: isHovered ? 0 : 10
        }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0"
      >
        {hoverContent}
      </motion.div>
    </motion.div>
  );
};

// Interactive Form Input
export const InteractiveInput = ({ className = '', ...props }) => (
  <motion.input
    whileFocus={{ scale: 1.02 }}
    transition={{ type: 'spring', stiffness: 300 }}
    className={`focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${className}`}
    {...props}
  />
);

// Animated Checkbox
export const AnimatedCheckbox = ({ checked, onChange, label }) => (
  <motion.label className="flex items-center cursor-pointer">
    <motion.div
      className="relative"
      whileTap={{ scale: 0.9 }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <motion.div
        className={`w-6 h-6 rounded border-2 ${checked ? 'bg-green-600 border-green-600' : 'bg-white border-gray-300'}`}
        animate={{ scale: checked ? [1, 1.2, 1] : 1 }}
        transition={{ duration: 0.2 }}
      >
        {checked && (
          <motion.svg
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="w-4 h-4 text-white mx-auto"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </motion.svg>
        )}
      </motion.div>
    </motion.div>
    {label && <span className="ml-2">{label}</span>}
  </motion.label>
);

// Tooltip Component
export const Tooltip = ({ children, content, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
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
      >
        {children}
      </div>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className={`absolute ${positionClasses[position]} bg-gray-900 text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap z-10`}
        >
          {content}
          <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45" />
        </motion.div>
      )}
    </div>
  );
};
