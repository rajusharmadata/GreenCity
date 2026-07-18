import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Colors } from '../../styles/theme';
import { chipStyles as styles } from './styles/chipStyles';
import { Ionicons } from '@expo/vector-icons';

interface ChipProps {
  label: string;
  selected?: boolean;
  onSelect?: () => void;
  onRemove?: () => void;
  variant?: 'default' | 'filter' | 'input';
  disabled?: boolean;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onSelect,
  onRemove,
  variant = 'default',
  disabled = false,
}) => {
  const chipStyle = [
    styles.chip,
    styles[variant],
    selected && styles.selected,
    disabled && styles.disabled,
  ];

  const textStyle = [
    styles.label,
    selected && styles.selectedLabel,
    disabled && styles.disabledLabel,
  ];

  const ChipComponent = onSelect ? TouchableOpacity : View;

  return (
    <ChipComponent
      style={chipStyle}
      onPress={onSelect}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={textStyle}>{label}</Text>
      {onRemove && (
        <TouchableOpacity
          style={styles.removeButton}
          onPress={onRemove}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close-circle" size={16} color={Colors.neutral[400]} />
        </TouchableOpacity>
      )}
    </ChipComponent>
  );
};

interface ChipGroupProps {
  chips: string[];
  selectedChips: string[];
  onToggle: (chip: string) => void;
  multiSelect?: boolean;
}

export const ChipGroup: React.FC<ChipGroupProps> = ({
  chips,
  selectedChips,
  onToggle,
  multiSelect = false,
}) => {
  return (
    <View style={styles.group}>
      {chips.map((chip) => (
        <Chip
          key={chip}
          label={chip}
          selected={selectedChips.includes(chip)}
          onSelect={() => onToggle(chip)}
          variant="filter"
        />
      ))}
    </View>
  );
};
