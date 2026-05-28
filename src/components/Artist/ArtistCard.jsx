import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import { getGradientForArtist } from '../../utils/artistImage';
import { artistImageBackgroundStyle } from '../../utils/artistImagePosition';
import { artistPath } from '../../utils/routes';

export default function ArtistCard({ artist }) {
  const navigate = useNavigate();

  return (
    <Card sx={{ display: 'flex', overflow: 'hidden' }}>
      <Box
        sx={{
          width: 72,
          minHeight: 72,
          ...(artist.imageUrl
            ? artistImageBackgroundStyle(artist.imageUrl, artist.imagePositionY)
            : { background: getGradientForArtist(artist.name) }),
          flexShrink: 0,
        }}
      />
      <CardActionArea
        onClick={() => navigate(artistPath(artist))}
        sx={{ flex: 1, display: 'flex', alignItems: 'stretch' }}
      >
        <CardContent sx={{ flex: 1, py: 1.5 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            {artist.name}
          </Typography>
          <Chip
            label={`${artist.songCount} שירים`}
            size="small"
            sx={{ mt: 0.5 }}
          />
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
