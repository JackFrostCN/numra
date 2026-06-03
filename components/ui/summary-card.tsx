import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { formatCurrency } from '@/utils/helpers';
import { Palette, Radius, Spacing } from '@/constants/theme';

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
  return (
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, small && styles.cardSmall]}
    >
      <View style={[styles.header, small && styles.headerSmall]}>
        <View style={[styles.iconContainer, small && styles.iconContainerSmall]}>
          <MaterialIcons name={icon as any} size={small ? 14 : 20} color="rgba(255,255,255,0.9)" />
        </View>
        <Text style={[styles.title, small && styles.titleSmall]}>{title}</Text>
      </View>
      <Text style={[styles.amount, small && styles.amountSmall]}>{formatCurrency(amount)}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
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
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerSmall: {
    width: 22,
    height: 22,
    borderRadius: 6,
  },
  title: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.85)',
  },
  titleSmall: {
    fontSize: 11,
  },
  amount: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: Spacing.sm,
  },
  amountSmall: {
    fontSize: 16,
    marginTop: 0,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 2,
  },
});
