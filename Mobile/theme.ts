export const colors = {
  primary: '#16a34a',
  primaryDark: '#14532d',
  primaryLight: '#dcfce7',
  background: '#f8fafc',
  surface: '#ffffff',
  text: '#111827',
  textMuted: '#6b7280',
  textLight: '#94a3b8',
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  error: '#dc2626',
  warning: '#d97706',
  warningBg: '#fef9c3',
  success: '#15803d',
  successBg: '#dcfce7',
  info: '#0ea5e9',
  severity: {
    Critical: '#dc2626',
    High: '#d97706',
    Medium: '#2563eb',
    Low: '#16a34a',
  },
  status: {
    Pending: { bg: '#fef9c3', text: '#b45309' },
    'In Progress': { bg: '#dbeafe', text: '#1d4ed8' },
    Resolved: { bg: '#dcfce7', text: '#15803d' },
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

export const fontSizes = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  title: 24,
  hero: 28,
} as const;

export const borderRadius = {
  sm: 10,
  md: 14,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;
