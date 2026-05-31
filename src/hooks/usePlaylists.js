import { useCallback, useEffect, useState } from 'react';
import {
  collection,
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

export function sortPlaylists(list) {
  return [...list].sort((a, b) => {
    const orderA = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
    if (orderA !== orderB) return orderA - orderB;
    const ta = a.createdAt?.seconds || 0;
    const tb = b.createdAt?.seconds || 0;
    return tb - ta;
  });
}

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
    setLoading(true);
    setError(null);
    try {
      const snap = await getDocs(collection(db, 'playlists'));
      const list = assignSlugsToPlaylists(snap.docs);

      if (isAdmin) {
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
      }

      setPlaylists(sortPlaylists(list));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

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
    const maxSortOrder = playlists.reduce(
      (max, p) => Math.max(max, p.sortOrder ?? -1),
      -1
    );
    const ref = await addDoc(collection(db, 'playlists'), {
      name: name.trim(),
      slug,
      userId,
      songIds: [],
      coverColor,
      sortOrder: maxSortOrder + 1,
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

  const reorderPlaylists = async (orderedIds) => {
    requireAdmin();
    await Promise.all(
      orderedIds.map((id, index) =>
        updateDoc(doc(db, 'playlists', id), { sortOrder: index })
      )
    );
    await loadPlaylists();
  };

  const setPlaylistPosition = async (playlistId, position) => {
    requireAdmin();
    const sorted = sortPlaylists(playlists);
    const ids = sorted.map((p) => p.id);
    const fromIndex = ids.indexOf(playlistId);
    if (fromIndex === -1) return;
    const toIndex = Math.max(0, Math.min(ids.length - 1, position - 1));
    if (fromIndex === toIndex) return;
    const nextIds = [...ids];
    const [item] = nextIds.splice(fromIndex, 1);
    nextIds.splice(toIndex, 0, item);
    await reorderPlaylists(nextIds);
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
    loading,
    error,
    loadPlaylists,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
    reorderPlaylistSongs,
    moveSongInPlaylist,
    reorderPlaylists,
    setPlaylistPosition,
    getPlaylistById,
    getPlaylistBySlug,
  };
}
