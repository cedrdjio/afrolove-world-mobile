import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import SwipeCard, { SwipeDir } from '@/components/SwipeCard';
import { AppText } from '@/components/ui';
import { Skeleton } from '@/components/Skeleton';
import { PressableScale } from '@/components/PressableScale';
import { Colors, Spacing, Radius, Shadows } from '@/theme/theme';
import { useTheme } from '@/theme/ThemeContext';
import { useHomeFeed } from '@/hooks/useHomeFeed';
import { useFilter } from '@/context/FilterContext';
import { useAuth } from '@/context/AuthContext';

export default function Discover() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { c } = useTheme();
  const { cards, status, like, reload } = useHomeFeed();
  const { active: filterActive } = useFilter();
  const { user } = useAuth();
  const [index, setIndex] = useState(0);

  const pendingVerify = user?.isVerify === '1';
  const showVerifyBanner = !!user && !user.isDemo && user.isVerify !== '2';

  useEffect(() => {
    setIndex(0);
  }, [cards]);

  const onSwiped = useCallback(
    (dir: SwipeDir) => {
      const card = cards[index];
      if (card) like(card.id, dir === 'right' ? 'like' : 'dislike');
      setIndex((i) => i + 1);
    },
    [cards, index, like]
  );

  const swipeButton = (dir: SwipeDir) => {
    const card = cards[index];
    if (card) like(card.id, dir === 'right' ? 'like' : 'dislike');
    setIndex((i) => i + 1);
  };

  const remaining = cards.slice(index, index + 2).reverse();

  return (
    <View style={[styles.root, { backgroundColor: c.background, paddingTop: insets.top + Spacing.xs }]}>
      <View style={styles.header}>
        <PressableScale onPress={() => router.push('/filter')} style={[styles.iconBtn, { borderColor: c.border, backgroundColor: c.card }]}>
          <Ionicons name="options-outline" size={20} color={c.textPrimary} />
          {filterActive ? <View style={styles.filterDot} /> : null}
        </PressableScale>
        <View style={{ alignItems: 'center' }}>
          <AppText variant="h3">Discover</AppText>
          {status === 'demo' ? <AppText variant="caption" color={c.textMuted}>demo mode</AppText> : filterActive ? <AppText variant="caption" color={Colors.secondaryDeep}>filtered</AppText> : null}
        </View>
        <PressableScale onPress={() => router.push('/premium')} style={[styles.premiumPill, Shadows.soft]}>
          <Ionicons name="diamond" size={14} color={Colors.primary} />
          <AppText variant="bodyS" color={Colors.primary}>Gold</AppText>
        </PressableScale>
      </View>

      {showVerifyBanner ? (
        <Animated.View entering={FadeInDown.springify().damping(18)} style={{ paddingHorizontal: Spacing.screen, paddingBottom: Spacing.xs }}>
          <PressableScale onPress={() => router.push('/profile/verify')} style={[styles.verifyBanner, { borderColor: c.border, backgroundColor: c.card }, Shadows.soft]} to={0.98}>
            <View style={styles.verifyIcon}>
              <Ionicons name={pendingVerify ? 'time' : 'shield-checkmark'} size={18} color={pendingVerify ? Colors.warning : Colors.secondaryDeep} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="label">{pendingVerify ? 'Verification under review' : 'Verify your account'}</AppText>
              <AppText variant="caption" color={c.textSecondary}>
                {pendingVerify ? "We'll let you know once it's approved." : 'Get a blue badge and build trust.'}
              </AppText>
            </View>
            {!pendingVerify ? <Ionicons name="chevron-forward" size={18} color={c.textMuted} /> : null}
          </PressableScale>
        </Animated.View>
      ) : null}

      <View style={styles.deck}>
        {status === 'loading' ? (
          <Skeleton style={{ flex: 1, borderRadius: Radius.xl }} />
        ) : index >= cards.length ? (
          <Animated.View entering={FadeIn} style={styles.empty}>
            <Ionicons name="sparkles-outline" size={48} color={c.textMuted} />
            <AppText variant="h3" style={{ marginTop: Spacing.md }}>You're all caught up</AppText>
            <AppText variant="bodyM" color={c.textSecondary} style={{ textAlign: 'center', marginTop: Spacing.xs }}>
              Check back soon for new people near you.
            </AppText>
            <PressableScale onPress={reload} style={[styles.reload, Shadows.soft]}>
              <AppText variant="button" color={Colors.white}>Refresh</AppText>
            </PressableScale>
          </Animated.View>
        ) : (
          remaining.map((p) => {
            const realIndex = cards.indexOf(p);
            const isTop = realIndex === index;
            return <SwipeCard key={p.id + realIndex} profile={p} isTop={isTop} onSwiped={onSwiped} />;
          })
        )}
      </View>

      {status !== 'loading' && index < cards.length ? (
        <Animated.View entering={FadeInDown.springify()} style={[styles.actions, { paddingBottom: Spacing.md }]}>
          <ActionButton icon="close" color={Colors.error} size={64} onPress={() => swipeButton('left')} />
          <ActionButton icon="star" color={Colors.secondary} size={52} onPress={() => router.push('/premium')} />
          <ActionButton icon="heart" color={Colors.success} size={64} onPress={() => swipeButton('right')} />
        </Animated.View>
      ) : null}
    </View>
  );
}

function ActionButton({ icon, color, size, onPress }: { icon: any; color: string; size: number; onPress: () => void }) {
  const { c } = useTheme();
  return (
    <PressableScale
      onPress={onPress}
      style={[
        { width: size, height: size, borderRadius: size / 2, backgroundColor: c.card, borderWidth: 1, borderColor: c.border },
        styles.actionBtn,
        Shadows.card,
      ]}
    >
      <Ionicons name={icon} size={size * 0.42} color={color} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.screen, paddingVertical: Spacing.sm },
  premiumPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.goldLight, paddingHorizontal: Spacing.sm, paddingVertical: 6, borderRadius: Radius.pill },
  iconBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  filterDot: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.secondary },
  verifyBanner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, borderWidth: 1, borderRadius: Radius.lg, padding: Spacing.sm },
  verifyIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.goldLight, alignItems: 'center', justifyContent: 'center' },
  deck: { flex: 1, margin: Spacing.screen, marginTop: Spacing.xs },
  actions: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: Spacing.xl },
  actionBtn: { alignItems: 'center', justifyContent: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl },
  reload: { marginTop: Spacing.lg, backgroundColor: Colors.primary, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm, borderRadius: Radius.pill },
});
