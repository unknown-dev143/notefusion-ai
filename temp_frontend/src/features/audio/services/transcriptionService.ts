import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { message } from 'antd';

export interface TranscriptionSegment {
  start: number;
  end: number;
  text: string;
  no_speech_prob: number;
}

export interface TranscriptionResult {
  text: string;
  language: string;
  segments: TranscriptionSegment[];
}

class TranscriptionService {
  private api: AxiosInstance;
  private static instance: TranscriptionService;

  private constructor() {
    this.api = axios.create({
      baseURL: '/api/audio',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for auth
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  public static getInstance(): TranscriptionService {
    if (!TranscriptionService.instance) {
      TranscriptionService.instance = new TranscriptionService();
    }
    return TranscriptionService.instance;
  }

  /**
   * Transcribe an audio chunk
   * @param audioBlob Audio data as Blob
   * @param language Language code (e.g., 'en')
   */
  public async transcribeChunk(
    audioBlob: Blob,
    language: string = 'en'
  ): Promise<TranscriptionResult> {
    try {
      const formData = new FormData();
      formData.append('chunk', audioBlob, 'audio_chunk.wav');

      const response = await this.api.post<TranscriptionResult>(
        '/transcribe/chunk',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          params: { language },
        }
      );

      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to transcribe audio chunk');
      throw error;
    }
  }

  /**
   * Transcribe complete audio from multiple chunks
   * @param audioChunks Array of audio chunks as Blobs
   * @param language Language code (e.g., 'en')
   */
  public async transcribeComplete(
    audioChunks: Blob[],
    language: string = 'en'
  ): Promise<TranscriptionResult> {
    try {
      // First upload all chunks
      const uploadPromises = audioChunks.map((chunk, index) => 
        this.uploadAudioChunk(chunk, `chunk_${index}.wav`)
      );
      
      const chunkPaths = await Promise.all(uploadPromises);
      
      // Then transcribe all chunks as a single audio stream
      const response = await this.api.post<{ transcription: TranscriptionResult }>(
        '/transcribe/chunks/complete',
        { chunk_paths: chunkPaths },
        { params: { language } }
      );

      return response.data.transcription;
    } catch (error) {
      this.handleError(error, 'Failed to transcribe complete audio');
      throw error;
    }
  }

  /**
   * Upload an audio chunk to the server
   * @param audioBlob Audio data as Blob
   * @param filename Name for the uploaded file
   */
  private async uploadAudioChunk(
    audioBlob: Blob,
    filename: string
  ): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, filename);

      const response = await this.api.post<{ file_path: string }>(
        '/recordings/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data.file_path;
    } catch (error) {
      this.handleError(error, 'Failed to upload audio chunk');
      throw error;
    }
  }

  /**
   * Handle API errors
   */
  private handleError(error: unknown, defaultMessage: string): void {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ detail?: string }>;
      const errorMessage = 
        axiosError.response?.data?.detail || 
        axiosError.message || 
        defaultMessage;
      
      message.error(errorMessage);
      
      // Handle specific error codes
      if (axiosError.response?.status === 401) {
        // Handle unauthorized error (e.g., redirect to login)
        // You might want to implement your auth logic here
        console.error('Authentication required');
      }
    } else if (error instanceof Error) {
      message.error(error.message || defaultMessage);
    } else {
      message.error(defaultMessage);
    }
    
    console.error('Transcription error:', error);
  }
}

export const transcriptionService = TranscriptionService.getInstance();
