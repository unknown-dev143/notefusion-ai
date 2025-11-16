import axios from 'axios';

const API_BASE_URL = '/api/audio';

export interface TTSRequest {
  text: string;
  voice?: string;
  rate?: number;
  pitch?: number;
}

export interface TTSResponse {
  audioUrl: string;
  duration: number;
  format: string;
}

export interface STTRequest {
  audio: Blob;
  language: string;
}

export interface STTResponse {
  text: string;
  isFinal: boolean;
  confidence: number;
}

export const audioService = {
  // Text-to-Speech
  async convertTextToSpeech(request: TTSRequest): Promise<TTSResponse> {
    const response = await axios.post(`${API_BASE_URL}/tts`, request);
    return response.data;
  },

  // Speech-to-Text
  async convertSpeechToText(audioBlob: Blob, language: string): Promise<STTResponse> {
    const formData = new FormData();
    formData.append('audio', audioBlob);
    formData.append('language', language);
    
    const response = await axios.post(`${API_BASE_URL}/stt`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  // Save transcript
  async saveTranscript(transcript: string, metadata: Record<string, any> = {}): Promise<void> {
    await axios.post(`${API_BASE_URL}/transcripts`, {
      text: transcript,
      metadata,
    });
  },

  // Get available voices
  async getAvailableVoices(): Promise<Array<{ id: string; name: string; language: string }>> {
    const response = await axios.get(`${API_BASE_URL}/voices`);
    return response.data;
  },

  // Get supported languages
  async getSupportedLanguages(): Promise<Array<{ code: string; name: string }>> {
    const response = await axios.get(`${API_BASE_URL}/languages`);
    return response.data;
  },
};
