import { apiClient, ApiResponse } from './apiClient';

export interface VideoJob {
  id: string;
  user_id: string;
  original_filename: string;
  file_path: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  error_message?: string;
  processing_options: VideoProcessingOptions;
  output_files: VideoOutput[];
  metadata: VideoMetadata;
}

export interface VideoProcessingOptions {
  compression: {
    quality: number;
    resolution: 'original' | '720p' | '480p' | '360p';
    format: 'mp4' | 'webm' | 'avi';
    frame_rate: number;
    bitrate: number;
  };
  thumbnails: {
    generate: boolean;
    count: number;
    format: 'jpg' | 'png';
  };
  transcription: {
    generate: boolean;
    language: string;
    include_timestamps: boolean;
  };
  analytics: {
    generate: boolean;
  };
}

export interface VideoOutput {
  type: 'compressed' | 'thumbnail' | 'transcript' | 'analytics';
  file_path: string;
  file_size: number;
  duration?: number;
  format?: string;
}

export interface VideoMetadata {
  duration: number;
  file_size: number;
  resolution: string;
  frame_rate: number;
  bitrate: number;
  codec: string;
  format: string;
}

export interface VideoUploadRequest {
  file: File;
  options?: Partial<VideoProcessingOptions>;
}

export interface VideoAnalytics {
  id: string;
  video_job_id: string;
  views: number;
  unique_viewers: number;
  avg_watch_time: number;
  completion_rate: number;
  engagement: number;
  likes: number;
  comments: number;
  shares: number;
  drop_off_points: Array<{
    timestamp: number;
    percentage: number;
  }>;
  created_at: string;
}

export interface VideoThumbnail {
  id: string;
  video_job_id: string;
  timestamp: number;
  file_path: string;
  file_size: number;
  width: number;
  height: number;
}

export interface VideoTranscript {
  id: string;
  video_job_id: string;
  language: string;
  segments: Array<{
    start_time: number;
    end_time: number;
    text: string;
    confidence: number;
  }>;
  full_text: string;
  created_at: string;
}

class VideoAPI {
  async uploadVideo(file: File, options?: Partial<VideoProcessingOptions>): Promise<ApiResponse<VideoJob>> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (options) {
      formData.append('options', JSON.stringify(options));
    }

    const response = await fetch(`${apiClient['baseURL']}/video/upload`, {
      method: 'POST',
      headers: apiClient.getAuthHeaders(),
      body: formData,
    });

    return apiClient.handleResponse<VideoJob>(response);
  }

  async getVideoJobs(params?: {
    status?: 'pending' | 'processing' | 'completed' | 'failed';
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ jobs: VideoJob[]; total: number; page: number }>> {
    return apiClient.get('/video/jobs', params);
  }

  async getVideoJob(jobId: string): Promise<ApiResponse<VideoJob>> {
    return apiClient.get(`/video/jobs/${jobId}`);
  }

  async deleteVideoJob(jobId: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/video/jobs/${jobId}`);
  }

  async retryVideoJob(jobId: string): Promise<ApiResponse<VideoJob>> {
    return apiClient.post(`/video/jobs/${jobId}/retry`);
  }

  async cancelVideoJob(jobId: string): Promise<ApiResponse<void>> {
    return apiClient.post(`/video/jobs/${jobId}/cancel`);
  }

  async getVideoProgress(jobId: string): Promise<ApiResponse<{ progress: number; status: string; message?: string }>> {
    return apiClient.get(`/video/jobs/${jobId}/progress`);
  }

  // Thumbnails
  async getVideoThumbnails(jobId: string): Promise<ApiResponse<VideoThumbnail[]>> {
    return apiClient.get(`/video/jobs/${jobId}/thumbnails`);
  }

  async generateThumbnail(jobId: string, timestamp: number): Promise<ApiResponse<VideoThumbnail>> {
    return apiClient.post(`/video/jobs/${jobId}/thumbnails`, { timestamp });
  }

  async downloadThumbnail(thumbnailId: string): Promise<ApiResponse<{ download_url: string }>> {
    return apiClient.get(`/video/thumbnails/${thumbnailId}/download`);
  }

  // Transcription
  async getVideoTranscript(jobId: string): Promise<ApiResponse<VideoTranscript>> {
    return apiClient.get(`/video/jobs/${jobId}/transcript`);
  }

  async generateTranscript(jobId: string, language: string, includeTimestamps: boolean = true): Promise<ApiResponse<VideoTranscript>> {
    return apiClient.post(`/video/jobs/${jobId}/transcribe`, {
      language,
      include_timestamps: includeTimestamps,
    });
  }

  async updateTranscript(transcriptId: string, segments: Array<{
    start_time: number;
    end_time: number;
    text: string;
  }>): Promise<ApiResponse<VideoTranscript>> {
    return apiClient.put(`/video/transcripts/${transcriptId}`, { segments });
  }

  async exportTranscript(transcriptId: string, format: 'srt' | 'vtt' | 'txt' | 'json'): Promise<ApiResponse<{ download_url: string }>> {
    return apiClient.get(`/video/transcripts/${transcriptId}/export`, { format });
  }

  // Analytics
  async getVideoAnalytics(jobId: string): Promise<ApiResponse<VideoAnalytics>> {
    return apiClient.get(`/video/jobs/${jobId}/analytics`);
  }

  async generateAnalytics(jobId: string): Promise<ApiResponse<VideoAnalytics>> {
    return apiClient.post(`/video/jobs/${jobId}/analytics`);
  }

  async getAllAnalytics(params?: {
    date_from?: string;
    date_to?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ analytics: VideoAnalytics[]; total: number; page: number }>> {
    return apiClient.get('/video/analytics', params);
  }

  // Compression
  async compressVideo(jobId: string, options: VideoProcessingOptions['compression']): Promise<ApiResponse<VideoJob>> {
    return apiClient.post(`/video/jobs/${jobId}/compress`, options);
  }

  async downloadCompressedVideo(jobId: string): Promise<ApiResponse<{ download_url: string }>> {
    return apiClient.get(`/video/jobs/${jobId}/download`);
  }

  // Batch operations
  async batchUpload(files: File[], options?: Partial<VideoProcessingOptions>): Promise<ApiResponse<{ jobs: VideoJob[]; errors: string[] }>> {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`file_${index}`, file);
    });
    
    if (options) {
      formData.append('options', JSON.stringify(options));
    }

    const response = await fetch(`${apiClient['baseURL']}/video/batch-upload`, {
      method: 'POST',
      headers: apiClient.getAuthHeaders(),
      body: formData,
    });

    return apiClient.handleResponse<{ jobs: VideoJob[]; errors: string[] }>(response);
  }

  async batchDelete(jobIds: string[]): Promise<ApiResponse<void>> {
    return apiClient.post('/video/batch-delete', { job_ids: jobIds });
  }

  // Statistics
  async getVideoStats(params?: {
    date_from?: string;
    date_to?: string;
  }): Promise<ApiResponse<{
    total_videos: number;
    total_duration: number;
    total_file_size: number;
    processing_status: Record<string, number>;
    popular_formats: Record<string, number>;
    average_processing_time: number;
    storage_usage: number;
  }>> {
    return apiClient.get('/video/stats', params);
  }

  // Search and filtering
  async searchVideos(params: {
    query?: string;
    status?: 'pending' | 'processing' | 'completed' | 'failed';
    date_from?: string;
    date_to?: string;
    min_duration?: number;
    max_duration?: number;
    format?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ jobs: VideoJob[]; total: number; page: number }>> {
    return apiClient.get('/video/search', params);
  }

  // Sharing
  async shareVideo(jobId: string, emails: string[], permissions: 'view' | 'download' = 'view'): Promise<ApiResponse<void>> {
    return apiClient.post(`/video/jobs/${jobId}/share`, { emails, permissions });
  }

  async getSharedVideos(): Promise<ApiResponse<{ jobs: VideoJob[]; total: number }>> {
    return apiClient.get('/video/shared');
  }

  // Templates
  async getProcessingTemplates(): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    description: string;
    options: VideoProcessingOptions;
  }>>> {
    return apiClient.get('/video/templates');
  }

  async createProcessingTemplate(name: string, description: string, options: VideoProcessingOptions): Promise<ApiResponse<any>> {
    return apiClient.post('/video/templates', { name, description, options });
  }

  async applyTemplate(jobId: string, templateId: string): Promise<ApiResponse<VideoJob>> {
    return apiClient.post(`/video/jobs/${jobId}/apply-template`, { template_id: templateId });
  }
}

export const videoAPI = new VideoAPI();
