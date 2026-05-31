import { useNavigate } from "react-router-dom";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import PlaylistCover from "./PlaylistCover";
import { playlistPath } from "../../utils/routes";

export default function PlaylistCard({ playlist }) {
  const navigate = useNavigate();
  const songCount = playlist.songIds?.length || 0;

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <CardActionArea
        onClick={() => navigate(playlistPath(playlist))}
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
        }}
      >
        <Box sx={{ aspectRatio: "1", width: "100%" }}>
          <PlaylistCover
            coverColor={playlist.coverColor}
            coverImageUrl={playlist.coverImageUrl}
            name={playlist.name || playlist.id}
            height="100%"
            sx={{ height: "100%", borderRadius: 0 }}
          />
        </Box>
        <CardContent
          sx={{
            flex: 1,
            py: { xs: 1.5, lg: 1 },
            px: { xs: 1.5, lg: 1 },
            width: "100%",
            "&:last-child": { pb: { xs: 1.5, lg: 1 } },
          }}
        >
          <Typography
            variant="subtitle2"
            fontWeight={700}
            noWrap
            title={playlist.name}
            sx={{ fontSize: { lg: "1rem" }, lineHeight: 1.3 }}
          >
            {playlist.name}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontSize: { lg: "0.8rem" } }}
          >
            {songCount} שירים
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
