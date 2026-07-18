import React from 'react';
import { View, ActivityIndicator, Modal } from 'react-native';
import { Colors } from '../../styles/theme';
import { loadingSpinnerStyles as styles } from './styles/loadingSpinnerStyles';

interface LoadingSpinnerProps {
  visible: boolean;
  size?: 'small' | 'large';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  visible,
  size = 'large',
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ActivityIndicator size={size} color={Colors.primary[500]} />
        </View>
      </View>
    </Modal>
  );
};
