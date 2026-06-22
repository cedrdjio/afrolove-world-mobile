import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AppText, Card } from '@/components/ui';
import { PressableScale } from '@/components/PressableScale';
import { Colors, Spacing, Radius, Gradients, Shadows } from '@/theme/theme';
import { useTheme } from '@/theme/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/api/client';

interface ReportItem { message: string; status: string; amt: string; date?: string }
interface Pkg { id: string; coin: string; amt: string }

export default function Wallet() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { c } = useTheme();
  const { user, refreshUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState('0');
  const [coin, setCoin] = useState('0');
  const [items, setItems] = useState<ReportItem[]>([]);
  const [packages, setPackages] = useState<Pkg[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [w, cn, pk] = await Promise.all([
        api.post<{ ok: boolean; wallet: string; items: ReportItem[] }>('wallet/report', {}),
        api.post<{ ok: boolean; coin: string; items: ReportItem[] }>('coin/report', {}),
        api.get<{ ok: boolean; packages: Pkg[] }>('packages'),
      ]);
      if (w.ok) { setWallet(w.wallet); setItems(w.items ?? []); }
      if (cn.ok) setCoin(cn.coin);
      if (pk.ok) setPackages(pk.packages ?? []);
    } catch {
      /* offline */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const buy = async (pkg: Pkg) => {
    setBusy(pkg.id);
    try {
      const res = await api.post<{ ok: boolean; coin: string }>('package/purchase', { package_id: pkg.id, from_wallet: true });
      if (res.ok) { setCoin(res.coin); await refreshUser(); await load(); }
    } finally {
      setBusy(null);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.background }} contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xl }}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <PressableScale onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color={c.textPrimary} />
        </PressableScale>
        <AppText variant="h3">Wallet & Coins</AppText>
        <View style={{ width: 26 }} />
      </View>

      <View style={styles.balances}>
        <LinearGradient colors={Gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.balanceCard, Shadows.card]}>
          <Ionicons name="wallet" size={22} color={Colors.goldLight} />
          <AppText variant="h2" color={Colors.white} style={{ marginTop: Spacing.xs }}>{wallet}</AppText>
          <AppText variant="bodyS" color="rgba(255,255,255,0.8)">Wallet</AppText>
        </LinearGradient>
        <LinearGradient colors={Gradients.gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.balanceCard, Shadows.card]}>
          <Ionicons name="diamond" size={22} color={Colors.primary} />
          <AppText variant="h2" color={Colors.primary} style={{ marginTop: Spacing.xs }}>{coin}</AppText>
          <AppText variant="bodyS" color={Colors.primary800}>Coins</AppText>
        </LinearGradient>
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: Spacing.xl }} />
      ) : (
        <>
          <AppText variant="h3" style={{ paddingHorizontal: Spacing.screen, marginTop: Spacing.lg, marginBottom: Spacing.sm }}>Buy coins</AppText>
          <View style={{ paddingHorizontal: Spacing.screen, gap: Spacing.sm }}>
            {packages.length === 0 ? (
              <AppText variant="bodyM" color={c.textSecondary}>No coin packages available.</AppText>
            ) : packages.map((p) => (
              <Card key={p.id} style={styles.pkgRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                  <Ionicons name="diamond" size={20} color={Colors.secondaryDeep} />
                  <AppText variant="bodyL">{p.coin} coins</AppText>
                </View>
                <PressableScale onPress={() => buy(p)} style={[styles.buyBtn, Shadows.soft]}>
                  <AppText variant="button" color={Colors.white}>{busy === p.id ? '…' : p.amt}</AppText>
                </PressableScale>
              </Card>
            ))}
          </View>

          <AppText variant="h3" style={{ paddingHorizontal: Spacing.screen, marginTop: Spacing.lg, marginBottom: Spacing.sm }}>History</AppText>
          <View style={{ paddingHorizontal: Spacing.screen, gap: Spacing.xs }}>
            {items.length === 0 ? (
              <AppText variant="bodyM" color={c.textSecondary}>No transactions yet.</AppText>
            ) : items.map((it, i) => (
              <View key={i} style={[styles.txn, { borderBottomColor: c.border }]}>
                <AppText variant="bodyM" style={{ flex: 1 }}>{it.message || it.status}</AppText>
                <AppText variant="bodyM" color={it.status === 'Credit' ? Colors.success : Colors.error}>
                  {it.status === 'Credit' ? '+' : '-'}{it.amt}
                </AppText>
              </View>
            ))}
          </View>
          {user?.isDemo ? (
            <AppText variant="bodyS" color={c.textMuted} style={{ paddingHorizontal: Spacing.screen, marginTop: Spacing.md }}>
              Demo session — sign in to use your real wallet.
            </AppText>
          ) : null}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.screen, paddingBottom: Spacing.sm },
  balances: { flexDirection: 'row', gap: Spacing.md, paddingHorizontal: Spacing.screen, marginTop: Spacing.sm },
  balanceCard: { flex: 1, borderRadius: Radius.xl, padding: Spacing.lg },
  pkgRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  buyBtn: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.xs, borderRadius: Radius.pill, minWidth: 64, alignItems: 'center' },
  txn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.sm, borderBottomWidth: 1 },
});
