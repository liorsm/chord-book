import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { detectLanguage, getTextDirection } from "../../utils/direction";

const titleFontSx = {
  color: "white",
  fontWeight: 800,
  fontSize: { xs: "2rem", md: "2.75rem" },
  lineHeight: 1.1,
  m: 0,
};

function blockAlignSx(align) {
  const pushRight = align === "right";
  return {
    display: "block",
    width: "fit-content",
    maxWidth: "100%",
    mr: pushRight ? "auto" : 0,
    ml: pushRight ? 0 : "auto",
  };
}

const titleBlackSx = {
  background: "linear-gradient(to bottom, transparent 0.5em, #000 0.5em)",
  pl: { xs: 1.25, md: 1.75 },
  pr: { xs: 2.75, md: 3.75 },
  pt: 0,
  pb: { xs: 0.1, md: 0.15 },
};

const subtitleBlackSx = {
  background: "linear-gradient(to bottom, transparent 0.5em, #000 0.5em)",
  pl: { xs: 1.25, md: 1.75 },
  pr: { xs: 2.75, md: 3.75 },
  pt: 0,
  pb: { xs: 0.45, md: 0.55 },
};

export default function StaggeredTitle({
  children,
  subtitle,
  className,
  sx = {},
  typographySx = {},
  subtitleSx = {},
}) {
  const language = detectLanguage(`${children ?? ""} ${subtitle ?? ""}`);
  const dir = getTextDirection(language);
  const pushRight = language === "he";

  return (
    <Box
      className={className}
      dir={dir}
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: pushRight ? "flex-end" : "flex-start",
        gap: 0,
        top: "-20px",
        position: "relative",
        ...sx,
      }}
    >
      {children && (
        <Box
          sx={{ ...blockAlignSx(pushRight ? "right" : "left"), lineHeight: 0 }}
        >
          <Typography
            component="span"
            sx={{
              ...titleFontSx,
              "& > span": {
                ...titleBlackSx,
                boxDecorationBreak: "clone",
                WebkitBoxDecorationBreak: "clone",
              },
              ...typographySx,
              "& > span ": {
                pl: 3,
                top: "8px",
                position: "relative",
              },
            }}
          >
            <span>{children}</span>
          </Typography>
        </Box>
      )}

      {subtitle && (
        <Box
          sx={{
            ...blockAlignSx(pushRight ? "right" : "left"),
            ...subtitleBlackSx,
            lineHeight: 0,
            mt: "-1px",
            pl: 3,
            pt: 1,
          }}
        >
          <Typography sx={{ ...titleFontSx, ...subtitleSx }}>
            {subtitle}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
