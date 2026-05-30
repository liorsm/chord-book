import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import SearchBar from "../components/Search/SearchBar";
import SongCard from "../components/Song/SongCard";
import PlaylistCard from "../components/Playlist/PlaylistCard";
import HeroSection from "../components/common/HeroSection";
import { useSongs } from "../hooks/useSongs";
import { usePlaylists } from "../hooks/usePlaylists";

export default function HomePage() {
  const { songs, loading: songsLoading } = useSongs();
  const {
    playlists,
    loading: playlistsLoading,
    error: playlistsError,
  } = usePlaylists();

  return (
    <Box>
      <HeroSection title="אקורדים לשירים">
        <Box sx={{ maxWidth: 520, mx: "auto" }}>
          <SearchBar songs={songs} large placeholder="חפש שיר או אמן..." />
        </Box>
      </HeroSection>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {playlistsError && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            לא ניתן לטעון פלייליסטים: {playlistsError}
          </Alert>
        )}
        {playlistsLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4, mb: 2 }}>
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
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "repeat(2, 1fr)",
                    md: "repeat(4, 1fr)",
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
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
              כל השירים ({songs.length})
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
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
