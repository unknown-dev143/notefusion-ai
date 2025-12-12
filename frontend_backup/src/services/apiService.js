import axios from 'axios';
import { getAuth } from 'firebase/auth';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token to request headers
    const token = localStorage.getItem('token');
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
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If unauthorized and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const auth = getAuth();
        const user = auth.currentUser;
        
        if (user) {
          const newToken = await user.getIdToken(true);
          localStorage.setItem('token', newToken);
          
          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Redirect to login or handle token refresh failure
        window.location.href = '/login';
      }
    }
    
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Flashcards
const getFlashcards = async (sessionId) => {
  const response = await api.get(`/api/flashcards/${sessionId}`);
  return response;
};

// Quiz
const getQuiz = async (sessionId) => {
  const response = await api.get(`/api/quiz/${sessionId}`);
  return response;
};

export const apiService = {
  getFlashcards,
  getQuiz,
  // Async video job: submit, poll, download
  submitVideoJob: async (payload) => {
    // POST to submit job, returns {job_id, status}
    const response = await api.post('/api/video/job', payload);
    return response;
  },
  getVideoJobStatus: async (jobId) => {
    // GET job status/result
    const response = await api.get(`/api/video/job/${jobId}`);
    return response;
  },
  downloadVideoJobResult: async (jobId) => {
    // GET video file
    const response = await api.get(`/api/video/job/${jobId}/download`, { responseType: 'blob' });
    return response;
  },
  // File upload and processing
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  transcribeAudio: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/api/transcribe', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  // Content fusion
  fuseContent: async (data) => {
    const formData = new FormData();
    formData.append('lecture_content', data.lecture_content);
    formData.append('textbook_content', data.textbook_content);
    formData.append('module_code', data.module_code);
    formData.append('chapters', data.chapters);
    formData.append('detail_level', data.detail_level);
    if (data.session_id) {
      formData.append('session_id', data.session_id);
    }
    
    const response = await api.post('/api/fuse', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  // Sessions
  getSessions: async () => {
    const response = await api.get('/api/sessions');
    return response.data;
  },

  getSession: async (sessionId) => {
    return api.get(`/sessions/${sessionId}`);
  },

  createSession: async (data) => {
    return api.post('/sessions', data);
  },

  // Search
  searchContent: async (query, sessionId = null) => {
    const params = { query };
    if (sessionId) {
      params.session_id = sessionId;
    }
    const response = await api.get('/api/search', { params });
    return response;
  },

  // Export
  exportMarkdown: async (sessionId) => {
    const formData = new FormData();
    formData.append('session_id', sessionId);
    
    const response = await api.post('/api/export/markdown', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      responseType: 'blob',
    });
    return response;
  },

  exportPDF: async (sessionId) => {
    const formData = new FormData();
    formData.append('session_id', sessionId);
    
    const response = await api.post('/api/export/pdf', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      responseType: 'blob',
    });
    return response;
  },

  exportFlashcards: async (sessionId) => {
    const formData = new FormData();
    formData.append('session_id', sessionId);
    
    const response = await api.post('/api/export/flashcards', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      responseType: 'blob',
    });
    return response;
  },

  // Diagrams
  saveDiagram: async (sessionId, diagramData, diagramType = 'freehand') => {
    const formData = new FormData();
    formData.append('session_id', sessionId);
    formData.append('diagram_data', diagramData);
    formData.append('diagram_type', diagramType);
    
    const response = await api.post('/api/diagrams/save', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  getDiagrams: async (sessionId) => {
    const response = await api.get(`/api/diagrams/${sessionId}`);
    return response;
  },

  // Notes versions
  saveNotesVersion: async (sessionId, notesContent, versionNumber) => {
    const formData = new FormData();
    formData.append('session_id', sessionId);
    formData.append('notes_content', notesContent);
    formData.append('version_number', versionNumber);
    
    const response = await api.post('/api/notes/version', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  getNotesVersions: async (sessionId) => {
    const response = await api.get(`/api/notes/versions/${sessionId}`);
    return response;
  },

  // WebSocket connection for live recording
  createWebSocket: (sessionId) => {
    const wsUrl = API_BASE_URL.replace('http', 'ws');
    return new WebSocket(`${wsUrl}/ws/recording`);
  },

  // Health check
  healthCheck: async () => {
    const response = await api.get('/');
    return response;
  },
};

// Utility functions
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}; 