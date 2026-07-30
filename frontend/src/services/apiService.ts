import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  get: <T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => 
    apiClient.get<T>(url, config),
  
  post: <T>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> => 
    apiClient.post<T>(url, data, config),
    
  put: <T>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> => 
    apiClient.put<T>(url, data, config),
    
  delete: <T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => 
    apiClient.delete<T>(url, config),
    
  patch: <T>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> => 
    apiClient.patch<T>(url, data, config),

  // Notes
  getNotes: async () => {
    const response = await apiClient.get('/notes');
    return response.data;
  },
  getNote: async (id: string) => {
    const response = await apiClient.get(`/notes/${id}`);
    return response.data;
  },
  createNote: async (note: any) => {
    const response = await apiClient.post('/notes', note);
    return response.data;
  },
  updateNote: async (id: string, updates: any) => {
    const response = await apiClient.patch(`/notes/${id}`, updates);
    return response.data;
  },
  deleteNote: async (id: string) => {
    await apiClient.delete(`/notes/${id}`);
  },
  searchNotes: async (query: string) => {
    const response = await apiClient.get('/notes/search', { params: { q: query } });
    return response.data;
  },

  // Folders
  createFolder: async (name: string) => {
    const response = await apiClient.post('/folders', { name });
    return response.data;
  },
  addNoteToFolder: async (noteId: string, folderId: string) => {
    await apiClient.post(`/folders/${folderId}/notes/${noteId}`);
  },

  // Media
  uploadMedia: async (formData: FormData) => {
    const response = await apiClient.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.url;
  },
};

export default apiService;
