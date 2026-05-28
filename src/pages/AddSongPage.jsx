import { useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import SongForm from '../components/Song/SongForm';
import { useSongs } from '../hooks/useSongs';
import { usePlaylists } from '../hooks/usePlaylists';
import { songPath } from '../utils/routes';

export default function AddSongPage() {
  const navigate = useNavigate();
  const { addSong } = useSongs();
  const { playlists, loading: playlistsLoading, addSongToPlaylist } = usePlaylists();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        הוסף שיר חדש
      </Typography>

      <SongForm
        playlists={playlists}
        playlistsLoading={playlistsLoading}
        onSubmit={async ({ playlistIds, ...data }) => {
          const created = await addSong(data);
          await Promise.all(
            (playlistIds || []).map((id) => addSongToPlaylist(id, created.id))
          );
          navigate(songPath(created));
        }}
      />
    </Container>
  );
}
