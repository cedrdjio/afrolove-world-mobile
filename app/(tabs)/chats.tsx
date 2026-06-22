import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { PressableScale } from '@/components/PressableScale';
import { AppText, TextFieldPro } from '@/components/ui';
import { Skeleton } from '@/components/Skeleton';
import { Colors, Spacing, Radius } from '@/theme/theme';
import { useTheme } from '@/theme/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { demoChats } from '@/data/demo';
import { firebaseEnabled } from '@/firebase/config';
import { subscribeThreads, ChatThread } from '@/firebase/chat';

const rel = (ms: number) => {
  if (!ms) return '';
  const m = Math.floor((Date.now() - ms) / 60000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
};

interface Row {
  id: string;
  peerId: string;
  name: string;
  avatar: string;
  last: string;
  time: string;
  unread: boolean;
}

export default function Chats() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { c } = useTheme();
  const { user } = useAuth();
  const [q, setQ] = useState('');

  const live = firebaseEnabled && !!user && !user.isDemo;
  const [rows, setRows] = useState<Row[] | null>(null); // null = loading

  useEffect(() => {
    if (!live) {
      setRows(demoChats.map((t) => ({ id: t.id, peerId: t.id, name: t.name, avatar: t.avatar, last: t.last, time: t.time, unread: t.unread > 0 })));
      return;
    }
    setRows(null);
    const unsub = subscribeThreads(user!.id, (threads: ChatThread[]) => {
      setRows(
        threads.map((t) => ({
          id: t.id, peerId: t.peerId, name: t.peerName, avatar: t.peerAvatar,
          last: t.lastMessage, time: rel(t.lastAt), unread: t.unread,
        }))
      );
    });
    return unsub;
  }, [live, user?.id]);

  const filtered = (rows ?? []).filter((t) => t.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <View style={[styles.root, { backgroundColor: c.background, paddingTop: insets.top + Spacing.sm }]}>
      <AppText variant="h2" style={{ paddingHorizontal: Spacing.screen }}>Messages</AppText>
      <View style={{ paddingHorizontal: Spacing.screen, marginVertical: Spacing.md }}>
        <TextFieldPro placeholder="Search" value={q} onChangeText={setQ} />
      </View>

      {rows === null ? (
        <View style={{ paddingHorizontal: Spacing.screen, gap: Spacing.md, marginTop: Spacing.xs }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <View key={i} style={styles.skelRow}>
              <Skeleton style={{ width: 58, height: 58, borderRadius: Radius.pill }} />
              <View style={{ flex: 1, gap: 8 }}>
                <Skeleton style={{ width: '45%', height: 14, borderRadius: 6 }} />
                <Skeleton style={{ width: '75%', height: 12, borderRadius: 6 }} />
              </View>
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(t) => t.id}
          contentContainerStyle={{ paddingBottom: insets.bottom + 90, flexGrow: 1 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="chatbubbles-outline" size={48} color={c.textMuted} />
              <AppText variant="h3" style={{ marginTop: Spacing.md }}>No conversations yet</AppText>
              <AppText variant="bodyM" color={c.textSecondary} style={{ textAlign: 'center', marginTop: Spacing.xs }}>
                Match with someone and say hello — your chats appear here.
              </AppText>
            </View>
          }
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay(index * 50).springify().damping(18)}>
              <PressableScale
                onPress={() => router.push({ pathname: '/chat/[id]', params: { id: item.peerId, name: item.name, avatar: item.avatar } })}
                style={styles.row}
                to={0.97}
              >
                <View>
                  {item.avatar ? (
                    <Image source={{ uri: item.avatar }} style={styles.avatar} contentFit="cover" />
                  ) : (
                    <View style={[styles.avatar, styles.avatarFallback]}>
                      <Ionicons name="person" size={26} color={c.textMuted} />
                    </View>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.topLine}>
                    <AppText variant="bodyL">{item.name}</AppText>
                    <AppText variant="caption" color={c.textMuted}>{item.time}</AppText>
                  </View>
                  <View style={styles.topLine}>
                    <AppText variant="bodyS" color={item.unread ? c.textPrimary : c.textSecondary} numberOfLines={1} style={{ flex: 1 }}>
                      {item.last || 'Say hello 👋'}
                    </AppText>
                    {item.unread ? <View style={styles.dot} /> : null}
                  </View>
                </View>
              </PressableScale>
            </Animated.View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingHorizontal: Spacing.screen, paddingVertical: Spacing.sm },
  skelRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatar: { width: 58, height: 58, borderRadius: Radius.pill },
  avatarFallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.06)' },
  topLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.xs },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.secondary },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl, paddingTop: Spacing.xxxl * 2 },
});
