import React from 'react';
import { View } from 'react-native';
import { Spacing, BorderRadius } from '../../styles/theme';
import { skeletonStyles as styles } from './styles/skeletonStyles';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  variant?: 'rectangular' | 'circular';
  style?: any;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 40,
  variant = 'rectangular',
  style,
}) => {
  return (
    <View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius: variant === 'circular' ? height / 2 : BorderRadius.md,
        },
        style,
      ]}
    />
  );
};

export const SkeletonText: React.FC<{ lines?: number; width?: string }> = ({
  lines = 3,
  width = '100%',
}) => {
  return (
    <View style={styles.textContainer}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          width={index === lines - 1 ? '60%' : width}
          height={16}
          style={{ marginBottom: Spacing.sm }}
        />
      ))}
    </View>
  );
};

export const SkeletonCard: React.FC = () => {
  return (
    <View style={styles.card}>
      <Skeleton width={60} height={60} variant="circular" style={styles.avatar} />
      <View style={styles.content}>
        <Skeleton width="80%" height={20} style={{ marginBottom: Spacing.xs }} />
        <Skeleton width="60%" height={16} />
      </View>
    </View>
  );
};

export const SkeletonList: React.FC<{ count?: number }> = ({ count = 5 }) => {
  return (
    <View style={styles.list}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={{ marginBottom: Spacing.md }}>
          <SkeletonCard />
        </View>
      ))}
    </View>
  );
};
