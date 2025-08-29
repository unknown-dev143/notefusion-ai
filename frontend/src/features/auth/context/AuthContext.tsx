import React, { createContext, useContext, ReactNode, useState, useCallback, useEffect } from 'react';
import authService, { Tokens } from '../services/authService';

// Key for storing auth data in localStorage
const AUTH_STORAGE_KEY = 'notefusion_auth';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  emailVerified: boolean;
  verificationToken?: string;
}

interface UpdateProfileData {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  tokens: Tokens | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  verifyEmail: (token: string) => Promise<{ success: boolean; message: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (token: string, password: string, passwordConfirmation: string) => Promise<{ success: boolean; message: string }>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize state from localStorage if available
  const [user, setUser] = useState<User | null>(() => {
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    return storedAuth ? JSON.parse(storedAuth).user : null;
  });

  const [tokens, setTokens] = useState<Tokens | null>(() => {
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    return storedAuth ? JSON.parse(storedAuth).tokens : null;
  });

  // Update user data in context and localStorage
  const updateUser = useCallback((updatedUser: Partial<User>) => {
    setUser(prevUser => {
      if (!prevUser) return null;
      const newUser = { ...prevUser, ...updatedUser };
      const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedAuth) {
        localStorage.setItem(
          AUTH_STORAGE_KEY,
          JSON.stringify({
            ...JSON.parse(storedAuth),
            user: newUser,
          })
        );
      }
      return newUser;
    });
  }, []);

  // Save auth state to localStorage when it changes
  useEffect(() => {
    if (user && tokens) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user, tokens }));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user, tokens]);

  // Setup token refresh interval
  useEffect(() => {
    if (!tokens?.refreshToken) return;

    const refreshInterval = setInterval(async () => {
      try {
        const newTokens = await authService.refreshToken(tokens.refreshToken);
        setTokens(newTokens);
      } catch (error) {
        console.error('Failed to refresh token:', error);
        await logout();
      }
    }, 14 * 60 * 1000); // Refresh token 14 minutes before expiry (assuming 15min expiry)

    return () => clearInterval(refreshInterval);
  }, [tokens?.refreshToken]);
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
      const { user, tokens } = await authService.login({ email, password });
      setUser(user);
      setTokens(tokens);
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
      setTokens(null);
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

  const updateProfile = useCallback(async (data: UpdateProfileData) => {
    try {
      setLoading(true);
      // In a real app, you would call your API to update the user's profile
      // const response = await api.patch('/users/me', data);
      // For now, we'll just update the local state
      if (data.name || data.email) {
        updateUser({
          ...(data.name && { name: data.name }),
          ...(data.email && { email: data.email }),
        });
      }
      // If password is being updated, log the user out to re-authenticate
      if (data.newPassword) {
        await logout();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update profile';
      setError(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [logout, updateUser]);

  const value = {
    user,
    isAuthenticated: !!user && !!tokens?.accessToken,
    loading: loading || !initialized,
    error,
    tokens,
    login,
    register,
    logout,
    verifyEmail,
    forgotPassword,
    resetPassword,
    updateProfile,
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
