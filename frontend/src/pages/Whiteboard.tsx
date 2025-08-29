import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/apiService';
import { FiPlus, FiX, FiSave, FiDownload } from 'react-icons/fi';
import { Form, Button, message } from 'antd';
import html2canvas from 'html2canvas';

declare global {
  interface Window {
    saveToLocalStorage?: (data: string) => void;
  }
}

// Temporary type definitions
interface Session {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  session_id?: string; // Add session_id for backward compatibility
  diagram_data?: string; // Add diagram_data for backward compatibility
}

interface DiagramCanvasRef {
  getDiagramData: () => string;
  loadDiagramData: (data: string) => void;
}



interface SaveDiagramParams {
  sessionId: string;
  data: string;
  diagramType?: string;
}

const Whiteboard: React.FC = () => {
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [showNewNoteForm, setShowNewNoteForm] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [form] = Form.useForm();
  const canvasRef = useRef<DiagramCanvasRef>({
    getDiagramData: () => '',
    loadDiagramData: () => {}
  });
  const queryClient = useQueryClient();

  // Fetch sessions
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: async (): Promise<Session[]> => {
      const response = await apiService.getSessions();
      return response.data || [];
    }
  });

  // Fetch diagrams for the selected session
  const { data: diagrams = [] } = useQuery({
    queryKey: ['diagrams', selectedSession],
    queryFn: async () => {
      if (!selectedSession) return [];
      try {
        const response = await apiService.getDiagrams(selectedSession);
        return Array.isArray(response) ? response : [];
      } catch (error) {
        console.error('Error fetching diagrams:', error);
        return [];
      }
    },
    enabled: !!selectedSession
  });

  // Save diagram mutation
  const saveDiagramMutation = useMutation({
    mutationFn: async ({ sessionId, data }: SaveDiagramParams) => {
      const response = await apiService.saveDiagram({
        session_id: sessionId,
        diagram_data: data,
        diagram_type: 'freehand'
      });
      return response.data;
    },
    onSuccess: () => {
      message.success('Diagram saved successfully');
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
    onError: (error: Error) => {
      console.error('Failed to save diagram:', error);
      message.error('Failed to save diagram');
    }
  });

  // Create session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (values: { title: string }) => {
      const response = await apiService.createSession({
        ...values,
        content: '',
        diagram_data: '',
        chapters: '',
        detail_level: 'basic'
      });
      return response.data;
    },
    onSuccess: () => {
      message.success('Session created successfully');
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
    onError: (error: Error) => {
      console.error('Failed to create session:', error);
      message.error('Failed to create session');
    }
  });

  // Define saveToLocalStorage first
  const saveToLocalStorage = useCallback((data: string) => {
    try {
      localStorage.setItem('diagramData', data);
    } catch (err) {
      console.error('Failed to save to local storage:', err);
      message.error('Failed to save diagram locally');
    }
  }, []);

  // Initialize window.saveToLocalStorage
  useEffect(() => {
    window.saveToLocalStorage = saveToLocalStorage;
    return () => {
      delete window.saveToLocalStorage;
    };
  }, [saveToLocalStorage]);

  // Handle saving the diagram
  const handleSaveDiagram = useCallback(async (data: string) => {
    if (!selectedSession) return;
    
    try {
      saveToLocalStorage(data);
      await saveDiagramMutation.mutateAsync({
        sessionId: selectedSession,
        data
      });
      message.success('Diagram saved successfully');
    } catch (error) {
      console.error('Error saving diagram:', error);
      message.error('Failed to save diagram');
    }
  }, [selectedSession, saveDiagramMutation, saveToLocalStorage]);

  // Handle exporting the diagram
  const handleExport = useCallback(async () => {
    const canvasElement = document.querySelector('canvas');
    if (!canvasElement) return;
    
    try {
      setIsExporting(true);
      
      // Use html2canvas to capture the canvas
      const canvas = await html2canvas(canvasElement);
      const dataUrl = canvas.toDataURL('image/png');
      
      // Create download link
      const link = document.createElement('a');
      link.download = `diagram-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      message.success('Diagram exported successfully');
    } catch (error) {
      console.error('Error exporting diagram:', error);
      message.error('Failed to export diagram');
    } finally {
      setIsExporting(false);
    }
  }, []);

  // Handle creating a new session
  const handleCreateSession = useCallback(async (values: { title: string }) => {
    try {
      const newSession = await createSessionMutation.mutateAsync(values);
      if (newSession?.id) {
        setSelectedSession(newSession.id);
        setShowNewNoteForm(false);
        form.resetFields();
        message.success('Session created successfully');
      } else {
        throw new Error('Failed to create session: Invalid response');
      }
    } catch (error) {
      console.error('Error creating session:', error);
      message.error('Failed to create session');
    }
  }, [createSessionMutation, form]);

  // Load diagram data when a session is selected
  useEffect(() => {
    if (selectedSession && diagrams.length > 0 && canvasRef.current?.loadDiagramData) {
      const diagram = diagrams[0]; // Get the first diagram
      if (diagram?.diagram_data) {
        try {
          canvasRef.current.loadDiagramData(diagram.diagram_data);
        } catch (error) {
          console.error('Error loading diagram data:', error);
        }
      }
    }
  }, [selectedSession, diagrams]);

  if (isLoading) {
    return (
      <div className="p-4 text-red-600">
        <h2>Loading Whiteboard</h2>
        <p>Please wait...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Sessions</h2>
            <button
              onClick={() => setShowNewNoteForm(true)}
              className="p-1 rounded-full hover:bg-gray-100"
              title="New Session"
            >
              <FiPlus className="h-5 w-5" />
            </button>
          </div>
          
          {/* Session List */}
          <div className="flex-1 overflow-y-auto">
            {sessions.map((session: Session) => (
              <div
                key={session.id}
                className={`p-2 rounded cursor-pointer hover:bg-gray-100 ${
                  selectedSession === session.id ? 'bg-blue-50' : ''
                }`}
                onClick={() => setSelectedSession(session.id || null)}
              >
                <div className="font-medium">{session.title}</div>
                <div className="text-sm text-gray-500">
                  {new Date(session.updated_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="bg-white border-b border-gray-200 p-2 flex items-center space-x-2">
            <Button
              onClick={handleExport}
              disabled={isExporting}
              icon={<FiDownload />}
            >
              Export
            </Button>
            <Button
              onClick={() => handleSaveDiagram(canvasRef.current?.getDiagramData() || '')}
              disabled={!selectedSession || isExporting}
              icon={<FiSave />}
            >
              Save
            </Button>
          </div>
          
          {/* Canvas */}
          <div className="flex-1 overflow-auto bg-white p-4">
            <div className="w-full h-full">
              {selectedSession && (
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    {sessions.find(s => s.id === selectedSession)?.title || 'Untitled'}
                  </h2>
                  <div className="space-x-2">
                    <Button 
                      type="primary" 
                      icon={<FiSave />} 
                      onClick={() => handleSaveDiagram(canvasRef.current?.getDiagramData() || '')}
                      loading={saveDiagramMutation.isPending}
                    >
                      Save
                    </Button>
                    <Button 
                      icon={<FiDownload />} 
                      onClick={handleExport}
                      loading={isExporting}
                    >
                      Export
                    </Button>
                  </div>
                </div>
              )}

              <div className="border rounded-lg p-4 bg-white">
                {selectedSession ? (
                  <div ref={el => {
                    if (el) {
                      // This is a simplified canvas implementation
                      // In a real app, you would use a proper diagramming library
                      const canvas = document.createElement('canvas');
                      canvas.width = 800;
                      canvas.height = 600;
                      canvas.style.border = '1px solid #ddd';
                      el.innerHTML = '';
                      el.appendChild(canvas);
                      
                      // Initialize canvas context and drawing logic would go here
                      const ctx = canvas.getContext('2d');
                      if (ctx) {
                        ctx.font = '16px Arial';
                        ctx.fillText('Diagram Canvas Placeholder', 10, 30);
                        ctx.fillText('In a real implementation, this would be an interactive diagram', 10, 60);
                      }
                      
                      // Update ref with mock methods
                      if (canvasRef.current) {
                        canvasRef.current.getDiagramData = () => JSON.stringify({ type: 'diagram', version: '1.0' });
                        canvasRef.current.loadDiagramData = (data: string) => {
                          console.log('Loading diagram data:', data);
                        };
                      }
                    }
                  }} />
                ) : (
                  <div className="text-center p-8 text-gray-500">
                    Select a session or create a new one to start drawing
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* New Session Modal */}
      {showNewNoteForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">New Session</h3>
              <button
                onClick={() => setShowNewNoteForm(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close dialog"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            
            <Form
              form={form}
              layout="vertical"
              onFinish={handleCreateSession}
            >
              <Form.Item
                name="title"
                label="Title"
                rules={[{ required: true, message: 'Please enter a title' }]}
              >
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  placeholder="Enter session title"
                />
              </Form.Item>
              
              <Form.Item
                name="module_code"
                label="Module Code"
                rules={[{ required: true, message: 'Please enter a module code' }]}
              >
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  placeholder="e.g., CS101"
                />
              </Form.Item>
              
              <div className="flex justify-end space-x-2 mt-4">
                <Button onClick={() => setShowNewNoteForm(false)}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit">
                  Create
                </Button>
              </div>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Whiteboard;
