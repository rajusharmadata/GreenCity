import { StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights } from '../../../styles/theme';

export const chipStyles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  default: {
    backgroundColor: Colors.neutral[100],
    borderColor: Colors.neutral[200],
  },
  filter: {
    backgroundColor: Colors.backgroundAlt,
    borderColor: Colors.border,
  },
  input: {
    backgroundColor: Colors.neutral[50],
    borderColor: Colors.primary[200],
  },
  selected: {
    backgroundColor: Colors.primary[100],
    borderColor: Colors.primary[500],
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
    color: Colors.neutral[700],
  },
  selectedLabel: {
    color: Colors.primary[900],
  },
  disabledLabel: {
    color: Colors.neutral[400],
  },
  removeButton: {
    marginLeft: Spacing.xs,
  },
  group: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
