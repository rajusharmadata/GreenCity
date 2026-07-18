import { StyleSheet } from 'react-native';
import { Colors, Spacing, FontSizes, FontWeights } from '../../../styles/theme';

export const emptyStateStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  title: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.primary[900],
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
  description: {
    fontSize: FontSizes.base,
    color: Colors.neutral[600],
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  action: {
    marginTop: Spacing.xl,
  },
});
