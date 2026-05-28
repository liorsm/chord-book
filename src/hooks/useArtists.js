import { useMemo, useCallback } from 'react';
import { useSongs } from './useSongs';
import {
  deriveArtistsFromSongs,
  findArtistBySlug,
  filterSongsByArtist,
} from '../utils/artists';

export function useArtists() {
  const { songs, loading, error } = useSongs();

  const artists = useMemo(() => deriveArtistsFromSongs(songs), [songs]);

  const getArtistBySlug = useCallback(
    (slug) => findArtistBySlug(artists, slug),
    [artists]
  );

  const getSongsForArtist = useCallback(
    (slug) => {
      const artist = findArtistBySlug(artists, slug);
      return filterSongsByArtist(songs, artist);
    },
    [artists, songs]
  );

  return {
    artists,
    songs,
    loading,
    error,
    getArtistBySlug,
    getSongsForArtist,
  };
}
