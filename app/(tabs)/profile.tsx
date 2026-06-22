import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText, Card, GoldButton } from '@/components/ui';
import { Colors, Spacing, Radius, Shadows } from '@/theme/theme';
import { useTheme } from '@/theme/ThemeContext';
import { useAuth } from '@/context/AuthContext';

export default function Profile() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { c, isDark, toggle } = useTheme();
  const { user, logout } = useAuth();

  const verified = user?.isVerify === '2';
  const pending = user?.isVerify === '1';

  const rows: { icon: any; label: string; onPress?: () => void; right?: React.ReactNode }[] = [
    { icon: 'create-outline', label: 'Edit profile', onPress: () => router.push('/profile/edit') },
    { icon: 'options-outline', label: 'Discovery preferences', onPress: () => router.push('/profile/edit') },
    {
      icon: 'shield-checkmark-outline',
      label: 'Verify your account',
      onPress: () => router.push('/profile/verify'),
      right: (
        <AppText variant="bodyS" color={verified ? Colors.success : pending ? Colors.warning : c.textMuted}>
          {verified ? 'Verified' : pending ? 'Pending' : 'Verify'}
        </AppText>
      ),
    },
    { icon: 'wallet-outline', label: 'Wallet & coins', onPress: () => router.push('/wallet') },
    { icon: 'gift-outline', label: 'Gifts', onPress: () => router.push('/wallet') },
    { icon: 'notifications-outline', label: 'Notifications' },
    {
      icon: 'moon-outline',
      label: 'Dark mode',
      onPress: toggle,
      right: (
        <View style={[styles.switch, { backgroundColor: isDark ? Colors.secondary : c.border }]}>
          <View style={[styles.knob, { alignSelf: isDark ? 'flex-end' : 'flex-start' }]} />
        </View>
      ),
    },
    { icon: 'help-circle-outline', label: 'Help & FAQ' },
    { icon: 'document-text-outline', label: 'Terms & Privacy' },
  ];

  return (
    <ScrollView style={[styles.root, { backgroundColor: c.background }]} contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}>
      <View style={{ paddingTop: insets.top + Spacing.md, alignItems: 'center', paddingHorizontal: Spacing.screen }}>
        <View style={[styles.avatarWrap, Shadows.card]}>
          <Image source={require('../../assets/images/img1.jpg')} style={styles.avatar} contentFit="cover" />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: Spacing.md }}>
          <AppText variant="h2">{user?.name ?? 'Guest'}</AppText>
          {verified ? <Ionicons name="checkmark-circle" size={22} color={Colors.secondary} /> : null}
        </View>
        <AppText variant="bodyM" color={c.textSecondary}>{user?.email ?? user?.mobile ?? 'Welcome to Afrilove'}</AppText>
      </View>

      <Card style={{ marginHorizontal: Spacing.screen, marginTop: Spacing.lg }}>
        <View style={styles.premiumHead}>
          <Ionicons name="diamond" size={20} color={Colors.secondaryDeep} />
          <AppText variant="h3">Afrilove Gold</AppText>
        </View>
        <AppText variant="bodyM" color={c.textSecondary} style={{ marginVertical: Spacing.sm }}>
          See who likes you, unlimited swipes, boosts and more.
        </AppText>
        <GoldButton title="Upgrade to Gold" onPress={() => router.push('/premium')} />
      </Card>

      <View style={{ marginTop: Spacing.lg }}>
        {rows.map((r) => (
          <Pressable key={r.label} onPress={r.onPress} style={styles.settingRow}>
            <Ionicons name={r.icon} size={22} color={c.textSecondary} />
            <AppText variant="bodyL" style={{ flex: 1 }}>{r.label}</AppText>
            {r.right ?? <Ionicons name="chevron-forward" size={18} color={c.textMuted} />}
          </Pressable>
        ))}
      </View>

      <Pressable onPress={() => { logout(); router.replace('/(auth)/login'); }} style={[styles.settingRow, { marginTop: Spacing.sm }]}>
        <Ionicons name="log-out-outline" size={22} color={Colors.error} />
        <AppText variant="bodyL" color={Colors.error}>Log out</AppText>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  avatarWrap: { padding: 4, borderRadius: Radius.pill, borderWidth: 2, borderColor: Colors.secondary },
  avatar: { width: 104, height: 104, borderRadius: Radius.pill },
  premiumHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingHorizontal: Spacing.screen, paddingVertical: 14 },
  switch: { width: 44, height: 26, borderRadius: 13, padding: 3, justifyContent: 'center' },
  knob: { width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.white },
});
