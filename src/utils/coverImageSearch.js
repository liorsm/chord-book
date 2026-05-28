import { fetchArtistImage } from './artistImage';

const OPENVERSE_API = 'https://api.openverse.org/v1/images/';

/**
 * @param {string} query
 * @param {number} [limit=4]
 * @returns {Promise<Array<{ id: string, url: string, thumbnail: string, title: string, attribution?: string }>>}
 */
export async function fetchCoverImageOptions(query, limit = 4) {
  const q = query?.trim();
  if (!q) return [];

  const fromOpenverse = await searchOpenverse(q, limit);
  if (fromOpenverse.length > 0) return fromOpenverse;

  const wikiUrl = await fetchArtistImage(q);
  if (wikiUrl) {
    return [
      {
        id: 'wikipedia',
        url: wikiUrl,
        thumbnail: wikiUrl,
        title: q,
        attribution: 'ויקיפדיה',
      },
    ];
  }

  return [];
}

async function searchOpenverse(query, limit) {
  try {
    const params = new URLSearchParams({
      q: query,
      page_size: String(limit),
      license: 'cc0,pdm,by,by-sa',
    });
    const res = await fetch(`${OPENVERSE_API}?${params}`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results || [])
      .map((item) => {
        const url = item.url || item.thumbnail;
        const thumbnail = item.thumbnail || item.url;
        if (!url) return null;
        const creator = item.creator ? item.creator.trim() : '';
        const attribution = [creator, item.license_version || item.license]
          .filter(Boolean)
          .join(' · ');
        return {
          id: String(item.id),
          url,
          thumbnail,
          title: item.title || query,
          attribution: attribution || 'Openverse',
        };
      })
      .filter(Boolean)
      .slice(0, limit);
  } catch {
    return [];
  }
}
