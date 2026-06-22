import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Logo from '@/components/Logo';
import { AppText, MainButton, OutlineButton, TextFieldPro } from '@/components/ui';
import { Colors, Spacing } from '@/theme/theme';
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
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: Colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing.xl }]} keyboardShouldPersistTaps="handled">
        <Logo size={64} />
        <AppText variant="h1" style={{ marginTop: Spacing.lg }}>Sign in</AppText>
        <AppText variant="bodyM" color={Colors.textSecondary} style={{ marginTop: Spacing.xs }}>
          Welcome back! Please enter your details.
        </AppText>

        <View style={{ marginTop: Spacing.xxl, gap: Spacing.md }}>
          <TextFieldPro
            label="Email or Mobile"
            placeholder="you@example.com / +234..."
            autoCapitalize="none"
            keyboardType="email-address"
            value={identifier}
            onChangeText={setIdentifier}
          />
          <View>
            <TextFieldPro
              label="Password"
              placeholder="••••••••"
              secureTextEntry={!show}
              value={password}
              onChangeText={setPassword}
            />
            <Pressable onPress={() => setShow((s) => !s)} style={styles.showBtn}>
              <AppText variant="bodyS" color={Colors.secondaryDeep}>{show ? 'Hide' : 'Show'}</AppText>
            </Pressable>
          </View>

          <Link href="/(auth)/forgot" asChild>
            <Pressable style={{ alignSelf: 'flex-end' }}>
              <AppText variant="bodyS" color={Colors.secondaryDeep}>Forgot password? Reset it</AppText>
            </Pressable>
          </Link>

          {error ? <AppText variant="bodyS" color={Colors.error}>{error}</AppText> : null}

          <MainButton title="Sign in" onPress={onSubmit} loading={loading} style={{ marginTop: Spacing.sm }} />
          <OutlineButton title="Continue as guest" onPress={onGuest} />
        </View>

        <View style={styles.footer}>
          <AppText variant="bodyM" color={Colors.textSecondary}>Don't have an account? </AppText>
          <Link href="/(auth)/register" asChild>
            <Pressable>
              <AppText variant="bodyM" color={Colors.secondaryDeep}>Sign up</AppText>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: Spacing.screen, flexGrow: 1 },
  showBtn: { position: 'absolute', right: Spacing.md, top: 38 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 'auto', paddingTop: Spacing.xxl },
});
