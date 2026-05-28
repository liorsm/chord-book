import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { normalizeArtistKey } from '../../utils/artists';

export default function ArtistAutocomplete({
  artists,
  value,
  onChange,
  onArtistSelect,
}) {
  return (
    <Autocomplete
      freeSolo
      fullWidth
      options={artists}
      getOptionLabel={(option) =>
        typeof option === 'string' ? option : option.name
      }
      isOptionEqualToValue={(option, val) => {
        if (typeof val === 'string') {
          return normalizeArtistKey(option.name) === normalizeArtistKey(val);
        }
        return normalizeArtistKey(option.name) === normalizeArtistKey(val?.name);
      }}
      inputValue={value}
      onInputChange={(_, newValue) => onChange(newValue)}
      onChange={(_, newValue) => {
        if (typeof newValue === 'string') {
          onChange(newValue);
          return;
        }
        if (newValue) {
          onChange(newValue.name);
          onArtistSelect?.(newValue);
        }
      }}
      renderInput={(params) => (
        <TextField {...params} label="אמן" required placeholder="חפש או הוסף אמן..." />
      )}
      noOptionsText="אין התאמה — הקלד שם חדש"
    />
  );
}
