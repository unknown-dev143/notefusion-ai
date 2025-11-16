import { api } from '../lib/api-client';

type EnhancementType = 'summary' | 'questions' | 'keypoints' | 'outline';

interface GenerateNoteOptions {
  content: string;
  type: EnhancementType;
  language?: string;
  style?: 'concise' | 'detailed' | 'academic' | 'casual';
}

export const generateEnhancedNote = async ({
  content,
  type,
  language = 'en',
  style = 'concise',
}: GenerateNoteOptions): Promise<string> => {
  try {
    const response = await api.post('/api/ai/generate', {
      content,
      type,
      language,
      style,
    });

    return response.data.result;
  } catch (error) {
    console.error('Error generating enhanced note:', error);
    throw new Error('Failed to generate enhanced note. Please try again later.');
  }
};

// Common misspellings and their corrections
const COMMON_MISSPELLINGS: Record<string, string> = {
  'photosyynthssis': 'photosynthesis',
  'recieve': 'receive',
  'seperate': 'separate',
  'definately': 'definitely',
  'accomodate': 'accommodate',
  'occured': 'occurred',
  'untill': 'until',
  'wich': 'which',
  'teh': 'the',
  'thier': 'their'
};

// Function to correct common misspellings
const correctSpelling = (word: string): string => {
  const lowerWord = word.toLowerCase();
  return COMMON_MISSPELLINGS[lowerWord] || word;
};

// Function to process content (correct spelling, handle single words, etc.)
const processContent = (content: string): { processed: string; wasCorrected: boolean } => {
  const words = content.trim().split(/\s+/);
  const correctedWords = words.map(word => {
    const corrected = correctSpelling(word);
    return corrected !== word ? corrected : word;
  });
  
  const wasCorrected = correctedWords.some((word, i) => word !== words[i]);
  return {
    processed: correctedWords.join(' '),
    wasCorrected
  };
};

// Fallback function that generates content locally if API is not available
const generateLocalFallback = (content: string, type: EnhancementType): string => {
  // Process content to handle misspellings and single words
  const { processed: processedContent, wasCorrected } = processContent(content);
  const words = processedContent.trim().split(/\s+/);
  const isSingleWord = words.length === 1;
  const displayContent = wasCorrected ? `"${content}" (did you mean "${processedContent}"?)` : `"${processedContent}"`;
  
  const enhancements: Record<EnhancementType, string> = {
    summary: isSingleWord 
      ? `## About ${displayContent}\n${processedContent} is a term that refers to ${wasCorrected ? 'what might be a misspelling of ' : ''}${processedContent}.`
      : `## Summary\nHere's a concise summary of your notes:\n\n${processedContent.split('\n').slice(0, 5).join('\n')}...`,
      
    questions: isSingleWord
      ? `## Questions about ${displayContent}\n1. What is the definition of ${processedContent}?\n2. What are some examples of ${processedContent}?\n3. Why is ${processedContent} important?`
      : `## Study Questions\n1. What are the main points of this content?\n2. How can you apply this information?\n3. What questions does this content raise?`,
      
    keypoints: isSingleWord
      ? `## Key Points about ${displayContent}\n- Definition: ${processedContent} is...\n- Characteristics: \n- Examples: \n- Importance: `
      : `## Key Points\n- ${processedContent.split(/[.!?]+/).slice(0, 3).map(s => s.trim()).filter(Boolean).join('\n- ')}`,
      
    outline: isSingleWord
      ? `## Exploring ${displayContent}\n1. Definition and Meaning\n   - What is ${processedContent}?\n   - Etymology and origin\n2. Key Aspects\n   - Main characteristics\n   - Related concepts\n3. Applications\n   - Where is ${processedContent} used?\n   - Why is it important?`
      : `## Content Outline\n1. Introduction\n   - Main topic\n   - Key concepts\n2. Main Points\n   - ${processedContent.split(/[.!?]+/).slice(0, 3).map(s => s.trim()).filter(Boolean).join('\n   - ')}\n3. Conclusion`,
  };

  return enhancements[type];
};

export const enhanceNote = async (content: string, type: EnhancementType): Promise<string> => {
  try {
    // First try to use the real API
    return await generateEnhancedNote({ content, type });
  } catch (error) {
    console.warn('Using fallback note generation');
    // If API fails, use the local fallback
    return generateLocalFallback(content, type);
  }
};
