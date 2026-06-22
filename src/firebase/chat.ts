/**
 * Realtime chat over Firestore.
 *
 * Data model (Firestore chat layout):
 *   chats/{roomId}/messages/{messageId}  { text, senderId, createdAt }
 *   chats/{roomId}                        { members, lastMessage, lastAt }
 *
 * roomId is the two user ids sorted + joined, so both sides resolve the same room.
 */
import {
  collection,
  doc,
  addDoc,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db, firebaseEnabled } from './config';

export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  createdAt: number; // ms epoch (0 while pending server timestamp)
}

export interface ChatThread {
  id: string;
  members: string[];
  lastMessage: string;
  lastAt: number;
}

export function roomId(a: string, b: string): string {
  return [a, b].sort().join('__');
}

const toMs = (t: unknown): number => (t instanceof Timestamp ? t.toMillis() : 0);

/** Subscribe to a room's messages in real time (ascending). */
export function subscribeMessages(rid: string, cb: (messages: ChatMessage[]) => void): () => void {
  const database = db();
  if (!firebaseEnabled || !database) return () => {};
  const q = query(collection(database, 'chats', rid, 'messages'), orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snap) => {
    cb(
      snap.docs.map((d) => {
        const data = d.data();
        return { id: d.id, text: data.text ?? '', senderId: data.senderId ?? '', createdAt: toMs(data.createdAt) };
      })
    );
  });
}

/** Send a message and update the room summary. */
export async function sendMessage(rid: string, senderId: string, peerId: string, text: string): Promise<void> {
  const database = db();
  if (!firebaseEnabled || !database) return;
  await addDoc(collection(database, 'chats', rid, 'messages'), {
    text,
    senderId,
    createdAt: serverTimestamp(),
  });
  await setDoc(
    doc(database, 'chats', rid),
    { members: [senderId, peerId], lastMessage: text, lastAt: serverTimestamp() },
    { merge: true }
  );
}

/** Subscribe to the current user's conversation threads. */
export function subscribeThreads(uid: string, cb: (threads: ChatThread[]) => void): () => void {
  const database = db();
  if (!firebaseEnabled || !database) return () => {};
  const q = query(collection(database, 'chats'), where('members', 'array-contains', uid));
  return onSnapshot(q, (snap) => {
    const threads = snap.docs
      .map((d) => {
        const data = d.data();
        return {
          id: d.id,
          members: (data.members ?? []) as string[],
          lastMessage: data.lastMessage ?? '',
          lastAt: toMs(data.lastAt),
        };
      })
      .sort((a, b) => b.lastAt - a.lastAt);
    cb(threads);
  });
}
