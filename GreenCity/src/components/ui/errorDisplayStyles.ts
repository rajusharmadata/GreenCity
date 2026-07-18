import { StyleSheet, Platform } from 'react-native';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights } from '../../styles/theme';

export const errorDisplayStyles = StyleSheet.create({
  container: {
    backgroundColor: Colors.backgroundAlt,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginVertical: Spacing.sm,
    borderLeftWidth: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  headerText: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  title: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.bold,
    color: Colors.primary[900],
  },
  code: {
    fontSize: FontSizes.xs,
    color: Colors.neutral[500],
    marginTop: 2,
  },
  message: {
    fontSize: FontSizes.sm,
    color: Colors.neutral[700],
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  details: {
    backgroundColor: Colors.neutral[100],
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  detailsTitle: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold,
    color: Colors.neutral[600],
    marginBottom: Spacing.xs,
  },
  detailsText: {
    fontSize: FontSizes.xs,
    color: Colors.neutral[700],
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary[100],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  retryText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.primary[700],
    marginLeft: Spacing.xs,
  },
  hint: {
    fontSize: FontSizes.xs,
    color: Colors.neutral[500],
    fontStyle: 'italic',
  },
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  inlineText: {
    fontSize: FontSizes.sm,
    color: Colors.error,
    marginLeft: Spacing.xs,
  },
  card: {
    backgroundColor: Colors.backgroundAlt,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  cardTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.primary[900],
    marginTop: Spacing.sm,
  },
  cardMessage: {
    fontSize: FontSizes.base,
    color: Colors.neutral[600],
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  cardAction: {
    marginTop: Spacing.md,
  },
});
