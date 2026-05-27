import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay';
import AddIcon from '@mui/icons-material/Add';
import { useSongs } from '../hooks/useSongs';
import { usePlaylists } from '../hooks/usePlaylists';
import { songPath, playlistPath, editSongPath } from '../utils/routes';

function TabPanel({ children, value, index }) {
  if (value !== index) return null;
  return <Box sx={{ pt: 3 }}>{children}</Box>;
}

export default function ManagePage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [msg, setMsg] = useState('');

  const { songs, loading: songsLoading, deleteSong } = useSongs();
  const {
    playlists,
    loading: plLoading,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    removeSongFromPlaylist,
    moveSongInPlaylist,
  } = usePlaylists();

  const selectedPlaylist = playlists.find((p) => p.id === selectedPlaylistId);
  const playlistSongs = (selectedPlaylist?.songIds || [])
    .map((sid) => songs.find((s) => s.id === sid))
    .filter(Boolean);

  const handleDeleteSong = async (song) => {
    if (!confirm(`למחוק את "${song.title}"?`)) return;
    await deleteSong(song.id);
    setMsg('השיר נמחק');
  };

  const handleDeletePlaylist = async (pl) => {
    if (!confirm(`למחוק את הפלייליסט "${pl.name}"?`)) return;
    await deletePlaylist(pl.id);
    if (selectedPlaylistId === pl.id) setSelectedPlaylistId(null);
    setMsg('הפלייליסט נמחק');
  };

  const handleRenamePlaylist = async () => {
    if (!selectedPlaylist || !renameValue.trim()) return;
    await updatePlaylist(selectedPlaylist.id, { name: renameValue.trim() });
    setRenameOpen(false);
    setMsg('שם הפלייליסט עודכן');
  };

  const loading = songsLoading || plLoading;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        ניהול תוכן
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        עריכה, מחיקה וסידור שירים ופלייליסטים
      </Typography>

      {msg && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMsg('')}>
          {msg}
        </Alert>
      )}

      <Paper sx={{ borderRadius: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth">
          <Tab label={`שירים (${songs.length})`} />
          <Tab label={`פלייליסטים (${playlists.length})`} />
        </Tabs>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TabPanel value={tab} index={0}>
              <List disablePadding>
                {songs.map((song) => (
                  <ListItem key={song.id} divider>
                    <ListItemText
                      primary={song.title}
                      secondary={
                        <>
                          {song.artist}
                          {song.slug && (
                            <Typography
                              component="span"
                              variant="caption"
                              display="block"
                              color="text.disabled"
                              sx={{ fontFamily: 'monospace', mt: 0.5 }}
                            >
                              /song/{song.slug}
                            </Typography>
                          )}
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        title="צפייה"
                        onClick={() => navigate(songPath(song))}
                      >
                        <OpenInNewIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        title="עריכה"
                        onClick={() => navigate(editSongPath(song))}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        color="error"
                        title="מחיקה"
                        onClick={() => handleDeleteSong(song)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
                {songs.length === 0 && (
                  <Typography textAlign="center" py={4} color="text.secondary">
                    אין שירים. הוסף שיר מהתפריט.
                  </Typography>
                )}
              </List>
            </TabPanel>

            <TabPanel value={tab} index={1}>
              <Box sx={{ px: 2, pb: 2, display: 'flex', gap: 1 }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="שם פלייליסט חדש"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                />
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={async () => {
                    if (!newPlaylistName.trim()) return;
                    const id = await createPlaylist(newPlaylistName.trim());
                    setNewPlaylistName('');
                    setSelectedPlaylistId(id);
                    setMsg('פלייליסט נוצר');
                  }}
                >
                  צור
                </Button>
              </Box>

              <List disablePadding>
                {playlists.map((pl) => (
                  <ListItem key={pl.id} disablePadding divider>
                    <ListItemButton
                      selected={selectedPlaylistId === pl.id}
                      onClick={() => setSelectedPlaylistId(pl.id)}
                    >
                      <PlaylistPlayIcon sx={{ mr: 2, color: 'primary.main' }} />
                      <ListItemText
                        primary={pl.name}
                        secondary={`${pl.songIds?.length || 0} שירים`}
                      />
                    </ListItemButton>
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => navigate(playlistPath(pl))}
                      >
                        <OpenInNewIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        color="error"
                        onClick={() => handleDeletePlaylist(pl)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>

              {selectedPlaylist && (
                <Box sx={{ px: 2, pb: 3 }}>
                  <Divider sx={{ my: 2 }} />
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6" fontWeight={700}>
                      סדר שירים: {selectedPlaylist.name}
                    </Typography>
                    <Button size="small" onClick={() => {
                      setRenameValue(selectedPlaylist.name);
                      setRenameOpen(true);
                    }}>
                      שנה שם
                    </Button>
                  </Box>

                  <List dense>
                    {playlistSongs.map((song, index) => (
                      <ListItem key={song.id}>
                        <Typography
                          variant="caption"
                          sx={{ width: 24, color: 'text.secondary' }}
                        >
                          {index + 1}.
                        </Typography>
                        <ListItemText primary={song.title} secondary={song.artist} />
                        <ListItemSecondaryAction>
                          <IconButton
                            size="small"
                            disabled={index === 0}
                            onClick={() =>
                              moveSongInPlaylist(selectedPlaylist.id, index, -1)
                            }
                          >
                            <ArrowUpwardIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            disabled={index === playlistSongs.length - 1}
                            onClick={() =>
                              moveSongInPlaylist(selectedPlaylist.id, index, 1)
                            }
                          >
                            <ArrowDownwardIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() =>
                              removeSongFromPlaylist(selectedPlaylist.id, song.id)
                            }
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                    {playlistSongs.length === 0 && (
                      <Typography color="text.secondary" textAlign="center" py={2}>
                        הפלייליסט ריק. הוסף שירים מדף השיר.
                      </Typography>
                    )}
                  </List>
                </Box>
              )}
            </TabPanel>
          </>
        )}
      </Paper>

      <Dialog open={renameOpen} onClose={() => setRenameOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>שינוי שם פלייליסט</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            autoFocus
            margin="dense"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameOpen(false)}>ביטול</Button>
          <Button variant="contained" onClick={handleRenamePlaylist}>
            שמור
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
