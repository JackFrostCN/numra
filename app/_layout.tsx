import '../global.css';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SQLiteProvider } from 'expo-sqlite';
import { Suspense } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useColorScheme } from 'nativewind';
import 'react-native-reanimated';

import { migrateDbIfNeeded } from '@/db/database';
import { DarkPalette, LightPalette } from '@/constants/theme';

// Custom themes matching our palettes
const NumraDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: DarkPalette.accent,
    background: DarkPalette.bg,
    card: DarkPalette.bgCard,
    text: DarkPalette.textPrimary,
    border: DarkPalette.border,
    notification: DarkPalette.danger,
  },
};

const NumraLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: LightPalette.accent,
    background: LightPalette.bg,
    card: LightPalette.bgCard,
    text: LightPalette.textPrimary,
    border: LightPalette.border,
    notification: LightPalette.danger,
  },
};

function LoadingFallback() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={DarkPalette.accent} />
    </View>
  );
}

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? DarkPalette : LightPalette;
  const theme = isDark ? NumraDarkTheme : NumraLightTheme;

  return (
    <Suspense fallback={<LoadingFallback />}>
      <SQLiteProvider databaseName="numra.db" onInit={migrateDbIfNeeded} useSuspense>
        <ThemeProvider value={theme}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.bg },
            }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="add-transaction"
              options={{
                presentation: 'modal',
                headerShown: true,
                title: 'Add Transaction',
                headerStyle: { backgroundColor: colors.bgCard },
                headerTintColor: colors.textPrimary,
              }}
            />
            <Stack.Screen
              name="add-loan"
              options={{
                presentation: 'modal',
                headerShown: true,
                title: 'Add Loan',
                headerStyle: { backgroundColor: colors.bgCard },
                headerTintColor: colors.textPrimary,
              }}
            />
            <Stack.Screen
              name="add-bill"
              options={{
                presentation: 'modal',
                headerShown: true,
                title: 'Add Bill',
                headerStyle: { backgroundColor: colors.bgCard },
                headerTintColor: colors.textPrimary,
              }}
            />
            <Stack.Screen
              name="withdraw"
              options={{
                presentation: 'modal',
                headerShown: true,
                title: 'Withdraw Cash',
                headerStyle: { backgroundColor: colors.bgCard },
                headerTintColor: colors.textPrimary,
              }}
            />
            <Stack.Screen
              name="deposit"
              options={{
                presentation: 'modal',
                headerShown: true,
                title: 'Deposit Cash',
                headerStyle: { backgroundColor: colors.bgCard },
                headerTintColor: colors.textPrimary,
              }}
            />
            <Stack.Screen
              name="loan-details"
              options={{
                presentation: 'card',
                headerShown: true,
                title: 'Loan Details',
                headerStyle: { backgroundColor: colors.bgCard },
                headerTintColor: colors.textPrimary,
              }}
            />
          </Stack>
          <StatusBar style={isDark ? 'light' : 'dark'} />
        </ThemeProvider>
      </SQLiteProvider>
    </Suspense>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: DarkPalette.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
