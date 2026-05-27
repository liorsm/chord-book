import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ThemeToggle from "../Layout/ThemeToggle";
import {
  getGradientForArtist,
  getArtistInitials,
} from "../../utils/artistImage";
import { artistImageBackgroundStyle } from "../../utils/artistImagePosition";
import StaggeredTitle from "../common/StaggeredTitle";

export default function SongHero({ song }) {
  const navigate = useNavigate();
  const bgImage = song?.artistImageUrl;
  const gradient = getGradientForArtist(song?.artist);

  const handleBack = () => {
    const idx = window.history.state?.idx;
    if (typeof idx === "number" && idx > 0) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: { xs: 280, md: 340 },
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          ...(bgImage
            ? artistImageBackgroundStyle(bgImage, song?.artistImagePositionY)
            : { background: gradient }),
        }}
      />
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, rgba(81, 181, 229, 0.5) 0%, rgba(74, 140, 230, 0.5) 35%, rgba(83, 86, 224, 0.5) 65%, rgba(125, 38, 223, 0.5) 100%);",
        }}
      />

      <Box
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          left: 16,
          display: "flex",
          justifyContent: "space-between",
          zIndex: 3,
          pointerEvents: "none",
          "& > *": { pointerEvents: "auto" },
        }}
      >
        <IconButton
          onClick={handleBack}
          sx={{
            color: "white",
            bgcolor: "rgba(0,0,0,0.3)",
            "&:hover": { bgcolor: "rgba(0,0,0,0.5)" },
          }}
          aria-label="חזרה"
        >
          <ArrowForwardIcon />
        </IconButton>
        <Box sx={{ color: "white" }}>
          <ThemeToggle />
        </Box>
      </Box>

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          minHeight: { xs: 310, md: 340 },
          p: { xs: 3, md: 4 },
          pt: 8,
          pb: 9,
          pointerEvents: "none",
          "& .song-hero-title": { pointerEvents: "auto" },
        }}
      >
        {!bgImage && (
          <Typography
            sx={{
              position: "absolute",
              top: "30%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              fontSize: { xs: 64, md: 96 },
              fontWeight: 800,
              color: "rgba(255,255,255,0.15)",
            }}
          >
            {getArtistInitials(song?.artist)}
          </Typography>
        )}

        <StaggeredTitle className="song-hero-title" subtitle={song?.artist}>
          {song?.title}
        </StaggeredTitle>
      </Box>
    </Box>
  );
}
