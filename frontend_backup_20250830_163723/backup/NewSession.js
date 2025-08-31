import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useMutation } from 'react-query';
import { 
  CloudArrowUpIcon, 
  MicrophoneIcon, 
  DocumentTextIcon,
  AcademicCapIcon,
  CogIcon,
  PlayIcon,
  StopIcon
} from '@heroicons/react/24/outline';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { useNotification } from '../components/NotificationProvider';
import { apiService } from '../services/apiService';
import VoiceRecorder from '../components/VoiceRecorder';
import FileUploader from '../components/FileUploader';

const DIFFICULT_KEYWORDS = [
  'difficult', 'complex', 'hard', 'challenge', 'abstract', 'proof', 'theorem', 'derivation', 'algorithm', 'mechanism', 'process', 'explain', 'explanation', 'why', 'how', 'reason', 'cause', 'effect', 'problem', 'solve', 'solution', 'trick', 'tip', 'pitfall', 'confusing', 'misconception', 'error', 'mistake',
];

const detectDifficult = (text) => {
  if (!text) return false;
  const lower = text.toLowerCase();
  return DIFFICULT_KEYWORDS.some(keyword => lower.includes(keyword));
};

const NewSession = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upload');
  const [formData, setFormData] = useState({
    module_code: '',
    chapters: '',
    detail_level: 'standard',
    lecture_content: '',
    textbook_content: '',
    table_of_contents: '', // New: user-provided TOC
    lecture_timestamps: '', // New: user-provided timestamps
  });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [aiDrawing, setAIDrawing] = useState(null); // { url, description, style }
  const [aiDrawingLoading, setAIDrawingLoading] = useState(false);
  const [aiDrawingError, setAIDrawingError] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');

  const { showNotification } = useNotification();

  const fusionMutation = useMutation(apiService.fuseContent, {
    onSuccess: (data) => {
      // Use backend notification_type/message if available
      if (data && typeof data === 'object' && data.notification_type && data.message) {
        showNotification(data.notification_type, data.message);
      } else {
        showNotification('success', 'Notes generated successfully!');
      }
      navigate(`/session/${data.data?.session_id || data.session_id}`);
    },
    onError: (error) => {
      let message = 'Failed to generate notes. Please try again.';
      if (error?.response?.data?.message) {
        message = error.response.data.message;
      }
      showNotification('error', message);
    },
  });

  const handleFileUpload = (files) => {
    files.forEach(async (file) => {
      try {
        const response = await apiService.uploadFile(file);
        
        if (response.status === 'transcribed') {
          setTranscript(prev => prev + ' ' + response.transcript.transcript);
          setFormData(prev => ({
            ...prev,
            lecture_content: prev.lecture_content + ' ' + response.transcript.transcript
          }));
        } else if (response.status === 'processed') {
          setFormData(prev => ({
            ...prev,
            textbook_content: prev.textbook_content + ' ' + response.text_content
          }));
        }
        
        setUploadedFiles(prev => [...prev, { file, response }]);
        toast.success(`${file.name} processed successfully`);
      } catch (error) {
        toast.error(`Failed to process ${file.name}`);
      }
    });
  };

  const handleTranscriptUpdate = (newTranscript) => {
    setTranscript(newTranscript);
    setFormData(prev => ({
      ...prev,
      lecture_content: newTranscript
    }));
  };

  const handleAIDrawing = async (text) => {
  setAIDrawingError('');
  setAIDrawingLoading(true);
  try {
    const response = await axios.post('/api/diagrams/generate', {
      description: text,
      style: 'technical',
    });
    if (response.data && response.data.path) {
      // Get signed URL
      const signResp = await axios.get('/api/diagrams/sign-url', {
        params: {
          path: response.data.path,
          expires_in: 600, // 10 minutes
        },
      });
      setAIDrawing({
        url: signResp.data.url,
        description: response.data.description,
        style: response.data.style,
      });
    } else {
      setAIDrawingError('Failed to generate drawing.');
    }
  } catch (e) {
    setAIDrawingError('Drawing generation failed.');
  }
  setAIDrawingLoading(false);
};

const removeAIDrawing = () => {
  setAIDrawing(null);
};

// Suggest AI drawing when topic is difficult
React.useEffect(() => {
  const content = formData.lecture_content + ' ' + formData.textbook_content;
  if (!aiDrawing && detectDifficult(content)) {
    handleAIDrawing(content.slice(0, 250)); // Use first 250 chars as prompt
  }
  // eslint-disable-next-line
}, [formData.lecture_content, formData.textbook_content]);

const handleManualAIDrawing = () => {
  const content = formData.lecture_content + ' ' + formData.textbook_content;
  handleAIDrawing(content.slice(0, 250));
};

const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.module_code || !formData.chapters) {
      toast.error('Please fill in module code and chapters');
      return;
    }
    
    if (!formData.lecture_content && !formData.textbook_content) {
      toast.error('Please provide lecture or textbook content');
      return;
    }
    
    fusionMutation.mutate(formData);
  };

  const tabs = [
    { id: 'upload', name: 'Upload Files', icon: CloudArrowUpIcon },
    { id: 'recording', name: 'Live Recording', icon: MicrophoneIcon },
    { id: 'manual', name: 'Manual Input', icon: DocumentTextIcon },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Session</h1>
        <p className="text-gray-600">
          Upload files, record live lectures, or manually input content to generate intelligent study notes
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="card">
        {activeTab === 'upload' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Files</h3>
              <p className="text-gray-600 mb-4">
                Upload PDFs, audio/video files, or text documents. Audio/video files will be automatically transcribed.
              </p>
            </div>
            
            <FileUploader onFilesUploaded={handleFileUpload} />
            
            {uploadedFiles.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Uploaded Files</h4>
                <div className="space-y-2">
                  {uploadedFiles.map((fileData, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <DocumentTextIcon className="w-5 h-5 text-gray-400" />
                        <span className="font-medium">{fileData.file.name}</span>
                      </div>
                      <span className="text-sm text-green-600">
                        {fileData.response.status === 'transcribed' ? 'Transcribed' : 'Processed'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'recording' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Live Recording</h3>
              <p className="text-gray-600 mb-4">
                Record your lecture in real-time. The audio will be automatically transcribed as you speak.
              </p>
            </div>
            
            <VoiceRecorder 
              onTranscriptUpdate={handleTranscriptUpdate}
              isRecording={isRecording}
              setIsRecording={setIsRecording}
            />
            
            {transcript && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Live Transcript</h4>
                <div className="p-4 bg-gray-50 rounded-lg max-h-64 overflow-y-auto">
                  <p className="text-gray-700 whitespace-pre-wrap">{transcript}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'manual' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Manual Input</h3>
              <p className="text-gray-600 mb-4">
                Manually enter or paste your lecture and textbook content.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lecture Content
                </label>
                <textarea
                  value={formData.lecture_content}
                  onChange={(e) => setFormData(prev => ({ ...prev, lecture_content: e.target.value }))}
                  placeholder="Paste or type your lecture content here..."
                  className="textarea-field h-48"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Textbook Content
                </label>
                <textarea
                  value={formData.textbook_content}
                  onChange={(e) => setFormData(prev => ({ ...prev, textbook_content: e.target.value }))}
                  placeholder="Paste or type your textbook content here..."
                  className="textarea-field h-48"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Table of Contents (optional)
                </label>
                <textarea
                  value={formData.table_of_contents}
                  onChange={(e) => setFormData(prev => ({ ...prev, table_of_contents: e.target.value }))}
                  placeholder="e.g. 1. Introduction\n2. Key Concepts\n3. Applications"
                  className="textarea-field h-32"
                />
                <p className="text-xs text-gray-500 mt-1">Paste or type the book/lecture TOC to help with sectioning.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lecture Timestamps (optional)
                </label>
                <textarea
                  value={formData.lecture_timestamps}
                  onChange={(e) => setFormData(prev => ({ ...prev, lecture_timestamps: e.target.value }))}
                  placeholder="e.g. 00:00:00 Introduction\n00:10:23 Key Topic 1\n00:22:45 Q&A"
                  className="textarea-field h-32"
                />
                <p className="text-xs text-gray-500 mt-1">Paste timestamps from your lecture/video for better segmentation.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Session Configuration */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <AcademicCapIcon className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">Session Configuration</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
  {/* AI Drawing Section */}
  <div className="card bg-blue-50 p-4 mb-4">
    <div className="flex items-center space-x-2 mb-2">
      <span className="font-semibold text-blue-700">AI Drawing Suggestion</span>
      <button type="button" className="text-xs text-blue-600 underline" onClick={handleManualAIDrawing} disabled={aiDrawingLoading}>
        {aiDrawingLoading ? 'Generating...' : 'Generate Drawing'}
      </button>
      {aiDrawing && (
        <button type="button" className="ml-2 text-xs text-red-600 underline" onClick={removeAIDrawing}>
          Remove Drawing
        </button>
      )}
    </div>
    {aiDrawingError && <div className="text-xs text-red-600 mb-2">{aiDrawingError}</div>}
    {aiDrawing && (
      <div className="flex items-center space-x-4">
        <img src={aiDrawing.url} alt="AI Drawing" className="w-40 h-40 object-contain border rounded bg-white" />
        <div>
          <div className="text-sm text-gray-700">{aiDrawing.description}</div>
          <div className="text-xs text-gray-500">Style: {aiDrawing.style}</div>
        </div>
      </div>
    )}
    {!aiDrawing && !aiDrawingLoading && <div className="text-xs text-gray-600">AI can suggest a drawing for difficult or complex topics, or you can generate one manually.</div>}
  </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Module Code
              </label>
              <input
                type="text"
                value={formData.module_code}
                onChange={(e) => setFormData(prev => ({ ...prev, module_code: e.target.value }))}
                placeholder="e.g., ENGG1103"
                className="input-field"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chapters
              </label>
              <input
                type="text"
                value={formData.chapters}
                onChange={(e) => setFormData(prev => ({ ...prev, chapters: e.target.value }))}
                placeholder="e.g., Chapters 1-3"
                className="input-field"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Detail Level
            </label>
            <select
              value={formData.detail_level}
              onChange={(e) => setFormData(prev => ({ ...prev, detail_level: e.target.value }))}
              className="input-field"
            >
              <option value="concise">Concise</option>
              <option value="standard">Standard</option>
              <option value="in-depth">In-depth</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <CogIcon className="w-4 h-4" />
              <span>AI will generate structured notes with practice questions</span>
            </div>
            
            <button
              type="submit"
              disabled={fusionMutation.isLoading}
              className="btn-primary flex items-center space-x-2"
            >
              {fusionMutation.isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <PlayIcon className="w-4 h-4" />
                  <span>Generate Notes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewSession; 