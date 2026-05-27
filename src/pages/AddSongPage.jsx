import { useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import SongForm from '../components/Song/SongForm';
import { useSongs } from '../hooks/useSongs';
import { songPath } from '../utils/routes';

export default function AddSongPage() {
  const navigate = useNavigate();
  const { addSong } = useSongs();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        הוסף שיר חדש
      </Typography>

      <SongForm
        onSubmit={async (data) => {
          const created = await addSong(data);
          navigate(songPath(created));
        }}
      />
    </Container>
  );
}
