import { View, Text, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { formatCurrency } from '@/utils/helpers';
import { Spacing, Fonts, NB } from '@/constants/theme';
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
  // Use solid color instead of gradient — first color of the gradient pair
  const bgColor = gradient[0];

  return (
    <View style={{ flex: 1, position: 'relative' }}>
      {/* Hard shadow */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: colors.border,
            borderRadius: 4,
            top: NB.shadowOffset,
            left: NB.shadowOffset,
            right: -NB.shadowOffset,
            bottom: -NB.shadowOffset,
          },
        ]}
      />
      <View
        style={[
          styles.card,
          small && styles.cardSmall,
          {
            backgroundColor: bgColor,
            borderColor: colors.border,
            borderWidth: colors.borderWidth,
          },
        ]}
      >
        <View style={[styles.header, small && styles.headerSmall]}>
          <View style={[styles.iconContainer, small && styles.iconContainerSmall]}>
            <MaterialIcons name={icon as any} size={small ? 14 : 20} color="#000000" />
          </View>
          <Text style={[styles.title, small && styles.titleSmall]}>{title}</Text>
        </View>
        <Text style={[styles.amount, small && styles.amountSmall]}>
          {formatCurrency(amount)}
        </Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 4,
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
    width: 32,
    height: 32,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerSmall: {
    width: 22,
    height: 22,
    borderRadius: 4,
  },
  title: {
    fontSize: 13,
    fontFamily: Fonts.body,
    color: '#000000',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  titleSmall: {
    fontSize: 11,
  },
  amount: {
    fontSize: 22,
    fontFamily: Fonts.heading,
    color: '#000000',
    marginTop: Spacing.sm,
  },
  amountSmall: {
    fontSize: 16,
    marginTop: 0,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: Fonts.body,
    color: 'rgba(0,0,0,0.6)',
    marginTop: 2,
  },
});
