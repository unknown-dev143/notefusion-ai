import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { message } from 'antd';
import { authAPI } from '../services/authAPI';

interface User {
  id: string;
  name: string;
  email: string;
  mfaEnabled: boolean;
  avatar?: string;
  role?: 'admin' | 'moderator' | 'user' | 'premium';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, token?: string) => Promise<{ success: boolean; requiresMfa?: boolean }>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  enableMFA: () => Promise<{ secret: string; otpauthUrl: string }>;
  verifyMFA: (token: string, secret: string) => Promise<void>;
  mfaEnabled: boolean;
  pendingAuth: { email: string; password: string } | null;
  setPendingAuth: (auth: { email: string; password: string } | null) => void;
  mfaRequired: boolean;
  setMfaRequired: (required: boolean) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingAuth, setPendingAuth] = useState<{ email: string; password: string } | null>(null);
  const [mfaRequired, setMfaRequired] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, _token?: string) => {
    setLoading(true);
    try {
      const response = await authAPI.login({ email, password });
      
      if (response.error) {
        message.error(response.error);
        return { success: false };
      }

      if (response.data) {
        setUser({
          id: response.data.user.id,
          name: response.data.user.full_name,
          email: response.data.user.email,
          mfaEnabled: false,
          avatar: undefined,
          role: 'user',
        });
        message.success('Login successful!');
        return { success: true };
      }
      
      return { success: false };
    } catch (error: any) {
      message.error(error.message || 'Login failed');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const response = await authAPI.register({ 
        email, 
        password, 
        full_name: name,
        username: email.split('@')[0]
      });
      
      if (response.error) {
        message.error(response.error);
        throw new Error(response.error);
      }

      if (response.data) {
        setUser({
          id: response.data.user.id,
          name: response.data.user.full_name,
          email: response.data.user.email,
          mfaEnabled: false,
          avatar: undefined,
          role: 'user',
        });
        message.success('Registration successful!');
      }
    } catch (error: any) {
      message.error(error.message || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  };

  const enableMFA = async () => {
    // Frontend-only mock secret generation for demo purposes
    const secret = Math.random().toString(36).slice(2, 18).toUpperCase();
    const email = user?.email ?? 'user';
    localStorage.setItem('mfaSecret', secret);
    return {
      secret,
      otpauthUrl: `otpauth://totp/NoteFusion:${email}?secret=${secret}&issuer=NoteFusion%20AI`,
    };
  };

  const verifyMFA = async (token: string, _secret: string) => {
    // Simple check: expect a 6-digit code
    if (token.length !== 6) {
      throw new Error('Invalid verification code');
    }

    localStorage.setItem('mfaEnabled', 'true');
    setUser(prev => (prev ? { ...prev, mfaEnabled: true } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        enableMFA,
        verifyMFA,
        mfaEnabled: user?.mfaEnabled || false,
        pendingAuth,
        setPendingAuth,
        mfaRequired,
        setMfaRequired,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
