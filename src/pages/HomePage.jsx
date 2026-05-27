import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Fab from '@mui/material/Fab';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CircularProgress from '@mui/material/CircularProgress';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay';
import { motion } from 'framer-motion';
import SearchBar from '../components/Search/SearchBar';
import SongCard from '../components/Song/SongCard';
import { useSongs } from '../hooks/useSongs';
import { usePlaylists } from '../hooks/usePlaylists';
import { useThemeMode } from '../ThemeContext';
import { playlistPath } from '../utils/routes';
import { getPlaylistCoverBackground } from '../utils/artistImage';

export default function HomePage() {
  const navigate = useNavigate();
  const { mode } = useThemeMode();
  const { songs, loading, toggleFavorite } = useSongs();
  const { playlists, createPlaylist } = usePlaylists();

  const handleCreatePlaylist = async () => {
    const name = prompt('שם הפלייליסט:');
    if (name) await createPlaylist(name);
  };

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
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" fontWeight={700}>
                  הפלייליסטים שלי
                </Typography>
                <Button startIcon={<PlaylistPlayIcon />} onClick={handleCreatePlaylist}>
                  פלייליסט חדש
                </Button>
              </Box>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
                  gap: 2,
                }}
              >
                {playlists.map((pl) => (
                  <Card key={pl.id} sx={{ overflow: 'hidden' }}>
                    <CardActionArea onClick={() => navigate(playlistPath(pl))}>
                      <Box
                        sx={{
                          height: 128,
                          backgroundImage: getPlaylistCoverBackground(
                            pl.coverColor,
                            pl.name || pl.id
                          ),
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          p: 2,
                          position: 'relative',
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            inset: 0,
                            background:
                              'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.22) 100%)',
                            pointerEvents: 'none',
                          },
                        }}
                      >
                        <Typography
                          sx={{
                            position: 'relative',
                            zIndex: 1,
                            color: 'white',
                            fontWeight: 800,
                            fontSize: { xs: '1rem', sm: '1.15rem' },
                            textAlign: 'center',
                            lineHeight: 1.3,
                            textShadow: '0 2px 12px rgba(0,0,0,0.4)',
                            px: 1,
                          }}
                        >
                          {pl.name}
                        </Typography>
                      </Box>
                    </CardActionArea>
                  </Card>
                ))}
              </Box>
              {playlists.length === 0 && (
                <Typography color="text.secondary" textAlign="center" py={2}>
                  אין פלייליסטים עדיין. צור אחד!
                </Typography>
              )}
            </Box>

            <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
              כל השירים ({songs.length})
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {songs.map((song) => (
                <SongCard key={song.id} song={song} onToggleFavorite={toggleFavorite} />
              ))}
              {songs.length === 0 && (
                <Typography color="text.secondary" textAlign="center" py={4}>
                  אין שירים עדיין. הוסף שיר ראשון!
                </Typography>
              )}
            </Box>
          </>
        )}
      </Container>

      <Fab
        color="primary"
        aria-label="הוסף שיר"
        onClick={() => navigate('/add')}
        sx={{ position: 'fixed', bottom: { xs: 88, md: 24 }, left: 24 }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
}
