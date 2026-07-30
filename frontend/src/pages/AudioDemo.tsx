import React, { useState } from 'react';
import toast from 'react-hot-toast';

const AudioDemo: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);

  const [transcription, setTranscription] = useState('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  const toggleRecording = () => {
    if (isRecording) {
      handleStop();
    } else {
      setIsRecording(true);
      setDuration(0);
      setTranscription('');
    }
  };

  const handleStop = async () => {
    setIsRecording(false);
    setIsSynthesizing(true);
    try {
      // Simulate sending recorded data for final transcription & synthesis
      await new Promise(resolve => setTimeout(resolve, 2000));
      setTranscription("The primary mechanism of action involves the synaptic neurotransmission across the pre-synaptic cleft, which regulates the flow of ions...");
      toast.success('Audio synthesized successfully!');
    } catch (e) {
      toast.error('Synthesis failed');
    } finally {
      setIsSynthesizing(false);
    }
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 animate-slide-up">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Recording Studio */}
        <div className="flex-1 space-y-8">
           <div className="bg-white border border-slate-100 rounded-[48px] p-12 shadow-2xl shadow-slate-200/50 text-center relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-1 bg-gradient-to-r from-transparent via-blue-600 to-transparent"></div>
              
              <div className="mb-12">
                 <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-4">Audio Fusion Engine</h1>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Real-time transcription & knowledge synthesis</p>
              </div>

              {/* Waveform Visualization (Mock) */}
              <div className="h-48 flex items-center justify-center gap-1 mb-12">
                 {[...Array(30)].map((_, i) => (
                    <div 
                       key={i} 
                       className={`w-1 rounded-full bg-blue-600 transition-all duration-300 ${isRecording ? 'animate-pulse' : 'opacity-20'}`}
                       style={{ height: isRecording ? `${Math.random() * 80 + 20}%` : '10%' }}
                    ></div>
                 ))}
              </div>

              <div className="mb-12">
                 <div className="text-6xl font-black text-slate-900 tabular-nums mb-2">{formatTime(duration)}</div>
                 <div className="flex items-center justify-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-300'}`}></div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isRecording ? 'Recording Live' : 'Studio Ready'}</span>
                 </div>
              </div>

              <div className="flex justify-center gap-6">
                 <button 
                  onClick={toggleRecording}
                  className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-xl ${isRecording ? 'bg-slate-900 text-white hover:bg-black' : 'bg-blue-600 text-white shadow-blue-200 hover:scale-105 active:scale-95'}`}
                 >
                    <span className="text-3xl">{isRecording ? '⏹' : '🎤'}</span>
                 </button>
              </div>
           </div>

           <div className="bg-slate-900 rounded-[40px] p-10 text-white relative overflow-hidden group">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-8">Live Intelligence Stream</h3>
              <div className="space-y-6">
                  <div className="flex gap-4 opacity-40">
                     <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2"></div>
                     <p className="text-sm font-medium leading-relaxed italic">
                        {isSynthesizing ? 'Neural Core: Processing frequencies...' : 'Synthesizing audio frequencies into semantic vectors...'}
                     </p>
                  </div>
                  {(isRecording || transcription) && (
                     <div className="flex gap-4 animate-fade-in relative">
                        <div className={`w-1.5 h-1.5 rounded-full ${isRecording ? 'bg-emerald-500' : 'bg-blue-600'} mt-2`}></div>
                        <p className={`text-sm ${isRecording ? 'text-white' : 'text-blue-100'} leading-relaxed`}>
                           {isRecording ? '"The primary mechanism of action involves the synaptic neurotransmission..."' : transcription}
                        </p>
                        {!isRecording && transcription && (
                           <div className="absolute -top-6 right-0 bg-blue-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase">Synthesized</div>
                        )}
                     </div>
                  )}
              </div>
           </div>
        </div>

        {/* Library Sidebar */}
        <div className="lg:w-96 space-y-8">
           <div className="bg-white border border-slate-100 rounded-[40px] p-10 shadow-sm">
              <div className="flex justify-between items-center mb-10">
                 <h3 className="text-xl font-black text-slate-900 tracking-tight">Fusion Vault</h3>
                 <span className="text-[10px] font-black text-blue-600 border border-blue-100 px-3 py-1 rounded-full uppercase tracking-tighter">8 Total</span>
              </div>

              <div className="space-y-4">
                 {[
                   { title: 'Philosophy Lecture', time: '12:04', date: 'Yesterday' },
                   { title: 'AI Ethics Seminar', time: '45:30', date: '2 days ago' },
                   { title: 'Lab Meeting Notes', time: '18:15', date: 'Oct 12' },
                 ].map((audio, i) => (
                    <div key={i} className="p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all cursor-pointer group">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-lg group-hover:scale-110 transition-transform">🎧</div>
                          <div className="flex-1 overflow-hidden">
                             <h4 className="font-bold text-sm text-slate-800 truncate">{audio.title}</h4>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{audio.time} • {audio.date}</p>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
              <button className="w-full mt-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all">Upload Pre-recorded</button>
           </div>

           <div className="bg-blue-600 rounded-[40px] p-8 text-white shadow-xl shadow-blue-100">
              <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-60">Synthesis Feature</h4>
              <h3 className="text-lg font-black leading-tight mb-4">Auto-Diagram Extraction</h3>
              <p className="text-xs font-medium text-blue-50 leading-relaxed mb-6">Our AI can now automatically generate Whiteboard mindmaps from your audio recordings.</p>
              <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                 <div className="w-3/4 h-full bg-white"></div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AudioDemo;
