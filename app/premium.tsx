import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AppText, GoldButton } from '@/components/ui';
import { Colors, Spacing, Radius, Gradients, Shadows } from '@/theme/theme';
import { useTheme } from '@/theme/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { getPlans, purchasePlan } from '@/api/services';

const perks = [
  { icon: 'eye', label: 'See who likes you' },
  { icon: 'infinite', label: 'Unlimited swipes' },
  { icon: 'rocket', label: 'One free Boost a month' },
  { icon: 'star', label: '5 Super Likes a day' },
  { icon: 'location', label: 'Swipe around the world' },
  { icon: 'flash', label: 'Priority likes' },
];

interface Plan { id: string; title: string; amt: string; description: string; day_limit: string }

export default function Premium() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { c } = useTheme();
  const { user, refreshUser } = useAuth();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await getPlans();
        if (res.ok && Array.isArray((res as any).plans)) {
          const list = (res as any).plans as Plan[];
          setPlans(list);
          if (list.length) setSelected(list[0].id);
        }
      } catch {
        /* offline */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onContinue = async () => {
    if (!selected) return;
    setPurchasing(true);
    try {
      // Real PSP capture (Stripe/PayPal) requires a dev build; here we record the
      // purchase against the gateway with a generated reference.
      const res = await purchasePlan(selected, 'wallet', `mob_${Date.now()}`);
      if (res.ok) {
        setDone(true);
        await refreshUser();
        setTimeout(() => router.back(), 1100);
      }
    } finally {
      setPurchasing(false);
    }
  };

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
          {loading ? (
            <ActivityIndicator color={Colors.primary} />
          ) : plans.length === 0 ? (
            <AppText variant="bodyM" color={c.textSecondary}>No plans available right now.</AppText>
          ) : (
            plans.map((pl) => {
              const active = selected === pl.id;
              return (
                <Pressable
                  key={pl.id}
                  onPress={() => setSelected(pl.id)}
                  style={[styles.plan, { borderColor: active ? Colors.secondary : c.border, backgroundColor: c.card }, active && Shadows.soft]}
                >
                  <View style={{ flex: 1 }}>
                    <AppText variant="bodyL">{pl.title}</AppText>
                    {pl.description ? <AppText variant="bodyS" color={c.textSecondary}>{pl.description}</AppText> : null}
                    <AppText variant="bodyS" color={Colors.secondaryDeep}>{pl.day_limit} days</AppText>
                  </View>
                  <AppText variant="h3">{pl.amt}</AppText>
                </Pressable>
              );
            })
          )}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.sm, backgroundColor: c.background, borderTopColor: c.border }]}>
        <GoldButton title={done ? '✓ Subscribed' : purchasing ? 'Processing…' : 'Continue'} onPress={onContinue} />
        <AppText variant="caption" color={c.textMuted} style={{ textAlign: 'center', marginTop: Spacing.xs }}>
          {user?.isDemo ? 'Demo session — sign in to subscribe.' : 'Recurring billing. Cancel anytime.'}
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
