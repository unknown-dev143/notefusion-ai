import axios, { 
  AxiosInstance, 
  AxiosRequestConfig, 
  AxiosResponse, 
  AxiosError, 
  InternalAxiosRequestConfig,
  AxiosRequestHeaders
} from 'axios';
import { useAuth } from '../contexts/AuthContext';

// Create axios instance with base URL
const api: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies/sessions
});

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        
        const { token } = response.data;
        localStorage.setItem('authToken', token);
        
        // Update the Authorization header
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, log the user out
        const { signOut } = useAuth();
        await signOut();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // Handle other errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { status, data } = error.response;
      
      if (status === 403) {
        // Handle forbidden (likely permission issues)
        console.error('Forbidden:', data);
      } else if (status === 404) {
        // Handle not found
        console.error('Resource not found:', data);
      } else if (status >= 500) {
        // Handle server errors
        console.error('Server error:', data);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Helper function to handle API errors consistently
const handleApiError = (error: any, defaultMessage = 'An error occurred'): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message || defaultMessage;
  }
  return error?.message || defaultMessage;
};

export { api, handleApiError };

