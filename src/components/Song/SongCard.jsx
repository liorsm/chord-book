import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { getGradientForArtist } from '../../utils/artistImage';
import { artistImageBackgroundStyle } from '../../utils/artistImagePosition';
import { songPath } from '../../utils/routes';

export default function SongCard({ song }) {
  const navigate = useNavigate();

  return (
    <Card sx={{ display: 'flex', overflow: 'hidden' }}>
      <Box
        sx={{
          width: 72,
          minHeight: 72,
          ...(song.artistImageUrl
            ? artistImageBackgroundStyle(
                song.artistImageUrl,
                song.artistImagePositionY
              )
            : { background: getGradientForArtist(song.artist) }),
          flexShrink: 0,
        }}
      />
      <CardActionArea
        onClick={() => navigate(songPath(song))}
        sx={{ flex: 1, display: 'flex', alignItems: 'stretch' }}
      >
        <CardContent sx={{ flex: 1, py: 1.5 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            {song.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {song.artist}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
