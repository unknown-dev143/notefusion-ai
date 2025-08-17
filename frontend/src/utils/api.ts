import { message } from 'antd';

// Base API URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Helper function to handle response errors
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || 'An error occurred';
    
    // Show error message to user
    message.error(errorMessage);
    
    // Throw error with status and message
    const error: any = new Error(errorMessage);
    error.status = response.status;
    error.data = errorData;
    throw error;
  }
  
  // For DELETE requests that return 204 No Content
  if (response.status === 204) {
    return null;
  }
  
  return response.json();
};

// Generic API request function
export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  // Set default headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add authentication token if available
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    return handleResponse(response);
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// CRUD operations
export const api = {
  // GET request
  get: <T>(endpoint: string, params?: Record<string, any>) => {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return apiRequest<T>(`${endpoint}${queryString}`, { method: 'GET' });
  },
  
  // POST request
  post: <T>(endpoint: string, data: any) => {
    return apiRequest<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  // PUT request
  put: <T>(endpoint: string, data: any) => {
    return apiRequest<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  // PATCH request
  patch: <T>(endpoint: string, data: any) => {
    return apiRequest<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
  
  // DELETE request
  delete: <T>(endpoint: string) => {
    return apiRequest<T>(endpoint, { method: 'DELETE' });
  },
};

// API endpoints
export const API_ENDPOINTS = {
  NOTES: '/api/notes',
  NOTE_BY_ID: (id: string) => `/api/notes/${id}`,
  NOTE_RESTORE: (id: string) => `/api/notes/${id}/restore`,
  NOTE_TOGGLE_PIN: (id: string) => `/api/notes/${id}/pin`,
  // Add more endpoints as needed
};

export default api;
