import https from 'node:https';
import {
  extractTab4uSearchLinks,
  parseTab4uSongHtml,
  pickBestTab4uSongUrl,
} from './tab4uParse.js';

const TAB4U_ORIGIN = 'https://www.tab4u.com';
const USER_AGENT = 'Mozilla/5.0 (compatible; ChordBook/1.0)';

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = https.request(
      {
        hostname: parsed.hostname,
        path: parsed.pathname + parsed.search,
        method: 'GET',
        headers: {
          'User-Agent': USER_AGENT,
          'Accept-Language': 'he,en;q=0.9',
        },
      },
      (res) => {
        if (
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          res.resume();
          resolve(httpsGet(new URL(res.headers.location, url).href));
          return;
        }

        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 400) {
            reject(new Error(`TAB4U HTTP ${res.statusCode}`));
            return;
          }
          resolve(body);
        });
      }
    );
    req.on('error', reject);
    req.setTimeout(20000, () => {
      req.destroy(new Error('timeout'));
    });
    req.end();
  });
}

export async function searchTab4uSongPath(title, artist) {
  const q = [artist, title].map((s) => s?.trim()).filter(Boolean).join(' ');
  if (!q) return null;

  const searchUrl = `${TAB4U_ORIGIN}/resultsSimple?tab=songs&q=${encodeURIComponent(q)}`;
  const html = await httpsGet(searchUrl);
  const links = extractTab4uSearchLinks(html);
  return pickBestTab4uSongUrl(links, title, artist);
}

export async function fetchTab4uSongContent(title, artist) {
  const songPath = await searchTab4uSongPath(title, artist);
  if (!songPath) return null;

  const songUrl = `${TAB4U_ORIGIN}/${songPath.replace(/^\//, '')}`;
  const html = await httpsGet(songUrl);
  const content = parseTab4uSongHtml(html);
  if (!content) return null;

  return { content, sourceUrl: songUrl };
}
