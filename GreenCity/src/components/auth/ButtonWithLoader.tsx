import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View, StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights, Shadows } from '../../styles/theme';

interface ButtonWithLoaderProps {
  onPress: () => void;
  loading: boolean;
  disabled?: boolean;
  label: string;
  variant?: 'primary' | 'ghost';
}

export function ButtonWithLoader({
  onPress,
  loading,
  disabled = false,
  label,
  variant = 'primary',
}: ButtonWithLoaderProps) {
  const isDisabled = disabled || loading;
  const isGhost = variant === 'ghost';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.button,
        isGhost ? styles.buttonGhost : styles.buttonPrimary,
        isDisabled && !isGhost && styles.buttonDisabled,
      ]}
    >
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color={isGhost ? Colors.primary[900] : Colors.neutral[0]} />
          <Text style={[styles.text, isGhost ? styles.textGhost : styles.textPrimary]}>
            Please wait...
          </Text>
        </View>
      ) : (
        <Text style={[styles.text, isGhost ? styles.textGhost : styles.textPrimary]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 56,
    borderRadius: BorderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: Colors.primary[500],
    ...Shadows.lg,
  },
  buttonGhost: {
    backgroundColor: 'transparent',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  text: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.semibold,
  },
  textPrimary: {
    color: Colors.neutral[0],
  },
  textGhost: {
    color: Colors.primary[900],
  },
});
