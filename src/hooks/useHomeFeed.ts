import { useCallback, useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { home, like as apiLike } from '@/api/services';
import { Card, apiProfileToCard } from '@/data/models';
import { demoProfiles } from '@/data/demo';
import { useAuth } from '@/context/AuthContext';

export type FeedStatus = 'loading' | 'live' | 'demo' | 'error';

interface FeedState {
  cards: Card[];
  status: FeedStatus;
  currency?: string;
  coin?: string;
  reload: () => void;
  like: (targetId: string, action: 'like' | 'dislike' | 'superlike') => void;
}

/**
 * Loads the discovery feed from the Edge Function `/home` route for the logged-in
 * user, resolving the device location for lats/longs. Falls back to demo profiles
 * for guests or when the backend is unreachable, so the deck always has cards.
 */
export function useHomeFeed(): FeedState {
  const { user } = useAuth();
  const [cards, setCards] = useState<Card[]>([]);
  const [status, setStatus] = useState<FeedStatus>('loading');
  const [currency, setCurrency] = useState<string>();
  const [coin, setCoin] = useState<string>();

  const load = useCallback(async () => {
    setStatus('loading');

    if (!user || user.isDemo || !user.id || user.id === 'demo') {
      setCards(demoProfiles);
      setStatus('demo');
      return;
    }

    try {
      let lats: number | string | undefined = user.lats;
      let longs: number | string | undefined = user.longs;
      try {
        const { status: perm } = await Location.requestForegroundPermissionsAsync();
        if (perm === 'granted') {
          const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          lats = pos.coords.latitude;
          longs = pos.coords.longitude;
        }
      } catch {
        /* keep stored coords */
      }

      const res = await home(lats, longs);
      if (res.ok && Array.isArray(res.profiles)) {
        setCurrency(res.currency);
        setCoin(res.coin);
        setCards(res.profiles.map(apiProfileToCard));
        setStatus('live');
      } else {
        setCards(demoProfiles);
        setStatus('demo');
      }
    } catch {
      setCards(demoProfiles);
      setStatus('demo');
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const like = useCallback(
    (targetId: string, action: 'like' | 'dislike' | 'superlike') => {
      if (!user || user.isDemo || !user.id || user.id === 'demo') return;
      apiLike(targetId, action).catch(() => {});
    },
    [user]
  );

  return { cards, status, currency, coin, reload: load, like };
}
