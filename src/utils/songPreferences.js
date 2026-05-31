import {
  SONG_PREFS_STORAGE_KEY,
  SONG_PREFS_VERSION,
  MIN_SEMITONES,
  MAX_SEMITONES,
} from '../config/songPreferences';

function emptyPrefs() {
  return { version: SONG_PREFS_VERSION, songs: {} };
}

function clampSemitones(value) {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n)) return 0;
  return Math.max(MIN_SEMITONES, Math.min(MAX_SEMITONES, n));
}

export function loadPrefs() {
  try {
    const raw = localStorage.getItem(SONG_PREFS_STORAGE_KEY);
    if (!raw) return emptyPrefs();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !parsed.songs) {
      return emptyPrefs();
    }
    return {
      version: SONG_PREFS_VERSION,
      songs: typeof parsed.songs === 'object' ? parsed.songs : {},
    };
  } catch {
    return emptyPrefs();
  }
}

function savePrefs(prefs) {
  try {
    localStorage.setItem(SONG_PREFS_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // localStorage unavailable — ignore
  }
}

export function getSongSemitones(slug) {
  if (!slug) return 0;
  const prefs = loadPrefs();
  const entry = prefs.songs[slug];
  if (!entry || entry.semitones == null) return 0;
  return clampSemitones(entry.semitones);
}

export function setSongSemitones(slug, semitones) {
  if (!slug) return;
  const prefs = loadPrefs();
  const clamped = clampSemitones(semitones);
  if (clamped === 0) {
    const { [slug]: _removed, ...rest } = prefs.songs;
    savePrefs({ ...prefs, songs: rest });
    return;
  }
  savePrefs({
    ...prefs,
    songs: { ...prefs.songs, [slug]: { semitones: clamped } },
  });
}
