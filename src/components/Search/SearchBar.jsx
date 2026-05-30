import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { songPath } from '../../utils/routes';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import SearchIcon from '@mui/icons-material/Search';
import Paper from '@mui/material/Paper';

const MAX_RESULTS = 12;

const filterMatches = createFilterOptions({
  limit: MAX_RESULTS,
  stringify: (option) => `${option.title} ${option.artist}`,
});

function normalizeSearchText(text) {
  return (text || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function buildSearchOptions(songs) {
  const seenIds = new Set();
  const labelCounts = new Map();

  const items = [];
  for (const s of songs) {
    if (!s?.id || seenIds.has(s.id)) continue;
    seenIds.add(s.id);

    const title = (s.title || '').trim();
    const artist = (s.artist || '').trim();
    const labelKey = normalizeSearchText(`${title} - ${artist}`);
    labelCounts.set(labelKey, (labelCounts.get(labelKey) || 0) + 1);

    items.push({ id: s.id, title, artist, song: s, labelKey });
  }

  return items.map((item) => {
    const baseLabel =
      item.title && item.artist
        ? `${item.title} - ${item.artist}`
        : item.title || item.artist || 'שיר ללא שם';
    const label =
      labelCounts.get(item.labelKey) > 1 && item.song.slug
        ? `${baseLabel} (${item.song.slug})`
        : baseLabel;

    return {
      id: item.id,
      label,
      title: item.title,
      artist: item.artist,
      song: item.song,
    };
  });
}

function findBestMatch(options, inputValue) {
  const q = normalizeSearchText(inputValue);
  if (!q) return null;

  const exact = options.find(
    (o) =>
      normalizeSearchText(o.label) === q ||
      normalizeSearchText(o.title) === q ||
      normalizeSearchText(o.artist) === q
  );
  if (exact) return exact;

  return options.find(
    (o) =>
      normalizeSearchText(o.title).includes(q) ||
      normalizeSearchText(o.artist).includes(q) ||
      normalizeSearchText(o.label).includes(q)
  );
}

export default function SearchBar({
  songs = [],
  placeholder = 'חפש שיר או אמן...',
  large = false,
}) {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');

  const options = useMemo(() => buildSearchOptions(songs), [songs]);

  const filterOptions = useCallback((opts, state) => {
    if (!state.inputValue.trim()) return [];
    return filterMatches(opts, state);
  }, []);

  const goToMatch = useCallback(
    (match) => {
      if (match?.song) navigate(songPath(match.song));
    },
    [navigate]
  );

  return (
    <Paper
      elevation={0}
      sx={{
        p: 0.5,
        borderRadius: large ? '9999px' : '20px',
        bgcolor: 'background.paper',
      }}
    >
      <Autocomplete
        freeSolo
        openOnFocus={false}
        options={options}
        filterOptions={filterOptions}
        inputValue={inputValue}
        onInputChange={(_, v) => setInputValue(v)}
        onChange={(_, option) => {
          if (option?.song) goToMatch(option);
        }}
        getOptionLabel={(o) => (typeof o === 'string' ? o : o.label)}
        getOptionKey={(o) => (typeof o === 'string' ? o : o.id)}
        isOptionEqualToValue={(a, b) => {
          if (typeof a === 'string' || typeof b === 'string') return a === b;
          return a?.id === b?.id;
        }}
        noOptionsText="לא נמצאו שירים"
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={placeholder}
            size={large ? 'medium' : 'small'}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const match = findBestMatch(options, inputValue);
                if (match) goToMatch(match);
              }
            }}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <InputAdornment position="end">
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
