import { useCallback, useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { homeData, likeDislike } from '@/api/services';
import { isOk } from '@/api/client';
import { Card, profileToCard } from '@/data/models';
import { demoProfiles } from '@/data/demo';
import { useAuth } from '@/context/AuthContext';

export type FeedStatus = 'loading' | 'live' | 'demo' | 'error';

interface FeedState {
  cards: Card[];
  status: FeedStatus;
  currency?: string;
  coin?: string;
  reload: () => void;
  like: (profileId: string, action: 'like' | 'dislike' | 'superlike') => void;
}

/**
 * Loads the discovery feed from home_data.php for the logged-in user, resolving
 * the device location for lats/longs. Falls back to demo profiles when the user
 * is a guest or the API is unreachable, so the deck always has cards on Expo Go.
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
      let lats = user.lats ?? '0';
      let longs = user.longs ?? '0';
      try {
        const { status: perm } = await Location.requestForegroundPermissionsAsync();
        if (perm === 'granted') {
          const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          lats = String(pos.coords.latitude);
          longs = String(pos.coords.longitude);
        }
      } catch {
        /* keep stored / default coords */
      }

      const res = await homeData(user.id, lats, longs);
      if (isOk(res) && res.profilelist) {
        setCurrency(res.currency);
        setCoin(res.coin);
        setCards(res.profilelist.map(profileToCard));
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
    (profileId: string, action: 'like' | 'dislike' | 'superlike') => {
      if (!user || user.isDemo || !user.id || user.id === 'demo') return;
      likeDislike(user.id, profileId, action).catch(() => {});
    },
    [user]
  );

  return { cards, status, currency, coin, reload: load, like };
}
