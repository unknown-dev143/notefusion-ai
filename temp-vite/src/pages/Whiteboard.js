import React, { useState, useCallback, useEffect } from 'react';
// import DiagramCanvas from '../components/DiagramCanvas';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/apiService';
import toast from 'react-hot-toast';
import { FiSave, FiVideo, FiPlus, FiX } from 'react-icons/fi';

interface SessionsApiResponse {
  sessions: Session[];
}

interface Session {
  session_id: string;
  module_code: string;
  title: string;
  chapters: string;
  detail_level: string;
  created_at: string;
  updated_at: string;
  diagram_data?: string;
}

interface NoteFormData {
  title: string;
  module_code: string;
  chapters: string;
  detail_level: string;
  content: string;
  diagram_data?: string;
}

interface SaveDiagramParams {
  sessionId: string;
  data: string;
  diagramType?: string;
}

const Whiteboard: React.FC = () => {
  // State management
  const [diagramData, setDiagramData] = useState<string>('');
  const [selectedSession, setSelectedSession] = useState<string>('');
  const [showVideoPanel, setShowVideoPanel] = useState(false);
  const [showNewNoteForm, setShowNewNoteForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Video generation state
  const [videoState, setVideoState] = useState({
    text: '',
    voice: 'default' as 'default' | 'male' | 'female',
    style: 'default' as 'default' | 'educational' | 'casual',
    url: undefined as string | undefined,
    loading: false,
    error: null as string | null
  });

  // Form validation
  const validateForm = (): boolean => {
    if (!newNote.title.trim()) {
      setFormError('Title is required');
      return false;
    }
    if (!newNote.module_code.trim()) {
      setFormError('Module code is required');
      return false;
    }
    if (!newNote.content.trim()) {
      setFormError('Content is required');
      return false;
    }
    setFormError(null);
    return true;
  };
  
  // Note form state
  const [newNote, setNewNote] = useState<NoteFormData>({
    title: '',
    module_code: '',
    chapters: '',
    detail_level: 'basic',
    content: ''
  });
  
  const queryClient = useQueryClient();
  
  // Fetch sessions
  const { data: sessionsData, isLoading: sessionsLoading } = useQuery<SessionsApiResponse, Error>(
    {
      queryKey: ['sessions'],
      queryFn: apiService.getSessions,
      onSuccess: (data) => {
        if (data?.sessions?.length > 0 && !selectedSession) {
          setSelectedSession(data.sessions[0].session_id);
          // Load the diagram data if available
          const session = data.sessions[0];
          if (session.diagram_data) {
            setDiagramData(session.diagram_data);
          }
        }
      }
    }
  );
  
  const sessions = sessionsData?.sessions || [];
  
  // Create session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (data: NoteFormData) => {
      const response = await apiService.createSession(data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Note created successfully');
      setShowNewNoteForm(false);
      setNewNote({
        title: '',
        module_code: '',
        chapters: '',
        detail_level: 'basic',
        content: ''
      });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
    onError: (error: Error) => {
      console.error('Error creating note:', error);
      toast.error('Failed to create note');
    }
  });
  
  // Save diagram mutation
  const saveDiagramMutation = useMutation({
    mutationFn: async ({ sessionId, data, diagramType = 'freehand' }: SaveDiagramParams) => {
      await apiService.saveDiagram(sessionId, data, diagramType);
    },
    onSuccess: () => {
      toast.success('Diagram saved successfully');
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
    onError: (error: Error) => {
      console.error('Error saving diagram:', error);
      toast.error('Failed to save diagram');
    }
  });
  
  // Handle generating video from notes
  const handleGenerateVideo = useCallback(async (): Promise<void> => {
    if (!videoState.text.trim()) {
      toast.error('Please enter some text for the video');
      return;
    }

    try {
      setVideoState(prev => ({ ...prev, loading: true, error: null }));
      
      // Simulate API call with timeout (replace with actual API call when ready)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, this would be an actual API call
      const videoUrl = `https://example.com/generated-video-${Date.now()}.mp4`;
      
      setVideoState(prev => ({
        ...prev,
        loading: false,
        url: videoUrl
      }));
      
      toast.success('Video generated successfully!');
    } catch (error) {
      console.error('Error generating video:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate video';
      setVideoState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      toast.error(errorMessage);
    }
  }, [videoState.text, videoState.voice, videoState.style, diagramData]);

  // Handle saving diagram to the current note
  const handleSaveDiagram = useCallback((): void => {
    if (!selectedSession) {
      toast.error('Please select a note to save the diagram to');
      return;
    }
    
    if (!diagramData) {
      toast.error('No diagram data to save');
      return;
    }
    
    saveDiagramMutation.mutate({
      sessionId: selectedSession,
      data: diagramData,
      diagramType: 'freehand'
    });
  }, [selectedSession, diagramData, saveDiagramMutation]);
  
  // Handle saving the diagram when drawing
  const handleSaveDrawing = useCallback((data: string): void => {
    setDiagramData(data);
    // Auto-save to the selected session if available
    if (selectedSession) {
      saveDiagramMutation.mutate({
        sessionId: selectedSession,
        data,
        diagramType: 'freehand'
      });
    }
  }, [selectedSession, saveDiagramMutation]);

  // Handle auto-saving the diagram
  const handleAutoSave = useCallback((data: string): void => {
    setDiagramData(data);
  }, []);

  // Handle creating a new note
  const handleCreateNote = useCallback(async (): Promise<void> => {
    if (!validateForm()) return;
    
    setIsSaving(true);
    setFormError(null);
    
    try {
      await createSessionMutation.mutateAsync({
        ...newNote,
        diagram_data: diagramData
      });
    } catch (error) {
      console.error('Error creating note:', error);
      setFormError('Failed to create note. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [newNote, diagramData, createSessionMutation]);


  // Handle note input change
  const handleNoteChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewNote(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);
  
  // Video generation handlers
  const handleVideoTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setVideoState(prev => ({ ...prev, text: e.target.value }));
  }, []);

  const handleVoiceChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setVideoState(prev => ({ ...prev, voice: e.target.value as 'default' | 'male' | 'female' }));
  }, []);

  const handleStyleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setVideoState(prev => ({ ...prev, style: e.target.value as 'default' | 'educational' | 'casual' }));
  }, []);

  // Loading overlay
  if (isSaving) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-700">Creating your note...</p>
        </div>
      </div>
    );
  }

  // Main component render
  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Error message */}
      {formError && (
        <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
          <p className="font-medium">Error</p>
          <p>{formError}</p>
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Whiteboard</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowNewNoteForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            New Note
          </button>
          <button
            onClick={() => setShowVideoPanel(!showVideoPanel)}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            {showVideoPanel ? 'Hide Video Panel' : 'Generate Video'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main whiteboard area */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-4">
          {/* Temporarily disabled DiagramCanvas
          <DiagramCanvas 
            onSave={handleSaveDrawing}
            onAutoSave={handleAutoSave}
            initialData={diagramData}
          />
          
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={() => setDiagramData('')}
              className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded-md text-sm font-medium transition-colors"
            >
              Clear Canvas
            </button>
          </div>
          */}
          <div className="text-center py-12 text-gray-500">
            Diagram Canvas is temporarily disabled
          </div>
        </div>

        {/* Video generation panel */}
        {showVideoPanel && (
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-4">Generate Video</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes for Video
                </label>
                <textarea
                  value={videoState.text}
                  onChange={handleVideoTextChange}
                  placeholder="Enter your notes here..."
                  className="w-full border rounded-md p-2 min-h-[100px] text-sm"
                  disabled={videoState.loading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Voice
                  </label>
                  <select
                    value={videoState.voice}
                    onChange={handleVoiceChange}
                    className="w-full border rounded-md p-2 text-sm"
                    disabled={videoState.loading}
                  >
                    <option value="default">Default</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Style
                  </label>
                  <select
                    value={videoState.style}
                    onChange={handleStyleChange}
                    className="w-full border rounded-md p-2 text-sm"
                    disabled={videoState.loading}
                  >
                    <option value="default">Default</option>
                    <option value="educational">Educational</option>
                    <option value="casual">Casual</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleGenerateVideo}
                disabled={videoState.loading || !videoState.text.trim()}
                className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {videoState.loading ? (
                  'Generating...'
                ) : (
                  <>
                    <FiVideo size={16} />
                    <span>Generate Video</span>
                  </>
                )}
              </button>

              {videoState.error && (
                <div className="text-red-600 text-sm">{videoState.error}</div>
              )}

              {videoState.url && (
                <div className="mt-4">
                  <video
                    src={videoState.url}
                    controls
                    className="w-full rounded-md"
                  />
                  <div className="mt-2 flex justify-end">
                    <a
                      href={videoState.url}
                      download="generated-video.mp4"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Download Video
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* New Note Modal */}
      {showNewNoteForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Create New Note</h2>
              <button
                onClick={() => setShowNewNoteForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={newNote.title}
                  onChange={handleNoteChange}
                  className={`w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formError && !newNote.title ? 'border-red-500' : ''
                  }`}
                  placeholder="Enter note title"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Module Code *
                  </label>
                  <input
                    type="text"
                    name="module_code"
                    value={newNote.module_code}
                    onChange={handleNoteChange}
                    className={`w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formError && !newNote.module_code ? 'border-red-500' : ''
                    }`}
                    placeholder="e.g., CS101"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Detail Level
                  </label>
                  <select
                    name="detail_level"
                    value={newNote.detail_level}
                    onChange={handleNoteChange}
                    className="w-full border rounded-md p-2 text-sm"
                  >
                    <option value="basic">Basic</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chapters/Topics
                </label>
                <input
                  type="text"
                  name="chapters"
                  value={newNote.chapters}
                  onChange={handleNoteChange}
                  className="w-full border rounded-md p-2 text-sm"
                  placeholder="e.g., Chapter 1, 2, 3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content *
                </label>
                <textarea
                  name="content"
                  value={newNote.content}
                  onChange={handleNoteChange}
                  className={`w-full border rounded-md p-2 text-sm min-h-[150px] focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formError && !newNote.content ? 'border-red-500' : ''
                  }`}
                  placeholder="Enter your note content here..."
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewNoteForm(false)}
                  className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateNote}
                  disabled={!newNote.title || !newNote.module_code || !newNote.content || createSessionMutation.isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors duration-200"
                >
                  {createSessionMutation.isLoading ? 'Creating...' : (
                    <>
                      <FiSave size={16} />
                      <span>Create Note</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const isSameSession = (a: Session, b: Session) => a.session_id === b.session_id;

export default Whiteboard;
