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

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function HelpModal({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <Pressable style={styles.overlay} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={styles.title}>How it Works</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={8}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <HelpItem
            emoji="➕"
            heading="Log Expenses"
            body="Tap the green + button to log an expense. Pick a category, enter the amount, and add an optional note."
          />
          <HelpItem
            emoji="🔥"
            heading="Build Your Streak"
            body="Log at least one expense every day to keep your streak alive. Miss a day and it resets to 1."
          />
          <HelpItem
            emoji="🌱"
            heading="Your Buddy's Mood"
            body="Your buddy's appearance reflects your budget health. Stay on track for a happy buddy — go over budget or lose your streak and watch it suffer."
          />
          <HelpItem
            emoji="🛒"
            heading="Shop Rewards"
            body="Earn cosmetic accessories for your buddy by hitting milestones: 30-day streak, 100-day streak, staying in budget, and more."
          />
          <HelpItem
            emoji="⚠️"
            heading="Overspend Warning"
            body="When an expense is 80% or more of your remaining budget, you'll see a warning before confirming."
          />
          <HelpItem
            emoji="⚙️"
            heading="Settings"
            body="Go to the Upload tab to set your monthly budget or import expenses from a CSV file."
          />
        </ScrollView>
      </View>
    </Modal>
  );
}

function HelpItem({ emoji, heading, body }: { emoji: string; heading: string; body: string }) {
  return (
    <View style={styles.item}>
      <Text style={styles.itemEmoji}>{emoji}</Text>
      <View style={styles.itemText}>
        <Text style={styles.itemHeading}>{heading}</Text>
        <Text style={styles.itemBody}>{body}</Text>
      </View>
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
    maxHeight: '85%',
  },
  handle: {
    width: 36, height: 4, backgroundColor: Brand.separator,
    borderRadius: 100, alignSelf: 'center', marginBottom: 8,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: '600', color: Brand.primaryDark },
  closeBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  closeIcon: { fontSize: 16, color: '#9ca3af' },
  item: { flexDirection: 'row', gap: 14, marginBottom: 20 },
  itemEmoji: { fontSize: 26, marginTop: 2 },
  itemText: { flex: 1 },
  itemHeading: { fontSize: 16, fontWeight: '600', color: Brand.primaryDark, marginBottom: 4 },
  itemBody: { fontSize: 13, color: Brand.sage, lineHeight: 19 },
});
