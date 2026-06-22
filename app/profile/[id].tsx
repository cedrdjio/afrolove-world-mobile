import React from 'react';
import { View, StyleSheet, ScrollView, Pressable, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AppText, Chip } from '@/components/ui';
import { Colors, Spacing, Radius, Gradients, Shadows } from '@/theme/theme';
import { useTheme } from '@/theme/ThemeContext';
import { demoProfiles } from '@/data/demo';

// Port of profileAbout/ — full profile detail.
export default function ProfileDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { c } = useTheme();
  const { height } = useWindowDimensions();
  const p = demoProfiles.find((x) => x.id === id) ?? demoProfiles[0];

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 96 }} showsVerticalScrollIndicator={false}>
        <View style={{ height: height * 0.6 }}>
          <Image source={{ uri: p.images[0] }} style={StyleSheet.absoluteFill} contentFit="cover" />
          <LinearGradient colors={Gradients.overlay} style={StyleSheet.absoluteFill} />
          <Pressable onPress={() => router.back()} style={[styles.back, { top: insets.top + Spacing.sm }]}>
            <Ionicons name="chevron-back" size={26} color={Colors.white} />
          </Pressable>
          <View style={styles.heroInfo}>
            <View style={styles.nameRow}>
              <AppText variant="h1" color={Colors.white}>{p.name}, {p.age}</AppText>
              {p.verified ? <Ionicons name="checkmark-circle" size={24} color={Colors.goldLight} /> : null}
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="location" size={16} color={Colors.goldLight} />
              <AppText variant="bodyM" color={Colors.white}>{p.city} · {p.distance} away</AppText>
            </View>
          </View>
        </View>

        <View style={{ padding: Spacing.screen, gap: Spacing.lg }}>
          <View>
            <AppText variant="overline" color={c.textMuted}>ABOUT</AppText>
            <AppText variant="bodyL" style={{ marginTop: Spacing.xs }}>{p.bio}</AppText>
          </View>
          <View>
            <AppText variant="overline" color={c.textMuted}>INTERESTS</AppText>
            <View style={styles.interests}>
              {p.interests.map((it) => <Chip key={it} label={it} active />)}
            </View>
          </View>
          {p.images[1] ? (
            <Image source={{ uri: p.images[1] }} style={styles.gallery} contentFit="cover" />
          ) : null}
        </View>
      </ScrollView>

      <View style={[styles.actions, { paddingBottom: insets.bottom + Spacing.sm }]}>
        <Pressable style={[styles.circle, { backgroundColor: c.card, borderColor: c.border }, Shadows.card]} onPress={() => router.back()}>
          <Ionicons name="close" size={28} color={Colors.error} />
        </Pressable>
        <Pressable style={[styles.circle, styles.bigHeart, Shadows.elevated]} onPress={() => router.replace('/(tabs)/matches')}>
          <Ionicons name="heart" size={32} color={Colors.white} />
        </Pressable>
        <Pressable style={[styles.circle, { backgroundColor: c.card, borderColor: c.border }, Shadows.card]} onPress={() => router.push('/chat/' + p.id)}>
          <Ionicons name="chatbubble" size={24} color={Colors.primary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  back: { position: 'absolute', left: Spacing.screen, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' },
  heroInfo: { position: 'absolute', left: Spacing.screen, right: Spacing.screen, bottom: Spacing.xl },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  interests: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginTop: Spacing.sm },
  gallery: { width: '100%', height: 260, borderRadius: Radius.xl },
  actions: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: Spacing.xl, paddingTop: Spacing.sm },
  circle: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  bigHeart: { width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.primary, borderWidth: 0 },
});
