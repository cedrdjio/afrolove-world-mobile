import React from 'react';
import { View, StyleSheet, FlatList, Pressable, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui';
import { Colors, Spacing, Radius, Gradients, Shadows } from '@/theme/theme';
import { useTheme } from '@/theme/ThemeContext';
import { demoProfiles } from '@/data/demo';

// Port of likes.dart — grid of people who liked you (gated behind Gold).
export default function Likes() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { c } = useTheme();
  const { width } = useWindowDimensions();
  const cardW = (width - Spacing.screen * 2 - Spacing.md) / 2;

  return (
    <View style={[styles.root, { backgroundColor: c.background, paddingTop: insets.top + Spacing.sm }]}>
      <View style={styles.header}>
        <AppText variant="h2">Likes</AppText>
        <View style={styles.countPill}>
          <Ionicons name="heart" size={14} color={Colors.white} />
          <AppText variant="bodyS" color={Colors.white}>{demoProfiles.length}</AppText>
        </View>
      </View>
      <AppText variant="bodyM" color={c.textSecondary} style={{ paddingHorizontal: Spacing.screen, marginBottom: Spacing.md }}>
        People who already liked you. Upgrade to Gold to see them clearly.
      </AppText>

      <FlatList
        data={demoProfiles}
        numColumns={2}
        keyExtractor={(p) => p.id}
        columnWrapperStyle={{ gap: Spacing.md, paddingHorizontal: Spacing.screen }}
        contentContainerStyle={{ gap: Spacing.md, paddingBottom: insets.bottom + 80 }}
        renderItem={({ item, index }) => (
          <Pressable
            onPress={() => router.push(index < 2 ? `/profile/${item.id}` : '/premium')}
            style={[{ width: cardW, height: cardW * 1.3, borderRadius: Radius.lg, overflow: 'hidden' }, Shadows.soft]}
          >
            <Image
              source={{ uri: item.images[0] }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              blurRadius={index < 2 ? 0 : 18}
            />
            <LinearGradient colors={Gradients.overlay} style={StyleSheet.absoluteFill} />
            {index >= 2 ? (
              <View style={styles.lock}>
                <Ionicons name="lock-closed" size={26} color={Colors.white} />
              </View>
            ) : (
              <View style={styles.cardInfo}>
                <AppText variant="bodyL" color={Colors.white}>{item.name}, {item.age}</AppText>
              </View>
            )}
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.screen, paddingTop: Spacing.xs, paddingBottom: Spacing.xs },
  countPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.error, paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: Radius.pill },
  lock: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  cardInfo: { position: 'absolute', left: Spacing.sm, bottom: Spacing.sm },
});
