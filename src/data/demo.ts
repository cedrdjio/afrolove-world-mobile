/**
 * Demo data — lets the app run end-to-end on Expo Go without a live account.
 * Mirrors the unified Card shape returned by the live `/home` feed, so screens
 * render identically whether data is live or demo.
 */
import { Card } from './models';

/** Demo profiles share the unified Card shape used by the live home_data feed. */
export type Profile = Card;

const u = (s: string) => `https://images.unsplash.com/${s}?auto=format&fit=crop&w=900&q=80`;

export const demoProfiles: Profile[] = [
  {
    id: '1',
    name: 'Amara',
    age: 27,
    bio: 'Lover of jollof, jazz nights and spontaneous road trips. Looking for something real.',
    distance: '3 km',
    city: 'Lagos',
    verified: true,
    images: [u('photo-1531123897727-8f129e1688ce'), u('photo-1488426862026-3ee34a7d66df')],
    interests: ['Travel', 'Music', 'Cooking', 'Art'],
  },
  {
    id: '2',
    name: 'Kwame',
    age: 30,
    bio: 'Architect by day, vinyl collector by night. Tell me your favourite record.',
    distance: '5 km',
    city: 'Accra',
    verified: false,
    images: [u('photo-1500648767791-00dcc994a43e'), u('photo-1506794778202-cad84cf45f1d')],
    interests: ['Design', 'Vinyl', 'Coffee'],
  },
  {
    id: '3',
    name: 'Zola',
    age: 25,
    bio: 'Dancer & dreamer. Sunsets, good food and even better conversations.',
    distance: '2 km',
    city: 'Johannesburg',
    verified: true,
    images: [u('photo-1524504388940-b1c1722653e1'), u('photo-1517841905240-472988babdf9')],
    interests: ['Dance', 'Fitness', 'Foodie', 'Travel'],
  },
  {
    id: '4',
    name: 'Idris',
    age: 29,
    bio: 'Tech founder. I make a mean suya. Adventure is my love language.',
    distance: '8 km',
    city: 'Nairobi',
    verified: true,
    images: [u('photo-1492562080023-ab3db95bfbce'), u('photo-1507003211169-0a1dd7228f2d')],
    interests: ['Startups', 'Hiking', 'Photography'],
  },
  {
    id: '5',
    name: 'Naomi',
    age: 26,
    bio: 'Writer, plant mum, and incurable romantic. Send me poetry.',
    distance: '4 km',
    city: 'Abidjan',
    verified: false,
    images: [u('photo-1534528741775-53994a69daeb'), u('photo-1529626455594-4ff0802cfb7e')],
    interests: ['Books', 'Plants', 'Wine', 'Art'],
  },
];

export interface ChatThread {
  id: string;
  name: string;
  avatar: string;
  last: string;
  time: string;
  unread: number;
  online: boolean;
}

export const demoChats: ChatThread[] = [
  { id: '1', name: 'Amara', avatar: u('photo-1531123897727-8f129e1688ce'), last: "Can't wait for Saturday 😊", time: '2m', unread: 2, online: true },
  { id: '3', name: 'Zola', avatar: u('photo-1524504388940-b1c1722653e1'), last: 'That playlist is fire 🔥', time: '1h', unread: 0, online: true },
  { id: '5', name: 'Naomi', avatar: u('photo-1534528741775-53994a69daeb'), last: 'Sent you a poem 📜', time: '3h', unread: 1, online: false },
  { id: '2', name: 'Kwame', avatar: u('photo-1500648767791-00dcc994a43e'), last: 'Coffee this week?', time: '1d', unread: 0, online: false },
];

export interface DemoMessage {
  id: string;
  text: string;
  mine: boolean;
  time: string;
}

export const demoMessages: DemoMessage[] = [
  { id: '1', text: 'Hey! Loved your profile 😊', mine: false, time: '10:02' },
  { id: '2', text: 'Aww thank you! Yours too — that hiking photo!', mine: true, time: '10:04' },
  { id: '3', text: 'Haha that was Mount Kenya. You into hiking?', mine: false, time: '10:05' },
  { id: '4', text: 'Obsessed. We should go sometime 🥾', mine: true, time: '10:06' },
  { id: '5', text: "Can't wait for Saturday 😊", mine: false, time: '10:08' },
];
