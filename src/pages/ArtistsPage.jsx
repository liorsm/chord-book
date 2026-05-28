import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import ArtistCard from '../components/Artist/ArtistCard';
import { useArtists } from '../hooks/useArtists';

export default function ArtistsPage() {
  const { artists, loading } = useArtists();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        אמנים
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        בחר אמן כדי לראות את כל השירים שלו
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {artists.map((artist) => (
            <ArtistCard key={artist.slug} artist={artist} />
          ))}
          {artists.length === 0 && (
            <Typography color="text.secondary" textAlign="center" py={4}>
              אין אמנים עדיין. הוסף שיר עם שם אמן כדי שיופיע כאן.
            </Typography>
          )}
        </Box>
      )}
    </Container>
  );
}
