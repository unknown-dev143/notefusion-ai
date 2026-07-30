import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Upload, Sparkles, FileText, Download, Layers, CheckCircle2, AlertCircle, Share2, Bot, Zap, Brain, RotateCw } from 'lucide-react';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useAuth } from '../contexts/AuthContext';
import { uploadFile } from '../utils/storage';
import styles from './MainFeatures.module.css';

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

  const getApiUrl = () => {
    if (typeof window !== 'undefined' && (window as any).appConfig?.API_URL) {
      return (window as any).appConfig.API_URL;
    }
    if (typeof window !== 'undefined' && (window as any)._env_?.REACT_APP_API_URL) {
      return (window as any)._env_.REACT_APP_API_URL;
    }
    return import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
  };
  
  const API_BASE_URL = getApiUrl();

  const { user } = useAuth();
  const [uploadProgress, setUploadProgress] = useState<number>(0);

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
    setUploadProgress(0);

    try {
      const selectedFiles = Array.from(fileInput.files);
      const cloudUrls: string[] = [];

      // Phase 1: Cloud Upload (Firebase)
      if (user) {
        for (const file of selectedFiles) {
          const path = `users/${user.uid || (user as any).id}/uploads/${Date.now()}_${file.name}`;
          const url = await uploadFile(file, path, (progress) => {
            setUploadProgress(progress);
          });
          cloudUrls.push(url);
        }
      }

      // Phase 2: Send to Backend for Synthesis
      const formData = new FormData();
      formData.append('module_code', moduleCode);
      formData.append('chapters', chapters);
      formData.append('detail_level', detailLevel);
      if (sessionId) {
        formData.append('session_id', sessionId);
      }
      
      if (cloudUrls.length > 0) {
        formData.append('source_urls', cloudUrls.join(','));
      }
      
      // We still send files to the local backend for processing
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch(`${API_BASE_URL}/api/v1/upload-files`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      setSessionId(data.session_id);
      setGeneratedNotes(data.notes);
      setSuccess(`Success! ${cloudUrls.length > 0 ? 'Sync\'d to Cloud & ' : ''}Notes generated.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
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
          throw new Error(`Export failed: ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/pdf')) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${moduleCode || 'notes'}_notes.pdf`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          setSuccess('Notes exported as PDF successfully!');
        } else {
          const data = await response.json();
          if (data.markdown) {
            const blob = new Blob([data.markdown], { type: 'text/markdown' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${moduleCode || 'notes'}_notes.md`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            setSuccess('Notes exported as Markdown');
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    }
  };

  return (
    <div className={`${styles.container} animate-slide-up`}>
      {/* Workspace Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="flex items-center gap-5">
           <div className="w-16 h-16 bg-slate-900 rounded-[28px] flex items-center justify-center text-white shadow-2xl ai-sparkle">
              <Layers size={32}/>
           </div>
           <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-2">Neural <span className="text-blue-600">Workspace</span></h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Active Synthesis Console • v2.4.0</p>
           </div>
        </div>
        <div className="flex items-center gap-3 bg-white/50 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 shadow-xl">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`}></div>
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{isConnected ? 'Synched Live' : 'Offline Mode'}</span>
        </div>
      </div>

      {/* Main Action Grid */}
      <div className={styles.grid}>
        {/* Ingest Card */}
        <div className="glass border-white/20 rounded-[40px] p-8 shadow-2xl shadow-blue-500/5 relative overflow-hidden group flex flex-col border">
           <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
           
           <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                 <Upload size={22} />
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Ingest Knowledge</h3>
           </div>
          
          <div className="space-y-4 flex-1">
            <div className="relative">
               <input
                 type="text"
                 value={moduleCode}
                 onChange={(e) => setModuleCode(e.target.value)}
                 placeholder="Module Archive Code (e.g. CS101)"
                 className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
               />
            </div>
            <div className="relative">
               <input
                 type="text"
                 value={chapters}
                 onChange={(e) => setChapters(e.target.value)}
                 placeholder="Syllabus Range (e.g. 1-12)"
                 className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
               />
            </div>
            <select
              value={detailLevel}
              onChange={(e) => setDetailLevel(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-black uppercase tracking-widest text-slate-600 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none cursor-pointer"
            >
              <option value="basic">Efficiency Mode</option>
              <option value="detailed">Max Comprehensive</option>
            </select>
            
            <div className="relative group/zone">
              <input
                id="file-input"
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
              <label 
                htmlFor="file-input"
                className="w-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-100 rounded-[32px] cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-all bg-white/40 group-hover/zone:scale-[1.01]"
              >
                <div className="text-center">
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-2 block">
                    {uploadedFiles.length > 0 ? `${uploadedFiles.length} Archives Locked` : 'Neural Drop Zone'}
                  </span>
                  <p className="text-[9px] font-bold text-slate-400 lowercase italic">pdf, docx, mp3, mp4 supported</p>
                </div>
              </label>
            </div>

            {uploadProgress > 0 && (
              <div className="w-full bg-slate-50 rounded-full h-1.5 overflow-hidden">
                <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
              </div>
            )}
           </div>
          
           <button
             onClick={handleUpload}
             disabled={isUploading}
             className="w-full mt-8 py-5 bg-slate-900 text-white rounded-[24px] font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:shadow-2xl hover:shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-3"
           >
             {isUploading ? <RotateCw className="animate-spin" size={14}/> : <Sparkles size={14}/>}
             {isUploading ? 'Synthesizing...' : 'Ignite Workspace'}
           </button>
        </div>

        {/* AI Tools Card */}
        <div className={styles.featureCard}>
          <div className={`${styles.iconWrapper} bg-purple-50`}>
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-4">AI Synthesis</h3>
          <p className="text-slate-500 mb-6 text-sm">Fine-tune and regenerate your notes with the latest AI models for maximum clarity.</p>
          
          <div className="space-y-3">
             <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                <ul className="space-y-2">
                  <li className="flex items-center text-xs text-purple-700 font-medium">
                    <span className="mr-2">✨</span> Transcription Sync
                  </li>
                  <li className="flex items-center text-xs text-purple-700 font-medium">
                    <span className="mr-2">✨</span> PDF Extraction
                  </li>
                  <li className="flex items-center text-xs text-purple-700 font-medium">
                    <span className="mr-2">✨</span> Concept Mapping
                  </li>
                </ul>
             </div>
          </div>
          
          <button
            onClick={handleGenerateNotes}
            disabled={!sessionId || isGenerating}
            className={`${styles.primaryButton} bg-purple-600 hover:bg-purple-700 mt-6`}
          >
            {isGenerating ? 'Synthesizing...' : 'Regenerate Notes'}
          </button>
        </div>

        {/* Export Card */}
        <div className={styles.featureCard}>
          <div className={`${styles.iconWrapper} bg-emerald-50`}>
            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-4">Export & Takeaway</h3>
          <p className="text-slate-500 mb-6 text-sm">Download your synthesized knowledge in versatile formats for offline study.</p>
          
          <div className="space-y-3 mt-auto">
            <button
              onClick={() => handleExport('pdf')}
              disabled={!generatedNotes}
              className={styles.secondaryButton}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <span className="mr-2"></span> PDF Document
            </button>
            <button
              onClick={() => handleExport('markdown')}
              disabled={!generatedNotes}
              className={styles.secondaryButton}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <span className="mr-2"></span> Markdown File
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        {[
          { icon: '🎨', name: 'Whiteboard', path: '/whiteboard' },
          { icon: '🌌', name: 'AI Portal', path: '/ai-portal' },
          { icon: '🎯', name: 'Testing Hub', path: '/testing' },
          { icon: '📊', name: 'Spreadsheets', path: '/spreadsheet' }
        ].map(item => (
          <Link key={item.name} to={item.path} className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-xl hover:shadow-md transition-shadow">
            <span className="text-2xl">{item.icon}</span>
            <span className="font-bold text-slate-700">{item.name}</span>
          </Link>
        ))}
      </div>

      {/* Generated Preview */}
      {generatedNotes && (
        <div className={styles.previewContainer}>
          <div className={styles.previewHeader}>
            <h3 className="text-xl font-bold">Workspace Result</h3>
            <button onClick={() => setGeneratedNotes(null)} className="text-slate-400 hover:text-slate-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className={styles.previewBody}>
            {generatedNotes}
          </div>
        </div>
      )}

      {/* Notifications */}
      <div className="fixed bottom-8 right-8 space-y-4 z-50">
        {error && (
          <div className="animate-slide-up bg-red-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
             <span className="text-lg">⚠️</span>
             <p className="font-medium">{error}</p>
             <button onClick={() => setError(null)} className="ml-4 opacity-50 hover:opacity-100">✕</button>
          </div>
        )}
        {success && (
          <div className="animate-slide-up bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
             <span className="text-lg">✅</span>
             <p className="font-medium">{success}</p>
             <button onClick={() => setSuccess(null)} className="ml-4 opacity-50 hover:opacity-100">✕</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainFeatures;
