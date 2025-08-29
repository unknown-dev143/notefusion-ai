import { apiService } from './apiService';
<<<<<<< HEAD
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
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AIRequestError);
    }
  }
}

export class AINetworkError extends AIRequestError {
  constructor(message: string, statusCode?: number) {
    super(message, statusCode, 'NETWORK_ERROR');
    this.name = 'AINetworkError';
  }
}

export class AIValidationError extends AIRequestError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'AIValidationError';
  }
}

// Types
export type SummaryStyle = 'concise' | 'detailed' | 'bullet-points' | 'paragraph';
export type SummaryTone = 'academic' | 'casual' | 'professional' | 'simple';
export type SummaryLength = 'short' | 'medium' | 'long';

export interface AISuggestion {
  type: 'summary' | 'tags' | 'action_items' | 'related_notes' | 'flashcards' | 'study_guide';
  content: string | string[] | Record<string, unknown>;
  confidence?: number;
  metadata?: Record<string, unknown>;
}

export interface AISummary {
  id?: string;
  summary: string;
  keyPoints: string[];
  sentiment: {
    overall: 'positive' | 'neutral' | 'negative';
    score: number;
    emotions: Record<string, number>;
  };
  topics: string[];
  entities: Array<{
    text: string;
    type: string;
    relevance: number;
  }>;
  readingTime: number;
  wordCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AITagSuggestion {
  tags: Array<{
    name: string;
    category: string;
    confidence: number;
    relevance: number;
  }>;
  categories: string[];
  confidenceScores: { [tag: string]: number };
}

export interface SummaryOptions {
  style?: SummaryStyle;
  tone?: SummaryTone;
  length?: SummaryLength;
  includeKeyPoints?: boolean;
  includeActionItems?: boolean;
  includeRelatedConcepts?: boolean;
  targetAudience?: string;
  language?: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  explanation?: string;
  tags: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  lastReviewed?: string;
  nextReviewDate?: string;
  reviewCount?: number;
  confidence?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface RequestOptions {
  maxRetries?: number;
  timeout?: number;
  signal?: AbortSignal;
  onProgress?: (progress: number) => void;
}

class NoteAIService {
  private readonly BASE_AI_ENDPOINT = '/ai';
  private readonly SUMMARY_ENDPOINT = `${this.BASE_AI_ENDPOINT}/summarize`;
  private readonly GENERATE_FLASHCARDS_ENDPOINT = '/ai/generate-flashcards';

  private readonly CACHE_PREFIX = CACHE_PREFIX;
  private readonly CACHE_TTL = CACHE_TTL;

  private cache = new Map<string, { data: unknown; timestamp: number }>();
  private hits = 0;
  private misses = 0;

  private async withRetry<T>(
    fn: () => Promise<AxiosResponse<T>>,
    options: { maxRetries: number; signal?: AbortSignal } = { maxRetries: DEFAULT_RETRIES }
  ): Promise<T> {
    let lastError: Error | null = null;
    const { maxRetries, signal } = options;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (signal?.aborted) {
          throw new Error('Request was aborted');
        }
        const response = await fn();
        return response.data; // Return the actual data, not the Axios response
      } catch (error: unknown) {
        const axiosError = error as any;
        const retryAfterHeader = axiosError.response?.headers?.['retry-after'];
        const retryAfterMs = retryAfterHeader ? parseInt(retryAfterHeader, 10) * 1000 : undefined;
        
        const requestError = new AIRequestError(
          axiosError.response?.data?.message || axiosError.message || 'Request failed',
          axiosError.response?.status,
          axiosError.code,
          retryAfterMs
        );
        
        lastError = requestError;

        // Check if this is a client error (4xx) that we shouldn't retry
        if (axiosError.response?.status >= 400 && axiosError.response?.status < 500) {
          throw requestError;
        }

        // Apply retry-after delay if present, otherwise use exponential backoff
        if (retryAfterMs) {
          await new Promise(resolve => setTimeout(resolve, retryAfterMs));
        } else if (attempt < maxRetries) {
          // Exponential backoff with jitter
          const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Request failed after all retries');
  }

  private validateContent(content: string): void {
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      throw new AIValidationError('Content cannot be empty');
    }

    if (content.length > 100000) {
      throw new AIValidationError('Content is too long. Maximum 100,000 characters allowed.');
    }
  }

  private getCacheKey(method: string, params: Record<string, any>): string {
    return `${this.CACHE_PREFIX}${method}_${JSON.stringify(params)}`;
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) {
      this.misses++;
      return null;
    }

    if (Date.now() - cached.timestamp > this.CACHE_TTL) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;
    return cached.data as T;
  }

  private setCache<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  private calculateNextReviewDate(reviewCount: number): string {
    const now = new Date();
    const daysToAdd = Math.min(Math.pow(2, reviewCount), 30); 
    now.setDate(now.getDate() + daysToAdd);
    return now.toISOString();
  }

  public async generateSummary(
    content: string,
    options: SummaryOptions = {},
    requestOptions: RequestOptions = {}
  ): Promise<AISummary> {
    this.validateContent(content);

    const defaultOptions: SummaryOptions = {
      style: 'concise',
      tone: 'professional',
      length: 'medium',
      includeKeyPoints: true,
      includeActionItems: true,
      includeRelatedConcepts: false,
      targetAudience: 'general',
      language: 'en',
      ...options
    };

    const cacheKey = this.getCacheKey('generateSummary', { content, options: defaultOptions });
    const cached = this.getFromCache<AISummary>(cacheKey);
    if (cached) {
      return cached;
    }

    const requestFn = (): Promise<AxiosResponse<AISummary>> => 
      apiService.post<AISummary>(
        this.SUMMARY_ENDPOINT,
        { content, options: defaultOptions },
        { signal: requestOptions.signal }
      );

    try {
      const result = await this.withRetry<AISummary>(requestFn, {
        maxRetries: requestOptions.maxRetries ?? DEFAULT_RETRIES,
        signal: requestOptions.signal
      });

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      const requestError = error as AIRequestError & { response?: any };
      if (requestError.response) {
        throw new AIRequestError(
          requestError.response?.data?.message || 'Failed to generate summary',
          requestError.response?.status,
          requestError.response?.data?.code
        );
      }
      throw error;
    }
  }

  public async generateFlashcards(
    content: string,
    count = 5,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium',
    requestOptions: RequestOptions = {}
  ): Promise<Flashcard[]> {
    this.validateContent(content);

    const cacheKey = this.getCacheKey('generateFlashcards', { content, count, difficulty });
    const cached = this.getFromCache<Flashcard[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const requestFn = (): Promise<AxiosResponse<Flashcard[]>> => 
        apiService.post<Flashcard[]>(
          this.GENERATE_FLASHCARDS_ENDPOINT,
          { content, count, difficulty },
          { signal: requestOptions.signal }
        );

      const processFlashcards = (flashcards: Flashcard[]): Flashcard[] => 
        flashcards.map(flashcard => ({
          ...flashcard,
          id: flashcard.id || uuidv4(),
          tags: flashcard.tags || [],
          createdAt: flashcard.createdAt || new Date().toISOString(),
          updatedAt: flashcard.updatedAt || new Date().toISOString(),
          nextReviewDate: flashcard.nextReviewDate || this.calculateNextReviewDate(0),
          reviewCount: flashcard.reviewCount || 0,
          difficulty: flashcard.difficulty || difficulty,
          confidence: flashcard.confidence ?? 0.5
        }));

      const response = await this.withRetry<Flashcard[]>(requestFn, {
        maxRetries: requestOptions.maxRetries ?? DEFAULT_RETRIES,
        signal: requestOptions.signal
      });

      const processed = processFlashcards(response);
      this.setCache(cacheKey, processed);
      return processed;
    } catch (error: unknown) {
      const requestError = error as AIRequestError & { response?: any; request?: any };
      if (requestError.response) {
        throw new AIRequestError(
          requestError.response?.data?.message || 'Failed to generate flashcards',
          requestError.response?.status,
          requestError.response?.data?.code
        );
      } else if (requestError.request) {
        throw new AINetworkError('Network error while generating flashcards', 0);
      } else {
        throw new AIRequestError('Error generating flashcards', 500);
      }
    }
  }

  // Clear the cache
  public clearCache(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  // Get cache statistics
  public getCacheStats(): { hits: number; misses: number; size: number } {
    return {
      hits: this.hits,
      misses: this.misses,
      size: this.cache.size
    };
=======

export interface AISuggestion {
  type: 'summary' | 'tags' | 'action_items' | 'related_notes';
  content: string | string[];
  confidence?: number;
}

export interface AISummary {
  summary: string;
  keyPoints: string[];
  sentiment?: 'positive' | 'neutral' | 'negative';
}

export interface AITagSuggestion {
  tags: string[];
  confidenceScores: { [tag: string]: number };
}

class NoteAIService {
  private readonly SUMMARY_ENDPOINT = '/ai/summarize';
  private readonly TAGS_ENDPOINT = '/ai/suggest-tags';
  private readonly IMPROVE_WRITING_ENDPOINT = '/ai/improve-writing';
  private readonly GENERATE_QUESTIONS_ENDPOINT = '/ai/generate-questions';
  private readonly RELATED_NOTES_ENDPOINT = '/ai/related-notes';

  /**
   * Generate a summary of the note content
   */
  async generateSummary(content: string): Promise<AISummary> {
    try {
      const response = await apiService.post(this.SUMMARY_ENDPOINT, { content });
      return response.data;
    } catch (error) {
      console.error('Error generating summary:', error);
      throw new Error('Failed to generate summary');
    }
  }

  /**
   * Suggest tags based on note content
   */
  async suggestTags(content: string, existingTags: string[] = []): Promise<AITagSuggestion> {
    try {
      const response = await apiService.post(this.TAGS_ENDPOINT, { 
        content, 
        existing_tags: existingTags 
      });
      return response.data;
    } catch (error) {
      console.error('Error suggesting tags:', error);
      return { tags: [], confidenceScores: {} };
    }
  }

  /**
   * Improve the writing style and grammar of the content
   */
  async improveWriting(content: string): Promise<{ improvedContent: string; suggestions: string[] }> {
    try {
      const response = await apiService.post(this.IMPROVE_WRITING_ENDPOINT, { content });
      return response.data;
    } catch (error) {
      console.error('Error improving writing:', error);
      return { improvedContent: content, suggestions: [] };
    }
  }

  /**
   * Generate study questions based on the note content
   */
  async generateQuestions(content: string, count: number = 5): Promise<string[]> {
    try {
      const response = await apiService.post(this.GENERATE_QUESTIONS_ENDPOINT, { 
        content, 
        count 
      });
      return response.data.questions;
    } catch (error) {
      console.error('Error generating questions:', error);
      return [];
    }
  }

  /**
   * Find related notes based on content similarity
   */
  async findRelatedNotes(content: string, excludeIds: string[] = []): Promise<Array<{id: string, title: string, similarity: number}>> {
    try {
      const response = await apiService.post(this.RELATED_NOTES_ENDPOINT, { 
        content, 
        exclude_ids: excludeIds 
      });
      return response.data.related_notes;
    } catch (error) {
      console.error('Error finding related notes:', error);
      return [];
    }
  }

  /**
   * Get AI-powered suggestions for a note
   */
  async getSuggestions(noteId: string, content: string): Promise<AISuggestion[]> {
    try {
      const [summary, tags, questions, relatedNotes] = await Promise.all([
        this.generateSummary(content).catch(() => null),
        this.suggestTags(content),
        this.generateQuestions(content, 3).catch(() => []),
        this.findRelatedNotes(content, [noteId])
      ]);

      const suggestions: AISuggestion[] = [];

      if (summary) {
        suggestions.push({
          type: 'summary',
          content: summary.summary,
          confidence: 0.9
        });
      }

      if (tags.tags.length > 0) {
        suggestions.push({
          type: 'tags',
          content: tags.tags,
          confidence: 0.85
        });
      }

      if (questions.length > 0) {
        suggestions.push({
          type: 'action_items',
          content: questions,
          confidence: 0.8
        });
      }

      if (relatedNotes.length > 0) {
        suggestions.push({
          type: 'related_notes',
          content: relatedNotes.map(n => n.title),
          confidence: relatedNotes[0]?.similarity || 0
        });
      }

      return suggestions;
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      return [];
    }
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
  }
}

export const noteAIService = new NoteAIService();
