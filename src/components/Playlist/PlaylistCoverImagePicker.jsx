import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import ImageSearchIcon from '@mui/icons-material/ImageSearch';
import ImageOptionsGrid from '../common/ImageOptionsGrid';
import { fetchCoverImageOptions } from '../../utils/coverImageSearch';

export default function PlaylistCoverImagePicker({ coverImageUrl, onSelectUrl }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [options, setOptions] = useState([]);
  const [searchError, setSearchError] = useState('');

  const handleSearch = async () => {
    const q = searchQuery.trim();
    if (!q) return;
    setSearching(true);
    setSearchError('');
    setOptions([]);
    try {
      const results = await fetchCoverImageOptions(q, 4);
      if (results.length === 0) {
        setSearchError('לא נמצאו תמונות. נסה מילות חיפוש אחרות (בעברית או באנגלית).');
      }
      setOptions(results);
    } catch {
      setSearchError('שגיאה בחיפוש תמונות. נסה שוב.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', gap: 1, mb: options.length || searchError ? 1.5 : 0 }}>
        <TextField
          size="small"
          fullWidth
          label="חיפוש תמונה"
          placeholder="למשל: גיטרה, שקיעה, jazz"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSearch();
            }
          }}
          helperText="Openverse, ויקיפדיה, Wikimedia Commons. לחץ «חפש» לקבלת עד 4 אפשרויות."
        />
        <Button
          variant="outlined"
          onClick={handleSearch}
          disabled={searching || !searchQuery.trim()}
          startIcon={searching ? <CircularProgress size={18} /> : <ImageSearchIcon />}
          sx={{ flexShrink: 0, alignSelf: 'flex-start', mt: 0.5, minWidth: 120 }}
        >
          חפש
        </Button>
      </Box>

      {searchError && (
        <Typography variant="caption" color="error" display="block" sx={{ mb: 1 }}>
          {searchError}
        </Typography>
      )}

      {options.length > 0 && (
        <ImageOptionsGrid
          options={options}
          selectedUrl={coverImageUrl}
          onSelect={onSelectUrl}
          attributionNote="מקורות: Openverse, ויקיפדיה, Wikimedia Commons. ייתכן צורך בייחוס לפי הרישיון."
        />
      )}
    </Box>
  );
}
