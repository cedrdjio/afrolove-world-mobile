/**
 * Realtime chat over Firestore.
 *
 *   chats/{roomId}                       { members, lastMessage, lastAt,
 *                                          typing: {uid: bool}, read: {uid: ts} }
 *   chats/{roomId}/messages/{messageId}  { text, imageUrl, senderId, createdAt }
 *
 * roomId is the two user ids sorted + joined, so both sides resolve the same room.
 */
import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
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
  imageUrl?: string;
  senderId: string;
  createdAt: number; // ms epoch (0 while the server timestamp is pending)
}

export interface RoomMeta {
  typing: Record<string, boolean>;
  read: Record<string, number>; // uid → last-read ms epoch
  lastMessage: string;
  lastAt: number;
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

const toMs = (t: unknown): number => (t instanceof Timestamp ? t.toMillis() : typeof t === 'number' ? t : 0);

/** Subscribe to a room's messages in real time (ascending). */
export function subscribeMessages(rid: string, cb: (messages: ChatMessage[]) => void): () => void {
  const database = db();
  if (!firebaseEnabled || !database) return () => {};
  const q = query(collection(database, 'chats', rid, 'messages'), orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snap) => {
    cb(
      snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          text: data.text ?? '',
          imageUrl: data.imageUrl ?? undefined,
          senderId: data.senderId ?? '',
          createdAt: toMs(data.createdAt),
        };
      })
    );
  });
}

/** Subscribe to the room metadata (typing + read receipts + summary). */
export function subscribeRoom(rid: string, cb: (meta: RoomMeta) => void): () => void {
  const database = db();
  if (!firebaseEnabled || !database) return () => {};
  return onSnapshot(doc(database, 'chats', rid), (snap) => {
    const data = snap.data() ?? {};
    const read: Record<string, number> = {};
    Object.entries(data.read ?? {}).forEach(([k, v]) => (read[k] = toMs(v)));
    cb({ typing: data.typing ?? {}, read, lastMessage: data.lastMessage ?? '', lastAt: toMs(data.lastAt) });
  });
}

/** Send a text and/or image message and update the room summary. */
export async function sendMessage(
  rid: string,
  senderId: string,
  peerId: string,
  payload: { text?: string; imageUrl?: string }
): Promise<void> {
  const database = db();
  if (!firebaseEnabled || !database) return;
  const text = payload.text?.trim() ?? '';
  await addDoc(collection(database, 'chats', rid, 'messages'), {
    text,
    ...(payload.imageUrl ? { imageUrl: payload.imageUrl } : {}),
    senderId,
    createdAt: serverTimestamp(),
  });
  await setDoc(
    doc(database, 'chats', rid),
    {
      members: [senderId, peerId],
      lastMessage: payload.imageUrl ? '📷 Photo' : text,
      lastAt: serverTimestamp(),
      [`typing.${senderId}`]: false,
    },
    { merge: true }
  );
}

/** Set/clear the current user's typing flag in a room. */
export async function setTyping(rid: string, uid: string, typing: boolean): Promise<void> {
  const database = db();
  if (!firebaseEnabled || !database) return;
  await setDoc(doc(database, 'chats', rid), { typing: { [uid]: typing } }, { merge: true }).catch(() => {});
}

/** Mark the room as read up to now for the current user. */
export async function markRead(rid: string, uid: string): Promise<void> {
  const database = db();
  if (!firebaseEnabled || !database) return;
  await setDoc(doc(database, 'chats', rid), { read: { [uid]: serverTimestamp() } }, { merge: true }).catch(() => {});
}

/** Subscribe to the current user's conversation threads (most recent first). */
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
