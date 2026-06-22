/**
 * API services — typed wrappers over the GoMeet REST contract.
 * Ports the request shapes from onbording_cubit.dart + home_cubit.dart.
 */
import { post, get, GoMeetResponse } from './client';
import { UserModel, HomeModel } from '@/data/models';

// ── Auth ────────────────────────────────────────────────────────────

/** sms_type.php — startup settings (otp provider, admob, maintenance...). */
export function fetchSmsType() {
  return get<GoMeetResponse>('smsType');
}

/** mobile_check.php — does this number already have an account? */
export function mobileCheck(mobile: string, ccode: string) {
  return post<GoMeetResponse>('mobileCheck', { mobile, ccode: `+${ccode}` });
}

/** user_login.php — { mobile, password, ccode } → UserLogin. */
export function userLogin(mobile: string, password: string, ccode: string) {
  return post<UserModel>('userLogin', { mobile, password, ccode });
}

/** social_login.php — { email } → UserLogin or "needs registration" (201). */
export function socialLogin(email: string) {
  return post<UserModel>('socialLogin', { email });
}

/** forget_password.php — { mobile, password, ccode }. */
export function forgetPassword(mobile: string, password: string, ccode: string) {
  return post<GoMeetResponse>('forgetPassword', { mobile, password, ccode: `+${ccode}` });
}

export interface RegisterPayload {
  name: string;
  email: string;
  mobile: string;
  ccode: string;
  birth_date: string;
  search_preference: string;
  radius_search: string;
  relation_goal: string;
  profile_bio: string;
  interest: string;
  language: string;
  password: string;
  refercode: string;
  gender: string;
  lats: string;
  longs: string;
  religion: string;
}

/** reg_user.php — multipart (photos appended as otherpic0..N). */
export async function registerUser(payload: RegisterPayload, images: { uri: string; name?: string }[] = []) {
  const form = new FormData();
  Object.entries(payload).forEach(([k, v]) => form.append(k, v));
  form.append('size', String(images.length));
  images.forEach((img, i) => {
    // @ts-expect-error RN FormData file shape
    form.append(`otherpic${i}`, { uri: img.uri, name: img.name ?? `photo${i}.jpg`, type: 'image/jpeg' });
  });
  return post<UserModel>('registerUser', form as unknown as Record<string, unknown>);
}

// ── Home / discovery ────────────────────────────────────────────────

/** home_data.php — { uid, lats, longs } → profilelist + meta. */
export function homeData(uid: string, lats: string, longs: string) {
  return post<HomeModel>('homeData', { uid, lats, longs });
}

/** like_dislike.php — { uid, profile_id, action }. */
export function likeDislike(uid: string, profileId: string, action: 'like' | 'dislike' | 'superlike') {
  return post<GoMeetResponse>('likeDislike', { uid, profile_id: profileId, action });
}

/** like_me.php — people who liked the current user. */
export function likeMe(uid: string) {
  return post<HomeModel>('likeMe', { uid });
}

/** new_match.php — current matches. */
export function newMatch(uid: string) {
  return post<GoMeetResponse>('newMatch', { uid });
}
