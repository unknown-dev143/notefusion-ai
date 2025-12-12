import { apiClient, ApiResponse } from './apiClient';

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  user_id: string;
  deck_id?: string;
  created_at: string;
  updated_at: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category?: string;
  tags: string[];
  image_url?: string;
  audio_url?: string;
  is_public: boolean;
  study_count: number;
  correct_count: number;
  last_studied?: string;
  next_review?: string;
  interval: number;
  ease_factor: number;
}

export interface FlashcardDeck {
  id: string;
  name: string;
  description: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  flashcard_count: number;
  tags: string[];
  category?: string;
}

export interface CreateFlashcardRequest {
  front: string;
  back: string;
  deck_id?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  category?: string;
  tags?: string[];
  image_url?: string;
  audio_url?: string;
  is_public?: boolean;
}

export interface UpdateFlashcardRequest {
  front?: string;
  back?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  category?: string;
  tags?: string[];
  image_url?: string;
  audio_url?: string;
  is_public?: boolean;
}

export interface CreateDeckRequest {
  name: string;
  description: string;
  is_public?: boolean;
  tags?: string[];
  category?: string;
}

export interface StudySession {
  id: string;
  deck_id?: string;
  flashcard_ids: string[];
  started_at: string;
  ended_at?: string;
  total_cards: number;
  studied_cards: number;
  correct_answers: number;
  accuracy: number;
  study_time: number;
}

export interface StudySessionRequest {
  deck_id?: string;
  flashcard_ids?: string[];
  max_cards?: number;
  difficulty_filter?: ('easy' | 'medium' | 'hard')[];
  category_filter?: string[];
}

export interface StudyProgress {
  flashcard_id: string;
  is_correct: boolean;
  response_time: number;
  new_interval: number;
  new_ease_factor: number;
  next_review: string;
}

class FlashcardsAPI {
  // Flashcard CRUD operations
  async getFlashcards(params?: {
    deck_id?: string;
    category?: string;
    tags?: string[];
    difficulty?: 'easy' | 'medium' | 'hard';
    is_public?: boolean;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ flashcards: Flashcard[]; total: number; page: number }>> {
    return apiClient.get('/flashcards', params);
  }

  async getFlashcard(id: string): Promise<ApiResponse<Flashcard>> {
    return apiClient.get(`/flashcards/${id}`);
  }

  async createFlashcard(data: CreateFlashcardRequest): Promise<ApiResponse<Flashcard>> {
    return apiClient.post('/flashcards', data);
  }

  async updateFlashcard(id: string, data: UpdateFlashcardRequest): Promise<ApiResponse<Flashcard>> {
    return apiClient.put(`/flashcards/${id}`, data);
  }

  async deleteFlashcard(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/flashcards/${id}`);
  }

  // Deck operations
  async getDecks(params?: {
    is_public?: boolean;
    category?: string;
    tags?: string[];
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ decks: FlashcardDeck[]; total: number; page: number }>> {
    return apiClient.get('/flashcards/decks', params);
  }

  async getDeck(id: string): Promise<ApiResponse<FlashcardDeck>> {
    return apiClient.get(`/flashcards/decks/${id}`);
  }

  async createDeck(data: CreateDeckRequest): Promise<ApiResponse<FlashcardDeck>> {
    return apiClient.post('/flashcards/decks', data);
  }

  async updateDeck(id: string, data: Partial<CreateDeckRequest>): Promise<ApiResponse<FlashcardDeck>> {
    return apiClient.put(`/flashcards/decks/${id}`, data);
  }

  async deleteDeck(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/flashcards/decks/${id}`);
  }

  async addFlashcardToDeck(deckId: string, flashcardId: string): Promise<ApiResponse<void>> {
    return apiClient.post(`/flashcards/decks/${deckId}/flashcards`, { flashcard_id: flashcardId });
  }

  async removeFlashcardFromDeck(deckId: string, flashcardId: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/flashcards/decks/${deckId}/flashcards/${flashcardId}`);
  }

  // Study sessions
  async startStudySession(data: StudySessionRequest): Promise<ApiResponse<StudySession>> {
    return apiClient.post('/flashcards/study/start', data);
  }

  async getStudySession(sessionId: string): Promise<ApiResponse<StudySession>> {
    return apiClient.get(`/flashcards/study/${sessionId}`);
  }

  async getNextFlashcard(sessionId: string): Promise<ApiResponse<Flashcard>> {
    return apiClient.get(`/flashcards/study/${sessionId}/next`);
  }

  async submitStudyProgress(sessionId: string, progress: StudyProgress): Promise<ApiResponse<void>> {
    return apiClient.post(`/flashcards/study/${sessionId}/progress`, progress);
  }

  async endStudySession(sessionId: string): Promise<ApiResponse<StudySession>> {
    return apiClient.post(`/flashcards/study/${sessionId}/end`);
  }

  async getStudyHistory(params?: {
    deck_id?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ sessions: StudySession[]; total: number; page: number }>> {
    return apiClient.get('/flashcards/study/history', params);
  }

  // Spaced repetition
  async getDueFlashcards(deckId?: string): Promise<ApiResponse<Flashcard[]>> {
    return apiClient.get('/flashcards/due', { deck_id: deckId });
  }

  async updateSpacedRepetition(flashcardId: string, quality: number): Promise<ApiResponse<Flashcard>> {
    return apiClient.post(`/flashcards/${flashcardId}/review`, { quality });
  }

  // Import/Export
  async importFlashcards(file: File, deckId?: string): Promise<ApiResponse<{ imported: number; errors: string[] }>> {
    return apiClient.upload('/flashcards/import', file, { deck_id: deckId });
  }

  async exportDeck(deckId: string, format: 'csv' | 'json' | 'anki'): Promise<ApiResponse<{ download_url: string }>> {
    return apiClient.get(`/flashcards/decks/${deckId}/export`, { format });
  }

  // Analytics
  async getFlashcardStats(deckId?: string): Promise<ApiResponse<{
    total_flashcards: number;
    studied_today: number;
    due_today: number;
    accuracy_rate: number;
    study_streak: number;
    difficulty_distribution: Record<string, number>;
    category_distribution: Record<string, number>;
    weekly_progress: Array<{
      date: string;
      studied: number;
      accuracy: number;
    }>;
  }>> {
    return apiClient.get('/flashcards/stats', { deck_id: deckId });
  }

  // Public flashcards
  async getPublicFlashcards(params?: {
    search?: string;
    category?: string;
    tags?: string[];
    difficulty?: 'easy' | 'medium' | 'hard';
    sort_by?: 'created_at' | 'study_count' | 'accuracy';
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ flashcards: Flashcard[]; total: number; page: number }>> {
    return apiClient.get('/flashcards/public', params);
  }

  async cloneFlashcard(id: string): Promise<ApiResponse<Flashcard>> {
    return apiClient.post(`/flashcards/${id}/clone`);
  }

  async cloneDeck(id: string): Promise<ApiResponse<FlashcardDeck>> {
    return apiClient.post(`/flashcards/decks/${id}/clone`);
  }

  // Categories and tags
  async getCategories(): Promise<ApiResponse<Array<{ name: string; count: number }>>> {
    return apiClient.get('/flashcards/categories');
  }

  async getTags(): Promise<ApiResponse<Array<{ name: string; count: number }>>> {
    return apiClient.get('/flashcards/tags');
  }
}

export const flashcardsAPI = new FlashcardsAPI();
