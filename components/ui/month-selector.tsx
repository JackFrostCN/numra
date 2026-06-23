import { View, Text, Pressable, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Spacing, Fonts, Radius } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';
import { getMonthDisplayName } from '@/utils/helpers';

interface MonthSelectorProps {
  yearMonth: string; // YYYY-MM
  onPrev: () => void;
  onNext: () => void;
}

export function MonthSelector({ yearMonth, onPrev, onNext }: MonthSelectorProps) {
  const colors = useThemeColors();
  
  const display = getMonthDisplayName(yearMonth);

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
      
      <View style={styles.center}>
        <MaterialIcons name="calendar-today" size={16} color={colors.textMuted} style={styles.icon} />
        <Text style={[styles.text, { color: colors.textPrimary, fontFamily: Fonts.heading }]} numberOfLines={1} adjustsFontSizeToFit>{display}</Text>
      </View>
      
      <Pressable 
        style={({ pressed }) => [
          styles.btn, 
          { backgroundColor: colors.bgElevated, opacity: pressed ? 0.7 : 1 }
        ]} 
        onPress={onNext}
      >
        <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
      </Pressable>
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
  },
  icon: {
    marginRight: 6,
  },
  text: {
    fontSize: 16,
  },
});
