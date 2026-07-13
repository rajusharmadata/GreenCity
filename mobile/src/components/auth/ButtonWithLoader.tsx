import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';

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
      className={`
        rounded-2xl py-4 flex-row items-center justify-center min-h-[56px]
        ${isGhost ? 'bg-transparent' : 'bg-primary shadow-lg'}
        ${isDisabled && !isGhost ? 'opacity-60' : ''}
      `}
    >
      {loading ? (
        <View className="flex-row items-center gap-2">
          <ActivityIndicator size="small" color={isGhost ? '#14532d' : '#fff'} />
          <Text
            className={`text-base font-semibold ${isGhost ? 'text-primary-dark' : 'text-white'}`}
          >
            Please wait...
          </Text>
        </View>
      ) : (
        <Text
          className={`text-base font-semibold ${isGhost ? 'text-primary-dark' : 'text-white'}`}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}
