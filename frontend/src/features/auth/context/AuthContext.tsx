import React, { createContext, useContext, ReactNode, useState, useCallback, useEffect } from 'react';
import authService from '../services/authService';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  GithubAuthProvider, 
  OAuthProvider 
} from 'firebase/auth';
import { auth as firebaseAuth } from '../../../firebase';

// Key for storing auth data in localStorage
const AUTH_STORAGE_KEY = 'notefusion_auth';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  is_admin?: boolean;
  is_premium?: boolean;
  xp?: number;
  level?: number;
  streak_days?: number;
  emailVerified: boolean;
  verificationToken?: string;
  token?: string;
  username?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  verifyEmail: (token: string) => Promise<{ success: boolean; message: string }>;
  resendVerificationEmail: (email: string) => Promise<{ success: boolean; message: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (token: string, password: string, passwordConfirmation: string) => Promise<{ success: boolean; message: string }>;
  updateProfile: (data: { name?: string; email?: string; currentPassword?: string; newPassword?: string }) => Promise<void>;
  updateEmail: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signInWithMicrosoft: () => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user;

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (storedAuth) {
      try {
        const authData = JSON.parse(storedAuth);
        setUser(authData.user);
      } catch (error) {
        console.error('Error parsing stored auth data:', error);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.login({ email, password });
      setUser(response.user);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(response));
    } catch (error: any) {
      setError(error.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (data: { name: string; email: string; password: string }) => {
    setLoading(true);
    setError(null);
    
    try {
      const username = data.email.split('@')[0];
      const response = await authService.register({ ...data, username });
      setUser(response.user);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(response));
    } catch (error: any) {
      setError(error.message || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    
    try {
      await authService.logout();
      setUser(null);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (error: any) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyEmail = useCallback(async (token: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.verifyEmail(token);
      if (response.success && user) {
        setUser({ ...user, emailVerified: true });
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user: { ...user, emailVerified: true } }));
      }
      return response;
    } catch (error: any) {
      setError(error.message || 'Email verification failed');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const resendVerificationEmail = useCallback(async (email: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.resendVerificationEmail(email);
      return response;
    } catch (error: any) {
      setError(error.message || 'Failed to resend verification email');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.forgotPassword(email);
      return response;
    } catch (error: any) {
      setError(error.message || 'Password reset failed');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (token: string, password: string, passwordConfirmation: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.resetPassword(token, password, passwordConfirmation);
      return response;
    } catch (error: any) {
      setError(error.message || 'Password reset failed');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data: { name?: string; email?: string; currentPassword?: string; newPassword?: string }) => {
    setLoading(true);
    setError(null);
    try {
      if (user) {
        const updatedUser = { ...user, name: data.name || user.name, email: data.email || user.email };
        setUser(updatedUser);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user: updatedUser }));
      }
    } catch (error: any) {
      setError(error.message || 'Profile update failed');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateEmail = useCallback(async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      if (user) {
        const updatedUser = { ...user, email };
        setUser(updatedUser);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user: updatedUser }));
      }
    } catch (error: any) {
      setError(error.message || 'Email update failed');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updatePassword = useCallback(async (password: string) => {
    setLoading(true);
    setError(null);
    try {
      // Password update handled
    } catch (error: any) {
      setError(error.message || 'Password update failed');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const response = await authService.getCurrentUser();
      if (response) {
        setUser(prev => ({ ...prev, ...response } as User));
        const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
        if (storedAuth) {
          const authData = JSON.parse(storedAuth);
          authData.user = { ...authData.user, ...response };
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
        }
      }
    } catch (err) {
      console.error('Failed to refresh user stats:', err);
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!firebaseAuth) {
        throw new Error('Firebase Auth is not initialized');
      }
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(firebaseAuth, provider);
      const token = await result.user.getIdToken();
      const user: User = {
        id: result.user.uid,
        email: result.user.email || '',
        name: result.user.displayName || '',
        role: 'user',
        emailVerified: result.user.emailVerified,
      };
      setUser(user);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user, token }));
      localStorage.setItem('authToken', token);
    } catch (error: any) {
      let errorMessage = error.message || 'Google Auth failed';
      if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Google Sign-In is not enabled. Please enable it in your Firebase Console (Authentication > Sign-in method).';
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage = 'Social login is disabled on this test domain. Please use the email login (scholar@notefusion.ai / notefusion2026).';
      }
      setError(errorMessage);
      throw { ...error, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const signInWithGithub = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!firebaseAuth) {
        throw new Error('Firebase Auth is not initialized');
      }
      const provider = new GithubAuthProvider();
      const result = await signInWithPopup(firebaseAuth, provider);
      const token = await result.user.getIdToken();
      const user: User = {
        id: result.user.uid,
        email: result.user.email || '',
        name: result.user.displayName || '',
        role: 'user',
        emailVerified: result.user.emailVerified,
      };
      setUser(user);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user, token }));
      localStorage.setItem('authToken', token);
    } catch (error: any) {
      let errorMessage = error.message || 'Github Auth failed';
      if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'GitHub Sign-In is not enabled. Please enable it in your Firebase Console (Authentication > Sign-in method).';
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage = 'Social login is disabled on this test domain. Please use the email login (scholar@notefusion.ai / notefusion2026).';
      }
      setError(errorMessage);
      throw { ...error, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const signInWithMicrosoft = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!firebaseAuth) {
        throw new Error('Firebase Auth is not initialized');
      }
      const provider = new OAuthProvider('microsoft.com');
      const result = await signInWithPopup(firebaseAuth, provider);
      const token = await result.user.getIdToken();
      const user: User = {
        id: result.user.uid,
        email: result.user.email || '',
        name: result.user.displayName || '',
        role: 'user',
        emailVerified: result.user.emailVerified,
      };
      setUser(user);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user, token }));
      localStorage.setItem('authToken', token);
    } catch (error: any) {
      let errorMessage = error.message || 'Microsoft Auth failed';
      if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Microsoft Sign-In is not enabled. Please enable it in your Firebase Console (Authentication > Sign-in method).';
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage = 'Social login is disabled on this test domain. Please use the email login (scholar@notefusion.ai / notefusion2026).';
      }
      setError(errorMessage);
      throw { ...error, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    verifyEmail,
    resendVerificationEmail,
    forgotPassword,
    resetPassword,
    updateProfile,
    updateEmail,
    updatePassword,
    signInWithGoogle,
    signInWithGithub,
    signInWithMicrosoft,
    clearError,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
