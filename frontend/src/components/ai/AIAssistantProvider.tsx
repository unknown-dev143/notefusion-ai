import React, { useEffect, useCallback } from 'react';
import { message } from 'antd';
import { useHotkeys } from 'react-hotkeys-hook';
import { AIAssistantProvider as Provider, useAIAssistant } from '../../contexts/AIAssistantContext';
import AIAssistant from './AIAssistant';

interface AIAssistantProviderProps {
  children: React.ReactNode;
  defaultTab?: string;
  onContentUpdate?: (content: string) => void;
  onTagsUpdate?: (tags: string[]) => void;
  noteId?: string | null;
  content?: string;
  initialTags?: string[];
}

// This is the internal wrapper that uses the context
interface AIAssistantWrapperProps {
  children: React.ReactNode;
  defaultTab: string;
  onContentUpdate: (content: string) => void;
  onTagsUpdate: (tags: string[]) => void;
  noteId?: string | null | undefined;
  content: string;
  initialTags: string[];
}

const AIAssistantWrapper: React.FC<AIAssistantWrapperProps> = ({
  children,
  defaultTab,
  onContentUpdate,
  onTagsUpdate,
  noteId,
  content,
  initialTags,
}) => {
  const { state, toggleAIAssistant, updatePreferences } = useAIAssistant();

  // Set up keyboard shortcuts
  useHotkeys(
    'ctrl+space, cmd+space',
    (e) => {
      e.preventDefault();
      toggleAIAssistant();
    },
    [toggleAIAssistant],
    { enableOnFormTags: true }
  );

  // Load user preferences from localStorage on mount
  useEffect(() => {
    try {
      const savedPrefs = localStorage.getItem('aiAssistantPreferences');
      if (savedPrefs) {
        updatePreferences(JSON.parse(savedPrefs));
      }
    } catch (error) {
      console.error('Failed to load AI Assistant preferences:', error);
    }
  }, [updatePreferences]);

  // Save preferences to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('aiAssistantPreferences', JSON.stringify(state.preferences));
    } catch (error) {
      console.error('Failed to save AI Assistant preferences:', error);
    }
  }, [state.preferences]);

  // Handle content updates from AI components
  const handleContentUpdate = useCallback((newContent: string) => {
    if (onContentUpdate) {
      onContentUpdate(newContent);
      message.success('Content updated successfully');
    }
  }, [onContentUpdate]);

  // Handle tag updates from AI components
  const handleTagsUpdate = useCallback((tags: string[]) => {
    if (onTagsUpdate) {
      onTagsUpdate(tags);
      message.success('Tags updated successfully');
    }
  }, [onTagsUpdate]);

  return (
    <>
      {children}
      <AIAssistant
        noteId={noteId || undefined}
        content={content}
        onContentUpdate={handleContentUpdate}
        onTagsUpdate={handleTagsUpdate}
        initialTags={initialTags}
        defaultTab={defaultTab}
        isVisible={state.isVisible}
        onClose={() => toggleAIAssistant(false)}
      />
    </>
  );
};

const AIAssistantProvider: React.FC<AIAssistantProviderProps> = ({
  children,
  defaultTab = 'summarize',
  onContentUpdate = () => {},
  onTagsUpdate = () => {},
  noteId = null,
  content = '',
  initialTags = [],
}) => {
  return (
    <Provider>
      <AIAssistantWrapper 
        defaultTab={defaultTab}
        onContentUpdate={onContentUpdate}
        onTagsUpdate={onTagsUpdate}
        noteId={noteId}
        content={content}
        initialTags={initialTags}
      >
        {children}
      </AIAssistantWrapper>
    </Provider>
  );
};

export default AIAssistantProvider;
