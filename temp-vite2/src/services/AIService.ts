import OpenAI from 'openai';
import HistoryService from './HistoryService';
import { v4 as uuidv4 } from 'uuid';

// Check for API key
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

if (!apiKey) {
  console.error('OpenAI API key is not set. Please set VITE_OPENAI_API_KEY in your .env file.');
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Only for frontend development
});

type Role = 'system' | 'user' | 'assistant';

interface Message {
  role: Role;
  content: string;
  name?: string; // Optional name for the message
}

class AIService {
  private static client = openai;
  private static model = import.meta.env.VITE_OPENAI_MODEL || 'gpt-4-turbo';

  private static async callAI(messages: Message[], action: string, input: string): Promise<string> {
    try {
      if (!this.client.apiKey) {
        throw new Error('OpenAI API key is not configured');
      }

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: messages as any, // Type assertion needed due to OpenAI type definitions
        temperature: 0.7,
      });

      const output = response.choices[0]?.message?.content || '';
      
      // Log to history
      try {
        HistoryService.addHistoryItem({
          action,
          input,
          output
        });
      } catch (historyError) {
        console.error('Failed to save to history:', historyError);
      }

      return output;
    } catch (error: any) {
      console.error('AI API Error:', error);
      
      // Log failed attempts to history
      try {
        HistoryService.addHistoryItem({
          action: `${action}_error`,
          input,
          output: error.message || 'Unknown error occurred'
        });
      } catch (historyError) {
        console.error('Failed to save error to history:', historyError);
      }
      
      if (error.code === 'invalid_api_key') {
        throw new Error('Invalid OpenAI API key. Please check your configuration.');
      } else if (error.code === 'rate_limit_exceeded') {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else if (error.message?.includes('429')) {
        throw new Error('Too many requests. Please wait a moment and try again.');
      } else if (error.message?.includes('401')) {
        throw new Error('Authentication failed. Please check your API key.');
      } else {
        throw new Error(`AI service error: ${error.message || 'Unknown error'}`);
      }
    }
  }

  static async generateSummary(text: string): Promise<string> {
    const messages: Message[] = [
      {
        role: 'system',
        content: 'You are a helpful assistant that creates concise summaries of text.'
      },
      {
        role: 'user',
        content: `Please summarize the following text:\n\n${text}`
      }
    ];

    return this.callAI(messages, 'summary', text);
  }

  static async improveText(text: string): Promise<string> {
    const messages: Message[] = [
      {
        role: 'system',
        content: 'You are a helpful writing assistant that improves text for clarity, grammar, and style.'
      },
      {
        role: 'user',
        content: `Please improve the following text:\n\n${text}`
      }
    ];

    return this.callAI(messages, 'improve', text);
  }

  static async generateTags(text: string): Promise<string[]> {
    const messages: Message[] = [
      {
        role: 'system',
        content: 'You are a helpful assistant that generates relevant tags for text.'
      },
      {
        role: 'user',
        content: `Generate 3-5 tags for the following text. Return only the tags as a comma-separated list:\n\n${text}`
      }
    ];

    const response = await this.callAI(messages, 'tags', text);
    return response.split(',').map((tag: string) => tag.trim()).filter(Boolean);
  }

  static async answerQuestion(question: string, context: string): Promise<string> {
    const input = `Context: ${context}\n\nQuestion: ${question}`;
    const messages: Message[] = [
      {
        role: 'system',
        content: 'You are a helpful assistant that answers questions based on the provided context.'
      },
      {
        role: 'user',
        content: input
      }
    ];

    return this.callAI(messages, 'question', input);
  }

  static async translateText(text: string, targetLanguage: string): Promise<string> {
    const messages: Message[] = [
      {
        role: 'system',
        content: `You are a helpful translation assistant that translates text to ${targetLanguage}.`
      },
      {
        role: 'user',
        content: `Translate the following text to ${targetLanguage}. Only return the translated text, nothing else. Do not include the language name in the response.\n\n${text}`
      }
    ];

    return this.callAI(messages, `translate_${targetLanguage}`, text);
  }

  static async generateIdeas(topic: string, count: number = 5): Promise<string[]> {
    const messages: Message[] = [
      {
        role: 'system',
        content: 'You are a creative assistant that generates innovative and practical ideas.'
      },
      {
        role: 'user',
        content: `Generate ${count} creative and actionable ideas about: ${topic}. 
        For each idea, include a brief description (1-2 sentences). 
        Format each idea on a new line with this format: "1. [Idea Title]: [Description]"`
      }
    ];

    const response = await this.callAI(messages, 'ideas', topic);
    return response.split('\n').filter(Boolean);
  }

  static async analyzeSentiment(text: string): Promise<{sentiment: 'positive' | 'neutral' | 'negative', score: number, confidence: number}> {
    const messages: Message[] = [
      {
        role: 'system',
        content: 'You are an AI that analyzes text sentiment. Respond with a JSON object containing: sentiment (positive/neutral/negative), score (-1 to 1), and confidence (0-1).'
      },
      {
        role: 'user',
        content: `Analyze the sentiment of this text: "${text}". Respond only with a valid JSON object.`
      }
    ];

    const response = await this.callAI(messages, 'sentiment', text);
    try {
      return JSON.parse(response);
    } catch (e) {
      console.error('Failed to parse sentiment analysis:', e);
      return { sentiment: 'neutral', score: 0, confidence: 0 };
    }
  }

  static async generateFlashcards(text: string, count: number = 5): Promise<Array<{id: string, question: string, answer: string}>> {
    const messages: Message[] = [
      {
        role: 'system',
        content: 'You create educational flashcards. For each flashcard, generate a clear question and a concise answer.'
      },
      {
        role: 'user',
        content: `Create ${count} flashcards from this text. Format as JSON array of {question, answer} objects. Text: ${text}`
      }
    ];

    const response = await this.callAI(messages, 'flashcards', text);
    try {
      const cards = JSON.parse(response);
      return Array.isArray(cards) ? cards.map(card => ({
        id: uuidv4(),
        question: card.question || '',
        answer: card.answer || ''
      })) : [];
    } catch (e) {
      console.error('Failed to parse flashcards:', e);
      return [];
    }
  }

  static async extractKeyPoints(text: string, count: number = 5): Promise<string[]> {
    const messages: Message[] = [
      {
        role: 'system',
        content: 'You extract and summarize key points from text in a clear, concise manner.'
      },
      {
        role: 'user',
        content: `Extract ${count} key points from this text. Format as a numbered list. Text: ${text}`
      }
    ];

    const response = await this.callAI(messages, 'keypoints', text);
    return response.split('\n').filter(Boolean);
  }

  static async generateActionItems(text: string): Promise<Array<{id: string, task: string, priority: 'high' | 'medium' | 'low'}>> {
    const messages: Message[] = [
      {
        role: 'system',
        content: 'You extract action items from text and assign priority levels (high/medium/low). Respond with a JSON array of {task, priority}.'
      },
      {
        role: 'user',
        content: `Extract action items from: ${text}`
      }
    ];

    const response = await this.callAI(messages, 'action_items', text);
    try {
      const items = JSON.parse(response);
      return Array.isArray(items) ? items.map(item => ({
        id: uuidv4(),
        task: item.task || '',
        priority: ['high', 'medium', 'low'].includes(item.priority?.toLowerCase()) 
          ? item.priority.toLowerCase() as 'high' | 'medium' | 'low'
          : 'medium'
      })) : [];
    } catch (e) {
      console.error('Failed to parse action items:', e);
      return [];
    }
  }
}

export default AIService;
