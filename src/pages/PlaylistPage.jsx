import { useNavigate, useParams } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SongCard from '../components/Song/SongCard';
import { usePlaylists } from '../hooks/usePlaylists';
import { useSongs } from '../hooks/useSongs';

export default function PlaylistPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
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
      <Typography textAlign="center" py={8}>
        הפלייליסט לא נמצא
      </Typography>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <IconButton onClick={() => navigate('/')}>
          <ArrowForwardIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" fontWeight={800}>
            {playlist.name}
          </Typography>
          <Typography color="text.secondary">{playlistSongs.length} שירים</Typography>
        </Box>
        <Button
          color="error"
          startIcon={<DeleteIcon />}
          onClick={async () => {
            if (confirm('למחוק את הפלייליסט?')) {
              await deletePlaylist(playlist.id);
              navigate('/');
            }
          }}
        >
          מחק
        </Button>
      </Box>

      <Box
        sx={{
          height: 120,
          borderRadius: 3,
          background: playlist.coverColor,
          mb: 3,
        }}
      />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {playlistSongs.map((song) => (
          <Box key={song.id} sx={{ position: 'relative' }}>
            <SongCard song={song} onToggleFavorite={toggleFavorite} />
            <IconButton
              size="small"
              color="error"
              sx={{ position: 'absolute', top: 8, left: 8 }}
              onClick={() => removeSongFromPlaylist(playlist.id, song.id)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        ))}
        {playlistSongs.length === 0 && (
          <Typography color="text.secondary" textAlign="center" py={4}>
            הפלייליסט ריק. הוסף שירים מדף השיר.
          </Typography>
        )}
      </Box>
    </Container>
  );
}
