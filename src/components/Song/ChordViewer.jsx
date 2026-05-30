import { useRef, useEffect, useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Portal from '@mui/material/Portal';
import Fade from '@mui/material/Fade';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { extractUniqueChords, detectSections } from '../../utils/chords';
import { formatSongContentToHtml } from '../../utils/songRender';
import {
  getTextDirection,
  getTextAlign,
  getReadingAlignItems,
  getOppositeHorizontalStyle,
} from '../../utils/direction';
import PianoChordCard from './PianoChordCard';

export default function ChordViewer({
  content,
  language = 'he',
  fontSize = 18,
  fontFamily = 'Rubik',
}) {
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));
  const contentRef = useRef(null);
  const [selectedChord, setSelectedChord] = useState(null);

  const direction = getTextDirection(language);
  const textAlign = getTextAlign(language);

  const sections = detectSections(content);
  const uniqueChords = extractUniqueChords(content);
  const html = formatSongContentToHtml(content, theme, direction);

  const isDark = theme.palette.mode === 'dark';
  const chordColor = isDark ? '#60a5fa' : '#2563eb';
  const chordBg = isDark ? 'rgba(96, 165, 250, 0.15)' : 'rgba(37, 99, 235, 0.12)';
  const chordStyle = {
    display: 'inline-block',
    color: chordColor,
    backgroundColor: chordBg,
    borderRadius: '6px',
    padding: '1px 7px',
    margin: '0 2px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'background-color 0.15s',
    border: `1px solid ${isDark ? 'rgba(96, 165, 250, 0.2)' : 'rgba(37, 99, 235, 0.15)'}`,
    '&:hover': {
      backgroundColor: isDark ? 'rgba(96, 165, 250, 0.25)' : 'rgba(37, 99, 235, 0.22)',
    },
    '&.chord-active': {
      backgroundColor: isDark ? 'rgba(96, 165, 250, 0.32)' : 'rgba(37, 99, 235, 0.28)',
      borderColor: isDark ? 'rgba(96, 165, 250, 0.45)' : 'rgba(37, 99, 235, 0.4)',
    },
  };

  const handleChordSelect = useCallback((chord) => {
    setSelectedChord(chord);
  }, []);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return undefined;

    const onClick = (e) => {
      const chordEl = e.target.closest('.chord');
      if (!chordEl || !el.contains(chordEl)) return;
      e.preventDefault();
      const chord = chordEl.getAttribute('data-chord');
      if (chord) handleChordSelect(chord);
    };

    const onKeyDown = (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const chordEl = e.target.closest?.('.chord');
      if (!chordEl || !el.contains(chordEl)) return;
      e.preventDefault();
      const chord = chordEl.getAttribute('data-chord');
      if (chord) handleChordSelect(chord);
    };

    el.addEventListener('click', onClick);
    el.addEventListener('keydown', onKeyDown);
    return () => {
      el.removeEventListener('click', onClick);
      el.removeEventListener('keydown', onKeyDown);
    };
  }, [html, handleChordSelect]);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    el.querySelectorAll('.chord').forEach((node) => {
      const c = node.getAttribute('data-chord');
      node.classList.toggle('chord-active', c === selectedChord);
    });
  }, [selectedChord, html]);

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, pb: 4 }}>
      {sections.length > 0 && (
        <Box
          dir={direction}
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            mb: 2,
            justifyContent: getReadingAlignItems(),
          }}
        >
          {sections.map((s, i) => (
            <Chip key={`${s}-${i}`} label={s} size="small" color="primary" variant="outlined" />
          ))}
        </Box>
      )}

      <Box sx={{ position: 'relative' }}>
        <Box
          ref={contentRef}
          className="song-content"
          dir={direction}
          dangerouslySetInnerHTML={{ __html: html }}
          sx={{
            direction,
            textAlign,
            fontFamily: `"${fontFamily}", sans-serif`,
            fontSize: `${fontSize}px`,
            color: 'text.primary',
            '& .song-line': {
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            },
            '& .song-chords': {
              fontFamily: `"${fontFamily}", "Courier New", monospace`,
              lineHeight: 1.35,
              marginBottom: 0,
              paddingBottom: 0,
              letterSpacing: '0.02em',
            },
            '& .song-lyric': {
              lineHeight: 1.75,
              marginTop: 0.15,
              marginBottom: 0.5,
            },
            '& .song-lyric + .song-chords, & .song-chords + .song-lyric': {
              marginTop: 0.1,
            },
            '& .song-section': {
              marginTop: 1.75,
              marginBottom: 0.35,
              fontWeight: 700,
              fontSize: '0.95em',
              color: 'primary.light',
            },
            '& .song-section .section-label': {
              display: 'inline-block',
              direction: 'rtl',
            },
            '& .song-heading': {
              lineHeight: 1.5,
              marginBottom: 1.25,
              opacity: 0.9,
              fontWeight: 600,
            },
            '& .song-empty': {
              lineHeight: 0.6,
              fontSize: '0.35em',
            },
            '& .chord': chordStyle,
          }}
        />

        {selectedChord && (
          <Portal>
            <Fade in>
              <Box
                onClick={() => setSelectedChord(null)}
                sx={{
                  position: 'fixed',
                  inset: 0,
                  zIndex: 1299,
                  bgcolor: { xs: 'rgba(0,0,0,0.35)', md: 'transparent' },
                }}
              />
            </Fade>
            <Box
              sx={{
                position: 'fixed',
                zIndex: 1300,
                left: { xs: '50%', md: 'auto' },
                top: { xs: 'auto', md: 100 },
                bottom: { xs: 24, md: 'auto' },
                transform: { xs: 'translateX(-50%)', md: 'none' },
                width: { xs: 'calc(100% - 32px)', sm: 340 },
                maxWidth: 360,
                pointerEvents: 'auto',
              }}
              style={mdUp ? getOppositeHorizontalStyle(language, 24) : undefined}
              onClick={(e) => e.stopPropagation()}
            >
              <PianoChordCard
                chord={selectedChord}
                onClose={() => setSelectedChord(null)}
              />
            </Box>
          </Portal>
        )}
      </Box>

      {uniqueChords.length > 0 && (
        <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            אקורדים בשיר
          </Typography>
          <Box
            dir={direction}
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
              justifyContent: getReadingAlignItems(),
            }}
          >
            {uniqueChords.map((chord) => (
              <Chip
                key={chord}
                label={chord}
                size="small"
                onClick={() => handleChordSelect(chord)}
                sx={{
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  color: '#2563eb',
                  bgcolor: 'rgba(37, 99, 235, 0.12)',
                  border: '1px solid rgba(37, 99, 235, 0.15)',
                  ...(selectedChord === chord && {
                    bgcolor: 'rgba(37, 99, 235, 0.28)',
                    borderColor: 'rgba(37, 99, 235, 0.4)',
                  }),
                }}
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}
