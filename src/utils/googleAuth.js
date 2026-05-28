import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
} from 'firebase/auth';
import { auth } from '../firebase';

const googleProvider = new GoogleAuthProvider();

function prefersRedirect() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

export async function signInWithGoogleAccount() {
  const useRedirect = prefersRedirect();

  try {
    if (useRedirect) {
      await signInWithRedirect(auth, googleProvider);
      return;
    }
    await signInWithPopup(auth, googleProvider);
  } catch (err) {
    if (err.code === 'auth/popup-blocked' && !useRedirect) {
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
    default:
      return null;
  }
}
