import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, MainButton, TextFieldPro } from '@/components/ui';
import { Colors, Spacing } from '@/theme/theme';
import { useAuth } from '@/context/AuthContext';

// Password reset — calls the AfriLove /auth/forgot route to set a new password.
export default function Forgot() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { resetPassword } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const onSubmit = async () => {
    if (!identifier.trim() || password.length < 6) {
      setMessage({ ok: false, text: 'Enter your email/mobile and a new password (6+ chars).' });
      return;
    }
    setLoading(true);
    setMessage(null);
    const res = await resetPassword(identifier.trim(), password);
    setLoading(false);
    if (res.ok) {
      setMessage({ ok: true, text: 'Password updated. You can sign in now.' });
      setTimeout(() => router.replace('/(auth)/login'), 1200);
    } else {
      setMessage({ ok: false, text: res.message ?? 'Could not reset password.' });
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + Spacing.lg }]}>
      <Pressable onPress={() => router.back()} style={{ marginBottom: Spacing.md }}>
        <AppText variant="bodyM" color={Colors.secondaryDeep}>← Back</AppText>
      </Pressable>
      <AppText variant="h1">Reset password</AppText>
      <AppText variant="bodyM" color={Colors.textSecondary} style={{ marginTop: Spacing.xs }}>
        Enter your email or mobile and choose a new password.
      </AppText>
      <View style={{ marginTop: Spacing.xl, gap: Spacing.md }}>
        <TextFieldPro label="Email or mobile" placeholder="you@example.com" autoCapitalize="none" value={identifier} onChangeText={setIdentifier} />
        <TextFieldPro label="New password" placeholder="••••••••" secureTextEntry value={password} onChangeText={setPassword} />
        {message ? (
          <AppText variant="bodyS" color={message.ok ? Colors.success : Colors.error}>{message.text}</AppText>
        ) : null}
        <MainButton title="Update password" onPress={onSubmit} loading={loading} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background, paddingHorizontal: Spacing.screen },
});
