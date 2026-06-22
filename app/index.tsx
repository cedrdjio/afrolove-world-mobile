import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Logo from '@/components/Logo';
import { AppText } from '@/components/ui';
import { Colors, Spacing } from '@/theme/theme';
import { useAuth } from '@/context/AuthContext';

const ONBOARDED_KEY = '@afrilove/onboarded';

/** Splash → routes to onboarding / auth / tabs (port of splash_screen.dart). */
export default function Splash() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const scale = useRef(new Animated.Value(0.7)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 700, easing: Easing.out(Easing.back(1.6)), useNativeDriver: true }),
    ]).start();
  }, [opacity, scale]);

  useEffect(() => {
    if (loading) return;
    const t = setTimeout(async () => {
      const onboarded = await AsyncStorage.getItem(ONBOARDED_KEY);
      if (!onboarded) router.replace('/onboarding');
      else if (!user) router.replace('/(auth)/login');
      else router.replace('/(tabs)');
    }, 1400);
    return () => clearTimeout(t);
  }, [loading, user, router]);

  return (
    <View style={styles.root}>
      <Animated.View style={{ alignItems: 'center', opacity, transform: [{ scale }] }}>
        <Logo size={104} />
        <AppText variant="h1" style={{ marginTop: Spacing.lg }}>
          Afrilove
        </AppText>
        <AppText variant="overline" color={Colors.secondaryDeep} style={{ marginTop: Spacing.xs }}>
          INTERNATIONAL LOVE, ROOTED IN HERITAGE
        </AppText>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
});
