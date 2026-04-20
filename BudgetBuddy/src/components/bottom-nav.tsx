import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { SymbolView } from 'expo-symbols';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LogExpenseModal } from './log-expense-modal';
import { Brand } from '@/constants/theme';
import { useBudget } from '@/context/budget';

const TABS = [
  { name: 'index', label: 'Home', symbol: 'house' as const },
  { name: 'transactions', label: 'Transactions', symbol: 'clock' as const },
  { name: 'shop', label: 'Shop', symbol: 'bag' as const },
  { name: 'upload', label: 'Upload', symbol: 'square.and.arrow.up' as const },
];

export function BottomNav({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const [logVisible, setLogVisible] = useState(false);
  const { remaining, addExpense } = useBudget();

  const navigate = (routeName: string) => {
    const route = state.routes.find((r) => r.name === routeName);
    if (!route) return;
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });
    if (!event.defaultPrevented) {
      navigation.navigate(routeName);
    }
  };

  const activeRouteName = state.routes[state.index]?.name;

  return (
    <>
      <LogExpenseModal
        visible={logVisible}
        onClose={() => setLogVisible(false)}
        remainingBudget={remaining}
        onAddExpense={(amount, category, note) => {
          addExpense(amount, category, note);
          setLogVisible(false);
        }}
      />

      <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        {/* Home */}
        <NavTab
          label="Home"
          symbol="house"
          active={activeRouteName === 'index'}
          onPress={() => navigate('index')}
        />

        {/* Transactions */}
        <NavTab
          label="Transactions"
          symbol="clock"
          active={activeRouteName === 'transactions'}
          onPress={() => navigate('transactions')}
        />

        {/* Log FAB */}
        <View style={styles.fabWrapper}>
          <TouchableOpacity style={styles.fab} onPress={() => setLogVisible(true)} activeOpacity={0.85}>
            <Text style={styles.fabPlus}>+</Text>
          </TouchableOpacity>
          <Text style={styles.fabLabel}>Log</Text>
        </View>

        {/* Shop */}
        <NavTab
          label="Shop"
          symbol="bag"
          active={activeRouteName === 'shop'}
          onPress={() => navigate('shop')}
        />

        {/* Upload */}
        <NavTab
          label="Upload"
          symbol="square.and.arrow.up"
          active={activeRouteName === 'upload'}
          onPress={() => navigate('upload')}
        />
      </View>
    </>
  );
}

function NavTab({
  label,
  symbol,
  active,
  onPress,
}: {
  label: string;
  symbol: string;
  active: boolean;
  onPress: () => void;
}) {
  const color = active ? Brand.sage : Brand.inactive;
  return (
    <TouchableOpacity style={styles.tab} onPress={onPress} activeOpacity={0.7}>
      <SymbolView
        name={symbol as any}
        size={23}
        tintColor={color}
        style={styles.tabIcon}
      />
      <Text style={[styles.tabLabel, { color, fontWeight: active ? '700' : '400' }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 0.8,
    borderTopColor: Brand.cardBorder,
    paddingTop: 8,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 4,
    gap: 3,
  },
  tabIcon: {
    width: 24,
    height: 24,
  },
  tabLabel: {
    fontSize: 10,
    letterSpacing: 0.2,
  },
  fabWrapper: {
    flex: 1,
    alignItems: 'center',
    marginTop: -28,
    gap: 4,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Brand.sage,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Brand.sage,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  fabPlus: {
    fontSize: 30,
    color: '#ffffff',
    lineHeight: 34,
    fontWeight: '300',
    marginTop: -2,
  },
  fabLabel: {
    fontSize: 10,
    color: Brand.sage,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
});
