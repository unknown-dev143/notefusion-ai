import api from '../../api';

export interface AISummary {
  id: string;
  content: string;
  keyPoints: string[];
  length: 'short' | 'medium' | 'long';
  createdAt: string;
}

export interface AITagSuggestion {
  tag: string;
  confidence: number;
  category?: string;
}

export interface AITemplate {
  id: string;
  name: string;
  description: string;
  prompt: string;
  category: 'business' | 'academic' | 'creative' | 'technical';
  isPremium: boolean;
  createdAt: string;
  usageCount?: number;
}

export interface AISuggestion {
  id: string;
  type: 'summary' | 'tags' | 'action_items' | 'related_notes';
  content: string;
  confidence: number;
  createdAt: string;
}

class AIService {
  // Generate content based on prompt
  static async generateContent(prompt: string, content: string, options: any = {}): Promise<any> {
    try {
      const response = await api.post('/ai/generate', {
        prompt,
        content,
        options
      });
      return response.data;
    } catch (error) {
      console.error('Error generating AI content:', error);
      throw error;
    }
  }

  // Get content structure
  static async getContentStructure(content: string): Promise<any> {
    try {
      const response = await api.post('/ai/structure', {
        content
      });
      return response.data;
    } catch (error) {
      console.error('Error getting content structure:', error);
      throw error;
    }
  }

  // Generate action items
  static async generateActionItems(content: string): Promise<any> {
    try {
      const response = await api.post('/ai/action-items', {
        content
      });
      return response.data;
    } catch (error) {
      console.error('Error generating action items:', error);
      throw error;
    }
  }

  // Get templates
  static async getTemplates(): Promise<AITemplate[]> {
    try {
      const response = await api.get('/ai/templates');
      return response.data;
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }
  }

  // Save template
  static async saveTemplate(template: Omit<AITemplate, 'id'>): Promise<AITemplate> {
    try {
      const response = await api.post('/ai/templates', template);
      return response.data;
    } catch (error) {
      console.error('Error saving template:', error);
      throw error;
    }
  }

  // Delete template
  static async deleteTemplate(templateId: string): Promise<void> {
    try {
      await api.delete(`/ai/templates/${templateId}`);
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  }

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
      const response = await api.post('/ai/summarize', {
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
      const response = await api.post('/ai/tags', {
        content,
        options: {
          maxTags: 10,
          minConfidence: 0.7,
          ...options
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error generating tags:', error);
      throw error;
    }
  }

  // Get suggestions for content
  static async getSuggestions(
    content: string,
    type: 'summary' | 'tags' | 'action_items' | 'related_notes'
  ): Promise<AISuggestion[]> {
    try {
      const response = await api.post('/ai/suggestions', {
        content,
        type
      });
      return response.data;
    } catch (error) {
      console.error('Error getting suggestions:', error);
      throw error;
    }
  }

  // Improve content
  static async improveContent(
    content: string,
    improvements: string[]
  ): Promise<{ content: string }> {
    try {
      const response = await api.post('/ai/improve', {
        content,
        improvements
      });
      return response.data;
    } catch (error) {
      console.error('Error improving content:', error);
      throw error;
    }
  }

  // Generate flashcards
  static async generateFlashcards(
    content: string,
    options: {
      count?: number;
      difficulty?: 'easy' | 'medium' | 'hard';
    } = {}
  ): Promise<any[]> {
    try {
      const response = await api.post('/ai/flashcards', {
        content,
        options: {
          count: 5,
          difficulty: 'medium',
          ...options
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error generating flashcards:', error);
      throw error;
    }
  }

  // Generate quiz questions
  static async generateQuiz(
    content: string,
    options: {
      questionCount?: number;
      questionTypes?: string[];
    } = {}
  ): Promise<any> {
    try {
      const response = await api.post('/ai/quiz', {
        content,
        options: {
          questionCount: 5,
          questionTypes: ['multiple-choice', 'true-false'],
          ...options
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error generating quiz:', error);
      throw error;
    }
  }
}

export default AIService;
