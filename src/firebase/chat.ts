/**
 * Realtime chat over Firestore.
 *
 *   chats/{roomId}                       { members, info:{uid:{name,avatar}},
 *                                          lastMessage, lastAt, lastSender,
 *                                          typing:{uid:bool}, read:{uid:ts} }
 *   chats/{roomId}/messages/{messageId}  { text, imageUrl, senderId, createdAt }
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
  imageUrl?: string;
  senderId: string;
  createdAt: number;
}

export interface RoomMeta {
  typing: Record<string, boolean>;
  read: Record<string, number>;
  lastMessage: string;
  lastAt: number;
}

export interface Participant {
  name: string;
  avatar: string;
}

export interface ChatThread {
  id: string;
  peerId: string;
  peerName: string;
  peerAvatar: string;
  lastMessage: string;
  lastAt: number;
  unread: boolean;
}

export function roomId(a: string, b: string): string {
  return [a, b].sort().join('__');
}

const toMs = (t: unknown): number =>
  t instanceof Timestamp ? t.toMillis() : typeof t === 'number' ? t : 0;

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

/** Store both participants' display info on the room (so the list can render). */
export async function ensureRoom(
  rid: string,
  me: { id: string } & Participant,
  peer: { id: string } & Participant
): Promise<void> {
  const database = db();
  if (!firebaseEnabled || !database) return;
  await setDoc(
    doc(database, 'chats', rid),
    {
      members: [me.id, peer.id],
      info: {
        [me.id]: { name: me.name, avatar: me.avatar },
        [peer.id]: { name: peer.name, avatar: peer.avatar },
      },
    },
    { merge: true }
  ).catch(() => {});
}

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
      lastSender: senderId,
      typing: { [senderId]: false },
    },
    { merge: true }
  );
}

export async function setTyping(rid: string, uid: string, typing: boolean): Promise<void> {
  const database = db();
  if (!firebaseEnabled || !database) return;
  await setDoc(doc(database, 'chats', rid), { typing: { [uid]: typing } }, { merge: true }).catch(() => {});
}

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
        const members = (data.members ?? []) as string[];
        const peerId = members.find((m) => m !== uid) ?? '';
        const info = (data.info ?? {})[peerId] ?? {};
        const readAt = toMs((data.read ?? {})[uid]);
        const lastAt = toMs(data.lastAt);
        return {
          id: d.id,
          peerId,
          peerName: info.name ?? 'Someone',
          peerAvatar: info.avatar ?? '',
          lastMessage: data.lastMessage ?? '',
          lastAt,
          unread: data.lastSender && data.lastSender !== uid ? lastAt > readAt : false,
        };
      })
      .filter((t) => t.lastAt > 0)
      .sort((a, b) => b.lastAt - a.lastAt);
    cb(threads);
  });
}
