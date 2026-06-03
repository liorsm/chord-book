import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import InputAdornment from '@mui/material/InputAdornment';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import HeroSection from '../components/common/HeroSection';
import { grantSiteAccess, verifySitePassword } from '../utils/siteAccess';
import { logSiteAccessEntry } from '../utils/siteAccessLog';

export default function WelcomePage({ onAccessGranted }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    const trimmed = password.trim();
    if (!trimmed) {
      setError('נא להזין סיסמה');
      setSubmitting(false);
      return;
    }

    if (!verifySitePassword(trimmed)) {
      setError('סיסמה שגויה');
      setSubmitting(false);
      return;
    }

    grantSiteAccess();
    logSiteAccessEntry().catch(() => {});
    onAccessGranted?.();
    setSubmitting(false);
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <HeroSection title="ברוכים הבאים" contentMaxWidth="sm">
        <Typography
          variant="body1"
          component="p"
          sx={{
            color: 'rgba(255,255,255,0.9)',
            mb: 3,
            maxWidth: { md: 420 },
            mx: 'auto',
            lineHeight: 1.5,
          }}
        >
          האתר מיועד למוזמנים בלבד.
          <br />
          הזינו סיסמה כדי להמשיך.
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            width: '100%',
            maxWidth: { md: 420 },
            mx: 'auto',
            textAlign: 'start',
          }}
        >
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Paper
            elevation={0}
            sx={{
              mb: 2,
              borderRadius: '9999px',
              bgcolor: 'background.paper',
              overflow: 'hidden',
            }}
          >
            <TextField
              fullWidth
              type="password"
              placeholder="סיסמה"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={submitting}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end" disablePointerEvents>
                      <LockOutlinedIcon color="primary" fontSize="small" />
                    </InputAdornment>
                  ),
                },
                htmlInput: { dir: 'rtl' },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  height: 46,
                  borderRadius: '9999px',
                },
                '& .MuiOutlinedInput-input': {
                  py: 0,
                  px: 2,
                  fontSize: '1rem',
                  height: '100%',
                  boxSizing: 'border-box',
                },
                '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
              }}
            />
          </Paper>

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={submitting}
            sx={{
              fontWeight: 700,
              py: 1.25,
              bgcolor: 'rgba(0,0,0,0.85)',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.95)' },
            }}
          >
            כניסה
          </Button>
        </Box>
      </HeroSection>
    </Box>
  );
}
