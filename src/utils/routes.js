/** נתיב לשיר – slug קריא */
export function songPath(song) {
  if (!song) return '/';
  const segment = song.slug || song.id;
  return `/song/${encodeURIComponent(segment)}`;
}

/** נתיב לפלייליסט */
export function playlistPath(playlist) {
  if (!playlist) return '/';
  const segment = playlist.slug || playlist.id;
  return `/playlist/${encodeURIComponent(segment)}`;
}

/** נתיב לעריכת שיר בדף ניהול */
export function editSongPath(song) {
  if (!song) return '/manage';
  const segment = song.slug || song.id;
  return `/manage/songs/${encodeURIComponent(segment)}`;
}

export function managePath() {
  return '/manage';
}
