import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { PressableScale } from '@/components/PressableScale';
import { AppText, TextFieldPro } from '@/components/ui';
import { Colors, Spacing, Radius } from '@/theme/theme';
import { useTheme } from '@/theme/ThemeContext';
import { demoChats } from '@/data/demo';

// Port of chats.dart — conversation list (chat itself stays on Firebase in the
// full port; here backed by demo data so the flow is testable on Expo Go).
export default function Chats() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { c } = useTheme();
  const [q, setQ] = useState('');
  const data = demoChats.filter((t) => t.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <View style={[styles.root, { backgroundColor: c.background, paddingTop: insets.top + Spacing.sm }]}>
      <AppText variant="h2" style={{ paddingHorizontal: Spacing.screen }}>Messages</AppText>
      <View style={{ paddingHorizontal: Spacing.screen, marginVertical: Spacing.md }}>
        <TextFieldPro placeholder="Search" value={q} onChangeText={setQ} />
      </View>
      <FlatList
        data={data}
        keyExtractor={(t) => t.id}
        contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 60).springify().damping(18)}>
            <PressableScale onPress={() => router.push(`/chat/${item.id}`)} style={styles.row} to={0.97}>
              <View>
                <Image source={{ uri: item.avatar }} style={styles.avatar} contentFit="cover" />
                {item.online ? <View style={styles.online} /> : null}
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.topLine}>
                  <AppText variant="bodyL">{item.name}</AppText>
                  <AppText variant="caption" color={c.textMuted}>{item.time}</AppText>
                </View>
                <View style={styles.topLine}>
                  <AppText variant="bodyS" color={c.textSecondary} numberOfLines={1} style={{ flex: 1 }}>
                    {item.last}
                  </AppText>
                  {item.unread > 0 ? (
                    <View style={styles.badge}>
                      <AppText variant="caption" color={Colors.white}>{item.unread}</AppText>
                    </View>
                  ) : null}
                </View>
              </View>
            </PressableScale>
          </Animated.View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingHorizontal: Spacing.screen, paddingVertical: Spacing.sm },
  avatar: { width: 58, height: 58, borderRadius: Radius.pill },
  online: { position: 'absolute', right: 2, bottom: 2, width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.success, borderWidth: 2, borderColor: Colors.white },
  topLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.xs },
  badge: { minWidth: 20, height: 20, borderRadius: 10, backgroundColor: Colors.secondary, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
});
