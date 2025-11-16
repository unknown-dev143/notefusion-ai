import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import AIService from '../services/AIService';
import { message } from 'antd';

export interface SentimentAnalysis {
  sentiment: 'positive' | 'neutral' | 'negative';
  score: number;
  confidence: number;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

export interface ActionItem {
  id: string;
  task: string;
  priority: 'high' | 'medium' | 'low';
}

interface AIContextType {
  isProcessing: boolean;
  // Basic AI Features
  generateSummary: (text: string) => Promise<string>;
  improveText: (text: string) => Promise<string>;
  generateTags: (text: string) => Promise<string[]>;
  answerQuestion: (text: string, question: string) => Promise<string>;
  translateText: (text: string, targetLanguage: string) => Promise<string>;
  generateIdeas: (topic: string, count?: number) => Promise<string[]>;
  
  // Advanced AI Features
  analyzeSentiment: (text: string) => Promise<SentimentAnalysis>;
  generateFlashcards: (text: string, count?: number) => Promise<Flashcard[]>;
  extractKeyPoints: (text: string, count?: number) => Promise<string[]>;
  generateActionItems: (text: string) => Promise<ActionItem[]>;
  
  // Utility
  resetAIState: () => void;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider = ({ children }: { children: ReactNode }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const generateSummary = useCallback(async (text: string) => {
    setIsProcessing(true);
    try {
      const summary = await AIService.generateSummary(text);
      return summary;
    } catch (error) {
      console.error('Error generating summary:', error);
      message.error('Failed to generate summary');
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const improveText = useCallback(async (text: string) => {
    setIsProcessing(true);
    try {
      const improvedText = await AIService.improveText(text);
      return improvedText;
    } catch (error) {
      console.error('Error improving text:', error);
      message.error('Failed to improve text');
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const generateTags = useCallback(async (text: string) => {
    setIsProcessing(true);
    try {
      const tags = await AIService.generateTags(text);
      return tags;
    } catch (error) {
      console.error('Error generating tags:', error);
      message.error('Failed to generate tags');
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const answerQuestion = useCallback(async (text: string, question: string) => {
    setIsProcessing(true);
    try {
      const answer = await AIService.answerQuestion(text, question);
      return answer;
    } catch (error) {
      console.error('Error answering question:', error);
      message.error('Failed to get answer');
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const translateText = useCallback(async (text: string, targetLanguage: string) => {
    setIsProcessing(true);
    try {
      const translatedText = await AIService.translateText(text, targetLanguage);
      return translatedText;
    } catch (error) {
      console.error('Error translating text:', error);
      message.error('Failed to translate text');
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const generateIdeas = useCallback(async (topic: string, count: number = 5) => {
    setIsProcessing(true);
    try {
      const ideas = await AIService.generateIdeas(topic, count);
      return ideas;
    } catch (error) {
      console.error('Error generating ideas:', error);
      message.error('Failed to generate ideas');
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const analyzeSentiment = useCallback(async (text: string) => {
    setIsProcessing(true);
    try {
      const result = await AIService.analyzeSentiment(text);
      return result;
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      message.error('Failed to analyze sentiment');
      return { sentiment: 'neutral', score: 0, confidence: 0 } as SentimentAnalysis;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const generateFlashcards = useCallback(async (text: string, count: number = 5) => {
    setIsProcessing(true);
    try {
      const flashcards = await AIService.generateFlashcards(text, count);
      return flashcards;
    } catch (error) {
      console.error('Error generating flashcards:', error);
      message.error('Failed to generate flashcards');
      return [];
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const extractKeyPoints = useCallback(async (text: string, count: number = 5) => {
    setIsProcessing(true);
    try {
      const keyPoints = await AIService.extractKeyPoints(text, count);
      return keyPoints;
    } catch (error) {
      console.error('Error extracting key points:', error);
      message.error('Failed to extract key points');
      return [];
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const generateActionItems = useCallback(async (text: string) => {
    setIsProcessing(true);
    try {
      const actionItems = await AIService.generateActionItems(text);
      return actionItems;
    } catch (error) {
      console.error('Error generating action items:', error);
      message.error('Failed to generate action items');
      return [];
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const resetAIState = useCallback(() => {
    // Reset any AI-related state if needed
    setIsProcessing(false);
  }, []);

  return (
    <AIContext.Provider
      value={{
        isProcessing,
        // Basic AI Features
        generateSummary,
        improveText,
        generateTags,
        answerQuestion,
        translateText,
        generateIdeas,
        
        // Advanced AI Features
        analyzeSentiment,
        generateFlashcards,
        extractKeyPoints,
        generateActionItems,
        
        // Utility
        resetAIState
      }}
    >
      {children}
    </AIContext.Provider>
  );
};

export const useAI = (): AIContextType => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};

export default AIContext;
