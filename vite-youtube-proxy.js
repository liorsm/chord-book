import https from 'node:https';

/** מפתח ציבורי של לקוח YouTube (כמו בדפדפן) — לשימוש בפרוקסי שרת בלבד */
const INNERTUBE_API_KEY = 'AIzaSyAO_FJ2SluUf7f7vJhTQtMrmCqgY0vKH4o';
const INNERTUBE_CLIENT_VERSION = '2.20250328.01.00';

const INVIDIOUS_INSTANCES = [
  'https://yewtu.be',
  'https://inv.nadeko.net',
];

const PIPED_INSTANCES = [
  'https://pipedapi.kavin.rocks',
  'https://pipedapi.adminforge.de',
];

function httpsRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = https.request(
      {
        hostname: parsed.hostname,
        path: parsed.pathname + parsed.search,
        method: options.method || 'GET',
        headers: options.headers || {},
      },
      (res) => {
        if (
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          res.resume();
          const next = new URL(res.headers.location, url).href;
          resolve(httpsRequest(next, options));
          return;
        }

        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            body,
          });
        });
      }
    );
    req.on('error', reject);
    req.setTimeout(15000, () => {
      req.destroy(new Error('timeout'));
    });
    if (options.body) req.write(options.body);
    req.end();
  });
}

function buildWatchUrl(videoId) {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

function extractVideoIdFromInnertube(data) {
  const sections =
    data?.contents?.twoColumnSearchResultsRenderer?.primaryContents
      ?.sectionListRenderer?.contents || [];

  for (const section of sections) {
    const items = section?.itemSectionRenderer?.contents || [];
    for (const item of items) {
      const videoId = item?.videoRenderer?.videoId;
      if (videoId && /^[\w-]{11}$/.test(videoId)) return videoId;
    }
  }
  return null;
}

async function searchViaInnertube(query) {
  const body = JSON.stringify({
    context: {
      client: {
        clientName: 'WEB',
        clientVersion: INNERTUBE_CLIENT_VERSION,
        hl: 'he',
        gl: 'IL',
      },
    },
    query,
  });

  const { ok, body: responseBody } = await httpsRequest(
    `https://www.youtube.com/youtubei/v1/search?key=${INNERTUBE_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': String(Buffer.byteLength(body)),
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      body,
    }
  );

  if (!ok) return null;
  const data = JSON.parse(responseBody);
  const videoId = extractVideoIdFromInnertube(data);
  return videoId ? buildWatchUrl(videoId) : null;
}

async function searchViaInvidious(query) {
  for (const base of INVIDIOUS_INSTANCES) {
    try {
      const { ok, body } = await httpsRequest(
        `${base}/api/v1/search?q=${encodeURIComponent(query)}&type=video`
      );
      if (!ok) continue;
      const data = JSON.parse(body);
      const hit = Array.isArray(data)
        ? data.find((item) => item.videoId || item.type === 'video')
        : null;
      if (hit?.videoId) return buildWatchUrl(hit.videoId);
    } catch {
      // try next
    }
  }
  return null;
}

async function searchViaPiped(query) {
  for (const base of PIPED_INSTANCES) {
    try {
      const { ok, body } = await httpsRequest(
        `${base}/search?q=${encodeURIComponent(query)}&filter=videos`
      );
      if (!ok) continue;
      const data = JSON.parse(body);
      const item = data?.items?.[0];
      if (!item?.url) continue;
      const match =
        item.url.match(/[?&]v=([\w-]{11})/) || item.url.match(/\/([\w-]{11})$/);
      if (match?.[1]) return buildWatchUrl(match[1]);
    } catch {
      // try next
    }
  }
  return null;
}

export async function searchYouTubeOnServer(query) {
  const viaInnertube = await searchViaInnertube(query);
  if (viaInnertube) return viaInnertube;

  const viaInvidious = await searchViaInvidious(query);
  if (viaInvidious) return viaInvidious;

  return searchViaPiped(query);
}

function attachProxy(server) {
  server.middlewares.use('/api/youtube/search', async (req, res, next) => {
    if (req.method !== 'GET') {
      next();
      return;
    }

    const url = new URL(req.url || '', 'http://localhost');
    const q = url.searchParams.get('q')?.trim();
    if (!q) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'missing q' }));
      return;
    }

    try {
      const watchUrl = await searchYouTubeOnServer(q);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ url: watchUrl }));
    } catch {
      res.statusCode = 502;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ url: null }));
    }
  });
}

export function youtubeSearchProxy() {
  return {
    name: 'youtube-search-proxy',
    configureServer(server) {
      attachProxy(server);
    },
    configurePreviewServer(server) {
      attachProxy(server);
    },
  };
}
