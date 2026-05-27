import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SongCard from '../components/Song/SongCard';
import { useSongs } from '../hooks/useSongs';

export default function FavoritesPage() {
  const { favoriteSongs, loading, toggleFavorite } = useSongs();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <FavoriteIcon color="error" sx={{ fontSize: 32 }} />
        <Typography variant="h4" fontWeight={800}>
          מועדפים
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {favoriteSongs.map((song) => (
            <SongCard key={song.id} song={song} onToggleFavorite={toggleFavorite} />
          ))}
          {favoriteSongs.length === 0 && (
            <Typography color="text.secondary" textAlign="center" py={4}>
              אין שירים במועדפים. לחץ על הכוכב בדף שיר.
            </Typography>
          )}
        </Box>
      )}
    </Container>
  );
}
