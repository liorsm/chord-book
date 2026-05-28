import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
} from 'firebase/auth';
import { auth } from '../firebase';

const googleProvider = new GoogleAuthProvider();

/** קודי שגיאה שבהם popup לא אפשרי — נסה redirect כגיבוי */
const REDIRECT_FALLBACK_CODES = new Set([
  'auth/popup-blocked',
  'auth/operation-not-supported-in-this-environment',
]);

/**
 * Popup עובד טוב יותר ב-GitHub Pages (דומיין שונה מ-authDomain של Firebase).
 * Redirect במובייל נכשל לעיתים בשקט בגלל חסימת אחסון צד-שלישי (Safari וכו').
 */
export async function signInWithGoogleAccount() {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (err) {
    if (REDIRECT_FALLBACK_CODES.has(err.code)) {
      await signInWithRedirect(auth, googleProvider);
      return;
    }
    throw err;
  }
}

export function googleAuthErrorMessage(code) {
  switch (code) {
    case 'auth/popup-closed-by-user':
      return 'חלון ההתחברות נסגר לפני הסיום.';
    case 'auth/cancelled-popup-request':
      return null;
    case 'auth/unauthorized-domain':
      return 'הדומיין לא מורשה ב-Firebase. הוסף liorsm.github.io ב-Authentication → Authorized domains.';
    case 'auth/web-storage-unsupported':
      return 'הדפדפן חוסם אחסון מקומי. נסה דפדפן אחר או בטל מצב פרטי.';
    default:
      return null;
  }
}
