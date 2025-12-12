import { apiService } from './apiService';
import { v4 as uuidv4 } from 'uuid';

// Constants are now class static properties

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

// Types for Study Guide
export type StudyGuideFormat = 'outline' | 'detailed' | 'qna' | 'cheatsheet';
export type StudyGuideSection = {
  title: string;
  content: string;
  keyPoints: string[];
};

export interface StudyGuide {
  id: string;
  title: string;
  format: StudyGuideFormat;
  sections: StudyGuideSection[];
  estimatedStudyTime: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  createdAt: string;
  updatedAt: string;
}

// Types for Content Analysis
export interface ContentAnalysis {
  wordCount: number;
  characterCount: number;
  sentenceCount: number;
  readingLevel: string;
  readingTime: number; // in minutes
  keywords: Array<{ word: string; frequency: number }>;
  sentiment: {
    score: number; // -1 to 1
    label: 'positive' | 'negative' | 'neutral';
  };
  complexity: {
    score: number; // 1-10
    factors: string[];
  };
}

// Types for Related Notes
export interface RelatedNote {
  id: string;
  title: string;
  similarityScore: number;
  commonTopics: string[];
  lastModified: string;
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

interface RetryOptions extends Omit<RequestOptions, 'onProgress'> {
  baseDelay?: number;
  maxDelay?: number;
  signal?: AbortSignal;
  maxRetries?: number;
}

// Analytics event types
interface AnalyticsEvent {
  type: 'api_call' | 'error' | 'cache_hit' | 'cache_miss' | 'rate_limit' | 'analytics_error';
  endpoint: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export class NoteAIService {
  // Request configuration
  private static readonly DEFAULT_MAX_RETRIES = 3;
  private static readonly DEFAULT_BASE_DELAY_MS = 1000;
  private static readonly DEFAULT_MAX_DELAY_MS = 30000;
  private static readonly DEFAULT_TIMEOUT = 30000; // 30 seconds
  private static readonly RATE_LIMIT_DELAY_MS = 1000; // 1 second
  private static readonly MAX_CONCURRENT_REQUESTS = 5;
  
  // Cache configuration
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private static readonly MAX_CACHE_SIZE = 100;
  private static readonly CACHE_PREFIX = 'ai_service_';
  
  private analyticsQueue: AnalyticsEvent[] = [];
  private lastRequestTime: number = 0;
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
  private activeRequests: Set<Promise<unknown>> = new Set();
  private cleanupInterval: NodeJS.Timeout | null = null;
  private hits: number = 0;
  private misses: number = 0;
  private analyticsEnabled: boolean = true;

  private readonly BASE_AI_ENDPOINT = '/ai';
  private readonly SUMMARY_ENDPOINT = `${this.BASE_AI_ENDPOINT}/summarize`;
  private readonly GENERATE_FLASHCARDS_ENDPOINT = `${this.BASE_AI_ENDPOINT}/generate-flashcards`;
  private readonly STUDY_GUIDE_ENDPOINT = '/api/study-guide';
  private readonly RELATED_NOTES_ENDPOINT = '/api/related-notes';
  private readonly ANALYZE_CONTENT_ENDPOINT = '/api/analyze-content';
  private cache = new Map<string, { data: unknown; timestamp: number; ttl?: number }>();
  private pendingRequests = new Map<string, Promise<unknown>>();

  /**
   * Executes a function with retry logic for transient failures
   */
  private async withRetry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const {
      maxRetries = NoteAIService.DEFAULT_MAX_RETRIES,
      signal,
      baseDelay = NoteAIService.DEFAULT_BASE_DELAY_MS,
      maxDelay = NoteAIService.DEFAULT_MAX_DELAY_MS,
    } = options;

    let lastError: AIRequestError | Error | undefined;
    let attempt = 0;

    const shouldRetry = (error: unknown): error is AIRequestError | Error => {
      if (error instanceof Error) {
        if (error.message === 'Request was aborted') {
          return false;
        }
        if (error instanceof AIRequestError) {
          return !(error.statusCode && error.statusCode >= 400 && error.statusCode < 500);
        }
        return true;
      }
      return false;
    };

    const calculateDelay = (attempt: number): number => {
      const exponentialDelay = baseDelay * Math.pow(2, attempt);
      const jitter = Math.random() * 0.3 * baseDelay;
      return Math.min(exponentialDelay + jitter, maxDelay);
    };

    while (attempt <= maxRetries) {
      try {
        if (signal?.aborted) {
          throw new Error('Request was aborted');
        }
        return await fn();
      } catch (error: unknown) {
        if (error instanceof Error || (error && typeof error === 'object' && 'message' in error)) {
          lastError = error as Error;
        } else {
          lastError = new Error(String(error));
        }
        attempt++;

        if (!shouldRetry(error) || attempt > maxRetries) {
          break;
        }

        let delayMs = calculateDelay(attempt - 1);
        if (error instanceof AIRequestError && error.retryAfter) {
          delayMs = error.retryAfter * 1000;
        }

        if (delayMs > 0) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
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

  private getCacheKey(method: string, params: Record<string, unknown>): string {
    return `${NoteAIService.CACHE_PREFIX}${method}_${JSON.stringify(params)}`;
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    
    // Cache miss
    if (!cached) {
      this.trackEvent({
        type: 'cache_miss',
        endpoint: key.split('_')[0],
        timestamp: Date.now(),
        metadata: { key }
      });
      this.misses++;
      return null;
    }

    // Check if cache entry is expired
    const ttl = cached.ttl ?? NoteAIService.CACHE_TTL;
    const cacheAge = Date.now() - cached.timestamp;
    if (cacheAge > ttl) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    // Cache hit - update stats and return data
    this.hits++;
    this.trackEvent({
      type: 'cache_hit',
      endpoint: key.split('_')[0],
      timestamp: Date.now(),
      metadata: { key, age: cacheAge }
    });
    return cached.data as T;
  }

  private setCache<T>(key: string, data: T, options: { ttl?: number } = {}): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: options.ttl
    });
  }

  private calculateNextReviewDate(reviewCount: number): string {
    const now = new Date();
    const daysToAdd = Math.min(Math.pow(2, Math.min(reviewCount, 10)), 30);
    const nextDate = new Date(now);
    nextDate.setDate(now.getDate() + daysToAdd);
    return nextDate.toISOString();
  }

  public async generateSummary(
    content: string,
    options: Partial<SummaryOptions> = {},
    requestOptions: Omit<RequestOptions, 'onProgress'> = {}
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

    const requestFn = async (): Promise<AISummary> => {
      const response = await apiService.post<AISummary>(
        this.SUMMARY_ENDPOINT,
        { content, options: defaultOptions },
        { signal: requestOptions.signal }
      );
      return response.data; // Extract data from AxiosResponse
    };

    try {
      const result = await this.withRetry<AISummary>(requestFn, {
        maxRetries: requestOptions.maxRetries,
        signal: requestOptions.signal
      });

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      const requestError = error as AIRequestError & { response?: { data?: { message?: string; code?: string }; status?: number } };
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
    count: number = 5,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium',
    requestOptions: Omit<RequestOptions, 'onProgress'> = {}
  ): Promise<Flashcard[]> {
    this.validateContent(content);

    const cacheKey = this.getCacheKey('generateFlashcards', { content, count, difficulty });
    const cached = this.getFromCache<Flashcard[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const requestFn = async (): Promise<Flashcard[]> => {
      const response = await apiService.post<Flashcard[]>(
        this.GENERATE_FLASHCARDS_ENDPOINT,
        { content, count, difficulty },
        { signal: requestOptions.signal }
      );
      return response.data; // Extract data from AxiosResponse
    };

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

    try {
      const response = await this.withRetry<Flashcard[]>(requestFn, {
        maxRetries: requestOptions.maxRetries,
        signal: requestOptions.signal
      });

      const processed = processFlashcards(response);
      this.setCache(cacheKey, processed);
      return processed;
    } catch (error: unknown) {
      const requestError = error as AIRequestError & { 
        response?: { 
          data?: { 
            message?: string; 
            code?: string 
          }; 
          status?: number 
        }; 
        request?: unknown 
      };
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

  constructor() {
    // Set up periodic cache cleanup
    this.cleanupInterval = setInterval(() => this.cleanupOldCache(), NoteAIService.CACHE_TTL);
  }

  public clearCache(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  private cleanupOldCache(): number {
    const now = Date.now();
    let deletedCount = 0;
    
    // Remove expired entries
    for (const [key, entry] of this.cache.entries()) {
      const ttl = entry.ttl ?? NoteAIService.CACHE_TTL;
      if (entry?.timestamp && now - entry.timestamp > ttl) {
        this.cache.delete(key);
        deletedCount++;
      }
    }
    
    // Enforce max cache size
    if (this.cache.size > NoteAIService.MAX_CACHE_SIZE) {
      const entriesToDelete = Array.from(this.cache.entries())
        .sort((a, b) => (a[1].timestamp || 0) - (b[1].timestamp || 0))
        .slice(0, this.cache.size - NoteAIService.MAX_CACHE_SIZE);
      
      for (const [key] of entriesToDelete) {
        this.cache.delete(key);
        deletedCount++;
      }
    }
    
    return deletedCount;
  }

  private trackEvent(event: AnalyticsEvent): void {
    if (!this.analyticsEnabled) return;
    
    // Add metadata to the event
    const enhancedEvent: AnalyticsEvent = {
      ...event,
      timestamp: event.timestamp || Date.now(),
      metadata: {
        ...event.metadata,
        sdkVersion: '1.0.0',
        sessionId: this.getSessionId(),
      }
    };
    
    this.analyticsQueue.push(enhancedEvent);
    
    // Send analytics in batches
    if (this.analyticsQueue.length >= 10) {
      this.flushAnalytics().catch((error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error tracking event:', errorMessage);
      });
    }
  }
  
  private trackError(error: unknown, context: Record<string, unknown> = {}): void {
    const errorData = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      ...(error instanceof AIRequestError ? {
        statusCode: error.statusCode,
        code: error.code,
        retryAfter: error.retryAfter
      } : {})
    } : { message: String(error) };
    this.trackEvent({
      type: 'error',
      endpoint: typeof context.endpoint === 'string' ? context.endpoint : 'unknown',
      timestamp: Date.now(),
      metadata: {
        ...context,
        error: errorData
      }
    });
  }
  
  private getSessionId(): string {
    if (!window.sessionStorage) return 'no-session';
    
    let sessionId = sessionStorage.getItem('ai_service_session_id');
    if (!sessionId) {
      sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('ai_service_session_id', sessionId);
    }
    return sessionId;
  }
  
  private normalizeError(error: unknown, context: { requestId?: string } = {}): Error {
    if (error instanceof Error) {
      return error;
    }
    
    if (typeof error === 'string') {
      return new Error(error);
    }
    
    if (error && typeof error === 'object' && 'message' in error) {
      return new Error(String(error.message));
    }
    
    return new Error(`Unknown error occurred${context.requestId ? ` (requestId: ${context.requestId})` : ''}`);
  }

  private async flushAnalytics(): Promise<void> {
    if (this.analyticsQueue.length === 0) return;
    
    const batch = [...this.analyticsQueue];
    this.analyticsQueue = [];
    
    const maxRetries = 3;
    let attempt = 0;
    let success = false;
    
    while (attempt < maxRetries && !success) {
      try {
        attempt++;
        await apiService.post<{ success: boolean }>('/api/analytics', { 
          events: batch,
          attempt,
          timestamp: new Date().toISOString()
        });
        success = true;
      } catch (error) {
        if (attempt >= maxRetries) {
          // If we've exhausted retries, requeue the events
          this.analyticsQueue.unshift(...batch);
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error(`Failed to send analytics after ${maxRetries} attempts:`, errorMessage);
          
          // Track the failure
          this.trackEvent({
            type: 'analytics_error',
            endpoint: 'analytics',
            timestamp: Date.now(),
            metadata: {
              error: errorMessage,
              batchSize: batch.length,
              attempt
            }
          });
        } else {
          // Wait before retrying (exponential backoff)
          const backoffDelay = Math.min(1000 * Math.pow(2, attempt), 30000);
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
        }
      }
    }
  }

  async generateStudyGuide(
    content: string,
    format: StudyGuideFormat = 'outline',
    options: { title?: string; difficulty?: 'beginner' | 'intermediate' | 'advanced' } = {}
  ): Promise<StudyGuide> {
    try {
      const cacheKey = this.getCacheKey('study-guide', { content, format, ...options });
      const cached = this.getFromCache<StudyGuide>(cacheKey);
      if (cached) return cached;

      const response = await this.rateLimitRequest(async () => {
        const request = apiService.post<{ data: StudyGuide }>(
          this.STUDY_GUIDE_ENDPOINT,
          { content, format, ...options },
          { timeout: NoteAIService.DEFAULT_TIMEOUT }
        );
        this.activeRequests.add(request);
        try {
          const result = await request;
          return result;
        } finally {
          this.activeRequests.delete(request);
        }
      });

      const studyGuide = this.processStudyGuideResponse(response.data?.data || response.data);
      this.setCache(cacheKey, studyGuide);
      this.trackEvent({
        type: 'api_call',
        endpoint: this.STUDY_GUIDE_ENDPOINT,
        timestamp: Date.now(),
        metadata: { format, length: content.length }
      });

      return studyGuide;
    } catch (error) {
      this.trackEvent({
        type: 'error',
        endpoint: this.STUDY_GUIDE_ENDPOINT,
        timestamp: Date.now(),
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      throw error;
    }
  }

  private processRelatedNotesResponse(notes: unknown[]): RelatedNote[] {
    if (!Array.isArray(notes)) {
      return [];
    }

    return notes.map((note) => {
      if (!note || typeof note !== 'object') {
        return {
          id: uuidv4(),
          title: 'Untitled Note',
          similarityScore: 0,
          commonTopics: [],
          lastModified: new Date().toISOString()
        };
      }
      
      const safeNote = note as Record<string, unknown>;
      const id = typeof safeNote['id'] === 'string' ? safeNote['id'] : uuidv4();
      const title = typeof safeNote['title'] === 'string' ? safeNote['title'] : 'Untitled Note';
      const similarityScore = typeof safeNote['similarityScore'] === 'number' 
        ? safeNote['similarityScore'] 
        : 0;
      const commonTopics = Array.isArray(safeNote['commonTopics']) 
        ? (safeNote['commonTopics'] as unknown[]).filter((topic): topic is string => typeof topic === 'string')
        : [];
      const lastModified = typeof safeNote['lastModified'] === 'string' 
        ? safeNote['lastModified'] 
        : new Date().toISOString();

      return {
        id,
        title,
        similarityScore,
        commonTopics,
        lastModified
      };
    });
  }

  async findRelatedNotes(
    noteId: string,
    content: string,
    limit: number = 5
  ): Promise<RelatedNote[]> {
    try {
      const cacheKey = this.getCacheKey('related-notes', { noteId, content, limit });
      const cached = this.getFromCache<RelatedNote[]>(cacheKey);
      if (cached) return cached;

      const response = await this.rateLimitRequest(() =>
        apiService.post<{ notes: RelatedNote[] }>(
          this.RELATED_NOTES_ENDPOINT,
          { noteId, content, limit },
          { timeout: NoteAIService.DEFAULT_TIMEOUT }
        )
      );

      const relatedNotes = this.processRelatedNotesResponse(response.data?.notes || []);
      this.setCache(cacheKey, relatedNotes);
      return relatedNotes;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.trackEvent({
        type: 'error',
        endpoint: this.RELATED_NOTES_ENDPOINT,
        timestamp: Date.now(),
        metadata: { 
          error: errorMessage,
          noteId,
          contentLength: content.length
        }
      });
      console.error('Error finding related notes:', errorMessage);
      return [];
    }
  }

  private processStudyGuideResponse(response: unknown): StudyGuide {
    // Type guard to validate the response shape
    const isStudyGuideResponse = (obj: unknown): obj is Partial<StudyGuide> => {
      return typeof obj === 'object' && obj !== null;
    };

    if (!isStudyGuideResponse(response)) {
      return this.getDefaultStudyGuide();
    }

    const format: StudyGuideFormat = 
      ['outline', 'detailed', 'qna', 'cheatsheet'].includes(response.format as string)
        ? response.format as StudyGuideFormat
        : 'outline';

    const difficulty = 
      ['beginner', 'intermediate', 'advanced'].includes(response.difficulty as string)
        ? response.difficulty as 'beginner' | 'intermediate' | 'advanced'
        : 'intermediate';

    return {
      id: typeof response.id === 'string' ? response.id : uuidv4(),
      title: typeof response.title === 'string' ? response.title : 'Untitled Study Guide',
      format,
      sections: Array.isArray(response.sections) 
        ? response.sections.map(section => ({
            title: typeof section?.title === 'string' ? section.title : '',
            content: typeof section?.content === 'string' ? section.content : '',
            keyPoints: Array.isArray(section?.keyPoints) 
              ? section.keyPoints.filter((point): point is string => typeof point === 'string')
              : []
          }))
        : [],
      estimatedStudyTime: typeof response.estimatedStudyTime === 'number' 
        ? response.estimatedStudyTime 
        : 30,
      difficulty,
      createdAt: typeof response.createdAt === 'string' 
        ? response.createdAt 
        : new Date().toISOString(),
      updatedAt: typeof response.updatedAt === 'string' 
        ? response.updatedAt 
        : new Date().toISOString()
    };
  }

  private getDefaultStudyGuide(): StudyGuide {
    return {
      id: uuidv4(),
      title: 'Untitled Study Guide',
      format: 'outline',
      sections: [],
      estimatedStudyTime: 30,
      difficulty: 'intermediate',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  private processContentAnalysisResponse(response: unknown): ContentAnalysis {
    if (typeof response !== 'object' || response === null) {
      return this.getDefaultContentAnalysis();
    }

    const safeResponse = response as {
      wordCount?: unknown;
      characterCount?: unknown;
      sentenceCount?: unknown;
      readingLevel?: unknown;
      readingTime?: unknown;
      keywords?: unknown;
      sentiment?: {
        score?: number;
        label?: string;
      };
      complexity?: {
        score?: number;
        factors?: unknown[];
      };
    };
    
    const defaultAnalysis = this.getDefaultContentAnalysis();
    const sentimentResponse = safeResponse.sentiment || {};
    const complexityResponse = safeResponse.complexity || {};
    
    // Safely get sentiment label with type checking
    const getSentimentLabel = (): 'positive' | 'negative' | 'neutral' => {
      if (typeof sentimentResponse.label === 'string') {
        const label = sentimentResponse.label.toLowerCase();
        if (['positive', 'negative', 'neutral'].includes(label)) {
          return label as 'positive' | 'negative' | 'neutral';
        }
      }
      return defaultAnalysis.sentiment.label;
    };
    
    return {
      wordCount: typeof safeResponse.wordCount === 'number' ? safeResponse.wordCount : defaultAnalysis.wordCount,
      characterCount: typeof safeResponse.characterCount === 'number' ? safeResponse.characterCount : defaultAnalysis.characterCount,
      sentenceCount: typeof safeResponse.sentenceCount === 'number' ? safeResponse.sentenceCount : defaultAnalysis.sentenceCount,
      readingLevel: typeof safeResponse.readingLevel === 'string' ? safeResponse.readingLevel : defaultAnalysis.readingLevel,
      readingTime: typeof safeResponse.readingTime === 'number' ? safeResponse.readingTime : defaultAnalysis.readingTime,
      keywords: Array.isArray(safeResponse.keywords) 
        ? safeResponse.keywords
            .filter((k: unknown): k is { word: string; frequency: number } => 
              typeof k === 'object' && k !== null && 
              'word' in k && 'frequency' in k &&
              typeof (k as { word: unknown }).word === 'string' &&
              typeof (k as { frequency: unknown }).frequency === 'number'
            )
        : [],
      sentiment: {
        score: typeof sentimentResponse.score === 'number' 
          ? sentimentResponse.score 
          : defaultAnalysis.sentiment.score,
        label: getSentimentLabel(),
      },
      complexity: {
        score: typeof complexityResponse.score === 'number' 
          ? Math.min(10, Math.max(1, complexityResponse.score)) 
          : defaultAnalysis.complexity.score,
        factors: Array.isArray(complexityResponse.factors)
          ? complexityResponse.factors.filter((f): f is string => typeof f === 'string')
          : defaultAnalysis.complexity.factors
      }
    };
  }

  private getDefaultContentAnalysis(): ContentAnalysis {
    return {
      wordCount: 0,
      characterCount: 0,
      sentenceCount: 0,
      readingLevel: 'N/A',
      readingTime: 0,
      keywords: [],
      sentiment: {
        score: 0,
        label: 'neutral'
      },
      complexity: {
        score: 5,
        factors: []
      }
    };
  }

  async analyzeContent(content: string): Promise<ContentAnalysis> {
    try {
      const cacheKey = this.getCacheKey('content-analysis', { content });
      const cached = this.getFromCache<ContentAnalysis>(cacheKey);
      if (cached) return cached;

      const response = await this.rateLimitRequest(() =>
        apiService.post<{ data: ContentAnalysis }>(
          this.ANALYZE_CONTENT_ENDPOINT,
          { content },
          { timeout: NoteAIService.DEFAULT_TIMEOUT }
        )
      );

      const analysis = this.processContentAnalysisResponse(response.data);
      this.setCache(cacheKey, analysis);
      return analysis;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.trackEvent({
        type: 'error',
        endpoint: this.ANALYZE_CONTENT_ENDPOINT,
        timestamp: Date.now(),
        metadata: { error: errorMessage }
      });
      throw error;
    }
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): {
    hits: number;
    misses: number;
    size: number;
    hitRate: number;
    cacheSize: string;
    oldestItem?: string;
    newestItem?: string;
  } {
    let oldest = Infinity;
    let newest = 0;
    let totalSize = 0;
    
    // Calculate stats from cache entries
    for (const entry of this.cache.values()) {
      if (entry?.timestamp) {
        oldest = Math.min(oldest, entry.timestamp);
        newest = Math.max(newest, entry.timestamp);
        totalSize += JSON.stringify(entry.data).length;
      }
    }
    
    // Calculate hit rate
    const totalRequests = this.hits + this.misses;
    const hitRate = totalRequests > 0 ? (this.hits / totalRequests) * 100 : 0;
    
    return {
      hits: this.hits,
      misses: this.misses,
      size: this.cache.size,
      cacheSize: `${(totalSize / 1024).toFixed(2)} KB`,
      hitRate: parseFloat(hitRate.toFixed(2)),
      oldestItem: isFinite(oldest) ? new Date(oldest).toISOString() : undefined,
      newestItem: newest > 0 ? new Date(newest).toISOString() : undefined
    };
  }

  /**
   * Execute a request with rate limiting and optional debouncing
   */
  private async rateLimitRequest<T>(
    fn: () => Promise<T>,
    options: { 
      debounceKey?: string; 
      debounceMs?: number;
      requestId?: string;
      timeoutMs?: number;
      retryOnRateLimit?: boolean;
    } = {}
  ): Promise<T> {
    const { debounceKey, debounceMs, requestId, timeoutMs, retryOnRateLimit = true } = options;
    
    // Generate a unique request ID if not provided
    const reqId = requestId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Handle debouncing if a key is provided
    if (debounceKey && debounceMs) {
      return new Promise((resolve, reject) => {
        // Clear any existing timer for this key
        if (this.debounceTimers.has(debounceKey)) {
          clearTimeout(this.debounceTimers.get(debounceKey)!);
        }
        
        // Set up new timer
        const timer = setTimeout(async () => {
          try {
            const result = await this.executeRateLimited(fn, { 
              requestId: reqId,
              timeoutMs,
              retryOnRateLimit
            });
            this.debounceTimers.delete(debounceKey);
            resolve(result);
          } catch (error) {
            this.debounceTimers.delete(debounceKey);
            this.trackError(error as Error, { requestId: reqId, endpoint: debounceKey });
            reject(error);
          }
        }, debounceMs);
        
        // Store the timer for potential cleanup
        this.debounceTimers.set(debounceKey, timer);
      });
    }
    
    // If no debouncing, just use rate limiting
    return this.executeRateLimited(fn, { 
      requestId: reqId,
      timeoutMs,
      retryOnRateLimit
    });
  }

  /**
   * Execute a function with rate limiting
   */
  private async executeRateLimited<T>(
    fn: () => Promise<T>,
    options: {
      requestId?: string;
      timeoutMs?: number;
      retryOnRateLimit?: boolean;
    } = {}
  ): Promise<T> {
    const { requestId, timeoutMs = NoteAIService.DEFAULT_TIMEOUT, retryOnRateLimit = true } = options;
    const startTime = Date.now();
    
    try {
      // Check for rate limiting
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      
      if (timeSinceLastRequest < NoteAIService.RATE_LIMIT_DELAY_MS) {
        const delay = NoteAIService.RATE_LIMIT_DELAY_MS - timeSinceLastRequest;
        if (retryOnRateLimit) {
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          throw new AIRequestError(
            'Rate limit exceeded',
            429,
            'RATE_LIMIT_EXCEEDED',
            Math.ceil(delay / 1000)
          );
        }
      }
      
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      
      try {
        // Update last request time and execute the function
        this.lastRequestTime = Date.now();
        
        // Track request start
        this.trackEvent({
          type: 'api_call',
          endpoint: 'analytics',
          timestamp: Date.now(),
          metadata: {
            requestId,
            startTime
          }
        });
        
        const result = await fn();
        
        // Track successful completion
        this.trackEvent({
          type: 'api_call',
          endpoint: 'analytics',
          timestamp: Date.now(),
          metadata: { 
            requestId,
            duration: Date.now() - startTime,
            status: 'success'
          }
        });
        
        return result;
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      const errorToThrow = this.normalizeError(error, { requestId });
      
      // Track error
      this.trackError(errorToThrow, { 
        requestId,
        endpoint: 'analytics',
        duration: Date.now() - startTime
      });
      
      throw errorToThrow;
    }
  }
  
  /**
   * Enable or disable analytics tracking
   */
  public enableAnalytics(enable: boolean = true): void {
    this.analyticsEnabled = enable;
  }
  
  /**
   * Force flush analytics queue
   */
  public async flushAnalyticsNow(): Promise<void> {
    if (this.analyticsQueue.length > 0) {
      await this.flushAnalytics();
    }
  }
  /**
   * Clean up resources and cancel pending operations
   */
  public cleanup(): void {
    // Clear cleanup interval if it exists
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    
    // Clear all debounce timers
    this.debounceTimers.forEach((timer) => clearTimeout(timer));
    this.debounceTimers.clear();
    
    // Cancel all pending requests
    this.pendingRequests.forEach((request, key) => {
      if (request && typeof (request as any).cancel === 'function') {
        (request as any).cancel('Service cleanup');
      } else if (request && typeof (request as any).abort === 'function') {
        (request as any).abort();
      }
      this.pendingRequests.delete(key);
    });
    
    // Cancel all active requests
    this.activeRequests.forEach((request) => {
      if (request && typeof (request as any).cancel === 'function') {
        (request as any).cancel('Service cleanup');
      } else if (request && typeof (request as any).abort === 'function') {
        (request as any).abort();
      }
    });
    this.activeRequests.clear();
    
    // Clear cache and analytics
    this.cache.clear();
    
    // Flush any remaining analytics before clearing
    if (this.analyticsQueue.length > 0) {
      this.flushAnalytics().catch(error => {
        console.error('Error during final analytics flush:', error);
      });
    }
    this.analyticsQueue = [];
    
    // Track the cleanup event
    this.trackEvent({
      type: 'api_call',
      endpoint: 'cleanup',
      timestamp: Date.now(),
      metadata: {
        cleanupType: 'service_cleanup',
        activeRequests: this.activeRequests.size,
        cacheSize: this.cache.size,
        pendingRequests: this.pendingRequests.size
      }
    });
  }

  // ...
}

export const noteAIService = new NoteAIService();
