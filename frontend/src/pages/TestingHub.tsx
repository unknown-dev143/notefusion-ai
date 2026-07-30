import React from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  Target, 
  Brain, 
  Zap, 
  ShieldCheck, 
  ChevronRight,
  Trophy,
  History
} from 'lucide-react';

type TestTool = {
  id: string;
  name: string;
  path: string;
  icon: React.ReactNode;
  desc: string;
  stat: string;
  color: string;
  difficulty: string;
};

const TestingHub: React.FC = () => {
  const tools: TestTool[] = [
    {
      id: 'mock',
      name: 'Neural Mock Exam',
      path: '/examiner',
      icon: <Target size={28} />,
      desc: 'Deploy the Examiner for a rigorous mock proctoring session.',
      stat: '94% Accuracy',
      color: 'bg-rose-50',
      difficulty: 'Elite'
    },
    {
      id: 'quiz',
      name: 'Synthesis Quiz',
      path: '/exam',
      icon: <Zap size={28} />,
      desc: 'Quick rapid-fire questions based on your latest synthesis.',
      stat: '12 Quizzes',
      color: 'bg-amber-50',
      difficulty: 'Sprint'
    },
    {
      id: 'stress',
      name: 'Logic Stress Test',
      path: '/exam',
      icon: <ShieldCheck size={28} />,
      desc: 'The AI will challenge your research with counter-logic.',
      stat: '8 sessions',
      color: 'bg-emerald-50',
      difficulty: 'Adaptive'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 animate-slide-up">
      {/* Hero Section */}
      <div className="bg-slate-900 rounded-[64px] p-12 lg:p-20 text-white relative overflow-hidden mb-16 group">
         <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #3b82f6 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600 rounded-full blur-[120px] opacity-20 -mr-32 -mt-32 group-hover:scale-125 transition-transform duration-1000"></div>
         
         <div className="relative z-10 max-w-2xl">
            <div className="inline-block px-4 py-1.5 bg-blue-600 rounded-full text-[9px] font-black uppercase tracking-widest mb-6">Cognitive Command v4</div>
            <h1 className="text-5xl lg:text-7xl font-black mb-8 tracking-tighter leading-none italic">Testing Intelligence</h1>
            <p className="text-xl text-slate-400 font-medium mb-12 leading-relaxed">
               NoteFusion AI doesn't just store information; it ensures you own it. Access your suite of **Active Recall** and **Neural Testing** tools.
            </p>
            
            <div className="flex gap-8">
               <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Global Mastery</span>
                  <span className="text-3xl font-black italic">84.2%</span>
               </div>
               <div className="w-px h-12 bg-white/10"></div>
               <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Synapses Built</span>
                  <span className="text-3xl font-black italic">14.8K</span>
               </div>
            </div>
         </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
         {tools.map(tool => (
            <Link 
               key={tool.id} 
               to={tool.path}
               className="bg-white border border-slate-100 rounded-[48px] p-10 hover:shadow-2xl hover:-translate-y-2 transition-all relative overflow-hidden group shadow-sm"
            >
               <div className="flex justify-between items-start mb-10">
                  <div className={`w-16 h-16 ${tool.color} rounded-[22px] flex items-center justify-center group-hover:scale-110 transition-transform`}>
                     {tool.icon}
                  </div>
                  <div className="px-5 py-2 bg-slate-900 text-white rounded-full text-[9px] font-black uppercase tracking-widest">
                     {tool.difficulty}
                  </div>
               </div>

               <h3 className="text-2xl font-black text-slate-900 mb-2">{tool.name}</h3>
               <p className="text-sm font-bold text-slate-400 mb-12 leading-relaxed max-w-[250px]">
                  {tool.desc}
               </p>

               <div className="flex justify-between items-center">
                  <div className="px-4 py-2 bg-slate-50 rounded-xl text-[10px] font-black uppercase text-slate-400 tracking-widest group-hover:bg-slate-900 group-hover:text-white transition-all">
                     {tool.stat}
                  </div>
                  <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all group-hover:translate-x-2">
                     <ChevronRight size={18} />
                  </div>
               </div>
            </Link>
         ))}
      </div>

      {/* Synaptic Failures & Integration */}
      <div className="mt-20">
         <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8 px-2 flex items-center gap-3">
            <span className="w-6 h-px bg-slate-200"></span>
            Synaptic Failures (Tests to Do)
         </h3>
         
         <div className="grid lg:grid-cols-3 gap-8">
            {[
               { id: '1', title: 'Triple Integral Concept', note: 'Failed in Mock Exam #4', date: '2h ago', level: 'Critical' },
               { id: '2', title: 'Feudalism Timeline', note: 'Low retention in Flashcards', date: 'Yesterday', level: 'Moderate' },
               { id: '3', title: 'Synaptic Plasticity', note: 'Missed in Stress Test', date: '3 days ago', level: 'High' }
            ].map(item => (
               <div key={item.id} className="bg-white border border-slate-100 rounded-[40px] p-8 shadow-sm flex flex-col justify-between hover:border-blue-200 transition-colors group">
                  <div>
                     <div className="flex justify-between items-start mb-6">
                        <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${item.level === 'Critical' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                           {item.level}
                        </div>
                        <span className="text-[9px] font-black text-slate-300 uppercase">{item.date}</span>
                     </div>
                     <h4 className="text-xl font-black text-slate-900 mb-2">{item.title}</h4>
                     <p className="text-xs font-bold text-slate-400 mb-8">{item.note}</p>
                  </div>
                  
                  <Link 
                     to="/tasks"
                     className="w-full py-4 bg-slate-50 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all text-center flex items-center justify-center gap-2 group-hover:scale-[1.02]"
                  >
                     <Plus size={14} /> Create Task
                  </Link>
               </div>
            ))}

            <div 
               onClick={() => {
                  toast.success("Neural Roadmap Generated! Syncing with Tasks...");
                  setTimeout(() => window.location.href = '/tasks', 1500);
               }}
               className="bg-blue-600 rounded-[40px] p-8 text-white flex flex-col justify-center items-center text-center relative overflow-hidden group cursor-pointer shadow-2xl shadow-blue-200 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
               <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #fff 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
               <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">📋</div>
               <h4 className="text-xl font-black mb-2 leading-tight">Generate Neural Roadmap</h4>
               <p className="text-xs font-medium text-blue-100 mb-0 opacity-80 leading-relaxed">Convert all current weaknesses into a structured task board.</p>
            </div>
         </div>
      </div>
    </div>
  );
};

const Plus = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

export default TestingHub;
