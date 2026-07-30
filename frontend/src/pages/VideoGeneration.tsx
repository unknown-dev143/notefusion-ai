import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Type, FileText, Play, Film, Layers, Monitor, Sliders, Wand2, Download, History, SkipForward, SkipBack } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { api, handleApiError } from '../lib/api';

const VideoGeneration: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [script, setScript] = useState('Welcome to today\'s lesson on Quantum Mechanics. It is a fundamental theory in physics that provides a description of the physical properties of nature at the scale of atoms and subatomic particles.');
  const [generating, setGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentCaption, setCurrentCaption] = useState('');
  const [captionIndex, setCaptionIndex] = useState(0);
  const [simplifyMode, setSimplifyMode] = useState(false);
  const [activeStyle, setActiveStyle] = useState('Modern Clean');
  const playerInterval = useRef<NodeJS.Timeout | null>(null);

  const styles = [
      { name: 'Modern Clean', bg: 'bg-rose-600', text: 'text-white' },
      { name: 'Bold & Pop', bg: 'bg-yellow-400', text: 'text-black' },
      { name: 'Typewriter', bg: 'bg-slate-900', text: 'text-emerald-400' },
      { name: 'Subtitle', bg: 'bg-black/60', text: 'text-white' }
  ];

  const getCaptions = (text: string) => {
    return text.match(/[^.!?]+[.!?]+/g) || [text];
  };

  const handleGenerate = async () => {
    if (!prompt && !script) {
        toast.error("Provide a script signature or prompt.");
        return;
    }
    setGenerating(true);
    try {
      const formData = new FormData();
      formData.append('content', script || prompt);
      formData.append('simplify', simplifyMode.toString());

      const response = await api.post('/ai/video-script', formData);
      
      if (response.data.captions) {
        setScript(response.data.captions.join(' '));
        toast.success("Script nodes synchronized.");
        setIsPlaying(true);
      } else {
        throw new Error(response.data.error || 'Failed to generate script');
      }
    } catch (error) {
      toast.error(handleApiError(error, 'Video synchronization failed'));
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      const captions = getCaptions(simplifyMode ? "Quantum physics is just how tiny things like atoms work! It explains nature at the very smallest scale." : script);
      
      setCaptionIndex(0);
      setCurrentCaption(captions[0] || '');

      let i = 0;
      playerInterval.current = setInterval(() => {
        i++;
        if (i < captions.length) {
          setCaptionIndex(i);
          setCurrentCaption(captions[i]);
        } else {
          setIsPlaying(false);
          setCurrentCaption('');
          if (playerInterval.current) clearInterval(playerInterval.current);
          toast("Preview cycle complete", { icon: '🎬' });
        }
      }, 3500);
    } else {
      if (playerInterval.current) clearInterval(playerInterval.current);
    }

    return () => {
      if (playerInterval.current) clearInterval(playerInterval.current);
    };
  }, [isPlaying, script, simplifyMode]);

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-10 animate-fade-in font-sans">
      {/* Cinematic Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16 border-b border-slate-100 pb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-rose-600 rounded-2xl flex items-center justify-center shadow-xl shadow-rose-200">
                <Film className="text-white" size={20} />
              </div>
              <span className="text-[10px] font-black text-rose-600 uppercase tracking-[0.4em]">Neural Cinema Engine V2</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-none italic">Cinema <span className="text-rose-600">Studio</span></h1>
            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[11px] mt-4 ml-1">Animate complex research into high-impact visual segments</p>
          </div>
          <div className="flex gap-4">
            <button className="flex items-center gap-3 px-8 py-4 bg-slate-50 border border-slate-100 rounded-[24px] text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-rose-600 hover:bg-white transition-all">
              <History size={16} /> Load Timeline
            </button>
            <button className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-[24px] text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-xl">
              <Download size={16} /> Export MP4
            </button>
          </div>
      </div>

       <div className="grid lg:grid-cols-12 gap-12">
        {/* Storyboard Panel */}
        <div className="lg:col-span-4 space-y-8">
           <div className="bg-white border border-slate-100 rounded-[48px] p-10 shadow-2xl shadow-slate-200/50 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-rose-600 to-pink-500"></div>
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-10">Storyboard Directives</h2>
              
              <div className="space-y-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Visual Atmosphere</label>
                    <textarea 
                       rows={3}
                       className="w-full p-6 bg-slate-50 rounded-[28px] font-bold text-sm outline-none focus:ring-4 focus:ring-rose-500/10 focus:bg-white transition-all resize-none border border-slate-50 placeholder:text-slate-300"
                       placeholder="Describe the cinematic style and visual cues..."
                       value={prompt}
                       onChange={e => setPrompt(e.target.value)}
                    ></textarea>
                 </div>

                 <div className="space-y-3">
                    <div className="flex items-center justify-between px-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                           Narration Nodes <FileText size={10} />
                        </label>
                        <button className="text-[10px] font-black text-rose-600 uppercase tracking-widest flex items-center gap-2 hover:underline">
                            <Wand2 size={12}/> AI Script
                        </button>
                    </div>
                    <textarea 
                       rows={5}
                       className="w-full p-6 bg-slate-50 rounded-[28px] font-bold text-sm outline-none focus:ring-4 focus:ring-rose-500/10 focus:bg-white transition-all resize-none border border-slate-50"
                       placeholder="Text to be spoken and synchronized..."
                       value={script}
                       onChange={e => setScript(e.target.value)}
                    ></textarea>
                 </div>

                 <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="block text-[10px] font-black text-slate-700 uppercase tracking-widest">Simplify Logic</span>
                            <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Use ELI5 processing</span>
                        </div>
                        <button 
                            onClick={() => setSimplifyMode(!simplifyMode)}
                            className={`w-14 h-8 rounded-full p-1.5 transition-all ${simplifyMode ? 'bg-rose-600' : 'bg-slate-300'}`}
                        >
                            <div className={`w-5 h-5 bg-white rounded-full shadow-lg transition-transform ${simplifyMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </button>
                    </div>
                 </div>

                 <button 
                   onClick={handleGenerate}
                   disabled={generating || isPlaying}
                   className="w-full py-6 bg-slate-900 text-white rounded-[32px] font-black text-xs uppercase tracking-[0.3em] shadow-[0_20px_40px_-10px_rgba(225,29,72,0.3)] hover:bg-rose-600 hover:shadow-rose-200 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                 >
                   {generating ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        Rendering...
                      </>
                   ) : isPlaying ? (
                      'Simulating Preview...'
                   ) : (
                      <>
                        <Sparkles size={18} />
                        Establish Timeline
                      </>
                   )}
                 </button>
              </div>
           </div>

           <div className="bg-[#0F172A] rounded-[48px] p-10 text-white relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
               <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-8 border-b border-white/5 pb-4">Render Parameters</h3>
               <div className="space-y-6">
                  {[
                      { label: 'Framerate', val: '60 FPS' },
                      { label: 'Bitrate', val: '12 Mbps' },
                      { label: 'Codec', val: 'H.265 / HEVC' },
                      { label: 'Audio', val: 'Neural Voice Alpha' },
                  ].map(spec => (
                      <div key={spec.label} className="flex justify-between items-center text-[10px] font-black">
                          <span className="text-white/30 uppercase tracking-[0.2em]">{spec.label}</span>
                          <span className="text-rose-400">{spec.val}</span>
                      </div>
                  ))}
               </div>
           </div>
        </div>

        {/* Video Stage */}
        <div className="lg:col-span-8 space-y-12">
           <div className="bg-slate-900 rounded-[64px] aspect-video flex items-center justify-center relative shadow-2xl overflow-hidden group border-[12px] border-slate-800">
              {/* Video Content Placeholder */}
              <div className={`absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 transition-all duration-1000 ${isPlaying ? 'opacity-100 scale-105' : 'opacity-40'}`}>
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.4)_100%)]"></div>
                 {isPlaying && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1.2 }}
                        className="absolute inset-0 flex items-center justify-center opacity-10"
                    >
                       <span className="text-[200px] animate-pulse">⚛️</span>
                    </motion.div>
                 )}
              </div>

              {generating ? (
                 <div className="relative z-10 text-center">
                    <div className="w-20 h-20 border-[6px] border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-10 shadow-2xl shadow-rose-500/20"></div>
                    <p className="text-[11px] font-black text-rose-500 uppercase tracking-[0.5em] animate-pulse">Synthesizing Captions...</p>
                 </div>
              ) : !isPlaying ? (
                 <div className="relative z-10 text-center group-hover:scale-110 transition-transform duration-1000">
                    <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center text-5xl mb-8 backdrop-blur-3xl border border-white/10 shadow-2xl">🎬</div>
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.4em]">Awaiting Timeline Commit</h3>
                 </div>
              ) : (
                 /* Live Captions Overlay */
                 <div className="absolute bottom-16 left-12 right-12 text-center z-20">
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={captionIndex}
                            initial={{ opacity: 0, y: 30, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 1.1 }}
                            transition={{ duration: 0.5, type: 'spring' }}
                            className={`inline-block px-10 py-6 rounded-[32px] shadow-2xl border border-white/20 backdrop-blur-xl ${styles.find(s => s.name === activeStyle)?.bg}`}
                        >
                           <p className={`text-2xl md:text-4xl font-black leading-tight drop-shadow-lg tracking-tight ${styles.find(s => s.name === activeStyle)?.text}`}>
                              {currentCaption}
                           </p>
                        </motion.div>
                    </AnimatePresence>
                 </div>
              )}
              
              {/* Playback UX */}
              <div className="absolute bottom-10 left-10 flex items-center gap-4 z-30 opacity-0 group-hover:opacity-100 transition-all">
                  <button className="w-12 h-12 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center text-white border border-white/10 hover:bg-white/20 transition-all"><SkipBack size={20}/></button>
                  <button className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl transition-all ${isPlaying ? 'bg-rose-600 text-white scale-110' : 'bg-white text-slate-900 hover:scale-110'}`} onClick={() => setIsPlaying(!isPlaying)}>
                      <Play size={24} fill={isPlaying ? "white" : "currentColor"} />
                  </button>
                   <button className="w-12 h-12 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center text-white border border-white/10 hover:bg-white/20 transition-all"><SkipForward size={20}/></button>
              </div>

              {isPlaying && (
                 <div className="absolute top-10 right-10 bg-rose-600 px-6 py-2 rounded-full border border-rose-400 shadow-2xl flex items-center gap-3 animate-slide-in">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Live Synth Preview</span>
                 </div>
              )}

              <div className="absolute top-10 left-10 flex gap-2 z-30 opacity-50">
                  <Layers size={20} className="text-white" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Stage Layer v01</span>
              </div>
           </div>

           <div className="flex flex-col md:flex-row gap-8">
               <div className="flex-1 bg-white border border-slate-100 rounded-[48px] p-8 shadow-sm">
                   <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                            <Sliders size={20} />
                         </div>
                         <h3 className="font-black text-slate-900 text-lg tracking-tight leading-none italic">Caption Stylings</h3>
                      </div>
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Active Schema: Modern</span>
                   </div>
                   
                   <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                      {styles.map((style) => (
                         <button 
                            key={style.name} 
                            onClick={() => setActiveStyle(style.name)}
                            className={`flex-shrink-0 px-8 py-4 rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] border transition-all ${activeStyle === style.name ? 'bg-slate-900 text-white border-slate-900 shadow-xl scale-105' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'}`}
                        >
                            {style.name}
                         </button>
                      ))}
                   </div>
               </div>

               <div className="w-full md:w-64 bg-slate-50 border border-slate-100 rounded-[48px] p-8 flex flex-col items-center justify-center text-center">
                    <Monitor size={32} className="text-slate-300 mb-4" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Preview Mode</p>
                    <p className="text-[11px] font-bold text-slate-800 uppercase mt-2">1080p | Logic V2</p>
               </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default VideoGeneration;
