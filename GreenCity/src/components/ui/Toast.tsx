import React from 'react';
import { View, Text } from 'react-native';
import Toast from 'react-native-toast-message';
import { toastStyles as styles } from './styles/toastStyles';

export const showToast = (
  type: 'success' | 'error' | 'info' | 'warning',
  message: string,
  duration: number = 3000
) => {
  Toast.show({
    type,
    text1: message,
    visibilityTime: duration,
    position: 'top',
    topOffset: 50,
  });
};

export const showSuccessToast = (message: string, duration?: number) => {
  showToast('success', message, duration);
};

export const showErrorToast = (message: string, duration?: number) => {
  showToast('error', message, duration);
};

export const showInfoToast = (message: string, duration?: number) => {
  showToast('info', message, duration);
};

export const showWarningToast = (message: string, duration?: number) => {
  showToast('warning', message, duration);
};

const toastConfig = {
  success: ({ text1 }: any) => (
    <View style={[styles.toastContainer, styles.successToast]}>
      <Text style={styles.toastIcon}>✓</Text>
      <Text style={styles.toastText}>{text1}</Text>
    </View>
  ),
  error: ({ text1 }: any) => (
    <View style={[styles.toastContainer, styles.errorToast]}>
      <Text style={styles.toastIcon}>✕</Text>
      <Text style={styles.toastText}>{text1}</Text>
    </View>
  ),
  info: ({ text1 }: any) => (
    <View style={[styles.toastContainer, styles.infoToast]}>
      <Text style={styles.toastIcon}>ℹ</Text>
      <Text style={styles.toastText}>{text1}</Text>
    </View>
  ),
  warning: ({ text1 }: any) => (
    <View style={[styles.toastContainer, styles.warningToast]}>
      <Text style={styles.toastIcon}>⚠</Text>
      <Text style={styles.toastText}>{text1}</Text>
    </View>
  ),
};

export default toastConfig;
