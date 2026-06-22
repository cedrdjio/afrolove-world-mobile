import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui';
import { Colors, Spacing, Radius, Shadows } from '@/theme/theme';
import { useTheme } from '@/theme/ThemeContext';
import { demoProfiles, demoChats } from '@/data/demo';

// Port of match/ — new matches strip + your matches.
export default function Matches() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { c } = useTheme();

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: c.background }]}
      contentContainerStyle={{ paddingTop: insets.top + Spacing.sm, paddingBottom: insets.bottom + 90 }}
    >
      <AppText variant="h2" style={{ paddingHorizontal: Spacing.screen }}>Matches</AppText>
      <AppText variant="bodyM" color={c.textSecondary} style={{ paddingHorizontal: Spacing.screen, marginTop: Spacing.xs }}>
        It's a match! Start the conversation.
      </AppText>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.strip}>
        {demoProfiles.map((p) => (
          <Pressable key={p.id} onPress={() => router.push(`/profile/${p.id}`)} style={{ alignItems: 'center', width: 84 }}>
            <View style={[styles.ringWrap, Shadows.soft]}>
              <Image source={{ uri: p.images[0] }} style={styles.ring} contentFit="cover" />
              {p.verified ? <View style={styles.dot} /> : null}
            </View>
            <AppText variant="bodyS" numberOfLines={1} style={{ marginTop: 6 }}>{p.name}</AppText>
          </Pressable>
        ))}
      </ScrollView>

      <AppText variant="h3" style={{ paddingHorizontal: Spacing.screen, marginTop: Spacing.lg, marginBottom: Spacing.sm }}>
        Recent chats
      </AppText>
      {demoChats.map((t) => (
        <Pressable key={t.id} onPress={() => router.push(`/chat/${t.id}`)} style={styles.row}>
          <Image source={{ uri: t.avatar }} style={styles.avatar} contentFit="cover" />
          <View style={{ flex: 1 }}>
            <AppText variant="bodyL">{t.name}</AppText>
            <AppText variant="bodyS" color={c.textSecondary} numberOfLines={1}>{t.last}</AppText>
          </View>
          <Ionicons name="chevron-forward" size={18} color={c.textMuted} />
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  strip: { gap: Spacing.md, paddingHorizontal: Spacing.screen, paddingVertical: Spacing.lg },
  ringWrap: { padding: 3, borderRadius: Radius.pill, borderWidth: 2, borderColor: Colors.secondary },
  ring: { width: 68, height: 68, borderRadius: Radius.pill },
  dot: { position: 'absolute', right: 4, bottom: 4, width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.success, borderWidth: 2, borderColor: Colors.white },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingHorizontal: Spacing.screen, paddingVertical: Spacing.sm },
  avatar: { width: 54, height: 54, borderRadius: Radius.pill },
});
