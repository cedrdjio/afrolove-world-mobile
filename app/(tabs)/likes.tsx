import React from 'react';
import { View, StyleSheet, FlatList, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { AppText } from '@/components/ui';
import { Skeleton } from '@/components/Skeleton';
import { PressableScale } from '@/components/PressableScale';
import { Colors, Spacing, Radius, Gradients, Shadows } from '@/theme/theme';
import { useTheme } from '@/theme/ThemeContext';
import { useProfileList } from '@/hooks/useProfileList';

// People who liked you — first two visible, the rest gated behind Gold.
export default function Likes() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { c } = useTheme();
  const { width } = useWindowDimensions();
  const cardW = (width - Spacing.screen * 2 - Spacing.md) / 2;
  const { cards, loading } = useProfileList('likes');
  const list = cards ?? [];

  return (
    <View style={[styles.root, { backgroundColor: c.background, paddingTop: insets.top + Spacing.sm }]}>
      <View style={styles.header}>
        <AppText variant="h2">Likes</AppText>
        {!loading ? (
          <View style={styles.countPill}>
            <Ionicons name="heart" size={14} color={Colors.white} />
            <AppText variant="bodyS" color={Colors.white}>{list.length}</AppText>
          </View>
        ) : null}
      </View>
      <AppText variant="bodyM" color={c.textSecondary} style={{ paddingHorizontal: Spacing.screen, marginBottom: Spacing.md }}>
        People who already liked you. Upgrade to Gold to see them clearly.
      </AppText>

      {loading ? (
        <View style={styles.grid}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} style={{ width: cardW, height: cardW * 1.3, borderRadius: Radius.lg }} />
          ))}
        </View>
      ) : list.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="heart-outline" size={48} color={c.textMuted} />
          <AppText variant="h3" style={{ marginTop: Spacing.md }}>No likes yet</AppText>
          <AppText variant="bodyM" color={c.textSecondary} style={{ textAlign: 'center', marginTop: Spacing.xs }}>
            Keep swiping — when someone likes you, they'll show up here.
          </AppText>
        </View>
      ) : (
        <FlatList
          data={list}
          numColumns={2}
          keyExtractor={(p, i) => p.id + i}
          columnWrapperStyle={{ gap: Spacing.md, paddingHorizontal: Spacing.screen }}
          contentContainerStyle={{ gap: Spacing.md, paddingBottom: insets.bottom + 80 }}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeIn.delay(index * 60)}>
              <PressableScale
                onPress={() => router.push(index < 2 ? `/profile/${item.id}` : '/premium')}
                style={[{ width: cardW, height: cardW * 1.3, borderRadius: Radius.lg, overflow: 'hidden' }, Shadows.soft]}
                to={0.97}
              >
                <Image source={{ uri: item.images[0] }} style={StyleSheet.absoluteFill} contentFit="cover" blurRadius={index < 2 ? 0 : 18} />
                <LinearGradient colors={Gradients.overlay} style={StyleSheet.absoluteFill} />
                {index >= 2 ? (
                  <View style={styles.lock}><Ionicons name="lock-closed" size={26} color={Colors.white} /></View>
                ) : (
                  <View style={styles.cardInfo}><AppText variant="bodyL" color={Colors.white}>{item.name}, {item.age}</AppText></View>
                )}
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.screen, paddingTop: Spacing.xs, paddingBottom: Spacing.xs },
  countPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.error, paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: Radius.pill },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, paddingHorizontal: Spacing.screen },
  lock: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  cardInfo: { position: 'absolute', left: Spacing.sm, bottom: Spacing.sm },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl },
});
