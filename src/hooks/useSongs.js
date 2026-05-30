import { useCallback, useEffect, useState } from 'react';
import {
  collection,
  query,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { detectLanguage } from '../utils/direction';
import { generateSongSlug, resolveUniqueSlug } from '../utils/slug';
import { normalizeArtistKey } from '../utils/artists';

function buildArtistImageFields(artistImageUrl, artistImagePositionY) {
  const url = artistImageUrl || null;
  return {
    artistImageUrl: url,
    artistImagePositionY:
      url && artistImagePositionY != null ? artistImagePositionY : null,
  };
}

async function syncArtistImageToSongs(
  songs,
  artistName,
  artistImageUrl,
  artistImagePositionY,
  excludeSongId = null
) {
  const key = normalizeArtistKey(artistName);
  if (!key) return;

  const imageFields = buildArtistImageFields(artistImageUrl, artistImagePositionY);
  const others = songs.filter(
    (s) => normalizeArtistKey(s.artist) === key && s.id !== excludeSongId
  );
  if (others.length === 0) return;

  const batch = writeBatch(db);
  for (const s of others) {
    batch.update(doc(db, 'songs', s.id), {
      ...imageFields,
      updatedAt: serverTimestamp(),
    });
  }
  await batch.commit();
}

function assignSlugsToSongs(docs) {
  const taken = new Set();
  return docs.map((d) => {
    const data = d.data();
    let slug = data.slug;
    if (!slug) {
      const base = generateSongSlug(data.title, data.artist);
      slug = resolveUniqueSlug(base, taken);
    }
    taken.add(slug);
    return {
      id: d.id,
      isFavorite: false,
      language: 'he',
      artistImageUrl: null,
      youtubeUrl: null,
      ...data,
      slug: data.slug || slug,
    };
  });
}

export function useSongs() {
  const { userId, isAdmin, loading: authLoading } = useAuth();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadSongs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const q = query(collection(db, 'songs'), orderBy('updatedAt', 'desc'));
      const snap = await getDocs(q);
      const list = assignSlugsToSongs(snap.docs);

      if (isAdmin) {
        await Promise.all(
          snap.docs.map(async (d, i) => {
            if (!d.data().slug && list[i]?.slug) {
              try {
                await updateDoc(doc(db, 'songs', d.id), { slug: list[i].slug });
              } catch {
                // ignore
              }
            }
          })
        );
      }

      setSongs(list);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!authLoading) {
      loadSongs();
    }
  }, [authLoading, loadSongs]);

  const requireAdmin = () => {
    if (!isAdmin || !userId) {
      throw new Error('נדרשת התחברות מנהל');
    }
  };

  const buildUniqueSongSlug = (title, artist, excludeSongId = null) => {
    const excludeSlug = excludeSongId
      ? songs.find((s) => s.id === excludeSongId)?.slug
      : null;
    const taken = songs
      .filter((s) => s.id !== excludeSongId)
      .map((s) => s.slug)
      .filter(Boolean);
    const base = generateSongSlug(title, artist);
    return resolveUniqueSlug(base, taken, excludeSlug);
  };

  const addSong = async ({
    title,
    artist,
    content,
    artistImageUrl,
    artistImagePositionY,
    youtubeUrl,
  }) => {
    requireAdmin();
    const language = detectLanguage(content + title + artist);
    const slug = buildUniqueSongSlug(title, artist);
    const newSong = {
      title: title.trim(),
      artist: artist.trim(),
      content: content.trim(),
      artistImageUrl: artistImageUrl || null,
      artistImagePositionY:
        artistImageUrl && artistImagePositionY != null
          ? artistImagePositionY
          : null,
      youtubeUrl: youtubeUrl || null,
      language,
      slug,
      userId,
      isFavorite: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const ref = await addDoc(collection(db, 'songs'), newSong);
    if (artistImageUrl) {
      await syncArtistImageToSongs(
        songs,
        artist.trim(),
        artistImageUrl,
        artistImagePositionY,
        ref.id
      );
    }
    await loadSongs();
    return { id: ref.id, ...newSong, slug };
  };

  const updateSong = async (id, data) => {
    requireAdmin();
    const payload = { ...data, updatedAt: serverTimestamp() };
    if (data.title !== undefined || data.artist !== undefined) {
      const song = songs.find((s) => s.id === id);
      const title = data.title ?? song?.title;
      const artist = data.artist ?? song?.artist;
      payload.slug = buildUniqueSongSlug(title, artist, id);
      payload.language = detectLanguage(
        (data.content ?? song?.content ?? '') + title + artist
      );
    }
    if (data.content !== undefined && data.title === undefined) {
      const song = songs.find((s) => s.id === id);
      payload.language = detectLanguage(
        data.content + (song?.title || '') + (song?.artist || '')
      );
    }
    await updateDoc(doc(db, 'songs', id), payload);

    const imageFieldsChanged =
      'artistImageUrl' in data || 'artistImagePositionY' in data;
    if (imageFieldsChanged) {
      const song = songs.find((s) => s.id === id);
      const artistName = (data.artist ?? song?.artist)?.trim();
      const url =
        'artistImageUrl' in data ? data.artistImageUrl : song?.artistImageUrl;
      const positionY =
        'artistImagePositionY' in data
          ? data.artistImagePositionY
          : song?.artistImagePositionY;
      await syncArtistImageToSongs(songs, artistName, url, positionY, id);
    }

    await loadSongs();
    return payload.slug ?? songs.find((s) => s.id === id)?.slug;
  };

  const deleteSong = async (id) => {
    requireAdmin();
    await deleteDoc(doc(db, 'songs', id));
    await loadSongs();
  };

  const toggleFavorite = async (id) => {
    requireAdmin();
    const song = songs.find((s) => s.id === id);
    if (!song) return;
    await updateSong(id, { isFavorite: !song.isFavorite });
  };

  const getSongById = (id) => songs.find((s) => s.id === id);

  const getSongBySlug = (slugOrId) => {
    if (!slugOrId) return undefined;
    const decoded = decodeURIComponent(slugOrId);
    return (
      songs.find((s) => s.slug === decoded) ||
      songs.find((s) => s.id === decoded) ||
      songs.find((s) => s.slug === slugOrId) ||
      songs.find((s) => s.id === slugOrId)
    );
  };

  const favoriteSongs = songs.filter((s) => s.isFavorite);

  return {
    songs,
    favoriteSongs,
    loading: loading || authLoading,
    error,
    loadSongs,
    addSong,
    updateSong,
    deleteSong,
    toggleFavorite,
    getSongById,
    getSongBySlug,
    isAdmin,
  };
}
