import React from 'react';
import { View, Image, Text } from 'react-native';
import { FontSizes } from '../../styles/theme';
import { avatarStyles as styles } from './styles/avatarStyles';

interface AvatarProps {
  uri?: string;
  name?: string;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
}

export const Avatar: React.FC<AvatarProps> = ({
  uri,
  name,
  size = 'medium',
}) => {
  const sizeStyles = {
    small: { width: 32, height: 32, fontSize: FontSizes.xs },
    medium: { width: 48, height: 48, fontSize: FontSizes.sm },
    large: { width: 64, height: 64, fontSize: FontSizes.base },
    xlarge: { width: 96, height: 96, fontSize: FontSizes.lg },
  };

  const { width, height, fontSize } = sizeStyles[size];
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '';

  return (
    <View style={[styles.container, { width, height, borderRadius: width / 2 }]}>
      {uri ? (
        <Image source={{ uri }} style={[styles.image, { width, height }]} />
      ) : (
        <Text style={[styles.initials, { fontSize }]}>{initials}</Text>
      )}
    </View>
  );
};
