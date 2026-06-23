import { View, Text, Pressable, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Spacing, Fonts, Radius } from '@/constants/theme';
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
        style={({ pressed }) => [
          styles.btn, 
          { backgroundColor: colors.bgElevated, opacity: pressed ? 0.7 : 1 }
        ]} 
        onPress={onPrev}
      >
        <MaterialIcons name="chevron-left" size={24} color={colors.textSecondary} />
      </Pressable>
      
      <Pressable 
        style={({ pressed }) => [
          styles.center,
          pressed && onChange && { opacity: 0.7 }
        ]}
        onPress={() => onChange && setDatePickerVisibility(true)}
        disabled={!onChange}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MaterialIcons name="today" size={16} color={colors.textMuted} style={styles.icon} />
          <Text style={[styles.text, { color: colors.textPrimary, fontFamily: Fonts.heading }]} numberOfLines={1} adjustsFontSizeToFit>{display}</Text>
        </View>
      </Pressable>
      
      <Pressable 
        style={({ pressed }) => [
          styles.btn, 
          { backgroundColor: colors.bgElevated, opacity: pressed ? 0.7 : 1 }
        ]} 
        onPress={onNext}
      >
        <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
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
  },
  icon: {
    marginRight: 6,
  },
  text: {
    fontSize: 16,
  },
});
