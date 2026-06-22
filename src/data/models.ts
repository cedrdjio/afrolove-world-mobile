/**
 * Data models — shapes returned by the AfriLove Supabase Edge Function gateway.
 */

/** Authenticated account (from /auth/login, /auth/register, /me). */
export interface Account {
  id: string;
  name: string;
  email: string;
  mobile: string;
  ccode: string;
  gender: string;
  birth_date: string | null;
  profile_bio: string;
  profile_pic: string;
  other_pic: string;
  images: string[];
  search_preference: string;
  radius_search: string;
  relation_goal: string;
  interest: string;
  language: string;
  religion: string;
  height: string;
  lats: string;
  longs: string;
  wallet: string;
  coin: string;
  plan_id: string;
  is_subscribe: string;
  is_verify: string;
  code: string;
  refercode: string;
  status: string;
}

/** A discovery/profile card returned by /home, /matches, /likes-me, etc. */
export interface ApiProfile {
  id: string;
  name: string;
  bio: string;
  age: number;
  gender: string;
  is_subscribe: string;
  verified: boolean;
  distance: string;
  images: string[];
  match_ratio: number;
}

/** Unified card shape consumed by the swipe UI (demo + live share it). */
export interface Card {
  id: string;
  name: string;
  age: number;
  bio: string;
  distance: string;
  city: string;
  verified: boolean;
  images: string[];
  interests: string[];
}

/** Map a live API profile into the unified Card the UI renders. */
export function apiProfileToCard(p: ApiProfile): Card {
  return {
    id: String(p.id),
    name: p.name ?? '',
    age: p.age ?? 0,
    bio: p.bio ?? '',
    distance: p.distance && Number(p.distance) > 0 ? `${Math.round(Number(p.distance))} km` : '',
    city: '',
    verified: !!p.verified,
    images: (p.images ?? []).filter(Boolean),
    interests: [],
  };
}
