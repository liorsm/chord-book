import Box from '@mui/material/Box';
import { HERO_GRADIENT_OVERLAY } from '../../utils/artistImage';

/** Full-width hero: background layer + translucent gradient overlay + content */
export default function PageHeroShell({ backgroundSx, children }) {
  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: { xs: 200, md: 260 },
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'flex-end',
      }}
    >
      <Box sx={{ position: 'absolute', inset: 0, ...backgroundSx }} />
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: HERO_GRADIENT_OVERLAY,
        }}
      />
      <Box sx={{ position: 'relative', zIndex: 1, width: '100%' }}>{children}</Box>
    </Box>
  );
}
