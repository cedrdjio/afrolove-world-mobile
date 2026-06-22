/**
 * API client for the AfriLove Supabase Edge Function gateway.
 *
 * Every call carries the publishable key (gateway auth) and, once logged in, a
 * signed session token in `x-session-token` (the function derives the user from
 * it). Responses use the clean envelope `{ ok, ...data }` / `{ ok, error }`.
 */
import { API_BASE, SUPABASE_PUBLISHABLE_KEY } from '@/config/supabase';

export interface ApiResult {
  ok: boolean;
  error?: string;
  [key: string]: unknown;
}

let authToken: string | null = null;

/** Set/clear the session token used for authenticated routes. */
export function setAuthToken(token: string | null) {
  authToken = token;
}

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';

async function call<T extends ApiResult = ApiResult>(
  method: Method,
  route: string,
  body?: Record<string, unknown> | FormData,
  isForm = false
): Promise<T> {
  const headers: Record<string, string> = {
    apikey: SUPABASE_PUBLISHABLE_KEY,
    Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
  };
  if (authToken) headers['x-session-token'] = authToken;

  let payload: BodyInit | undefined;
  if (isForm) {
    payload = body as FormData; // let fetch set the multipart boundary
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  if (__DEV__) console.log('[api →]', method, route, isForm ? '(form)' : body ?? '');
  const res = await fetch(`${API_BASE}/${route}`, { method, headers, body: payload });
  const data = (await res.json().catch(() => ({ ok: false, error: 'Bad response' }))) as T;
  if (__DEV__) console.log('[api ←]', route, data.ok ? 'ok' : data.error);
  return data;
}

export const api = {
  get: <T extends ApiResult = ApiResult>(route: string) => call<T>('GET', route),
  post: <T extends ApiResult = ApiResult>(route: string, body?: Record<string, unknown>) => call<T>('POST', route, body),
  patch: <T extends ApiResult = ApiResult>(route: string, body?: Record<string, unknown>) => call<T>('PATCH', route, body),
  del: <T extends ApiResult = ApiResult>(route: string) => call<T>('DELETE', route),
  postForm: <T extends ApiResult = ApiResult>(route: string, form: FormData) => call<T>('POST', route, form, true),
  patchForm: <T extends ApiResult = ApiResult>(route: string, form: FormData) => call<T>('PATCH', route, form, true),
};
