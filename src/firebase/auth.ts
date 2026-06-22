/**
 * Firebase Auth bridge.
 *
 * Keeps a single identity: the app's Supabase user id. After a successful
 * Supabase login the app fetches a Firebase custom token from the gateway
 * (uid = Supabase user id) and signs in, so Firestore rules can trust
 * request.auth.uid. We re-mint on each launch (no Firebase persistence needed).
 */
import { getAuth, signInWithCustomToken, signOut } from 'firebase/auth';
import { firebaseApp, firebaseEnabled } from './config';
import { getFirebaseToken } from '@/api/services';

let signingInFor: string | null = null;

/** Ensure Firebase Auth is signed in as the given app user id. */
export async function ensureFirebaseAuth(uid: string): Promise<void> {
  const app = firebaseApp();
  if (!firebaseEnabled || !app || !uid) return;
  const auth = getAuth(app);
  if (auth.currentUser?.uid === uid || signingInFor === uid) return;
  signingInFor = uid;
  try {
    const res = await getFirebaseToken();
    if (res.ok && res.token) await signInWithCustomToken(auth, res.token);
  } catch {
    /* chat will fall back to demo if this fails */
  } finally {
    signingInFor = null;
  }
}

export async function signOutFirebase(): Promise<void> {
  const app = firebaseApp();
  if (!firebaseEnabled || !app) return;
  try {
    await signOut(getAuth(app));
  } catch {
    /* ignore */
  }
}
