import { lazy } from 'react';

// Lazy load components for better performance
export const LazyAdvancedSearch = lazy(() => import('../components/AdvancedSearch'));
export const LazyRobotAssistant = lazy(() => import('../components/RobotAssistant'));
export const LazyCollaboration = lazy(() => import('../components/Collaboration'));
export const LazyWhiteboard = lazy(() => import('../components/Whiteboard'));
export const LazyAIAssistant = lazy(() => import('../components/AIAssistant'));
export const LazyNotes = lazy(() => import('../components/Notes'));
export const LazyFlashcards = lazy(() => import('../components/FlashcardSystem'));
export const LazyMindMap = lazy(() => import('../components/MindMap'));
export const LazyImageGenerator = lazy(() => import('../components/ImageGenerator'));
export const LazyVideoProcessor = lazy(() => import('../components/VideoProcessor'));

// Preload critical components
export const preloadComponent = (componentImporter: () => Promise<any>) => {
  componentImporter();
};

// Preload important routes
export const preloadCriticalRoutes = () => {
  preloadComponent(() => import('../components/AdvancedSearch'));
  preloadComponent(() => import('../components/RobotAssistant'));
  preloadComponent(() => import('../components/Notes'));
};
