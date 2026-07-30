import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotes } from '../features/notes/context/NoteContext';
import { 
  Zap, 
  Plus, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Files, 
  Combine, 
  Flame,
  Brain,
  History,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useProgression } from '../contexts/ProgressionContext';

const FusionLab: React.FC = () => {
  const navigate = useNavigate();
  const { notes, createNote } = useNotes();
  const { addTokens } = useProgression();
  const [slotA, setSlotA] = useState<string | null>(null);
  const [slotB, setSlotB] = useState<string | null>(null);
  const [isFusing, setIsFusing] = useState(false);
  const [fusedNote, setFusedNote] = useState<{title: string, content: string} | null>(null);
  const [activeSlot, setActiveSlot] = useState<'A' | 'B' | null>(null);

  const noteA = useMemo(() => notes.find(n => n.id === slotA), [notes, slotA]);
  const noteB = useMemo(() => notes.find(n => n.id === slotB), [notes, slotB]);

  const handleFuse = async () => {
    if (!slotA || !slotB) {
      toast.error('Synthesis requires two neural datasets.');
      return;
    }
    if (slotA === slotB) {
      toast.error('Identity collision: Choose distinct notes.');
      return;
    }

    setIsFusing(true);
    toast('Initializing Neural Fusion Protocol...', { icon: '🔥' });

    try {
      const formData = new FormData();
      formData.append('note_a_title', noteA?.title || '');
      formData.append('note_a_content', noteA?.content || '');
      formData.append('note_b_title', noteB?.title || '');
      formData.append('note_b_content', noteB?.content || '');

      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/v1/fuse`, {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: formData,
      });

      const data = await response.json();

      if (data.fused_content) {
        const title = `Synthesis: ${noteA?.title.split(' ')[0]} x ${noteB?.title.split(' ')[0]}`;
        setFusedNote({ title, content: data.fused_content });
        addTokens(25, 'Neural Fusion Synthesis');
        toast.success('Fusion Complete: New Synthesis Generated');
      } else {
        throw new Error(data.error || 'Fusion failed');
      }
    } catch (err) {
      console.error('Fusion error:', err);
      toast.error('Neural fusion failed. Ensuring dataset stability.');
      
      // Fallback
      const title = `Synthesis: ${noteA?.title.split(' ')[0]} x ${noteB?.title.split(' ')[0]}`;
      const content = `## Neural Synthesis Report (Fallback)\n\n### Primary Intersection\nCombining concepts from **${noteA?.title}** and **${noteB?.title}**.\n\n### Synthesized Knowledge\n[SIMULATED] Logic density detected at overlap. Synthesis involves merging ${noteA?.title} structural logic with ${noteB?.title} specific insights.`;
      setFusedNote({ title, content });
    } finally {
      setIsFusing(false);
    }
  };

  const saveSynthesis = async () => {
    if (!fusedNote) return;
    try {
      const newNote = await createNote({
        title: fusedNote.title,
        content: fusedNote.content,
        tags: ['#synthesis', '#neural-fusion'],
        color: 'bg-indigo-50',
        isPinned: true,
        isArchived: false
      });
      toast.success('Synthesis saved to knowledge base');
      navigate(`/notes/${(newNote as any).id}`);
    } catch (err) {
      toast.error('Failed to preserve synthesis');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-16">
        <div className="flex items-center gap-6">
           <button onClick={() => navigate(-1)} className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 transition-all">
             <ArrowLeft size={20}/>
           </button>
           <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic leading-none mb-2">Neural <span className="text-blue-600">Fusion Lab</span></h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Synthetic Knowledge Generation • Protocol S4</p>
           </div>
        </div>
        <div className="flex gap-4">
           <button className="px-6 py-3 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all">
             <History size={16}/> Logs
           </button>
           <button className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all">
             <Brain size={16}/> System Health
           </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-12 items-center">
        {/* Slot A */}
        <div className="lg:col-span-4 flex flex-col items-center gap-8">
           <div 
             onClick={() => setActiveSlot('A')}
             className={`w-full aspect-[3/4] rounded-[48px] border-4 border-dashed transition-all flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer ${slotA ? 'bg-white border-blue-600 shadow-2xl shadow-blue-100' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}
           >
              {noteA ? (
                <div className="p-10 text-center animate-fade-in">
                   <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl group-hover:scale-110 transition-transform">📄</div>
                   <h3 className="text-xl font-black text-slate-800 mb-4 line-clamp-2">{noteA.title}</h3>
                   <p className="text-xs font-medium text-slate-400 line-clamp-4 leading-relaxed">{noteA.content}</p>
                   <button onClick={(e) => { e.stopPropagation(); setSlotA(null); }} className="absolute top-6 right-6 p-3 bg-slate-50 text-slate-300 rounded-xl hover:bg-rose-50 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 size={18}/>
                   </button>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center p-10 opacity-40">
                   <div className="w-20 h-20 bg-slate-200 rounded-[32px] flex items-center justify-center mb-6">
                      <Plus size={32} className="text-slate-400"/>
                   </div>
                   <h3 className="text-lg font-black text-slate-400 uppercase tracking-widest">Neural Link A</h3>
                   <p className="text-[10px] font-bold text-slate-400 mt-2">INSERT PRIMARY SUBJECT</p>
                </div>
              )}
              {isFusing && <div className="absolute inset-0 bg-blue-600/10 animate-pulse"></div>}
           </div>
        </div>

        {/* Reaction Core */}
        <div className="lg:col-span-4 flex flex-col items-center">
           <div className="relative w-full h-[400px] flex items-center justify-center">
              {/* Energy Waves */}
              <div className={`absolute inset-0 flex items-center justify-center pointer-events-none ${isFusing ? 'opacity-100' : 'opacity-20 transition-opacity'}`}>
                 <div className={`w-64 h-64 border-2 border-blue-500/30 rounded-full ${isFusing ? 'animate-[ping_1.5s_infinite]' : ''}`}></div>
                 <div className={`absolute w-48 h-48 border-2 border-blue-400/30 rounded-full ${isFusing ? 'animate-[ping_2s_infinite]' : ''}`}></div>
              </div>

              {/* Core Button */}
              <div className="relative z-10">
                 <motion.button
                   whileHover={{ scale: 1.1 }}
                   whileTap={{ scale: 0.9 }}
                   disabled={!slotA || !slotB || isFusing}
                   onClick={handleFuse}
                   className={`w-32 h-32 rounded-full shadow-2xl flex flex-col items-center justify-center transition-all border-8 border-white dark:border-slate-800 ${isFusing ? 'bg-orange-500 scale-125 animate-pulse text-white' : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-200'}`}
                 >
                    {isFusing ? <Flame size={32} className="animate-bounce"/> : <Combine size={32}/>}
                    <span className="text-[8px] font-black uppercase tracking-widest mt-2">Fuse</span>
                 </motion.button>
              </div>

              {/* Connection Lines (SVGs) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                 <path 
                   d="M 120,200 Q 200,200 250,200" 
                   fill="none" 
                   stroke={slotA ? '#3b82f6' : '#e2e8f0'} 
                   strokeWidth="3" 
                   strokeDasharray="5,5"
                   className={isFusing ? 'animate-[dash_1s_linear_infinite]' : ''} 
                 />
                 <path 
                   d="M 450,200 Q 370,200 320,200" 
                   fill="none" 
                   stroke={slotB ? '#3b82f6' : '#e2e8f0'} 
                   strokeWidth="3" 
                   strokeDasharray="5,5"
                   className={isFusing ? 'animate-[dash_1s_linear_infinite]' : ''} 
                 />
              </svg>
           </div>
           
           <div className="text-center mt-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100 mb-4">
                 <Zap size={12} className="text-blue-600"/>
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Logic Density Catalyst</span>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter italic">WARNING: High cognitive load during synthesis</p>
           </div>
        </div>

        {/* Slot B */}
        <div className="lg:col-span-4 flex flex-col items-center gap-8">
           <div 
             onClick={() => setActiveSlot('B')}
             className={`w-full aspect-[3/4] rounded-[48px] border-4 border-dashed transition-all flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer ${slotB ? 'bg-white border-blue-600 shadow-2xl shadow-blue-100' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}
           >
              {noteB ? (
                <div className="p-10 text-center animate-fade-in">
                   <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl group-hover:scale-110 transition-transform">📄</div>
                   <h3 className="text-xl font-black text-slate-800 mb-4 line-clamp-2">{noteB.title}</h3>
                   <p className="text-xs font-medium text-slate-400 line-clamp-4 leading-relaxed">{noteB.content}</p>
                   <button onClick={(e) => { e.stopPropagation(); setSlotB(null); }} className="absolute top-6 right-6 p-3 bg-slate-50 text-slate-300 rounded-xl hover:bg-rose-50 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 size={18}/>
                   </button>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center p-10 opacity-40">
                   <div className="w-20 h-20 bg-slate-200 rounded-[32px] flex items-center justify-center mb-6">
                      <Plus size={32} className="text-slate-400"/>
                   </div>
                   <h3 className="text-lg font-black text-slate-400 uppercase tracking-widest">Neural Link B</h3>
                   <p className="text-[10px] font-bold text-slate-400 mt-2">INSERT SECONDARY SUBJECT</p>
                </div>
              )}
              {isFusing && <div className="absolute inset-0 bg-blue-600/10 animate-pulse"></div>}
           </div>
        </div>
      </div>

      {/* Synthesis Result Overlay */}
      <AnimatePresence>
        {fusedNote && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 100 }}
            className="fixed inset-0 z-[150] flex items-center justify-center p-6"
          >
             <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" onClick={() => setFusedNote(null)}></div>
             <div className="bg-white rounded-[56px] p-12 max-w-4xl w-full max-h-[85vh] overflow-hidden shadow-3xl relative flex flex-col">
                <div className="flex justify-between items-center mb-10">
                   <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl">⚡</div>
                      <div>
                         <h2 className="text-3xl font-black text-slate-900 tracking-tight italic">Synthesis preserved</h2>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Neural Cohesion Confirmed</p>
                      </div>
                   </div>
                   <button onClick={() => setFusedNote(null)} className="w-12 h-12 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400">
                      <ArrowRight size={24}/>
                   </button>
                </div>

                <div className="flex-1 overflow-y-auto mb-10 px-4">
                   <h3 className="text-4xl font-black text-slate-900 mb-8 tracking-tighter">{fusedNote.title}</h3>
                   <div className="prose prose-slate prose-lg max-w-none">
                      <div className="whitespace-pre-wrap font-medium text-slate-600 leading-relaxed tabular-nums">
                         {fusedNote.content}
                      </div>
                   </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-[32px] flex items-center justify-between border border-slate-100">
                   <div className="flex items-center gap-4">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Action Protocol</span>
                      <div className="flex gap-2">
                         <span className="px-3 py-1 bg-white border border-slate-100 rounded-lg text-[10px] font-black text-blue-600">PRESERVE</span>
                         <span className="px-3 py-1 bg-white border border-slate-100 rounded-lg text-[10px] font-black text-slate-400">DISCARD</span>
                      </div>
                   </div>
                   <button 
                     onClick={saveSynthesis}
                     className="px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-indigo-200 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                   >
                     Commit to Brain <ArrowRight size={16}/>
                   </button>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Note Selector Modal */}
      <AnimatePresence>
        {activeSlot && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[160] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-md"
          >
             <div className="bg-white rounded-[48px] w-full max-w-2xl max-h-[70vh] flex flex-col overflow-hidden shadow-3xl">
                <div className="p-8 border-b flex justify-between items-center">
                   <h3 className="text-xl font-black text-slate-900 italic">Select Subject for Slot {activeSlot}</h3>
                   <button onClick={() => setActiveSlot(null)} className="text-xs font-black uppercase text-slate-400 hover:text-slate-900">Close</button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                   {notes.map(note => (
                     <button 
                       key={note.id}
                       onClick={() => {
                         if (activeSlot === 'A') setSlotA(note.id);
                         else setSlotB(note.id);
                         setActiveSlot(null);
                         toast.success(`Data-Link ${activeSlot} Established`);
                       }}
                       className={`w-full text-left p-6 rounded-[28px] hover:bg-slate-50 transition-all flex items-center justify-between group ${(activeSlot === 'A' ? slotA : slotB) === note.id ? 'bg-blue-50 border-blue-100' : 'border border-transparent'}`}
                     >
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-lg group-hover:scale-110 transition-transform">📄</div>
                           <div>
                              <h4 className="font-black text-slate-800">{note.title}</h4>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(note.updatedAt).toLocaleDateString()}</p>
                           </div>
                        </div>
                        <Plus size={18} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                     </button>
                   ))}
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -10;
          }
        }
      `}</style>
    </div>
  );
};

export default FusionLab;
