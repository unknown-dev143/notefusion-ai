import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  getAuth, 
  onAuthStateChanged, 
  signOut as firebaseSignOut, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateEmail as updateUserEmail,
  updatePassword as updateUserPassword,
  updateProfile as updateUserProfile,
  User as FirebaseUser,
  UserCredential
} from 'firebase/auth';
import { auth } from '../firebase';
import { AuthUser, AuthContextType } from './types';

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  token: null,
  signIn: async () => {
    throw new Error('AuthContext not initialized');
  },
  signUp: async () => {
    throw new Error('AuthContext not initialized');
  },
  signOut: async () => {
    throw new Error('AuthContext not initialized');
  },
  resetPassword: async () => {
    throw new Error('AuthContext not initialized');
  },
  updateEmail: async () => {
    throw new Error('AuthContext not initialized');
  },
  updatePassword: async () => {
    throw new Error('AuthContext not initialized');
  },
  updateProfile: async () => {
    throw new Error('AuthContext not initialized');
  },
});

// Helper function to map Firebase user to our AuthUser type
const mapFirebaseUser = (firebaseUser: FirebaseUser | null): AuthUser | null => {
  if (!firebaseUser) return null;
  
  // Cast the Firebase user to our extended AuthUser type
  return firebaseUser as AuthUser;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  const signIn = async (email: string, password: string): Promise<UserCredential> => {
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
    await sendPasswordResetEmail(auth, email);
  };

  const updateEmail = async (email: string) => {
    if (!currentUser) throw new Error('No user is currently signed in');
    await updateUserEmail(currentUser, email);
  };

  const updatePassword = async (password: string) => {
    if (!currentUser) throw new Error('No user is currently signed in');
    await updateUserPassword(currentUser, password);
  };

  const updateProfile = async (data: { displayName?: string; photoURL?: string }) => {
    if (!currentUser) throw new Error('No user is currently signed in');
    await updateUserProfile(currentUser, data);
    // Update local state to reflect changes
    setCurrentUser({
      ...currentUser,
      displayName: data.displayName ?? currentUser.displayName,
      photoURL: data.photoURL ?? currentUser.photoURL,
    });
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
    updateProfile,
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
