import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import HomePage from './pages/HomePage';
import SongPage from './pages/SongPage';
import AddSongPage from './pages/AddSongPage';
import PlaylistPage from './pages/PlaylistPage';
import FavoritesPage from './pages/FavoritesPage';
import ManagePage from './pages/ManagePage';
import EditSongPage from './pages/EditSongPage';
import AdminGuard from './components/admin/AdminGuard';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="song/:slug" element={<SongPage />} />
        <Route path="manage" element={<ManagePage />} />
        <Route
          path="add"
          element={
            <AdminGuard>
              <AddSongPage />
            </AdminGuard>
          }
        />
        <Route
          path="favorites"
          element={
            <AdminGuard>
              <FavoritesPage />
            </AdminGuard>
          }
        />
        <Route
          path="playlist/:slug"
          element={
            <AdminGuard>
              <PlaylistPage />
            </AdminGuard>
          }
        />
        <Route
          path="manage/songs/:slug"
          element={
            <AdminGuard>
              <EditSongPage />
            </AdminGuard>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
