import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, MainButton, TextFieldPro, Chip } from '@/components/ui';
import { Colors, Spacing } from '@/theme/theme';
import { useAuth } from '@/context/AuthContext';

// Single-scroll sign-up. Collects the core fields the AfriLove /auth/register
// route expects (gender is stored MALE/FEMALE; preference drives discovery).
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
  const [gender, setGender] = useState<number>(-1);
  const [pref, setPref] = useState<number>(-1);
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
    <ScrollView style={{ flex: 1, backgroundColor: Colors.background }} contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.lg, paddingBottom: insets.bottom + Spacing.xl }]} keyboardShouldPersistTaps="handled">
      <Pressable onPress={() => router.back()} style={{ marginBottom: Spacing.md }}>
        <AppText variant="bodyM" color={Colors.secondaryDeep}>← Back</AppText>
      </Pressable>
      <AppText variant="h1">Create account</AppText>
      <AppText variant="bodyM" color={Colors.textSecondary} style={{ marginTop: Spacing.xs }}>
        Tell us a little about you.
      </AppText>

      <View style={{ marginTop: Spacing.xl, gap: Spacing.md }}>
        <TextFieldPro label="Full name" placeholder="Your name" value={name} onChangeText={setName} />
        <TextFieldPro label="Email" placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
        <TextFieldPro label="Mobile (optional)" placeholder="Your number" keyboardType="phone-pad" value={mobile} onChangeText={setMobile} />
        <TextFieldPro label="Password" placeholder="••••••••" secureTextEntry value={password} onChangeText={setPassword} />

        <AppText variant="label" color={Colors.textSecondary} style={{ marginTop: Spacing.sm }}>I am a</AppText>
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

        {error ? <AppText variant="bodyS" color={Colors.error}>{error}</AppText> : null}
        <MainButton title="Create account" onPress={onSubmit} loading={loading} style={{ marginTop: Spacing.lg }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: Spacing.screen },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
});
