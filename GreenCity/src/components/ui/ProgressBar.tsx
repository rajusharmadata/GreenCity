import React from 'react';
import { View, Animated, Text } from 'react-native';
import { Colors } from '../../styles/theme';
import { progressBarStyles as styles } from './styles/progressBarStyles';
import { useEffect, useRef } from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 100
  height?: number;
  showLabel?: boolean;
  color?: string;
  backgroundColor?: string;
  animated?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 8,
  showLabel = false,
  color = Colors.primary[500],
  backgroundColor = Colors.neutral[200],
  animated = true,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedValue, {
        toValue: progress,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      animatedValue.setValue(progress);
    }
  }, [progress, animated]);

  const width = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <View style={[styles.bar, { height, backgroundColor }]}>
        <Animated.View
          style={[
            styles.fill,
            {
              width: animated ? width : `${progress}%`,
              backgroundColor: color,
              height,
            },
          ]}
        />
      </View>
      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{Math.round(progress)}%</Text>
        </View>
      )}
    </View>
  );
};

interface StepProgressProps {
  steps: { label: string; completed: boolean }[];
  currentStep: number;
}

export const StepProgress: React.FC<StepProgressProps> = ({ steps, currentStep }) => {
  return (
    <View style={styles.stepContainer}>
      {steps.map((step, index) => (
        <View key={index} style={styles.stepWrapper}>
          <View style={styles.step}>
            <View
              style={[
                styles.stepCircle,
                step.completed || index === currentStep
                  ? styles.stepCompleted
                  : styles.stepIncomplete,
              ]}
            >
              <Text style={[
                styles.stepText,
                step.completed || index === currentStep
                  ? styles.stepTextActive
                  : styles.stepTextInactive
              ]}>
                {step.completed ? '✓' : (index + 1).toString()}
              </Text>
            </View>
            {index < steps.length - 1 && (
              <View
                style={[
                  styles.stepLine,
                  step.completed ? styles.stepLineCompleted : styles.stepLineIncomplete,
                ]}
              />
            )}
          </View>
          <Text
            style={[
              styles.stepLabel,
              step.completed || index === currentStep
                ? styles.stepLabelActive
                : styles.stepLabelInactive,
            ]}
          >
            {step.label}
          </Text>
        </View>
      ))}
    </View>
  );
};
