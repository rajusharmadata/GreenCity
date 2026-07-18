import React from 'react';
import { View, ViewStyle } from 'react-native';
import { cardStyles as styles } from './styles/cardStyles';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'small' | 'medium' | 'large';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
  padding = 'medium',
}) => {
  const cardStyle = [
    styles.card,
    styles[variant],
    styles[`${padding}Padding`],
    style,
  ];

  return <View style={cardStyle}>{children}</View>;
};
