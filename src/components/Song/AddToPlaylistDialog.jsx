import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import { useState } from 'react';

export default function AddToPlaylistDialog({
  open,
  onClose,
  playlists,
  onSelect,
  onCreate,
}) {
  const [newName, setNewName] = useState('');

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await onCreate(newName.trim());
    setNewName('');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>הוסף לפלייליסט</DialogTitle>
      <DialogContent>
        <List>
          {playlists.map((p) => (
            <ListItemButton key={p.id} onClick={() => onSelect(p.id)}>
              <ListItemText primary={p.name} secondary={`${p.songIds?.length || 0} שירים`} />
            </ListItemButton>
          ))}
        </List>
        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="פלייליסט חדש"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <Button variant="contained" onClick={handleCreate}>
            צור
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
