import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Zap,
  ArrowRight,
  ChevronRight,
  BookOpen,
  Sparkles,
  PlayCircle,
  HelpCircle,
  Trophy
} from 'lucide-react';
import { api } from '../lib/api';
// Removed canvas-confetti for environment stability

interface GuidedSession {
  concept_id: number;
  concept_title: string;
  explanation: string;
  question: string;
  example: string;
  quiz: Array<{question: string, options: string[], answer: string}>;
}

const LearnSession: React.FC = () => {
  const [session, setSession] = useState<GuidedSession | null>(null);
  const [step, setStep] = useState(1); // 1: Explain, 2: Recall, 3: Example, 4: Quiz
  const [loading, setLoading] = useState(true);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState<string | null>(null);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await api.get('/learning/learn-session');
        setSession(response.data);
      } catch (e) {
        console.error("Failed to fetch guided session", e);
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, []);

  const handleNextStep = () => {
    if (step < 4) {
      setStep(prev => prev + 1);
    } else {
      // Logic for quiz
      if (quizIndex < (session?.quiz?.length || 0) - 1) {
        setQuizIndex(prev => prev + 1);
        setUserAnswer(null);
      } else {
        handleFinish();
      }
    }
  };

  const handleFinish = () => {
    setSessionComplete(true);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono">Calibrating Teacher Brain...</p>
      </div>
    </div>
  );

  if (sessionComplete) return (
    <div className="min-h-screen flex items-center justify-center bg-white p-8">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md w-full text-center">
        <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-[32px] flex items-center justify-center mx-auto mb-10 shadow-inner">
          <Trophy size={48} />
        </div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">Neural Deep-Sync Complete</h2>
        <p className="text-slate-400 font-medium mb-12">Concept "{session?.concept_title}" has been integrated into your knowledge graph.</p>
        <button onClick={() => window.location.href = '/dashboard'} className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-2xl shadow-blue-500/10">Return to Command Center</button>
      </motion.div>
    </div>
  );

  const steps = [
    { id: 1, title: 'Deep Explanation', icon: <BookOpen size={20}/>, color: 'blue' },
    { id: 2, title: 'Active Recall', icon: <Brain size={20}/>, color: 'indigo' },
    { id: 3, title: 'Analogy & Example', icon: <Zap size={20}/>, color: 'amber' },
    { id: 4, title: 'Mastery Quiz', icon: <PlayCircle size={20}/>, color: 'emerald' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Navigation Progress */}
        <div className="flex justify-between items-center mb-16 px-4">
           {steps.map(s => (
             <div key={s.id} className="flex flex-col items-center gap-3 relative">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 ${
                  step === s.id ? `bg-${s.color}-600 border-${s.color}-600 text-white shadow-xl shadow-${s.color}-500/20 scale-110` : 
                  step > s.id ? `bg-emerald-500 border-emerald-500 text-white` : `bg-white border-slate-100 text-slate-300`
                }`}>
                  {step > s.id ? <CheckCircle2 size={24}/> : s.icon}
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest ${step === s.id ? 'text-slate-900' : 'text-slate-300'}`}>{s.title}</span>
                {s.id < 4 && <div className={`absolute left-full top-6 w-12 h-0.5 ml-2 -mr-2 bg-slate-100`}></div>}
             </div>
           ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step + (quizIndex * 10)}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-[48px] p-12 md:p-20 shadow-2xl border border-slate-100 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-slate-500/5 rounded-full -mr-40 -mt-40 blur-3xl"></div>
            
            <div className="mb-12">
               <span className="text-[10px] font-black bg-slate-900 text-white px-3 py-1.5 rounded-lg uppercase tracking-widest">{session?.concept_title}</span>
               <div className="h-px w-full bg-slate-50 mt-8"></div>
            </div>

            {/* Content Logic */}
            <div className="min-h-[300px] flex flex-col justify-center">
              {step === 1 && (
                <div className="animate-slide-up">
                  <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none mb-10">Step 1: The Core Idea</h2>
                  <p className="text-xl md:text-2xl text-slate-500 leading-relaxed font-medium">{session?.explanation}</p>
                </div>
              )}

              {step === 2 && (
                <div className="animate-slide-up">
                  <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none mb-10">Step 2: Active Recall</h2>
                  <p className="text-2xl md:text-3xl font-black text-slate-900 mb-12 italic">" {session?.question} "</p>
                  <p className="text-sm text-slate-400 italic">Try to answer this out loud before proceeding. This forces your neurons to strengthen the connection.</p>
                </div>
              )}

              {step === 3 && (
                <div className="animate-slide-up">
                  <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none mb-10">Step 3: The Analogy</h2>
                  <div className="p-10 bg-amber-50 rounded-[40px] border border-amber-100 relative">
                     <Zap className="absolute top-8 right-8 text-amber-500 opacity-20" size={64} />
                     <p className="text-xl md:text-2xl text-amber-900 leading-relaxed font-bold">{session?.example}</p>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="animate-slide-up">
                  <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none mb-10">Step 4: Mastery Check</h2>
                  <p className="text-xl font-bold text-slate-800 mb-8">{session?.quiz?.[quizIndex]?.question}</p>
                  <div className="grid grid-cols-1 gap-4">
                    {session?.quiz?.[quizIndex]?.options.map(opt => (
                      <button 
                        key={opt}
                        onClick={() => setUserAnswer(opt)}
                        className={`p-6 rounded-2xl border text-left font-black text-xs uppercase tracking-widest transition-all ${
                          userAnswer === opt ? 'bg-indigo-600 border-indigo-600 text-white scale-[1.02]' : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-white hover:border-indigo-200'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={handleNextStep}
              className="mt-16 w-full py-6 bg-slate-900 text-white rounded-[32px] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all group"
            >
              {step === 4 && quizIndex === (session?.quiz?.length || 0) - 1 ? 'Unlock Mastery' : 'Strengthen Connection'}
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
};

export default LearnSession;
