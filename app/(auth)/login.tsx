import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Wordmark } from '@/components/Logo';
import { AppText, MainButton, TextFieldPro } from '@/components/ui';
import { PressableScale } from '@/components/PressableScale';
import { Colors, Spacing, Radius, Shadows, Gradients } from '@/theme/theme';
import { useAuth } from '@/context/AuthContext';

export default function Login() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login, loginDemo } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setLoading(true);
    setError(null);
    const res = await login(identifier.trim(), password);
    setLoading(false);
    if (res.ok) router.replace('/(tabs)');
    else setError(res.message ?? 'Login failed');
  };

  const onGuest = async () => {
    await loginDemo();
    router.replace('/(tabs)');
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Decorative brand hero */}
      <Animated.View entering={FadeIn.duration(500)}>
        <LinearGradient colors={Gradients.gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.hero, { paddingTop: insets.top + Spacing.xxl }]}>
          <View style={styles.heroBlob} />
          <Wordmark width={210} />
          <AppText variant="overline" color={Colors.primary800} style={{ marginTop: Spacing.sm }}>
            INTERNATIONAL LOVE, ROOTED IN HERITAGE
          </AppText>
        </LinearGradient>
      </Animated.View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.xl }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.delay(80).springify().damping(16)}>
            <AppText variant="h1">Welcome back</AppText>
            <AppText variant="bodyM" color={Colors.textSecondary} style={{ marginTop: Spacing.xs }}>
              Sign in to continue your story.
            </AppText>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(160).springify().damping(16)} style={[styles.card, Shadows.card]}>
            <TextFieldPro
              label="Email or Mobile"
              placeholder="you@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
              value={identifier}
              onChangeText={setIdentifier}
            />
            <View>
              <TextFieldPro label="Password" placeholder="••••••••" secureTextEntry={!show} value={password} onChangeText={setPassword} />
              <Pressable onPress={() => setShow((s) => !s)} style={styles.showBtn} hitSlop={8}>
                <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.textMuted} />
              </Pressable>
            </View>

            <Link href="/(auth)/forgot" asChild>
              <Pressable style={{ alignSelf: 'flex-end' }} hitSlop={8}>
                <AppText variant="bodyS" color={Colors.secondaryDeep}>Forgot password?</AppText>
              </Pressable>
            </Link>

            {error ? <AppText variant="bodyS" color={Colors.error}>{error}</AppText> : null}

            <MainButton title="Sign in" onPress={onSubmit} loading={loading} style={{ marginTop: Spacing.xs }} />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(240).springify().damping(16)}>
            <View style={styles.divider}>
              <View style={styles.line} />
              <AppText variant="caption" color={Colors.textMuted}>OR</AppText>
              <View style={styles.line} />
            </View>
            <PressableScale onPress={onGuest} style={[styles.guestBtn, { borderColor: Colors.border }]} to={0.97}>
              <Ionicons name="sparkles-outline" size={18} color={Colors.primary} />
              <AppText variant="button" color={Colors.primary}>Explore as guest</AppText>
            </PressableScale>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(320)} style={styles.footer}>
            <AppText variant="bodyM" color={Colors.textSecondary}>New to Afrilove? </AppText>
            <Link href="/(auth)/register" asChild>
              <Pressable hitSlop={8}>
                <AppText variant="bodyM" color={Colors.secondaryDeep}>Create account</AppText>
              </Pressable>
            </Link>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    paddingBottom: Spacing.xxl,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: 'hidden',
  },
  heroBlob: { position: 'absolute', top: -60, right: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.18)' },
  content: { paddingHorizontal: Spacing.screen, paddingTop: Spacing.xl, flexGrow: 1 },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },
  showBtn: { position: 'absolute', right: Spacing.md, top: 38 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginVertical: Spacing.lg },
  line: { flex: 1, height: 1, backgroundColor: Colors.border },
  guestBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xs, height: 52, borderRadius: Radius.md, borderWidth: 1 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 'auto', paddingTop: Spacing.xxl },
});
