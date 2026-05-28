/**
 * ייבוא מילים ואקורדים מ-TAB4U.
 * בפיתוח: פרוקסי Vite (/api/tab4u/import).
 * בפרודקשן: VITE_TAB4U_PROXY_BASE אם הוגדר (למשל Cloud Function).
 */

async function importViaProxy(baseUrl, title, artist) {
  const params = new URLSearchParams();
  if (title?.trim()) params.set('title', title.trim());
  if (artist?.trim()) params.set('artist', artist.trim());

  const root = baseUrl.replace(/\/$/, '');
  const res = await fetch(`${root}/import?${params}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data?.content?.trim() ? data : null;
}

/**
 * @returns {Promise<{ content: string, sourceUrl?: string } | null>}
 */
export async function fetchTab4uContent(title, artist) {
  const parts = [title, artist].map((s) => s?.trim()).filter(Boolean);
  if (!parts.length) return null;

  const proxyBase =
    import.meta.env.VITE_TAB4U_PROXY_BASE ||
    (import.meta.env.DEV ? '/api/tab4u' : '');

  if (!proxyBase) return null;

  try {
    return await importViaProxy(proxyBase, title, artist);
  } catch {
    return null;
  }
}

export function tab4uImportUnavailableMessage() {
  if (import.meta.env.DEV) {
    return 'לא נמצא שיר ב-TAB4U. ודא שם שיר ואמן, או הדבק ידנית.';
  }
  if (!import.meta.env.VITE_TAB4U_PROXY_BASE) {
    return 'ייבוא TAB4U זמין בפיתוח (npm run dev). בפרודקשן הגדר VITE_TAB4U_PROXY_BASE.';
  }
  return 'לא נמצא שיר ב-TAB4U או שהפרוקסי לא זמין.';
}
