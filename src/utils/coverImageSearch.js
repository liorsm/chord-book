import { fetchArtistImage, fetchWikipediaArtistImageOptions } from './artistImage';

const OPENVERSE_API = 'https://api.openverse.org/v1/images/';
const WIKIMEDIA_COMMONS_API = 'https://commons.wikimedia.org/w/api.php';
const DEEZER_API = 'https://api.deezer.com/search/artist';
const THEAUDIODB_API = 'https://www.theaudiodb.com/api/v1/json';

/** @typedef {{ id: string, url: string, thumbnail: string, title: string, attribution?: string }} ImageOption */

/**
 * @param {number} limit
 */
function createImageCollector(limit) {
  const results = /** @type {ImageOption[]} */ ([]);
  const seen = new Set();

  return {
    add(items) {
      for (const item of items || []) {
        if (!item?.url || seen.has(item.url)) continue;
        seen.add(item.url);
        results.push(item);
        if (results.length >= limit) break;
      }
    },
    full() {
      return results.length >= limit;
    },
    get() {
      return results.slice(0, limit);
    },
  };
}

/**
 * @param {string} query
 * @param {number} [limit=4]
 * @returns {Promise<ImageOption[]>}
 */
export async function fetchCoverImageOptions(query, limit = 4) {
  const q = query?.trim();
  if (!q) return [];

  const collector = createImageCollector(limit);

  collector.add(await searchOpenverse(q, limit));

  if (!collector.full()) {
    const wikiUrl = await fetchArtistImage(q);
    if (wikiUrl) {
      collector.add([
        {
          id: 'wikipedia',
          url: wikiUrl,
          thumbnail: wikiUrl,
          title: q,
          attribution: 'ויקיפדיה',
        },
      ]);
    }
  }

  if (!collector.full()) {
    collector.add(await searchWikimediaCommons(q, limit));
  }

  if (!collector.full()) {
    for (const altQuery of [`${q} photo`, `${q} music`]) {
      if (collector.full()) break;
      collector.add(await searchOpenverse(altQuery, limit));
    }
  }

  return collector.get();
}

/**
 * @param {string} artistName
 * @param {number} [limit=4]
 * @returns {Promise<ImageOption[]>}
 */
export async function fetchArtistImageOptions(artistName, limit = 4) {
  const q = artistName?.trim();
  if (!q) return [];

  const collector = createImageCollector(limit);

  collector.add(await fetchWikipediaArtistImageOptions(q));

  if (!collector.full()) {
    for (const query of [q, `${q} portrait`, `${q} musician`]) {
      if (collector.full()) break;
      collector.add(await searchOpenverse(query, limit));
    }
  }

  if (!collector.full()) {
    collector.add(await searchWikimediaCommons(`${q} portrait`, limit));
    if (!collector.full()) {
      collector.add(await searchWikimediaCommons(q, limit));
    }
  }

  if (!collector.full()) {
    collector.add(await searchDeezerArtists(q, limit));
  }

  if (!collector.full()) {
    collector.add(await searchTheAudioDb(q, limit));
  }

  return collector.get();
}

/**
 * @param {string} query
 * @param {number} limit
 * @returns {Promise<ImageOption[]>}
 */
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
          id: `openverse-${item.id}`,
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

/**
 * @param {string} query
 * @param {number} limit
 * @returns {Promise<ImageOption[]>}
 */
async function searchWikimediaCommons(query, limit) {
  try {
    const params = new URLSearchParams({
      action: 'query',
      generator: 'search',
      gsrsearch: query,
      gsrnamespace: '6',
      gsrlimit: String(limit),
      prop: 'imageinfo',
      iiprop: 'url|extmetadata',
      iiurlwidth: '400',
      format: 'json',
      origin: '*',
    });
    const res = await fetch(`${WIKIMEDIA_COMMONS_API}?${params}`);
    if (!res.ok) return [];
    const data = await res.json();
    const pages = data.query?.pages;
    if (!pages) return [];

    return Object.values(pages)
      .map((page) => {
        const info = page.imageinfo?.[0];
        const url = info?.url || info?.thumburl;
        const thumbnail = info?.thumburl || info?.url;
        if (!url) return null;
        const artist = info?.extmetadata?.Artist?.value;
        const license = info?.extmetadata?.LicenseShortName?.value;
        const attribution = [artist, license].filter(Boolean).join(' · ');
        return {
          id: `commons-${page.pageid}`,
          url,
          thumbnail,
          title: page.title?.replace(/^File:/, '') || query,
          attribution: attribution || 'Wikimedia Commons',
        };
      })
      .filter(Boolean)
      .slice(0, limit);
  } catch {
    return [];
  }
}

/**
 * @param {string} query
 * @param {number} limit
 * @returns {Promise<ImageOption[]>}
 */
async function searchDeezerArtists(query, limit) {
  try {
    const params = new URLSearchParams({
      q: query,
      limit: String(limit),
    });
    const res = await fetch(`${DEEZER_API}?${params}`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.data || [])
      .map((artist) => {
        const url =
          artist.picture_xl || artist.picture_big || artist.picture_medium;
        const thumbnail = artist.picture_medium || url;
        if (!url) return null;
        return {
          id: `deezer-${artist.id}`,
          url,
          thumbnail,
          title: artist.name || query,
          attribution: 'Deezer',
        };
      })
      .filter(Boolean)
      .slice(0, limit);
  } catch {
    return [];
  }
}

/**
 * @param {string} query
 * @param {number} limit
 * @returns {Promise<ImageOption[]>}
 */
async function searchTheAudioDb(query, limit) {
  const apiKey = import.meta.env.VITE_THEAUDIODB_API_KEY || '2';
  try {
    const res = await fetch(
      `${THEAUDIODB_API}/${encodeURIComponent(apiKey)}/search.php?s=${encodeURIComponent(query)}`
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.artists || [])
      .map((artist) => {
        const url =
          artist.strArtistThumb ||
          artist.strArtistLogo ||
          artist.strArtistFanart;
        if (!url) return null;
        return {
          id: `audiodb-${artist.idArtist}`,
          url,
          thumbnail: url,
          title: artist.strArtist || query,
          attribution: 'TheAudioDB',
        };
      })
      .filter(Boolean)
      .slice(0, limit);
  } catch {
    return [];
  }
}
