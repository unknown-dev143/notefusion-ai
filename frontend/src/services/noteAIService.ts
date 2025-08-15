import { apiService } from './apiService';

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
  }
}

export const noteAIService = new NoteAIService();
