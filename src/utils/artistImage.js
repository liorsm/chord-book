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
  'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
  'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
  'linear-gradient(135deg, #db2777 0%, #7c3aed 100%)',
  'linear-gradient(135deg, #0891b2 0%, #4f46e5 100%)',
  'linear-gradient(135deg, #059669 0%, #0891b2 100%)',
];

export function getGradientForArtist(artist) {
  let hash = 0;
  for (let i = 0; i < (artist || '').length; i++) {
    hash = artist.charCodeAt(i) + ((hash << 5) - hash);
  }
  return GRADIENT_PALETTES[Math.abs(hash) % GRADIENT_PALETTES.length];
}
