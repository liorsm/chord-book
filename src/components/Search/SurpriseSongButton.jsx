import { useNavigate } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import CardGiftcardOutlinedIcon from "@mui/icons-material/CardGiftcardOutlined";
import { songPath } from "../../utils/routes";
import { pickRandomSong } from "../../utils/randomSong";

const PURPLE = "#7c3aed";

export default function SurpriseSongButton({ songs, disabled: disabledProp }) {
  const navigate = useNavigate();
  const noSongs = !songs?.length;
  const disabled = disabledProp || noSongs;

  const handleClick = () => {
    const song = pickRandomSong(songs);
    if (song) navigate(songPath(song));
  };

  const tooltipTitle = noSongs ? "אין שירים עדיין" : "שיר בהפתעה";

  return (
    <Tooltip title={tooltipTitle} arrow>
      <span>
        <IconButton
          onClick={handleClick}
          disabled={disabled}
          aria-label={tooltipTitle}
          sx={{
            flexShrink: 0,
            width: 56,
            height: 56,
            boxSizing: "border-box",
            borderRadius: "50%",
            bgcolor: "background.paper",
            color: PURPLE,
            "&:hover": {
              bgcolor: "background.paper",
              borderColor: PURPLE,
              filter: "brightness(0.96)",
            },
            "&.Mui-disabled": {
              bgcolor: "background.paper",
              color: "rgba(124, 58, 237, 0.35)",
              borderColor: "rgba(124, 58, 237, 0.35)",
            },
          }}
        >
          <CardGiftcardOutlinedIcon sx={{ fontSize: 26 }} />
        </IconButton>
      </span>
    </Tooltip>
  );
}
