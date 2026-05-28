import { Navigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useAuth } from '../../contexts/AuthContext';

/** מפנה ל-/manage אם אין הרשאת מנהל */
export default function AdminGuard({ children }) {
  const { isAdmin, loading, userId } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!userId || !isAdmin) {
    return <Navigate to="/manage" replace />;
  }

  return children;
}
