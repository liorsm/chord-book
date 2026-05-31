import { slugify, resolveUniqueSlug } from './slug';

export function normalizeArtistKey(name) {
  return (name || '').trim().toLowerCase();
}

export function generateArtistSlug(name) {
  const slug = slugify(name || '');
  return slug || 'artist';
}

/** אוסף אמנים ייחודיים משירים קיימים */
export function deriveArtistsFromSongs(songs) {
  const map = new Map();

  for (const song of songs) {
    const rawName = song.artist?.trim();
    if (!rawName) continue;

    const key = normalizeArtistKey(rawName);
    let entry = map.get(key);

    if (!entry) {
      entry = {
        name: rawName,
        imageUrl: null,
        imagePositionY: null,
        songCount: 0,
      };
      map.set(key, entry);
    }

    entry.songCount += 1;

    if (!entry.imageUrl && song.artistImageUrl) {
      entry.imageUrl = song.artistImageUrl;
      entry.imagePositionY = song.artistImagePositionY ?? null;
    }
  }

  const list = Array.from(map.values()).sort((a, b) =>
    a.name.localeCompare(b.name, 'he')
  );

  const taken = new Set();
  return list.map((artist) => {
    const base = generateArtistSlug(artist.name);
    const slug = resolveUniqueSlug(base, taken);
    taken.add(slug);
    return { ...artist, slug };
  });
}

export function findArtistBySlug(artists, slugOrId) {
  if (!slugOrId || !artists?.length) return undefined;
  const decoded = decodeURIComponent(slugOrId);
  return (
    artists.find((a) => a.slug === decoded) ||
    artists.find((a) => a.slug === slugOrId)
  );
}

export function filterSongsByArtist(songs, artist) {
  if (!artist) return [];
  const key = normalizeArtistKey(artist.name);
  return songs.filter((s) => normalizeArtistKey(s.artist) === key);
}

/** slug לדף אמן מתוך שם האמן בשיר */
export function findArtistSlugForSong(song, songs) {
  const name = song?.artist?.trim();
  if (!name || !songs?.length) return null;
  const key = normalizeArtistKey(name);
  const artist = deriveArtistsFromSongs(songs).find(
    (a) => normalizeArtistKey(a.name) === key
  );
  return artist?.slug ?? null;
}
