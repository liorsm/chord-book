/** רשימת Firebase UIDs מורשים לניהול (מופרד בפסיקים ב-.env) */
export function getAdminUids() {
  const raw = import.meta.env.VITE_ADMIN_UIDS || '';
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function isAdminUid(uid) {
  return Boolean(uid && getAdminUids().includes(uid));
}
