import { useCallback, useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import {
  GRADIENT_PALETTES,
  resolvePlaylistCoverColor,
} from '../utils/artistImage';
import { generatePlaylistSlug, resolveUniqueSlug } from '../utils/slug';

function assignSlugsToPlaylists(docs) {
  const taken = new Set();
  return docs.map((d) => {
    const data = d.data();
    let slug = data.slug;
    if (!slug) {
      const base = generatePlaylistSlug(data.name);
      slug = resolveUniqueSlug(base, taken);
    }
    taken.add(slug);
    return {
      id: d.id,
      songIds: [],
      ...data,
      slug: data.slug || slug,
      coverColor: resolvePlaylistCoverColor(data.coverColor, data.name || d.id),
    };
  });
}

export function usePlaylists() {
  const { userId, isAdmin, loading: authLoading } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadPlaylists = useCallback(async () => {
    if (!isAdmin || !userId) {
      setPlaylists([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const q = query(collection(db, 'playlists'), where('userId', '==', userId));
      const snap = await getDocs(q);
      const list = assignSlugsToPlaylists(snap.docs);

      await Promise.all(
        snap.docs.map(async (d, i) => {
          if (!d.data().slug && list[i]?.slug) {
            try {
              await updateDoc(doc(db, 'playlists', d.id), { slug: list[i].slug });
            } catch {
              // ignore
            }
          }
        })
      );

      list.sort((a, b) => {
        const ta = a.createdAt?.seconds || 0;
        const tb = b.createdAt?.seconds || 0;
        return tb - ta;
      });
      setPlaylists(list);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, userId]);

  useEffect(() => {
    if (!authLoading) {
      loadPlaylists();
    }
  }, [authLoading, loadPlaylists]);

  const requireAdmin = () => {
    if (!isAdmin || !userId) {
      throw new Error('נדרשת התחברות מנהל');
    }
  };

  const buildUniquePlaylistSlug = (name, excludePlaylistId = null) => {
    const excludeSlug = excludePlaylistId
      ? playlists.find((p) => p.id === excludePlaylistId)?.slug
      : null;
    const taken = playlists
      .filter((p) => p.id !== excludePlaylistId)
      .map((p) => p.slug)
      .filter(Boolean);
    return resolveUniqueSlug(generatePlaylistSlug(name), taken, excludeSlug);
  };

  const createPlaylist = async (name) => {
    requireAdmin();
    const coverColor =
      GRADIENT_PALETTES[Math.floor(Math.random() * GRADIENT_PALETTES.length)];
    const slug = buildUniquePlaylistSlug(name);
    const ref = await addDoc(collection(db, 'playlists'), {
      name: name.trim(),
      slug,
      userId,
      songIds: [],
      coverColor,
      createdAt: serverTimestamp(),
    });
    await loadPlaylists();
    return ref.id;
  };

  const updatePlaylist = async (id, data) => {
    requireAdmin();
    const payload = { ...data };
    if (data.name !== undefined) {
      payload.slug = buildUniquePlaylistSlug(data.name, id);
    }
    await updateDoc(doc(db, 'playlists', id), payload);
    await loadPlaylists();
  };

  const deletePlaylist = async (id) => {
    requireAdmin();
    await deleteDoc(doc(db, 'playlists', id));
    await loadPlaylists();
  };

  const addSongToPlaylist = async (playlistId, songId) => {
    requireAdmin();
    const playlist = playlists.find((p) => p.id === playlistId);
    if (!playlist || playlist.songIds?.includes(songId)) return;
    const songIds = [...(playlist.songIds || []), songId];
    await updatePlaylist(playlistId, { songIds });
  };

  const removeSongFromPlaylist = async (playlistId, songId) => {
    requireAdmin();
    const playlist = playlists.find((p) => p.id === playlistId);
    if (!playlist) return;
    const songIds = (playlist.songIds || []).filter((sid) => sid !== songId);
    await updatePlaylist(playlistId, { songIds });
  };

  const reorderPlaylistSongs = async (playlistId, songIds) => {
    requireAdmin();
    await updatePlaylist(playlistId, { songIds });
  };

  const moveSongInPlaylist = async (playlistId, fromIndex, direction) => {
    requireAdmin();
    const playlist = playlists.find((p) => p.id === playlistId);
    if (!playlist) return;
    const ids = [...(playlist.songIds || [])];
    const toIndex = fromIndex + direction;
    if (toIndex < 0 || toIndex >= ids.length) return;
    const [item] = ids.splice(fromIndex, 1);
    ids.splice(toIndex, 0, item);
    await reorderPlaylistSongs(playlistId, ids);
  };

  const getPlaylistById = (id) => playlists.find((p) => p.id === id);

  const getPlaylistBySlug = (slugOrId) => {
    if (!slugOrId) return undefined;
    const decoded = decodeURIComponent(slugOrId);
    return (
      playlists.find((p) => p.slug === decoded) ||
      playlists.find((p) => p.id === decoded) ||
      playlists.find((p) => p.slug === slugOrId) ||
      playlists.find((p) => p.id === slugOrId)
    );
  };

  return {
    playlists,
    loading: loading || authLoading,
    error,
    loadPlaylists,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
    reorderPlaylistSongs,
    moveSongInPlaylist,
    getPlaylistById,
    getPlaylistBySlug,
  };
}
