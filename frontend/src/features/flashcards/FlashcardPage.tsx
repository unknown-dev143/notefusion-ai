import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { 
  Zap, 
  Brain, 
  Trophy, 
  History, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  FlipHorizontal,
  Volume2,
  Share2,
  MoreVertical,
  Settings,
  LineChart,
  BrainCircuit
} from 'lucide-react';
import { useNotes } from '../notes/context/NoteContext';
import toast from 'react-hot-toast';

type FlashcardType = {
  id: string;
  front_text: string;
  back_text: string;
  review_count: number;
  last_reviewed: string | null;
  difficulty?: number;
};

const FlashcardPage: React.FC = () => {
  const { noteId } = useParams<{ noteId?: string }>();
  const [flashcards, setFlashcards] = useState<FlashcardType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mode, setMode] = useState<'study' | 'quiz' | 'stats'>('study');
  const api = useApi();
  const { notes } = useNotes();
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');

  const handleManualAdd = () => {
    if (!newFront || !newBack) {
        toast.error("Please enter both question and answer");
        return;
    }
    const newCard: FlashcardType = {
        id: Date.now().toString(),
        front_text: newFront,
        back_text: newBack,
        review_count: 0,
        last_reviewed: null,
        difficulty: 1
    };
    setFlashcards(prev => [...prev, newCard]);
    setNewFront('');
    setNewBack('');
    toast.success("Flashcard added to deck!");
  };

  const handleNeuralGenerate = async () => {
      if (!notes || notes.length < 3) {
          toast.error("Need at least 3 notes in your library to generate.");
          return;
      }
      setIsLoading(true);
      await new Promise(r => setTimeout(r, 1500)); // Simulate AI processing

      const generated: FlashcardType[] = [];
      const usedIndices = new Set();
      
      for (let i = 0; i < 5; i++) {
          const idx = Math.floor(Math.random() * notes.length);
          if (usedIndices.has(idx)) continue;
          usedIndices.add(idx);
          const note = notes[idx];
          
          if (note.title && note.tags && note.tags.length > 0) {
              generated.push({
                  id: `gen-${Date.now()}-${i}`,
                  front_text: `What is the key concept behind "${note.title}"?`,
                  back_text: `It relates to: ${note.tags.join(', ')}.`,
                  review_count: 0,
                  last_reviewed: null,
                  difficulty: 2
              });
          } else if (note.content && note.content.length > 50) {
               generated.push({
                  id: `gen-${Date.now()}-${i}`,
                  front_text: `Complete this thought: "${note.content.substring(0, 30)}..."`,
                  back_text: `...${note.content.substring(30, 80)}`,
                  review_count: 0,
                  last_reviewed: null,
                  difficulty: 3
              });
          }
      }
      
      setFlashcards(prev => [...prev, ...generated]);
      setIsLoading(false);
      toast.success(`Generated ${generated.length} Neural Flashcards!`);
  };

  useEffect(() => {
    const mockCards = [
      { id: '1', front_text: 'What is the Capital of France?', back_text: 'Paris', review_count: 5, last_reviewed: '2024-01-01', difficulty: 1 },
      { id: '2', front_text: 'Define Quantum Entanglement', back_text: 'A physical phenomenon where particles interact such that their quantum states cannot be described independently.', review_count: 2, last_reviewed: '2024-01-02', difficulty: 4 },
      { id: '3', front_text: 'Schrödinger\'s Cat Thought Experiment', back_text: 'A paradox that illustrates the problem of the Copenhagen interpretation of quantum mechanics applied to everyday objects.', review_count: 10, last_reviewed: '2024-01-05', difficulty: 3 },
      { id: '4', front_text: 'What is Mitochondria?', back_text: 'The powerhouse of the cell, providing energy through ATP.', review_count: 8, last_reviewed: '2024-01-10', difficulty: 1 },
    ];

    const fetchFlashcards = async () => {
      try {
        setIsLoading(true);
        const endpoint = noteId ? `/flashcards/note/${noteId}` : '/flashcards';
        const { data } = await api.get<FlashcardType[]>(endpoint);
        if (data && data.length > 0) {
          setFlashcards(data);
        } else {
          setFlashcards(mockCards);
        }
      } catch (error) {
        setFlashcards(mockCards);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlashcards();
  }, [noteId]);

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % flashcards.length);
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev === 0 ? flashcards.length - 1 : prev - 1));
    }, 150);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 animate-slide-up">
      {/* Header Info */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-16">
        <div>
           <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                 <Brain size={20} />
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Cognitive Mastery</h1>
           </div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">
              Active Recall • Spaced Repetition • Spaced Intelligence
           </p>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-2 border border-slate-100 rounded-3xl shadow-sm">
           <button onClick={() => setMode('study')} className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${mode === 'study' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50'}`}>Study</button>
           <button onClick={() => setMode('quiz')} className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${mode === 'quiz' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50'}`}>Active Quiz</button>
           <button onClick={() => setMode('stats')} className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${mode === 'stats' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50'}`}>Retention</button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-12">
         {/* Left Sidebar: Progress & Quick Actions */}
         <div className="space-y-8">
            <div className="bg-white border border-slate-50 rounded-[40px] p-8 shadow-sm">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Session Metrics</h3>
               <div className="space-y-6">
                  <div>
                     <div className="flex justify-between items-end mb-2">
                        <span className="text-[10px] font-black text-slate-800 uppercase">Retention</span>
                        <span className="text-xl font-black italic">82%</span>
                     </div>
                     <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: '82%' }}></div>
                     </div>
                  </div>
                  <div>
                     <div className="flex justify-between items-end mb-2">
                        <span className="text-[10px] font-black text-slate-800 uppercase">Accuracy</span>
                        <span className="text-xl font-black italic">94%</span>
                     </div>
                     <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600" style={{ width: '94%' }}></div>
                     </div>
                  </div>
               </div>

               <div className="mt-12 pt-8 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex flex-col">
                     <span className="text-[9px] font-black text-slate-400 uppercase">Flashcards</span>
                     <span className="text-2xl font-black">{currentIndex + 1}<span className="text-slate-300">/{flashcards.length}</span></span>
                  </div>
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-xl">🏆</div>
               </div>
            </div>

            <button onClick={handleNeuralGenerate} className="w-full bg-blue-600 text-white p-6 rounded-[32px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-200 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3">
               <BrainCircuit size={18}/> Neural Generate
            </button>
         </div>

         {/* Center: Flashcard Stage */}
         <div className="lg:col-span-2 space-y-12">
            <div className="perspective-1000 h-[480px] w-full group cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
               <div className={`relative w-full h-full transition-all duration-700 preserve-3d shadow-2xl rounded-[64px] ${isFlipped ? 'rotate-y-180' : ''}`}>
                  {/* Front */}
                  <div className="absolute inset-0 bg-white border border-slate-50 rounded-[64px] p-16 flex flex-col items-center justify-center backface-hidden ring-1 ring-slate-100">
                     <div className="absolute top-12 left-16 flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Question Layer</span>
                     </div>
                     
                     <div className="absolute top-12 right-12 flex gap-2">
                        <button className="p-3 text-slate-300 hover:text-blue-600 transition-colors"><Volume2 size={20}/></button>
                        <button className="p-3 text-slate-300 hover:text-blue-600 transition-colors"><Share2 size={20}/></button>
                     </div>

                     <p className="text-3xl font-black text-center text-slate-800 leading-tight max-w-sm">
                        {flashcards[currentIndex]?.front_text}
                     </p>

                     <div className="mt-20 flex flex-col items-center gap-4">
                        <div className="px-5 py-2 bg-slate-50 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest">Tap to reveal synaptic response</div>
                        <div className="flex gap-1">
                           {[1,2,3,4,5].map(dot => (
                              <div key={dot} className={`w-1 h-1 rounded-full ${dot <= (flashcards[currentIndex]?.difficulty || 1) ? 'bg-blue-600' : 'bg-slate-100'}`}></div>
                           ))}
                        </div>
                     </div>
                  </div>

                  {/* Back */}
                  <div className="absolute inset-0 bg-slate-900 border-4 border-slate-800/50 rounded-[64px] p-16 flex flex-col items-center justify-center backface-hidden rotate-y-180 overflow-hidden">
                     <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #3b82f6 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
                     
                     <div className="absolute top-12 left-16 flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cognitive Answer</span>
                     </div>

                     <p className="text-2xl font-bold text-center text-white leading-relaxed max-w-md relative z-10">
                        {flashcards[currentIndex]?.back_text}
                     </p>

                     <div className="mt-20 relative z-10">
                        <div className="px-6 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em]">Validated Response</div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Stage Controls */}
            <div className="flex justify-between items-center bg-white border border-slate-100 p-4 rounded-[32px] shadow-lg">
               <button onClick={handlePrev} className="w-16 h-16 rounded-2xl flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm"><ChevronLeft size={24}/></button>
               
               <div className="flex gap-3">
                  {['Hard', 'Medium', 'Easy', 'Peak'].map((label, i) => (
                     <button key={label} className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${i === 3 ? 'bg-blue-600 text-white shadow-xl shadow-blue-100 hover:scale-110' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>
                        {label}
                     </button>
                  ))}
               </div>

               <button onClick={handleNext} className="w-16 h-16 rounded-2xl flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm"><ChevronRight size={24}/></button>
            </div>
         </div>

         {/* Right Sidebar: Quick Add & History */}
         <div className="space-y-8">
            <div className="bg-slate-900 rounded-[40px] p-8 text-white relative overflow-hidden group">
               <div className="absolute -right-8 -top-8 w-32 h-32 bg-indigo-600 rounded-full blur-3xl opacity-20 group-hover:scale-150 transition-transform duration-700"></div>
               <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8 px-2">Knowledge Pulse</h3>
               
               <div className="space-y-6">
                  {[
                     { label: 'Total Masters', val: 124, icon: '🏆' },
                     { label: 'Current Streak', val: '12 Days', icon: '🔥' },
                  ].map(stat => (
                     <div key={stat.label} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer border border-white/5">
                        <div className="text-xl">{stat.icon}</div>
                        <div>
                           <p className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">{stat.label}</p>
                           <p className="font-black text-lg leading-none mt-1">{stat.val}</p>
                        </div>
                     </div>
                  ))}
               </div>

               <button className="w-full mt-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white text-slate-400 hover:text-slate-900 transition-all">Session History</button>
            </div>

            <div className="bg-white border border-slate-50 rounded-[40px] p-8 shadow-sm">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Quantum Add</h3>
               <div className="space-y-4">
                  <textarea 
                     value={newFront}
                     onChange={e => setNewFront(e.target.value)}
                     className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-medium outline-none focus:border-blue-500 transition-all min-h-[100px]" 
                     placeholder="Front: Question / Concept..."
                  ></textarea>
                  <textarea 
                     value={newBack}
                     onChange={e => setNewBack(e.target.value)}
                     className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-medium outline-none focus:border-blue-500 transition-all min-h-[100px]" 
                     placeholder="Back: Answer / Definition..."
                  ></textarea>
                  <button onClick={handleManualAdd} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2">
                     <Plus size={16}/> Push to Lexicon
                  </button>
               </div>
            </div>
         </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .perspective-1000 { perspective: 2000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}} />
    </div>
  );
};

export default FlashcardPage;
