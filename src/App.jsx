import { Routes, Route } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Layout from './components/Layout/Layout';
import HomePage from './pages/HomePage';
import SongPage from './pages/SongPage';
import AddSongPage from './pages/AddSongPage';
import PlaylistPage from './pages/PlaylistPage';
import FavoritesPage from './pages/FavoritesPage';
import ManagePage from './pages/ManagePage';
import EditSongPage from './pages/EditSongPage';
import { useAuth } from './contexts/AuthContext';

function App() {
  const { loading, error } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <CircularProgress color="primary" size={48} />
        <Typography color="text.secondary">מתחבר ל-ChordBook...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error">שגיאת חיבור: {error}</Typography>
      </Box>
    );
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="song/:slug" element={<SongPage />} />
        <Route path="add" element={<AddSongPage />} />
        <Route path="playlist/:slug" element={<PlaylistPage />} />
        <Route path="favorites" element={<FavoritesPage />} />
        <Route path="manage" element={<ManagePage />} />
        <Route path="manage/songs/:slug" element={<EditSongPage />} />
      </Route>
    </Routes>
  );
}

export default App;
