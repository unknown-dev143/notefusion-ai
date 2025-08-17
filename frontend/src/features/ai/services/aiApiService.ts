import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_AI_API_URL || '/api/ai';

export const getAIResponse = async (prompt: string, options = {}) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/analyze`,
      { prompt, ...options },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('AI API Error:', error);
    throw error;
  }
};

export const generateEmbedding = async (text: string): Promise<number[]> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/embeddings`,
      { text },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    return response.data.embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
};

export const getSemanticSimilarity = async (text1: string, text2: string): Promise<number> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/similarity`,
      { text1, text2 },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    return response.data.similarity;
  } catch (error) {
    console.error('Error calculating semantic similarity:', error);
    throw error;
  }
};
