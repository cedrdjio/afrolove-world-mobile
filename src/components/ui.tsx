/**
 * Reusable UI primitives — port of lib/presentation/widgets/*.
 * MainButton, GoldButton, OutlineButton, TextFieldPro, AppText, Card, Chip.
 */
import React from 'react';
import {
  Text,
  TextProps,
  TextInput,
  TextInputProps,
  Pressable,
  View,
  ViewStyle,
  StyleSheet,
  ActivityIndicator,
  StyleProp,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Radius, Spacing, Shadows, Type, Gradients } from '@/theme/theme';
import { useTheme } from '@/theme/ThemeContext';

type TypeKey = keyof typeof Type;

export function AppText({
  variant = 'bodyM',
  color,
  style,
  children,
  ...rest
}: TextProps & { variant?: TypeKey; color?: string }) {
  const { c } = useTheme();
  return (
    <Text style={[Type[variant], { color: color ?? c.textPrimary }, style]} {...rest}>
      {children}
    </Text>
  );
}

export function MainButton({
  title,
  onPress,
  loading,
  disabled,
  radius = Radius.md,
  style,
}: {
  title: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.btn,
        { borderRadius: radius, backgroundColor: pressed ? Colors.primary800 : Colors.primary, opacity: disabled ? 0.5 : 1 },
        Shadows.soft,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={Colors.white} />
      ) : (
        <Text style={[Type.button, { color: Colors.white }]}>{title}</Text>
      )}
    </Pressable>
  );
}

export function GoldButton({
  title,
  onPress,
  radius = Radius.md,
  style,
}: {
  title: string;
  onPress?: () => void;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable onPress={onPress} style={[{ borderRadius: radius, overflow: 'hidden' }, Shadows.soft, style]}>
      <LinearGradient colors={Gradients.gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.btn}>
        <Text style={[Type.button, { color: Colors.primary }]}>{title}</Text>
      </LinearGradient>
    </Pressable>
  );
}

export function OutlineButton({
  title,
  onPress,
  radius = Radius.md,
  style,
}: {
  title: string;
  onPress?: () => void;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const { c } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        { borderRadius: radius, borderWidth: 1, borderColor: c.border, backgroundColor: pressed ? c.border : 'transparent' },
        style,
      ]}
    >
      <Text style={[Type.button, { color: c.textPrimary }]}>{title}</Text>
    </Pressable>
  );
}

export function TextFieldPro({
  label,
  style,
  ...rest
}: TextInputProps & { label?: string }) {
  const { c } = useTheme();
  const [focused, setFocused] = React.useState(false);
  return (
    <View style={{ gap: Spacing.xs }}>
      {label ? <Text style={[Type.label, { color: c.textSecondary }]}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={c.textMuted}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[
          {
            backgroundColor: c.card,
            borderRadius: Radius.md,
            borderWidth: 1,
            borderColor: focused ? Colors.secondary : c.border,
            paddingHorizontal: Spacing.md,
            paddingVertical: 14,
            color: c.textPrimary,
            ...Type.bodyM,
          },
          style,
        ]}
        {...rest}
      />
    </View>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: c.card,
          borderRadius: Radius.xl,
          borderWidth: 1,
          borderColor: c.border,
          padding: Spacing.md,
        },
        Shadows.soft,
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function Chip({ label, active }: { label: string; active?: boolean }) {
  const { c } = useTheme();
  return (
    <View
      style={{
        paddingHorizontal: Spacing.sm,
        paddingVertical: 6,
        borderRadius: Radius.pill,
        backgroundColor: active ? Colors.secondary : 'transparent',
        borderWidth: 1,
        borderColor: active ? Colors.secondary : c.border,
      }}
    >
      <Text style={[Type.bodyS, { color: active ? Colors.primary : c.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
});
