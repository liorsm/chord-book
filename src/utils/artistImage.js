const WIKI_ENDPOINTS = [
  (name) =>
    `https://he.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`,
  (name) =>
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`,
];

export async function fetchArtistImage(artistName) {
  if (!artistName?.trim()) return null;

  for (const buildUrl of WIKI_ENDPOINTS) {
    try {
      const res = await fetch(buildUrl(artistName.trim()));
      if (!res.ok) continue;
      const data = await res.json();
      if (data.thumbnail?.source) {
        return data.thumbnail.source;
      }
      if (data.originalimage?.source) {
        return data.originalimage.source;
      }
    } catch {
      // try next endpoint
    }
  }
  return null;
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

/** Semi-transparent overlay on playlist cover photos (same feel as song hero). */
export const PLAYLIST_COVER_IMAGE_OVERLAY =
  'linear-gradient(to bottom, rgba(81, 181, 229, 0.5) 0%, rgba(74, 140, 230, 0.5) 35%, rgba(83, 86, 224, 0.5) 65%, rgba(125, 38, 223, 0.5) 100%)';

/** Layered backgrounds for playlist cards (base gradient + soft highlight). */
export function getPlaylistCoverBackground(coverColor, fallbackKey) {
  const base = resolvePlaylistCoverColor(coverColor, fallbackKey);
  return `${base}, radial-gradient(ellipse 90% 70% at 18% 12%, rgba(255,255,255,0.28) 0%, transparent 52%)`;
}
