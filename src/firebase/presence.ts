/**
 * Online presence over Firestore: presence/{uid} { state, lastChanged }.
 * A user is considered online if state==='online' and lastChanged is recent.
 */
import { doc, setDoc, onSnapshot, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db, firebaseEnabled } from './config';

const ONLINE_WINDOW_MS = 60_000; // treat as online if seen within the last minute

export async function setPresence(uid: string, online: boolean): Promise<void> {
  const database = db();
  if (!firebaseEnabled || !database || !uid) return;
  await setDoc(
    doc(database, 'presence', uid),
    { state: online ? 'online' : 'offline', lastChanged: serverTimestamp() },
    { merge: true }
  ).catch(() => {});
}

export interface Presence {
  online: boolean;
  lastSeen: number;
}

export function subscribePresence(uid: string, cb: (p: Presence) => void): () => void {
  const database = db();
  if (!firebaseEnabled || !database || !uid) return () => {};
  return onSnapshot(doc(database, 'presence', uid), (snap) => {
    const data = snap.data();
    const last = data?.lastChanged instanceof Timestamp ? data.lastChanged.toMillis() : 0;
    const online = data?.state === 'online' && Date.now() - last < ONLINE_WINDOW_MS;
    cb({ online, lastSeen: last });
  });
}
