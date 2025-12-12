import { apiClient, ApiResponse } from './apiClient';

export interface SearchResult {
  id: string;
  type: 'note' | 'flashcard' | 'document' | 'audio' | 'video' | 'user';
  title: string;
  content: string;
  snippet: string;
  highlights: Array<{
    field: string;
    fragments: string[];
  }>;
  score: number;
  metadata: {
    user_id: string;
    created_at: string;
    updated_at: string;
    tags: string[];
    category?: string;
    [key: string]: any;
  };
  permissions: {
    can_view: boolean;
    can_edit: boolean;
    can_delete: boolean;
  };
}

export interface SearchQuery {
  query: string;
  filters?: {
    type?: Array<'note' | 'flashcard' | 'document' | 'audio' | 'video' | 'user'>;
    user_id?: string;
    tags?: string[];
    category?: string;
    date_from?: string;
    date_to?: string;
    is_shared?: boolean;
    is_public?: boolean;
  };
  sort_by?: 'relevance' | 'created_at' | 'updated_at' | 'title';
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
  include_highlights?: boolean;
  include_aggregations?: boolean;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  took: number;
  max_score: number;
  aggregations?: {
    types: Record<string, number>;
    users: Record<string, number>;
    tags: Record<string, number>;
    categories: Record<string, number>;
    date_ranges: Array<{
      key: string;
      from: string;
      to: string;
      doc_count: number;
    }>;
  };
  suggestions?: Array<{
    text: string;
    score: number;
  }>;
  spelling_correction?: {
    original: string;
    corrected: string;
    confidence: number;
  };
}

export interface SearchIndex {
  id: string;
  name: string;
  type: 'notes' | 'flashcards' | 'documents' | 'audio' | 'video' | 'users';
  status: 'active' | 'building' | 'error' | 'disabled';
  document_count: number;
  size_bytes: number;
  last_updated: string;
  settings: {
    analysis: {
      analyzer: string;
      tokenizer: string;
      filters: string[];
    };
    mapping: Record<string, any>;
  };
}

export interface SearchSuggestion {
  text: string;
  type: 'query' | 'completion' | 'correction';
  score: number;
  source: 'history' | 'popular' | 'algorithmic';
  metadata?: {
    frequency?: number;
    last_used?: string;
    context?: string;
  };
}

class SearchAPI {
  // Basic Search
  async search(query: SearchQuery): Promise<ApiResponse<SearchResponse>> {
    return apiClient.post('/search', query);
  }

  async quickSearch(query: string, limit: number = 10): Promise<ApiResponse<SearchResponse>> {
    return apiClient.post('/search/quick', { query, limit });
  }

  async advancedSearch(query: {
    must?: Array<{
      field: string;
      query: string;
      operator?: 'match' | 'term' | 'range' | 'exists';
    }>;
    should?: Array<{
      field: string;
      query: string;
      operator?: 'match' | 'term' | 'range' | 'exists';
    }>;
    must_not?: Array<{
      field: string;
      query: string;
      operator?: 'match' | 'term' | 'range' | 'exists';
    }>;
    filters?: SearchQuery['filters'];
    sort?: Array<{
      field: string;
      order: 'asc' | 'desc';
    }>;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<SearchResponse>> {
    return apiClient.post('/search/advanced', query);
  }

  // Suggestions
  async getSuggestions(query: string, params?: {
    types?: Array<'query' | 'completion' | 'correction'>;
    limit?: number;
    include_history?: boolean;
  }): Promise<ApiResponse<SearchSuggestion[]>> {
    return apiClient.get('/search/suggestions', { query, ...params });
  }

  async addSuggestion(data: {
    text: string;
    type: 'query' | 'completion' | 'correction';
    context?: string;
  }): Promise<ApiResponse<SearchSuggestion>> {
    return apiClient.post('/search/suggestions', data);
  }

  async deleteSuggestion(suggestionId: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/search/suggestions/${suggestionId}`);
  }

  // Search History
  async getSearchHistory(params?: {
    limit?: number;
    offset?: number;
    date_from?: string;
    date_to?: string;
  }): Promise<ApiResponse<Array<{
    id: string;
    query: string;
    timestamp: string;
    results_count: number;
    clicked_result?: {
      id: string;
      type: string;
      title: string;
    };
  }>>> {
    return apiClient.get('/search/history', params);
  }

  async clearSearchHistory(): Promise<ApiResponse<{ deleted_count: number }>> {
    return apiClient.delete('/search/history');
  }

  async deleteSearchHistoryItem(historyId: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/search/history/${historyId}`);
  }

  // Saved Searches
  async getSavedSearches(): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    query: SearchQuery;
    created_at: string;
    last_used?: string;
    usage_count: number;
  }>>> {
    return apiClient.get('/search/saved');
  }

  async saveSearch(data: {
    name: string;
    query: SearchQuery;
  }): Promise<ApiResponse<any>> {
    return apiClient.post('/search/saved', data);
  }

  async updateSavedSearch(searchId: string, data: {
    name?: string;
    query?: SearchQuery;
  }): Promise<ApiResponse<any>> {
    return apiClient.put(`/search/saved/${searchId}`, data);
  }

  async deleteSavedSearch(searchId: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/search/saved/${searchId}`);
  }

  async runSavedSearch(searchId: string): Promise<ApiResponse<SearchResponse>> {
    return apiClient.post(`/search/saved/${searchId}/run`);
  }

  // Index Management (Admin)
  async getIndices(): Promise<ApiResponse<SearchIndex[]>> {
    return apiClient.get('/search/indices');
  }

  async getIndex(indexId: string): Promise<ApiResponse<SearchIndex>> {
    return apiClient.get(`/search/indices/${indexId}`);
  }

  async createIndex(data: {
    name: string;
    type: 'notes' | 'flashcards' | 'documents' | 'audio' | 'video' | 'users';
    settings?: {
      analysis?: {
        analyzer?: string;
        tokenizer?: string;
        filters?: string[];
      };
      mapping?: Record<string, any>;
    };
  }): Promise<ApiResponse<SearchIndex>> {
    return apiClient.post('/search/indices', data);
  }

  async updateIndex(indexId: string, data: {
    settings?: SearchIndex['settings'];
  }): Promise<ApiResponse<SearchIndex>> {
    return apiClient.put(`/search/indices/${indexId}`, data);
  }

  async deleteIndex(indexId: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/search/indices/${indexId}`);
  }

  async reindex(indexId: string): Promise<ApiResponse<{ job_id: string; status: string }>> {
    return apiClient.post(`/search/indices/${indexId}/reindex`);
  }

  async getIndexStats(indexId: string): Promise<ApiResponse<{
    document_count: number;
    size_bytes: number;
    field_stats: Record<string, {
      count: number;
      unique_values: number;
      avg_length?: number;
    }>;
    performance: {
      avg_query_time: number;
      avg_index_time: number;
      cache_hit_rate: number;
    };
  }>> {
    return apiClient.get(`/search/indices/${indexId}/stats`);
  }

  // Document Indexing
  async indexDocument(data: {
    id: string;
    type: 'note' | 'flashcard' | 'document' | 'audio' | 'video' | 'user';
    title: string;
    content: string;
    metadata: Record<string, any>;
    tags?: string[];
    category?: string;
  }): Promise<ApiResponse<{ success: boolean; indexed_at: string }>> {
    return apiClient.post('/search/documents', data);
  }

  async updateDocument(documentId: string, data: {
    title?: string;
    content?: string;
    metadata?: Record<string, any>;
    tags?: string[];
    category?: string;
  }): Promise<ApiResponse<{ success: boolean; updated_at: string }>> {
    return apiClient.put(`/search/documents/${documentId}`, data);
  }

  async deleteDocument(documentId: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/search/documents/${documentId}`);
  }

  async bulkIndexDocuments(documents: Array<{
    id: string;
    type: 'note' | 'flashcard' | 'document' | 'audio' | 'video' | 'user';
    title: string;
    content: string;
    metadata: Record<string, any>;
    tags?: string[];
    category?: string;
  }>): Promise<ApiResponse<{
    successful: string[];
    failed: Array<{
      id: string;
      error: string;
    }>;
  }>> {
    return apiClient.post('/search/documents/bulk', { documents });
  }

  // Analytics
  async getSearchAnalytics(params?: {
    period_start?: string;
    period_end?: string;
    granularity?: 'hour' | 'day' | 'week' | 'month';
  }): Promise<ApiResponse<{
    overview: {
      total_queries: number;
      unique_users: number;
      avg_query_length: number;
      zero_result_queries: number;
      avg_response_time: number;
    };
    trends: Array<{
      timestamp: string;
      queries: number;
      unique_users: number;
      avg_response_time: number;
      zero_result_rate: number;
    }>;
    top_queries: Array<{
      query: string;
      frequency: number;
      avg_results: number;
      click_through_rate: number;
    }>;
    top_filters: Array<{
      field: string;
      value: string;
      frequency: number;
    }>;
    performance: {
      avg_response_time: number;
      p95_response_time: number;
      p99_response_time: number;
      error_rate: number;
    };
  }>> {
    return apiClient.get('/search/analytics', params);
  }

  async getQueryAnalytics(query: string): Promise<ApiResponse<{
    query: string;
    frequency: number;
    avg_results: number;
    click_through_rate: number;
    avg_position: number;
    last_used: string;
    variations: Array<{
      query: string;
      frequency: number;
      similarity: number;
    }>;
  }>> {
    return apiClient.get('/search/analytics/query', { query });
  }

  // Search Configuration
  async getSearchConfig(): Promise<ApiResponse<{
    default_analyzer: string;
    default_tokenizer: string;
    default_filters: string[];
    max_results: number;
    highlight_enabled: boolean;
    suggestions_enabled: boolean;
    history_enabled: boolean;
    analytics_enabled: boolean;
  }>> {
    return apiClient.get('/search/config');
  }

  async updateSearchConfig(config: {
    default_analyzer?: string;
    default_tokenizer?: string;
    default_filters?: string[];
    max_results?: number;
    highlight_enabled?: boolean;
    suggestions_enabled?: boolean;
    history_enabled?: boolean;
    analytics_enabled?: boolean;
  }): Promise<ApiResponse<any>> {
    return apiClient.put('/search/config', config);
  }

  // Search Testing
  async testQuery(query: {
    search_query: SearchQuery;
    expected_results?: string[];
    test_type: 'performance' | 'relevance' | 'completeness';
  }): Promise<ApiResponse<{
    test_id: string;
    results: {
      search_time: number;
      result_count: number;
      relevance_score?: number;
      completeness_score?: number;
      expected_found?: number;
      unexpected_found?: string[];
    };
    recommendations: string[];
  }>> {
    return apiClient.post('/search/test', query);
  }

  async getTestResults(testId: string): Promise<ApiResponse<{
    test_id: string;
    status: 'running' | 'completed' | 'failed';
    results?: any;
    error?: string;
    started_at: string;
    completed_at?: string;
  }>> {
    return apiClient.get(`/search/test/${testId}`);
  }
}

export const searchAPI = new SearchAPI();
