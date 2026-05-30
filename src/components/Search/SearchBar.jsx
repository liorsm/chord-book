import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { songPath } from '../../utils/routes';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Autocomplete from '@mui/material/Autocomplete';
import SearchIcon from '@mui/icons-material/Search';
import Paper from '@mui/material/Paper';

export default function SearchBar({ songs = [], placeholder = 'חפש שיר או אמן...', large = false }) {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');

  const options = songs.map((s) => ({
    id: s.id,
    label: `${s.title} - ${s.artist}`,
    song: s,
  }));

  return (
    <Paper
      elevation={large ? 8 : 2}
      sx={{
        p: 0.5,
        borderRadius: '16px',
        bgcolor: 'background.paper',
      }}
    >
      <Autocomplete
        freeSolo
        options={options}
        inputValue={inputValue}
        onInputChange={(_, v) => setInputValue(v)}
        onChange={(_, option) => {
          if (option?.song) navigate(songPath(option.song));
        }}
        getOptionLabel={(o) => (typeof o === 'string' ? o : o.label)}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={placeholder}
            size={large ? 'medium' : 'small'}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && options.length > 0) {
                const match = options.find((o) =>
                  o.label.toLowerCase().includes(inputValue.toLowerCase())
                );
                if (match) navigate(songPath(match.song));
              }
            }}
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="primary" />
                </InputAdornment>
              ),
              sx: {
                fontSize: large ? '1.1rem' : '1rem',
                py: large ? 1 : 0.5,
              },
            }}
            sx={{
              '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
            }}
          />
        )}
      />
    </Paper>
  );
}
