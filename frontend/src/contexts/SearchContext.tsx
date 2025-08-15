import React, { createContext, useContext, ReactNode, useState, useCallback, useMemo } from 'react';

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchFilters: Record<string, any>;
  setSearchFilters: (filters: Record<string, any>) => void;
  clearSearch: () => void;
  isSearching: boolean;
  searchResults: any[];
  performSearch: (query: string, filters?: Record<string, any>) => Promise<void>;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchFilters, setSearchFilters] = useState<Record<string, any>>({});
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchFilters({});
    setSearchResults([]);
  }, []);

  const performSearch = useCallback(async (query: string, filters: Record<string, any> = {}) => {
    setIsSearching(true);
    setSearchQuery(query);
    setSearchFilters(filters);

    try {
      // Replace with actual search API call
      // const results = await searchApi.search(query, filters);
      // setSearchResults(results);
      
      // Mock search results for now
      setSearchResults([
        { id: '1', title: `Result for: ${query}`, type: 'note', snippet: '...' },
        { id: '2', title: 'Another result', type: 'document', snippet: '...' },
      ]);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const value = useMemo(() => ({
    searchQuery,
    setSearchQuery,
    searchFilters,
    setSearchFilters,
    clearSearch,
    isSearching,
    searchResults,
    performSearch,
  }), [searchQuery, searchFilters, isSearching, searchResults, clearSearch, performSearch]);

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = (): SearchContextType => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};
