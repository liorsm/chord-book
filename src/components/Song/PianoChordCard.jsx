import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import {
  getChordSemitones,
  getChordVoicing,
  getKeyboardRangeForVoicing,
  buildKeyboardKeys,
  getWhiteKeyIndex,
  countWhiteKeys,
} from '../../utils/pianoChords';

const KEY_H = 72;
const BLACK_H = 44;
const DOT_WHITE = 8;
const DOT_BLACK = 6;

/**
 * מקלדת רוחב מלא — קלידים צרים יותר כדי להכניס שתי אוקטבות.
 * left ב-style אינליין כי stylis-plugin-rtl הופך left↔right ב-sx.
 */
function PianoKeys({ activeSemis, start, end }) {
  const activeSet = new Set(activeSemis);
  const keys = buildKeyboardKeys(start, end);
  const whiteCount = countWhiteKeys(start, end);
  const whitePct = 100 / whiteCount;
  const blackPct = whitePct * 0.62;

  return (
    <Box
      dir="ltr"
      sx={{
        position: 'relative',
        width: '100%',
        height: KEY_H,
        direction: 'ltr',
      }}
    >
      {keys
        .filter((k) => !k.isBlack)
        .map((k) => {
          const wi = getWhiteKeyIndex(k.semi, start);
          const active = activeSet.has(k.semi);
          return (
            <Box
              key={`w-${k.semi}`}
              style={{ left: `${wi * whitePct}%`, width: `calc(${whitePct}% - 1px)` }}
              sx={{
                position: 'absolute',
                top: 0,
                height: KEY_H,
                bgcolor: active ? '#fecaca' : '#fff',
                border: '1px solid #cbd5e1',
                borderRadius: '0 0 3px 3px',
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                pb: '8px',
              }}
            >
              {active && (
                <Box
                  sx={{
                    width: DOT_WHITE,
                    height: DOT_WHITE,
                    borderRadius: '50%',
                    bgcolor: '#ef4444',
                    flexShrink: 0,
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
              style={{
                left: `calc(${wi * whitePct}% - ${blackPct / 2}%)`,
                width: `${blackPct}%`,
              }}
              sx={{
                position: 'absolute',
                top: 0,
                height: BLACK_H,
                bgcolor: active ? '#7f1d1d' : '#1e293b',
                borderRadius: '0 0 2px 2px',
                zIndex: 1,
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                pb: '5px',
              }}
            >
              {active && (
                <Box
                  sx={{
                    width: DOT_BLACK,
                    height: DOT_BLACK,
                    borderRadius: '50%',
                    bgcolor: '#ef4444',
                    flexShrink: 0,
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
  const pitchClasses = getChordSemitones(chord);
  const voicing = getChordVoicing(pitchClasses);
  const { start, end } = getKeyboardRangeForVoicing(voicing);

  return (
    <Paper
      elevation={4}
      dir="ltr"
      sx={{
        width: '100%',
        maxWidth: 350,
        flexShrink: 0,
        borderRadius: 2,
        overflow: 'hidden',
        p: 1.5,
        direction: 'ltr',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 1,
          position: 'relative',
        }}
      >
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
            style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)' }}
            aria-label="סגור"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      <Box sx={{ width: '100%', direction: 'ltr' }} dir="ltr">
        <PianoKeys activeSemis={voicing} start={start} end={end} />
      </Box>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: 'block', textAlign: 'center', mt: 1 }}
        dir="rtl"
      >
        לחץ על אקורד אחר לעדכון
      </Typography>
    </Paper>
  );
}
