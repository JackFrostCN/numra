import { View, Text, Pressable, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Spacing, Fonts } from '@/constants/theme';
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
        style={[styles.btn, {
          backgroundColor: colors.bgCard,
          borderColor: colors.border,
          borderWidth: 2,
        }]} 
        onPress={onPrev}
      >
        <MaterialIcons name="chevron-left" size={24} color={colors.textPrimary} />
      </Pressable>
      
      <View style={styles.center}>
        <MaterialIcons name="calendar-today" size={16} color={colors.textMuted} style={styles.icon} />
        <Text style={[styles.text, { color: colors.textPrimary, fontFamily: Fonts.heading }]}>{display}</Text>
      </View>
      
      <Pressable 
        style={[styles.btn, {
          backgroundColor: colors.bgCard,
          borderColor: colors.border,
          borderWidth: 2,
        }]} 
        onPress={onNext}
      >
        <MaterialIcons name="chevron-right" size={24} color={colors.textPrimary} />
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
    borderRadius: 0,
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
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
