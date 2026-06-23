import { View, Text, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Spacing, Fonts, Radius } from '@/constants/theme';
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
      <View style={[styles.iconContainer, { backgroundColor: colors.bgElevated }]}>
        <MaterialIcons name={icon as any} size={40} color={colors.textMuted} />
      </View>
      <Text style={[styles.title, { color: colors.textPrimary, fontFamily: Fonts.heading }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.textSecondary, fontFamily: Fonts.bodyRegular }]}>{message}</Text>
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
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 18,
    marginBottom: Spacing.xs,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
});
