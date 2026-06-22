import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isOk } from '@/api/client';
import { userLogin, forgetPassword } from '@/api/services';
import { UserLogin } from '@/data/models';

export interface SessionUser {
  id: string;
  name?: string;
  email?: string;
  mobile?: string;
  ccode?: string;
  profilePic?: string;
  lats?: string;
  longs?: string;
  isDemo?: boolean;
}

interface AuthValue {
  user: SessionUser | null;
  loading: boolean;
  /** Logs in against user_login.php. Falls back to a demo session if the API
   * is unreachable, so the app stays testable on Expo Go. */
  login: (identifier: string, password: string, ccode?: string) => Promise<{ ok: boolean; message?: string }>;
  resetPassword: (mobile: string, newPassword: string, ccode?: string) => Promise<{ ok: boolean; message?: string }>;
  loginDemo: () => Promise<void>;
  logout: () => Promise<void>;
}

const STORAGE_KEY = '@afrilove/session';
const AuthContext = createContext<AuthValue | undefined>(undefined);

function toSession(u: UserLogin, demo = false): SessionUser {
  return {
    id: String(u.id ?? ''),
    name: u.name,
    email: u.email,
    mobile: u.mobile,
    ccode: u.ccode,
    profilePic: (u.profile_pic ?? u.other_pic ?? '')?.toString().split('$;')[0] || undefined,
    lats: u.lats,
    longs: u.longs,
    isDemo: demo,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setUser(JSON.parse(raw));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persist = useCallback(async (u: SessionUser | null) => {
    setUser(u);
    if (u) await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    else await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  const login = useCallback<AuthValue['login']>(async (identifier, password, ccode = '') => {
    try {
      const res = await userLogin(identifier, password, ccode);
      if (isOk(res) && res.UserLogin) {
        await persist(toSession(res.UserLogin));
        return { ok: true };
      }
      return { ok: false, message: res.ResponseMsg ?? 'Invalid credentials' };
    } catch {
      // API unreachable on Expo Go → graceful demo session.
      await persist({ id: 'demo', name: identifier || 'Guest', mobile: identifier, isDemo: true });
      return { ok: true, message: 'Offline demo session' };
    }
  }, [persist]);

  const resetPassword = useCallback<AuthValue['resetPassword']>(async (mobile, newPassword, ccode = '') => {
    try {
      const res = await forgetPassword(mobile, newPassword, ccode);
      return { ok: isOk(res), message: res.ResponseMsg };
    } catch {
      return { ok: false, message: 'Network error' };
    }
  }, []);

  const loginDemo = useCallback(async () => {
    await persist({ id: 'demo', name: 'Guest', isDemo: true });
  }, [persist]);

  const logout = useCallback(async () => {
    await persist(null);
  }, [persist]);

  return (
    <AuthContext.Provider value={{ user, loading, login, resetPassword, loginDemo, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
