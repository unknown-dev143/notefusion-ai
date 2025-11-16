import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWebSocket } from '../contexts/WebSocketContext';

interface UploadedFile {
  name: string;
  type: string;
  size: number;
}

const MainFeatures: React.FC = () => {
  const { isConnected } = useWebSocket();
  const [moduleCode, setModuleCode] = useState('');
  const [chapters, setChapters] = useState('');
  const [detailLevel, setDetailLevel] = useState('standard');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedNotes, setGeneratedNotes] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Get API URL from environment or use default
  const getApiUrl = () => {
    if (typeof window !== 'undefined' && (window as any).appConfig?.API_URL) {
      return (window as any).appConfig.API_URL;
    }
    if (typeof window !== 'undefined' && (window as any)._env_?.REACT_APP_API_URL) {
      return (window as any)._env_.REACT_APP_API_URL;
    }
    return process.env.REACT_APP_API_URL || 'http://localhost:8000';
  };
  
  const API_BASE_URL = getApiUrl();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).map(file => ({
        name: file.name,
        type: file.type,
        size: file.size
      }));
      setUploadedFiles(files);
    }
  };

  const handleUpload = async () => {
    if (!moduleCode || !chapters) {
      setError('Please fill in module code and chapters');
      return;
    }

    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (!fileInput?.files || fileInput.files.length === 0) {
      setError('Please select at least one file');
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('module_code', moduleCode);
      formData.append('chapters', chapters);
      formData.append('detail_level', detailLevel);
      if (sessionId) {
        formData.append('session_id', sessionId);
      }

      Array.from(fileInput.files).forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch(`${API_BASE_URL}/upload-files`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      setSessionId(data.session_id);
      setGeneratedNotes(data.notes);
      setSuccess('Files uploaded and notes generated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerateNotes = async () => {
    if (!sessionId) {
      setError('Please upload files first');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('session_id', sessionId);
      formData.append('module_code', moduleCode);
      formData.append('chapters', chapters);
      formData.append('detail_level', detailLevel);

      const response = await fetch(`${API_BASE_URL}/generate-notes`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Generation failed: ${response.statusText}`);
      }

      const data = await response.json();
      setGeneratedNotes(data.notes);
      setSuccess('Notes generated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Note generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'markdown') => {
    if (!sessionId || !generatedNotes) {
      setError('Please generate notes first');
      return;
    }

    try {
      if (format === 'markdown') {
        // For markdown, download directly from generated notes
        const blob = new Blob([generatedNotes], { type: 'text/markdown' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${moduleCode || 'notes'}_notes.md`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setSuccess('Notes exported as Markdown successfully!');
      } else {
        // For PDF, use the backend export endpoint
        const formData = new FormData();
        formData.append('session_id', sessionId);
        formData.append('module_code', moduleCode);
        formData.append('chapters', chapters);
        formData.append('format', format);

        const response = await fetch(`${API_BASE_URL}/export`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: response.statusText }));
          throw new Error(errorData.error || `Export failed: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.pdf_path) {
          // Backend returns a path, we need to fetch the file
          // For now, show a message that PDF export needs backend file serving
          setError('PDF export requires backend file serving. Please use Markdown export or configure backend to serve PDF files.');
        } else if (data.markdown) {
          // Fallback to markdown if PDF not available
          const blob = new Blob([data.markdown], { type: 'text/markdown' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${moduleCode || 'notes'}_notes.md`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          setSuccess('Notes exported as Markdown (PDF not available)');
        } else {
          throw new Error('Invalid response from server');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8 shadow-lg">
        <h1 className="text-4xl font-bold mb-2">NoteFusion AI</h1>
        <p className="text-xl opacity-90">Transform lectures and textbooks into comprehensive study notes</p>
        <div className="mt-4 flex items-center space-x-4">
          <div className={`flex items-center space-x-2 ${isConnected ? 'text-green-200' : 'text-red-200'}`}>
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-300' : 'bg-red-300'} animate-pulse`}></div>
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
      </div>

      {/* Main Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Feature 1: File Upload */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center mb-4">
            <div className="bg-blue-100 p-3 rounded-lg mr-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">1. Upload Files</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Upload PDFs, audio files (MP3, WAV), or video files (MP4, MKV) to extract content
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Module Code
              </label>
              <input
                type="text"
                value={moduleCode}
                onChange={(e) => setModuleCode(e.target.value)}
                placeholder="e.g., CS101"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chapters
              </label>
              <input
                type="text"
                value={chapters}
                onChange={(e) => setChapters(e.target.value)}
                placeholder="e.g., Chapter 1-3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detail Level
              </label>
              <select
                value={detailLevel}
                onChange={(e) => setDetailLevel(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="basic">Basic</option>
                <option value="standard">Standard</option>
                <option value="detailed">Detailed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Files
              </label>
              <input
                id="file-input"
                type="file"
                multiple
                accept=".pdf,.mp3,.wav,.mp4,.mkv"
                onChange={handleFileSelect}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {uploadedFiles.length > 0 && (
                <div className="mt-2 space-y-1">
                  {uploadedFiles.map((file, idx) => (
                    <div key={idx} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isUploading ? 'Uploading...' : 'Upload & Generate Notes'}
            </button>
          </div>
        </div>

        {/* Feature 2: AI-Powered Note Generation */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center mb-4">
            <div className="bg-purple-100 p-3 rounded-lg mr-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">2. AI Note Generation</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Automatically fuse lecture transcripts with textbook content to create comprehensive study notes
          </p>
          <div className="space-y-4">
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-800 mb-2">Features:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-purple-700">
                <li>Automatic transcription from audio/video</li>
                <li>Text extraction from PDFs</li>
                <li>Intelligent content fusion</li>
                <li>Structured note formatting</li>
                <li>Practice questions generation</li>
              </ul>
            </div>
            <button
              onClick={handleGenerateNotes}
              disabled={!sessionId || isGenerating}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isGenerating ? 'Generating...' : 'Regenerate Notes'}
            </button>
          </div>
        </div>

        {/* Feature 3: Export Options */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center mb-4">
            <div className="bg-green-100 p-3 rounded-lg mr-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">3. Export Notes</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Download your generated notes in PDF or Markdown format for offline study
          </p>
          <div className="space-y-3">
            <button
              onClick={() => handleExport('pdf')}
              disabled={!generatedNotes}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Export as PDF
            </button>
            <button
              onClick={() => handleExport('markdown')}
              disabled={!generatedNotes}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export as Markdown
            </button>
          </div>
        </div>

        {/* Feature 4: Whiteboard */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-500">
          <div className="flex items-center mb-4">
            <div className="bg-indigo-100 p-3 rounded-lg mr-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">4. Interactive Whiteboard</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Create visual diagrams, sketches, and collaborative whiteboard sessions
          </p>
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h3 className="font-semibold text-indigo-800 mb-2">Features:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-indigo-700">
              <li>Draw and sketch freely</li>
              <li>Create diagrams and flowcharts</li>
              <li>Real-time collaboration</li>
              <li>Export as images</li>
              <li>Save and load sessions</li>
            </ul>
          </div>
          <Link
            to="/whiteboard"
            className="w-full mt-4 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
          >
            Open Whiteboard
          </Link>
        </div>

        {/* Feature 5: AI Assistant Settings */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-teal-500">
          <div className="flex items-center mb-4">
            <div className="bg-teal-100 p-3 rounded-lg mr-4">
              <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">5. AI Assistant Settings</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Configure AI models, preferences, and automation settings
          </p>
          <div className="bg-teal-50 p-4 rounded-lg">
            <h3 className="font-semibold text-teal-800 mb-2">Settings:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-teal-700">
              <li>Select AI model (GPT-4, GPT-3.5, etc.)</li>
              <li>Configure model parameters</li>
              <li>Auto-upgrade to newer models</li>
              <li>Customize AI behavior</li>
              <li>Check for model updates</li>
            </ul>
          </div>
          <Link
            to="/settings"
            className="w-full mt-4 bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center"
          >
            Configure AI Settings
          </Link>
        </div>

        {/* Feature 6: Real-time Collaboration */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
          <div className="flex items-center mb-4">
            <div className="bg-orange-100 p-3 rounded-lg mr-4">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">6. Real-time Sync</h2>
          </div>
          <p className="text-gray-600 mb-4">
            WebSocket-powered real-time updates and collaboration features
          </p>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-orange-800">Connection Status</span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                isConnected ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
              }`}>
                {isConnected ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-xs text-orange-700">
              {isConnected 
                ? 'Your session is synced in real-time' 
                : 'Reconnecting to server...'}
            </p>
          </div>
        </div>
      </div>

      {/* Generated Notes Preview */}
      {generatedNotes && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Generated Notes Preview</h2>
            <button
              onClick={() => setGeneratedNotes(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
              {generatedNotes}
            </pre>
          </div>
        </div>
      )}

      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-green-700">{success}</p>
            <button
              onClick={() => setSuccess(null)}
              className="ml-auto text-green-500 hover:text-green-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainFeatures;

