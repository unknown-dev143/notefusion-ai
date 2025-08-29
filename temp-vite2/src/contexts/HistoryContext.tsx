import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import HistoryService, { HistoryItem } from '../services/HistoryService';
import { message } from 'antd';

interface HistoryContextType {
  history: HistoryItem[];
  isLoading: boolean;
  searchHistory: (query: string) => void;
  clearHistory: () => void;
  removeHistoryItem: (id: string) => void;
  addHistoryItem: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export const HistoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadHistory = useCallback(async (query = '') => {
    try {
      setIsLoading(true);
      const items = query ? 
        HistoryService.searchHistory(query) : 
        HistoryService.getHistoryItems(20);
      setHistory(items);
    } catch (error) {
      console.error('Failed to load history:', error);
      message.error('Failed to load history');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchHistory = useCallback((query: string) => {
    loadHistory(query);
  }, [loadHistory]);

  const clearHistory = useCallback(() => {
    try {
      HistoryService.clearHistory();
      setHistory([]);
      message.success('History cleared');
    } catch (error) {
      console.error('Failed to clear history:', error);
      message.error('Failed to clear history');
    }
  }, []);

  const removeHistoryItem = useCallback((id: string) => {
    try {
      HistoryService.removeHistoryItem(id);
      setHistory(prev => prev.filter(item => item.id !== id));
      message.success('Item removed from history');
    } catch (error) {
      console.error('Failed to remove history item:', error);
      message.error('Failed to remove history item');
    }
  }, []);

  const addHistoryItem = useCallback((item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    try {
      const newItem = HistoryService.addHistoryItem(item);
      setHistory(prev => [newItem, ...prev].slice(0, 20));
    } catch (error) {
      console.error('Failed to save to history:', error);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return (
    <HistoryContext.Provider
      value={{
        history,
        isLoading,
        searchHistory,
        clearHistory,
        removeHistoryItem,
        addHistoryItem,
      }}
    >
      {children}
    </HistoryContext.Provider>
  );
};

export const useHistory = (): HistoryContextType => {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
};
