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
import { parseUserAgent } from '../utils/siteAccessLogParse';

function formatLoginAt(value) {
  if (!value) return '—';
  const date = value instanceof Timestamp ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy}, ${hh}:${min}`;
}

function normalizeLog(doc) {
  const data = doc.data();

  if (data.deviceType && data.os && data.browser) {
    return {
      id: doc.id,
      atLabel: formatLoginAt(data.at),
      deviceType: data.deviceType,
      os: data.os,
      browser: data.browser,
      city: data.city || '—',
      ip: data.ip || '—',
    };
  }

  const parsed = parseUserAgent(data.userAgent || '');
  return {
    id: doc.id,
    atLabel: formatLoginAt(data.at),
    deviceType: parsed.deviceType,
    os: parsed.os,
    browser: parsed.browser,
    city: data.city || '—',
    ip: data.ip || '—',
  };
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
      setLogs(snap.docs.map(normalizeLog));
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
