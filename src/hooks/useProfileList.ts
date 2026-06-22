import { useEffect, useState, useCallback } from 'react';
import { likesMe, favourites, matches as fetchMatches } from '@/api/services';
import { Card, apiProfileToCard } from '@/data/models';
import { demoProfiles } from '@/data/demo';
import { useAuth } from '@/context/AuthContext';

export type ProfileListKind = 'likes' | 'matches' | 'favourites';

const loaders = {
  likes: likesMe,
  matches: fetchMatches,
  favourites,
};

/**
 * Loads a list of profiles (people who liked you / your matches / favourites)
 * from the gateway. Falls back to demo profiles for guests or offline so the
 * screens are never empty on Expo Go. `cards === null` means loading.
 */
export function useProfileList(kind: ProfileListKind) {
  const { user } = useAuth();
  const [cards, setCards] = useState<Card[] | null>(null);
  const [demo, setDemo] = useState(false);

  const load = useCallback(async () => {
    setCards(null);
    if (!user || user.isDemo || !user.id || user.id === 'demo') {
      setCards(demoProfiles);
      setDemo(true);
      return;
    }
    try {
      const res = await loaders[kind]();
      if (res.ok && Array.isArray(res.profiles)) {
        setCards(res.profiles.map(apiProfileToCard));
        setDemo(false);
      } else {
        setCards(demoProfiles);
        setDemo(true);
      }
    } catch {
      setCards(demoProfiles);
      setDemo(true);
    }
  }, [user, kind]);

  useEffect(() => {
    load();
  }, [load]);

  return { cards, loading: cards === null, demo, reload: load };
}
