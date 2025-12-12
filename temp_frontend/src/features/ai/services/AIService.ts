import { message } from 'antd';

interface Flashcard {
  question: string;
  answer: string;
}

class AIService {
  private static instance: AIService;
  private apiUrl = process.env.REACT_APP_AI_API_URL || 'http://localhost:3001/api/ai';

  private constructor() {}

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  public async summarizeNote(content: string): Promise<string> {
    try {
      // In a real implementation, this would call your backend AI service
      // For now, we'll use a simple extractive summarization
      if (!content) return '';
      
      // Simple extractive summarization (first 3 sentences)
      const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const summary = sentences.slice(0, 3).join('. ') + '.';
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return summary;
    } catch (error) {
      console.error('Error generating summary:', error);
      message.error('Failed to generate summary');
      throw error;
    }
  }

  public async generateFlashcards(content: string): Promise<Flashcard[]> {
    try {
      // In a real implementation, this would call your backend AI service
      if (!content) return [];
      
      // Simple flashcard generation (split by paragraphs)
      const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
      const flashcards: Flashcard[] = [];
      
      for (let i = 0; i < Math.min(5, paragraphs.length); i++) {
        const paragraph = paragraphs[i];
        const sentences = paragraph.split(/[.!?]+/).filter(s => s.trim().length > 0);
        
        if (sentences.length >= 2) {
          flashcards.push({
            question: sentences[0].trim() + '?',
            answer: sentences.slice(1).join('. ').trim() + '.'
          });
        }
      }
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return flashcards.length > 0 ? flashcards : [{
        question: 'No flashcards could be generated',
        answer: 'The content might be too short or not suitable for flashcard generation.'
      }];
    } catch (error) {
      console.error('Error generating flashcards:', error);
      message.error('Failed to generate flashcards');
      throw error;
    }
  }

  public async improveText(text: string): Promise<string> {
    try {
      // In a real implementation, this would call your backend AI service
      if (!text) return '';
      
      // Simple text improvement (capitalization and spacing)
      let improved = text
        .replace(/\s+/g, ' ')
        .replace(/\.\s+([a-z])/g, (_, p1) => `. ${p1.toUpperCase()}`)
        .trim();
      
      // Ensure proper capitalization
      if (improved.length > 0) {
        improved = improved[0].toUpperCase() + improved.slice(1);
      }
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return improved;
    } catch (error) {
      console.error('Error improving text:', error);
      message.error('Failed to improve text');
      throw error;
    }
  }
}

export default AIService.getInstance();
