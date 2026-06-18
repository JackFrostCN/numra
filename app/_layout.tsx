import '../global.css';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SQLiteProvider } from 'expo-sqlite';
import { Suspense } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useColorScheme } from 'nativewind';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';

import { migrateDbIfNeeded } from '@/db/database';
import { DarkPalette, LightPalette, NB } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

// Custom themes matching our neubrutalism palettes
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

  const [fontsLoaded] = useFonts({
    'SpaceGrotesk-Bold': require('../assets/fonts/SpaceGrotesk-Bold.ttf'),
    'SpaceGrotesk-Medium': require('../assets/fonts/SpaceGrotesk-Medium.ttf'),
    'SpaceGrotesk-Regular': require('../assets/fonts/SpaceGrotesk-Regular.ttf'),
    'JetBrainsMono-Medium': require('../assets/fonts/JetBrainsMono-Medium.ttf'),
    'JetBrainsMono-Bold': require('../assets/fonts/JetBrainsMono-Bold.ttf'),
  });

  if (fontsLoaded) {
    SplashScreen.hideAsync();
  }

  if (!fontsLoaded) {
    return <LoadingFallback />;
  }

  const headerStyle = {
    backgroundColor: colors.bgCard,
    borderBottomWidth: colors.borderWidth,
    borderBottomColor: colors.border,
    shadowOpacity: 0,
    elevation: 0,
  };

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
                title: 'ADD TRANSACTION',
                headerStyle,
                headerTintColor: colors.textPrimary,
                headerTitleStyle: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 16 },
              }}
            />
            <Stack.Screen
              name="add-loan"
              options={{
                presentation: 'modal',
                headerShown: true,
                title: 'ADD LOAN',
                headerStyle,
                headerTintColor: colors.textPrimary,
                headerTitleStyle: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 16 },
              }}
            />
            <Stack.Screen
              name="add-bill"
              options={{
                presentation: 'modal',
                headerShown: true,
                title: 'ADD BILL',
                headerStyle,
                headerTintColor: colors.textPrimary,
                headerTitleStyle: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 16 },
              }}
            />
            <Stack.Screen
              name="withdraw"
              options={{
                presentation: 'modal',
                headerShown: true,
                title: 'WITHDRAW CASH',
                headerStyle,
                headerTintColor: colors.textPrimary,
                headerTitleStyle: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 16 },
              }}
            />
            <Stack.Screen
              name="deposit"
              options={{
                presentation: 'modal',
                headerShown: true,
                title: 'DEPOSIT CASH',
                headerStyle,
                headerTintColor: colors.textPrimary,
                headerTitleStyle: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 16 },
              }}
            />
            <Stack.Screen
              name="loan-details"
              options={{
                presentation: 'card',
                headerShown: true,
                title: 'LOAN DETAILS',
                headerStyle,
                headerTintColor: colors.textPrimary,
                headerTitleStyle: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 16 },
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
