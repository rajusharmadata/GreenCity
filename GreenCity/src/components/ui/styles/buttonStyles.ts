import { StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights, Shadows } from '../../../styles/theme';

export const buttonStyles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.xl,
  },
  primary: {
    backgroundColor: Colors.primary[500],
    ...Shadows.lg,
  },
  secondary: {
    backgroundColor: Colors.secondary[500],
    ...Shadows.md,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary[500],
  },
  danger: {
    backgroundColor: Colors.error,
    ...Shadows.md,
  },
  small: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 40,
  },
  medium: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    minHeight: 56,
  },
  large: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    minHeight: 64,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: FontWeights.semibold,
    textAlign: 'center',
  },
  primaryText: {
    color: Colors.neutral[0],
  },
  secondaryText: {
    color: Colors.neutral[0],
  },
  ghostText: {
    color: Colors.primary[500],
  },
  dangerText: {
    color: Colors.neutral[0],
  },
  smallText: {
    fontSize: FontSizes.sm,
  },
  mediumText: {
    fontSize: FontSizes.base,
  },
  largeText: {
    fontSize: FontSizes.lg,
  },
  icon: {
    marginHorizontal: Spacing.xs,
  },
});
