import { apiService } from './apiService';
import { v4 as uuidv4 } from 'uuid';
import type { AxiosResponse } from 'axios';

// Constants
const DEFAULT_RETRIES = 3;
const CACHE_PREFIX = 'ai_service_';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Custom error classes
export class AIRequestError extends Error {
  constructor(
    public override message: string,
    public statusCode?: number,
    public code?: string,
    public retryAfter?: number
  ) {
    super(message);
    this.name = 'AIRequestError';
  }
}

export interface AISummary {
  id: string;
  content: string;
  keyPoints: string[];
  length: 'short' | 'medium' | 'long';
  createdAt: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags?: string[];
  explanation?: string;
}

export interface AITagSuggestion {
  tag: string;
  confidence: number;
  category?: string;
}

export interface AISuggestion {
  type: 'summary' | 'tags' | 'action_items' | 'related_notes';
  content: string;
  confidence: number;
  createdAt: string;
}

export interface NoteAnalysis {
  wordCount: number;
  readingTime: number;
  keyTopics: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  complexity: 'low' | 'medium' | 'high';
}

class NoteAIService {
  private cache = new Map<string, { data: unknown; timestamp: number; ttl?: number }>();
  public static CACHE_TTL = CACHE_TTL;

  // Cache management
  private setCache<T>(key: string, data: T, ttl?: number): void {
    const cacheKey = CACHE_PREFIX + key;
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl: ttl || CACHE_TTL
    });
  }

  private getCache<T>(key: string): T | null {
    const cacheKey = CACHE_PREFIX + key;
    const entry = this.cache.get(cacheKey);
    
    if (!entry) return null;
    
    const ttl = entry.ttl ?? NoteAIService.CACHE_TTL;
    if (entry?.timestamp && Date.now() - entry.timestamp > ttl) {
      this.cache.delete(cacheKey);
      return null;
    }
    
    return entry.data as T;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of Array.from(this.cache.entries())) {
      const ttl = item.ttl ?? NoteAIService.CACHE_TTL;
      if (item?.timestamp && now - item.timestamp > ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Summarize note content
  async summarizeNote(
    noteId: string,
    content: string,
    options: {
      length?: 'short' | 'medium' | 'long';
      format?: 'paragraph' | 'bullets' | 'headings';
    } = {}
  ): Promise<AISummary> {
    const cacheKey = `summary_${noteId}_${JSON.stringify(options)}`;
    const cached = this.getCache<AISummary>(cacheKey);
    if (cached) return cached;

    try {
      const response = await apiService.post<AISummary>('/ai/summarize', {
        noteId,
        content,
        options
      });

      const summary = response.data;
      this.setCache(cacheKey, summary);
      return summary;
    } catch (error) {
      throw new AIRequestError(
        'Failed to summarize note',
        500,
        'SUMMARIZE_ERROR'
      );
    }
  }

  // Generate tags for note
  async generateTags(
    noteId: string,
    content: string,
    options: {
      maxTags?: number;
      existingTags?: string[];
      minConfidence?: number;
    } = {}
  ): Promise<AITagSuggestion[]> {
    const cacheKey = `tags_${noteId}_${JSON.stringify(options)}`;
    const cached = this.getCache<AITagSuggestion[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await apiService.post<AITagSuggestion[]>('/ai/tags', {
        noteId,
        content,
        options: {
          maxTags: 10,
          minConfidence: 0.7,
          ...options
        }
      });

      const tags = response.data;
      this.setCache(cacheKey, tags);
      return tags;
    } catch (error) {
      throw new AIRequestError(
        'Failed to generate tags',
        500,
        'TAGS_ERROR'
      );
    }
  }

  // Generate flashcards
  async generateFlashcards(
    noteId: string,
    content: string,
    options: {
      count?: number;
      difficulty?: 'easy' | 'medium' | 'hard';
    } = {}
  ): Promise<Flashcard[]> {
    const cacheKey = `flashcards_${noteId}_${JSON.stringify(options)}`;
    const cached = this.getCache<Flashcard[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await apiService.post<Flashcard[]>('/ai/flashcards', {
        noteId,
        content,
        options: {
          count: 5,
          difficulty: 'medium',
          ...options
        }
      });

      const flashcards = response.data;
      this.setCache(cacheKey, flashcards);
      return flashcards;
    } catch (error) {
      throw new AIRequestError(
        'Failed to generate flashcards',
        500,
        'FLASHCARDS_ERROR'
      );
    }
  }

  // Analyze note
  async analyzeNote(noteId: string, content: string): Promise<NoteAnalysis> {
    const cacheKey = `analysis_${noteId}`;
    const cached = this.getCache<NoteAnalysis>(cacheKey);
    if (cached) return cached;

    try {
      const response = await apiService.post<NoteAnalysis>('/ai/analyze', {
        noteId,
        content
      });

      const analysis = response.data;
      this.setCache(cacheKey, analysis);
      return analysis;
    } catch (error) {
      throw new AIRequestError(
        'Failed to analyze note',
        500,
        'ANALYSIS_ERROR'
      );
    }
  }

  // Get suggestions
  async getSuggestions(
    noteId: string,
    content: string,
    type: 'improvement' | 'expansion' | 'related_topics'
  ): Promise<string[]> {
    const cacheKey = `suggestions_${noteId}_${type}`;
    const cached = this.getCache<string[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await apiService.post<string[]>('/ai/suggestions', {
        noteId,
        content,
        type
      });

      const suggestions = response.data;
      this.setCache(cacheKey, suggestions);
      return suggestions;
    } catch (error) {
      throw new AIRequestError(
        'Failed to get suggestions',
        500,
        'SUGGESTIONS_ERROR'
      );
    }
  }

  // Get cache statistics
  getCacheStats(): {
    size: number;
    oldest: number;
    newest: number;
  } {
    let oldest = Date.now();
    let newest = 0;
    
    // Calculate stats from cache entries
    for (const entry of Array.from(this.cache.values())) {
      if (entry?.timestamp) {
        oldest = Math.min(oldest, entry.timestamp);
        newest = Math.max(newest, entry.timestamp);
      }
    }

    return {
      size: this.cache.size,
      oldest,
      newest
    };
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }
}

// Singleton instance
export const noteAIService = new NoteAIService();
export default noteAIService;
