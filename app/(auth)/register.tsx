import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, MainButton, TextFieldPro, Chip } from '@/components/ui';
import { Colors, Spacing } from '@/theme/theme';
import { useAuth } from '@/context/AuthContext';

// Condensed port of creat_steps.dart — single scroll form (multi-step UX can be
// layered later). Collects the core registration fields the GoMeet reg_user.php
// endpoint expects.
const genders = ['Man', 'Woman', 'Other'];
const goals = ['Long-term', 'Casual', 'New friends', 'Still figuring it out'];

export default function Register() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { loginDemo } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState<number>(-1);
  const [goal, setGoal] = useState<number>(-1);

  const onSubmit = async () => {
    // TODO: POST reg_user.php once the Supabase auth endpoints are live.
    await loginDemo();
    router.replace('/(tabs)');
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
        <TextFieldPro label="Mobile" placeholder="+234..." keyboardType="phone-pad" value={mobile} onChangeText={setMobile} />
        <TextFieldPro label="Password" placeholder="••••••••" secureTextEntry value={password} onChangeText={setPassword} />

        <AppText variant="label" color={Colors.textSecondary} style={{ marginTop: Spacing.sm }}>I am a</AppText>
        <View style={styles.row}>
          {genders.map((g, i) => (
            <Pressable key={g} onPress={() => setGender(i)}>
              <Chip label={g} active={gender === i} />
            </Pressable>
          ))}
        </View>

        <AppText variant="label" color={Colors.textSecondary} style={{ marginTop: Spacing.sm }}>Looking for</AppText>
        <View style={styles.row}>
          {goals.map((g, i) => (
            <Pressable key={g} onPress={() => setGoal(i)}>
              <Chip label={g} active={goal === i} />
            </Pressable>
          ))}
        </View>

        <MainButton title="Continue" onPress={onSubmit} style={{ marginTop: Spacing.lg }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: Spacing.screen },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
});
