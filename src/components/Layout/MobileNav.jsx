import { Link, useLocation } from 'react-router-dom';
import Paper from '@mui/material/Paper';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Box from '@mui/material/Box';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import { useThemeMode } from '../../ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { managePath } from '../../utils/routes';

export default function MobileNav() {
  const location = useLocation();
  const { mode } = useThemeMode();
  const { isAdmin } = useAuth();

  const hideNav =
    location.pathname.startsWith('/song/') ||
    location.pathname.startsWith('/manage') ||
    location.pathname.startsWith('/artist/');

  if (hideNav) {
    return null;
  }

  const navValue = location.pathname.startsWith('/manage')
    ? managePath()
    : location.pathname === '/artists' || location.pathname.startsWith('/artist/')
      ? '/artists'
      : '/';

  return (
    <Box
      sx={{
        display: { xs: 'block', md: 'none' },
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1100,
        px: 2,
        pb: 2,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          borderRadius: 4,
          bgcolor: mode === 'dark' ? 'rgba(30, 27, 75, 0.95)' : 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(12px)',
          border: 1,
          borderColor: 'divider',
        }}
      >
        <BottomNavigation value={navValue} showLabels>
          <BottomNavigationAction
            label="בית"
            value="/"
            icon={<HomeIcon />}
            component={Link}
            to="/"
          />
          <BottomNavigationAction
            label="אמנים"
            value="/artists"
            icon={<PeopleIcon />}
            component={Link}
            to="/artists"
          />
          {isAdmin && (
            <BottomNavigationAction
              label="ניהול"
              value={managePath()}
              icon={<SettingsIcon />}
              component={Link}
              to={managePath()}
            />
          )}
        </BottomNavigation>
      </Paper>
    </Box>
  );
}
