import { View, Text, Pressable, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Spacing, Radius } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';
import { formatDateShort } from '@/utils/helpers';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useState } from 'react';

interface DaySelectorProps {
  dateString: string; // YYYY-MM-DD
  onPrev: () => void;
  onNext: () => void;
  onChange?: (date: string) => void;
}

export function DaySelector({ dateString, onPrev, onNext, onChange }: DaySelectorProps) {
  const colors = useThemeColors();
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const display = formatDateShort(dateString);

  return (
    <View style={styles.container}>
      <Pressable 
        style={[styles.btn, { backgroundColor: colors.bgElevated }]} 
        onPress={onPrev}
      >
        <MaterialIcons name="chevron-left" size={24} color={colors.textPrimary} />
      </Pressable>
      
      <Pressable 
        style={styles.center}
        onPress={() => onChange && setDatePickerVisibility(true)}
        disabled={!onChange}
      >
        <MaterialIcons name="today" size={16} color={colors.textMuted} style={styles.icon} />
        <Text style={[styles.text, { color: colors.textPrimary }]}>{display}</Text>
      </Pressable>
      
      <Pressable 
        style={[styles.btn, { backgroundColor: colors.bgElevated }]} 
        onPress={onNext}
      >
        <MaterialIcons name="chevron-right" size={24} color={colors.textPrimary} />
      </Pressable>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        date={new Date(dateString)}
        onConfirm={(date) => {
          setDatePickerVisibility(false);
          if (onChange) {
            onChange(date.toISOString().split('T')[0]);
          }
        }}
        onCancel={() => setDatePickerVisibility(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  btn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
  },
  icon: {
    marginRight: 6,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});
