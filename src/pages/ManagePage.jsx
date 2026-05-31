import { useEffect, useRef, useState } from 'react';
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
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay';
import AddIcon from '@mui/icons-material/Add';
import LogoutIcon from '@mui/icons-material/Logout';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import { useSongs } from '../hooks/useSongs';
import { usePlaylists } from '../hooks/usePlaylists';
import { useAuth } from '../contexts/AuthContext';
import ManageAuthPanel from '../components/admin/ManageAuthPanel';
import { songPath, playlistPath, editSongPath } from '../utils/routes';
import PlaylistCover from '../components/Playlist/PlaylistCover';
import PlaylistCoverImagePicker from '../components/Playlist/PlaylistCoverImagePicker';
import {
  buildBackupExport,
  downloadBackupFile,
  importBackupToFirestore,
  parseBackupFile,
} from '../utils/backup';

function TabPanel({ children, value, index }) {
  if (value !== index) return null;
  return <Box sx={{ pt: 3 }}>{children}</Box>;
}

export default function ManagePage() {
  const navigate = useNavigate();
  const { loading: authLoading, signOut, authBusy, userId } = useAuth();
  const [tab, setTab] = useState(0);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [msg, setMsg] = useState('');
  const [msgSeverity, setMsgSeverity] = useState('success');
  const [backupBusy, setBackupBusy] = useState(false);
  const [dragPlaylistId, setDragPlaylistId] = useState(null);
  const importInputRef = useRef(null);

  const notify = (text, severity = 'success') => {
    setMsg(text);
    setMsgSeverity(severity);
  };

  const { songs, loading: songsLoading, deleteSong, loadSongs } = useSongs();
  const {
    playlists,
    loading: plLoading,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    removeSongFromPlaylist,
    moveSongInPlaylist,
    reorderPlaylists,
    setPlaylistPosition,
    loadPlaylists,
  } = usePlaylists();

  const selectedPlaylist = playlists.find((p) => p.id === selectedPlaylistId);

  useEffect(() => {
    setCoverImageUrl(selectedPlaylist?.coverImageUrl || '');
  }, [selectedPlaylist?.id, selectedPlaylist?.coverImageUrl]);

  const playlistSongs = (selectedPlaylist?.songIds || [])
    .map((sid) => songs.find((s) => s.id === sid))
    .filter(Boolean);

  const handleDeleteSong = async (song) => {
    if (!confirm(`למחוק את "${song.title}"?`)) return;
    await deleteSong(song.id);
    notify('השיר נמחק');
  };

  const handleDeletePlaylist = async (pl) => {
    if (!confirm(`למחוק את הפלייליסט "${pl.name}"?`)) return;
    await deletePlaylist(pl.id);
    if (selectedPlaylistId === pl.id) setSelectedPlaylistId(null);
    notify('הפלייליסט נמחק');
  };

  const handleRenamePlaylist = async () => {
    if (!selectedPlaylist || !renameValue.trim()) return;
    await updatePlaylist(selectedPlaylist.id, { name: renameValue.trim() });
    setRenameOpen(false);
    notify('שם הפלייליסט עודכן');
  };

  const handleSaveCoverImage = async () => {
    if (!selectedPlaylist) return;
    const trimmed = coverImageUrl.trim();
    await updatePlaylist(selectedPlaylist.id, {
      coverImageUrl: trimmed || null,
    });
    notify(trimmed ? 'תמונת הרקע נשמרה' : 'תמונת הרקע הוסרה');
  };

  const handlePlaylistPositionChange = async (playlistId, value, currentIndex) => {
    const position = parseInt(value, 10);
    if (
      Number.isNaN(position) ||
      position < 1 ||
      position > playlists.length ||
      position === currentIndex + 1
    ) {
      return;
    }
    await setPlaylistPosition(playlistId, position);
    notify('סדר הפלייליסטים עודכן');
  };

  const handlePlaylistDrop = async (targetId) => {
    if (!dragPlaylistId || dragPlaylistId === targetId) {
      setDragPlaylistId(null);
      return;
    }
    const ids = playlists.map((p) => p.id);
    const fromIndex = ids.indexOf(dragPlaylistId);
    const toIndex = ids.indexOf(targetId);
    if (fromIndex === -1 || toIndex === -1) {
      setDragPlaylistId(null);
      return;
    }
    const nextIds = [...ids];
    const [item] = nextIds.splice(fromIndex, 1);
    nextIds.splice(toIndex, 0, item);
    await reorderPlaylists(nextIds);
    setDragPlaylistId(null);
    notify('סדר הפלייליסטים עודכן');
  };

  const handleExportBackup = () => {
    downloadBackupFile(buildBackupExport(songs, playlists));
    notify('קובץ הגיבוי הורד למחשב');
  };

  const handleImportBackup = async (file) => {
    if (
      !confirm(
        'לייבא גיבוי מקובץ JSON?\nרשומות שכבר קיימות (לפי מזהה, slug או שם) לא יוכפלו.'
      )
    ) {
      return;
    }
    setBackupBusy(true);
    try {
      const text = await file.text();
      const backup = parseBackupFile(text);
      const result = await importBackupToFirestore(backup, {
        existingSongs: songs,
        existingPlaylists: playlists,
        userId,
      });
      await Promise.all([loadSongs(), loadPlaylists()]);
      notify(
        `ייבוא הושלם: נוספו ${result.songsAdded} שירים ו-${result.playlistsAdded} פלייליסטים. ` +
          `דולגו ${result.songsSkipped} שירים ו-${result.playlistsSkipped} פלייליסטים קיימים.`
      );
    } catch (err) {
      notify(err.message || 'שגיאה בייבוא הגיבוי', 'error');
    } finally {
      setBackupBusy(false);
    }
  };

  const loading = songsLoading || plLoading;

  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <ManageAuthPanel>
        <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            ניהול תוכן
          </Typography>
          <Typography color="text.secondary">
            עריכה, מחיקה וסידור שירים ופלייליסטים
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/add')}>
            הוסף שיר
          </Button>
          <Button
            variant="outlined"
            startIcon={<LogoutIcon />}
            onClick={signOut}
            disabled={authBusy}
          >
            התנתק
          </Button>
        </Box>
      </Box>

      {msg && (
        <Alert severity={msgSeverity} sx={{ mb: 2 }} onClose={() => setMsg('')}>
          {msg}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 2, borderRadius: 3 }}>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          גיבוי ושחזור
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          ייצוא וייבוא של כל השירים והפלייליסטים. בייבוא, רשומות שכבר קיימות לא
          יוכפלו.
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            disabled={backupBusy || loading}
            onClick={handleExportBackup}
          >
            הורד גיבוי
          </Button>
          <Button
            variant="outlined"
            startIcon={
              backupBusy ? <CircularProgress size={18} /> : <UploadIcon />
            }
            disabled={backupBusy || loading}
            onClick={() => importInputRef.current?.click()}
          >
            ייבא גיבוי
          </Button>
          <input
            ref={importInputRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (file) handleImportBackup(file);
            }}
          />
        </Box>
      </Paper>

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
                    notify('פלייליסט נוצר');
                  }}
                >
                  צור
                </Button>
              </Box>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', px: 2, pb: 1 }}
              >
                גרור לשינוי סדר, או הזן מספר מיקום (1 = ראשון בדף הבית)
              </Typography>

              <List disablePadding>
                {playlists.map((pl, index) => (
                  <ListItem
                    key={pl.id}
                    disablePadding
                    divider
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handlePlaylistDrop(pl.id)}
                    sx={{
                      opacity: dragPlaylistId === pl.id ? 0.55 : 1,
                      bgcolor:
                        dragPlaylistId && dragPlaylistId !== pl.id
                          ? 'action.hover'
                          : undefined,
                    }}
                  >
                    <Box
                      draggable
                      onDragStart={(e) => {
                        setDragPlaylistId(pl.id);
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      onDragEnd={() => setDragPlaylistId(null)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        px: 1,
                        cursor: 'grab',
                        color: 'text.secondary',
                      }}
                      aria-label="גרור לשינוי סדר"
                    >
                      <DragIndicatorIcon fontSize="small" />
                    </Box>
                    <TextField
                      key={`${pl.id}-${index}`}
                      type="number"
                      size="small"
                      defaultValue={index + 1}
                      inputProps={{
                        min: 1,
                        max: playlists.length,
                        'aria-label': 'מיקום בתצוגה',
                      }}
                      onBlur={(e) =>
                        handlePlaylistPositionChange(pl.id, e.target.value, index)
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') e.target.blur();
                      }}
                      sx={{ width: 56, mx: 1, flexShrink: 0 }}
                    />
                    <ListItemButton
                      selected={selectedPlaylistId === pl.id}
                      onClick={() => setSelectedPlaylistId(pl.id)}
                      sx={{ flex: 1 }}
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

                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    תמונת רקע
                  </Typography>
                  <PlaylistCover
                    coverColor={selectedPlaylist.coverColor}
                    coverImageUrl={coverImageUrl}
                    name={selectedPlaylist.name || selectedPlaylist.id}
                    sx={{ mb: 2 }}
                  />
                  <PlaylistCoverImagePicker
                    coverImageUrl={coverImageUrl}
                    onSelectUrl={setCoverImageUrl}
                  />
                  <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                    <TextField
                      size="small"
                      fullWidth
                      label="כתובת תמונת רקע"
                      placeholder="https://..."
                      value={coverImageUrl}
                      onChange={(e) => setCoverImageUrl(e.target.value)}
                      helperText="נבחר מחיפוש או הדבק כתובת ידנית. השאר ריק לגרדיאנט בלבד."
                    />
                    <Button
                      variant="outlined"
                      onClick={handleSaveCoverImage}
                      sx={{ flexShrink: 0, alignSelf: 'flex-start', mt: 0.5 }}
                    >
                      שמור
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
        </>
      </ManageAuthPanel>
    </Container>
  );
}
