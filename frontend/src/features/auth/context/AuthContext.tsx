import React, { createContext, useContext, ReactNode, useState, useCallback, useEffect } from 'react';
import authService from '../services/authService';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  emailVerified: boolean;
  verificationToken?: string;
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
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (token: string, password: string, passwordConfirmation: string) => Promise<{ success: boolean; message: string }>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        await authService.logout();
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { user } = await authService.login({ email, password });
      setUser(user);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred during login';
      setError(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async ({ name, email, password }: { name: string; email: string; password: string }) => {
    setLoading(true);
    setError(null);
    
    try {
      const { user } = await authService.register({ name, email, password });
      setUser(user);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      setError(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      setError('Failed to logout. Please try again.');
    }
  }, []);

  const verifyEmail = useCallback(async (token: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authService.verifyEmail(token);
      setUser(prev => prev ? { ...prev, emailVerified: true } : null);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to verify email';
      setError(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    setLoading(true);
    setError(null);
    
    try {
      return await authService.forgotPassword(email);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send password reset email';
      setError(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (token: string, password: string, passwordConfirmation: string) => {
    setLoading(true);
    setError(null);
    
    try {
      return await authService.resetPassword(token, password, passwordConfirmation);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to reset password';
      setError(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    loading: loading || !initialized,
    error,
    login,
    register,
    logout,
    verifyEmail,
    forgotPassword,
    resetPassword,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
