import { View, Text, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { getCategoryColor, getCategoryIcon } from '@/utils/helpers';
import { Radius, Spacing } from '@/constants/theme';

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
          backgroundColor: `${color}18`,
          width: isSmall ? 36 : 44,
          height: isSmall ? 36 : 44,
          borderRadius: isSmall ? 10 : 12,
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
  const color = getCategoryColor(category);

  return (
    <View style={[styles.pill, { backgroundColor: `${color}18` }]}>
      <Text style={[styles.pillText, { color }]}>{category}</Text>
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
    borderRadius: Radius.full,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
