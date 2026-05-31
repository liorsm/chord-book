import { useCallback, useEffect, useState } from 'react';
import { MIN_SEMITONES, MAX_SEMITONES } from '../config/songPreferences';
import { getSongSemitones, setSongSemitones } from '../utils/songPreferences';

function clampSemitones(value) {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n)) return 0;
  return Math.max(MIN_SEMITONES, Math.min(MAX_SEMITONES, n));
}

export function useSongTranspose(slug) {
  const [semitones, setSemitonesState] = useState(() =>
    slug ? getSongSemitones(slug) : 0
  );

  useEffect(() => {
    if (slug) setSemitonesState(getSongSemitones(slug));
    else setSemitonesState(0);
  }, [slug]);

  const setSemitones = useCallback(
    (next) => {
      setSemitonesState((prev) => {
        const value = typeof next === 'function' ? next(prev) : next;
        const clamped = clampSemitones(value);
        if (slug) setSongSemitones(slug, clamped);
        return clamped;
      });
    },
    [slug]
  );

  return [semitones, setSemitones];
}
