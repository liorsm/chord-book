import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import HomePage from './pages/HomePage';
import SongPage from './pages/SongPage';
import AddSongPage from './pages/AddSongPage';
import PlaylistPage from './pages/PlaylistPage';
import ManagePage from './pages/ManagePage';
import EditSongPage from './pages/EditSongPage';
import ArtistsPage from './pages/ArtistsPage';
import ArtistPage from './pages/ArtistPage';
import AdminGuard from './components/admin/AdminGuard';
import SiteAccessGuard from './components/SiteAccessGuard';

function App() {
  return (
    <Routes>
      <Route element={<SiteAccessGuard />}>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="artists" element={<ArtistsPage />} />
        <Route path="artist/:slug" element={<ArtistPage />} />
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
        <Route path="playlist/:slug" element={<PlaylistPage />} />
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
      </Route>
    </Routes>
  );
}

export default App;
