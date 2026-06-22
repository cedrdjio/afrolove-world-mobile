import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Logo from '@/components/Logo';
import SwipeCard, { SwipeDir } from '@/components/SwipeCard';
import { AppText } from '@/components/ui';
import { Colors, Spacing, Radius, Shadows } from '@/theme/theme';
import { useTheme } from '@/theme/ThemeContext';
import { demoProfiles } from '@/data/demo';

export default function Discover() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { c } = useTheme();
  const [index, setIndex] = useState(0);
  const profiles = demoProfiles;

  const onSwiped = useCallback((_dir: SwipeDir) => {
    // TODO: POST like_dislike.php with the swipe direction.
    setIndex((i) => i + 1);
  }, []);

  const swipeButton = (dir: SwipeDir) => setIndex((i) => i + 1);

  const remaining = profiles.slice(index, index + 2).reverse();

  return (
    <View style={[styles.root, { backgroundColor: c.background, paddingTop: insets.top + Spacing.xs }]}>
      <View style={styles.header}>
        <Logo size={34} />
        <AppText variant="h3">Discover</AppText>
        <Pressable onPress={() => router.push('/premium')} style={[styles.premiumPill, Shadows.soft]}>
          <Ionicons name="diamond" size={14} color={Colors.primary} />
          <AppText variant="bodyS" color={Colors.primary}>Gold</AppText>
        </Pressable>
      </View>

      <View style={styles.deck}>
        {index >= profiles.length ? (
          <View style={styles.empty}>
            <Ionicons name="sparkles-outline" size={48} color={c.textMuted} />
            <AppText variant="h3" style={{ marginTop: Spacing.md }}>You're all caught up</AppText>
            <AppText variant="bodyM" color={c.textSecondary} style={{ textAlign: 'center', marginTop: Spacing.xs }}>
              Check back soon for new people near you.
            </AppText>
            <Pressable onPress={() => setIndex(0)} style={[styles.reload, Shadows.soft]}>
              <AppText variant="button" color={Colors.white}>Start over</AppText>
            </Pressable>
          </View>
        ) : (
          remaining.map((p) => {
            const realIndex = profiles.indexOf(p);
            const isTop = realIndex === index;
            return (
              <SwipeCard
                key={p.id}
                profile={p}
                isTop={isTop}
                onSwiped={onSwiped}
              />
            );
          })
        )}
      </View>

      {index < profiles.length ? (
        <View style={[styles.actions, { paddingBottom: Spacing.md }]}>
          <ActionButton icon="close" color={Colors.error} size={64} onPress={() => swipeButton('left')} />
          <ActionButton icon="star" color={Colors.secondary} size={52} onPress={() => router.push('/premium')} />
          <ActionButton icon="heart" color={Colors.success} size={64} onPress={() => swipeButton('right')} />
        </View>
      ) : null}
    </View>
  );
}

function ActionButton({ icon, color, size, onPress }: { icon: any; color: string; size: number; onPress: () => void }) {
  const { c } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        { width: size, height: size, borderRadius: size / 2, backgroundColor: c.card, borderWidth: 1, borderColor: c.border },
        styles.actionBtn,
        Shadows.card,
      ]}
    >
      <Ionicons name={icon} size={size * 0.42} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.screen, paddingVertical: Spacing.sm },
  premiumPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.goldLight, paddingHorizontal: Spacing.sm, paddingVertical: 6, borderRadius: Radius.pill },
  deck: { flex: 1, margin: Spacing.screen, marginTop: Spacing.xs },
  actions: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: Spacing.xl },
  actionBtn: { alignItems: 'center', justifyContent: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl },
  reload: { marginTop: Spacing.lg, backgroundColor: Colors.primary, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm, borderRadius: Radius.pill },
});
