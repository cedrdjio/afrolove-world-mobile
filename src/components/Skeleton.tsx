import React, { useEffect } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { useTheme } from '@/theme/ThemeContext';

/** Soft pulsing placeholder for loading states. */
export function Skeleton({ style }: { style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme();
  const o = useSharedValue(0.5);

  useEffect(() => {
    o.value = withRepeat(withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [o]);

  const anim = useAnimatedStyle(() => ({ opacity: o.value }));

  return <Animated.View style={[{ backgroundColor: c.border }, anim, style]} />;
}
