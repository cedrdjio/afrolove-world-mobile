import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { post, isOk, GoMeetResponse } from '@/api/client';

export interface SessionUser {
  id: string;
  name?: string;
  email?: string;
  mobile?: string;
  profilePic?: string;
}

interface AuthValue {
  user: SessionUser | null;
  loading: boolean;
  /** Logs in against user_login.php. Falls back to a demo session if the API
   * is unreachable, so the app stays testable on Expo Go. */
  login: (identifier: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  loginDemo: () => Promise<void>;
  logout: () => Promise<void>;
}

const STORAGE_KEY = '@afrilove/session';
const AuthContext = createContext<AuthValue | undefined>(undefined);

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

  const login = useCallback<AuthValue['login']>(async (identifier, password) => {
    try {
      const res = await post<GoMeetResponse>('userLogin', { mobile: identifier, password });
      if (isOk(res)) {
        const login = (res as any).UserLogin ?? {};
        await persist({
          id: String(login.id ?? ''),
          name: login.name,
          email: login.email,
          mobile: login.mobile,
          profilePic: login.profile_pic,
        });
        return { ok: true };
      }
      return { ok: false, message: res.ResponseMsg ?? 'Invalid credentials' };
    } catch (e) {
      // API unreachable on Expo Go → graceful demo session.
      await persist({ id: 'demo', name: identifier || 'Guest', mobile: identifier });
      return { ok: true, message: 'Offline demo session' };
    }
  }, [persist]);

  const loginDemo = useCallback(async () => {
    await persist({ id: 'demo', name: 'Guest' });
  }, [persist]);

  const logout = useCallback(async () => {
    await persist(null);
  }, [persist]);

  return (
    <AuthContext.Provider value={{ user, loading, login, loginDemo, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
