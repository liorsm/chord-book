import { createContext, useContext, useEffect, useState } from 'react';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

const AuthContext = createContext({
  userId: null,
  loading: true,
  error: null,
});

export function AuthProvider({ children }) {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (user) {
          setUserId(user.uid);
          setLoading(false);
        } else {
          try {
            const cred = await signInAnonymously(auth);
            setUserId(cred.user.uid);
            setError(null);
          } catch (err) {
            setError(err.message);
          } finally {
            setLoading(false);
          }
        }
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ userId, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
