import { StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights } from '../../../styles/theme';

export const progressBarStyles = StyleSheet.create({
  container: {
    width: '100%',
  },
  bar: {
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: BorderRadius.full,
  },
  labelContainer: {
    alignItems: 'flex-end',
    marginTop: Spacing.xs,
  },
  label: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold,
    color: Colors.neutral[600],
  },
  stepContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.lg,
  },
  stepWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  stepCompleted: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
  },
  stepIncomplete: {
    backgroundColor: Colors.neutral[100],
    borderColor: Colors.neutral[300],
  },
  stepText: {
    fontWeight: FontWeights.bold,
    fontSize: FontSizes.sm,
  },
  stepTextActive: {
    color: Colors.neutral[0],
  },
  stepTextInactive: {
    color: Colors.neutral[600],
  },
  stepLine: {
    flex: 1,
    height: 2,
    marginHorizontal: Spacing.xs,
  },
  stepLineCompleted: {
    backgroundColor: Colors.primary[500],
  },
  stepLineIncomplete: {
    backgroundColor: Colors.neutral[300],
  },
  stepLabel: {
    marginTop: Spacing.sm,
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.medium,
    textAlign: 'center',
  },
  stepLabelActive: {
    color: Colors.primary[900],
  },
  stepLabelInactive: {
    color: Colors.neutral[400],
  },
});
