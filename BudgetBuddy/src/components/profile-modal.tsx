import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Brand } from '@/constants/theme';
import { useBudget } from '@/context/budget';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function ProfileModal({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { streak, maxStreak, totalBudget, spent, remaining, expenses, equippedItem } = useBudget();

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const expenseCount = expenses.length;

  const categoryTotals: Record<string, number> = {};
  for (const e of expenses) {
    categoryTotals[e.category] = (categoryTotals[e.category] ?? 0) + e.amount;
  }
  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <Pressable style={styles.overlay} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={styles.title}>your profile</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={8}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.statsGrid}>
            <StatCard label="Current Streak" value={`${streak} days`} emoji="🔥" />
            <StatCard label="Best Streak" value={`${maxStreak} days`} emoji="🏆" />
            <StatCard label="Monthly Budget" value={`$${totalBudget.toFixed(0)}`} emoji="💰" />
            <StatCard label="Remaining" value={`$${Math.abs(remaining).toFixed(2)}`} emoji={remaining >= 0 ? '✅' : '⚠️'} />
            <StatCard label="Expenses Logged" value={`${expenseCount}`} emoji="📋" />
            <StatCard label="All-time Spent" value={`$${totalSpent.toFixed(2)}`} emoji="💸" />
          </View>

          {topCategory && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>TOP SPENDING CATEGORY</Text>
              <View style={styles.topCatRow}>
                <Text style={styles.topCatName}>{topCategory[0]}</Text>
                <Text style={styles.topCatAmount}>${topCategory[1].toFixed(2)}</Text>
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>BUDDY STATUS</Text>
            <Text style={styles.buddyStatus}>
              {equippedItem ? `Accessory equipped (#${equippedItem})` : streak === 0 ? 'On fire 🔥 — log an expense to start your streak!' : remaining < 0 ? 'Struggling 😟 — over budget this month' : streak >= 100 ? 'Thriving 🌸 — amazing work!' : 'Healthy 🌱 — keep it up!'}
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

function StatCard({ label, value, emoji }: { label: string; value: string; emoji: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    maxHeight: '80%',
  },
  handle: {
    width: 36, height: 4, backgroundColor: Brand.separator,
    borderRadius: 100, alignSelf: 'center', marginBottom: 8,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: '600', color: Brand.primaryDark },
  closeBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  closeIcon: { fontSize: 16, color: '#9ca3af' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  statCard: {
    width: '47%',
    backgroundColor: Brand.inputBg,
    borderRadius: 16,
    padding: 14,
    gap: 4,
  },
  statEmoji: { fontSize: 22 },
  statValue: { fontSize: 20, fontWeight: '700', color: Brand.primaryDark, letterSpacing: -0.4 },
  statLabel: { fontSize: 11, color: Brand.sage, letterSpacing: 0.06 },
  section: { marginBottom: 20 },
  sectionLabel: { fontSize: 11, fontWeight: '600', color: '#9ca3af', letterSpacing: 0.6, marginBottom: 8 },
  topCatRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  topCatName: { fontSize: 18, fontWeight: '600', color: Brand.primaryDark },
  topCatAmount: { fontSize: 18, fontWeight: '700', color: Brand.warning },
  buddyStatus: { fontSize: 14, color: Brand.primaryDark, lineHeight: 20 },
});
