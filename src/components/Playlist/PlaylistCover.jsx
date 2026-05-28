import Box from '@mui/material/Box';
import {
  getPlaylistCoverBackground,
  PLAYLIST_COVER_IMAGE_OVERLAY,
} from '../../utils/artistImage';
import { artistImageBackgroundStyle } from '../../utils/artistImagePosition';

export default function PlaylistCover({
  coverColor,
  coverImageUrl,
  name,
  height = 128,
  sx,
}) {
  const imageUrl = coverImageUrl?.trim();
  const fallbackKey = name || '';

  if (!imageUrl) {
    return (
      <Box
        sx={{
          height,
          borderRadius: 3,
          backgroundImage: getPlaylistCoverBackground(coverColor, fallbackKey),
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          ...sx,
        }}
      />
    );
  }

  return (
    <Box
      sx={{
        position: 'relative',
        height,
        borderRadius: 3,
        overflow: 'hidden',
        ...sx,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          ...artistImageBackgroundStyle(imageUrl),
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: PLAYLIST_COVER_IMAGE_OVERLAY,
        }}
      />
    </Box>
  );
}
