import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

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

class AIService {
  // Get AI suggestions for a note
  static async getSuggestions(
    noteId: string,
    context: string,
    type?: AISuggestion['type']
  ): Promise<AISuggestion[]> {
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

  // Generate content using AI
  static async generateContent(
    prompt: string,
    context: string,
    options?: {
      maxLength?: number;
      temperature?: number;
      creativity?: number;
    }
  ): Promise<{ content: string }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/ai/generate`, {
        prompt,
        context,
        options
      });
      return response.data;
    } catch (error) {
      console.error('Error generating AI content:', error);
      throw error;
    }
  }
}

export default AIService;
