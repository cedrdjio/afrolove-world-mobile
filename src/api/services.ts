/**
 * Typed service wrappers over the AfriLove Edge Function routes.
 * All paths are clean and RESTful — no legacy contract.
 */
import { api, ApiResult } from './client';
import { Account, ApiProfile } from '@/data/models';

// ── Bootstrap / config ──────────────────────────────────────────────
export interface ConfigResult extends ApiResult {
  settings: Record<string, string>;
  interests: { id: string; title: string; img: string }[];
  languages: { id: string; title: string; img: string }[];
  religions: { id: string; title: string }[];
  goals: { id: string; title: string; subtitle: string }[];
  plans: Record<string, string>[];
}
export const getConfig = () => api.get<ConfigResult>('config');

// ── Auth ────────────────────────────────────────────────────────────
interface AuthResult extends ApiResult {
  user?: Account;
  token?: string;
}

export interface RegisterInput {
  name: string;
  email?: string;
  mobile?: string;
  ccode?: string;
  password: string;
  gender?: string;
  birth_date?: string;
  search_preference?: string;
  relation_goal?: string | number;
  interest?: string;
  language?: string;
  religion?: string | number;
  profile_bio?: string;
  lats?: number;
  longs?: number;
}

export const checkMobile = (mobile: string, ccode: string) =>
  api.post<{ ok: boolean; exists: boolean }>('auth/check-mobile', { mobile, ccode });

export const login = (identifier: string, password: string) =>
  api.post<AuthResult>('auth/login', { identifier, password });

export const register = (input: RegisterInput) =>
  api.post<AuthResult>('auth/register', { ...input });

export const forgotPassword = (identifier: string, password: string) =>
  api.post<AuthResult>('auth/forgot', { identifier, password });

export const fetchMe = () => api.get<AuthResult>('me');

// ── Discovery / matches ─────────────────────────────────────────────
interface ProfilesResult extends ApiResult {
  profiles: ApiProfile[];
}
export interface HomeResult extends ProfilesResult {
  currency: string;
  coin: string;
  plan_name: string;
  plan_id: string;
  is_subscribe: string;
  is_verify: string;
  flags: Record<string, string>;
}

export const home = (lats?: number | string, longs?: number | string) =>
  api.post<HomeResult>('home', { lats, longs });

export const like = (targetId: string | number, type: 'like' | 'dislike' | 'superlike') =>
  api.post<{ ok: boolean; matched: boolean }>('like', { target_id: targetId, type });

export const likesMe = () => api.post<ProfilesResult>('likes-me', {});
export const favourites = () => api.post<ProfilesResult>('favourites', {});
export const matches = () => api.post<ProfilesResult>('matches', {});

export const profile = (id: string | number, lats?: number | string, longs?: number | string) =>
  api.post<ApiResult>('profile', { profile_id: id, lats, longs });

export const block = (targetId: string | number) => api.post('block', { target_id: targetId });
export const report = (targetId: string | number, comment: string) =>
  api.post('report', { target_id: targetId, comment });

// ── Money / catalog ─────────────────────────────────────────────────
export const getPlans = () => api.get('plans');
export const getPaymentGateways = () => api.get('payment-gateways');
export const getPackages = () => api.get('packages');
export const getGifts = () => api.get('gifts');
export const purchasePlan = (planId: string | number, method: string, transactionId: string) =>
  api.post('plan/purchase', { plan_id: planId, method, transaction_id: transactionId });
export const walletReport = () => api.post('wallet/report', {});
export const coinReport = () => api.post('coin/report', {});

// ── Misc ────────────────────────────────────────────────────────────
export const getNotifications = () => api.post('notifications', {});
export const getFaq = () => api.get('faq');
export const getPages = () => api.get('pages');
export const referral = () => api.post('referral', {});
