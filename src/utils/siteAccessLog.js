import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import {
  fetchCurrentIpAndCity,
  parseUserAgent,
} from './siteAccessLogParse';

/** רישום כניסה מוצלחת — לא חוסם את המשתמש אם נכשל */
export async function logSiteAccessEntry() {
  const [{ ip, city }, { deviceType, os, browser }] = await Promise.all([
    fetchCurrentIpAndCity(),
    Promise.resolve(parseUserAgent(navigator.userAgent || '')),
  ]);

  await addDoc(collection(db, 'siteAccessLogs'), {
    at: serverTimestamp(),
    ip: ip || null,
    city: city || null,
    deviceType,
    os,
    browser,
  });
}
