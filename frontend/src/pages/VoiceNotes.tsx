import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Mic, 
  Square, 
  Play, 
  Pause, 
  Download, 
  FileText, 
  Loader, 
  Sparkles, 
  Zap, 
  Brain, 
  Radio, 
  Trash2,
  Share2,
  Save,
  ChevronRight,
  TrendingUp,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useNotes } from '../features/notes/context/NoteContext';
import { api, handleApiError } from '../lib/api';
import AIService from '../features/ai/services/AIService';

const VoiceNotes: React.FC = () => {
  const { createNote } = useNotes();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [transcription, setTranscription] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [activeStage, setActiveStage] = useState<'record' | 'review' | 'insights'>('record');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Canvas Waveform Logic
  const drawWaveform = useCallback(() => {
    if (!canvasRef.current || !analyserRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);
      analyserRef.current?.getByteTimeDomainData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#3b82f6';
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();

      // Add glow
      ctx.shadowBlur = 15;
      ctx.shadowColor = 'rgba(59, 130, 246, 0.5)';
    };

    render();
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
      if (audioURL) URL.revokeObjectURL(audioURL);
    };
  }, [audioURL]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Initialize Audio Context for visualization
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      drawWaveform();

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
        setActiveStage('review');
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast.success('Neural Audio Uplink Active!', { icon: '🎙️' });
    } catch (error) {
      toast.error('Failed to access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      toast.success('Recording Synchronized');
    }
  };

  const transcribeAudio = async () => {
    if (!audioBlob) return;
    setIsTranscribing(true);
    
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.webm');
      
      const response = await api.post('/ai/transcribe', formData);
      
      if (response.data.content) {
        setTranscription(response.data.content);
        setActiveStage('insights');
        toast.success('AI Transcription Complete', { icon: '🧠' });
      } else {
        throw new Error(response.data.error || 'Transcription failed');
      }
    } catch (error) {
      toast.error(handleApiError(error, 'Transcription failed'));
    } finally {
      setIsTranscribing(false);
    }
  };

  const saveAsNote = async () => {
    if (!transcription) return;

    try {
      await createNote({
        title: `Neural Audio Log - ${new Date().toLocaleDateString()}`,
        content: `# Voice Note Transcription\n\n**Duration**: ${formatTime(recordingTime)}\n\n## Transcription\n\n${transcription}`,
        tags: ['voice', 'neural', 'audio'],
        isPinned: false,
        isArchived: false,
        color: '#fef3c7'
      } as any);

      toast.success('Log Saved to Archive');
    } catch (error) {
      toast.error('Failed to save note');
    }
  };

  const generateStudyGuide = async () => {
    if (!transcription) {
      toast.error('No transcription available. Record and transcribe first.');
      return;
    }
    const toastId = toast.loading('Generating AI Study Guide...');
    try {
      const guide = await AIService.generateStudyGuide(transcription);
      
      const studyGuideMarkdown = [
        `# 🎓 Study Guide — ${new Date().toLocaleDateString()}`,
        `> Generated from voice recording (${formatTime(recordingTime)})`,
        '',
        '## 📝 Executive Summary',
        guide.summary || 'Summary unavailable.',
        '',
        '## 🔑 Key Concepts',
        (guide.keyPoints || []).map((p: string) => `- ${p}`).join('\n') || '- No key points extracted.',
        '',
        '## ✅ Action Items',
        (guide.actionItems || []).map((p: string) => `- [ ] ${p}`).join('\n') || '- No action items detected.',
        '',
        '## ❓ Review Questions',
        (guide.questions || []).map((q: string, i: number) => `${i + 1}. ${q}`).join('\n') || '1. What were the main takeaways?',
        '',
        '## 📻 Raw Transcription',
        transcription,
      ].join('\n');

      await createNote({
        title: `Study Guide — ${new Date().toLocaleDateString()}`,
        content: studyGuideMarkdown,
        tags: ['study-guide', 'voice', 'ai-generated'],
        isPinned: true,
        isArchived: false,
        color: '#ede9fe'
      } as any);

      toast.success('Study Guide Created & Pinned! 🎓');
    } catch (err) {
      toast.error(handleApiError(err, 'Failed to generate study guide'));
    } finally {
      toast.dismiss(toastId);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 animate-slide-up bg-slate-950 min-h-screen">
      {/* Header HUD */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16 border-b border-white/5 pb-10">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[32px] flex items-center justify-center shadow-2xl shadow-blue-500/20">
            <Radio size={36} className="text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-5xl font-black text-white tracking-tighter leading-none mb-2 italic">
               Neural <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Audio Lab</span>
            </h1>
            <div className="flex items-center gap-3">
               <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></span>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Protocol active • Multi-language enabled</p>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
           {['record', 'review', 'insights'].map(stage => (
             <button 
               key={stage}
               onClick={() => audioURL && setActiveStage(stage as any)}
               className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeStage === stage ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'text-slate-500 hover:text-slate-300'}`}
               disabled={!audioURL && stage !== 'record'}
             >
               {stage}
             </button>
           ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        
        {/* Main Recording Stage */}
        <div className="lg:col-span-8 space-y-8">
           <div className="bg-slate-900 border border-white/5 rounded-[64px] p-16 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full -mr-48 -mt-48 blur-3xl group-hover:bg-blue-600/10 transition-all duration-1000"></div>
              
              {/* Waveform Visualization Area */}
              <div className="h-64 flex flex-col items-center justify-center mb-12 relative z-10">
                 <AnimatePresence mode="wait">
                    {isRecording ? (
                       <motion.div 
                         key="canvas"
                         initial={{ opacity: 0 }}
                         animate={{ opacity: 1 }}
                         exit={{ opacity: 0 }}
                         className="w-full h-40 flex items-center justify-center"
                       >
                          <canvas ref={canvasRef} width={600} height={160} className="w-full max-w-2xl opacity-80" />
                       </motion.div>
                    ) : (
                       <motion.div 
                         key="idle"
                         initial={{ opacity: 0, scale: 0.9 }}
                         animate={{ opacity: 1, scale: 1 }}
                         exit={{ opacity: 0, scale: 0.9 }}
                         className="text-center"
                       >
                          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10 group-hover:scale-110 transition-transform cursor-pointer" onClick={startRecording}>
                             <Mic size={40} className="text-blue-500" />
                          </div>
                          <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Awaiting Uplink</p>
                       </motion.div>
                    )}
                 </AnimatePresence>
              </div>

              {/* Timer HUD */}
              <div className="text-center mb-16 relative z-10">
                 <div className="text-8xl font-black text-white tracking-tighter mb-4 italic lining-nums">
                    {formatTime(recordingTime)}
                 </div>
                 <div className="flex items-center justify-center gap-6">
                    <div className="flex items-center gap-3 bg-white/5 px-6 py-2.5 rounded-full border border-white/10">
                       <Activity size={16} className="text-blue-500" />
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sensitivity: High</span>
                    </div>
                    <div className="flex items-center gap-3 bg-white/5 px-6 py-2.5 rounded-full border border-white/10">
                       <TrendingUp size={16} className="text-emerald-500" />
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Neural Gain: Auto</span>
                    </div>
                 </div>
              </div>

              {/* Recording Controls */}
              <div className="flex items-center justify-center gap-8 relative z-10">
                 {!isRecording && !audioURL ? (
                    <button 
                      onClick={startRecording}
                      className="w-24 h-24 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/20 hover:scale-110 active:scale-95 transition-all outline-none ring-8 ring-blue-600/10"
                    >
                       <Mic size={40} className="text-white" />
                    </button>
                 ) : isRecording ? (
                    <div className="flex items-center gap-6">
                       <button onClick={stopRecording} className="w-24 h-24 bg-red-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-red-500/20 hover:scale-110 transition-all outline-none ring-8 ring-red-600/10">
                          <Square size={32} fill="white" />
                       </button>
                       <button 
                         onClick={() => setIsPaused(!isPaused)} 
                         className="w-16 h-16 bg-white/5 text-white rounded-full flex items-center justify-center border border-white/10 hover:bg-white/10 transition-all"
                       >
                          {isPaused ? <Play size={24} /> : <Pause size={24} />}
                       </button>
                    </div>
                 ) : (
                    <div className="flex items-center gap-6">
                       <button 
                         onClick={() => { setAudioURL(null); setRecordingTime(0); setActiveStage('record'); }} 
                         className="px-10 py-5 bg-white/5 text-slate-300 rounded-[28px] font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all border border-white/10"
                       >
                          New Session
                       </button>
                       <button 
                         onClick={transcribeAudio}
                         className="px-12 py-5 bg-blue-600 text-white rounded-[28px] font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/20 hover:bg-blue-700 transition-all"
                       >
                          Initiate AI Synthesis
                       </button>
                    </div>
                 )}
              </div>
           </div>

           {/* Audio Player Card (Review Mode) */}
           <AnimatePresence>
             {audioURL && activeStage === 'review' && (
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -20 }}
                 className="bg-white/5 border border-white/10 rounded-[40px] p-10 backdrop-blur-xl"
               >
                  <div className="flex items-center gap-4 mb-8">
                     <Activity size={20} className="text-blue-500" />
                     <h3 className="text-xl font-black text-white tracking-tight">Audio Playback HUD</h3>
                  </div>
                  <audio src={audioURL} controls className="w-full filter invert hue-rotate-180 opacity-80" />
                  
                  <div className="mt-10 flex gap-4">
                     <button onClick={() => toast.success('Link Generated')} className="flex-1 py-5 bg-white/5 text-slate-300 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all border border-white/5 flex items-center justify-center gap-3">
                        <Share2 size={16} /> Share Link
                     </button>
                     <button className="flex-1 py-5 bg-white/5 text-slate-300 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all border border-white/5 flex items-center justify-center gap-3">
                        <Download size={16} /> Export File
                     </button>
                     <button className="px-8 py-5 bg-red-900/20 text-red-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-900/30 transition-all border border-red-900/30">
                        <Trash2 size={16} />
                     </button>
                  </div>
               </motion.div>
             )}
           </AnimatePresence>

           {/* Insights HUD (Insights Mode) */}
           <AnimatePresence>
              {activeStage === 'insights' && (
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.95 }}
                   className="space-y-8"
                 >
                    <div className="bg-white border border-slate-200 rounded-[56px] p-16 shadow-3xl text-slate-900">
                       <div className="flex justify-between items-center mb-12">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200">
                                <Brain size={28} />
                             </div>
                             <h3 className="text-3xl font-black tracking-tight">AI Insights Lab</h3>
                          </div>
                           <div className="flex gap-3">
                              <button onClick={saveAsNote} className="px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:shadow-2xl transition-all shadow-xl shadow-slate-200 flex items-center gap-2">
                                 <Save size={16} /> Save Note
                              </button>
                              <button onClick={generateStudyGuide} className="px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-purple-200 flex items-center gap-2">
                                 <Sparkles size={16} /> Study Guide
                              </button>
                           </div>
                        </div>

                       {isTranscribing ? (
                          <div className="py-24 text-center">
                             <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-8"></div>
                             <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Synthesizing Neural Data...</p>
                          </div>
                       ) : (
                          <div className="prose prose-slate prose-lg max-w-none prose-headings:font-black prose-p:font-medium prose-p:text-slate-600">
                             <div className="whitespace-pre-wrap leading-relaxed font-sans">
                                {transcription}
                             </div>
                          </div>
                       )}
                    </div>
                 </motion.div>
              )}
           </AnimatePresence>
        </div>

        {/* Sidebar: Analytics & Related */}
        <div className="lg:col-span-4 space-y-8">
           <div className="bg-slate-900 border border-white/5 rounded-[40px] p-8 shadow-2xl">
              <h4 className="text-xs font-black text-blue-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                 <Radio size={16} /> Broadcast HUD
              </h4>
              
              <div className="space-y-6">
                 <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Network Load</p>
                    <div className="flex items-center justify-between">
                       <span className="text-2xl font-black text-white italic">0.82 <span className="text-slate-500 text-xs font-bold">ms</span></span>
                       <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-[8px] font-black uppercase tracking-tighter">Optimized</span>
                    </div>
                 </div>

                 <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Entropy Stage</p>
                    <div className="flex items-center justify-between">
                       <span className="text-2xl font-black text-white italic">Clear</span>
                       <TrendingUp className="text-emerald-500" size={20} />
                    </div>
                 </div>
              </div>

              <div className="mt-10 pt-10 border-t border-white/5">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Discovery Stream</p>
                 <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                       <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer group">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400">
                                <FileText size={16} />
                             </div>
                             <span className="text-[10px] font-black text-slate-300 uppercase">Recent Log 0{i}</span>
                          </div>
                          <ChevronRight size={14} className="text-slate-600 group-hover:text-white transition-colors" />
                       </div>
                    ))}
                 </div>
              </div>
           </div>

           <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[40px] p-10 shadow-2xl shadow-indigo-500/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-all"></div>
              <Sparkles className="text-white/40 mb-6" size={32} />
              <h3 className="text-2xl font-black text-white tracking-tight mb-4 leading-tight">Accelerate Your Workflow</h3>
              <p className="text-indigo-100 text-sm font-medium mb-8 leading-relaxed">
                 AI Transcription is just the beginning. Use the <strong>Neural Synergy</strong> node to link audio logs with existing mind maps.
              </p>
              <button className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 transition-all">
                 Explore Synthesis →
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceNotes;
