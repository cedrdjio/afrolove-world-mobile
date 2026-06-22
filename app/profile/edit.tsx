import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText, MainButton, TextFieldPro, Chip } from '@/components/ui';
import { PressableScale } from '@/components/PressableScale';
import { Colors, Spacing, Radius, Shadows } from '@/theme/theme';
import { useTheme } from '@/theme/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { fetchMe, updateProfileForm } from '@/api/services';
import { pickImages, appendPhotos, PickedImage } from '@/lib/images';

const genders = [
  { label: 'Man', value: 'MALE' },
  { label: 'Woman', value: 'FEMALE' },
  { label: 'Other', value: 'OTHER' },
];
const prefs = [
  { label: 'Men', value: 'MALE' },
  { label: 'Women', value: 'FEMALE' },
  { label: 'Everyone', value: 'BOTH' },
];

export default function EditProfile() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { c } = useTheme();
  const { user, refreshUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [height, setHeight] = useState('');
  const [gender, setGender] = useState('');
  const [pref, setPref] = useState('');
  const [keptImages, setKeptImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<PickedImage[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchMe();
        if (res.ok && res.user) {
          setName(res.user.name ?? '');
          setBio(res.user.profile_bio ?? '');
          setHeight(res.user.height ?? '');
          setGender(res.user.gender ?? '');
          setPref(res.user.search_preference ?? '');
          setKeptImages(res.user.images ?? []);
        }
      } catch {
        /* offline */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const addPhotos = async () => {
    const picked = await pickImages(6);
    if (picked.length) setNewImages((prev) => [...prev, ...picked].slice(0, 9));
  };

  const onSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const form = new FormData();
      form.append('name', name);
      form.append('profile_bio', bio);
      form.append('height', height);
      if (gender) form.append('gender', gender);
      if (pref) form.append('search_preference', pref);
      form.append('keep_images', keptImages.join('$;'));
      appendPhotos(form, newImages);
      const res = await updateProfileForm(form);
      if (res.ok) {
        await refreshUser();
        router.back();
      } else {
        setError(res.error ?? 'Could not save');
      }
    } catch {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  const allThumbs: { uri: string; isNew: boolean; idx: number }[] = [
    ...keptImages.map((uri, idx) => ({ uri, isNew: false, idx })),
    ...newImages.map((img, idx) => ({ uri: img.uri, isNew: true, idx })),
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.background }} contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.md, paddingBottom: insets.bottom + Spacing.xl }]} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <PressableScale onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color={c.textPrimary} />
        </PressableScale>
        <AppText variant="h3">Edit profile</AppText>
        <View style={{ width: 26 }} />
      </View>

      <AppText variant="overline" color={c.textMuted} style={{ marginTop: Spacing.lg }}>PHOTOS</AppText>
      <View style={styles.grid}>
        {allThumbs.map((t) => (
          <View key={`${t.isNew ? 'n' : 'k'}-${t.idx}`} style={[styles.thumbWrap, Shadows.soft]}>
            <Image source={{ uri: t.uri }} style={styles.thumb} contentFit="cover" />
            <Pressable
              style={styles.removeBtn}
              onPress={() =>
                t.isNew
                  ? setNewImages((prev) => prev.filter((_, i) => i !== t.idx))
                  : setKeptImages((prev) => prev.filter((_, i) => i !== t.idx))
              }
            >
              <Ionicons name="close" size={14} color={Colors.white} />
            </Pressable>
          </View>
        ))}
        {allThumbs.length < 9 ? (
          <PressableScale onPress={addPhotos} style={[styles.addBtn, { borderColor: c.border }]}>
            <Ionicons name="add" size={28} color={c.textSecondary} />
          </PressableScale>
        ) : null}
      </View>

      <View style={{ gap: Spacing.md, marginTop: Spacing.lg }}>
        <TextFieldPro label="Name" value={name} onChangeText={setName} />
        <TextFieldPro label="Bio" value={bio} onChangeText={setBio} multiline numberOfLines={3} style={{ height: 90, textAlignVertical: 'top' }} />
        <TextFieldPro label="Height (cm)" value={height} onChangeText={setHeight} keyboardType="number-pad" />

        <AppText variant="label" color={c.textSecondary} style={{ marginTop: Spacing.sm }}>I am a</AppText>
        <View style={styles.row}>
          {genders.map((g) => (
            <Pressable key={g.value} onPress={() => setGender(g.value)}>
              <Chip label={g.label} active={gender === g.value} />
            </Pressable>
          ))}
        </View>

        <AppText variant="label" color={c.textSecondary} style={{ marginTop: Spacing.sm }}>Looking for</AppText>
        <View style={styles.row}>
          {prefs.map((g) => (
            <Pressable key={g.value} onPress={() => setPref(g.value)}>
              <Chip label={g.label} active={pref === g.value} />
            </Pressable>
          ))}
        </View>

        {error ? <AppText variant="bodyS" color={Colors.error}>{error}</AppText> : null}
        {user?.isDemo ? (
          <AppText variant="bodyS" color={c.textMuted}>Demo session — sign in to save changes to your account.</AppText>
        ) : null}
        <MainButton title="Save changes" onPress={onSave} loading={saving} style={{ marginTop: Spacing.sm }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: Spacing.screen },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.sm },
  thumbWrap: { width: 96, height: 124, borderRadius: Radius.lg, overflow: 'hidden' },
  thumb: { width: '100%', height: '100%' },
  removeBtn: { position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' },
  addBtn: { width: 96, height: 124, borderRadius: Radius.lg, borderWidth: 1.5, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
});
