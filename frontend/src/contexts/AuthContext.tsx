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
  UserCredential,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  OAuthProvider
} from 'firebase/auth';
import { auth } from '../firebase';
import { AuthUser, AuthContextType } from './types';
import authService from '../features/auth/services/authService';
import { api } from '../lib/api';

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  user: null,
  isAuthenticated: false,
  loading: true,
  token: null,
  signIn: async () => {
    throw new Error('AuthContext not initialized');
  },
  signUp: async () => {
    throw new Error('AuthContext not initialized');
  },
  signInWithGoogle: async () => {
    throw new Error('AuthContext not initialized');
  },
  signInWithGithub: async () => {
    throw new Error('AuthContext not initialized');
  },
  signInWithMicrosoft: async () => {
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
  resendVerificationEmail: async () => {
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
    localStorage.setItem('authToken', token);
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
    localStorage.setItem('authToken', token);
    return {
      user: mapFirebaseUser(userCredential.user)!,
      providerId: userCredential.providerId,
      operationType: userCredential.operationType
    };
  };

  const signInWithGoogle = async (): Promise<UserCredential> => {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const token = await userCredential.user.getIdToken();
    setToken(token);
    localStorage.setItem('token', token);
    localStorage.setItem('authToken', token);
    return {
      user: mapFirebaseUser(userCredential.user)!,
      providerId: userCredential.providerId,
      operationType: userCredential.operationType
    };
  };

  const signInWithGithub = async (): Promise<UserCredential> => {
    const provider = new GithubAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const token = await userCredential.user.getIdToken();
    setToken(token);
    localStorage.setItem('token', token);
    localStorage.setItem('authToken', token);
    return {
      user: mapFirebaseUser(userCredential.user)!,
      providerId: userCredential.providerId,
      operationType: userCredential.operationType
    };
  };

  const signInWithMicrosoft = async (): Promise<UserCredential> => {
    const provider = new OAuthProvider('microsoft.com');
    // Add scopes if needed: provider.addScope('Files.ReadWrite');
    const userCredential = await signInWithPopup(auth, provider);
    const token = await userCredential.user.getIdToken();
    setToken(token);
    localStorage.setItem('token', token);
    localStorage.setItem('authToken', token);
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
    localStorage.removeItem('authToken');
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

  const resendVerificationEmail = async (email?: string) => {
    // Implementation for resending verification email
    // This would typically use Firebase's sendEmailVerification
    if (!currentUser && !email) {
      throw new Error('No user is currently signed in and no email provided');
    }
    // Add actual implementation here if needed
    console.log('Resend verification email to:', email || currentUser?.email);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const user = mapFirebaseUser(firebaseUser);
        setCurrentUser(user);
        try {
          const token = await firebaseUser.getIdToken();
          setToken(token);
          localStorage.setItem('token', token);
          localStorage.setItem('authToken', token);
        } catch (error) {
          console.error('Error getting user token:', error);
          setToken(null);
          localStorage.removeItem('token');
          localStorage.removeItem('authToken');
        }
        setLoading(false);
      } else {
        // Fallback to custom backend token if Firebase is not used
        const localToken = authService.getToken() || localStorage.getItem('token');
        if (localToken) {
          try {
            const userData = await authService.getCurrentUser();
            // Map our User to AuthUser
            const mappedUser = {
              uid: userData.id,
              email: userData.email,
              displayName: (userData as any).name || (userData as any).username,
              photoURL: null,
              emailVerified: true
            } as any;
            
            setCurrentUser(mappedUser);
            setToken(localToken);
          } catch (error) {
            console.error('Custom backend auth failed:', error);
            authService._clearTokens();
            setCurrentUser(null);
            setToken(null);
          }
        } else {
          setCurrentUser(null);
          setToken(null);
        }
        setLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
    user: currentUser,
    isAuthenticated: !!currentUser,
    loading,
    token,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithGithub,
    signInWithMicrosoft,
    signOut,
    resetPassword,
    updateEmail,
    updatePassword,
    updateProfile,
    resendVerificationEmail,
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
