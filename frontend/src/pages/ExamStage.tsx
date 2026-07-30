import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  Trophy, 
  Brain, 
  Zap, 
  Target, 
  ShieldCheck, 
  ArrowRight,
  Timer,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

type TestMode = 'mock' | 'stress' | 'quiz';

const ExamStage: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<TestMode | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const mockQuestions = [
    {
      q: "Explain the relationship between Synaptic Plasticity and Long-term Potentiation.",
      options: ["LTP is a form of plasticity", "They are unrelated", "Plasticity causes LTP", "LTP causes Plasticity"]
    },
    {
      q: "Which neurochemical is primarily responsible for the 'Reward Path' in neural logic?",
      options: ["Serotonin", "Dopamine", "GABA", "Glutamate"]
    }
  ];

  if (!mode) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 animate-slide-up">
        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Select Testing Protocol</h1>
        <p className="text-slate-400 font-medium mb-12">Deploy a neural protocol to stress-test your knowledge retention.</p>
        
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {[
            { id: 'mock', name: 'Neural Mock Exam', icon: <Target className="text-rose-600" />, color: 'hover:border-rose-200', desc: 'Full-length proctored exam simulation.', path: '/examiner' },
            { id: 'stress', name: 'Logic Stress Test', icon: <ShieldCheck className="text-emerald-600" />, color: 'hover:border-emerald-200', desc: 'Challenge your notes against AI counter-arguments.' },
            { id: 'quiz', name: 'Synthesis Quiz', icon: <Zap className="text-amber-600" />, color: 'hover:border-amber-200', desc: 'Quick-fire questions based on recent synthesis.' }
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => {
                if (item.path) {
                  navigate(item.path);
                } else {
                  setMode(item.id as TestMode);
                }
              }}
              className={`bg-white border border-slate-100 rounded-[32px] p-8 text-left transition-all ${item.color} hover:shadow-xl group`}
            >
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <h3 className="font-black text-slate-900 mb-2">{item.name}</h3>
              <p className="text-xs font-bold text-slate-400 mb-8 leading-relaxed">{item.desc}</p>
              <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest">
                {item.path ? 'Open Tool' : 'Configure Protocol'} <ArrowRight size={14} />
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (!isStarted) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 animate-slide-up">
        <div className="bg-slate-900 rounded-[48px] p-12 text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full -mr-32 -mt-32 blur-[100px] opacity-20"></div>
           <div className="relative z-10">
              <span className="inline-block px-4 py-1.5 bg-blue-600 rounded-full text-[9px] font-black uppercase tracking-widest mb-6">Protocol Ready</span>
              <h2 className="text-4xl font-black mb-4 capitalize">{mode.replace('-', ' ')}</h2>
              <p className="text-slate-400 font-medium mb-12">The AI is parsing your knowledge base to generate a custom-tailored proctoring session. This will take approx 1.2s.</p>
              
              <div className="grid grid-cols-2 gap-4 mb-12">
                 <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                    <Timer size={20} className="text-blue-400 mb-4" />
                    <span className="block text-xl font-black">20 Mins</span>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Est. Duration</span>
                 </div>
                 <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                    <Brain size={20} className="text-emerald-400 mb-4" />
                    <span className="block text-xl font-black">Adaptive</span>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Difficulty</span>
                 </div>
              </div>

              <button 
                onClick={() => setIsStarted(true)}
                className="w-full py-6 bg-white text-slate-900 rounded-[28px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-blue-50 transition-all"
              >
                Initiate Neural Session
              </button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-20 animate-slide-up">
       <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black">0{currentQuestion + 1}</div>
             <div className="h-1.5 w-48 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${(currentQuestion + 1) / mockQuestions.length * 100}%` }}></div>
             </div>
          </div>
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Time Remaining: 18:42</span>
       </div>

       <div className="bg-white border border-slate-100 rounded-[48px] p-12 shadow-xl mb-8">
          <h2 className="text-2xl font-black text-slate-900 mb-12 leading-tight">
            {mockQuestions[currentQuestion].q}
          </h2>
          
          <div className="space-y-4">
             {mockQuestions[currentQuestion].options.map((opt, i) => (
                <button 
                  key={i} 
                  onClick={() => setAnswers({...answers, [currentQuestion]: opt})}
                  className={`w-full p-6 text-left border-2 rounded-[28px] transition-all flex justify-between items-center group ${answers[currentQuestion] === opt ? 'border-blue-600 bg-blue-50' : 'border-slate-50 hover:border-slate-200 hover:bg-slate-50'}`}
                >
                   <span className={`font-bold ${answers[currentQuestion] === opt ? 'text-blue-900' : 'text-slate-600'}`}>{opt}</span>
                   <div className={`w-6 h-6 rounded-full border-2 transition-all ${answers[currentQuestion] === opt ? 'bg-blue-600 border-blue-600' : 'border-slate-200 group-hover:border-slate-400'}`}></div>
                </button>
             ))}
          </div>
       </div>

       <div className="flex justify-between">
          <button 
            disabled={currentQuestion === 0}
            onClick={() => setCurrentQuestion(currentQuestion - 1)}
            className="px-10 py-5 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-900 disabled:opacity-0"
          >
            Previous
          </button>
          <button 
            onClick={() => {
              if (currentQuestion < mockQuestions.length - 1) {
                setCurrentQuestion(currentQuestion + 1);
              } else {
                toast.success("Exam Submitted! Analyzing Logic...");
                setMode(null);
                setIsStarted(false);
              }
            }}
            className="px-12 py-5 bg-slate-900 text-white rounded-[24px] font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 transition-all"
          >
            {currentQuestion === mockQuestions.length - 1 ? 'Submit Protocol' : 'Next Question'}
          </button>
       </div>
    </div>
  );
};

export default ExamStage;
