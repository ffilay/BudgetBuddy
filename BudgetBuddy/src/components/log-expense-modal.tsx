import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Brand, CategoryColors, CategoryEmojis } from '@/constants/theme';

const CATEGORIES = ['Food', 'Fun', 'Transport', 'Housing', 'Education', 'Health', 'Shopping', 'Other'];

interface Props {
  visible: boolean;
  onClose: () => void;
  remainingBudget: number;
  onAddExpense: (amount: number, category: string, note: string) => void;
}

export function LogExpenseModal({ visible, onClose, remainingBudget, onAddExpense }: Props) {
  const insets = useSafeAreaInsets();
  const [amountStr, setAmountStr] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [success, setSuccess] = useState(false);

  const amount = parseFloat(amountStr) || 0;
  const warningThreshold = remainingBudget * 0.8;
  const isWarning = amount > 0 && amount >= warningThreshold;
  const warningPct = remainingBudget > 0 ? Math.round((amount / remainingBudget) * 100) : 0;
  const canSubmit = amount > 0 && selectedCategory !== null;
  const amountInputWidth = Math.min(260, Math.max(84, (amountStr.length || 4) * 21 + 24));

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1000);
      return () => clearTimeout(t);
    }
  }, [success, onClose]);

  const handleClose = () => {
    setAmountStr('');
    setSelectedCategory(null);
    setNote('');
    onClose();
  };

  const handleAdd = () => {
    if (!canSubmit) return;
    onAddExpense(amount, selectedCategory!, note);
    setAmountStr('');
    setSelectedCategory(null);
    setNote('');
    setSuccess(true);
  };

  if (success) {
    return (
      <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
        <Pressable style={styles.overlay} />
        <View style={styles.keyboardView} pointerEvents="none">
          <View style={[styles.sheet, styles.successSheet]}>
            <Text style={styles.successEmoji}>✅</Text>
            <Text style={styles.successTitle}>Expense logged!</Text>
            <Text style={styles.successSub}>Your budget has been updated.</Text>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <Pressable style={styles.overlay} onPress={handleClose} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        pointerEvents="box-none"
      >
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.title}>Log an Expense</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton} hitSlop={8}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.remainingRow}>
            <Text style={styles.remainingAmount}>${remainingBudget.toFixed(2)}</Text>
            <Text style={styles.remainingLabel}> Remaining</Text>
          </View>

          <View style={styles.amountContainer}>
            <Text style={styles.dollarSign}>$</Text>
            <TextInput
              style={[styles.amountInput, { width: amountInputWidth }]}
              value={amountStr}
              onChangeText={setAmountStr}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor="rgba(51,63,52,0.5)"
              selectionColor={Brand.sage}
            />
          </View>

          {isWarning && (
            <View style={styles.warningBox}>
              <Text style={styles.warningTitle}>WARNING - CHECK YOUR NUMBERS</Text>
              <Text style={styles.warningSubtext}>{"THAT'S"} {warningPct}% OF YOUR BUDGET</Text>
            </View>
          )}

          <Text style={styles.sectionLabel}>CATEGORY</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryBtn,
                  { backgroundColor: CategoryColors[cat] },
                  selectedCategory === cat && styles.categoryBtnSelected,
                ]}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.8}
              >
                <Text style={styles.categoryEmoji}>{CategoryEmojis[cat]}</Text>
                <Text style={styles.categoryLabel}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionLabel}>NOTE (OPTIONAL)</Text>
          <TextInput
            style={styles.noteInput}
            value={note}
            onChangeText={setNote}
            placeholder="What did you spend on?"
            placeholderTextColor="rgba(51,63,52,0.5)"
            returnKeyType="done"
          />

          <TouchableOpacity
            style={[styles.addBtn, canSubmit && styles.addBtnActive]}
            onPress={handleAdd}
            disabled={!canSubmit}
            activeOpacity={0.85}
          >
            <Text style={[styles.addBtnText, canSubmit && styles.addBtnTextActive]}>
              Add Expense
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  successSheet: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 8,
  },
  successEmoji: { fontSize: 52 },
  successTitle: { fontSize: 22, fontWeight: '700', color: Brand.primaryDark },
  successSub: { fontSize: 14, color: Brand.sage },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: Brand.separator,
    borderRadius: 100,
    alignSelf: 'center',
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: Brand.primaryDark,
  },
  closeButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 16,
    color: '#9ca3af',
  },
  remainingRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  remainingAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: Brand.gold,
    letterSpacing: -0.4,
  },
  remainingLabel: {
    fontSize: 11,
    color: Brand.sage,
    letterSpacing: 0.06,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Brand.inputBg,
    borderRadius: 16,
    paddingVertical: 20,
    marginBottom: 12,
  },
  dollarSign: {
    fontSize: 28,
    fontWeight: '700',
    color: Brand.sage,
    marginRight: 1,
  },
  amountInput: {
    fontSize: 36,
    fontWeight: '700',
    color: Brand.primaryDark,
    textAlign: 'left',
    letterSpacing: 0.4,
  },
  warningBox: {
    marginBottom: 12,
  },
  warningTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Brand.warning,
    letterSpacing: 0.5,
  },
  warningSubtext: {
    fontSize: 11,
    color: Brand.warning,
    letterSpacing: 0.3,
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9ca3af',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginTop: 4,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  categoryBtn: {
    width: '23%',
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 1.6,
    borderColor: 'transparent',
  },
  categoryBtnSelected: {
    borderColor: Brand.sage,
  },
  categoryEmoji: {
    fontSize: 22,
  },
  categoryLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#4b5563',
    textAlign: 'center',
  },
  noteInput: {
    backgroundColor: Brand.inputBg,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: Brand.primaryDark,
    marginBottom: 16,
  },
  addBtn: {
    backgroundColor: Brand.separator,
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: 'center',
  },
  addBtnActive: {
    backgroundColor: Brand.sage,
  },
  addBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#9ca3af',
    letterSpacing: -0.2,
  },
  addBtnTextActive: {
    color: '#ffffff',
  },
});
