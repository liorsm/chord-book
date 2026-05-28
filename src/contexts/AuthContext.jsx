import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { auth } from '../firebase';
import { isAdminUid } from '../config/admin';
import { signInWithGoogleAccount, googleAuthErrorMessage } from '../utils/googleAuth';
import { getRedirectResultOnce } from '../utils/authRedirect';

const AuthContext = createContext({
  userId: null,
  isAdmin: false,
  displayName: null,
  email: null,
  photoURL: null,
  loading: true,
  authBusy: false,
  authNotice: null,
  clearAuthNotice: () => {},
  signInWithGoogle: async () => ({ ok: true }),
  signOut: async () => {},
});

export function AuthProvider({ children }) {
  const [userId, setUserId] = useState(null);
  const [displayName, setDisplayName] = useState(null);
  const [email, setEmail] = useState(null);
  const [photoURL, setPhotoURL] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authBusy, setAuthBusy] = useState(false);
  const [authNotice, setAuthNotice] = useState(null);

  const isAdmin = useMemo(() => isAdminUid(userId), [userId]);

  const applyUser = useCallback((user) => {
    if (user && !user.isAnonymous) {
      setUserId(user.uid);
      setDisplayName(user.displayName);
      setEmail(user.email);
      setPhotoURL(user.photoURL);
    } else {
      setUserId(null);
      setDisplayName(null);
      setEmail(null);
      setPhotoURL(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    let unsubscribe = () => {};

    async function initAuth() {
      setLoading(true);
      try {
        await setPersistence(auth, browserLocalPersistence);
      } catch {
        // דפדפן ללא localStorage — onAuthStateChanged עדיין ינסה
      }

      try {
        const result = await getRedirectResultOnce(auth);
        if (!cancelled && result?.user) {
          applyUser(result.user);
        }
      } catch (err) {
        if (!cancelled) {
          const msg = googleAuthErrorMessage(err.code) || err.message;
          if (msg) setAuthNotice(msg);
        }
      }

      unsubscribe = onAuthStateChanged(auth, (user) => {
        if (!cancelled) {
          applyUser(user);
          setLoading(false);
        }
      });
    }

    initAuth();

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [applyUser]);

  const signInWithGoogle = useCallback(async () => {
    setAuthBusy(true);
    setAuthNotice(null);
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
    try {
      await firebaseSignOut(auth);
    } finally {
      setAuthBusy(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        userId,
        isAdmin,
        displayName,
        email,
        photoURL,
        loading,
        authBusy,
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
