import { apiClient, ApiResponse } from './apiClient';

export interface AudioJob {
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
  processing_options: AudioProcessingOptions;
  output_files: AudioOutput[];
  metadata: AudioMetadata;
}

export interface AudioProcessingOptions {
  transcription: {
    generate: boolean;
    language: string;
    include_timestamps: boolean;
    speaker_diarization: boolean;
    sentiment_analysis: boolean;
  };
  summary: {
    generate: boolean;
    length: 'short' | 'medium' | 'long';
    format: 'paragraph' | 'bullets' | 'key_points';
  };
  enhancement: {
    noise_reduction: boolean;
    volume_normalization: boolean;
    echo_cancellation: boolean;
  };
  format_conversion: {
    target_format: 'mp3' | 'wav' | 'm4a' | 'flac';
    quality: number;
  };
}

export interface AudioOutput {
  type: 'transcript' | 'summary' | 'enhanced' | 'converted';
  file_path: string;
  file_size: number;
  duration?: number;
  format?: string;
}

export interface AudioMetadata {
  duration: number;
  file_size: number;
  sample_rate: number;
  bit_rate: number;
  channels: number;
  format: string;
  codec: string;
}

export interface AudioTranscript {
  id: string;
  audio_job_id: string;
  language: string;
  speakers: number;
  segments: Array<{
    start_time: number;
    end_time: number;
    text: string;
    confidence: number;
    speaker?: number;
    sentiment?: 'positive' | 'negative' | 'neutral';
  }>;
  full_text: string;
  summary?: string;
  key_points?: string[];
  created_at: string;
}

export interface AudioNote {
  id: string;
  audio_job_id: string;
  title: string;
  content: string;
  summary: string;
  key_points: string[];
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface AudioAnalytics {
  id: string;
  audio_job_id: string;
  total_words: number;
  speaking_rate: number;
  silence_percentage: number;
  speaker_distribution: Array<{
    speaker: number;
    duration: number;
    word_count: number;
    percentage: number;
  }>;
  sentiment_distribution: Record<string, number>;
  topics: Array<{
    topic: string;
    confidence: number;
    timestamps: Array<{
      start: number;
      end: number;
    }>;
  }>;
  created_at: string;
}

class AudioAPI {
  async uploadAudio(file: File, options?: Partial<AudioProcessingOptions>): Promise<ApiResponse<AudioJob>> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (options) {
      formData.append('options', JSON.stringify(options));
    }

    const response = await fetch(`${apiClient['baseURL']}/audio/upload`, {
      method: 'POST',
      headers: apiClient.getAuthHeaders(),
      body: formData,
    });

    return apiClient.handleResponse<AudioJob>(response);
  }

  async getAudioJobs(params?: {
    status?: 'pending' | 'processing' | 'completed' | 'failed';
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ jobs: AudioJob[]; total: number; page: number }>> {
    return apiClient.get('/audio/jobs', params);
  }

  async getAudioJob(jobId: string): Promise<ApiResponse<AudioJob>> {
    return apiClient.get(`/audio/jobs/${jobId}`);
  }

  async deleteAudioJob(jobId: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/audio/jobs/${jobId}`);
  }

  async retryAudioJob(jobId: string): Promise<ApiResponse<AudioJob>> {
    return apiClient.post(`/audio/jobs/${jobId}/retry`);
  }

  async cancelAudioJob(jobId: string): Promise<ApiResponse<void>> {
    return apiClient.post(`/audio/jobs/${jobId}/cancel`);
  }

  async getAudioProgress(jobId: string): Promise<ApiResponse<{ progress: number; status: string; message?: string }>> {
    return apiClient.get(`/audio/jobs/${jobId}/progress`);
  }

  // Transcription
  async getAudioTranscript(jobId: string): Promise<ApiResponse<AudioTranscript>> {
    return apiClient.get(`/audio/jobs/${jobId}/transcript`);
  }

  async generateTranscript(jobId: string, options: AudioProcessingOptions['transcription']): Promise<ApiResponse<AudioTranscript>> {
    return apiClient.post(`/audio/jobs/${jobId}/transcribe`, options);
  }

  async updateTranscript(transcriptId: string, segments: Array<{
    start_time: number;
    end_time: number;
    text: string;
  }>): Promise<ApiResponse<AudioTranscript>> {
    return apiClient.put(`/audio/transcripts/${transcriptId}`, { segments });
  }

  async exportTranscript(transcriptId: string, format: 'srt' | 'vtt' | 'txt' | 'json' | 'docx'): Promise<ApiResponse<{ download_url: string }>> {
    return apiClient.get(`/audio/transcripts/${transcriptId}/export`, { format });
  }

  // Notes generation
  async generateNote(jobId: string, options: {
    title?: string;
    format: 'markdown' | 'plain' | 'structured';
    include_summary?: boolean;
    include_key_points?: boolean;
    include_tags?: boolean;
  }): Promise<ApiResponse<AudioNote>> {
    return apiClient.post(`/audio/jobs/${jobId}/notes`, options);
  }

  async getAudioNotes(params?: {
    job_id?: string;
    date_from?: string;
    date_to?: string;
    tags?: string[];
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ notes: AudioNote[]; total: number; page: number }>> {
    return apiClient.get('/audio/notes', params);
  }

  async getAudioNote(noteId: string): Promise<ApiResponse<AudioNote>> {
    return apiClient.get(`/audio/notes/${noteId}`);
  }

  async updateAudioNote(noteId: string, data: {
    title?: string;
    content?: string;
    summary?: string;
    key_points?: string[];
    tags?: string[];
  }): Promise<ApiResponse<AudioNote>> {
    return apiClient.put(`/audio/notes/${noteId}`, data);
  }

  async deleteAudioNote(noteId: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/audio/notes/${noteId}`);
  }

  async exportNote(noteId: string, format: 'pdf' | 'docx' | 'md' | 'txt'): Promise<ApiResponse<{ download_url: string }>> {
    return apiClient.get(`/audio/notes/${noteId}/export`, { format });
  }

  // Analytics
  async getAudioAnalytics(jobId: string): Promise<ApiResponse<AudioAnalytics>> {
    return apiClient.get(`/audio/jobs/${jobId}/analytics`);
  }

  async generateAnalytics(jobId: string): Promise<ApiResponse<AudioAnalytics>> {
    return apiClient.post(`/audio/jobs/${jobId}/analytics`);
  }

  async getAllAnalytics(params?: {
    date_from?: string;
    date_to?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ analytics: AudioAnalytics[]; total: number; page: number }>> {
    return apiClient.get('/audio/analytics', params);
  }

  // Audio enhancement
  async enhanceAudio(jobId: string, options: AudioProcessingOptions['enhancement']): Promise<ApiResponse<AudioJob>> {
    return apiClient.post(`/audio/jobs/${jobId}/enhance`, options);
  }

  async downloadEnhancedAudio(jobId: string): Promise<ApiResponse<{ download_url: string }>> {
    return apiClient.get(`/audio/jobs/${jobId}/download`);
  }

  // Format conversion
  async convertAudio(jobId: string, options: AudioProcessingOptions['format_conversion']): Promise<ApiResponse<AudioJob>> {
    return apiClient.post(`/audio/jobs/${jobId}/convert`, options);
  }

  async downloadConvertedAudio(jobId: string): Promise<ApiResponse<{ download_url: string }>> {
    return apiClient.get(`/audio/jobs/${jobId}/download`);
  }

  // Batch operations
  async batchUpload(files: File[], options?: Partial<AudioProcessingOptions>): Promise<ApiResponse<{ jobs: AudioJob[]; errors: string[] }>> {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`file_${index}`, file);
    });
    
    if (options) {
      formData.append('options', JSON.stringify(options));
    }

    const response = await fetch(`${apiClient['baseURL']}/audio/batch-upload`, {
      method: 'POST',
      headers: apiClient.getAuthHeaders(),
      body: formData,
    });

    return apiClient.handleResponse<{ jobs: AudioJob[]; errors: string[] }>(response);
  }

  async batchDelete(jobIds: string[]): Promise<ApiResponse<void>> {
    return apiClient.post('/audio/batch-delete', { job_ids: jobIds });
  }

  // Statistics
  async getAudioStats(params?: {
    date_from?: string;
    date_to?: string;
  }): Promise<ApiResponse<{
    total_recordings: number;
    total_duration: number;
    total_file_size: number;
    processing_status: Record<string, number>;
    popular_formats: Record<string, number>;
    average_processing_time: number;
    storage_usage: number;
    transcription_accuracy: number;
    language_distribution: Record<string, number>;
  }>> {
    return apiClient.get('/audio/stats', params);
  }

  // Search and filtering
  async searchAudio(params: {
    query?: string;
    status?: 'pending' | 'processing' | 'completed' | 'failed';
    date_from?: string;
    date_to?: string;
    min_duration?: number;
    max_duration?: number;
    format?: string;
    language?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ jobs: AudioJob[]; total: number; page: number }>> {
    return apiClient.get('/audio/search', params);
  }

  // Sharing
  async shareAudio(jobId: string, emails: string[], permissions: 'view' | 'download' = 'view'): Promise<ApiResponse<void>> {
    return apiClient.post(`/audio/jobs/${jobId}/share`, { emails, permissions });
  }

  async getSharedAudio(): Promise<ApiResponse<{ jobs: AudioJob[]; total: number }>> {
    return apiClient.get('/audio/shared');
  }

  // Templates
  async getProcessingTemplates(): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    description: string;
    options: AudioProcessingOptions;
  }>>> {
    return apiClient.get('/audio/templates');
  }

  async createProcessingTemplate(name: string, description: string, options: AudioProcessingOptions): Promise<ApiResponse<any>> {
    return apiClient.post('/audio/templates', { name, description, options });
  }

  async applyTemplate(jobId: string, templateId: string): Promise<ApiResponse<AudioJob>> {
    return apiClient.post(`/audio/jobs/${jobId}/apply-template`, { template_id: templateId });
  }

  // Voice recording
  async startRecording(): Promise<ApiResponse<{ recording_id: string; websocket_url: string }>> {
    return apiClient.post('/audio/recording/start');
  }

  async stopRecording(recordingId: string): Promise<ApiResponse<AudioJob>> {
    return apiClient.post(`/audio/recording/${recordingId}/stop`);
  }

  async getRecordingStatus(recordingId: string): Promise<ApiResponse<{ status: string; duration: number }>> {
    return apiClient.get(`/audio/recording/${recordingId}/status`);
  }
}

export const audioAPI = new AudioAPI();
