import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import SongHero from '../components/Song/SongHero';
import ActionBar from '../components/Song/ActionBar';
import ChordViewer from '../components/Song/ChordViewer';
import YouTubeEmbed from '../components/Song/YouTubeEmbed';
import { parseYouTubeVideoId } from '../utils/youtube';
import AddToPlaylistDialog from '../components/Song/AddToPlaylistDialog';
import MoreSongsByArtist from '../components/Song/MoreSongsByArtist';
import SongHeroTags from '../components/Song/SongHeroTags';
import { useSongs } from '../hooks/useSongs';
import { usePlaylists } from '../hooks/usePlaylists';
import { useAuth } from '../contexts/AuthContext';
import { transposeContent, simplifyChords } from '../utils/chords';
import { detectLanguage } from '../utils/direction';
import { editSongPath } from '../utils/routes';
import { findArtistSlugForSong } from '../utils/artists';
import { useSongTranspose } from '../hooks/useSongTranspose';
import { MIN_SEMITONES, MAX_SEMITONES } from '../config/songPreferences';

const BOOK_COLUMNS_STORAGE_KEY = 'chordbook-book-columns-expanded';

function loadBookColumnsExpanded() {
  try {
    return localStorage.getItem(BOOK_COLUMNS_STORAGE_KEY) !== 'false';
  } catch {
    return true;
  }
}

export default function SongPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { songs, getSongBySlug, loading } = useSongs();
  const { isAdmin } = useAuth();
  const { playlists, addSongToPlaylist, createPlaylist } = usePlaylists();

  const song = getSongBySlug(slug);
  const [semitones, setSemitones] = useSongTranspose(slug);
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState('Rubik');
  const [scrollSpeed, setScrollSpeed] = useState(0);
  const [playlistDialogOpen, setPlaylistDialogOpen] = useState(false);
  const [snack, setSnack] = useState('');
  const [youtubeOpen, setYoutubeOpen] = useState(false);
  const [chordsSimplified, setChordsSimplified] = useState(false);
  const [columnsExpanded, setColumnsExpanded] = useState(loadBookColumnsExpanded);

  useEffect(() => {
    setFontSize(16);
    setFontFamily('Rubik');
    setScrollSpeed(0);
    setYoutubeOpen(false);
    setChordsSimplified(false);
  }, [slug]);

  const displayContent = useMemo(() => {
    if (!song?.content) return '';
    let text = transposeContent(song.content, semitones);
    if (chordsSimplified) text = simplifyChords(text);
    return text;
  }, [song?.content, semitones, chordsSimplified]);

  const youtubeVideoId = useMemo(
    () => parseYouTubeVideoId(song?.youtubeUrl),
    [song?.youtubeUrl]
  );

  const language = useMemo(() => {
    if (!song) return 'he';
    const text = [song.title, song.artist, song.content].filter(Boolean).join('\n');
    const detected = detectLanguage(text);
    if (detected === 'en' && /[\u0590-\u05FF]/.test(text)) return 'he';
    return detected;
  }, [song?.title, song?.artist, song?.content]);

  const artistSlug = useMemo(
    () => (song ? findArtistSlugForSong(song, songs) : null),
    [song, songs]
  );

  const songPlaylists = useMemo(
    () => playlists.filter((p) => (p.songIds || []).includes(song?.id)),
    [playlists, song?.id]
  );

  if (loading && !song) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!song) {
    return (
      <Typography textAlign="center" py={8}>
        השיר לא נמצא
      </Typography>
    );
  }

  return (
    <Box sx={{ pb: 6 }}>
      <SongHero song={song} />

      <ActionBar
        semitones={semitones}
        onTransposeUp={() => setSemitones((s) => Math.min(MAX_SEMITONES, s + 1))}
        onTransposeDown={() => setSemitones((s) => Math.max(MIN_SEMITONES, s - 1))}
        fontSize={fontSize}
        fontFamily={fontFamily}
        onFontSizeChange={setFontSize}
        onFontFamilyChange={setFontFamily}
        onAddToPlaylist={isAdmin ? () => setPlaylistDialogOpen(true) : undefined}
        onEdit={isAdmin ? () => navigate(editSongPath(song)) : undefined}
        hasYouTube={!!youtubeVideoId}
        youtubeOpen={youtubeOpen}
        onToggleYouTube={() => setYoutubeOpen((v) => !v)}
        scrollSpeed={scrollSpeed}
        onScrollSpeedChange={setScrollSpeed}
        chordsSimplified={chordsSimplified}
        onToggleSimplifyChords={() => setChordsSimplified((v) => !v)}
        columnsExpanded={columnsExpanded}
        onToggleColumnsExpanded={() => {
          setColumnsExpanded((v) => {
            const next = !v;
            try {
              localStorage.setItem(BOOK_COLUMNS_STORAGE_KEY, String(next));
            } catch {
              // localStorage unavailable — ignore
            }
            return next;
          });
        }}
        language={language}
      />

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
          alignItems: 'flex-start',
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
          <ChordViewer
            key={`${song?.id}-${semitones}-${chordsSimplified}-${fontSize}-${fontFamily}`}
            content={displayContent}
            language={language}
            fontSize={fontSize}
            fontFamily={fontFamily}
            columnsExpanded={columnsExpanded}
          />
        </Box>
        {youtubeOpen && youtubeVideoId && (
          <YouTubeEmbed videoId={youtubeVideoId} title={song.title} autoplay />
        )}
      </Box>

      <SongHeroTags
        artistName={song.artist}
        artistSlug={artistSlug}
        playlists={songPlaylists}
      />

      <MoreSongsByArtist song={song} songs={songs} />

      {isAdmin && (
        <AddToPlaylistDialog
          open={playlistDialogOpen}
          onClose={() => setPlaylistDialogOpen(false)}
          playlists={playlists}
          onSelect={async (playlistId) => {
            await addSongToPlaylist(playlistId, song.id);
            setPlaylistDialogOpen(false);
            setSnack('נוסף לפלייליסט!');
          }}
          onCreate={async (name) => {
            const plId = await createPlaylist(name);
            await addSongToPlaylist(plId, song.id);
            setPlaylistDialogOpen(false);
            setSnack('פלייליסט נוצר והשיר נוסף!');
          }}
        />
      )}

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')}>
        <Alert severity="success">{snack}</Alert>
      </Snackbar>
    </Box>
  );
}
