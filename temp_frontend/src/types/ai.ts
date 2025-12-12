export interface AICategory {
  id: string;
  name: string;
  description: string;
  confidence: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AITag {
  id: string;
  name: string;
  relevance: number;
  categoryId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AISummary {
  id?: string;
  content: string;
  keyPoints: string[];
  actionItems?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AINoteAnalysis {
  id: string;
  noteId: string;
  categories: AICategory[];
  tags: AITag[];
  summary: AISummary;
  relatedNotes?: string[];
  sentiment?: {
    score: number;
    label: 'positive' | 'negative' | 'neutral';
  };
  topics?: string[];
  entities?: {
    name: string;
    type: string;
    relevance: number;
  }[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface AISearchResult {
  noteId: string;
  title: string;
  content: string;
  relevance: number;
  highlights?: {
    field: string;
    value: string;
    score: number;
  }[];
}

export interface AISearchResponse {
  query: string;
  results: AISearchResult[];
  total: number;
  took: number;
  suggestions?: string[];
}

export interface AISuggestion {
  type: 'tag' | 'category' | 'action' | 'content';
  value: string;
  confidence: number;
  metadata?: Record<string, any>;
}

export interface AINoteSuggestion {
  noteId: string;
  suggestions: AISuggestion[];
  createdAt: Date;
  updatedAt: Date;
}
