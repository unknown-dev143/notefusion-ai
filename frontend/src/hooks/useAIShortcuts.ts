import { useCallback } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { message } from 'antd';
import { useAIAssistant } from '../contexts/AIAssistantContext';

export const useAIShortcuts = () => {
  const { state, toggleAIAssistant, dispatch } = useAIAssistant();
  const { enableShortcuts } = state.preferences;

  // Toggle AI Assistant visibility
  useHotkeys(
    'ctrl+space, cmd+space',
    (e) => {
      e.preventDefault();
      if (enableShortcuts) {
        toggleAIAssistant();
      }
    },
    [toggleAIAssistant, enableShortcuts],
    { enableOnFormTags: true }
  );

  // Quick summary shortcut
  useHotkeys(
    'ctrl+shift+s, cmd+shift+s',
    (e) => {
      e.preventDefault();
      if (enableShortcuts) {
        dispatch({ type: 'SET_ACTIVE_TAB', payload: 'summarize' });
        toggleAIAssistant(true);
      }
    },
    [dispatch, toggleAIAssistant, enableShortcuts],
    { enableOnFormTags: true }
  );

  // Quick tag shortcut
  useHotkeys(
    'ctrl+shift+t, cmd+shift+t',
    (e) => {
      e.preventDefault();
      if (enableShortcuts) {
        dispatch({ type: 'SET_ACTIVE_TAB', payload: 'tags' });
        toggleAIAssistant(true);
      }
    },
    [dispatch, toggleAIAssistant, enableShortcuts],
    { enableOnFormTags: true }
  );

  // Quick organize shortcut
  useHotkeys(
    'ctrl+shift+o, cmd+shift+o',
    (e) => {
      e.preventDefault();
      if (enableShortcuts) {
        dispatch({ type: 'SET_ACTIVE_TAB', payload: 'organize' });
        toggleAIAssistant(true);
      }
    },
    [dispatch, toggleAIAssistant, enableShortcuts],
    { enableOnFormTags: true }
  );

  // Quick generate shortcut
  useHotkeys(
    'ctrl+shift+g, cmd+shift+g',
    (e) => {
      e.preventDefault();
      if (enableShortcuts) {
        dispatch({ type: 'SET_ACTIVE_TAB', payload: 'generate' });
        toggleAIAssistant(true);
      }
    },
    [dispatch, toggleAIAssistant, enableShortcuts],
    { enableOnFormTags: true }
  );

  // Undo last action
  useHotkeys(
    'ctrl+z, cmd+z',
    (e) => {
      if (enableShortcuts && state.history.length > 0) {
        e.preventDefault();
        // Only handle undo if we're not in an input field
        const target = e.target as HTMLElement;
        if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
          dispatch({ type: 'UNDO_ACTION' });
          message.success('Undo last action');
        }
      }
    },
    [dispatch, enableShortcuts, state.history.length],
    { enableOnFormTags: true }
  );

  // Toggle AI Assistant with specific tab
  const toggleWithTab = useCallback((tab: string) => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });
    toggleAIAssistant(true);
  }, [dispatch, toggleAIAssistant]);

  return {
    toggleAIAssistant,
    toggleWithTab,
    isVisible: state.isVisible,
    activeTab: state.activeTab,
  };
};

export default useAIShortcuts;
