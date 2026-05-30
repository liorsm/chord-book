import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

/**
 * @param {{ options: Array<{ id: string, url: string, thumbnail: string, title?: string }>, selectedUrl: string, onSelect: (url: string) => void, attributionNote?: string }} props
 */
export default function ImageOptionsGrid({
  options,
  selectedUrl,
  onSelect,
  attributionNote =
    'מקורות: ויקיפדיה, Openverse, Wikimedia Commons, Deezer, TheAudioDB. ייתכן צורך בייחוס לפי הרישיון.',
}) {
  if (!options?.length) return null;

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
        בחר תמונה — הכתובת תתמלא אוטומטית בשדה למטה
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
          gap: 1,
          mb: 1,
        }}
      >
        {options.map((opt) => {
          const selected = selectedUrl === opt.url;
          return (
            <Box
              key={opt.id}
              component="button"
              type="button"
              onClick={() => onSelect(opt.url)}
              title={opt.title}
              sx={{
                aspectRatio: '1',
                p: 0,
                border: 2,
                borderColor: selected ? 'primary.main' : 'divider',
                borderRadius: 2,
                overflow: 'hidden',
                cursor: 'pointer',
                bgcolor: 'action.hover',
                backgroundImage: `url(${opt.thumbnail})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transition: 'border-color 0.15s, transform 0.15s',
                '&:hover': {
                  borderColor: 'primary.light',
                  transform: 'scale(1.02)',
                },
              }}
            />
          );
        })}
      </Box>
      {attributionNote && (
        <Typography variant="caption" color="text.disabled" display="block">
          {attributionNote}
        </Typography>
      )}
    </Box>
  );
}
