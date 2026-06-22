import React from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Colors, Radius, Spacing, Type, Gradients, Shadows } from '@/theme/theme';
import type { Profile } from '@/data/demo';

const SWIPE_THRESHOLD = 120;

export type SwipeDir = 'left' | 'right';

export default function SwipeCard({
  profile,
  isTop,
  onSwiped,
}: {
  profile: Profile;
  isTop: boolean;
  onSwiped: (dir: SwipeDir) => void;
}) {
  const { width } = useWindowDimensions();
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);

  const fly = (dir: SwipeDir) => {
    tx.value = withSpring(dir === 'right' ? width * 1.4 : -width * 1.4, { damping: 18 });
    runOnJS(onSwiped)(dir);
  };

  const pan = Gesture.Pan()
    .enabled(isTop)
    .onChange((e) => {
      tx.value += e.changeX;
      ty.value += e.changeY;
    })
    .onEnd(() => {
      if (Math.abs(tx.value) > SWIPE_THRESHOLD) {
        const dir: SwipeDir = tx.value > 0 ? 'right' : 'left';
        tx.value = withSpring(dir === 'right' ? width * 1.4 : -width * 1.4, { damping: 18 });
        runOnJS(onSwiped)(dir);
      } else {
        tx.value = withSpring(0);
        ty.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { rotate: `${interpolate(tx.value, [-width, width], [-12, 12], Extrapolation.CLAMP)}deg` },
    ],
  }));

  const likeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(tx.value, [0, SWIPE_THRESHOLD], [0, 1], Extrapolation.CLAMP),
  }));
  const nopeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(tx.value, [-SWIPE_THRESHOLD, 0], [1, 0], Extrapolation.CLAMP),
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.card, Shadows.card, cardStyle]}>
        <Image source={{ uri: profile.images[0] }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
        <LinearGradient colors={Gradients.overlay} style={StyleSheet.absoluteFill} />

        <Animated.View style={[styles.stamp, styles.like, likeStyle]}>
          <Ionicons name="heart" size={22} color={Colors.success} />
          <Animated.Text style={[styles.stampText, { color: Colors.success }]}>LIKE</Animated.Text>
        </Animated.View>
        <Animated.View style={[styles.stamp, styles.nope, nopeStyle]}>
          <Ionicons name="close" size={22} color={Colors.error} />
          <Animated.Text style={[styles.stampText, { color: Colors.error }]}>NOPE</Animated.Text>
        </Animated.View>

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Animated.Text style={[Type.h2, { color: Colors.white }]}>
              {profile.name}, {profile.age}
            </Animated.Text>
            {profile.verified ? <Ionicons name="checkmark-circle" size={20} color={Colors.goldLight} /> : null}
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="location" size={14} color={Colors.goldLight} />
            <Animated.Text style={[Type.bodyS, { color: Colors.white }]}>
              {profile.city} · {profile.distance}
            </Animated.Text>
          </View>
          <Animated.Text numberOfLines={2} style={[Type.bodyM, { color: 'rgba(255,255,255,0.92)', marginTop: 6 }]}>
            {profile.bio}
          </Animated.Text>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    backgroundColor: Colors.primary,
  },
  info: { position: 'absolute', left: Spacing.lg, right: Spacing.lg, bottom: Spacing.xl },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  stamp: {
    position: 'absolute',
    top: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.md,
    borderWidth: 3,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  like: { right: Spacing.lg, borderColor: Colors.success },
  nope: { left: Spacing.lg, borderColor: Colors.error },
  stampText: { fontFamily: Type.button.fontFamily, fontSize: 18, letterSpacing: 1 },
});
