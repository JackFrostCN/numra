import {
  createMaterialTopTabNavigator,
  MaterialTopTabNavigationOptions,
  MaterialTopTabNavigationEventMap,
} from '@react-navigation/material-top-tabs';
import { withLayoutContext } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useThemeColors } from '@/hooks/useThemeColors';
import { Fonts } from '@/constants/theme';

const { Navigator } = createMaterialTopTabNavigator();

export const MaterialTopTabs = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof Navigator,
  any,
  MaterialTopTabNavigationEventMap
>(Navigator);

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();

  return (
    <MaterialTopTabs
      tabBarPosition="bottom"
      initialRouteName="index"
      screenOptions={{
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarShowIcon: true,
        tabBarIndicatorStyle: {
          height: 0,
        },
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBarBorder,
          borderTopWidth: colors.borderWidth,
          height: 60 + (Platform.OS === 'android' ? insets.bottom || 24 : insets.bottom),
          paddingBottom: Platform.OS === 'android' ? Math.max(insets.bottom, 16) : Math.max(insets.bottom, 8),
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: Fonts.heading,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          marginTop: 4,
        },
        tabBarItemStyle: {
          padding: 0,
          paddingTop: 8,
        },
        swipeEnabled: true,
        animationEnabled: false,
      }}
    >
      <MaterialTopTabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="dashboard" size={24} color={color} />
          ),
        }}
      />
      <MaterialTopTabs.Screen
        name="transactions"
        options={{
          title: 'Txns',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="swap-horiz" size={24} color={color} />
          ),
        }}
      />
      <MaterialTopTabs.Screen
        name="loans"
        options={{
          title: 'Loans',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="account-balance" size={24} color={color} />
          ),
        }}
      />
      <MaterialTopTabs.Screen
        name="bills"
        options={{
          title: 'Bills',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="receipt-long" size={24} color={color} />
          ),
        }}
      />
      <MaterialTopTabs.Screen
        name="settings"
        options={{
          title: 'Config',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="settings" size={24} color={color} />
          ),
        }}
      />
    </MaterialTopTabs>
  );
}
