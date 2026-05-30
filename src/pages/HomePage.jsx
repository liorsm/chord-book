import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { motion } from 'framer-motion';
import SearchBar from '../components/Search/SearchBar';
import SongCard from '../components/Song/SongCard';
import PlaylistCard from '../components/Playlist/PlaylistCard';
import { useSongs } from '../hooks/useSongs';
import { usePlaylists } from '../hooks/usePlaylists';
export default function HomePage() {
  const { songs, loading: songsLoading } = useSongs();
  const { playlists, loading: playlistsLoading, error: playlistsError } = usePlaylists();

  return (
    <Box>
      <Box
        component={motion.section}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        sx={{
          position: 'relative',
          overflow: 'hidden',
          py: { xs: 6, md: 10 },
          px: 2,
          textAlign: 'center',
          borderRadius: { md: 0 },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${import.meta.env.BASE_URL}bg-hero.jpg)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to bottom, rgba(81, 181, 229, 0.5) 0%, rgba(74, 140, 230, 0.5) 35%, rgba(83, 86, 224, 0.5) 65%, rgba(125, 38, 223, 0.5) 100%);',
          }}
        />
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              mb: 2,
              fontSize: { xs: '2rem', md: '3rem' },
              background: 'linear-gradient(135deg, #fff, #c4b5fd)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            ChordBook
          </Typography>
          <Typography
            variant="h6"
            sx={{
              mb: 4,
              color: 'rgba(255,255,255,0.9)',
            }}
          >
            אקורדים לשירים האהובים עליך
          </Typography>
          <Box sx={{ maxWidth: 520, mx: 'auto' }}>
            <SearchBar songs={songs} large placeholder="חפש שיר או אמן..." />
          </Box>
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
