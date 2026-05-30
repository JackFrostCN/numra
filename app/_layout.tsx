import '../global.css';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SQLiteProvider } from 'expo-sqlite';
import { Suspense } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import 'react-native-reanimated';

import { migrateDbIfNeeded } from '@/db/database';
import { Palette } from '@/constants/theme';

// Custom dark theme matching our palette
const NumraTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Palette.accent,
    background: Palette.bg,
    card: Palette.bgCard,
    text: Palette.textPrimary,
    border: Palette.border,
    notification: Palette.danger,
  },
};

function LoadingFallback() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={Palette.accent} />
    </View>
  );
}

export default function RootLayout() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SQLiteProvider databaseName="numra.db" onInit={migrateDbIfNeeded} useSuspense>
        <ThemeProvider value={NumraTheme}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: Palette.bg },
            }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="add-transaction"
              options={{
                presentation: 'modal',
                headerShown: true,
                title: 'Add Transaction',
                headerStyle: { backgroundColor: Palette.bgCard },
                headerTintColor: Palette.textPrimary,
              }}
            />
            <Stack.Screen
              name="add-loan"
              options={{
                presentation: 'modal',
                headerShown: true,
                title: 'Add Loan',
                headerStyle: { backgroundColor: Palette.bgCard },
                headerTintColor: Palette.textPrimary,
              }}
            />
            <Stack.Screen
              name="add-bill"
              options={{
                presentation: 'modal',
                headerShown: true,
                title: 'Add Bill',
                headerStyle: { backgroundColor: Palette.bgCard },
                headerTintColor: Palette.textPrimary,
              }}
            />
            <Stack.Screen
              name="withdraw"
              options={{
                presentation: 'modal',
                headerShown: true,
                title: 'Withdraw Cash',
                headerStyle: { backgroundColor: Palette.bgCard },
                headerTintColor: Palette.textPrimary,
              }}
            />
            <Stack.Screen
              name="loan-details"
              options={{
                presentation: 'card',
                headerShown: true,
                title: 'Loan Details',
                headerStyle: { backgroundColor: Palette.bgCard },
                headerTintColor: Palette.textPrimary,
              }}
            />
          </Stack>
          <StatusBar style="light" />
        </ThemeProvider>
      </SQLiteProvider>
    </Suspense>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: Palette.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
