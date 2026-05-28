import { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import ImageSearchIcon from '@mui/icons-material/ImageSearch';
import YouTubeIcon from '@mui/icons-material/YouTube';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import SaveIcon from '@mui/icons-material/Save';
import ChordViewer from './ChordViewer';
import DraggableImageFrame from './DraggableImageFrame';
import { fetchArtistImage } from '../../utils/artistImage';
import { fetchYouTubeVideoUrl } from '../../utils/youtube';
import { fetchTab4uContent, tab4uImportUnavailableMessage } from '../../utils/tab4u';
import {
  DEFAULT_ARTIST_IMAGE_POSITION_Y,
  artistImageBackgroundStyle,
  normalizeArtistImagePositionY,
} from '../../utils/artistImagePosition';
import { detectLanguage } from '../../utils/direction';
import { useArtists } from '../../hooks/useArtists';
import ArtistAutocomplete from './ArtistAutocomplete';
import PlaylistAutocomplete from './PlaylistAutocomplete';

export default function SongForm({
  initial = {},
  initialPlaylists = [],
  playlists,
  playlistsLoading = false,
  onSubmit,
  submitLabel = 'שמור שיר',
  showPreview = true,
}) {
  const [title, setTitle] = useState(initial.title || '');
  const [artist, setArtist] = useState(initial.artist || '');
  const [content, setContent] = useState(initial.content || '');
  const [artistImageUrl, setArtistImageUrl] = useState(initial.artistImageUrl || '');
  const [artistImagePositionY, setArtistImagePositionY] = useState(
    normalizeArtistImagePositionY(
      initial.artistImagePositionY ?? DEFAULT_ARTIST_IMAGE_POSITION_Y
    )
  );
  const [youtubeUrl, setYoutubeUrl] = useState(initial.youtubeUrl || '');
  const [imageLoading, setImageLoading] = useState(false);
  const [youtubeLoading, setYoutubeLoading] = useState(false);
  const [tab4uLoading, setTab4uLoading] = useState(false);

  useEffect(() => {
    setArtistImagePositionY(
      normalizeArtistImagePositionY(
        initial.artistImagePositionY ?? DEFAULT_ARTIST_IMAGE_POSITION_Y
      )
    );
  }, [initial.artistImageUrl, initial.artistImagePositionY]);

  const handleImageUrlChange = (url) => {
    setArtistImageUrl(url);
    if (!url.trim()) {
      setArtistImagePositionY(DEFAULT_ARTIST_IMAGE_POSITION_Y);
    }
  };
  const [selectedPlaylists, setSelectedPlaylists] = useState(initialPlaylists);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { artists } = useArtists();

  const initialPlaylistKey = initialPlaylists
    .map((p) => p.id)
    .sort()
    .join(',');

  useEffect(() => {
    setSelectedPlaylists(initialPlaylists);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync when membership ids change
  }, [initialPlaylistKey]);

  const handleArtistSelect = (selected) => {
    if (selected.imageUrl) {
      setArtistImageUrl(selected.imageUrl);
      setArtistImagePositionY(
        normalizeArtistImagePositionY(
          selected.imagePositionY ?? DEFAULT_ARTIST_IMAGE_POSITION_Y
        )
      );
    }
  };

  const handleFetchYoutube = async () => {
    if (!title.trim() && !artist.trim()) return;
    setYoutubeLoading(true);
    setError('');
    try {
      const url = await fetchYouTubeVideoUrl(title, artist);
      setYoutubeUrl(url || '');
      if (!url) {
        setError(
          import.meta.env.PROD && !import.meta.env.VITE_YOUTUBE_API_KEY
            ? 'לא נמצא סרטון. בפרודקשן הוסף VITE_YOUTUBE_API_KEY, או הדבק קישור ידנית.'
            : 'לא נמצא סרטון. הדבק קישור YouTube ידנית.'
        );
      }
    } catch {
      setError('שגיאה בחיפוש סרטון YouTube');
    } finally {
      setYoutubeLoading(false);
    }
  };

  const handleImportTab4u = async () => {
    if (!title.trim() && !artist.trim()) return;
    setTab4uLoading(true);
    setError('');
    try {
      const result = await fetchTab4uContent(title, artist);
      if (result?.content) {
        setContent(result.content);
      } else {
        setError(tab4uImportUnavailableMessage());
      }
    } catch {
      setError('שגיאה בייבוא מ-TAB4U');
    } finally {
      setTab4uLoading(false);
    }
  };

  const handleFetchImage = async () => {
    if (!artist.trim()) return;
    setImageLoading(true);
    setError('');
    try {
      const url = await fetchArtistImage(artist);
      setArtistImageUrl(url || '');
      if (url) setArtistImagePositionY(DEFAULT_ARTIST_IMAGE_POSITION_Y);
      if (!url) setError('לא נמצאה תמונה. יוצג רקע gradient.');
    } catch {
      setError('שגיאה בחיפוש תמונה');
    } finally {
      setImageLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !artist.trim() || !content.trim()) {
      setError('נא למלא את כל השדות');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSubmit({
        title: title.trim(),
        artist: artist.trim(),
        content: content.trim(),
        artistImageUrl: artistImageUrl.trim() || null,
        artistImagePositionY: artistImageUrl.trim()
          ? artistImagePositionY
          : null,
        youtubeUrl: youtubeUrl.trim() || null,
        playlistIds: selectedPlaylists.map((p) => p.id),
      });
    } catch (err) {
      setError(err.message || 'שגיאה בשמירה');
    } finally {
      setSaving(false);
    }
  };

  const language = detectLanguage(content + title + artist);

  return (
    <>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3, mb: 4 }}>
        <TextField
          fullWidth
          label="שם השיר"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <ArtistAutocomplete
            artists={artists}
            value={artist}
            onChange={setArtist}
            onArtistSelect={handleArtistSelect}
          />
          <Button
            variant="outlined"
            onClick={handleFetchImage}
            disabled={imageLoading || !artist.trim()}
            startIcon={imageLoading ? <CircularProgress size={20} /> : <ImageSearchIcon />}
            sx={{ minWidth: 140, flexShrink: 0 }}
          >
            חפש תמונה
          </Button>
        </Box>
        {playlists && (
          <Box sx={{ mb: 2 }}>
            <PlaylistAutocomplete
              playlists={playlists}
              value={selectedPlaylists}
              onChange={setSelectedPlaylists}
              disabled={playlistsLoading}
            />
          </Box>
        )}
        <TextField
          fullWidth
          label="כתובת תמונת אמן"
          value={artistImageUrl}
          onChange={(e) => handleImageUrlChange(e.target.value)}
          placeholder="https://..."
          helperText="מתמלא אוטומטית בלחיצה על «חפש תמונה», או הדבק/ערוך כתובת בעצמך"
          sx={{ mb: 2 }}
        />
        <DraggableImageFrame
          imageUrl={artistImageUrl}
          positionY={artistImagePositionY}
          onPositionYChange={setArtistImagePositionY}
          height={160}
        />
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TextField
            fullWidth
            label="קישור YouTube להשמעה"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            helperText="לחץ «חפש ביוטיוב» או הדבק/ערוך קישור בעצמך"
          />
          <Button
            variant="outlined"
            onClick={handleFetchYoutube}
            disabled={youtubeLoading || (!title.trim() && !artist.trim())}
            startIcon={
              youtubeLoading ? <CircularProgress size={20} /> : <YouTubeIcon />
            }
            sx={{ minWidth: 150, flexShrink: 0, alignSelf: 'flex-start', mt: 0.5 }}
          >
            חפש ביוטיוב
          </Button>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'flex-start' }}>
          <TextField
            fullWidth
            label="מילים ואקורדים"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            multiline
            rows={14}
            required
            placeholder="הדבק מילים עם אקורדים, או לחץ «ייבא מ-TAB4U» אחרי מילוי שם שיר ואמן"
            helperText="לחץ «ייבא מ-TAB4U» לחיפוש לפי שם השיר והאמן"
            sx={{ fontFamily: 'monospace' }}
          />
          <Button
            variant="outlined"
            onClick={handleImportTab4u}
            disabled={tab4uLoading || (!title.trim() && !artist.trim())}
            startIcon={
              tab4uLoading ? <CircularProgress size={20} /> : <ContentPasteIcon />
            }
            sx={{ minWidth: 150, flexShrink: 0, alignSelf: 'flex-start', mt: 0.5 }}
          >
            ייבא מ-TAB4U
          </Button>
        </Box>
        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          disabled={saving}
          startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
        >
          {submitLabel}
        </Button>
      </Paper>

      {showPreview && content && (
        <Box>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            תצוגה מקדימה
          </Typography>
          <Paper sx={{ overflow: 'hidden' }}>
            <Box
              sx={{
                height: 100,
                ...(artistImageUrl.trim()
                  ? artistImageBackgroundStyle(artistImageUrl.trim(), artistImagePositionY)
                  : {
                      background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                    }),
              }}
            />
            <ChordViewer content={content} language={language} fontSize={16} />
          </Paper>
        </Box>
      )}
    </>
  );
}
