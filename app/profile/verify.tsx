import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText, MainButton, Card } from '@/components/ui';
import { PressableScale } from '@/components/PressableScale';
import { Colors, Spacing, Radius, Shadows } from '@/theme/theme';
import { useTheme } from '@/theme/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { submitIdentity } from '@/api/services';
import { pickImages, appendPhotos, PickedImage } from '@/lib/images';

type Status = 'none' | 'pending' | 'verified';

const statusMeta: Record<Status, { color: string; icon: any; title: string; sub: string }> = {
  none: { color: Colors.textMuted, icon: 'shield-outline', title: 'Not verified', sub: 'Verify your identity to earn a blue badge and build trust.' },
  pending: { color: Colors.warning, icon: 'time-outline', title: 'Under review', sub: "We're reviewing your document. This usually takes 24–48h." },
  verified: { color: Colors.success, icon: 'shield-checkmark', title: 'Verified', sub: 'Your identity has been verified. Your badge is active.' },
};

export default function Verify() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { c } = useTheme();
  const { user, refreshUser } = useAuth();

  const initial: Status = user?.isVerify === '2' ? 'verified' : user?.isVerify === '1' ? 'pending' : 'none';
  const [status, setStatus] = useState<Status>(initial);
  const [doc, setDoc] = useState<PickedImage | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const meta = statusMeta[status];

  const pickDoc = async () => {
    const picked = await pickImages(1);
    if (picked.length) setDoc(picked[0]);
  };

  const onSubmit = async () => {
    if (!doc) return;
    setSubmitting(true);
    setError(null);
    try {
      const form = new FormData();
      appendPhotos(form, [doc]);
      const res = await submitIdentity(form);
      if (res.ok) {
        setStatus('pending');
        setDoc(null);
        await refreshUser();
      } else {
        setError(res.error ?? 'Could not submit');
      }
    } catch {
      setError('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.background }} contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.md, paddingBottom: insets.bottom + Spacing.xl }]}>
      <View style={styles.header}>
        <PressableScale onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color={c.textPrimary} />
        </PressableScale>
        <AppText variant="h3">Verification</AppText>
        <View style={{ width: 26 }} />
      </View>

      <Card style={{ marginTop: Spacing.lg, alignItems: 'center' }}>
        <View style={[styles.badge, { backgroundColor: meta.color + '22' }]}>
          <Ionicons name={meta.icon} size={34} color={meta.color} />
        </View>
        <AppText variant="h3" style={{ marginTop: Spacing.sm }}>{meta.title}</AppText>
        <AppText variant="bodyM" color={c.textSecondary} style={{ textAlign: 'center', marginTop: Spacing.xs }}>
          {meta.sub}
        </AppText>
      </Card>

      {status !== 'verified' ? (
        <>
          <AppText variant="overline" color={c.textMuted} style={{ marginTop: Spacing.xl }}>IDENTITY DOCUMENT</AppText>
          <AppText variant="bodyS" color={c.textSecondary} style={{ marginTop: Spacing.xs, marginBottom: Spacing.sm }}>
            Upload a clear photo of your passport, ID card or driver's licence.
          </AppText>

          {doc ? (
            <View style={[styles.preview, Shadows.soft]}>
              <Image source={{ uri: doc.uri }} style={styles.previewImg} contentFit="cover" />
              <PressableScale onPress={pickDoc} style={styles.changeBtn}>
                <AppText variant="bodyS" color={Colors.white}>Change</AppText>
              </PressableScale>
            </View>
          ) : (
            <PressableScale onPress={pickDoc} style={[styles.upload, { borderColor: c.border }]}>
              <Ionicons name="cloud-upload-outline" size={30} color={c.textSecondary} />
              <AppText variant="bodyM" color={c.textSecondary} style={{ marginTop: Spacing.xs }}>Tap to upload</AppText>
            </PressableScale>
          )}

          {error ? <AppText variant="bodyS" color={Colors.error} style={{ marginTop: Spacing.sm }}>{error}</AppText> : null}
          {user?.isDemo ? (
            <AppText variant="bodyS" color={c.textMuted} style={{ marginTop: Spacing.sm }}>Demo session — sign in to submit for review.</AppText>
          ) : null}

          <MainButton
            title={status === 'pending' ? 'Resubmit document' : 'Submit for review'}
            onPress={onSubmit}
            loading={submitting}
            disabled={!doc}
            style={{ marginTop: Spacing.lg }}
          />
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: Spacing.screen },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  upload: { height: 180, borderRadius: Radius.xl, borderWidth: 1.5, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  preview: { height: 200, borderRadius: Radius.xl, overflow: 'hidden' },
  previewImg: { width: '100%', height: '100%' },
  changeBtn: { position: 'absolute', bottom: Spacing.sm, right: Spacing.sm, backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: Radius.pill },
});
