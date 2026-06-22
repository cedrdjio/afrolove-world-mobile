/**
 * Supabase backend configuration (AfriLove World — project sbvlkjaifqocakgxvdea).
 *
 * The mobile app talks ONLY to the `api` Edge Function gateway, which runs
 * server-side with the service-role key and returns a clean `{ ok, ... }` JSON
 * envelope. The app ships only the publishable (anon) key — safe to embed — plus
 * a signed session token issued at login. The same database powers the Next.js
 * admin dashboard.
 *
 * Override via app.json → expo.extra.supabase or EXPO_PUBLIC_SUPABASE_* env vars.
 */
import Constants from 'expo-constants';

const extra = (Constants.expoConfig?.extra?.supabase ?? {}) as {
  url?: string;
  publishableKey?: string;
};

export const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? extra.url ?? 'https://sbvlkjaifqocakgxvdea.supabase.co';

/** Publishable (anon) key — designed to be shipped in clients. NEVER the secret key. */
export const SUPABASE_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  extra.publishableKey ??
  'sb_publishable_vewP1o3kkTF2-J9_8SugDA_G5AA5_Gy';

/** Base URL of the mobile API gateway (Edge Function). */
export const API_BASE = `${SUPABASE_URL}/functions/v1/api`;
