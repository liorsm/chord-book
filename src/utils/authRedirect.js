import { getRedirectResult } from 'firebase/auth';

/** getRedirectResult ניתן לקריאה פעם אחת בלבד לכל טעינת דף — מונע כשל ב-StrictMode */
let redirectResultPromise = null;

export function getRedirectResultOnce(auth) {
  if (!redirectResultPromise) {
    redirectResultPromise = getRedirectResult(auth);
  }
  return redirectResultPromise;
}
