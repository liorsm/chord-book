const ENTITY_MAP = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
};

export function decodeHtmlEntities(text) {
  return (text || '')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    )
    .replace(
      /&(nbsp|amp|lt|gt|quot|#39);/gi,
      (m) => ENTITY_MAP[m.toLowerCase()] ?? m
    );
}

export function stripHtml(html) {
  return decodeHtmlEntities(
    (html || '').replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '')
  );
}

export function parseTab4uChordCell(html) {
  const chords = [];
  const spanRe = /class=["']?c_C["']?[^>]*>([^<]+)</gi;
  let match;
  while ((match = spanRe.exec(html))) {
    const chord = match[1].trim();
    if (chord) chords.push(chord);
  }
  if (chords.length) return chords.join(' ');

  const text = stripHtml(html).replace(/\s+/g, ' ').trim();
  return text;
}

export function parseTab4uSongCell(html) {
  return stripHtml(html).replace(/\s+/g, ' ').trim();
}

/** ממיר את בלוק songContentTPL לטקסט למילים ואקורדים */
export function parseTab4uSongHtml(html) {
  const start = html.indexOf('id="songContentTPL"');
  if (start < 0) return '';

  const endMarkers = ['id="downInSongTable"', 'id="songComments"'];
  let end = html.length;
  for (const marker of endMarkers) {
    const idx = html.indexOf(marker, start);
    if (idx > start) end = Math.min(end, idx);
  }

  const block = html.slice(start, end);
  const rows = block.match(/<tr[\s\S]*?<\/tr>/gi) || [];
  const lines = [];

  for (const row of rows) {
    const tdMatch = row.match(
      /<td[^>]*class=["'][^"']*\b(song|chords(?:_[a-z]+)?)\b[^"']*["'][^>]*>([\s\S]*?)<\/td>/i
    );
    if (!tdMatch) continue;

    const cellClass = tdMatch[1].toLowerCase();
    const cellHtml = tdMatch[2];

    if (cellClass === 'song') {
      const line = parseTab4uSongCell(cellHtml);
      if (line) lines.push(line);
    } else if (cellClass.startsWith('chords')) {
      const line = parseTab4uChordCell(cellHtml);
      if (line) lines.push(line);
    }
  }

  return lines.join('\n').trim();
}

export function parseTab4uSongUrl(path) {
  const match = (path || '').match(/tabs\/songs\/\d+_(.+)\.html/i);
  if (!match) return null;

  const slug = decodeURIComponent(match[1]);
  const splitIdx = slug.indexOf('_-_');
  if (splitIdx < 0) return null;

  const artist = slug.slice(0, splitIdx).replace(/_/g, ' ').trim();
  const title = slug.slice(splitIdx + 3).replace(/_/g, ' ').trim();
  return { artist, title };
}

function normalizeForMatch(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function scoreTab4uSearchResult(parsed, title, artist) {
  if (!parsed) return 0;

  const wantTitle = normalizeForMatch(title);
  const wantArtist = normalizeForMatch(artist);
  const gotTitle = normalizeForMatch(parsed.title);
  const gotArtist = normalizeForMatch(parsed.artist);

  let score = 0;
  if (wantTitle && gotTitle === wantTitle) score += 12;
  else if (wantTitle && (gotTitle.includes(wantTitle) || wantTitle.includes(gotTitle)))
    score += 6;

  if (wantArtist && gotArtist === wantArtist) score += 12;
  else if (
    wantArtist &&
    (gotArtist.includes(wantArtist) || wantArtist.includes(gotArtist))
  )
    score += 6;

  return score;
}

export function pickBestTab4uSongUrl(links, title, artist) {
  let best = null;
  let bestScore = 0;

  for (const path of links) {
    const parsed = parseTab4uSongUrl(path);
    const score = scoreTab4uSearchResult(parsed, title, artist);
    if (score > bestScore) {
      bestScore = score;
      best = path;
    }
  }

  if (best) return best;
  return links[0] || null;
}

export function extractTab4uSearchLinks(html) {
  return [
    ...new Set(
      [...html.matchAll(/tabs\/songs\/\d+_[^\s"'<>]+\.html/gi)].map((m) => m[0])
    ),
  ];
}
