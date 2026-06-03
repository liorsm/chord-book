import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

function collectDeviceInfo() {
  const conn = navigator.connection;
  return {
    userAgent: navigator.userAgent || '',
    platform: navigator.platform || '',
    language: navigator.language || '',
    languages: Array.isArray(navigator.languages) ? [...navigator.languages] : [],
    screen: `${window.screen?.width || 0}x${window.screen?.height || 0} @${window.devicePixelRatio || 1}x`,
    viewport: `${window.innerWidth || 0}x${window.innerHeight || 0}`,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
    referrer: document.referrer || '',
    path: `${window.location.pathname}${window.location.search}`,
    connectionType: conn?.effectiveType || null,
  };
}

async function fetchClientIp() {
  try {
    const res = await fetch('https://api.ipify.org?format=json', {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data?.ip === 'string' ? data.ip : null;
  } catch {
    return null;
  }
}

/** רישום כניסה מוצלחת — לא חוסם את המשתמש אם נכשל */
export async function logSiteAccessEntry() {
  const [ip, device] = await Promise.all([fetchClientIp(), Promise.resolve(collectDeviceInfo())]);
  await addDoc(collection(db, 'siteAccessLogs'), {
    at: serverTimestamp(),
    ip,
    ...device,
  });
}
