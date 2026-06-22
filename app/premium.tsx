import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AppText, GoldButton } from '@/components/ui';
import { Colors, Spacing, Radius, Gradients, Shadows } from '@/theme/theme';
import { useTheme } from '@/theme/ThemeContext';

// Port of other/premium/ — Gold subscription paywall.
const perks = [
  { icon: 'eye', label: 'See who likes you' },
  { icon: 'infinite', label: 'Unlimited swipes' },
  { icon: 'rocket', label: 'One free Boost a month' },
  { icon: 'star', label: '5 Super Likes a day' },
  { icon: 'location', label: 'Swipe around the world' },
  { icon: 'flash', label: 'Priority likes' },
];

const plans = [
  { id: '12', months: 12, price: '€9.99', per: '/mo', tag: 'Best value' },
  { id: '6', months: 6, price: '€13.99', per: '/mo', tag: 'Popular' },
  { id: '1', months: 1, price: '€19.99', per: '/mo', tag: '' },
];

export default function Premium() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { c } = useTheme();
  const [selected, setSelected] = useState('12');

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}>
        <LinearGradient colors={Gradients.gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.hero, { paddingTop: insets.top + Spacing.xl }]}>
          <Pressable onPress={() => router.back()} style={styles.close} hitSlop={10}>
            <Ionicons name="close" size={26} color={Colors.primary} />
          </Pressable>
          <Ionicons name="diamond" size={44} color={Colors.primary} />
          <AppText variant="h1" color={Colors.primary} style={{ marginTop: Spacing.sm }}>Afrilove Gold</AppText>
          <AppText variant="bodyM" color={Colors.primary800} style={{ textAlign: 'center', marginTop: Spacing.xs }}>
            Stand out, see who's into you, and match faster.
          </AppText>
        </LinearGradient>

        <View style={{ padding: Spacing.screen, gap: Spacing.sm }}>
          {perks.map((p) => (
            <View key={p.label} style={styles.perk}>
              <View style={styles.perkIcon}>
                <Ionicons name={p.icon as any} size={18} color={Colors.secondaryDeep} />
              </View>
              <AppText variant="bodyL">{p.label}</AppText>
            </View>
          ))}
        </View>

        <View style={{ paddingHorizontal: Spacing.screen, gap: Spacing.sm }}>
          {plans.map((pl) => {
            const active = selected === pl.id;
            return (
              <Pressable
                key={pl.id}
                onPress={() => setSelected(pl.id)}
                style={[
                  styles.plan,
                  { borderColor: active ? Colors.secondary : c.border, backgroundColor: c.card },
                  active && Shadows.soft,
                ]}
              >
                <View>
                  <AppText variant="bodyL">{pl.months} months</AppText>
                  {pl.tag ? <AppText variant="bodyS" color={Colors.secondaryDeep}>{pl.tag}</AppText> : null}
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                  <AppText variant="h3">{pl.price}</AppText>
                  <AppText variant="bodyS" color={c.textSecondary}>{pl.per}</AppText>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.sm, backgroundColor: c.background, borderTopColor: c.border }]}>
        <GoldButton title="Continue" onPress={() => router.back()} />
        <AppText variant="caption" color={c.textMuted} style={{ textAlign: 'center', marginTop: Spacing.xs }}>
          Recurring billing. Cancel anytime.
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  hero: { alignItems: 'center', paddingBottom: Spacing.xl, paddingHorizontal: Spacing.screen, borderBottomLeftRadius: Radius.xl, borderBottomRightRadius: Radius.xl },
  close: { position: 'absolute', right: Spacing.screen, top: Spacing.xl },
  perk: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  perkIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.goldLight, alignItems: 'center', justifyContent: 'center' },
  plan: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1.5, borderRadius: Radius.lg, padding: Spacing.md },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: Spacing.screen, paddingTop: Spacing.sm, borderTopWidth: 1 },
});
