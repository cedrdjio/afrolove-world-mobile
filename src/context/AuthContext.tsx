import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken } from '@/api/client';
import { login as apiLogin, register as apiRegister, forgotPassword as apiForgot, fetchMe, RegisterInput } from '@/api/services';
import { Account } from '@/data/models';

export interface SessionUser {
  id: string;
  name?: string;
  email?: string;
  mobile?: string;
  ccode?: string;
  profilePic?: string;
  lats?: string;
  longs?: string;
  coin?: string;
  isSubscribe?: boolean;
  isVerify?: string;
  bio?: string;
  isDemo?: boolean;
}

interface AuthValue {
  user: SessionUser | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  register: (input: RegisterInput) => Promise<{ ok: boolean; message?: string }>;
  resetPassword: (identifier: string, newPassword: string) => Promise<{ ok: boolean; message?: string }>;
  /** Re-fetch the current account from the gateway and update the session. */
  refreshUser: () => Promise<void>;
  loginDemo: () => Promise<void>;
  logout: () => Promise<void>;
}

const SESSION_KEY = '@afrilove/session';
const TOKEN_KEY = '@afrilove/token';
const AuthContext = createContext<AuthValue | undefined>(undefined);

function toSession(u: Account): SessionUser {
  return {
    id: String(u.id ?? ''),
    name: u.name,
    email: u.email,
    mobile: u.mobile,
    ccode: u.ccode,
    profilePic: u.profile_pic || u.images?.[0],
    lats: u.lats,
    longs: u.longs,
    coin: u.coin,
    isSubscribe: u.is_subscribe === '1',
    isVerify: u.is_verify,
    bio: u.profile_bio,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [rawUser, token] = await Promise.all([
          AsyncStorage.getItem(SESSION_KEY),
          AsyncStorage.getItem(TOKEN_KEY),
        ]);
        if (token) setAuthToken(token);
        if (rawUser) setUser(JSON.parse(rawUser));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persist = useCallback(async (u: SessionUser | null, token?: string | null) => {
    setUser(u);
    if (u) await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(u));
    else await AsyncStorage.removeItem(SESSION_KEY);
    if (token !== undefined) {
      setAuthToken(token);
      if (token) await AsyncStorage.setItem(TOKEN_KEY, token);
      else await AsyncStorage.removeItem(TOKEN_KEY);
    }
  }, []);

  const login = useCallback<AuthValue['login']>(async (identifier, password) => {
    try {
      const res = await apiLogin(identifier.trim(), password);
      if (res.ok && res.user) {
        await persist(toSession(res.user), res.token ?? null);
        return { ok: true };
      }
      return { ok: false, message: res.error ?? 'Invalid credentials' };
    } catch {
      // Backend unreachable → offline demo session keeps the app testable.
      await persist({ id: 'demo', name: identifier || 'Guest', mobile: identifier, isDemo: true }, null);
      return { ok: true, message: 'Offline demo session' };
    }
  }, [persist]);

  const register = useCallback<AuthValue['register']>(async (input) => {
    try {
      const res = await apiRegister(input);
      if (res.ok && res.user) {
        await persist(toSession(res.user), res.token ?? null);
        return { ok: true };
      }
      return { ok: false, message: res.error ?? 'Registration failed' };
    } catch {
      await persist({ id: 'demo', name: input.name || 'Guest', isDemo: true }, null);
      return { ok: true, message: 'Offline demo session' };
    }
  }, [persist]);

  const resetPassword = useCallback<AuthValue['resetPassword']>(async (identifier, newPassword) => {
    try {
      const res = await apiForgot(identifier.trim(), newPassword);
      return { ok: res.ok, message: res.error };
    } catch {
      return { ok: false, message: 'Network error' };
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetchMe();
      if (res.ok && res.user) {
        const next = toSession(res.user);
        setUser(next);
        await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(next));
      }
    } catch {
      /* keep current session */
    }
  }, []);

  const loginDemo = useCallback(async () => {
    await persist({ id: 'demo', name: 'Guest', isDemo: true }, null);
  }, [persist]);

  const logout = useCallback(async () => {
    await persist(null, null);
  }, [persist]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, resetPassword, refreshUser, loginDemo, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
