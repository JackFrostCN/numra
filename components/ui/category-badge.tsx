import { View, Text, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { getCategoryColor, getCategoryIcon } from '@/utils/helpers';
import { Spacing, Fonts } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';

interface CategoryBadgeProps {
  category: string;
  size?: 'sm' | 'md';
}

export function CategoryBadge({ category, size = 'md' }: CategoryBadgeProps) {
  const colors = useThemeColors();
  const color = getCategoryColor(category);
  const iconName = getCategoryIcon(category);
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: `${color}30`,
          borderColor: colors.border,
          borderWidth: 2,
          width: isSmall ? 36 : 44,
          height: isSmall ? 36 : 44,
          borderRadius: 4,
        },
      ]}
    >
      <MaterialIcons
        name={iconName as any}
        size={isSmall ? 18 : 22}
        color={color}
      />
    </View>
  );
}

interface CategoryPillProps {
  category: string;
}

export function CategoryPill({ category }: CategoryPillProps) {
  const colors = useThemeColors();
  const color = getCategoryColor(category);

  return (
    <View style={[styles.pill, { backgroundColor: `${color}30`, borderColor: colors.border, borderWidth: 2 }]}>
      <Text style={[styles.pillText, { color, fontFamily: Fonts.body }]}>{category}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: 0,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
