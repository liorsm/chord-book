import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import ComputerIcon from '@mui/icons-material/Computer';
import SmartphoneIcon from '@mui/icons-material/Smartphone';

function DeviceChip({ type }) {
  const isMobile = type === 'Mobile';
  return (
    <Chip
      size="small"
      icon={isMobile ? <SmartphoneIcon /> : <ComputerIcon />}
      label={isMobile ? 'Mobile' : 'Desktop'}
      variant="outlined"
      sx={{ fontWeight: 500 }}
    />
  );
}

export default function SiteAccessLogsTable({ logs }) {
  if (logs.length === 0) {
    return (
      <Typography textAlign="center" py={4} color="text.secondary" dir="rtl">
        עדיין אין רשומות. פרסמו את firestore.rules ונסו כניסה עם הסיסמה.
      </Typography>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined" sx={{ mx: 2, mb: 2 }}>
      <Table size="small" dir="ltr" sx={{ direction: 'ltr' }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Date & Time</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Device</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>OS</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Browser</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Location</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>IP</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {logs.map((entry) => (
            <TableRow key={entry.id} hover>
              <TableCell sx={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                {entry.atLabel}
              </TableCell>
              <TableCell>
                <DeviceChip type={entry.deviceType} />
              </TableCell>
              <TableCell>{entry.os}</TableCell>
              <TableCell>{entry.browser}</TableCell>
              <TableCell>{entry.city}</TableCell>
              <TableCell>
                <Box component="span" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                  {entry.ip}
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
