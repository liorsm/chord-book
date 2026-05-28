import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  signInAnonymously,
  onAuthStateChanged,
  getRedirectResult,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth } from '../firebase';
import { signInWithGoogleAccount, googleAuthErrorMessage } from '../utils/googleAuth';

const AuthContext = createContext({
  userId: null,
  isAnonymous: true,
  displayName: null,
  email: null,
  photoURL: null,
  loading: true,
  authBusy: false,
  error: null,
  authNotice: null,
  clearAuthNotice: () => {},
  signInWithGoogle: async () => ({ ok: true }),
  signOut: async () => {},
});

export function AuthProvider({ children }) {
  const [userId, setUserId] = useState(null);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [displayName, setDisplayName] = useState(null);
  const [email, setEmail] = useState(null);
  const [photoURL, setPhotoURL] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authBusy, setAuthBusy] = useState(false);
  const [error, setError] = useState(null);
  const [authNotice, setAuthNotice] = useState(null);

  const applyUser = useCallback((user) => {
    if (user) {
      setUserId(user.uid);
      setIsAnonymous(user.isAnonymous);
      setDisplayName(user.displayName);
      setEmail(user.email);
      setPhotoURL(user.photoURL);
    } else {
      setUserId(null);
      setIsAnonymous(true);
      setDisplayName(null);
      setEmail(null);
      setPhotoURL(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function finishRedirect() {
      try {
        await getRedirectResult(auth);
      } catch (err) {
        if (!cancelled) {
          const msg = googleAuthErrorMessage(err.code) || err.message;
          if (msg) setAuthNotice(msg);
        }
      }
    }

    finishRedirect();

    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (user) {
          applyUser(user);
          setError(null);
          setLoading(false);
          return;
        }

        try {
          const cred = await signInAnonymously(auth);
          if (!cancelled) {
            applyUser(cred.user);
            setError(null);
          }
        } catch (err) {
          if (!cancelled) {
            setError(err.message);
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      },
      (err) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      }
    );

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [applyUser]);

  const signInWithGoogle = useCallback(async () => {
    setAuthBusy(true);
    try {
      await signInWithGoogleAccount();
      return { ok: true };
    } catch (err) {
      const message = googleAuthErrorMessage(err.code) || err.message;
      return { ok: false, message };
    } finally {
      setAuthBusy(false);
    }
  }, []);

  const clearAuthNotice = useCallback(() => setAuthNotice(null), []);

  const signOut = useCallback(async () => {
    setAuthBusy(true);
    setError(null);
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setAuthBusy(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        userId,
        isAnonymous,
        displayName,
        email,
        photoURL,
        loading,
        authBusy,
        error,
        authNotice,
        clearAuthNotice,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
