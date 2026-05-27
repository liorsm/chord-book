/** יוצר slug קריא מכותרת (תומך בעברית) */
export function slugify(text) {
  if (!text) return '';
  return text
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\u0590-\u05FFa-zA-Z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

export function generateSongSlug(title, artist) {
  const slug = slugify(`${title || ''}-${artist || ''}`);
  return slug || 'song';
}

export function generatePlaylistSlug(name) {
  const slug = slugify(name || '');
  return slug || 'playlist';
}

/** מבטיח slug ייחודי ברשימה קיימת */
export function resolveUniqueSlug(baseSlug, takenSlugs, excludeSlug = null) {
  const taken = new Set(
    [...takenSlugs].filter((s) => s && s !== excludeSlug)
  );
  if (!taken.has(baseSlug)) return baseSlug;

  let n = 2;
  while (taken.has(`${baseSlug}-${n}`)) {
    n += 1;
  }
  return `${baseSlug}-${n}`;
}
