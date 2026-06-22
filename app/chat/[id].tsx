import React, { useState, useRef } from 'react';
import { View, StyleSheet, FlatList, Pressable, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui';
import { Colors, Spacing, Radius, Type, Shadows } from '@/theme/theme';
import { useTheme } from '@/theme/ThemeContext';
import { demoChats, demoMessages, DemoMessage } from '@/data/demo';

// Port of chatting UI. Real-time delivery stays on Firebase in the full port;
// here it's local state so the conversation flow is testable on Expo Go.
export default function Chat() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { c } = useTheme();
  const thread = demoChats.find((t) => t.id === id) ?? demoChats[0];
  const [messages, setMessages] = useState<DemoMessage[]>(demoMessages);
  const [text, setText] = useState('');
  const listRef = useRef<FlatList>(null);

  const send = () => {
    if (!text.trim()) return;
    const m: DemoMessage = { id: Date.now().toString(), text: text.trim(), mine: true, time: 'now' };
    setMessages((prev) => [...prev, m]);
    setText('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
  };

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.xs, borderBottomColor: c.border, backgroundColor: c.card }]}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="chevron-back" size={26} color={c.textPrimary} />
        </Pressable>
        <Image source={{ uri: thread.avatar }} style={styles.avatar} contentFit="cover" />
        <View style={{ flex: 1 }}>
          <AppText variant="bodyL">{thread.name}</AppText>
          <AppText variant="caption" color={thread.online ? Colors.success : c.textMuted}>
            {thread.online ? 'Online' : 'Offline'}
          </AppText>
        </View>
        <Pressable hitSlop={10}><Ionicons name="call-outline" size={22} color={c.textSecondary} /></Pressable>
        <Pressable hitSlop={10} style={{ marginLeft: Spacing.md }}><Ionicons name="videocam-outline" size={24} color={c.textSecondary} /></Pressable>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={8}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: Spacing.screen, gap: Spacing.xs }}
          renderItem={({ item }) => (
            <View style={[styles.bubble, item.mine ? styles.mine : [styles.theirs, { backgroundColor: c.card, borderColor: c.border }]]}>
              <AppText variant="bodyM" color={item.mine ? Colors.white : c.textPrimary}>{item.text}</AppText>
              <AppText variant="caption" color={item.mine ? 'rgba(255,255,255,0.7)' : c.textMuted} style={{ marginTop: 2, alignSelf: 'flex-end' }}>
                {item.time}
              </AppText>
            </View>
          )}
        />
        <View style={[styles.inputBar, { paddingBottom: insets.bottom + Spacing.xs, backgroundColor: c.card, borderTopColor: c.border }]}>
          <TextInput
            placeholder="Say something.."
            placeholderTextColor={c.textMuted}
            value={text}
            onChangeText={setText}
            style={[styles.input, { backgroundColor: c.background, color: c.textPrimary, borderColor: c.border }]}
          />
          <Pressable onPress={send} style={[styles.sendBtn, Shadows.soft]}>
            <Ionicons name="send" size={18} color={Colors.white} />
          </Pressable>
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
