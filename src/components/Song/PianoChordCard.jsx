import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import {
  getChordSemitones,
  getKeyboardRange,
  buildKeyboardKeys,
  getWhiteKeyIndex,
  countWhiteKeys,
} from '../../utils/pianoChords';

const WHITE_W = 28;
const BLACK_W = 18;
const KEY_H = 88;
const BLACK_H = 54;

function PianoKeys({ semitones, start, end }) {
  const activeSet = new Set();
  for (let semi = start; semi < end; semi += 1) {
    if (semitones.includes(semi % 12)) activeSet.add(semi);
  }

  const keys = buildKeyboardKeys(start, end);
  const whiteCount = countWhiteKeys(start, end);
  const width = whiteCount * WHITE_W;

  return (
    <Box sx={{ position: 'relative', width, height: KEY_H, mx: 'auto' }}>
      {keys
        .filter((k) => !k.isBlack)
        .map((k) => {
          const wi = getWhiteKeyIndex(k.semi, start);
          const active = activeSet.has(k.semi);
          return (
            <Box
              key={`w-${k.semi}`}
              sx={{
                position: 'absolute',
                left: wi * WHITE_W,
                top: 0,
                width: WHITE_W - 1,
                height: KEY_H,
                bgcolor: active ? '#fecaca' : '#fff',
                border: '1px solid #cbd5e1',
                borderRadius: '0 0 4px 4px',
                boxSizing: 'border-box',
              }}
            >
              {active && (
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 10,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    bgcolor: '#ef4444',
                  }}
                />
              )}
            </Box>
          );
        })}
      {keys
        .filter((k) => k.isBlack)
        .map((k) => {
          const wi = getWhiteKeyIndex(k.semi, start);
          const active = activeSet.has(k.semi);
          return (
            <Box
              key={`b-${k.semi}`}
              sx={{
                position: 'absolute',
                left: wi * WHITE_W - BLACK_W / 2,
                top: 0,
                width: BLACK_W,
                height: BLACK_H,
                bgcolor: active ? '#7f1d1d' : '#1e293b',
                borderRadius: '0 0 3px 3px',
                zIndex: 1,
                boxSizing: 'border-box',
              }}
            >
              {active && (
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 6,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: '#ef4444',
                  }}
                />
              )}
            </Box>
          );
        })}
    </Box>
  );
}

export default function PianoChordCard({ chord, onClose }) {
  const semitones = getChordSemitones(chord);
  const { start, end } = getKeyboardRange(semitones);

  return (
    <Paper
      elevation={4}
      sx={{
        width: { xs: '100%', sm: 320 },
        flexShrink: 0,
        borderRadius: 2,
        overflow: 'hidden',
        p: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1, position: 'relative' }}>
        <Typography
          variant="h5"
          sx={{ fontWeight: 800, color: '#ef4444', fontFamily: 'monospace' }}
        >
          {chord}
        </Typography>
        {onClose && (
          <IconButton
            size="small"
            onClick={onClose}
            sx={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)' }}
            aria-label="סגור"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      <Box sx={{ overflowX: 'auto', pb: 1 }}>
        <PianoKeys semitones={semitones} start={start} end={end} />
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
        לחץ על אקורד אחר לעדכון
      </Typography>
    </Paper>
  );
}
