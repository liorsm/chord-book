import {
  collection,
  doc,
  getDoc,
  addDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

export const BACKUP_VERSION = 1;

function normalizeSongKey(title, artist) {
  return `${String(title || '').trim().toLowerCase()}|${String(artist || '').trim().toLowerCase()}`;
}

function normalizePlaylistKey(name) {
  return String(name || '').trim().toLowerCase();
}

function serializeTimestamp(value) {
  if (!value) return null;
  if (typeof value.toDate === 'function') {
    return value.toDate().toISOString();
  }
  if (typeof value === 'object' && value.seconds != null) {
    return new Date(value.seconds * 1000).toISOString();
  }
  if (typeof value === 'string') return value;
  return null;
}

function serializeSong(song) {
  return {
    id: song.id,
    title: song.title,
    artist: song.artist,
    content: song.content,
    slug: song.slug ?? null,
    language: song.language ?? 'he',
    artistImageUrl: song.artistImageUrl ?? null,
    artistImagePositionY: song.artistImagePositionY ?? null,
    youtubeUrl: song.youtubeUrl ?? null,
    userId: song.userId ?? null,
    createdAt: serializeTimestamp(song.createdAt),
    updatedAt: serializeTimestamp(song.updatedAt),
  };
}

function serializePlaylist(playlist) {
  return {
    id: playlist.id,
    name: playlist.name,
    slug: playlist.slug ?? null,
    songIds: [...(playlist.songIds || [])],
    coverColor: playlist.coverColor ?? null,
    coverImageUrl: playlist.coverImageUrl ?? null,
    sortOrder: playlist.sortOrder ?? null,
    userId: playlist.userId ?? null,
    createdAt: serializeTimestamp(playlist.createdAt),
    updatedAt: serializeTimestamp(playlist.updatedAt),
  };
}

export function buildBackupExport(songs, playlists) {
  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    songs: songs.map(serializeSong),
    playlists: playlists.map(serializePlaylist),
  };
}

export function downloadBackupFile(backup) {
  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const stamp = new Date().toISOString().slice(0, 10);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `chordbook-backup-${stamp}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function parseBackupFile(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('קובץ הגיבוי אינו JSON תקין');
  }
  if (!data || typeof data !== 'object') {
    throw new Error('מבנה הגיבוי לא תקין');
  }
  if (!Array.isArray(data.songs) || !Array.isArray(data.playlists)) {
    throw new Error('הגיבוי חייב לכלול מערכי songs ו-playlists');
  }
  return data;
}

function findExistingSong(existingSongs, candidate) {
  if (candidate.id) {
    const byId = existingSongs.find((s) => s.id === candidate.id);
    if (byId) return byId;
  }
  if (candidate.slug) {
    const bySlug = existingSongs.find((s) => s.slug === candidate.slug);
    if (bySlug) return bySlug;
  }
  const key = normalizeSongKey(candidate.title, candidate.artist);
  if (!key || key === '|') return undefined;
  return existingSongs.find(
    (s) => normalizeSongKey(s.title, s.artist) === key
  );
}

function findExistingPlaylist(existingPlaylists, candidate) {
  if (candidate.id) {
    const byId = existingPlaylists.find((p) => p.id === candidate.id);
    if (byId) return byId;
  }
  if (candidate.slug) {
    const bySlug = existingPlaylists.find((p) => p.slug === candidate.slug);
    if (bySlug) return bySlug;
  }
  const key = normalizePlaylistKey(candidate.name);
  if (!key) return undefined;
  return existingPlaylists.find((p) => normalizePlaylistKey(p.name) === key);
}

function songPayload(raw, userId) {
  return {
    title: String(raw.title || '').trim(),
    artist: String(raw.artist || '').trim(),
    content: String(raw.content || '').trim(),
    slug: raw.slug || null,
    language: raw.language || 'he',
    artistImageUrl: raw.artistImageUrl || null,
    artistImagePositionY: raw.artistImagePositionY ?? null,
    youtubeUrl: raw.youtubeUrl || null,
    userId: userId || raw.userId || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

function playlistPayload(raw, songIds, userId) {
  return {
    name: String(raw.name || '').trim(),
    slug: raw.slug || null,
    songIds,
    coverColor: raw.coverColor || null,
    coverImageUrl: raw.coverImageUrl || null,
    sortOrder: raw.sortOrder ?? null,
    userId: userId || raw.userId || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

async function writeNewSong(raw, userId) {
  const payload = songPayload(raw, userId);
  if (!payload.title) {
    throw new Error('שיר בגיבוי ללא כותרת');
  }

  if (raw.id) {
    const ref = doc(db, 'songs', raw.id);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, payload);
      return raw.id;
    }
  }

  const ref = await addDoc(collection(db, 'songs'), payload);
  return ref.id;
}

async function writeNewPlaylist(raw, songIds, userId) {
  const payload = playlistPayload(raw, songIds, userId);
  if (!payload.name) {
    throw new Error('פלייליסט בגיבוי ללא שם');
  }

  if (raw.id) {
    const ref = doc(db, 'playlists', raw.id);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, payload);
      return raw.id;
    }
  }

  const ref = await addDoc(collection(db, 'playlists'), payload);
  return ref.id;
}

/**
 * מייבא גיבוי — מדלג על שירים/פלייליסטים שכבר קיימים (לפי id, slug או שם).
 */
export async function importBackupToFirestore(
  backup,
  { existingSongs, existingPlaylists, userId }
) {
  const songsKnown = [...existingSongs];
  const playlistsKnown = [...existingPlaylists];
  const songIdMap = new Map();
  let songsAdded = 0;
  let songsSkipped = 0;
  let playlistsAdded = 0;
  let playlistsSkipped = 0;

  for (const rawSong of backup.songs) {
    const existing = findExistingSong(songsKnown, rawSong);
    if (existing) {
      if (rawSong.id) songIdMap.set(rawSong.id, existing.id);
      songsSkipped += 1;
      continue;
    }

    const newId = await writeNewSong(rawSong, userId);
    if (rawSong.id) songIdMap.set(rawSong.id, newId);
    songIdMap.set(newId, newId);
    songsKnown.push({ ...rawSong, id: newId });
    songsAdded += 1;
  }

  for (const rawPlaylist of backup.playlists) {
    const existing = findExistingPlaylist(playlistsKnown, rawPlaylist);
    if (existing) {
      playlistsSkipped += 1;
      continue;
    }

    const songIds = (rawPlaylist.songIds || [])
      .map((sid) => songIdMap.get(sid) || songsKnown.find((s) => s.id === sid)?.id)
      .filter(Boolean);
    const uniqueSongIds = [...new Set(songIds)];

    const newId = await writeNewPlaylist(rawPlaylist, uniqueSongIds, userId);
    playlistsKnown.push({ ...rawPlaylist, id: newId });
    playlistsAdded += 1;
  }

  return { songsAdded, songsSkipped, playlistsAdded, playlistsSkipped };
}
