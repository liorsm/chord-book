import { useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {
  artistImageBackgroundStyle,
  normalizeArtistImagePositionY,
} from '../../utils/artistImagePosition';

export default function DraggableImageFrame({
  imageUrl,
  positionY,
  onPositionYChange,
  height = 160,
  draggable = true,
  sx = {},
}) {
  const frameRef = useRef(null);
  const dragRef = useRef(null);

  const y = normalizeArtistImagePositionY(positionY);

  const onPointerDown = (e) => {
    if (!draggable || !onPositionYChange) return;
    e.preventDefault();
    const frame = frameRef.current;
    if (!frame) return;

    dragRef.current = { startClientY: e.clientY, startY: y };

    const onMove = (ev) => {
      const drag = dragRef.current;
      if (!drag) return;
      const rect = frame.getBoundingClientRect();
      const delta = ev.clientY - drag.startClientY;
      const next = drag.startY - (delta / rect.height) * 100;
      onPositionYChange(normalizeArtistImagePositionY(next));
    };

    const onEnd = () => {
      dragRef.current = null;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onEnd);
      window.removeEventListener('pointercancel', onEnd);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onEnd);
    window.addEventListener('pointercancel', onEnd);
  };

  if (!imageUrl?.trim()) return null;

  return (
    <Box sx={{ mb: 2, ...sx }}>
      <Box
        ref={frameRef}
        onPointerDown={onPointerDown}
        sx={{
          height,
          borderRadius: 2,
          overflow: 'hidden',
          ...artistImageBackgroundStyle(imageUrl.trim(), y),
          cursor: draggable ? 'grab' : 'default',
          '&:active': draggable ? { cursor: 'grabbing' } : {},
          touchAction: draggable ? 'none' : 'auto',
          userSelect: 'none',
        }}
      />
      {draggable && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          גרור עם העכבר למיקום מחדש של התמונה (למעלה / למטה)
        </Typography>
      )}
    </Box>
  );
}
