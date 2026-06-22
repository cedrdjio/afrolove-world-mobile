/**
 * Data models — TypeScript port of lib/data/models/*.
 * Field names mirror the GoMeet JSON contract so API payloads map 1:1.
 */

// ── Auth (usermodel.dart → UserLogin) ───────────────────────────────
export interface UserLogin {
  id?: string;
  name?: string;
  mobile?: string;
  email?: string;
  ccode?: string;
  gender?: string;
  wallet?: string;
  coin?: string;
  lats?: string;
  longs?: string;
  profile_bio?: string;
  profile_pic?: string | null;
  other_pic?: string;
  birth_date?: string;
  search_preference?: string;
  radius_search?: string;
  relation_goal?: string;
  interest?: string;
  language?: string;
  religion?: string;
  plan_id?: string;
  refercode?: string;
  is_verify?: string;
  status?: string;
}

export interface UserModel {
  UserLogin?: UserLogin;
  ResponseCode?: string;
  Result?: string;
  ResponseMsg?: string;
}

// ── Home (homemodel.dart → Profilelist) ─────────────────────────────
export interface ProfileList {
  profile_id?: string;
  profile_name?: string;
  profile_bio?: string;
  profile_age?: number;
  is_subscribe?: string;
  profile_distance?: string;
  is_verify?: string;
  profile_images?: string[];
  match_ratio?: number;
}

export interface HomeModel {
  ResponseCode?: string;
  Result?: string;
  ResponseMsg?: string;
  profilelist?: ProfileList[];
  totalliked?: ProfileList[];
  currency?: string;
  coin?: string;
  chat?: string;
  isVerify?: string;
  plan_name?: string;
  plan_id?: string;
  is_subscribe?: string;
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

/** Map a live Profilelist into the unified Card the UI renders. */
export function profileToCard(p: ProfileList): Card {
  return {
    id: String(p.profile_id ?? ''),
    name: p.profile_name ?? '',
    age: p.profile_age ?? 0,
    bio: p.profile_bio ?? '',
    distance: p.profile_distance ? `${p.profile_distance} km` : '',
    city: '',
    verified: p.is_verify === '1' || p.is_verify === 'true',
    images: (p.profile_images ?? []).filter(Boolean),
    interests: [],
  };
}
