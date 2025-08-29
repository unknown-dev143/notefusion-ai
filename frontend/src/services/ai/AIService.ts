<<<<<<< HEAD
import axios, { AxiosRequestConfig, CancelTokenSource } from 'axios';
import { aiCache, withCache } from '../../utils/cache';
import { debounce } from 'lodash';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Request cancellation
const pendingRequests: Record<string, CancelTokenSource> = {};

// Cache TTLs (in milliseconds)
const CACHE_TTL = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 30 * 60 * 1000, // 30 minutes
  LONG: 24 * 60 * 60 * 1000, // 24 hours
};

=======
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
export interface AISuggestion {
  id: string;
  type: 'summarize' | 'improve' | 'expand' | 'simplify' | 'action_items' | 'custom';
  content: string;
  confidence: number;
  timestamp: string;
}

export interface AITemplate {
  id: string;
  name: string;
  description: string;
  prompt: string;
  category: 'productivity' | 'creative' | 'academic' | 'business' | 'custom';
  isPremium: boolean;
}

<<<<<<< HEAD
// Extended interfaces for AI responses
export interface AISummary {
  id: string;
  content: string;
  keyPoints: string[];
  length: 'short' | 'medium' | 'long';
  createdAt: string;
}

export interface AITagSuggestion {
  tag: string;
  category?: string;
  confidence: number;
}

export interface AIContentStructure {
  title?: string;
  sections: Array<{
    heading: string;
    content: string;
    level: number;
  }>;
  keyPoints: string[];
  tags: string[];
}

class AIService {
  // Get AI suggestions for a note with caching and request cancellation
=======
class AIService {
  // Get AI suggestions for a note
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
  static async getSuggestions(
    noteId: string,
    context: string,
    type?: AISuggestion['type']
  ): Promise<AISuggestion[]> {
<<<<<<< HEAD
    const cacheKey = `suggestions_${noteId}_${type || 'all'}`;
    
    // Cancel previous request if it exists
    if (pendingRequests[cacheKey]) {
      pendingRequests[cacheKey].cancel('Request canceled by user');
    }
    
    // Create a new cancel token for this request
    const source = axios.CancelToken.source();
    pendingRequests[cacheKey] = source;
    
    try {
      // Try to get from cache first
      const cached = aiCache.get<AISuggestion[]>(cacheKey);
      if (cached) {
        return cached;
      }
      
      const response = await axios.post(
        `${API_BASE_URL}/ai/suggestions`,
        { noteId, context, type },
        { cancelToken: source.token }
      );
      
      // Cache the result
      aiCache.set(cacheKey, response.data, CACHE_TTL.MEDIUM);
      
      return response.data;
    } catch (error) {
      if (!axios.isCancel(error)) {
        console.error('Error getting AI suggestions:', error);
        throw error;
      }
      return [];
    } finally {
      // Clean up the request
      delete pendingRequests[cacheKey];
    }
  }

  // Apply a template to generate content with caching
  static applyTemplate = withCache(
    async (templateId: string, content: string): Promise<string> => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/ai/apply-template`,
          { templateId, content }
        );
        return response.data.content;
      } catch (error) {
        console.error('Error applying template:', error);
        throw error;
      }
    },
    {
      keyPrefix: 'template',
      ttl: CACHE_TTL.MEDIUM,
      getKey: (templateId: string, content: string) => 
        `template_${templateId}_${content.substring(0, 50).replace(/\s+/g, '_')}`
    }
  );

  // Get available templates with caching
  static getTemplates = withCache(
    async (category?: string): Promise<AITemplate[]> => {
      try {
        const response = await axios.get(`${API_BASE_URL}/ai/templates`, {
          params: { category },
        });
        return response.data;
      } catch (error) {
        console.error('Error getting AI templates:', error);
        throw error;
      }
    },
    {
      keyPrefix: 'templates',
      ttl: CACHE_TTL.LONG, // Templates don't change often
      getKey: (category?: string) => `templates_${category || 'all'}`
    }
  );
=======
    try {
      const response = await axios.post(`${API_BASE_URL}/ai/suggestions`, {
        noteId,
        context,
        type
      });
      return response.data;
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      throw error;
    }
  }

  // Apply an AI template to generate content
  static async applyTemplate(
    templateId: string,
    variables: Record<string, string>,
    noteId?: string
  ): Promise<{ content: string }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/ai/templates/apply`, {
        templateId,
        variables,
        noteId
      });
      return response.data;
    } catch (error) {
      console.error('Error applying AI template:', error);
      throw error;
    }
  }

  // Get available AI templates
  static async getTemplates(category?: string): Promise<AITemplate[]> {
    try {
      const params = category ? { category } : {};
      const response = await axios.get(`${API_BASE_URL}/ai/templates`, { params });
      return response.data;
    } catch (error) {
      console.error('Error getting AI templates:', error);
      throw error;
    }
  }
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e

  // Generate content using AI
  static async generateContent(
    prompt: string,
    context: string,
<<<<<<< HEAD
    options: {
      maxLength?: number;
      temperature?: number;
      creativity?: number;
      format?: 'text' | 'markdown' | 'html';
      tone?: 'professional' | 'casual' | 'academic' | 'creative';
    } = {}
=======
    options?: {
      maxLength?: number;
      temperature?: number;
      creativity?: number;
    }
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
  ): Promise<{ content: string }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/ai/generate`, {
        prompt,
        context,
<<<<<<< HEAD
        options: {
          maxLength: 1000,
          temperature: 0.7,
          format: 'markdown',
          tone: 'professional',
          ...options
        }
=======
        options
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
      });
      return response.data;
    } catch (error) {
      console.error('Error generating AI content:', error);
      throw error;
    }
  }
<<<<<<< HEAD

  // Summarize content
  static async summarizeContent(
    content: string,
    options: {
      length?: 'short' | 'medium' | 'long';
      focus?: 'key-points' | 'overview' | 'detailed';
      format?: 'paragraph' | 'bullets' | 'headings';
    } = {}
  ): Promise<AISummary> {
    try {
      const response = await axios.post(`${API_BASE_URL}/ai/summarize`, {
        content,
        options: {
          length: 'medium',
          focus: 'key-points',
          format: 'bullets',
          ...options
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error summarizing content:', error);
      throw error;
    }
  }

  // Generate tags for content
  static async generateTags(
    content: string,
    options: {
      maxTags?: number;
      existingTags?: string[];
      minConfidence?: number;
    } = {}
  ): Promise<AITagSuggestion[]> {
    try {
      const response = await axios.post(`${API_BASE_URL}/ai/tags`, {
        content,
        options: {
          maxTags: 5,
          minConfidence: 0.7,
          ...options
        }
      });
      return response.data.tags;
    } catch (error) {
      console.error('Error generating tags:', error);
      throw error;
    }
  }

  // Generate content using a template
  static async generateFromTemplate(
    templateId: string,
    variables: Record<string, any>,
    options: {
      temperature?: number;
      maxTokens?: number;
    } = {}
  ): Promise<{ content: string }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/ai/templates/generate`, {
        templateId,
        variables,
        options: {
          temperature: 0.7,
          maxTokens: 1000,
          ...options
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error generating from template:', error);
      throw error;
    }
  }

  // Get content structure
  static async getContentStructure(content: string): Promise<{
    headings: Array<{ level: number; text: string; id: string }>;
    sections: Array<{ title: string; content: string }>;
    wordCount: number;
    readingTime: number;
  }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/ai/structure`, { content });
      return response.data;
    } catch (error) {
      console.error('Error getting content structure:', error);
      throw error;
    }
  }

  // Generate action items from content
  static async generateActionItems(content: string): Promise<Array<{
    action: string;
    priority: 'high' | 'medium' | 'low';
    estimatedTime?: string;
    dependencies?: string[];
  }>> {
    try {
      const response = await axios.post(`${API_BASE_URL}/ai/action-items`, { content });
      return response.data.items;
    } catch (error) {
      console.error('Error generating action items:', error);
      throw error;
    }
  }
=======
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
}

export default AIService;
