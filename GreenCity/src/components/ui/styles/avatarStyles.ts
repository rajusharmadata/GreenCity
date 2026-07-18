import { StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights } from '../../../styles/theme';

export const avatarStyles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary[200],
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    resizeMode: 'cover',
  },
  initials: {
    fontWeight: FontWeights.bold,
    color: Colors.primary[700],
  },
});
