import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Chip from '@mui/material/Chip';
import { artistPath, playlistPath } from '../../utils/routes';

export default function SongHeroTags({ artistName, artistSlug, playlists = [] }) {
  const showArtistLink = Boolean(artistSlug);
  const showPlaylists = playlists.length > 0;

  if (!showArtistLink && !showPlaylists) return null;

  return (
    <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 }, mt: 2, mb: 1 }}>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        {showArtistLink && (
          <Chip
            component={RouterLink}
            to={artistPath({ slug: artistSlug })}
            clickable
            label={artistName?.trim() || 'דף אמן'}
            variant="outlined"
            size="small"
            color="primary"
          />
        )}
        {playlists.map((playlist) => (
          <Chip
            key={playlist.id}
            component={RouterLink}
            to={playlistPath(playlist)}
            clickable
            label={playlist.name}
            variant="outlined"
            size="small"
            color="primary"
          />
        ))}
      </Box>
    </Container>
  );
}
