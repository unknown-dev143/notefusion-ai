import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';

const getEnv = (key: string) => {
  return (
    import.meta.env?.[`VITE_${key}`] ||
    (typeof window !== 'undefined' && (window as any)._env_?.[`VITE_${key}`]) ||
    (typeof window !== 'undefined' && (window as any)._env_?.[`REACT_APP_${key}`]) ||
    process.env[`REACT_APP_${key}`] ||
    ''
  );
};

const apiKey = getEnv('FIREBASE_API_KEY') || 'AIzaSyDjjE1f0ltiXWzXeYG0Q0PPgwi6iZeYZ7E';

const firebaseConfig = {
  apiKey,
  authDomain: getEnv('FIREBASE_AUTH_DOMAIN') || 'notefusion-ai.firebaseapp.com',
  projectId: getEnv('FIREBASE_PROJECT_ID') || 'notefusion-ai',
  storageBucket: getEnv('FIREBASE_STORAGE_BUCKET') || 'notefusion-ai.firebasestorage.app',
  messagingSenderId: getEnv('FIREBASE_MESSAGING_SENDER_ID') || '925938525273',
  appId: getEnv('FIREBASE_APP_ID') || '1:925938525273:web:6e379781fafb33193abd48'
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

try {
  if (apiKey && apiKey !== '') {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
  }
} catch (error) {
  console.warn('[Firebase] Initialization skipped or error caught gracefully:', error);
}

export { app, auth };
export default app;
