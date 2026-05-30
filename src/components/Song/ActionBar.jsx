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
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import EditIcon from '@mui/icons-material/Edit';
import YouTubeIcon from '@mui/icons-material/YouTube';
import Filter1Icon from '@mui/icons-material/Filter1';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import {
  getOppositeHorizontalStyle,
  getOppositePanelPosition,
} from '../../utils/direction';

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

const SCROLL_POPUP_EST_W = 52;
const SCROLL_POPUP_EST_H = 200;

function getDefaultScrollPopupPosition(language) {
  return getOppositePanelPosition(
    language,
    SCROLL_POPUP_EST_W,
    SCROLL_POPUP_EST_H
  );
}

function clampScrollPopupPosition(left, top, width, height) {
  return {
    left: Math.max(8, Math.min(window.innerWidth - width - 8, left)),
    top: Math.max(8, Math.min(window.innerHeight - height - 8, top)),
  };
}

function formatTonality(semitones) {
  if (semitones === 0) return '0';
  if (semitones > 0) return `${semitones}♯`;
  return `${Math.abs(semitones)}♭`;
}

const panelBtnSx = (active) => ({
  width: { xs: 40, md: 64 },
  height: { xs: 40, md: 64 },
  borderRadius: 0,
  border: 'none',
  boxShadow: 'none',
  background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
  color: '#fff',
  flexShrink: 0,
  '&:hover': {
    background: 'rgba(255,255,255,0.1)',
  },
  '&.Mui-disabled': {
    color: 'rgba(255,255,255,0.28)',
  },
  '& .MuiSvgIcon-root': {
    color: 'inherit',
  },
});

function SquareBtn({ children, onClick, disabled, active, sx = {} }) {
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClick?.();
  };

  return (
    <IconButton
      size="small"
      disabled={disabled || !onClick}
      onClick={handleClick}
      sx={{ ...panelBtnSx(active), ...sx }}
    >
      {children}
    </IconButton>
  );
}

function LabeledAction({ lines, children, ...btnProps }) {
  const [line1, line2] = lines;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0.35,
        minWidth: { xs: 42, md: 64 },
      }}
    >
      <SquareBtn {...btnProps}>{children}</SquareBtn>
      <Box sx={{ textAlign: 'center', userSelect: 'none', maxWidth: { xs: 52, md: 64 } }}>
        <Typography
          component="span"
          display="block"
          sx={{ fontSize: '0.58rem', lineHeight: 1.1, color: 'rgba(255,255,255,0.72)' }}
        >
          {line1}
        </Typography>
        <Typography
          component="span"
          display="block"
          sx={{ fontSize: '0.58rem', lineHeight: 1.1, color: 'rgba(255,255,255,0.72)' }}
        >
          {line2}
        </Typography>
      </Box>
    </Box>
  );
}

function AdminToolsPanel({ onAddToPlaylist, onEdit, language = 'he' }) {
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));
  const sideMargin = mdUp ? 24 : 12;
  const bottom = mdUp ? 24 : 16;

  if (!onAddToPlaylist && !onEdit) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom,
        zIndex: 1300,
        bgcolor: '#000',
        border: '1px solid #fff',
        borderRadius: 0,
        px: 1,
        py: 0.75,
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.18)',
      }}
      style={{
        ...getOppositeHorizontalStyle(language, sideMargin),
      }}
    >
      <Typography
        sx={{
          fontSize: '0.55rem',
          lineHeight: 1.2,
          color: 'rgba(255,255,255,0.65)',
          textAlign: 'center',
          mb: 0.5,
          letterSpacing: '0.02em',
        }}
      >
        כלי ניהול
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: { xs: 0.75, sm: 1 } }}>
        {onAddToPlaylist && (
          <LabeledAction lines={['הוסף', 'לפלייליסט']} onClick={onAddToPlaylist}>
            <PlaylistAddIcon fontSize="small" />
          </LabeledAction>
        )}
        {onEdit && (
          <LabeledAction lines={['עריכת', 'שיר']} onClick={onEdit}>
            <EditIcon fontSize="small" />
          </LabeledAction>
        )}
      </Box>
    </Box>
  );
}

function ScrollPopup({
  open,
  speed,
  onSpeedUp,
  onSpeedDown,
  onStop,
  onClose,
  position,
  onPositionChange,
}) {
  const popupRef = useRef(null);

  const handleDragStart = (e) => {
    if (e.button !== 0 || !position) return;
    e.preventDefault();

    const startX = e.clientX;
    const startY = e.clientY;
    const { left: startLeft, top: startTop } = position;

    const onPointerMove = (ev) => {
      const el = popupRef.current;
      const w = el?.offsetWidth ?? SCROLL_POPUP_EST_W;
      const h = el?.offsetHeight ?? SCROLL_POPUP_EST_H;
      const next = clampScrollPopupPosition(
        startLeft + (ev.clientX - startX),
        startTop + (ev.clientY - startY),
        w,
        h
      );
      onPositionChange(next);
    };

    const onPointerUp = () => {
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
    };

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
  };

  if (!open || !position) return null;

  return (
    <Box
      ref={popupRef}
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
      }}
      sx={{
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
        touchAction: 'none',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <Box
        onPointerDown={handleDragStart}
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          cursor: 'grab',
          userSelect: 'none',
          touchAction: 'none',
          '&:active': { cursor: 'grabbing' },
        }}
      >
        <Box
          sx={{
            width: 28,
            height: 4,
            borderRadius: 2,
            bgcolor: 'action.disabled',
            mb: 0.5,
          }}
        />
        <IconButton
          size="small"
          onClick={onClose}
          onPointerDown={(e) => e.stopPropagation()}
          sx={{ alignSelf: 'flex-end', p: 0.25, mt: -0.5 }}
        >
          <CloseIcon sx={{ fontSize: 16, color: 'secondary.main' }} />
        </IconButton>
      </Box>

      <SquareBtn onClick={onSpeedDown} disabled={speed <= MIN_SPEED}>
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

      <SquareBtn onClick={onSpeedUp} disabled={speed >= MAX_SPEED}>
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
  onEdit,
  hasYouTube,
  youtubeOpen,
  onToggleYouTube,
  scrollSpeed = 0,
  onScrollSpeedChange,
  chordsSimplified = false,
  onToggleSimplifyChords,
  language = 'he',
}) {
  const [fontPanelOpen, setFontPanelOpen] = useState(false);
  const [scrollPopupOpen, setScrollPopupOpen] = useState(false);
  const [scrollPopupPos, setScrollPopupPos] = useState(null);
  const scrollIntervalRef = useRef(null);

  useEffect(() => {
    if (scrollPopupOpen) {
      setScrollPopupPos(getDefaultScrollPopupPosition(language));
    } else {
      setScrollPopupPos(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only reset placement when song language changes
  }, [language]);

  const openScrollPopup = () => {
    setScrollPopupPos((pos) => pos ?? getDefaultScrollPopupPosition(language));
    setScrollPopupOpen(true);
  };

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
    <>
    <Paper
      elevation={0}
      sx={{
        mx: { xs: 2, md: 4 },
        mt: -4,
        mb: 3,
        position: 'relative',
        zIndex: 2,
        borderRadius: 0,
        bgcolor: '#000',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.18)',
        p: 1.5,
        color: '#fff',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: fontPanelOpen ? 1.25 : 0,
          width: '100%',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            width: '100%',
            gap: 2,
            pb: 0.25,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: { xs: 0.5, sm: 0.75 },
              flexShrink: 0,
            }}
          >
            <LabeledAction
              lines={['העלאת', 'טון']}
              onClick={onTransposeUp}
              disabled={semitones >= 6}
            >
              <ChevronRightIcon fontSize="small" />
            </LabeledAction>

            <Typography
              variant="body2"
              fontWeight={600}
              noWrap
              sx={{
                color: '#fff',
                alignSelf: 'center',
                px: 0.5,
                minWidth: 23,
                textAlign: 'center',
                pb: '22px',
              }}
            >
              {formatTonality(semitones)}
            </Typography>

            <LabeledAction
              lines={['הורדת', 'טון']}
              onClick={onTransposeDown}
              disabled={semitones <= -6}
            >
              <ChevronLeftIcon fontSize="small" />
            </LabeledAction>
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'flex-end',
              gap: { xs: 0.75, sm: 1.25 },
              flexWrap: 'nowrap',
              overflowX: 'auto',
              minWidth: 0,
              '&::-webkit-scrollbar': { display: 'none' },
              scrollbarWidth: 'none',
            }}
          >
            <LabeledAction
              lines={['הגדל/הקטן', 'טקסט']}
              active={fontPanelOpen}
              onClick={() => setFontPanelOpen((v) => !v)}
              sx={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: '0.85rem' }}
            >
              TT
            </LabeledAction>

            {onToggleSimplifyChords && (
              <LabeledAction
                lines={['הפשט', 'אקורדים']}
                active={chordsSimplified}
                onClick={onToggleSimplifyChords}
              >
                <Filter1Icon fontSize="small" />
              </LabeledAction>
            )}

            {hasYouTube && (
              <LabeledAction lines={['צפייה', 'בשיר']} active={youtubeOpen} onClick={onToggleYouTube}>
                <YouTubeIcon fontSize="small" />
              </LabeledAction>
            )}

            <Box sx={{ position: 'relative' }}>
              <LabeledAction
                lines={['גלילה', 'אוטומטית']}
                active={scrollPopupOpen || scrollSpeed > 0}
                onClick={() => {
                  if (scrollPopupOpen) setScrollPopupOpen(false);
                  else openScrollPopup();
                }}
              >
                <UnfoldMoreIcon fontSize="small" />
              </LabeledAction>

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
                      position={scrollPopupPos}
                      onPositionChange={setScrollPopupPos}
                    />
                  </Box>
                </ClickAwayListener>
              )}
            </Box>
          </Box>
        </Box>

        {fontPanelOpen && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: { xs: 0.75, sm: 1.25 },
              width: '100%',
              pt: 0.75,
              borderTop: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            <FormControl size="small" sx={{ minWidth: 88, flexShrink: 0 }}>
              <Select
                value={fontFamily}
                onChange={(e) => onFontFamilyChange(e.target.value)}
                variant="standard"
                disableUnderline
                sx={{
                  color: '#fff',
                  fontSize: '0.8rem',
                  '& .MuiSvgIcon-root': { color: '#fff' },
                  '& .MuiSelect-select': { py: 0.5, pr: 2.5 },
                }}
              >
                {FONT_OPTIONS.map((f) => (
                  <MenuItem key={f.value} value={f.value} sx={{ fontFamily: f.value }}>
                    {f.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <SquareBtn
              onClick={() => onFontSizeChange(Math.max(MIN_FONT, fontSize - 2))}
              disabled={fontSize <= MIN_FONT}
            >
              <ChevronRightIcon fontSize="small" />
            </SquareBtn>

            <Typography
              variant="body2"
              fontWeight={700}
              sx={{ color: '#fff', minWidth: 24, textAlign: 'center' }}
            >
              {fontSize}
            </Typography>

            <SquareBtn
              onClick={() => onFontSizeChange(Math.min(MAX_FONT, fontSize + 2))}
              disabled={fontSize >= MAX_FONT}
            >
              <ChevronLeftIcon fontSize="small" />
            </SquareBtn>
          </Box>
        )}
      </Box>
    </Paper>

    <AdminToolsPanel
      onAddToPlaylist={onAddToPlaylist}
      onEdit={onEdit}
      language={language}
    />
    </>
  );
}
