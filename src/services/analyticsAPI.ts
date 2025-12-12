import { apiClient, ApiResponse } from './apiClient';

export interface UserAnalytics {
  user_id: string;
  total_notes: number;
  total_flashcards: number;
  study_sessions: number;
  study_time_minutes: number;
  last_active: string;
  created_at: string;
  subscription_tier: string;
  engagement_score: number;
}

export interface LearningAnalytics {
  user_id: string;
  subject: string;
  topic: string;
  performance_score: number;
  study_sessions: number;
  time_spent: number;
  accuracy_rate: number;
  improvement_trend: 'improving' | 'stable' | 'declining';
  last_studied: string;
}

export interface EngagementAnalytics {
  user_id: string;
  daily_active_time: number;
  weekly_active_time: number;
  monthly_active_time: number;
  features_used: Record<string, number>;
  session_duration_avg: number;
  retention_rate: number;
  churn_risk: 'low' | 'medium' | 'high';
}

export interface SystemAnalytics {
  total_users: number;
  active_users: number;
  total_notes: number;
  total_flashcards: number;
  api_calls: number;
  storage_used: number;
  error_rate: number;
  avg_response_time: number;
  uptime_percentage: number;
}

export interface ContentAnalytics {
  content_type: 'note' | 'flashcard' | 'document';
  total_count: number;
  created_today: number;
  created_this_week: number;
  created_this_month: number;
  most_popular_tags: Array<{
    tag: string;
    count: number;
  }>;
  avg_size: number;
}

export interface SearchAnalytics {
  query: string;
  search_count: number;
  avg_results: number;
  click_through_rate: number;
  zero_results_rate: number;
  popular_timeframes: Array<{
    hour: number;
    count: number;
  }>;
}

export interface AIUsageAnalytics {
  user_id: string;
  feature: string;
  usage_count: number;
  tokens_used: number;
  cost: number;
  avg_response_time: number;
  satisfaction_score: number;
  last_used: string;
}

export interface CustomReport {
  id: string;
  name: string;
  description: string;
  query: string;
  filters: Record<string, any>;
  visualization_type: 'table' | 'chart' | 'graph';
  created_by: string;
  created_at: string;
  last_run: string;
  is_public: boolean;
}

export interface RealTimeMetrics {
  timestamp: string;
  active_users: number;
  api_requests_per_second: number;
  cpu_usage: number;
  memory_usage: number;
  error_rate: number;
  response_time_p95: number;
}

class AnalyticsAPI {
  // User Analytics
  async getUserAnalytics(userId: string, params?: {
    period_start?: string;
    period_end?: string;
    metrics?: string[];
  }): Promise<ApiResponse<UserAnalytics>> {
    return apiClient.get(`/analytics/users/${userId}`, params);
  }

  async getUserLearningProgress(userId: string, params?: {
    subject?: string;
    period_start?: string;
    period_end?: string;
  }): Promise<ApiResponse<LearningAnalytics[]>> {
    return apiClient.get(`/analytics/users/${userId}/learning`, params);
  }

  async getUserEngagementMetrics(userId: string, params?: {
    period_start?: string;
    period_end?: string;
    granularity?: 'hour' | 'day' | 'week' | 'month';
  }): Promise<ApiResponse<EngagementAnalytics>> {
    return apiClient.get(`/analytics/users/${userId}/engagement`, params);
  }

  async getUserAIUsage(userId: string, params?: {
    feature?: string;
    period_start?: string;
    period_end?: string;
  }): Promise<ApiResponse<AIUsageAnalytics[]>> {
    return apiClient.get(`/analytics/users/${userId}/ai-usage`, params);
  }

  // System Analytics
  async getSystemOverview(params?: {
    period_start?: string;
    period_end?: string;
  }): Promise<ApiResponse<SystemAnalytics>> {
    return apiClient.get('/analytics/system/overview', params);
  }

  async getSystemPerformance(params?: {
    period_start?: string;
    period_end?: string;
    granularity?: 'minute' | 'hour' | 'day';
  }): Promise<ApiResponse<Array<{
    timestamp: string;
    cpu_usage: number;
    memory_usage: number;
    disk_usage: number;
    network_io: number;
    response_time: number;
    error_rate: number;
  }>>> {
    return apiClient.get('/analytics/system/performance', params);
  }

  async getSystemHealth(): Promise<ApiResponse<{
    status: 'healthy' | 'warning' | 'critical';
    services: Array<{
      name: string;
      status: 'up' | 'down' | 'degraded';
      response_time: number;
      last_check: string;
    }>;
    alerts: Array<{
      level: 'info' | 'warning' | 'error' | 'critical';
      message: string;
      timestamp: string;
      resolved: boolean;
    }>;
  }>> {
    return apiClient.get('/analytics/system/health');
  }

  // Content Analytics
  async getContentAnalytics(params?: {
    content_type?: 'note' | 'flashcard' | 'document';
    period_start?: string;
    period_end?: string;
  }): Promise<ApiResponse<ContentAnalytics[]>> {
    return apiClient.get('/analytics/content', params);
  }

  async getPopularContent(params?: {
    content_type?: 'note' | 'flashcard' | 'document';
    limit?: number;
    period_start?: string;
    period_end?: string;
  }): Promise<ApiResponse<Array<{
    id: string;
    title: string;
    type: string;
    views: number;
    shares: number;
    likes: number;
    created_at: string;
  }>>> {
    return apiClient.get('/analytics/content/popular', params);
  }

  async getContentTrends(params?: {
    content_type?: 'note' | 'flashcard' | 'document';
    period_start?: string;
    period_end?: string;
    granularity?: 'day' | 'week' | 'month';
  }): Promise<ApiResponse<Array<{
    date: string;
    created: number;
    updated: number;
    deleted: number;
    views: number;
  }>>> {
    return apiClient.get('/analytics/content/trends', params);
  }

  // Search Analytics
  async getSearchAnalytics(params?: {
    period_start?: string;
    period_end?: string;
    query?: string;
  }): Promise<ApiResponse<SearchAnalytics[]>> {
    return apiClient.get('/analytics/search', params);
  }

  async getPopularSearchQueries(params?: {
    limit?: number;
    period_start?: string;
    period_end?: string;
  }): Promise<ApiResponse<Array<{
    query: string;
    count: number;
    avg_results: number;
    click_rate: number;
  }>>> {
    return apiClient.get('/analytics/search/popular', params);
  }

  async getSearchPerformance(params?: {
    period_start?: string;
    period_end?: string;
  }): Promise<ApiResponse<{
    avg_response_time: number;
    success_rate: number;
    zero_results_rate: number;
    click_through_rate: number;
  }>> {
    return apiClient.get('/analytics/search/performance', params);
  }

  // AI Usage Analytics
  async getAIUsageOverview(params?: {
    period_start?: string;
    period_end?: string;
    feature?: string;
  }): Promise<ApiResponse<{
    total_requests: number;
    total_tokens: number;
    total_cost: number;
    avg_response_time: number;
    error_rate: number;
    satisfaction_score: number;
    top_features: Array<{
      feature: string;
      usage: number;
      cost: number;
    }>;
  }>> {
    return apiClient.get('/analytics/ai/overview', params);
  }

  async getAIUsageByFeature(params?: {
    period_start?: string;
    period_end?: string;
  }): Promise<ApiResponse<Array<{
    feature: string;
    usage_count: number;
    tokens_used: number;
    cost: number;
    avg_response_time: number;
    satisfaction_score: number;
  }>>> {
    return apiClient.get('/analytics/ai/by-feature', params);
  }

  async getAIUsageTrends(params?: {
    period_start?: string;
    period_end?: string;
    granularity?: 'hour' | 'day' | 'week';
  }): Promise<ApiResponse<Array<{
    timestamp: string;
    requests: number;
    tokens: number;
    cost: number;
    response_time: number;
  }>>> {
    return apiClient.get('/analytics/ai/trends', params);
  }

  // Custom Reports
  async getReports(params?: {
    created_by?: string;
    is_public?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<{ reports: CustomReport[]; total: number }>> {
    return apiClient.get('/analytics/reports', params);
  }

  async getReport(reportId: string): Promise<ApiResponse<CustomReport>> {
    return apiClient.get(`/analytics/reports/${reportId}`);
  }

  async createReport(data: {
    name: string;
    description: string;
    query: string;
    filters: Record<string, any>;
    visualization_type: 'table' | 'chart' | 'graph';
    is_public?: boolean;
  }): Promise<ApiResponse<CustomReport>> {
    return apiClient.post('/analytics/reports', data);
  }

  async updateReport(reportId: string, data: Partial<CustomReport>): Promise<ApiResponse<CustomReport>> {
    return apiClient.put(`/analytics/reports/${reportId}`, data);
  }

  async deleteReport(reportId: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/analytics/reports/${reportId}`);
  }

  async runReport(reportId: string, params?: {
    period_start?: string;
    period_end?: string;
    filters?: Record<string, any>;
  }): Promise<ApiResponse<{
    data: any[];
    generated_at: string;
    execution_time: number;
  }>> {
    return apiClient.post(`/analytics/reports/${reportId}/run`, params);
  }

  // Real-time Analytics
  async getRealTimeMetrics(metrics?: string[]): Promise<ApiResponse<{
    timestamp: string;
    active_users: number;
    api_requests_per_second: number;
    cpu_usage: number;
    memory_usage: number;
    error_rate: number;
    response_time_p95: number;
  }>> {
    return apiClient.get('/analytics/realtime', { metrics });
  }

  // Export Analytics
  async exportAnalytics(config: {
    data_types: string[];
    period: {
      start: string;
      end: string;
    };
    format: 'csv' | 'json' | 'excel';
    filters?: Record<string, any>;
  }): Promise<ApiResponse<{ export_id: string; download_url?: string }>> {
    return apiClient.post('/analytics/export', config);
  }

  async getExportStatus(exportId: string): Promise<ApiResponse<{
    id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    download_url?: string;
    error_message?: string;
    created_at: string;
    completed_at?: string;
  }>> {
    return apiClient.get(`/analytics/exports/${exportId}`);
  }
}

export const analyticsAPI = new AnalyticsAPI();
