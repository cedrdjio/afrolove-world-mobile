import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText, MainButton, Chip } from '@/components/ui';
import { PressableScale } from '@/components/PressableScale';
import { Colors, Spacing, Radius } from '@/theme/theme';
import { useTheme } from '@/theme/ThemeContext';
import { useFilter, DiscoveryFilter, defaultFilter } from '@/context/FilterContext';

const genders: { label: string; value: DiscoveryFilter['gender'] }[] = [
  { label: 'Men', value: 'MALE' },
  { label: 'Women', value: 'FEMALE' },
  { label: 'Everyone', value: 'BOTH' },
];

function Stepper({
  value,
  onChange,
  min,
  max,
  step,
  suffix,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  suffix?: string;
}) {
  const { c } = useTheme();
  return (
    <View style={styles.stepper}>
      <PressableScale onPress={() => onChange(Math.max(min, value - step))} style={[styles.stepBtn, { borderColor: c.border }]}>
        <Ionicons name="remove" size={20} color={c.textPrimary} />
      </PressableScale>
      <AppText variant="h3" style={{ minWidth: 84, textAlign: 'center' }}>{value}{suffix}</AppText>
      <PressableScale onPress={() => onChange(Math.min(max, value + step))} style={[styles.stepBtn, { borderColor: c.border }]}>
        <Ionicons name="add" size={20} color={c.textPrimary} />
      </PressableScale>
    </View>
  );
}

export default function Filter() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { c } = useTheme();
  const { filter, setFilter, reset } = useFilter();

  const [draft, setDraft] = useState<DiscoveryFilter>(filter);
  const patch = (p: Partial<DiscoveryFilter>) => setDraft((d) => ({ ...d, ...p }));

  const apply = () => {
    // keep min <= max
    const minAge = Math.min(draft.minAge, draft.maxAge);
    const maxAge = Math.max(draft.minAge, draft.maxAge);
    setFilter({ ...draft, minAge, maxAge });
    router.back();
  };

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <PressableScale onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color={c.textPrimary} />
        </PressableScale>
        <AppText variant="h3">Discovery filters</AppText>
        <Pressable onPress={() => { reset(); setDraft(defaultFilter); }}>
          <AppText variant="bodyM" color={Colors.secondaryDeep}>Reset</AppText>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: Spacing.screen, paddingBottom: insets.bottom + 100, gap: Spacing.xl }}>
        <View>
          <AppText variant="overline" color={c.textMuted}>SHOW ME</AppText>
          <View style={styles.row}>
            {genders.map((g) => (
              <Pressable key={g.value} onPress={() => patch({ gender: g.value })}>
                <Chip label={g.label} active={draft.gender === g.value} />
              </Pressable>
            ))}
          </View>
        </View>

        <View>
          <View style={styles.labelRow}>
            <AppText variant="overline" color={c.textMuted}>MAXIMUM DISTANCE</AppText>
            <AppText variant="bodyS" color={c.textSecondary}>{draft.maxDistance} km</AppText>
          </View>
          <Stepper value={draft.maxDistance} onChange={(v) => patch({ maxDistance: v })} min={5} max={300} step={5} suffix=" km" />
          <AppText variant="bodyS" color={c.textMuted} style={{ marginTop: Spacing.xs }}>
            Only show people within this radius of you.
          </AppText>
        </View>

        <View>
          <AppText variant="overline" color={c.textMuted}>AGE RANGE</AppText>
          <View style={{ gap: Spacing.md, marginTop: Spacing.sm }}>
            <View style={styles.labelRow}>
              <AppText variant="bodyM">From</AppText>
              <Stepper value={draft.minAge} onChange={(v) => patch({ minAge: v })} min={18} max={99} step={1} />
            </View>
            <View style={styles.labelRow}>
              <AppText variant="bodyM">To</AppText>
              <Stepper value={draft.maxAge} onChange={(v) => patch({ maxAge: v })} min={18} max={99} step={1} />
            </View>
          </View>
        </View>

        <Pressable onPress={() => patch({ verifiedOnly: !draft.verifiedOnly })} style={[styles.toggleRow, { borderColor: c.border }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
            <Ionicons name="shield-checkmark" size={20} color={Colors.secondary} />
            <AppText variant="bodyL">Verified profiles only</AppText>
          </View>
          <View style={[styles.switch, { backgroundColor: draft.verifiedOnly ? Colors.secondary : c.border }]}>
            <View style={[styles.knob, { alignSelf: draft.verifiedOnly ? 'flex-end' : 'flex-start' }]} />
          </View>
        </Pressable>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.sm, backgroundColor: c.background, borderTopColor: c.border }]}>
        <MainButton title="Show results" onPress={apply} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.screen, paddingBottom: Spacing.sm },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginTop: Spacing.sm },
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.md, marginTop: Spacing.sm },
  stepBtn: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderRadius: Radius.lg, padding: Spacing.md },
  switch: { width: 44, height: 26, borderRadius: 13, padding: 3, justifyContent: 'center' },
  knob: { width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.white },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: Spacing.screen, paddingTop: Spacing.sm, borderTopWidth: 1 },
});
