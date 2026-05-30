import {
  SITE_ACCESS_STORAGE_KEY,
  SITE_ACCESS_TTL_MS,
  SITE_ACCESS_PASSWORD_B64,
} from '../config/siteAccess';

function readStored() {
  try {
    const raw = localStorage.getItem(SITE_ACCESS_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearSiteAccess() {
  localStorage.removeItem(SITE_ACCESS_STORAGE_KEY);
}

export function isSiteAccessGranted() {
  const data = readStored();
  if (!data?.grantedAt || typeof data.grantedAt !== 'number') {
    clearSiteAccess();
    return false;
  }
  if (Date.now() - data.grantedAt > SITE_ACCESS_TTL_MS) {
    clearSiteAccess();
    return false;
  }
  return true;
}

export function grantSiteAccess() {
  localStorage.setItem(
    SITE_ACCESS_STORAGE_KEY,
    JSON.stringify({ grantedAt: Date.now() })
  );
}

export function verifySitePassword(password) {
  try {
    return btoa(password) === SITE_ACCESS_PASSWORD_B64;
  } catch {
    return false;
  }
}
