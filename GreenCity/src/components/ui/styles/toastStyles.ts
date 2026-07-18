import { StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights } from '../../../styles/theme';

export const toastStyles = StyleSheet.create({
  toastContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    marginHorizontal: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  successToast: {
    backgroundColor: Colors.success,
  },
  errorToast: {
    backgroundColor: Colors.error,
  },
  infoToast: {
    backgroundColor: Colors.info,
  },
  warningToast: {
    backgroundColor: Colors.warning,
  },
  toastIcon: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.neutral[0],
    marginRight: Spacing.sm,
  },
  toastText: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.medium,
    color: Colors.neutral[0],
    flex: 1,
  },
});
