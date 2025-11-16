import { User } from '../types/user';

// Save user data to localStorage
const saveUser = (user: User): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(user));
  }
};

// Get user data from localStorage
const getUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Remove user data from localStorage
const removeUser = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }
};

// Check if user is authenticated
const isAuthenticated = (): boolean => {
  const user = getUser();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return !!(user && token);
};

// Check if user is admin
const isAdmin = (): boolean => {
  const user = getUser();
  return user?.isAdmin || false;
};

// Get auth headers for API requests
const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export { saveUser, getUser, removeUser, isAuthenticated, isAdmin, getAuthHeaders };
