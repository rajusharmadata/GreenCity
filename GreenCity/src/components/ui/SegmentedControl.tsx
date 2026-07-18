import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { segmentedControlStyles as styles } from './styles/segmentedControlStyles';

interface Segment {
  value: string;
  label: string;
}

interface SegmentedControlProps {
  segments: Segment[];
  selectedSegment: string;
  onSegmentChange: (value: string) => void;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  segments,
  selectedSegment,
  onSegmentChange,
}) => {
  return (
    <View style={styles.container}>
      {segments.map((segment, index) => {
        const isSelected = segment.value === selectedSegment;
        const isFirst = index === 0;
        const isLast = index === segments.length - 1;

        return (
          <TouchableOpacity
            key={segment.value}
            style={[
              styles.button,
              isFirst && styles.buttonFirst,
              isLast && styles.buttonLast,
              isSelected && styles.buttonSelected,
            ]}
            onPress={() => onSegmentChange(segment.value)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.text,
                isSelected && styles.textSelected,
              ]}
            >
              {segment.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
