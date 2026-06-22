import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated';

/** Pressable that springs down on touch for tactile feedback. */
export function PressableScale({
  children,
  onPress,
  style,
  disabled,
  to = 0.94,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  to?: number;
}) {
  const scale = useSharedValue(1);

  const tap = Gesture.Tap()
    .enabled(!disabled)
    .maxDuration(10000)
    .onBegin(() => {
      scale.value = withSpring(to, { mass: 0.4, damping: 12 });
    })
    .onEnd(() => {
      if (onPress) runOnJS(onPress)();
    })
    .onFinalize(() => {
      scale.value = withSpring(1, { mass: 0.4, damping: 12 });
    });

  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <GestureDetector gesture={tap}>
      <Animated.View style={[style, anim]}>{children}</Animated.View>
    </GestureDetector>
  );
}
