import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, MainButton, TextFieldPro } from '@/components/ui';
import { Colors, Spacing } from '@/theme/theme';

// Port of recover_email.dart — forget_password.php flow.
export default function Forgot() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <View style={[styles.root, { paddingTop: insets.top + Spacing.lg }]}>
      <Pressable onPress={() => router.back()} style={{ marginBottom: Spacing.md }}>
        <AppText variant="bodyM" color={Colors.secondaryDeep}>← Back</AppText>
      </Pressable>
      <AppText variant="h1">Reset password</AppText>
      <AppText variant="bodyM" color={Colors.textSecondary} style={{ marginTop: Spacing.xs }}>
        Enter your email and we'll send you a reset link.
      </AppText>
      <View style={{ marginTop: Spacing.xl, gap: Spacing.md }}>
        <TextFieldPro label="Email" placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
        {sent ? (
          <AppText variant="bodyS" color={Colors.success}>If an account exists, a reset link is on its way.</AppText>
        ) : null}
        <MainButton title="Send reset link" onPress={() => setSent(true)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background, paddingHorizontal: Spacing.screen },
});
