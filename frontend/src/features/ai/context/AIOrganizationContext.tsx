import React, { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { Note } from '../../../types/note';
import { analyzeNoteContent, suggestRelatedNotes } from '../services/noteOrganizationService';

type AICategory = {
  id: string;
  name: string;
  description: string;
  confidence: number;
};

type AITag = {
  id: string;
  name: string;
  relevance: number;
};

type AISummary = {
  content: string;
  keyPoints: string[];
  actionItems?: string[];
};

interface AIAnalysisResult {
  categories: AICategory[];
  tags: AITag[];
  summary: AISummary;
}

interface AIOrganizationContextType {
  isAnalyzing: boolean;
  analyzeNote: (note: Note) => Promise<{
    categories: AICategory[];
    tags: AITag[];
    summary: AISummary;
  }>;
  findRelatedNotes: (note: Note, allNotes: Note[]) => Promise<Note[]>;
  error: string | null;
}

const AIOrganizationContext = createContext<AIOrganizationContextType | undefined>(undefined);

export const AIOrganizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeNote = useCallback(async (note: Note): Promise<AIAnalysisResult> => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeNoteContent(note.content);
      return {
        categories: result.categories || [],
        tags: result.tags || [],
        summary: {
          content: result.summary?.content || '',
          keyPoints: result.summary?.keyPoints || [],
          actionItems: result.summary?.actionItems
        }
      };
    } catch (err) {
      console.error('Error analyzing note:', err);
      setError('Failed to analyze note content');
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const findRelatedNotes = useCallback(async (currentNote: Note, allNotes: Note[]) => {
    try {
      return await suggestRelatedNotes(currentNote, allNotes);
    } catch (err) {
      console.error('Error finding related notes:', err);
      setError('Failed to find related notes');
      return [];
    }
  }, []);

  return (
    <AIOrganizationContext.Provider
      value={{
        isAnalyzing,
        analyzeNote,
        findRelatedNotes,
        error,
      }}
    >
      {children}
    </AIOrganizationContext.Provider>
  );
};

export const useAIOrganization = (): AIOrganizationContextType => {
  const context = useContext(AIOrganizationContext);
  if (context === undefined) {
    throw new Error('useAIOrganization must be used within an AIOrganizationProvider');
  }
  return context;
};
