import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { featureIntegration, FeatureEvent, FeatureConnection } from '../services/FeatureIntegrationService';

interface FeatureIntegrationContextType {
  // Connection management
  connections: FeatureConnection[];
  isConnected: boolean;
  lastSyncTime: Date | null;
  
  // Event management
  emitEvent: (eventType: string, payload: any) => void;
  addEventListener: (eventType: string, callback: (event: FeatureEvent) => void) => void;
  
  // Sync management
  syncFeatures: () => void;
  isAutoSync: boolean;
  setIsAutoSync: (enabled: boolean) => void;
  
  // Feature-specific methods
  syncNotesToAI: (notes: any[]) => void;
  generateAIContent: (content: any, target: string) => void;
  shareContent: (content: any, target: string) => void;
  exportData: (data: any, target: string) => void;
  updateProgress: (progress: any, target: string) => void;
}

const FeatureIntegrationContext = createContext<FeatureIntegrationContextType | null>(null);

interface FeatureIntegrationProviderProps {
  children: ReactNode;
}

export const FeatureIntegrationProvider: React.FC<FeatureIntegrationProviderProps> = ({ children }) => {
  const [connections, setConnections] = useState<FeatureConnection[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isAutoSync, setIsAutoSync] = useState(true);

  useEffect(() => {
    // Initialize feature integration
    initializeIntegration();
    
    // Set up auto-sync
    const interval = setInterval(() => {
      if (isAutoSync) {
        syncFeatures();
      }
    }, 30000); // Sync every 30 seconds

    return () => clearInterval(interval);
  }, [isAutoSync]);

  const initializeIntegration = () => {
    // Initialize the feature integration service
    featureIntegration.initializeConnections();
    
    // Set up initial connections
    const initialConnections: FeatureConnection[] = [
      { source: 'notes', target: 'ai_assistant', action: 'sync_notes' },
      { source: 'ai_assistant', target: 'notes', action: 'generate_ai_content' },
      { source: 'ai_assistant', target: 'flashcards', action: 'generate_ai_content' },
      { source: 'study_timer', target: 'user_profile', action: 'update_progress' },
      { source: 'flashcards', target: 'analytics', action: 'update_progress' },
      { source: 'notes', target: 'study_groups', action: 'share_content' },
      { source: 'whiteboard', target: 'collaboration', action: 'share_content' },
      { source: 'notes', target: 'export_system', action: 'export_data' },
      { source: 'voice_recorder', target: 'transcript_editor', action: 'share_content' },
      { source: 'image_generator', target: 'notes', action: 'share_content' }
    ];

    setConnections(initialConnections);
    setIsConnected(true);
    setLastSyncTime(new Date());
  };

  const emitEvent = (eventType: string, payload: any) => {
    featureIntegration.emitEvent(eventType, payload);
  };

  const addEventListener = (eventType: string, callback: (event: FeatureEvent) => void) => {
    featureIntegration.addEventListener(eventType, callback);
  };

  const syncFeatures = () => {
    featureIntegration.testConnections();
    setLastSyncTime(new Date());
  };

  // Feature-specific integration methods
  const syncNotesToAI = (notes: any[]) => {
    emitEvent('notes_update', { notes });
  };

  const generateAIContent = (content: any, target: string) => {
    emitEvent('ai_content_request', { content, target });
  };

  const shareContent = (content: any, target: string) => {
    emitEvent('content_share', { content, target });
  };

  const exportData = (data: any, target: string) => {
    emitEvent('data_export', { data, target });
  };

  const updateProgress = (progress: any, target: string) => {
    emitEvent('progress_update', { progress, target });
  };

  const value: FeatureIntegrationContextType = {
    connections,
    isConnected,
    lastSyncTime,
    emitEvent,
    addEventListener,
    syncFeatures,
    isAutoSync,
    setIsAutoSync,
    syncNotesToAI,
    generateAIContent,
    shareContent,
    exportData,
    updateProgress
  };

  return (
    <FeatureIntegrationContext.Provider value={value}>
      {children}
    </FeatureIntegrationContext.Provider>
  );
};

export const useFeatureIntegration = () => {
  const context = useContext(FeatureIntegrationContext);
  if (!context) {
    throw new Error('useFeatureIntegration must be used within FeatureIntegrationProvider');
  }
  return context;
};

// Hook for easy feature integration
export const useFeatureSync = () => {
  const { emitEvent, syncNotesToAI, generateAIContent, shareContent } = useFeatureIntegration();

  return {
    // Note-related sync
    syncNotes: (notes: any[]) => syncNotesToAI(notes),
    
    // AI content generation
    generateNotes: (content: any) => generateAIContent(content, 'notes'),
    generateFlashcards: (content: any) => generateAIContent(content, 'flashcards'),
    generateQuiz: (content: any) => generateAIContent(content, 'quiz'),
    
    // Content sharing
    shareWithStudyGroups: (content: any) => shareContent(content, 'study_groups'),
    shareForCollaboration: (content: any) => shareContent(content, 'collaboration'),
    shareToSocial: (content: any) => shareContent(content, 'social_media'),
    
    // General events
    emitEvent
  };
};

// Hook for progress tracking
export const useProgressTracking = () => {
  const { updateProgress, emitEvent } = useFeatureIntegration();

  return {
    trackStudySession: (duration: number, score?: number) => {
      updateProgress({ type: 'study_session', duration, score }, 'user_profile');
      emitEvent('study_session_complete', { duration, score });
    },
    
    trackNoteCreation: (noteCount: number) => {
      updateProgress({ type: 'note_creation', count: noteCount }, 'analytics');
      emitEvent('notes_created', { count: noteCount });
    },
    
    trackQuizCompletion: (score: number, totalQuestions: number) => {
      updateProgress({ type: 'quiz_completion', score, totalQuestions }, 'analytics');
      emitEvent('quiz_completed', { score, totalQuestions });
    },
    
    trackFlashcardReview: (cardsReviewed: number, accuracy: number) => {
      updateProgress({ type: 'flashcard_review', cardsReviewed, accuracy }, 'analytics');
      emitEvent('flashcards_reviewed', { cardsReviewed, accuracy });
    }
  };
};

export default FeatureIntegrationContext;
