import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';

export default function PlaylistAutocomplete({
  playlists,
  value,
  onChange,
  disabled = false,
}) {
  return (
    <Autocomplete
      multiple
      fullWidth
      disabled={disabled}
      options={playlists}
      value={value}
      onChange={(_, newValue) => onChange(newValue)}
      getOptionLabel={(option) => option.name || ''}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      renderTags={(selected, getTagProps) =>
        selected.map((option, index) => (
          <Chip
            {...getTagProps({ index })}
            key={option.id}
            label={option.name}
            size="small"
          />
        ))
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label="פלייליסטים"
          placeholder={value.length ? '' : 'חפש והוסף לפלייליסט...'}
          helperText="ניתן לשייך שיר לכמה פלייליסטים"
        />
      )}
      noOptionsText="אין פלייליסטים — צור פלייליסט בניהול"
    />
  );
}
