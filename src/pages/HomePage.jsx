import { useState, useEffect, useMemo } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Pagination from "@mui/material/Pagination";
import SearchBar from "../components/Search/SearchBar";
import SurpriseSongButton from "../components/Search/SurpriseSongButton";
import SongCard from "../components/Song/SongCard";
import PlaylistCard from "../components/Playlist/PlaylistCard";
import HeroSection from "../components/common/HeroSection";
import { useSongs } from "../hooks/useSongs";
import { usePlaylists } from "../hooks/usePlaylists";
import { shuffleArray } from "../utils/randomSong";

const SONGS_PER_PAGE = 10;

export default function HomePage() {
  const [page, setPage] = useState(1);
  const { songs, loading: songsLoading } = useSongs();
  const {
    playlists,
    loading: playlistsLoading,
    error: playlistsError,
  } = usePlaylists();

  const displaySongs = useMemo(() => shuffleArray(songs), [songs]);

  const totalPages = Math.ceil(displaySongs.length / SONGS_PER_PAGE) || 1;

  useEffect(() => {
    setPage(1);
  }, [songs]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginatedSongs = displaySongs.slice(
    (page - 1) * SONGS_PER_PAGE,
    page * SONGS_PER_PAGE
  );

  return (
    <Box>
      <HeroSection title="אקורדים לשירים">
        <Box
          sx={{
            maxWidth: 560,
            mx: "auto",
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <SearchBar songs={songs} large placeholder="חפש שיר או אמן..." />
          </Box>
          <SurpriseSongButton songs={songs} disabled={songsLoading} />
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
                    sm: "repeat(3, 1fr)",
                    md: "repeat(4, 1fr)",
                    lg: "repeat(6, 1fr)",
                  },
                  gap: { xs: 2, lg: 1.5 },
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
              {paginatedSongs.map((song) => (
                <SongCard key={song.id} song={song} />
              ))}
              {songs.length === 0 && (
                <Typography color="text.secondary" textAlign="center" py={4}>
                  אין שירים עדיין.
                </Typography>
              )}
            </Box>
            {totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}
