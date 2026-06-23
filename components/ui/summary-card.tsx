import { View, Text, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { formatCurrency } from '@/utils/helpers';
import { Spacing, Fonts, Radius, Shadows } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';

interface SummaryCardProps {
  title: string;
  amount: number;
  icon: string;
  gradient: readonly [string, string, ...string[]];
  subtitle?: string;
  small?: boolean;
}

export function SummaryCard({
  title,
  amount,
  icon,
  gradient,
  subtitle,
  small,
}: SummaryCardProps) {
  const colors = useThemeColors();
  const accentColor = gradient[0];

  return (
    <View
      style={[
        styles.card,
        small && styles.cardSmall,
        {
          backgroundColor: colors.bgCard,
          borderColor: colors.border,
          borderWidth: colors.borderWidth,
          borderLeftWidth: 4,
          borderLeftColor: accentColor,
        },
        Shadows.sm,
      ]}
    >
      <View style={[styles.header, small && styles.headerSmall]}>
        <View style={[styles.iconContainer, small && styles.iconContainerSmall, { backgroundColor: `${accentColor}15` }]}>
          <MaterialIcons name={icon as any} size={small ? 16 : 22} color={accentColor} />
        </View>
        <Text style={[styles.title, small && styles.titleSmall, { color: colors.textSecondary }]}>{title}</Text>
      </View>
      <Text style={[styles.amount, small && styles.amountSmall, { color: colors.textPrimary }]}>
        {formatCurrency(amount)}
      </Text>
      {subtitle && <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.md,
    padding: Spacing.base,
    flex: 1,
    minHeight: 110,
    justifyContent: 'space-between',
  },
  cardSmall: {
    minHeight: 70,
    padding: Spacing.sm,
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerSmall: {
    gap: Spacing.xs,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerSmall: {
    width: 28,
    height: 28,
  },
  title: {
    fontSize: 13,
    fontFamily: Fonts.body,
    letterSpacing: 0.5,
  },
  titleSmall: {
    fontSize: 12,
  },
  amount: {
    fontSize: 24,
    fontFamily: Fonts.mono,
    marginTop: Spacing.sm,
  },
  amountSmall: {
    fontSize: 18,
    marginTop: 0,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: Fonts.bodyRegular,
    marginTop: 4,
  },
});
