import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppText, MainButton, TextFieldPro, Chip } from '@/components/ui';
import { PressableScale } from '@/components/PressableScale';
import { Colors, Spacing, Radius, Shadows } from '@/theme/theme';
import { useAuth } from '@/context/AuthContext';

const genders: { label: string; value: string }[] = [
  { label: 'Man', value: 'MALE' },
  { label: 'Woman', value: 'FEMALE' },
  { label: 'Other', value: 'OTHER' },
];
const prefs: { label: string; value: string }[] = [
  { label: 'Men', value: 'MALE' },
  { label: 'Women', value: 'FEMALE' },
  { label: 'Everyone', value: 'BOTH' },
];

export default function Register() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [gender, setGender] = useState(-1);
  const [pref, setPref] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    if (!name.trim() || (!email.trim() && !mobile.trim()) || password.length < 6) {
      setError('Enter a name, an email or mobile, and a password (6+ chars).');
      return;
    }
    setLoading(true);
    setError(null);
    const res = await register({
      name: name.trim(),
      email: email.trim() || undefined,
      mobile: mobile.trim() || undefined,
      password,
      gender: gender >= 0 ? genders[gender].value : undefined,
      search_preference: pref >= 0 ? prefs[pref].value : undefined,
    });
    setLoading(false);
    if (res.ok) router.replace('/(tabs)');
    else setError(res.message ?? 'Registration failed');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: Colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.md, paddingBottom: insets.bottom + Spacing.xl }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <PressableScale onPress={() => router.back()} style={[styles.backBtn, { borderColor: Colors.border }]}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </PressableScale>

        <Animated.View entering={FadeInDown.delay(60).springify().damping(16)}>
          <AppText variant="h1" style={{ marginTop: Spacing.lg }}>Create account</AppText>
          <AppText variant="bodyM" color={Colors.textSecondary} style={{ marginTop: Spacing.xs }}>
            A few details and you're in.
          </AppText>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(140).springify().damping(16)} style={[styles.card, Shadows.card]}>
          <TextFieldPro label="Full name" placeholder="Your name" value={name} onChangeText={setName} />
          <TextFieldPro label="Email" placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
          <TextFieldPro label="Mobile (optional)" placeholder="Your number" keyboardType="phone-pad" value={mobile} onChangeText={setMobile} />
          <View>
            <TextFieldPro label="Password" placeholder="••••••••" secureTextEntry={!show} value={password} onChangeText={setPassword} />
            <Pressable onPress={() => setShow((s) => !s)} style={styles.showBtn} hitSlop={8}>
              <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.textMuted} />
            </Pressable>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(220).springify().damping(16)} style={{ marginTop: Spacing.lg, gap: Spacing.sm }}>
          <AppText variant="label" color={Colors.textSecondary}>I am a</AppText>
          <View style={styles.row}>
            {genders.map((g, i) => (
              <Pressable key={g.value} onPress={() => setGender(i)}>
                <Chip label={g.label} active={gender === i} />
              </Pressable>
            ))}
          </View>
          <AppText variant="label" color={Colors.textSecondary} style={{ marginTop: Spacing.sm }}>Looking for</AppText>
          <View style={styles.row}>
            {prefs.map((g, i) => (
              <Pressable key={g.value} onPress={() => setPref(i)}>
                <Chip label={g.label} active={pref === i} />
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {error ? <AppText variant="bodyS" color={Colors.error} style={{ marginTop: Spacing.md }}>{error}</AppText> : null}

        <Animated.View entering={FadeInDown.delay(300)}>
          <MainButton title="Create account" onPress={onSubmit} loading={loading} style={{ marginTop: Spacing.lg }} />
          <AppText variant="caption" color={Colors.textMuted} style={{ textAlign: 'center', marginTop: Spacing.sm }}>
            By continuing you agree to our Terms & Privacy.
          </AppText>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: Spacing.screen, flexGrow: 1 },
  backBtn: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
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
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
});
