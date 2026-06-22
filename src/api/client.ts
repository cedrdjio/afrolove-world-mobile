/**
 * API client — port of lib/core/api.dart (Dio → axios).
 * Talks the GoMeet `*.php` REST contract defined in src/config/config.ts.
 */
import axios, { AxiosInstance } from 'axios';
import { Config, Endpoint } from '@/config/config';

const instance: AxiosInstance = axios.create({
  baseURL: Config.baseUrlApi,
  headers: Config.header,
  timeout: 20000,
});

if (__DEV__) {
  instance.interceptors.request.use((cfg) => {
    console.log('[API →]', cfg.method?.toUpperCase(), cfg.url, cfg.data ?? '');
    return cfg;
  });
  instance.interceptors.response.use(
    (res) => {
      console.log('[API ←]', res.config.url, res.data?.ResponseCode ?? res.status);
      return res;
    },
    (err) => {
      console.log('[API ✗]', err.config?.url, err.message);
      return Promise.reject(err);
    }
  );
}

/** POST a GoMeet endpoint. Returns parsed JSON body (ResponseCode/Result/...). */
export async function post<T = any>(endpoint: Endpoint, body: Record<string, unknown> = {}): Promise<T> {
  const path = Config.endpoints[endpoint];
  const res = await instance.post<T>(path, body);
  return res.data;
}

/** GET a GoMeet endpoint. */
export async function get<T = any>(endpoint: Endpoint, params?: Record<string, unknown>): Promise<T> {
  const path = Config.endpoints[endpoint];
  const res = await instance.get<T>(path, { params });
  return res.data;
}

export interface GoMeetResponse {
  ResponseCode?: string;
  Result?: string;
  ResponseMsg?: string;
  [key: string]: unknown;
}

export const isOk = (r?: GoMeetResponse) => r?.Result === 'true' || r?.ResponseCode === '200';

export default instance;
