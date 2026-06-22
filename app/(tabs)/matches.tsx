import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppText } from '@/components/ui';
import { Skeleton } from '@/components/Skeleton';
import { PressableScale } from '@/components/PressableScale';
import { Colors, Spacing, Radius, Shadows } from '@/theme/theme';
import { useTheme } from '@/theme/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useProfileList } from '@/hooks/useProfileList';
import { demoChats } from '@/data/demo';
import { firebaseEnabled } from '@/firebase/config';
import { subscribeThreads, ChatThread } from '@/firebase/chat';

export default function Matches() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { c } = useTheme();
  const { user } = useAuth();
  const { cards, loading } = useProfileList('matches');
  const matchList = cards ?? [];

  const live = firebaseEnabled && !!user && !user.isDemo;
  const [threads, setThreads] = useState<ChatThread[] | null>(live ? null : []);

  useEffect(() => {
    if (!live) return;
    const unsub = subscribeThreads(user!.id, setThreads);
    return unsub;
  }, [live, user?.id]);

  const recent = live
    ? (threads ?? []).map((t) => ({ id: t.peerId, name: t.peerName, avatar: t.peerAvatar, last: t.lastMessage }))
    : demoChats.map((t) => ({ id: t.id, name: t.name, avatar: t.avatar, last: t.last }));

  return (
    <ScrollView style={[styles.root, { backgroundColor: c.background }]} contentContainerStyle={{ paddingTop: insets.top + Spacing.sm, paddingBottom: insets.bottom + 90 }}>
      <AppText variant="h2" style={{ paddingHorizontal: Spacing.screen }}>Matches</AppText>
      <AppText variant="bodyM" color={c.textSecondary} style={{ paddingHorizontal: Spacing.screen, marginTop: Spacing.xs }}>
        It's a match! Start the conversation.
      </AppText>

      {loading ? (
        <View style={styles.strip}>
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} style={{ width: 68, height: 68, borderRadius: Radius.pill }} />)}
        </View>
      ) : matchList.length === 0 ? (
        <View style={{ paddingHorizontal: Spacing.screen, paddingVertical: Spacing.xl, alignItems: 'center' }}>
          <Ionicons name="sparkles-outline" size={40} color={c.textMuted} />
          <AppText variant="bodyM" color={c.textSecondary} style={{ marginTop: Spacing.sm, textAlign: 'center' }}>
            No matches yet. Like people in Discover to start matching.
          </AppText>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.strip}>
          {matchList.map((p) => (
            <PressableScale key={p.id} onPress={() => router.push({ pathname: '/chat/[id]', params: { id: p.id, name: p.name, avatar: p.images[0] ?? '' } })} style={{ alignItems: 'center', width: 84 }}>
              <View style={[styles.ringWrap, Shadows.soft]}>
                <Image source={{ uri: p.images[0] }} style={styles.ring} contentFit="cover" />
              </View>
              <AppText variant="bodyS" numberOfLines={1} style={{ marginTop: 6 }}>{p.name}</AppText>
            </PressableScale>
          ))}
        </ScrollView>
      )}

      <AppText variant="h3" style={{ paddingHorizontal: Spacing.screen, marginTop: Spacing.lg, marginBottom: Spacing.sm }}>
        Recent chats
      </AppText>

      {live && threads === null ? (
        <View style={{ paddingHorizontal: Spacing.screen, gap: Spacing.md }}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={styles.skelRow}>
              <Skeleton style={{ width: 54, height: 54, borderRadius: Radius.pill }} />
              <View style={{ flex: 1, gap: 8 }}>
                <Skeleton style={{ width: '40%', height: 13, borderRadius: 6 }} />
                <Skeleton style={{ width: '70%', height: 11, borderRadius: 6 }} />
              </View>
            </View>
          ))}
        </View>
      ) : recent.length === 0 ? (
        <AppText variant="bodyM" color={c.textMuted} style={{ paddingHorizontal: Spacing.screen }}>
          No conversations yet.
        </AppText>
      ) : (
        recent.map((t, i) => (
          <Animated.View key={t.id + i} entering={FadeInDown.delay(i * 50).springify().damping(18)}>
            <PressableScale onPress={() => router.push({ pathname: '/chat/[id]', params: { id: t.id, name: t.name, avatar: t.avatar } })} style={styles.row} to={0.97}>
              {t.avatar ? (
                <Image source={{ uri: t.avatar }} style={styles.avatar} contentFit="cover" />
              ) : (
                <View style={[styles.avatar, styles.avatarFallback]}><Ionicons name="person" size={24} color={c.textMuted} /></View>
              )}
              <View style={{ flex: 1 }}>
                <AppText variant="bodyL">{t.name}</AppText>
                <AppText variant="bodyS" color={c.textSecondary} numberOfLines={1}>{t.last || 'Say hello 👋'}</AppText>
              </View>
              <Ionicons name="chevron-forward" size={18} color={c.textMuted} />
            </PressableScale>
          </Animated.View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  strip: { gap: Spacing.md, paddingHorizontal: Spacing.screen, paddingVertical: Spacing.lg, flexDirection: 'row' },
  ringWrap: { padding: 3, borderRadius: Radius.pill, borderWidth: 2, borderColor: Colors.secondary },
  ring: { width: 68, height: 68, borderRadius: Radius.pill },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingHorizontal: Spacing.screen, paddingVertical: Spacing.sm },
  skelRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatar: { width: 54, height: 54, borderRadius: Radius.pill },
  avatarFallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.06)' },
});
