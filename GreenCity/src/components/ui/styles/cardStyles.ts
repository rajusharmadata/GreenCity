import { StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius, Shadows } from '../../../styles/theme';

export const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.backgroundAlt,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  default: {
    ...Shadows.sm,
  },
  elevated: {
    ...Shadows.lg,
  },
  outlined: {
    borderWidth: 1,
    borderColor: Colors.border,
  },
  nonePadding: {
    padding: 0,
  },
  smallPadding: {
    padding: Spacing.sm,
  },
  mediumPadding: {
    padding: Spacing.md,
  },
  largePadding: {
    padding: Spacing.lg,
  },
});
