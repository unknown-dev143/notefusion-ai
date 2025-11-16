import axios from 'axios';
import type { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// Get base URL from Vite environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance with base URL
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Only run in browser environment
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    // Handle network errors
    if (!error.response) {
      return Promise.reject({
        message: 'Network error. Please check your connection.',
      });
    }

    const { status, data } = error.response;
    
    // Handle 401 Unauthorized
    if (status === 401) {
      if (typeof window !== 'undefined') {
        // Clear auth data and redirect to login
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }

    // Return a consistent error format
    return Promise.reject({
      status: error.response?.status,
      message: (data as any)?.message || 'An error occurred',
      data: data || {},
    });
  }
);

// Helper function to handle API errors
export function handleApiError(error: unknown, defaultMessage = 'An error occurred'): string {
  if (axios.isAxiosError(error)) {
    // Handle Axios errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      return (error.response.data as any)?.message || error.response.statusText || defaultMessage;
    } else if (error.request) {
      // The request was made but no response was received
      return 'No response from server. Please check your connection.';
    }
    return error.message || defaultMessage;
  } else if (error instanceof Error) {
    // Handle other types of errors
    return error.message || defaultMessage;
  }
  return String(error) || defaultMessage;
}

export { api };
