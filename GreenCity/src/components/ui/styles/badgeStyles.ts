import { StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights } from '../../../styles/theme';

export const badgeStyles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  success: {
    backgroundColor: Colors.success,
  },
  warning: {
    backgroundColor: Colors.warning,
  },
  error: {
    backgroundColor: Colors.error,
  },
  info: {
    backgroundColor: Colors.info,
  },
  default: {
    backgroundColor: Colors.primary[100],
  },
  small: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  medium: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  large: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  text: {
    fontWeight: FontWeights.semibold,
    color: Colors.neutral[0],
  },
  smallText: {
    fontSize: FontSizes.xs,
  },
  mediumText: {
    fontSize: FontSizes.sm,
  },
  largeText: {
    fontSize: FontSizes.base,
  },
});
