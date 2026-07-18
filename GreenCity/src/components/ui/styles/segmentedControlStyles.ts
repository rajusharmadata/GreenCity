import { StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights } from '../../../styles/theme';

export const segmentedControlStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral[100],
    borderRadius: BorderRadius.xl,
    padding: 4,
  },
  button: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    borderRadius: BorderRadius['2xl'],
  },
  buttonFirst: {
    borderTopLeftRadius: BorderRadius['2xl'],
    borderBottomLeftRadius: BorderRadius['2xl'],
  },
  buttonLast: {
    borderTopRightRadius: BorderRadius['2xl'],
    borderBottomRightRadius: BorderRadius['2xl'],
  },
  buttonSelected: {
    backgroundColor: Colors.primary[500],
  },
  text: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
    color: Colors.neutral[600],
  },
  textSelected: {
    color: Colors.neutral[0],
    fontWeight: FontWeights.semibold,
  },
});
