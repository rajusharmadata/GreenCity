import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';

interface AuthInputProps extends TextInputProps {
  label: string;
}

export function AuthInput({ label, className = '', ...props }: AuthInputProps) {
  return (
    <View className="mb-4">
      <Text className="text-primary-dark font-semibold mb-2 text-sm">{label}</Text>
      <TextInput
        placeholderTextColor="#9ca3af"
        className={`bg-white border border-primary-light rounded-2xl px-4 py-3.5 text-base text-primary-dark ${className}`}
        {...props}
      />
    </View>
  );
}
