import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';

import { Brand } from '@/constants/theme';
import { useBudget } from '@/context/budget';
import { ProfileModal } from '@/components/profile-modal';
import { HelpModal } from '@/components/help-modal';

const ACCESSORY_IMG: Record<string, any> = {
  '1': require('@/assets/images/acc-beannie.png'),
  '2': require('@/assets/images/acc-sunglasses.png'),
  '3': require('@/assets/images/acc-flower.png'),
  '4': require('@/assets/images/acc-mushroom.png'),
};

const { width: W } = Dimensions.get('window');

type CharacterState = 'thriving' | 'healthy' | 'struggling' | 'onFire';

const CHARACTER_IMG: Record<CharacterState, any> = {
  thriving:   require('@/assets/images/character-thriving.png'),
  healthy:    require('@/assets/images/character-healthy.png'),
  struggling: require('@/assets/images/character-struggling.png'),
  onFire:     require('@/assets/images/character-onfire.png'),
};

const STATUS = {
  onTrack:       { label: 'On Track',        color: Brand.gold    },
  couldBeBetter: { label: 'could be better', color: '#f59e0b'     },
  overSpender:   { label: 'Over-spender!',   color: '#ef4444'     },
};

function getCharState(streak: number, remaining: number, totalBudget: number): CharacterState {
  if (remaining < 0 || streak === 0) return 'onFire';
  if (remaining <= totalBudget * 0.2) return 'struggling';
  if (streak >= 100) return 'thriving';
  return 'healthy';
}

function getStatus(remaining: number, total: number) {
  if (remaining >= 0) return STATUS.onTrack;
  if (remaining >= -(total * 0.1)) return STATUS.couldBeBetter;
  return STATUS.overSpender;
}

export default function HomeScreen() {
  const { streak, totalBudget, spent, remaining, equippedItem } = useBudget();
  const [profileVisible, setProfileVisible] = useState(false);
  const [helpVisible, setHelpVisible] = useState(false);
  const progressPct = Math.min(totalBudget > 0 ? spent / totalBudget : 0, 1);
  const charState = getCharState(streak, remaining, totalBudget);
  const status = getStatus(remaining, totalBudget);
  const accessorySource = charState === 'healthy' && equippedItem ? ACCESSORY_IMG[equippedItem] : null;

  return (
    <View style={styles.root}>
      <ProfileModal visible={profileVisible} onClose={() => setProfileVisible(false)} />
      <HelpModal visible={helpVisible} onClose={() => setHelpVisible(false)} />
      <SafeAreaView>
        <View style={styles.topBar}>
          <View style={styles.streakBadge}>
            <Image source={require('@/assets/images/fire.png')} style={styles.fireIcon} />
            <Text style={styles.streakNum}>{streak}</Text>
            <Text style={styles.streakDayLabel}> day streak</Text>
          </View>
          <View style={styles.topIcons}>
            <TouchableOpacity style={styles.iconBtn} hitSlop={8} onPress={() => setProfileVisible(true)}>
              <Image source={require('@/assets/images/profile.png')} style={styles.topIcon} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} hitSlop={8} onPress={() => setHelpVisible(true)}>
              <Image source={require('@/assets/images/question.png')} style={styles.topIcon} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <View style={[styles.characterArea, charState === 'onFire' && { paddingLeft: 0 }]}>
        <View style={[styles.characterWrapper, charState === 'onFire' && styles.characterWrapperSmall]}>
          <Image
            source={accessorySource ?? CHARACTER_IMG[charState]}
            style={styles.characterImg}
            resizeMode="contain"
          />
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardRow}>
          <Text style={styles.cardTitle}>Monthly Budget</Text>
          <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
            <Text style={styles.statusText}>{status.label}</Text>
          </View>
        </View>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${progressPct * 100}%` as any }]} />
        </View>
        <Text style={styles.progressLabel}>{Math.round(progressPct * 100)}% of budget spent</Text>
        {(charState === 'struggling' || charState === 'onFire') && (
          <View style={styles.tipBox}>
            <Text style={styles.tipTitle}>💡 Recovery Tip</Text>
            <Text style={styles.tipText}>
              {charState === 'onFire'
                ? remaining < 0
                  ? "You're over budget. Cut back now or remove expenses to cool your buddy down."
                  : "Log your first expense today to start your streak and bring your buddy back to life!"
                : "You're close to your limit. Try cutting back on dining out or entertainment to stay on track."}
            </Text>
          </View>
        )}
        <View style={styles.amounts}>
          <View style={styles.amountSide}>
            <Text style={styles.amountLabel}>Spent</Text>
            <Text style={styles.amountValue}>${spent.toFixed(2)}</Text>
          </View>
          <View style={styles.amountDivider} />
          <View style={[styles.amountSide, styles.amountSideRight]}>
            <Text style={styles.amountLabel}>Remaining</Text>
            <Text style={[styles.amountValue, { color: remaining >= 0 ? Brand.gold : '#ef4444' }]}>
              {remaining < 0 ? '-' : ''}${Math.abs(remaining).toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Brand.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Brand.primaryDark,
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  fireIcon: { width: 16, height: 16 },
  streakNum: { fontSize: 15, fontWeight: '700', color: '#ffffff', letterSpacing: -0.2 },
  streakDayLabel: { fontSize: 12, fontWeight: '500', color: Brand.gold },
  topIcons: { flexDirection: 'row', gap: 2 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  topIcon: { width: 22, height: 22, tintColor: Brand.primaryDark },
  characterArea: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingLeft: 25, overflow: 'visible' },
  characterWrapper: { width: W * 1.2, height: W * 1.2 },
  characterWrapperSmall: { width: W * 1.35, height: W * 1.35, marginTop: 160 },
  characterImg: { width: '100%', height: '100%' },
  card: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.07,
    shadowRadius: 28,
    elevation: 8,
  },
  dragHandle: {
    width: 36,
    height: 4,
    backgroundColor: Brand.separator,
    borderRadius: 100,
    alignSelf: 'center',
    marginBottom: 16,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: '600', color: Brand.primaryDark },
  statusBadge: { borderRadius: 100, paddingHorizontal: 12, paddingVertical: 3 },
  statusText: { fontSize: 11, fontWeight: '600', color: '#ffffff', letterSpacing: 0.06 },
  progressBg: {
    backgroundColor: Brand.progressBg,
    height: 10,
    borderRadius: 100,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: { height: '100%', backgroundColor: Brand.sage, borderRadius: 100 },
  progressLabel: { fontSize: 10, color: Brand.sage, letterSpacing: 0.3, marginTop: 4, marginBottom: 12 },
  tipBox: {
    backgroundColor: '#fff7ed',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#fed7aa',
    padding: 12,
    gap: 4,
    marginBottom: 12,
  },
  tipTitle: { fontSize: 12, fontWeight: '700', color: '#c2410c' },
  tipText: { fontSize: 12, color: '#7c2d12', lineHeight: 17 },
  amounts: { flexDirection: 'row', alignItems: 'center' },
  amountSide: { flex: 1 },
  amountSideRight: { alignItems: 'flex-end' },
  amountLabel: { fontSize: 11, color: Brand.sage, letterSpacing: 0.06, marginBottom: 2 },
  amountValue: { fontSize: 20, fontWeight: '700', color: Brand.primaryDark, letterSpacing: -0.4 },
  amountDivider: { width: 1, height: 36, backgroundColor: Brand.progressBg },
});
