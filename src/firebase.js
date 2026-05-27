import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyAXqi2nyYSEiZojRadQFPEYTzpL1_i9iFg',
  authDomain: 'chord-book-543fa.firebaseapp.com',
  projectId: 'chord-book-543fa',
  storageBucket: 'chord-book-543fa.firebasestorage.app',
  messagingSenderId: '103654808905',
  appId: '1:103654808905:web:a41060c18890e1038b4e98',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
