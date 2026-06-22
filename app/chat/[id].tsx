import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
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
import { roomId, subscribeMessages, sendMessage, ChatMessage } from '@/firebase/chat';

export default function Chat() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { c } = useTheme();
  const { user } = useAuth();
  const thread = demoChats.find((t) => t.id === id) ?? demoChats[0];

  const live = firebaseEnabled && !!user && !user.isDemo;
  const rid = live ? roomId(user!.id, String(id)) : '';

  const [messages, setMessages] = useState<ChatMessage[]>(
    live ? [] : demoMessages.map((m) => ({ id: m.id, text: m.text, senderId: m.mine ? 'me' : 'them', createdAt: 0 }))
  );
  const [text, setText] = useState('');
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!live) return;
    const unsub = subscribeMessages(rid, (msgs) => {
      setMessages(msgs);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 60);
    });
    return unsub;
  }, [live, rid]);

  const meId = live ? user!.id : 'me';

  const send = useCallback(async () => {
    const body = text.trim();
    if (!body) return;
    setText('');
    if (live) {
      await sendMessage(rid, user!.id, String(id), body);
    } else {
      setMessages((prev) => [...prev, { id: Date.now().toString(), text: body, senderId: 'me', createdAt: Date.now() }]);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
    }
  }, [text, live, rid, user, id]);

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.xs, borderBottomColor: c.border, backgroundColor: c.card }]}>
        <PressableScale onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color={c.textPrimary} />
        </PressableScale>
        <Image source={{ uri: thread.avatar }} style={styles.avatar} contentFit="cover" />
        <View style={{ flex: 1 }}>
          <AppText variant="bodyL">{thread.name}</AppText>
          <AppText variant="caption" color={thread.online ? Colors.success : c.textMuted}>
            {thread.online ? 'Online' : 'Offline'}
          </AppText>
        </View>
        <Ionicons name="call-outline" size={22} color={c.textSecondary} />
        <Ionicons name="videocam-outline" size={24} color={c.textSecondary} style={{ marginLeft: Spacing.md }} />
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
              <AppText variant="bodyS" color={c.textMuted}>Send a message to break the ice.</AppText>
            </View>
          }
          renderItem={({ item }) => {
            const mine = item.senderId === meId;
            return (
              <Animated.View
                entering={FadeInDown.springify().damping(18)}
                layout={LinearTransition.springify()}
                style={[styles.bubble, mine ? styles.mine : [styles.theirs, { backgroundColor: c.card, borderColor: c.border }]]}
              >
                <AppText variant="bodyM" color={mine ? Colors.white : c.textPrimary}>{item.text}</AppText>
              </Animated.View>
            );
          }}
        />
        <View style={[styles.inputBar, { paddingBottom: insets.bottom + Spacing.xs, backgroundColor: c.card, borderTopColor: c.border }]}>
          <TextInput
            placeholder="Say something.."
            placeholderTextColor={c.textMuted}
            value={text}
            onChangeText={setText}
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
  bubble: { maxWidth: '78%', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.lg },
  mine: { backgroundColor: Colors.primary, alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  theirs: { alignSelf: 'flex-start', borderWidth: 1, borderBottomLeftRadius: 4 },
  inputBar: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, borderTopWidth: 1 },
  input: { flex: 1, borderRadius: Radius.pill, borderWidth: 1, paddingHorizontal: Spacing.md, paddingVertical: 12, ...Type.bodyM },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
});
