import axios from 'axios';

interface SummaryRequest {
  text: string;
  max_length?: number;
  min_length?: number;
  do_sample?: boolean;
}

export const aiService = {
  /**
   * Generate a summary of the provided text using AI
   */
  async summarize(text: string, options: Omit<SummaryRequest, 'text'> = {}): Promise<string> {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/ai/summarize`,
        {
          text,
          max_length: 150,
          min_length: 50,
          do_sample: true,
          ...options,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.summary || response.data;
    } catch (error) {
      console.error('Error generating summary:', error);
      throw new Error('Failed to generate summary');
    }
  },

  /**
   * Generate questions based on the provided text
   */
  async generateQuestions(text: string, count: number = 3): Promise<string[]> {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/ai/generate-questions`,
        {
          text,
          count,
        }
      );

      return response.data.questions || [];
    } catch (error) {
      console.error('Error generating questions:', error);
      return [];
    }
  },

  /**
   * Extract key points from the provided text
   */
  async extractKeyPoints(text: string, count: number = 5): Promise<string[]> {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/ai/extract-key-points`,
        {
          text,
          count,
        }
      );

      return response.data.keyPoints || [];
    } catch (error) {
      console.error('Error extracting key points:', error);
      return [];
    }
  },
};
