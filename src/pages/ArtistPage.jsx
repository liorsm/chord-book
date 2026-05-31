import { useParams, Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SongCard from '../components/Song/SongCard';
import PageHeroShell from '../components/common/PageHeroShell';
import { useArtists } from '../hooks/useArtists';
import { getGradientForArtist } from '../utils/artistImage';
import { artistImageBackgroundStyle } from '../utils/artistImagePosition';

export default function ArtistPage() {
  const { slug } = useParams();
  const { loading, getArtistBySlug, getSongsForArtist } = useArtists();
  const artist = getArtistBySlug(slug);
  const songs = getSongsForArtist(slug);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!artist) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          האמן לא נמצא
        </Typography>
        <Button component={RouterLink} to="/artists" startIcon={<ArrowForwardIcon />}>
          חזרה לאמנים
        </Button>
      </Container>
    );
  }

  return (
    <Box>
      <PageHeroShell
        backgroundSx={
          artist.imageUrl
            ? artistImageBackgroundStyle(artist.imageUrl, artist.imagePositionY)
            : { background: getGradientForArtist(artist.name) }
        }
      >
        <Container maxWidth="lg" sx={{ py: 4, width: '100%' }}>
          <Button
            component={RouterLink}
            to="/artists"
            startIcon={<ArrowForwardIcon />}
            sx={{ mb: 2, color: 'white' }}
          >
            כל האמנים
          </Button>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              color: 'white',
              textShadow: '0 2px 12px rgba(0,0,0,0.5)',
            }}
          >
            {artist.name}
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.9)', mt: 1 }}>
            {songs.length} שירים
          </Typography>
        </Container>
      </PageHeroShell>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {songs.map((song) => (
            <SongCard key={song.id} song={song} />
          ))}
          {songs.length === 0 && (
            <Typography color="text.secondary" textAlign="center" py={4}>
              אין שירים לאמן זה.
            </Typography>
          )}
        </Box>
      </Container>
    </Box>
  );
}
