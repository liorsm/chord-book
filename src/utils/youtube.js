/**
 * מחלץ מזהה סרטון מכתובת YouTube או מזהה גולמי.
 */
export function parseYouTubeVideoId(input) {
  if (!input?.trim()) return null;
  const value = input.trim();

  if (/^[\w-]{11}$/.test(value)) return value;

  try {
    const url = new URL(value.startsWith('http') ? value : `https://${value}`);
    const host = url.hostname.replace(/^www\./, '');

    if (host === 'youtu.be') {
      const id = url.pathname.slice(1).split('/')[0];
      return id && /^[\w-]{11}$/.test(id) ? id : null;
    }

    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
      const v = url.searchParams.get('v');
      if (v && /^[\w-]{11}$/.test(v)) return v;

      const embedMatch = url.pathname.match(/\/embed\/([\w-]{11})/);
      if (embedMatch) return embedMatch[1];

      const shortsMatch = url.pathname.match(/\/shorts\/([\w-]{11})/);
      if (shortsMatch) return shortsMatch[1];
    }
  } catch {
    return null;
  }

  return null;
}

export function buildYouTubeWatchUrl(videoId) {
  if (!videoId) return '';
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export function buildYouTubeEmbedUrl(videoId, { autoplay = false } = {}) {
  if (!videoId) return '';
  const params = new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    rel: '0',
    modestbranding: '1',
  });
  if (autoplay) {
    params.set('mute', '0');
  }
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params}`;
}

async function searchViaYouTubeApi(query, apiKey) {
  const params = new URLSearchParams({
    part: 'snippet',
    q: query,
    type: 'video',
    maxResults: '1',
    key: apiKey,
  });
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?${params}`
  );
  if (!res.ok) return null;
  const data = await res.json();
  const videoId = data?.items?.[0]?.id?.videoId;
  return videoId ? buildYouTubeWatchUrl(videoId) : null;
}

async function searchViaDevProxy(query) {
  const res = await fetch(
    `/api/youtube/search?q=${encodeURIComponent(query)}`
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data?.url || null;
}

/**
 * מחפש סרטון YouTube לפי שם השיר והאמן.
 * בפיתוח: דרך פרוקסי Vite (ללא CORS).
 * בפרודקשן: YouTube Data API אם הוגדר VITE_YOUTUBE_API_KEY.
 */
export async function fetchYouTubeVideoUrl(title, artist) {
  const parts = [artist, title].map((s) => s?.trim()).filter(Boolean);
  if (!parts.length) return null;

  const query = `${parts.join(' ')} official`;
  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;

  if (apiKey) {
    const viaApi = await searchViaYouTubeApi(query, apiKey);
    if (viaApi) return viaApi;
  }

  if (import.meta.env.DEV) {
    return searchViaDevProxy(query);
  }

  return null;
}
