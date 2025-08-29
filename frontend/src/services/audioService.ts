import axios from 'axios';

const API_BASE_URL = '/api/audio';

export interface AudioTranscription {
  text: string;
  language: string;
  duration?: number;
}

export interface AudioNote {
  id: string;
  title: string;
  url: string;
  transcription?: string;
  duration: number;
  createdAt: string;
  updatedAt: string;
}

export interface SearchOptions {
  query?: string;
  startDate?: string;
  endDate?: string;
  language?: string;
  limit?: number;
  offset?: number;
  page?: number;
  pageSize?: number;
}

class AudioService {
  // Convert text to speech
  async textToSpeech(text: string, lang: string = 'en'): Promise<Blob> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/tts`,
        { text, lang },
        { responseType: 'blob' }
      );
      return response.data;
    } catch (error) {
      console.error('Error in textToSpeech:', error);
      throw new Error('Failed to convert text to speech');
    }
  }

  // Transcribe audio
  async transcribe(audioBlob: Blob): Promise<AudioTranscription> {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');
    
    const response = await axios.post<AudioTranscription>(
      `${API_BASE_URL}/transcribe`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    
    return response.data;
  }

  // Save audio note
  async saveNote(audioBlob: Blob, title: string): Promise<{ id: string; url: string }> {
    const formData = new FormData();
    formData.append('audio', audioBlob, `${title}.wav`);
    formData.append('title', title);
    
    const response = await axios.post<{ id: string; url: string }>(
      `${API_BASE_URL}/notes`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    
    return response.data;
  }

  // Get all audio notes with optional search and pagination parameters
  async getNotes(searchOptions: SearchOptions = {}): Promise<{ 
    notes: AudioNote[]; 
    total: number;
    hasMore: boolean;
  }> {
    // Handle both page/pageSize and offset/limit styles
    const params: Record<string, any> = { ...searchOptions };
    
    // If page/pageSize is provided, calculate offset/limit
    if (searchOptions.page !== undefined && searchOptions.pageSize !== undefined) {
      params['offset'] = (searchOptions.page - 1) * searchOptions.pageSize;
      params['limit'] = searchOptions.pageSize;
      // Remove page/pageSize from params to avoid duplicate parameters
      delete params['page'];
      delete params['pageSize'];
    }
    
    const response = await axios.get<{ 
      notes: AudioNote[];
      total: number;
      hasMore: boolean;
    }>(
      `${API_BASE_URL}/notes`,
      { params }
    );
    
    return response.data;
  }

  // Delete a note by ID
  async deleteNote(noteId: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/notes/${noteId}`);
  }

  // Search transcribed notes
  async searchNotes(query: string, options: Omit<SearchOptions, 'query'> = {}): Promise<{
    results: Array<{
      note: AudioNote;
      highlights: string[];
      score: number;
    }>;
    total: number;
  }> {
    const response = await axios.get<{
      results: Array<{
        note: AudioNote;
        highlights: string[];
        score: number;
      }>;
      total: number;
    }>(
      `${API_BASE_URL}/notes/search`,
      { 
        params: { 
          q: query,
          ...options 
        } 
      }
    );
    return response.data;
  }
}

export const audioService = new AudioService();
