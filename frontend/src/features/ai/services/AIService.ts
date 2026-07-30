import { api, handleApiError } from '../../../lib/api';

interface Flashcard {
  question: string;
  answer: string;
}

class AIService {
  private static instance: AIService;

  private constructor() {}

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  public async summarizeNote(content: string): Promise<string> {
    try {
      const response = await api.post('/ai/summarize', {
        content,
        options: { focus: 'key-points', format: 'bullets' }
      });
      return response.data.content;
    } catch (error) {
      console.error('Error generating summary:', error);
      throw new Error(handleApiError(error, 'Failed to generate summary'));
    }
  }

  public async generateFlashcards(content: string): Promise<Flashcard[]> {
    try {
      const response = await api.post('/ai/flashcards', { content });
      return response.data.flashcards || response.data;
    } catch (error) {
      console.error('Error generating flashcards:', error);
      throw new Error(handleApiError(error, 'Failed to generate flashcards'));
    }
  }

  public async improveText(text: string): Promise<string> {
    try {
      const response = await api.post('/ai/generate', {
        prompt: 'Improve the clarity, grammar, and professional tone of the following text while maintaining its core meaning.',
        content: text
      });
      return response.data.content;
    } catch (error) {
      console.error('Error improving text:', error);
      throw new Error(handleApiError(error, 'Failed to improve text'));
    }
  }

  public async semanticSearch(query: string, allNotes: any[]): Promise<any[]> {
    try {
      const response = await api.post('/ai/synapse', { content: query });
      return response.data.connections || [];
    } catch (error) {
      console.error('Semantic search failed:', error);
      return [];
    }
  }

  public async suggestKnowledgeBridges(currentNote: any, allNotes: any[]): Promise<any[]> {
    try {
      // Mapping this to synapse or specialized bridge endpoint if needed.
      // For now, synapse provides semantic connections which acts as bridges.
      const response = await api.post('/ai/synapse', { content: currentNote.content });
      return (response.data.connections || []).map((c: any) => ({
        note: c,
        reason: 'Semantic intersection in core concepts'
      }));
    } catch (error) {
      console.error('Bridge analysis failed:', error);
      return [];
    }
  }

  public async generateGlossary(content: string): Promise<Record<string, string>> {
     try {
       const response = await api.post('/ai/glossary', { content });
       return response.data;
     } catch (error) {
       console.error('Glossary generation failed:', error);
       return {};
     }
  }

  public async generateStudyGuide(content: string): Promise<any> {
    try {
      const response = await api.post('/ai/study-guide', { content });
      return response.data;
    } catch (error) {
      console.error('Study guide creation failed:', error);
      throw new Error(handleApiError(error, 'Failed to create study guide'));
    }
  }
}

export default AIService.getInstance();
