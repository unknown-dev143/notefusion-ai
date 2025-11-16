import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, signOut as firebaseSignOut, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../firebase';
import { User, UserCredential } from '../types/user';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  token: string | null;
  signIn: (email: string, password: string) => Promise<UserCredential>;
  signUp: (email: string, password: string) => Promise<UserCredential>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateEmail: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  token: null,
  signIn: async () => ({ user: {} as User, providerId: null }),
  signUp: async () => ({ user: {} as User, providerId: null }),
  signOut: async () => {},
  resetPassword: async () => {},
  updateEmail: async () => {},
  updatePassword: async () => {},
});

// Helper function to map Firebase user to our User type
const mapFirebaseUser = (firebaseUser: FirebaseUser | null): User | null => {
  if (!firebaseUser) return null;
  
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    emailVerified: firebaseUser.emailVerified,
    isAdmin: firebaseUser.email?.endsWith('@admin.com') || false, // Simple admin check - replace with your logic
    role: firebaseUser.email?.endsWith('@admin.com') ? 'admin' : 'user',
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  const signIn = async (email: string, password: string): Promise<UserCredential> => {
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();
    setToken(token);
    localStorage.setItem('token', token);
    return {
      user: mapFirebaseUser(userCredential.user)!,
      providerId: userCredential.providerId,
      operationType: userCredential.operationType
    };
  };

  const signUp = async (email: string, password: string): Promise<UserCredential> => {
    const { createUserWithEmailAndPassword } = await import('firebase/auth');
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();
    setToken(token);
    localStorage.setItem('token', token);
    return {
      user: mapFirebaseUser(userCredential.user)!,
      providerId: userCredential.providerId,
      operationType: userCredential.operationType
    };
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const resetPassword = async (email: string) => {
    const { sendPasswordResetEmail } = await import('firebase/auth');
    await sendPasswordResetEmail(auth, email);
  };

  const updateEmail = async (email: string) => {
    if (!auth.currentUser) throw new Error('No user is signed in');
    const { updateEmail: updateUserEmail } = await import('firebase/auth');
    await updateUserEmail(auth.currentUser, email);
  };

  const updatePassword = async (password: string) => {
    if (!auth.currentUser) throw new Error('No user is signed in');
    const { updatePassword: updateUserPassword } = await import('firebase/auth');
    await updateUserPassword(auth.currentUser, password);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      const user = mapFirebaseUser(firebaseUser);
      setCurrentUser(user);
      
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          setToken(token);
          localStorage.setItem('token', token);
        } catch (error) {
          console.error('Error getting user token:', error);
          setToken(null);
          localStorage.removeItem('token');
        }
      } else {
        setToken(null);
        localStorage.removeItem('token');
      }
      
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
    loading,
    token,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateEmail,
    updatePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;
