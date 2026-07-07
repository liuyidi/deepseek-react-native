import { Redirect, Tabs, router } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAppTheme } from '@/hooks/useAppTheme';

const settingsTabOptions = {
  title: '我的',
  unmountOnBlur: true,
  tabBarIcon: ({ color }: { color: string }) => (
    <IconSymbol size={26} name="person.fill" color={color} />
  ),
} as BottomTabNavigationOptions;

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const appTheme = useAppTheme();
  const { canAccessApp, isReady } = useAuth();

  if (!isReady) {
    return (
      <View style={[styles.loading, { backgroundColor: appTheme.background }]}>
        <ActivityIndicator size="large" color={appTheme.text} />
      </View>
    );
  }

  if (!canAccessApp) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: colorScheme === 'dark' ? '#D1D1D6' : '#3A3A3C',
        tabBarLabelStyle: styles.tabLabel,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: theme.border,
            elevation: 0,
          },
          default: {
            backgroundColor: theme.card,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: theme.border,
          },
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="paperplane.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={settingsTabOptions}
        listeners={({ navigation }) => ({
          tabPress: () => {
            const state = navigation.getState();
            const focusedRoute = state.routes[state.index];
            if (focusedRoute.name === 'settings') {
              router.replace('/(tabs)/settings');
            }
          },
        })}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});
