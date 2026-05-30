import { useMemo } from "react";
import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import SongCard from "./SongCard";
import {
  normalizeArtistKey,
  deriveArtistsFromSongs,
} from "../../utils/artists";
import { artistPath } from "../../utils/routes";

const MAX_RELATED = 4;

export default function MoreSongsByArtist({ song, songs }) {
  const { relatedSongs, artistName, artistSlug } = useMemo(() => {
    const name = song?.artist?.trim();
    if (!name || !songs?.length) {
      return { relatedSongs: [], artistName: "", artistSlug: null };
    }

    const key = normalizeArtistKey(name);
    const sameArtist = songs.filter(
      (s) => normalizeArtistKey(s.artist) === key,
    );
    if (sameArtist.length < 2) {
      return { relatedSongs: [], artistName: name, artistSlug: null };
    }

    const artist = deriveArtistsFromSongs(songs).find(
      (a) => normalizeArtistKey(a.name) === key,
    );

    return {
      relatedSongs: sameArtist
        .filter((s) => s.id !== song.id)
        .slice(0, MAX_RELATED),
      artistName: name,
      artistSlug: artist?.slug ?? null,
    };
  }, [song, songs]);

  if (relatedSongs.length === 0) return null;

  return (
    <Container maxWidth="lg" sx={{ mt: 5, px: { xs: 2, sm: 3 } }}>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 1,
          mb: 2,
        }}
      >
        <Typography variant="h5" fontWeight={700}>
          עוד של {artistName}
        </Typography>
        {artistSlug && (
          <Button
            component={RouterLink}
            to={artistPath({ slug: artistSlug })}
            size="small"
          >
            הכל
          </Button>
        )}
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {relatedSongs.map((s) => (
          <SongCard key={s.id} song={s} />
        ))}
      </Box>
    </Container>
  );
}
