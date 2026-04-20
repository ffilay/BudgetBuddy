import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Tabs } from 'expo-router';
import React from 'react';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { BottomNav } from '@/components/bottom-nav';
import { BudgetProvider } from '@/context/budget';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <BudgetProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Tabs tabBar={(props) => <BottomNav {...props} />} screenOptions={{ headerShown: false }}>
          <Tabs.Screen name="index" options={{ title: 'Home' }} />
          <Tabs.Screen name="transactions" options={{ title: 'Transactions' }} />
          <Tabs.Screen name="shop" options={{ title: 'Shop' }} />
          <Tabs.Screen name="upload" options={{ title: 'Upload' }} />
          <Tabs.Screen name="explore" options={{ href: null }} />
        </Tabs>
        <AnimatedSplashOverlay />
      </ThemeProvider>
    </BudgetProvider>
  );
}
