import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';

import { Brand } from '@/constants/theme';
import { useBudget } from '@/context/budget';

type ItemStatus = 'equipped' | 'available' | 'locked';

interface ShopItem {
  id: string;
  name: string;
  unlockCondition: string;
  image: any;
}

const ITEMS: ShopItem[] = [
  {
    id: '1',
    name: '30 Day Streak',
    unlockCondition: 'Reach a 30-day logging streak',
    image: require('@/assets/images/shop-30day.png'),
  },
  {
    id: '2',
    name: 'Stayed in Budget',
    unlockCondition: 'Stay within budget for the month',
    image: require('@/assets/images/shop-budget.png'),
  },
  {
    id: '3',
    name: '100 Day Streak',
    unlockCondition: 'Reach a 100-day logging streak',
    image: require('@/assets/images/shop-100day.png'),
  },
  {
    id: '4',
    name: 'Budget Master',
    unlockCondition: 'Always available',
    image: require('@/assets/images/shop-master.png'),
  },
];

function getItemStatus(
  id: string,
  maxStreak: number,
  remaining: number,
  equippedItem: string | null,
): ItemStatus {
  if (equippedItem === id) return 'equipped';

  let unlocked = false;
  if (id === '1') unlocked = maxStreak >= 30;
  else if (id === '2') unlocked = remaining >= 0;
  else if (id === '3') unlocked = maxStreak >= 100;
  else if (id === '4') unlocked = true;

  return unlocked ? 'available' : 'locked';
}

export default function ShopScreen() {
  const { maxStreak, remaining, equippedItem, equipItem } = useBudget();

  return (
    <View style={styles.root}>
      <SafeAreaView>
        <View style={styles.header}>
          <Text style={styles.title}>shop</Text>
          <Text style={styles.subtitle}>Unlock troll rewards as you budget better 🌿</Text>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {ITEMS.map((item) => {
          const status = getItemStatus(item.id, maxStreak, remaining, equippedItem);
          return (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardContent}>
                <Image source={item.image} style={styles.thumb} resizeMode="cover" />
                <View style={styles.info}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  {status === 'equipped' && (
                    <TouchableOpacity
                      style={styles.equippedBtn}
                      activeOpacity={0.85}
                      onPress={() => equipItem(null)}
                    >
                      <Text style={styles.equippedText}>✓  Equipped — tap to remove</Text>
                    </TouchableOpacity>
                  )}
                  {status === 'available' && (
                    <TouchableOpacity
                      style={styles.buyBtn}
                      activeOpacity={0.85}
                      onPress={() => equipItem(item.id)}
                    >
                      <Text style={styles.buyText}>🛒  Equip</Text>
                    </TouchableOpacity>
                  )}
                  {status === 'locked' && (
                    <View style={styles.lockedBox}>
                      <View style={styles.lockedRow}>
                        <Text style={styles.lockEmoji}>🔒</Text>
                        <Text style={styles.lockedText}>Locked</Text>
                      </View>
                      <Text style={styles.unlockText}>Unlock: "{item.unlockCondition}"</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Brand.background },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
  title: { fontSize: 42, fontWeight: '600', color: Brand.primaryDark, lineHeight: 50 },
  subtitle: { fontSize: 13, color: Brand.sage, letterSpacing: -0.08, marginTop: 4 },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Brand.cardBorder,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardContent: { flexDirection: 'row', gap: 16, alignItems: 'flex-start' },
  thumb: {
    width: 80,
    height: 80,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e9d4ff',
    overflow: 'hidden',
  },
  info: { flex: 1, justifyContent: 'space-between', gap: 12 },
  itemName: { fontSize: 18, fontWeight: '500', color: '#000000' },
  equippedBtn: {
    backgroundColor: Brand.sage,
    borderRadius: 100,
    paddingVertical: 10,
    alignItems: 'center',
  },
  equippedText: { fontSize: 16, fontWeight: '500', color: '#ffffff' },
  lockedBox: { backgroundColor: '#e5e7eb', borderRadius: 10, padding: 10, gap: 4 },
  lockedRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  lockEmoji: { fontSize: 13 },
  lockedText: { fontSize: 14, color: '#4a5565' },
  unlockText: { fontSize: 12, color: '#364153', lineHeight: 16 },
  buyBtn: { backgroundColor: Brand.gold, borderRadius: 100, paddingVertical: 10, alignItems: 'center' },
  buyText: { fontSize: 16, fontWeight: '500', color: '#ffffff' },
});
