import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../../contexts/AuthContext';

export default function ManageAuthPanel({ children }) {
  const {
    userId,
    isAdmin,
    displayName,
    email,
    authBusy,
    signInWithGoogle,
    signOut,
  } = useAuth();

  const handleSignIn = async () => {
    const result = await signInWithGoogle();
    if (!result.ok && result.message) {
      window.alert(result.message);
    }
  };

  if (!userId) {
    return (
      <Paper sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          כניסת מנהל
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          התחבר עם Google כדי לנהל שירים ופלייליסטים
        </Typography>
        <Button
          variant="contained"
          size="large"
          startIcon={authBusy ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
          onClick={handleSignIn}
          disabled={authBusy}
        >
          התחבר עם Google
        </Button>
      </Paper>
    );
  }

  if (!isAdmin) {
    return (
      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          החשבון {email || displayName || userId} אינו מורשה לניהול.
        </Alert>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          הוסף את ה-UID שלך ל־<code>VITE_ADMIN_UIDS</code> ולכללי Firestore (ראה README).
        </Typography>
        <Typography variant="caption" display="block" sx={{ mb: 2, fontFamily: 'monospace' }}>
          UID: {userId}
        </Typography>
        <Button startIcon={<LogoutIcon />} onClick={signOut} disabled={authBusy}>
          התנתק
        </Button>
      </Paper>
    );
  }

  return children;
}
