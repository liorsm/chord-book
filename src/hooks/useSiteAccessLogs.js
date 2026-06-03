import { useCallback, useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

function formatAt(value) {
  if (!value) return '—';
  const date = value instanceof Timestamp ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('he-IL');
}

export function useSiteAccessLogs({ enabled = true, max = 100 } = {}) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(Boolean(enabled));

  const loadLogs = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, 'siteAccessLogs'),
        orderBy('at', 'desc'),
        limit(max)
      );
      const snap = await getDocs(q);
      setLogs(
        snap.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            atLabel: formatAt(data.at),
            ip: data.ip || '—',
            userAgent: data.userAgent || '—',
            platform: data.platform || '',
            language: data.language || '',
            screen: data.screen || '',
            viewport: data.viewport || '',
            timeZone: data.timeZone || '',
            referrer: data.referrer || '',
            path: data.path || '',
            connectionType: data.connectionType || '',
          };
        })
      );
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [enabled, max]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  return { logs, loading, reload: loadLogs };
}
