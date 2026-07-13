/**
 * Centralized Theme Configuration
 * Professional color palette and design tokens for GreenCity app
 */

export const Colors = {
  // Primary Green (Main brand color)
  primary: {
    50: '#f0fdf4',      // Lightest
    100: '#dcfce7',
    500: '#16a34a',     // Main
    600: '#16a34a',
    900: '#14532d',     // Darkest
  },
  
  // Accent (Amber for highlights)
  accent: '#f59e0b',
  
  // Neutral palette
  neutral: {
    0: '#ffffff',
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  
  // Semantic colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // Backgrounds
  background: '#f0fdf4',
  backgroundAlt: '#ffffff',
  
  // Borders & Overlays
  border: '#e5e7eb',
  overlay: 'rgba(0, 0, 0, 0.45)',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
};

export const BorderRadius = {
  none: 0,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
};

export const FontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
};

export const FontWeights = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '900' as const,
};

export const LineHeights = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
};

export const Shadows = {
  sm: { elevation: 2 },
  md: { elevation: 4 },
  lg: { elevation: 8 },
  xl: { elevation: 12 },
};
