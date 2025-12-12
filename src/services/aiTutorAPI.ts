// API service for AI Tutor functionality

const API_BASE_URL = 'http://localhost:8000/api/v1';

export interface TutoringSession {
  id: string;
  persona: string;
  subject: string;
  topic: string;
  difficulty: string;
  learning_style: string;
  created_at: string;
  last_activity: string;
  message_count: number;
  is_active: boolean;
}

export interface TutorMessage {
  id: string;
  session_id: string;
  role: string;
  content: string;
  timestamp: string;
  message_type: string;
}

export interface TutorPersona {
  name: string;
  description: string;
  style: string;
}

export interface StudyPlanRequest {
  subject: string;
  goals: string[];
  duration_weeks: number;
  difficulty: string;
  learning_style?: string;
}

export interface StudyPlan {
  id: string;
  subject: string;
  goals: string[];
  duration_weeks: number;
  difficulty: string;
  learning_style: string;
  weekly_topics: string[];
  created_at: string;
}

class AITutorAPI {
  // Session Management
  async createSession(data: {
    persona?: string;
    subject: string;
    topic: string;
    difficulty?: string;
    learning_style?: string;
  }): Promise<TutoringSession> {
    const response = await fetch(`${API_BASE_URL}/ai-tutor/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        persona: data.persona || 'general',
        subject: data.subject,
        topic: data.topic,
        difficulty: data.difficulty || 'medium',
        learning_style: data.learning_style || 'visual'
      })
    });

    if (!response.ok) {
      throw new Error('Failed to create tutoring session');
    }

    return response.json();
  }

  async getSessions(): Promise<TutoringSession[]> {
    const response = await fetch(`${API_BASE_URL}/ai-tutor/sessions`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch sessions');
    }

    return response.json();
  }

  async getSession(sessionId: string): Promise<TutoringSession> {
    const response = await fetch(`${API_BASE_URL}/ai-tutor/sessions/${sessionId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch session');
    }

    return response.json();
  }

  async deleteSession(sessionId: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/ai-tutor/sessions/${sessionId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Failed to delete session');
    }

    return response.json();
  }

  // Message Management
  async sendMessage(sessionId: string, content: string, messageType: string = 'text'): Promise<{ message: string; ai_response: string }> {
    const response = await fetch(`${API_BASE_URL}/ai-tutor/sessions/${sessionId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_id: sessionId,
        content,
        message_type: messageType
      })
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    return response.json();
  }

  async getSessionMessages(sessionId: string): Promise<TutorMessage[]> {
    const response = await fetch(`${API_BASE_URL}/ai-tutor/sessions/${sessionId}/messages`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch session messages');
    }

    return response.json();
  }

  // Study Plans
  async createStudyPlan(data: StudyPlanRequest): Promise<StudyPlan> {
    const response = await fetch(`${API_BASE_URL}/ai-tutor/study-plans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to create study plan');
    }

    return response.json();
  }

  // Personas
  async getPersonas(): Promise<Record<string, TutorPersona>> {
    const response = await fetch(`${API_BASE_URL}/ai-tutor/personas`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch personas');
    }

    return response.json();
  }

  // AI Features (existing endpoints)
  async summarizeText(text: string, summaryLength: string = 'medium', focus?: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/ai/summarize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        summary_length: summaryLength,
        focus
      })
    });

    if (!response.ok) {
      throw new Error('Failed to summarize text');
    }

    return response.json();
  }

  async generateFlashcards(content: string, numCards: number = 5, difficulty: string = 'medium'): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/ai/flashcards/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        num_cards: numCards,
        difficulty
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate flashcards');
    }

    return response.json();
  }

  async getAIModels(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/ai/models`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch AI models');
    }

    return response.json();
  }

  async getAIConfig(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/ai/config`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch AI config');
    }

    return response.json();
  }
}

export const aiTutorAPI = new AITutorAPI();
