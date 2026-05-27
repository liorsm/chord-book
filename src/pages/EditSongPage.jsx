import { useNavigate, useParams } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SongForm from '../components/Song/SongForm';
import { useSongs } from '../hooks/useSongs';
import { songPath, managePath } from '../utils/routes';

export default function EditSongPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { getSongBySlug, updateSong, loading } = useSongs();
  const song = getSongBySlug(slug);

  if (loading && !song) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!song) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography textAlign="center">השיר לא נמצא</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <IconButton onClick={() => navigate(managePath())}>
          <ArrowForwardIcon />
        </IconButton>
        <Typography variant="h4" fontWeight={800}>
          עריכת שיר
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {song.title} — {song.artist}
      </Typography>

      <SongForm
        key={song.id}
        initial={{
          title: song.title,
          artist: song.artist,
          content: song.content,
          artistImageUrl: song.artistImageUrl,
          artistImagePositionY: song.artistImagePositionY,
          youtubeUrl: song.youtubeUrl,
        }}
        submitLabel="שמור שינויים"
        onSubmit={async (data) => {
          const newSlug = await updateSong(song.id, data);
          const updated = { ...song, ...data, slug: newSlug || song.slug };
          navigate(songPath(updated), { replace: true });
        }}
      />
    </Container>
  );
}
