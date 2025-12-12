declare module '../services/apiService' {
  export interface Session {
    id: string;
    title: string;
    created_at: string;
    updated_at: string;
    // Add other session properties as needed
  }

  export interface DiagramData {
    id: string;
    session_id: string;
    diagram_data: string;
    diagram_type: string;
    created_at: string;
    updated_at: string;
  }

  export interface ApiService {
    getSessions(): Promise<Session[]>;
    getSession(sessionId: string): Promise<Session>;
    createSession(data: { title: string }): Promise<Session>;
    saveDiagram(params: {
      session_id: string;
      diagram_data: string;
      diagram_type: string;
    }): Promise<DiagramData>;
    getDiagrams(sessionId: string): Promise<DiagramData[]>;
    // Add other methods as needed
  }

  const apiService: ApiService;
  export default apiService;
}
