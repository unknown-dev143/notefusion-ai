import { useState, useCallback } from 'react';
import { message } from 'antd';
import { useAIOrganization } from '../context/AIOrganizationContext';
import type { Note } from '../../../types/note';
import type { AICategory, AITag, AISummary } from '../../../types/ai';

export const useAIAssistant = (note: Note) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [suggestions, setSuggestions] = useState<{
    categories: AICategory[];
    tags: AITag[];
    summary: AISummary | null;
  }>({ categories: [], tags: [], summary: null });

  const { analyzeNote } = useAIOrganization();

  const analyzeCurrentNote = useCallback(async () => {
    if (!note?.content) {
      message.warning('No content to analyze');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await analyzeNote(note);
      setSuggestions({
        categories: result.categories,
        tags: result.tags,
        summary: result.summary,
      });
      return result;
    } catch (error) {
      console.error('Error analyzing note:', error);
      message.error('Failed to analyze note content');
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [note, analyzeNote]);

  const generateSummary = useCallback(async () => {
    if (!note?.content) {
      message.warning('No content to summarize');
      return null;
    }

    setIsProcessing(true);
    try {
      const result = await analyzeNote(note);
      setSuggestions((prev) => ({
        ...prev,
        summary: result.summary,
      }));
      return result.summary;
    } catch (error) {
      console.error('Error generating summary:', error);
      message.error('Failed to generate summary');
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [note, analyzeNote]);

  const getSuggestedTags = useCallback(async () => {
    if (!note?.content) {
      message.warning('No content to generate tags from');
      return [];
    }

    setIsProcessing(true);
    try {
      const result = await analyzeNote(note);
      setSuggestions((prev) => ({
        ...prev,
        tags: result.tags,
      }));
      return result.tags;
    } catch (error) {
      console.error('Error generating tags:', error);
      message.error('Failed to generate tags');
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [note, analyzeNote]);

  const getSuggestedCategories = useCallback(async () => {
    if (!note?.content) {
      message.warning('No content to categorize');
      return [];
    }

    setIsProcessing(true);
    try {
      const result = await analyzeNote(note);
      setSuggestions((prev) => ({
        ...prev,
        categories: result.categories,
      }));
      return result.categories;
    } catch (error) {
      console.error('Error categorizing note:', error);
      message.error('Failed to categorize note');
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [note, analyzeNote]);

  const improveWriting = useCallback(async (text: string) => {
    if (!text.trim()) {
      message.warning('No text to improve');
      return text;
    }

    setIsProcessing(true);
    try {
      // This would call an AI service to improve the writing
      // For now, we'll just return the original text
      return text;
    } catch (error) {
      console.error('Error improving text:', error);
      message.error('Failed to improve text');
      return text;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    isProcessing,
    suggestions,
    analyzeNote: analyzeCurrentNote,
    generateSummary,
    getSuggestedTags,
    getSuggestedCategories,
    improveWriting,
  };
};

export default useAIAssistant;
