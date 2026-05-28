import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  linkWithPopup,
  linkWithRedirect,
} from 'firebase/auth';
import { auth } from '../firebase';

const googleProvider = new GoogleAuthProvider();

function prefersRedirect() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

async function runGoogleSignIn(linkToCurrentUser) {
  const useRedirect = prefersRedirect();

  const signIn = async () => {
    if (useRedirect) {
      await signInWithRedirect(auth, googleProvider);
      return;
    }
    await signInWithPopup(auth, googleProvider);
  };

  const link = async (user) => {
    if (useRedirect) {
      await linkWithRedirect(user, googleProvider);
      return;
    }
    await linkWithPopup(user, googleProvider);
  };

  if (linkToCurrentUser && auth.currentUser?.isAnonymous) {
    try {
      await link(auth.currentUser);
    } catch (err) {
      if (err.code === 'auth/popup-blocked' && !useRedirect) {
        await linkWithRedirect(auth.currentUser, googleProvider);
        return;
      }
      throw err;
    }
    return;
  }

  try {
    await signIn();
  } catch (err) {
    if (err.code === 'auth/popup-blocked' && !useRedirect) {
      await signInWithRedirect(auth, googleProvider);
      return;
    }
    throw err;
  }
}

export async function signInWithGoogleAccount() {
  const shouldLink = auth.currentUser?.isAnonymous;
  await runGoogleSignIn(shouldLink);
}

export function googleAuthErrorMessage(code) {
  switch (code) {
    case 'auth/popup-closed-by-user':
      return 'חלון ההתחברות נסגר לפני הסיום.';
    case 'auth/credential-already-in-use':
      return 'חשבון Google זה כבר מקושר לאפליקציה. התחבר באותו חשבון במכשירים האחרים.';
    case 'auth/account-exists-with-different-credential':
      return 'כתובת האימייל כבר בשימוש בשיטת התחברות אחרת.';
    case 'auth/cancelled-popup-request':
      return null;
    default:
      return null;
  }
}
