import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SongCard from '../components/Song/SongCard';
import PageHeroShell from '../components/common/PageHeroShell';
import { usePlaylists } from '../hooks/usePlaylists';
import { useSongs } from '../hooks/useSongs';
import { useAuth } from '../contexts/AuthContext';
import { getPlaylistCoverBackground } from '../utils/artistImage';
import { artistImageBackgroundStyle } from '../utils/artistImagePosition';

export default function PlaylistPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { getPlaylistBySlug, deletePlaylist, removeSongFromPlaylist, loading: plLoading } =
    usePlaylists();
  const { songs, loading: songsLoading, toggleFavorite } = useSongs();

  const playlist = getPlaylistBySlug(slug);
  const playlistSongs = (playlist?.songIds || [])
    .map((sid) => songs.find((s) => s.id === sid))
    .filter(Boolean);

  if (plLoading || songsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!playlist) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          הפלייליסט לא נמצא
        </Typography>
        <Button component={RouterLink} to="/" startIcon={<ArrowForwardIcon />}>
          חזרה לדף הבית
        </Button>
      </Container>
    );
  }

  const coverImageUrl = playlist.coverImageUrl?.trim();
  const fallbackKey = playlist.name || playlist.id;

  return (
    <Box>
      <PageHeroShell
        backgroundSx={
          coverImageUrl
            ? artistImageBackgroundStyle(coverImageUrl)
            : {
                backgroundImage: getPlaylistCoverBackground(playlist.coverColor, fallbackKey),
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
        }
      >
        <Container maxWidth="lg" sx={{ py: 4, width: '100%' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 2,
              mb: 2,
            }}
          >
            <Button
              component={RouterLink}
              to="/"
              startIcon={<ArrowForwardIcon />}
              sx={{ color: 'white' }}
            >
              דף הבית
            </Button>
            {isAdmin && (
              <Button
                color="error"
                variant="outlined"
                startIcon={<DeleteIcon />}
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.7)',
                  '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.12)' },
                }}
                onClick={async () => {
                  if (confirm('למחוק את הפלייליסט?')) {
                    await deletePlaylist(playlist.id);
                    navigate('/');
                  }
                }}
              >
                מחק
              </Button>
            )}
          </Box>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              color: 'white',
              textShadow: '0 2px 12px rgba(0,0,0,0.5)',
            }}
          >
            {playlist.name}
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.9)', mt: 1 }}>
            {playlistSongs.length} שירים
          </Typography>
        </Container>
      </PageHeroShell>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {playlistSongs.map((song) => (
            <Box key={song.id} sx={{ position: 'relative' }}>
              <SongCard
                song={song}
                onToggleFavorite={isAdmin ? toggleFavorite : undefined}
              />
              {isAdmin && (
                <IconButton
                  size="small"
                  color="error"
                  sx={{ position: 'absolute', top: 8, left: 8 }}
                  onClick={() => removeSongFromPlaylist(playlist.id, song.id)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          ))}
          {playlistSongs.length === 0 && (
            <Typography color="text.secondary" textAlign="center" py={4}>
              הפלייליסט ריק. הוסף שירים מדף השיר.
            </Typography>
          )}
        </Box>
      </Container>
    </Box>
  );
}
