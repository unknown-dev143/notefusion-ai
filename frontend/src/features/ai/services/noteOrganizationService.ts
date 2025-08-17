import { Note } from '../../../types/note';
import { AICategory, AITag, AISummary } from '../../../types/ai';

interface AIAnalysisResponse {
  categories: AICategory[];
  tags: AITag[];
  summary: AISummary;
}

// Mock implementation - replace with actual API call
const mockAIResponse: AIAnalysisResponse = {
  categories: [
    { id: '1', name: 'Work', description: 'Work related notes', confidence: 0.9 },
    { id: '2', name: 'Personal', description: 'Personal notes', confidence: 0.8 },
  ],
  tags: [
    { id: '1', name: 'important', relevance: 0.9 },
    { id: '2', name: 'todo', relevance: 0.8 },
  ],
  summary: {
    content: 'This is a summary of the note content.',
    keyPoints: [
      'Key point 1',
      'Key point 2',
      'Key takeaway 3',
    ],
    actionItems: [
      'Follow up on task 1',
      'Review document by Friday',
    ],
  },
};

// Mock API call - replace with actual implementation
const getAIResponse = async (prompt: string): Promise<AIAnalysisResponse> => {
  console.log('AI Prompt:', prompt);
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  return mockAIResponse;
};

export const analyzeNoteContent = async (content: string): Promise<AIAnalysisResponse> => {
  try {
    const prompt = `Analyze the following note content and provide:
    1. Main categories (up to 3)
    2. Relevant tags (5-10)
    3. A concise summary with key points
    
    Content: ${content.substring(0, 2000)}`;

    const response = await getAIResponse(prompt);
    
    // Parse the AI response into structured data
    // This is a simplified example - you'd need to adjust based on your AI's response format
    return {
      categories: response.categories || [],
      tags: response.tags || [],
      summary: {
        content: response.summary.content || '',
        keyPoints: response.summary.keyPoints || [],
        actionItems: response.summary.actionItems || []
      }
    };
  } catch (error) {
    console.error('Error analyzing note content:', error);
    return {
      categories: [],
      tags: [],
      summary: { 
        content: 'Failed to generate summary',
        keyPoints: []
      }
    };
  }
};

export const suggestRelatedNotes = async (currentNote: Note, allNotes: Note[]): Promise<Note[]> => {
  try {
    if (!currentNote || !allNotes?.length) return [];
    
    // Simple implementation: find notes with similar tags or content
    const currentTags = new Set<string>(currentNote.tags || []);
    
    return allNotes
      .filter(note => note.id !== currentNote.id) // Exclude current note
      .map(note => ({
        ...note,
        similarity: calculateSimilarity(currentNote, note, currentTags)
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5) // Return top 5 related notes
      .map(({ similarity, ...note }) => note as Note);
  } catch (error) {
    console.error('Error finding related notes:', error);
    return [];
  }
};

// Helper function to calculate similarity between notes
const calculateSimilarity = (note1: Note, note2: Note, note1Tags: Set<string>): number => {
  if (!note2.tags?.length) return 0;
  
  // Calculate tag similarity
  const commonTags = note2.tags.filter((tag: string) => note1Tags.has(tag)).length;
  const tagScore = (commonTags / Math.max(note1Tags.size, note2.tags.length)) * 0.6;
  
  // Simple content similarity (for demo purposes)
  const contentScore = note1.content && note2.content
    ? (note2.content.toLowerCase().includes(note1.content.toLowerCase().substring(0, 20)) ? 0.4 : 0)
    : 0;
    
  return tagScore + contentScore;
};
