import { View, Text, Pressable, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { getMonthDisplayName } from '@/utils/helpers';
import { Palette, Spacing, Radius } from '@/constants/theme';

interface MonthSelectorProps {
  yearMonth: string; // "YYYY-MM"
  onPrev: () => void;
  onNext: () => void;
}

export function MonthSelector({ yearMonth, onPrev, onNext }: MonthSelectorProps) {
  return (
    <View style={styles.container}>
      <Pressable onPress={onPrev} style={styles.button} hitSlop={8}>
        <MaterialIcons name="chevron-left" size={24} color={Palette.textSecondary} />
      </Pressable>
      <Text style={styles.label}>{getMonthDisplayName(yearMonth)}</Text>
      <Pressable onPress={onNext} style={styles.button} hitSlop={8}>
        <MaterialIcons name="chevron-right" size={24} color={Palette.textSecondary} />
      </Pressable>
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
