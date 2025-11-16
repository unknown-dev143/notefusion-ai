import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
<<<<<<< HEAD
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
=======

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
<<<<<<< HEAD
const db = getFirestore(app);

// Enable offline persistence
try {
  await enableIndexedDbPersistence(db);
  console.log('Offline persistence enabled');
} catch (err) {
  if (err.code === 'failed-precondition') {
    console.warn('Offline persistence can only be enabled in one tab at a time.');
  } else if (err.code === 'unimplemented') {
    console.warn('The current browser doesn\'t support offline persistence');
  }
}

export { app, auth, db };
=======

export { app, auth };
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
export default app;
