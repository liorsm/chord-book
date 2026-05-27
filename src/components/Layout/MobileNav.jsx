import { Link, useLocation } from 'react-router-dom';
import Paper from '@mui/material/Paper';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Box from '@mui/material/Box';
import HomeIcon from '@mui/icons-material/Home';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import { useThemeMode } from '../../ThemeContext';

export default function MobileNav() {
  const location = useLocation();
  const { mode } = useThemeMode();

  if (location.pathname.startsWith('/song/')) return null;

  const value = location.pathname.startsWith('/manage')
    ? '/manage'
    : location.pathname === '/favorites'
      ? '/favorites'
      : location.pathname === '/add'
        ? '/add'
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
        <BottomNavigation value={value} showLabels>
          <BottomNavigationAction
            label="בית"
            value="/"
            icon={<HomeIcon />}
            component={Link}
            to="/"
          />
          <BottomNavigationAction
            label="מועדפים"
            value="/favorites"
            icon={<FavoriteIcon />}
            component={Link}
            to="/favorites"
          />
          <BottomNavigationAction
            label="הוסף"
            value="/add"
            icon={<AddCircleIcon color="primary" />}
            component={Link}
            to="/add"
          />
          <BottomNavigationAction
            label="ניהול"
            value="/manage"
            icon={<SettingsIcon />}
            component={Link}
            to="/manage"
          />
        </BottomNavigation>
      </Paper>
    </Box>
  );
}
