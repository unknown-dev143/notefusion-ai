import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { message } from 'antd';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // TODO: Replace with actual token verification
        const token = localStorage.getItem('token');
        if (token) {
          // TODO: Verify token with backend
          // const userData = await verifyToken(token);
          // setUser(userData);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, _password: string) => {
    try {
      setLoading(true);
      // TODO: Replace with actual login API call
      // const { user: userData, token } = await api.login(email, password);
      
      // Mock response for now
      const mockUser = { id: '1', email, name: email.split('@')[0] };
      const mockToken = 'mock-jwt-token';
      
      localStorage.setItem('token', mockToken);
      setUser(mockUser);
      message.success('Login successful!');
    } catch (error) {
      console.error('Login failed:', error);
      message.error('Login failed. Please check your credentials.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, _password: string) => {
    try {
      setLoading(true);
      // TODO: Replace with actual registration API call
      // const { user: userData, token } = await api.register(name, email, password);
      
      // Mock response for now
      const mockUser = { id: '1', email, name };
      const mockToken = 'mock-jwt-token';
      
      localStorage.setItem('token', mockToken);
      setUser(mockUser);
      message.success('Registration successful!');
    } catch (error) {
      console.error('Registration failed:', error);
      message.error('Registration failed. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    message.success('Logged out successfully');
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
