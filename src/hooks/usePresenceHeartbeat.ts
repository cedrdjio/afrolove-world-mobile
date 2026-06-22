import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { setPresence } from '@/firebase/presence';
import { useAuth } from '@/context/AuthContext';

/**
 * Keeps the logged-in user's online presence fresh while the app is in the
 * foreground (heartbeat every 30s) and flips to offline on background/unmount.
 */
export function usePresenceHeartbeat() {
  const { user } = useAuth();
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const uid = user?.id;
    if (!uid || user?.isDemo) return;

    const goOnline = () => {
      setPresence(uid, true);
      if (!timer.current) timer.current = setInterval(() => setPresence(uid, true), 30_000);
    };
    const goOffline = () => {
      if (timer.current) { clearInterval(timer.current); timer.current = null; }
      setPresence(uid, false);
    };

    goOnline();
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') goOnline();
      else goOffline();
    });

    return () => {
      sub.remove();
      goOffline();
    };
  }, [user?.id, user?.isDemo]);
}
