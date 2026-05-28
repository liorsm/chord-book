/**
 * UIDs שמופיעים גם ב-firestore.rules — שמור סנכרון בעת הוספת מנהל.
 * מאפשר ניהול ב-GitHub Pages גם בלי Secret (ה-UID כבר ציבורי בכללי Firestore).
 */
const DEFAULT_ADMIN_UIDS = ['xFWRzoBGgRc2UlBPKLW2fqMFsm13'];

/** רשימת Firebase UIDs מורשים לניהול (.env / GitHub Secret, מופרד בפסיקים) */
export function getAdminUids() {
  const raw = import.meta.env.VITE_ADMIN_UIDS || '';
  const fromEnv = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return [...new Set([...DEFAULT_ADMIN_UIDS, ...fromEnv])];
}

export function isAdminUid(uid) {
  return Boolean(uid && getAdminUids().includes(uid));
}
