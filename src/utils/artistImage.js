const WIKI_ENDPOINTS = [
  (name) =>
    `https://he.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`,
  (name) =>
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`,
];

async function fetchWikipediaSummaryImage(buildUrl, artistName) {
  const res = await fetch(buildUrl(artistName.trim()));
  if (!res.ok) return null;
  const data = await res.json();
  return data.thumbnail?.source || data.originalimage?.source || null;
}

/**
 * @param {string} artistName
 * @returns {Promise<Array<{ id: string, url: string, thumbnail: string, title: string, attribution: string }>>}
 */
export async function fetchWikipediaArtistImageOptions(artistName) {
  if (!artistName?.trim()) return [];

  const ids = ['wikipedia-he', 'wikipedia-en'];
  const options = [];
  const seen = new Set();

  for (let i = 0; i < WIKI_ENDPOINTS.length; i++) {
    try {
      const url = await fetchWikipediaSummaryImage(WIKI_ENDPOINTS[i], artistName);
      if (!url || seen.has(url)) continue;
      seen.add(url);
      options.push({
        id: ids[i],
        url,
        thumbnail: url,
        title: artistName.trim(),
        attribution: 'ויקיפדיה',
      });
    } catch {
      // try next endpoint
    }
  }
  return options;
}

export async function fetchArtistImage(artistName) {
  const options = await fetchWikipediaArtistImageOptions(artistName);
  return options[0]?.url ?? null;
}

export function getArtistInitials(artist) {
  if (!artist) return '?';
  const parts = artist.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return artist.slice(0, 2).toUpperCase();
}

export const GRADIENT_PALETTES = [
  'linear-gradient(135deg, #4c1d95 0%, #7c3aed 45%, #c084fc 100%)',
  'linear-gradient(145deg, #0f766e 0%, #10b981 50%, #6ee7b7 100%)',
  'linear-gradient(135deg, #be185d 0%, #db2777 40%, #f472b6 100%)',
  'linear-gradient(160deg, #1e3a8a 0%, #4f46e5 50%, #818cf8 100%)',
  'linear-gradient(135deg, #7c2d12 0%, #ea580c 45%, #fbbf24 100%)',
  'linear-gradient(145deg, #312e81 0%, #6366f1 50%, #a5b4fc 100%)',
  'linear-gradient(135deg, #831843 0%, #be123c 50%, #fb7185 100%)',
  'linear-gradient(160deg, #134e4a 0%, #0d9488 50%, #5eead4 100%)',
];

export function getGradientForArtist(artist) {
  let hash = 0;
  for (let i = 0; i < (artist || '').length; i++) {
    hash = artist.charCodeAt(i) + ((hash << 5) - hash);
  }
  return GRADIENT_PALETTES[Math.abs(hash) % GRADIENT_PALETTES.length];
}

/** Legacy playlists may store a flat hex — always show a multi-stop gradient. */
export function resolvePlaylistCoverColor(coverColor, fallbackKey) {
  if (coverColor && /gradient/i.test(coverColor)) {
    return coverColor;
  }
  return getGradientForArtist(fallbackKey);
}

/** Semi-transparent gradient over hero / cover backgrounds (song, artist, playlist). */
export const HERO_GRADIENT_OVERLAY =
  'linear-gradient(to bottom, rgba(81, 181, 229, 0.5) 0%, rgba(74, 140, 230, 0.5) 35%, rgba(83, 86, 224, 0.5) 65%, rgba(125, 38, 223, 0.5) 100%)';

/** @deprecated Use HERO_GRADIENT_OVERLAY */
export const PLAYLIST_COVER_IMAGE_OVERLAY = HERO_GRADIENT_OVERLAY;

/** Layered backgrounds for playlist cards (base gradient + soft highlight). */
export function getPlaylistCoverBackground(coverColor, fallbackKey) {
  const base = resolvePlaylistCoverColor(coverColor, fallbackKey);
  return `${base}, radial-gradient(ellipse 90% 70% at 18% 12%, rgba(255,255,255,0.28) 0%, transparent 52%)`;
}
