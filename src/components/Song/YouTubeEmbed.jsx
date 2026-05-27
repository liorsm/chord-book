import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { buildYouTubeEmbedUrl } from '../../utils/youtube';

export default function YouTubeEmbed({ videoId, title, autoplay = false }) {
  if (!videoId) return null;

  return (
    <Paper
      elevation={2}
      sx={{
        width: { xs: '100%', md: 280 },
        flexShrink: 0,
        overflow: 'hidden',
        borderRadius: 2,
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: 'block', px: 1.5, pt: 1.5, pb: 0.5 }}
      >
        {title || 'השמעה'}
      </Typography>
      <Box
        component="iframe"
        src={buildYouTubeEmbedUrl(videoId, { autoplay })}
        title={title ? `YouTube — ${title}` : 'YouTube'}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        sx={{
          display: 'block',
          width: '100%',
          aspectRatio: '16 / 9',
          border: 0,
        }}
      />
    </Paper>
  );
}
