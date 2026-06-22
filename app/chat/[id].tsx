import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform, TextInput, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';
import { AppText } from '@/components/ui';
import { PressableScale } from '@/components/PressableScale';
import { Colors, Spacing, Radius, Type, Shadows } from '@/theme/theme';
import { useTheme } from '@/theme/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { demoChats, demoMessages } from '@/data/demo';
import { firebaseEnabled } from '@/firebase/config';
import { roomId, subscribeMessages, subscribeRoom, sendMessage, setTyping, markRead, ensureRoom, ChatMessage, RoomMeta } from '@/firebase/chat';
import { subscribePresence } from '@/firebase/presence';
import { uploadImage } from '@/api/services';
import { pickImages, appendPhotos } from '@/lib/images';

const fmtTime = (ms: number) =>
  ms ? new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
const lastSeenLabel = (ms: number) => {
  if (!ms) return 'Offline';
  const mins = Math.floor((Date.now() - ms) / 60000);
  if (mins < 1) return 'Last seen just now';
  if (mins < 60) return `Last seen ${mins}m ago`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `Last seen ${h}h ago`;
  return 'Offline';
};

export default function Chat() {
  const params = useLocalSearchParams<{ id: string; name?: string; avatar?: string }>();
  const id = String(params.id);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { c } = useTheme();
  const { user } = useAuth();

  const demoThread = demoChats.find((t) => t.id === id) ?? demoChats[0];
  const peerName = params.name || demoThread.name;
  const peerAvatar = params.avatar || demoThread.avatar;

  const live = firebaseEnabled && !!user && !user.isDemo;
  const rid = live ? roomId(user!.id, id) : '';
  const meId = live ? user!.id : 'me';

  const [messages, setMessages] = useState<ChatMessage[]>(
    live ? [] : demoMessages.map((m) => ({ id: m.id, text: m.text, senderId: m.mine ? 'me' : 'them', createdAt: 0 }))
  );
  const [room, setRoom] = useState<RoomMeta | null>(null);
  const [presence, setPresence] = useState<{ online: boolean; lastSeen: number }>({ online: demoThread.online, lastSeen: 0 });
  const [text, setText] = useState('');
  const [uploading, setUploading] = useState(false);
  const listRef = useRef<FlatList>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Realtime subscriptions
  useEffect(() => {
    if (!live) return;
    ensureRoom(
      rid,
      { id: user!.id, name: user!.name ?? 'Me', avatar: user!.profilePic ?? '' },
      { id, name: peerName, avatar: peerAvatar }
    );
    const unsubMsg = subscribeMessages(rid, (msgs) => {
      setMessages(msgs);
      markRead(rid, meId);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 60);
    });
    const unsubRoom = subscribeRoom(rid, setRoom);
    const unsubPres = subscribePresence(id, setPresence);
    return () => { unsubMsg(); unsubRoom(); unsubPres(); };
  }, [live, rid, id, meId]);

  const onChangeText = (v: string) => {
    setText(v);
    if (!live) return;
    setTyping(rid, meId, true);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => setTyping(rid, meId, false), 1800);
  };

  const send = useCallback(async () => {
    const body = text.trim();
    if (!body) return;
    setText('');
    if (live) {
      await sendMessage(rid, user!.id, id, { text: body });
    } else {
      setMessages((prev) => [...prev, { id: Date.now().toString(), text: body, senderId: 'me', createdAt: Date.now() }]);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
    }
  }, [text, live, rid, user, id]);

  const sendPhoto = useCallback(async () => {
    const picked = await pickImages(1);
    if (!picked.length) return;
    if (!live) {
      setMessages((prev) => [...prev, { id: Date.now().toString(), text: '', imageUrl: picked[0].uri, senderId: 'me', createdAt: Date.now() }]);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      appendPhotos(form, picked);
      const res = await uploadImage(form);
      if (res.ok && res.url) await sendMessage(rid, user!.id, id, { imageUrl: res.url });
    } finally {
      setUploading(false);
    }
  }, [live, rid, user, id]);

  const peerTyping = !!room?.typing?.[id];
  const peerReadAt = room?.read?.[id] ?? 0;
  const lastMine = [...messages].reverse().find((m) => m.senderId === meId);

  const subtitle = peerTyping ? 'typing…' : presence.online ? 'Online' : live ? lastSeenLabel(presence.lastSeen) : demoThread.online ? 'Online' : 'Offline';

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.xs, borderBottomColor: c.border, backgroundColor: c.card }]}>
        <PressableScale onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color={c.textPrimary} />
        </PressableScale>
        <View>
          <Image source={{ uri: peerAvatar }} style={styles.avatar} contentFit="cover" />
          {presence.online ? <View style={styles.onlineDot} /> : null}
        </View>
        <View style={{ flex: 1 }}>
          <AppText variant="bodyL">{peerName}</AppText>
          <AppText variant="caption" color={peerTyping || presence.online ? Colors.success : c.textMuted}>
            {subtitle}
          </AppText>
        </View>
        <Ionicons name="ellipsis-horizontal" size={22} color={c.textSecondary} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={8}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: Spacing.screen, gap: Spacing.xs }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: Spacing.xxxl }}>
              <AppText variant="bodyM" color={c.textMuted}>No messages here yet…</AppText>
              <AppText variant="bodyS" color={c.textMuted}>Say hello to {peerName} 👋</AppText>
            </View>
          }
          renderItem={({ item }) => {
            const mine = item.senderId === meId;
            const seen = mine && item.id === lastMine?.id && peerReadAt >= item.createdAt && item.createdAt > 0;
            return (
              <Animated.View
                entering={FadeInDown.springify().damping(18)}
                layout={LinearTransition.springify()}
                style={[styles.bubble, mine ? styles.mine : [styles.theirs, { backgroundColor: c.card, borderColor: c.border }]]}
              >
                {item.imageUrl ? (
                  <Image source={{ uri: item.imageUrl }} style={styles.msgImage} contentFit="cover" transition={150} />
                ) : null}
                {item.text ? (
                  <AppText variant="bodyM" color={mine ? Colors.white : c.textPrimary}>{item.text}</AppText>
                ) : null}
                <View style={styles.meta}>
                  <AppText variant="caption" color={mine ? 'rgba(255,255,255,0.65)' : c.textMuted}>
                    {fmtTime(item.createdAt)}
                  </AppText>
                  {mine && item.id === lastMine?.id ? (
                    <Ionicons name={seen ? 'checkmark-done' : 'checkmark'} size={14} color={seen ? Colors.goldLight : 'rgba(255,255,255,0.65)'} />
                  ) : null}
                </View>
              </Animated.View>
            );
          }}
        />
        <View style={[styles.inputBar, { paddingBottom: insets.bottom + Spacing.xs, backgroundColor: c.card, borderTopColor: c.border }]}>
          <PressableScale onPress={sendPhoto} style={styles.attachBtn}>
            <Ionicons name={uploading ? 'hourglass-outline' : 'image-outline'} size={22} color={Colors.secondaryDeep} />
          </PressableScale>
          <TextInput
            placeholder="Say something.."
            placeholderTextColor={c.textMuted}
            value={text}
            onChangeText={onChangeText}
            onSubmitEditing={send}
            returnKeyType="send"
            style={[styles.input, { backgroundColor: c.background, color: c.textPrimary, borderColor: c.border }]}
          />
          <PressableScale onPress={send} style={[styles.sendBtn, Shadows.soft]}>
            <Ionicons name="send" size={18} color={Colors.white} />
          </PressableScale>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm, borderBottomWidth: 1 },
  avatar: { width: 40, height: 40, borderRadius: Radius.pill },
  onlineDot: { position: 'absolute', right: 0, bottom: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.success, borderWidth: 2, borderColor: Colors.white },
  bubble: { maxWidth: '78%', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.lg },
  mine: { backgroundColor: Colors.primary, alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  theirs: { alignSelf: 'flex-start', borderWidth: 1, borderBottomLeftRadius: 4 },
  msgImage: { width: 200, height: 240, borderRadius: Radius.md, marginBottom: 4 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-end', marginTop: 2 },
  inputBar: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, borderTopWidth: 1 },
  attachBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, borderRadius: Radius.pill, borderWidth: 1, paddingHorizontal: Spacing.md, paddingVertical: 12, ...Type.bodyM },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
});
