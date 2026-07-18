import React from 'react';
import { View, Text } from 'react-native';
import { badgeStyles as styles } from './styles/badgeStyles';

interface BadgeProps {
  text: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
  size?: 'small' | 'medium' | 'large';
}

export const Badge: React.FC<BadgeProps> = ({
  text,
  variant = 'default',
  size = 'medium',
}) => {
  const badgeStyle = [styles.badge, styles[variant], styles[size]];
  const textStyle = [styles.text, styles[`${size}Text`]];

  return (
    <View style={badgeStyle}>
      <Text style={textStyle}>{text}</Text>
    </View>
  );
};
