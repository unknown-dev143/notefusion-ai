import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import { message } from 'antd';
import AIService from '../services/ai/AIService';

interface AIAssistantState {
  isVisible: boolean;
  activeTab: string;
  isLoading: boolean;
  history: Array<{
    id: string;
    action: string;
    timestamp: Date;
    input: any;
    output: any;
  }>;
  preferences: {
    autoApply: boolean;
    defaultTone: string;
    defaultFormat: string;
    enableShortcuts: boolean;
  };
}

type AIAssistantAction =
  | { type: 'SET_VISIBLE'; payload: boolean }
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'ADD_TO_HISTORY'; payload: any }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<AIAssistantState['preferences']> }
  | { type: 'UNDO_ACTION' };

const initialState: AIAssistantState = {
  isVisible: false,
  activeTab: 'summarize',
  isLoading: false,
  history: [],
  preferences: {
    autoApply: false,
    defaultTone: 'professional',
    defaultFormat: 'markdown',
    enableShortcuts: true,
  },
};

const AIAssistantContext = createContext<{
  state: AIAssistantState;
  dispatch: React.Dispatch<AIAssistantAction>;
  handleAIAction: (action: string, data?: any) => Promise<any>;
  toggleAIAssistant: (visible?: boolean) => void;
  updatePreferences: (prefs: Partial<AIAssistantState['preferences']>) => void;
  undoLastAction: () => void;
} | undefined>(undefined);

function aiAssistantReducer(state: AIAssistantState, action: AIAssistantAction): AIAssistantState {
  switch (action.type) {
    case 'SET_VISIBLE':
      return { ...state, isVisible: action.payload };
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'ADD_TO_HISTORY':
      return {
        ...state,
        history: [
          {
            id: Date.now().toString(),
            timestamp: new Date(),
            ...action.payload,
          },
          ...state.history,
        ].slice(0, 50), // Keep only the last 50 actions
      };
    case 'UPDATE_PREFERENCES':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          ...action.payload,
        },
      };
    case 'UNDO_ACTION':
      if (state.history.length === 0) return state;
      const [latestAction, ...restHistory] = state.history;
      return {
        ...state,
        history: restHistory,
      };
    default:
      return state;
  }
}

export const AIAssistantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(aiAssistantReducer, initialState);

  const handleAIAction = useCallback(async (action: string, data?: any) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      let result;
      switch (action) {
        case 'summarize':
          result = await AIService.summarizeContent(data.content, data.options);
          break;
        case 'generateTags':
          result = await AIService.generateTags(data.content, data.options);
          break;
        case 'generateContent':
          result = await AIService.generateContent(data.prompt, data.content, data.options);
          break;
        case 'getStructure':
          result = await AIService.getContentStructure(data.content);
          break;
        default:
          throw new Error(`Unknown AI action: ${action}`);
      }

      dispatch({
        type: 'ADD_TO_HISTORY',
        payload: {
          action,
          input: data,
          output: result,
        },
      });

      return result;
    } catch (error) {
      console.error(`AI ${action} failed:`, error);
      message.error(`Failed to perform ${action}. Please try again.`);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const toggleAIAssistant = useCallback((visible?: boolean) => {
    dispatch({
      type: 'SET_VISIBLE',
      payload: visible !== undefined ? visible : !state.isVisible,
    });
  }, [state.isVisible]);

  const updatePreferences = useCallback((prefs: Partial<AIAssistantState['preferences']>) => {
    dispatch({
      type: 'UPDATE_PREFERENCES',
      payload: prefs,
    });
  }, []);

  const undoLastAction = useCallback(() => {
    dispatch({ type: 'UNDO_ACTION' });
  }, []);

  const value = useMemo(
    () => ({
      state,
      dispatch,
      handleAIAction,
      toggleAIAssistant,
      updatePreferences,
      undoLastAction,
    }),
    [state, handleAIAction, toggleAIAssistant, updatePreferences, undoLastAction]
  );

  return (
    <AIAssistantContext.Provider value={value}>
      {children}
    </AIAssistantContext.Provider>
  );
};

export const useAIAssistant = () => {
  const context = useContext(AIAssistantContext);
  if (context === undefined) {
    throw new Error('useAIAssistant must be used within an AIAssistantProvider');
  }
  return context;
};

export default AIAssistantContext;
