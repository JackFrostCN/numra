import { View, Text, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { getCategoryColor, getCategoryIcon } from '@/utils/helpers';
import { Spacing, Fonts, Radius } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';

interface CategoryBadgeProps {
  category: string;
  size?: 'sm' | 'md';
}

export function CategoryBadge({ category, size = 'md' }: CategoryBadgeProps) {
  const color = getCategoryColor(category);
  const iconName = getCategoryIcon(category);
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: `${color}25`,
          width: isSmall ? 40 : 48,
          height: isSmall ? 40 : 48,
          borderRadius: Radius.full,
        },
      ]}
    >
      <MaterialIcons
        name={iconName as any}
        size={isSmall ? 20 : 24}
        color={color}
      />
    </View>
  );
}

interface CategoryPillProps {
  category: string;
}

export function CategoryPill({ category }: CategoryPillProps) {
  const color = getCategoryColor(category);

  return (
    <View style={[styles.pill, { backgroundColor: `${color}25` }]}>
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
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  pillText: {
    fontSize: 12,
  },
});
