import axios, { AxiosError, AxiosRequestConfig } from 'axios';

// ====================================
// Type Definitions
// ====================================

// Base response type
interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

// User types
interface User {
  id: string;
  email: string;
  full_name: string;
  is_active?: boolean;
  is_superuser?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Note types
interface NoteBase {
  title: string;
  content: string;
  user_id?: string;
}

interface Note extends NoteBase {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

// Flashcard types
interface FlashcardBase {
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  last_reviewed?: string;
  next_review_date?: string;
  user_id?: string;
}

interface Flashcard extends FlashcardBase {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

// Project types
interface ProjectBase {
  name: string;
  description?: string;
  user_id?: string;
}

interface Project extends ProjectBase {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

// Auth types
interface TokenResponse {
  access_token: string;
  token_type: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData extends LoginCredentials {
  full_name: string;
}

// ====================================
// Configuration
// ====================================

const getConfig = (key: string, defaultValue: string): string => {
  // Check if running in browser
  if (typeof window === 'undefined') {
    return defaultValue;
  }

  // Check window.appConfig (set in public/config.js)
  if ((window as any).appConfig?.[key] !== undefined) {
    return (window as any).appConfig[key];
  }

  // Check window._env_ (for Create React App)
  if ((window as any)._env_?.[key] !== undefined) {
    return (window as any)._env_[key];
  }

  // Check process.env (for build-time variables)
  if (process?.env?.[`REACT_APP_${key}`] !== undefined) {
    return process.env[`REACT_APP_${key}`] as string;
  }

  return defaultValue;
};

const API_BASE_URL = getConfig('API_URL', 'http://localhost:8000/api');
const WS_BASE_URL = getConfig('WS_URL', 'ws://localhost:8000');
const REQUEST_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 2;

// ====================================
// WebSocket Manager
// ====================================

class WebSocketManager {
  private static instance: WebSocketManager;
  private socket: WebSocket | null = null;
  private messageHandlers: Set<(data: any) => void> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // 1 second

  private constructor() {}

  public static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  public connect(onMessage?: (data: any) => void): WebSocket {
    if (this.socket) {
      if (onMessage) {
        this.addMessageHandler(onMessage);
      }
      return this.socket;
    }

    this.socket = new WebSocket(WS_BASE_URL);
    this.reconnectAttempts = 0;

    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.messageHandlers.forEach(handler => handler(data));
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
      this.socket = null;
      this.attemptReconnect();
    };

    if (onMessage) {
      this.addMessageHandler(onMessage);
    }

    return this.socket;
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.messageHandlers.clear();
    }
  }

  public addMessageHandler(handler: (data: any) => void): () => void {
    this.messageHandlers.add(handler);
    return () => this.removeMessageHandler(handler);
  }

  private removeMessageHandler(handler: (data: any) => void): void {
    this.messageHandlers.delete(handler);
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
    
    setTimeout(() => {
      this.connect();
    }, Math.min(delay, 30000)); // Max 30 seconds delay
  }
}

const webSocketManager = WebSocketManager.getInstance();

// WebSocket helper functions for backward compatibility
const connectWebSocket = (onMessage?: (data: any) => void): WebSocket => {
  return webSocketManager.connect(onMessage);
};

const disconnectWebSocket = (): void => {
  webSocketManager.disconnect();
};

const addWebSocketMessageHandler = (handler: (data: any) => void): (() => void) => {
  return webSocketManager.addMessageHandler(handler);
};

// ====================================
// HTTP Client
// ====================================

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const axiosError = error as AxiosError;
    
    if (axiosError.response?.status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } else if (axiosError.response?.status === 403) {
      console.error('Access forbidden:', axiosError);
    } else if (axiosError.response?.status && axiosError.response.status >= 500) {
      console.error('Server error:', axiosError);
    } else if ((axiosError as any).code === 'ECONNABORTED') {
      console.error('Request timeout:', axiosError);
    } else if (!window.navigator.onLine) {
      console.error('No internet connection');
    }
    
    return Promise.reject(error);
  }
);

// ====================================
// API Services
// ====================================

// Auth API
export const authApi = {
  async login(credentials: LoginCredentials): Promise<TokenResponse> {
    const formData = new URLSearchParams();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);
    
    const response = await api.post<TokenResponse>('/auth/token', formData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      api.defaults.headers.common.Authorization = `Bearer ${response.data.access_token}`;
    }
    
    return response.data;
  },
  
  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/users/me');
    return response.data;
  },
  
  async register(userData: RegisterData): Promise<User> {
    const response = await api.post<User>('/auth/register', userData);
    return response.data;
  },
  
  logout(): void {
    localStorage.removeItem('token');
    delete api.defaults.headers.common.Authorization;
  },
  
  async refreshToken(): Promise<TokenResponse> {
    const response = await api.post<TokenResponse>('/auth/refresh-token');
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      api.defaults.headers.common.Authorization = `Bearer ${response.data.access_token}`;
    }
    return response.data;
  }
};

// Notes API
export const notesApi = {
  async getNotes(): Promise<Note[]> {
    const response = await api.get<Note[]>('/notes');
    return response.data;
  },
  
  async getNoteById(id: string): Promise<Note> {
    const response = await api.get<Note>(`/notes/${id}`);
    return response.data;
  },
  
  async createNote(note: NoteBase): Promise<Note> {
    const response = await api.post<Note>('/notes', note);
    return response.data;
  },
  
  async updateNote(id: string, updates: Partial<NoteBase>): Promise<Note> {
    const response = await api.patch<Note>(`/notes/${id}`, updates);
    return response.data;
  },
  
  async deleteNote(id: string): Promise<void> {
    await api.delete(`/notes/${id}`);
  }
};

// Flashcards API
export const flashcardsApi = {
  async getFlashcards(): Promise<Flashcard[]> {
    const response = await api.get<Flashcard[]>('/flashcards');
    return response.data;
  },
  
  async getFlashcardById(id: string): Promise<Flashcard> {
    const response = await api.get<Flashcard>(`/flashcards/${id}`);
    return response.data;
  },
  
  async createFlashcard(flashcard: FlashcardBase): Promise<Flashcard> {
    const response = await api.post<Flashcard>('/flashcards', flashcard);
    return response.data;
  },
  
  async updateFlashcard(id: string, updates: Partial<FlashcardBase>): Promise<Flashcard> {
    const response = await api.patch<Flashcard>(`/flashcards/${id}`, updates);
    return response.data;
  },
  
  async deleteFlashcard(id: string): Promise<void> {
    await api.delete(`/flashcards/${id}`);
  },
  
  async reviewFlashcard(id: string, difficulty: 'easy' | 'medium' | 'hard'): Promise<Flashcard> {
    const response = await api.post<Flashcard>(`/flashcards/${id}/review`, { difficulty });
    return response.data;
  }
};

// Projects API
export const projectsApi = {
  async getProjects(): Promise<Project[]> {
    const response = await api.get<Project[]>('/projects');
    return response.data;
  },
  
  async getProjectById(id: string): Promise<Project> {
    const response = await api.get<Project>(`/projects/${id}`);
    return response.data;
  },
  
  async createProject(project: ProjectBase): Promise<Project> {
    const response = await api.post<Project>('/projects', project);
    return response.data;
  },
  
  async updateProject(id: string, updates: Partial<ProjectBase>): Promise<Project> {
    const response = await api.patch<Project>(`/projects/${id}`, updates);
    return response.data;
  },
  
  async deleteProject(id: string): Promise<void> {
    await api.delete(`/projects/${id}`);
  },
  
  async getProjectNotes(projectId: string): Promise<Note[]> {
    const response = await api.get<Note[]>(`/projects/${projectId}/notes`);
    return response.data;
  },
  
  async addNoteToProject(projectId: string, noteId: string): Promise<void> {
    await api.post(`/projects/${projectId}/notes/${noteId}`);
  },
  
  async removeNoteFromProject(projectId: string, noteId: string): Promise<void> {
    await api.delete(`/projects/${projectId}/notes/${noteId}`);
  }
};

// AI API
export const aiApi = {
  async generateFlashcards(noteId: string): Promise<Flashcard[]> {
    const response = await api.post<Flashcard[]>('/ai/generate-flashcards', { note_id: noteId });
    return response.data;
  },
  
  async summarizeNote(noteId: string): Promise<string> {
    const response = await api.post<{ summary: string }>('/ai/summarize-note', { note_id: noteId });
    return response.data.summary;
  },
  
  async generateQuestions(noteId: string, count: number = 5): Promise<{question: string, answer: string}[]> {
    const response = await api.post<{questions: {question: string, answer: string}[]}>(`/ai/generate-questions`, { 
      note_id: noteId,
      count
    });
    return response.data.questions;
  }
};

// ====================================
// Exports
// ====================================

export { 
  api as default, 
  API_BASE_URL, 
  WS_BASE_URL, 
  webSocketManager,
  connectWebSocket, 
  disconnectWebSocket, 
  addWebSocketMessageHandler 
};

export type { 
  User, 
  Note, 
  NoteBase, 
  Flashcard, 
  FlashcardBase, 
  Project, 
  ProjectBase, 
  TokenResponse, 
  LoginCredentials, 
  RegisterData 
};
