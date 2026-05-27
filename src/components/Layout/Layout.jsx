import { Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';
import Header from './Header';
import MobileNav from './MobileNav';

export default function Layout() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
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
