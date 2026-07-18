import { StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius } from '../../../styles/theme';

export const skeletonStyles = StyleSheet.create({
  skeleton: {
    backgroundColor: Colors.neutral[200],
    overflow: 'hidden',
  },
  textContainer: {
    paddingVertical: Spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.backgroundAlt,
    borderRadius: BorderRadius.xl,
  },
  avatar: {
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
  },
  list: {
    padding: Spacing.md,
  },
});
