import React, { useRef, useState } from 'react';
import { View, StyleSheet, Image, useWindowDimensions, ScrollView, NativeSyntheticEvent, NativeScrollEvent, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppText, MainButton } from '@/components/ui';
import { Colors, Spacing, Radius } from '@/theme/theme';

const ONBOARDED_KEY = '@afrilove/onboarded';

// Faithful to onbording_provider.dart onBordingData.
const slides = [
  { title: 'Find Your Spark: Where Connections Ignite.', image: require('../assets/images/onborading3.png') },
  { title: 'Connecting Hearts, One Swipe at a Time', image: require('../assets/images/onborading1.png') },
  { title: 'Discover, Connect, Love: Your Journey Starts Here', image: require('../assets/images/onborading2.png') },
  { title: "It's a Match", image: require('../assets/images/onborading4.png') },
];

export default function Onboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  const finish = async () => {
    await AsyncStorage.setItem(ONBOARDED_KEY, '1');
    router.replace('/(auth)/login');
  };

  const next = () => {
    if (index >= slides.length - 1) finish();
    else scrollRef.current?.scrollTo({ x: (index + 1) * width, animated: true });
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <Pressable onPress={finish} style={[styles.skip, { top: insets.top + Spacing.sm }]}>
        <AppText variant="label" color={Colors.textSecondary}>Skip</AppText>
      </Pressable>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {slides.map((s, i) => (
          <View key={i} style={{ width, alignItems: 'center', paddingHorizontal: Spacing.screen }}>
            <Image source={s.image} style={{ width: width * 0.82, height: width * 0.92, borderRadius: Radius.xl, marginTop: Spacing.xl }} resizeMode="cover" />
            <AppText variant="h2" style={{ textAlign: 'center', marginTop: Spacing.xxl }}>
              {s.title}
            </AppText>
          </View>
        ))}
      </ScrollView>

      <View style={{ paddingHorizontal: Spacing.screen, paddingBottom: insets.bottom + Spacing.lg }}>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, { width: i === index ? 24 : 8, backgroundColor: i === index ? Colors.primary : Colors.border }]}
            />
          ))}
        </View>
        <MainButton title={index === slides.length - 1 ? "Let's Start" : 'Next'} onPress={next} radius={Radius.pill} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  skip: { position: 'absolute', right: Spacing.screen, zIndex: 10, padding: Spacing.xs },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: Spacing.lg },
  dot: { height: 8, borderRadius: 4 },
});
