/**
 * Common Reusable StyleSheet Definitions
 * Shared styles for buttons, containers, and other common elements
 */

import { StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights, Shadows } from './theme';

export const CommonStyles = StyleSheet.create({
  // Flexbox utilities
  flex: {
    flex: 1,
  },
  
  flexCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  flexRow: {
    flexDirection: 'row',
  },
  
  flexRowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  flexRowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  flexRowGap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  
  // Text styles
  headingLarge: {
    fontSize: FontSizes['4xl'],
    fontWeight: FontWeights.extrabold,
    color: Colors.primary[900],
    lineHeight: 42,
  },
  
  headingMedium: {
    fontSize: FontSizes['3xl'],
    fontWeight: FontWeights.bold,
    color: Colors.primary[900],
    lineHeight: 36,
  },
  
  headingSmall: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.primary[900],
    lineHeight: 24,
  },
  
  bodyLarge: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.normal,
    color: Colors.neutral[900],
    lineHeight: 24,
  },
  
  bodyMedium: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.normal,
    color: Colors.neutral[700],
    lineHeight: 21,
  },
  
  bodySmall: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.normal,
    color: Colors.neutral[600],
    lineHeight: 18,
  },
  
  labelLarge: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.semibold,
    color: Colors.primary[900],
  },
  
  labelMedium: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.primary[900],
  },
  
  labelSmall: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold,
    color: Colors.neutral[600],
  },
  
  // Container styles
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  
  screenContainer: {
    flex: 1,
    backgroundColor: Colors.backgroundAlt,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  
  card: {
    backgroundColor: Colors.backgroundAlt,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    ...Shadows.md,
  },
  
  modalSheet: {
    backgroundColor: Colors.backgroundAlt,
    borderTopLeftRadius: BorderRadius['3xl'],
    borderTopRightRadius: BorderRadius['3xl'],
    padding: Spacing.lg,
    paddingBottom: Spacing['2xl'],
  },
  
  // Input styles
  inputBase: {
    backgroundColor: Colors.neutral[50],
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    fontSize: FontSizes.base,
    color: Colors.primary[900],
    borderWidth: 1,
    borderColor: Colors.primary[100],
  },
  
  inputLarge: {
    backgroundColor: Colors.neutral[50],
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    fontSize: FontSizes.base,
    color: Colors.primary[900],
    height: 130,
    textAlignVertical: 'top',
  },
  
  // Button styles
  buttonBase: {
    minHeight: 56,
    borderRadius: BorderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  
  buttonPrimary: {
    backgroundColor: Colors.primary[500],
    minHeight: 56,
    borderRadius: BorderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.lg,
  },
  
  buttonGhost: {
    backgroundColor: 'transparent',
    minHeight: 56,
    borderRadius: BorderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  buttonDisabled: {
    opacity: 0.6,
  },
  
  // Text button styles
  buttonTextPrimary: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.semibold,
    color: Colors.neutral[0],
  },
  
  buttonTextGhost: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.semibold,
    color: Colors.primary[900],
  },
  
  // Divider
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  
  // Badge/Pill
  badge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary[100],
  },
  
  badgeText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold,
    color: Colors.primary[900],
  },
});
