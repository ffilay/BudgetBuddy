import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Alert } from 'react-native';

import { Brand, CategoryColors, CategoryEmojis } from '@/constants/theme';
import { useBudget, Expense } from '@/context/budget';

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function TransactionsScreen() {
  const { expenses, spent, totalBudget, remaining } = useBudget();

  return (
    <View style={styles.root}>
      <SafeAreaView>
        <View style={styles.header}>
          <Text style={styles.title}>transactions</Text>
          <Text style={styles.subtitle}>Your spending history</Text>
        </View>
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Spent</Text>
            <Text style={styles.summaryValue}>${spent.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Budget</Text>
            <Text style={styles.summaryValue}>${totalBudget.toFixed(0)}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Remaining</Text>
            <Text style={[styles.summaryValue, { color: remaining >= 0 ? Brand.gold : Brand.warning }]}>
              {remaining < 0 ? '-' : ''}${Math.abs(remaining).toFixed(2)}
            </Text>
          </View>
        </View>
      </SafeAreaView>

      {expenses.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🌿</Text>
          <Text style={styles.emptyText}>No expenses yet!</Text>
          <Text style={styles.emptySubtext}>Tap the + button to log your first expense</Text>
        </View>
      ) : (
        <FlatList
          data={expenses}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <ExpenseRow expense={item} />}
        />
      )}
    </View>
  );
}

function ExpenseRow({ expense }: { expense: Expense }) {
  const { deleteExpense } = useBudget();

  const handleDelete = () => {
    Alert.alert(
      'Delete expense?',
      `Remove $${expense.amount.toFixed(2)} – ${expense.category}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteExpense(expense.id) },
      ]
    );
  };

  return (
    <View style={styles.row}>
      <View style={[styles.iconBox, { backgroundColor: CategoryColors[expense.category] ?? '#f3f4f6' }]}>
        <Text style={styles.rowEmoji}>{CategoryEmojis[expense.category] ?? '💡'}</Text>
      </View>
      <View style={styles.rowInfo}>
        <Text style={styles.rowCategory}>{expense.category}</Text>
        {!!expense.note && <Text style={styles.rowNote}>{expense.note}</Text>}
      </View>
      <View style={styles.rowRight}>
        <Text style={styles.rowAmount}>-${expense.amount.toFixed(2)}</Text>
        <Text style={styles.rowDate}>{formatDate(expense.date)}</Text>
      </View>
      <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} hitSlop={8}>
        <Text style={styles.deleteIcon}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Brand.background },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
  title: { fontSize: 42, fontWeight: '600', color: Brand.primaryDark, lineHeight: 50 },
  subtitle: { fontSize: 13, color: Brand.sage, marginTop: 4 },
  summaryRow: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: Brand.cardBorder,
  },
  summaryLabel: { fontSize: 11, color: Brand.sage, letterSpacing: 0.06, marginBottom: 2 },
  summaryValue: { fontSize: 16, fontWeight: '700', color: Brand.primaryDark, letterSpacing: -0.3 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: 18, fontWeight: '600', color: Brand.primaryDark },
  emptySubtext: { fontSize: 13, color: Brand.sage, textAlign: 'center', paddingHorizontal: 40 },
  list: { padding: 16, gap: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Brand.cardBorder,
    padding: 14,
    gap: 12,
  },
  iconBox: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  rowEmoji: { fontSize: 22 },
  rowInfo: { flex: 1 },
  rowCategory: { fontSize: 15, fontWeight: '600', color: Brand.primaryDark },
  rowNote: { fontSize: 12, color: Brand.sage, marginTop: 2 },
  rowRight: { alignItems: 'flex-end' },
  rowAmount: { fontSize: 16, fontWeight: '700', color: Brand.warning, letterSpacing: -0.3 },
  rowDate: { fontSize: 11, color: Brand.sage, marginTop: 2 },
  deleteBtn: { paddingLeft: 4 },
  deleteIcon: { fontSize: 16 },
});
