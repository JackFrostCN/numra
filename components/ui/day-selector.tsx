import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { getDayDisplayName } from '@/utils/helpers';
import { Palette, Spacing, Radius } from '@/constants/theme';

interface DaySelectorProps {
  dateString: string; // "YYYY-MM-DD"
  onChange: (date: string) => void;
  onPrev: () => void;
  onNext: () => void;
}

export function DaySelector({ dateString, onChange, onPrev, onNext }: DaySelectorProps) {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirmDate = (date: Date) => {
    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    onChange(iso);
    hideDatePicker();
  };

  // Convert dateString to Date object safely
  const parts = dateString.split('-');
  const dateObj = parts.length === 3 ? new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])) : new Date();

  return (
    <View style={styles.container}>
      <Pressable onPress={onPrev} style={styles.button} hitSlop={8}>
        <MaterialIcons name="chevron-left" size={24} color={Palette.textSecondary} />
      </Pressable>
      
      <Pressable onPress={showDatePicker}>
        <Text style={styles.label}>{getDayDisplayName(dateString)}</Text>
      </Pressable>
      
      <Pressable onPress={onNext} style={styles.button} hitSlop={8}>
        <MaterialIcons name="chevron-right" size={24} color={Palette.textSecondary} />
      </Pressable>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirmDate}
        onCancel={hideDatePicker}
        date={dateObj}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.base,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: Palette.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Palette.textPrimary,
    minWidth: 160,
    textAlign: 'center',
  },
});
