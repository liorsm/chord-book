import { Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Header from './Header';
import MobileNav from './MobileNav';
import { useAuth } from '../../contexts/AuthContext';

export default function Layout() {
  const { authNotice, clearAuthNotice } = useAuth();

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <Snackbar
        open={Boolean(authNotice)}
        autoHideDuration={6000}
        onClose={clearAuthNotice}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={clearAuthNotice} severity="error" sx={{ width: '100%' }}>
          {authNotice}
        </Alert>
      </Snackbar>
      <Box
        component="main"
        sx={{
          flex: 1,
          pb: { xs: 10, md: 4 },
          pt: { xs: 1, md: 2 },
        }}
      >
        <Outlet />
      </Box>
      <MobileNav />
    </Box>
  );
}
