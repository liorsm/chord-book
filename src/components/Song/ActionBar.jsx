import { useEffect, useRef, useState } from 'react';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import CloseIcon from '@mui/icons-material/Close';
import FormatTextdirectionRToLIcon from '@mui/icons-material/FormatTextdirectionRToL';
import FormatTextdirectionLToRIcon from '@mui/icons-material/FormatTextdirectionLToR';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import YouTubeIcon from '@mui/icons-material/YouTube';
import Filter1Icon from '@mui/icons-material/Filter1';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Tooltip from '@mui/material/Tooltip';

const FONT_OPTIONS = [
  { value: 'Rubik', label: 'Rubik' },
  { value: 'Tahoma', label: 'Tahoma' },
  { value: 'Assistant', label: 'Assistant' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Courier New', label: 'Courier New' },
];

const MIN_FONT = 14;
const MAX_FONT = 28;
const MIN_SPEED = 0;
const MAX_SPEED = 8;

function formatTonality(semitones) {
  if (semitones === 0) return '0';
  if (semitones > 0) return `${semitones}♯`;
  return `${Math.abs(semitones)}♭`;
}

function SquareBtn({ children, onClick, disabled, active, color = 'primary', sx = {} }) {
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClick?.();
  };

  const gradients = {
    primary: {
      bg: 'linear-gradient(135deg, #7c3aed22, #a855f722)',
      bgActive: 'linear-gradient(135deg, #7c3aed55, #a855f755)',
      border: 'primary.main',
    },
    secondary: {
      bg: 'linear-gradient(135deg, #ec489922, #a855f722)',
      bgActive: 'linear-gradient(135deg, #ec489955, #a855f755)',
      border: 'secondary.main',
    },
  };

  const g = gradients[color] || gradients.primary;

  return (
    <IconButton
      size="small"
      disabled={disabled || !onClick}
      onClick={handleClick}
      sx={{
        width: 40,
        height: 40,
        borderRadius: 1.5,
        background: active ? g.bgActive : g.bg,
        border: '1px solid',
        borderColor: active ? g.border : 'divider',
        color: 'text.primary',
        flexShrink: 0,
        ...sx,
      }}
    >
      {children}
    </IconButton>
  );
}

function ScrollPopup({ open, speed, onSpeedUp, onSpeedDown, onStop, onClose, anchorRef }) {
  const popupRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!open || !anchorRef?.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    setPos({
      top: rect.top - 8,
      left: rect.left + rect.width / 2,
    });
  }, [open, anchorRef]);

  if (!open) return null;

  return (
    <Box
      ref={popupRef}
      sx={{
        position: 'fixed',
        top: pos.top,
        left: pos.left,
        transform: 'translate(-50%, -100%)',
        zIndex: 1400,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        p: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0.5,
        boxShadow: 6,
        minWidth: 52,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <IconButton size="small" onClick={onClose} sx={{ alignSelf: 'flex-end', p: 0.25 }}>
        <CloseIcon sx={{ fontSize: 16, color: 'secondary.main' }} />
      </IconButton>

      <SquareBtn color="secondary" onClick={onSpeedDown} disabled={speed <= MIN_SPEED}>
        <KeyboardArrowUpIcon fontSize="small" />
      </SquareBtn>

      <Box
        sx={{
          width: 40,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1.5,
        }}
      >
        <Typography variant="body2" fontWeight={700}>
          {speed}
        </Typography>
      </Box>

      <SquareBtn color="secondary" onClick={onSpeedUp} disabled={speed >= MAX_SPEED}>
        <KeyboardArrowDownIcon fontSize="small" />
      </SquareBtn>

      <Typography
        component="button"
        variant="caption"
        onClick={onStop}
        sx={{
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          color: 'secondary.main',
          fontWeight: 700,
          py: 0.5,
          fontSize: '0.75rem',
        }}
      >
        עצור
      </Typography>
    </Box>
  );
}

export default function ActionBar({
  semitones = 0,
  onTransposeUp,
  onTransposeDown,
  fontSize = 18,
  fontFamily = 'Rubik',
  onFontSizeChange,
  onFontFamilyChange,
  onAddToPlaylist,
  onToggleDirection,
  textDirection = 'rtl',
  hasYouTube,
  youtubeOpen,
  onToggleYouTube,
  scrollSpeed = 0,
  onScrollSpeedChange,
  chordsSimplified = false,
  onToggleSimplifyChords,
}) {
  const [fontPanelOpen, setFontPanelOpen] = useState(false);
  const [scrollPopupOpen, setScrollPopupOpen] = useState(false);
  const scrollBtnRef = useRef(null);
  const scrollIntervalRef = useRef(null);

  useEffect(() => {
    if (scrollSpeed <= 0) {
      if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
      return;
    }

    scrollIntervalRef.current = setInterval(() => {
      window.scrollBy({ top: scrollSpeed, behavior: 'auto' });
    }, 50);

    return () => {
      if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
    };
  }, [scrollSpeed]);

  const handleScrollStop = () => {
    onScrollSpeedChange(0);
  };

  const handleScrollSpeedUp = () => {
    onScrollSpeedChange(Math.min(MAX_SPEED, scrollSpeed + 1));
  };

  const handleScrollSpeedDown = () => {
    onScrollSpeedChange(Math.max(MIN_SPEED, scrollSpeed - 1));
  };

  return (
    <Paper
      elevation={6}
      sx={{
        mx: { xs: 2, md: 4 },
        mt: -4,
        mb: 3,
        position: 'relative',
        zIndex: 2,
        borderRadius: 3,
        p: 1.5,
      }}
    >
      {/* Tonality row */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1.5 }}>
        <SquareBtn color="secondary" onClick={onTransposeUp} disabled={semitones >= 6}>
          <ChevronRightIcon fontSize="small" />
        </SquareBtn>

        <Box
          sx={{
            flex: 1,
            maxWidth: 200,
            textAlign: 'center',
            py: 0.75,
            px: 1,
            bgcolor: 'background.default',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1.5,
          }}
        >
          <Typography variant="body2" fontWeight={600} noWrap>
            טון: {formatTonality(semitones)}
          </Typography>
        </Box>

        <SquareBtn color="secondary" onClick={onTransposeDown} disabled={semitones <= -6}>
          <ChevronLeftIcon fontSize="small" />
        </SquareBtn>
      </Box>

      {/* Main action buttons */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
        <SquareBtn
          active={fontPanelOpen}
          onClick={() => setFontPanelOpen((v) => !v)}
          sx={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: '0.85rem' }}
        >
          TT
        </SquareBtn>

        <SquareBtn onClick={onToggleDirection}>
          {textDirection === 'rtl' ? (
            <FormatTextdirectionRToLIcon fontSize="small" />
          ) : (
            <FormatTextdirectionLToRIcon fontSize="small" />
          )}
        </SquareBtn>

        {onToggleSimplifyChords && (
          <Tooltip title={chordsSimplified ? 'הצג אקורדים מלאים' : 'הפשט אקורדים (B7→B, Am7→Am)'}>
            <span>
              <SquareBtn active={chordsSimplified} onClick={onToggleSimplifyChords}>
                <Filter1Icon fontSize="small" />
              </SquareBtn>
            </span>
          </Tooltip>
        )}

        {onAddToPlaylist && (
          <SquareBtn onClick={onAddToPlaylist}>
            <PlaylistAddIcon fontSize="small" />
          </SquareBtn>
        )}

        {hasYouTube && (
          <SquareBtn active={youtubeOpen} onClick={onToggleYouTube}>
            <YouTubeIcon fontSize="small" />
          </SquareBtn>
        )}

        <Box ref={scrollBtnRef} sx={{ position: 'relative' }}>
          <SquareBtn
            active={scrollPopupOpen || scrollSpeed > 0}
            color="secondary"
            onClick={() => setScrollPopupOpen((v) => !v)}
          >
            <UnfoldMoreIcon fontSize="small" />
          </SquareBtn>

          {scrollPopupOpen && (
            <ClickAwayListener onClickAway={() => setScrollPopupOpen(false)}>
              <Box>
                <ScrollPopup
                  open={scrollPopupOpen}
                  speed={scrollSpeed}
                  onSpeedUp={handleScrollSpeedUp}
                  onSpeedDown={handleScrollSpeedDown}
                  onStop={handleScrollStop}
                  onClose={() => setScrollPopupOpen(false)}
                  anchorRef={scrollBtnRef}
                />
              </Box>
            </ClickAwayListener>
          )}
        </Box>
      </Box>

      {/* Font panel (TT toggle) */}
      {fontPanelOpen && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mt: 1.5,
            pt: 1.5,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <FormControl size="small" sx={{ flex: 1, minWidth: 0 }}>
            <Select
              value={fontFamily}
              onChange={(e) => onFontFamilyChange(e.target.value)}
              sx={{
                bgcolor: 'background.default',
                borderRadius: 1.5,
                '& .MuiSelect-select': { py: 0.75 },
              }}
            >
              {FONT_OPTIONS.map((f) => (
                <MenuItem key={f.value} value={f.value} sx={{ fontFamily: f.value }}>
                  {f.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <SquareBtn
              color="secondary"
              onClick={() => onFontSizeChange(Math.max(MIN_FONT, fontSize - 2))}
              disabled={fontSize <= MIN_FONT}
            >
              <ChevronRightIcon fontSize="small" />
            </SquareBtn>

            <Box
              sx={{
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.default',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1.5,
              }}
            >
              <Typography variant="body2" fontWeight={700}>
                {fontSize}
              </Typography>
            </Box>

            <SquareBtn
              color="secondary"
              onClick={() => onFontSizeChange(Math.min(MAX_FONT, fontSize + 2))}
              disabled={fontSize >= MAX_FONT}
            >
              <ChevronLeftIcon fontSize="small" />
            </SquareBtn>
          </Box>
        </Box>
      )}
    </Paper>
  );
}
