import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import SearchIcon from '@mui/icons-material/Search';
import { motion } from 'framer-motion';
import SearchBar from '../components/Search/SearchBar';
import SongCard from '../components/Song/SongCard';
import PlaylistCard from '../components/Playlist/PlaylistCard';
import { useSongs } from '../hooks/useSongs';
import { usePlaylists } from '../hooks/usePlaylists';
import { useThemeMode } from '../ThemeContext';

export default function HomePage() {
  const { mode } = useThemeMode();
  const { songs, loading: songsLoading } = useSongs();
  const { playlists, loading: playlistsLoading, error: playlistsError } = usePlaylists();

  return (
    <Box>
      <Box
        component={motion.section}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        sx={{
          background:
            mode === 'dark'
              ? 'linear-gradient(135deg, rgba(124,58,237,0.4) 0%, rgba(26,0,51,0.9) 100%)'
              : 'linear-gradient(135deg, rgba(124,58,237,0.25) 0%, rgba(243,232,255,0.95) 100%)',
          py: { xs: 6, md: 10 },
          px: 2,
          textAlign: 'center',
          borderRadius: { md: 0 },
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              mb: 2,
              fontSize: { xs: '2rem', md: '3rem' },
              background: 'linear-gradient(135deg, #fff, #c4b5fd)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: mode === 'dark' ? 'transparent' : undefined,
              color: mode === 'light' ? 'primary.dark' : undefined,
            }}
          >
            ChordBook
          </Typography>
          <Typography
            variant="h6"
            sx={{
              mb: 4,
              color: mode === 'dark' ? 'rgba(255,255,255,0.85)' : 'text.secondary',
            }}
          >
            אקורדים לשירים האהובים עליך
          </Typography>
          <Box sx={{ maxWidth: 520, mx: 'auto', mb: 3 }}>
            <SearchBar songs={songs} large placeholder="חפש שיר או אמן..." />
          </Box>
          <Button
            variant="contained"
            size="large"
            startIcon={<SearchIcon />}
            onClick={() => document.querySelector('input')?.focus()}
            sx={{ px: 4 }}
          >
            חפש שיר
          </Button>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {playlistsError && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            לא ניתן לטעון פלייליסטים: {playlistsError}
          </Alert>
        )}
        {playlistsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4, mb: 2 }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          playlists.length > 0 && (
            <Box sx={{ mb: 5 }}>
              <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
                פלייליסטים
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'repeat(2, 1fr)',
                    md: 'repeat(4, 1fr)',
                  },
                  gap: 2,
                }}
              >
                {playlists.map((playlist) => (
                  <PlaylistCard key={playlist.id} playlist={playlist} />
                ))}
              </Box>
            </Box>
          )
        )}

        {songsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
              כל השירים ({songs.length})
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {songs.map((song) => (
                <SongCard key={song.id} song={song} />
              ))}
              {songs.length === 0 && (
                <Typography color="text.secondary" textAlign="center" py={4}>
                  אין שירים עדיין.
                </Typography>
              )}
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
}
