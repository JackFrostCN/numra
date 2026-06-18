import { View, Text, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Spacing, Fonts } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';

interface EmptyStateProps {
  icon: string;
  title: string;
  message: string;
}

export function EmptyState({ icon, title, message }: EmptyStateProps) {
  const colors = useThemeColors();

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, {
        backgroundColor: colors.bgElevated,
        borderColor: colors.border,
        borderWidth: colors.borderWidth,
      }]}>
        <MaterialIcons name={icon as any} size={40} color={colors.textMuted} />
      </View>
      <Text style={[styles.title, { color: colors.textPrimary, fontFamily: Fonts.heading }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.textMuted, fontFamily: Fonts.body }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.xl * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: Spacing.xs,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
