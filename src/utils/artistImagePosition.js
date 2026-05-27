export const DEFAULT_ARTIST_IMAGE_POSITION_Y = 50;

export function normalizeArtistImagePositionY(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return DEFAULT_ARTIST_IMAGE_POSITION_Y;
  return Math.min(100, Math.max(0, Math.round(n)));
}

export function artistImageBackgroundStyle(url, positionY) {
  if (!url) return null;
  const y = normalizeArtistImagePositionY(positionY);
  return {
    backgroundImage: `url(${url})`,
    backgroundSize: 'cover',
    backgroundPosition: `center ${y}%`,
    backgroundRepeat: 'no-repeat',
  };
}
