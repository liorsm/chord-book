/** מערבב מערך (Fisher-Yates) ומחזיר עותק חדש */
export function shuffleArray(items) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** בוחר שיר אקראי מתוך רשימה */
export function pickRandomSong(songs) {
  if (!songs?.length) return null;
  const i = Math.floor(Math.random() * songs.length);
  return songs[i];
}
