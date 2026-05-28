import { useState } from 'react';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Avatar from '@mui/material/Avatar';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../../contexts/AuthContext';

export default function AuthButton({ variant = 'button', onMenuClose }) {
  const { isAnonymous, displayName, email, photoURL, signInWithGoogle, signOut, authBusy } =
    useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);

  const handleSignIn = async () => {
    onMenuClose?.();
    const result = await signInWithGoogle();
    if (!result.ok && result.message) {
      window.alert(result.message);
    }
  };

  const handleSignOut = async () => {
    setAnchorEl(null);
    onMenuClose?.();
    await signOut();
  };

  if (isAnonymous) {
    if (variant === 'menuItem') {
      return (
        <MenuItem onClick={handleSignIn} disabled={authBusy}>
          <ListItemIcon>
            {authBusy ? <CircularProgress size={20} /> : <LoginIcon fontSize="small" />}
          </ListItemIcon>
          <ListItemText primary="התחבר עם Google" secondary="סנכרון בין מכשירים" />
        </MenuItem>
      );
    }

    return (
      <Button
        variant="outlined"
        size="small"
        startIcon={authBusy ? <CircularProgress size={16} color="inherit" /> : <LoginIcon />}
        onClick={handleSignIn}
        disabled={authBusy}
        sx={{ whiteSpace: 'nowrap' }}
      >
        התחבר
      </Button>
    );
  }

  const label = displayName || email || 'משתמש';

  if (variant === 'menuItem') {
    return (
      <>
        <MenuItem disabled sx={{ opacity: 1 }}>
          <ListItemText primary={label} secondary={email} />
        </MenuItem>
        <MenuItem onClick={handleSignOut} disabled={authBusy}>
          <ListItemIcon>
            {authBusy ? <CircularProgress size={20} /> : <LogoutIcon fontSize="small" />}
          </ListItemIcon>
          <ListItemText primary="התנתק" />
        </MenuItem>
      </>
    );
  }

  return (
    <>
      <Tooltip title={email || label}>
        <IconButton
          onClick={(e) => setAnchorEl(e.currentTarget)}
          size="small"
          disabled={authBusy}
          aria-label="תפריט משתמש"
        >
          {authBusy ? (
            <CircularProgress size={24} />
          ) : (
            <Avatar src={photoURL || undefined} alt={label} sx={{ width: 32, height: 32 }}>
              {label.charAt(0).toUpperCase()}
            </Avatar>
          )}
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <MenuItem disabled sx={{ opacity: 1 }}>
          <ListItemText primary={label} secondary={email} />
        </MenuItem>
        <MenuItem onClick={handleSignOut}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="התנתק" />
        </MenuItem>
      </Menu>
    </>
  );
}
