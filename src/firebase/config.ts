/**
 * Firebase initialization for realtime chat (Firestore, JS SDK — Expo Go friendly).
 *
 * Drop your Firebase **web app** config into `app.json` → `expo.extra.firebase`
 * (or set the EXPO_PUBLIC_FIREBASE_* env vars). Until then the app runs chat on
 * local demo data, so everything stays testable on Expo Go.
 *
 *   "extra": {
 *     "firebase": {
 *       "apiKey": "...", "authDomain": "...", "projectId": "...",
 *       "storageBucket": "...", "messagingSenderId": "...", "appId": "..."
 *     }
 *   }
 */
import Constants from 'expo-constants';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

type FbConfig = {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
};

const fromExtra = (Constants.expoConfig?.extra?.firebase ?? {}) as FbConfig;

const config: FbConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? fromExtra.apiKey,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? fromExtra.authDomain,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? fromExtra.projectId,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? fromExtra.storageBucket,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_SENDER_ID ?? fromExtra.messagingSenderId,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? fromExtra.appId,
};

export const firebaseEnabled = Boolean(config.apiKey && config.projectId && config.appId);

let app: FirebaseApp | undefined;
let dbInstance: Firestore | undefined;

export function firebaseApp(): FirebaseApp | undefined {
  if (!firebaseEnabled) return undefined;
  if (!app) app = getApps().length ? getApp() : initializeApp(config as Required<FbConfig>);
  return app;
}

export function db(): Firestore | undefined {
  const a = firebaseApp();
  if (!a) return undefined;
  if (!dbInstance) dbInstance = getFirestore(a);
  return dbInstance;
}
