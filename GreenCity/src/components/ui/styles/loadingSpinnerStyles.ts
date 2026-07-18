import { StyleSheet } from 'react-native';
import { Colors, BorderRadius } from '../../../styles/theme';

export const loadingSpinnerStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: 'white',
    borderRadius: BorderRadius.xl,
    padding: 24,
  },
});
