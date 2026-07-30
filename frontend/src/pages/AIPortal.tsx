import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  Brain, 
  Target, 
  MessageSquare, 
  Zap, 
  Lightbulb, 
  BookOpen, 
  ShieldCheck, 
  Flame,
  ArrowRight,
  Monitor,
  Command,
  Settings,
  AudioWaveform as Waves,
  Sparkles
} from 'lucide-react';

type Persona = {
  id: string;
  name: string;
  role: string;
  desc: string;
  color: string;
  icon: React.ReactNode;
  specs: string[];
};

const AIPortal: React.FC = () => {
  const navigate = useNavigate();
  const [activePersona, setActivePersona] = useState<string>('tutor');
  const [isDeploying, setIsDeploying] = useState(false);
  const [chatPreview, setChatPreview] = useState<string | null>(null);

  const personas: Persona[] = [
    {
      id: 'ema',
      name: 'Ema (Core Intelligence)',
      role: 'Enhanced Mind Assistant',
      desc: 'The central nervous system of your digital brain. Ema manages global synthesis, neural heartbeats, and real-time research assistance.',
      color: 'from-blue-600 via-indigo-600 to-purple-600',
      icon: <Sparkles size={28} />,
      specs: ['Core Synthesis', 'Neural Heartbeat', 'Global Sync']
    },
    {
      id: 'tutor',
      name: 'Socratic Tutor',
      role: 'Cognitive Coach',
      desc: 'Expert in guiding you to the answer rather than giving it away. Uses deep questioning techniques to build structural understanding.',
      color: 'from-blue-600 to-indigo-700',
      icon: <Brain size={28} />,
      specs: ['Structural Learning', 'Deep Recall', 'Logic Loops']
    },
    {
      id: 'examiner',
      name: 'The Examiner',
      role: 'Mock Proctor',
      desc: 'Generates rigorous mock exams, grades your logic, and identifies critical knowledge gaps in your research.',
      color: 'from-rose-600 to-orange-600',
      icon: <Target size={28} />,
      specs: ['Mock Exams', 'Gap Analysis', 'Neural Grading']
    },
    {
      id: 'summarizer',
      name: 'The Architect',
      role: 'Knowledge Compressor',
      desc: 'Compresses thousands of pages and hours of audio into high-density Synthesis Blueprints. Focuses on core principles.',
      color: 'from-emerald-600 to-teal-700',
      icon: <Command size={28} />,
      specs: ['Synthesis', 'Core Logic', 'Fast Recall']
    },
    {
      id: 'debater',
      name: 'Logic Debater',
      role: 'Critical Mirror',
      desc: 'Challenges your assumptions and logic. Perfect for refining thesis statements or complex philosophical notes.',
      color: 'from-purple-600 to-fuchsia-700',
      icon: <Flame size={28} />,
      specs: ['Counter-Logic', 'Refining', 'Dialectic']
    },
    {
      id: 'creative',
      name: 'Creative Muse',
      role: 'Ideation Engine',
      desc: 'Cross-pollinates your notes to find hidden connections and new project ideas across different domains.',
      color: 'from-amber-600 to-orange-500',
      icon: <Lightbulb size={28} />,
      specs: ['Ideation', 'Cross-Pollination', 'Concept Fusion']
    },
    {
      id: 'socrates',
      name: 'Socrates',
      role: 'Foundational Critic',
      desc: 'The original dialectic master. He will challenge your definitions and force you to confront the limits of your own research.',
      color: 'from-slate-700 to-slate-900',
      icon: <Brain size={28} />,
      specs: ['Dialectic', 'Definition Audit', 'Elenchus']
    },
    {
      id: 'einstein',
      name: 'Albert Einstein',
      role: 'Intuition Architect',
      desc: 'Focuses on thought experiments and universal principles. Use him to find simpler, more elegant explanations for complex notes.',
      color: 'from-blue-700 to-indigo-900',
      icon: <Waves size={28} />,
      specs: ['Thought Experiments', 'Simplicity', 'Unified Logic']
    },
    {
      id: 'curie',
      name: 'Marie Curie',
      role: 'Research Catalyst',
      desc: 'A master of relentless observation and experimental rigor. She will help you refine your data and focus on empirical evidence.',
      color: 'from-emerald-700 to-teal-900',
      icon: <Zap size={28} />,
      specs: ['Empiricism', 'Rigor Check', 'Discovery Alpha']
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
        <div className="flex-1 min-w-0">
           <div className="inline-block px-3 md:px-4 py-1 md:py-1.5 bg-blue-600 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest text-white mb-4 md:mb-6">Neural Protocol Alpha</div>
           <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-2 tracking-tight leading-none italic">Intelligence Portal</h1>
           <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Deploy specialized AI agents for your global knowledge base</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full md:w-auto">
           <div className="px-4 md:px-6 py-2 md:py-3 bg-white border border-slate-100 rounded-xl md:rounded-2xl shadow-sm text-[10px] md:text-xs font-black uppercase text-slate-500 tracking-widest text-center md:text-left">Active Nodes: 12</div>
            <button 
               onClick={() => {
                  toast.success('Global Sync Initiated: 12 Neural Nodes online.');
               }}
               className="px-6 md:px-8 py-2 md:py-3 bg-slate-900 text-white rounded-xl md:rounded-2xl shadow-xl text-[10px] md:text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
            >
               Global Sync
            </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 md:gap-12">
         {/* Persona Selection */}
         <div className="lg:col-span-4 space-y-4">
            {personas.map(p => (
               <button 
                  key={p.id}
                  onClick={() => {
                     if (p.id === 'tutor') {
                        navigate('/socratic-tutor');
                     } else if (p.id === 'examiner') {
                        navigate('/examiner');
                     } else if (p.id === 'summarizer') {
                        navigate('/architect');
                     } else if (p.id === 'debater') {
                        navigate('/logic-debater');
                     } else if (p.id === 'creative') {
                        navigate('/creative-muse');
                     } else {
                        setActivePersona(p.id);
                     }
                  }}
                  className={`w-full p-6 md:p-8 rounded-[32px] md:rounded-[40px] text-left transition-all duration-500 relative overflow-hidden group border-2 cursor-pointer ${activePersona === p.id ? 'bg-white border-blue-600 shadow-2xl shadow-blue-100 scale-[1.02]' : 'bg-slate-50 border-transparent hover:bg-white hover:border-slate-200 hover:scale-[1.02]'}`}
               >
                  <div className="flex items-center gap-4 md:gap-6 relative z-10">
                     <div className={`w-12 h-12 md:w-16 md:h-16 rounded-[18px] md:rounded-[22px] bg-gradient-to-br ${p.color} text-white flex items-center justify-center transition-transform group-hover:scale-110 flex-shrink-0`}>
                        {p.icon}
                     </div>
                     <div className="flex-1 min-w-0">
                        <h3 className="font-black text-slate-900 text-base md:text-lg leading-tight truncate">{p.name}</h3>
                        <p className="text-[9px] md:text-[10px] font-semibold text-slate-400 uppercase tracking-widest truncate">{p.role}</p>
                     </div>
                     <ArrowRight className="text-slate-400 group-hover:text-blue-600 transition-colors flex-shrink-0" size={18} />
                  </div>
               </button>
            ))}
         </div>

         {/* Deployment Stage */}
         <div className="lg:col-span-8">
            <div className="bg-white border border-slate-50 rounded-[32px] md:rounded-[64px] p-6 md:p-12 lg:p-20 shadow-xl min-h-[500px] md:min-h-[700px] flex flex-col relative overflow-hidden">
               {/* Background Glow */}
               <div className={`absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br ${personas.find(p => p.id === activePersona)?.color} opacity-[0.03] rounded-full blur-[120px] -mr-64 -mt-64`}></div>
               
               <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6 md:mb-12 flex-wrap gap-4">
                     <div className="flex items-center gap-3 md:gap-4">
                        <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full bg-gradient-to-r ${personas.find(p => p.id === activePersona)?.color} animate-pulse`}></div>
                        <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-400">Agent Configuration</span>
                     </div>
                     <div className="flex gap-2 md:gap-4">
                        <button 
                           onClick={() => toast('Agent logic configuration is locked for high-density research.', { icon: '🔒' })}
                           className="p-2 md:p-3 bg-slate-50 hover:bg-slate-100 rounded-xl md:rounded-2xl text-slate-400 transition-all"
                        >
                           <Settings size={18}/>
                        </button>
                        <button 
                           onClick={() => toast.success('Diagnostic monitor active: Latency 24ms')}
                           className="p-2 md:p-3 bg-slate-50 hover:bg-slate-100 rounded-xl md:rounded-2xl text-slate-400 transition-all"
                        >
                           <Monitor size={18}/>
                        </button>
                     </div>
                  </div>

                  <h2 className="text-3xl md:text-5xl lg:text-7xl font-black text-slate-900 mb-4 md:mb-8 tracking-tighter leading-none">
                     {personas.find(p => p.id === activePersona)?.name}
                  </h2>
                  <p className="text-base md:text-xl text-slate-500 font-medium leading-relaxed max-w-2xl mb-8 md:mb-12">
                     {personas.find(p => p.id === activePersona)?.desc}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-16">
                     {personas.find(p => p.id === activePersona)?.specs.map(spec => (
                        <div key={spec} className="bg-slate-50 px-4 md:px-6 py-3 md:py-4 rounded-2xl md:rounded-3xl border border-slate-100 flex items-center gap-3 md:gap-4">
                           <div className="w-1.5 h-1.5 rounded-full bg-slate-900 flex-shrink-0"></div>
                           <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-800">{spec}</span>
                        </div>
                     ))}
                  </div>

                  <div className="space-y-6">
                     {chatPreview ? (
                        <div className="bg-slate-50 border border-slate-100 rounded-[32px] p-8 animate-fade-in">
                           <div className="flex items-center gap-3 mb-4">
                              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                              <span className="text-[10px] font-black uppercase text-slate-400">Agent Response</span>
                           </div>
                           <p className="text-slate-700 font-medium italic leading-relaxed mb-6">"{chatPreview}"</p>
                           <button 
                              onClick={() => setChatPreview(null)}
                              className="text-[10px] font-black text-blue-600 uppercase hover:underline"
                           >
                              Reset Neural Link
                           </button>
                        </div>
                     ) : (
                        <button 
                           onClick={async () => {
                              if (activePersona === 'tutor') {
                                 navigate('/socratic-tutor');
                                 return;
                              }
                              if (activePersona === 'examiner') {
                                 navigate('/examiner');
                                 return;
                              }
                              if (activePersona === 'summarizer') {
                                 navigate('/architect');
                                 return;
                              }
                              if (activePersona === 'debater') {
                                 navigate('/logic-debater');
                                 return;
                              }
                              if (activePersona === 'creative') {
                                 navigate('/creative-muse');
                                 return;
                              }
                              setIsDeploying(true);
                              try {
                                 const personaObj = personas.find(p => p.id === activePersona);
                                 const formData = new FormData();
                                 formData.append('message', `Initialize interface. State your role and how you will help me today.`);
                                 formData.append('system_prompt', `You are ${personaObj?.name} (${personaObj?.role}). ${personaObj?.desc} Provide a response in character.`);
                                 
                                 const apiUrl = (window as any)._env_?.REACT_APP_API_URL || process.env.REACT_APP_API_URL || 'http://localhost:8000';
                                 const token = localStorage.getItem('token');
                                 
                                 const response = await fetch(`${apiUrl}/api/v1/chat`, {
                                    method: 'POST',
                                    headers: {
                                       ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                                    },
                                    body: formData
                                 });
                                 const data = await response.json();
                                 setChatPreview(data.response);
                              } catch (err) {
                                 setChatPreview("Neural connection failed. Ensure backend is running.");
                              } finally {
                                 setIsDeploying(false);
                              }
                           }}
                           disabled={isDeploying}
                           className={`w-full py-4 md:py-6 bg-gradient-to-r ${personas.find(p => p.id === activePersona)?.color} text-white rounded-[24px] md:rounded-[32px] font-black text-[10px] md:text-xs uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 md:gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all group`}
                        >
                           {isDeploying ? 'Establishing Link...' : (activePersona === 'tutor' || activePersona === 'examiner' || activePersona === 'summarizer' || activePersona === 'debater' || activePersona === 'creative') ? `Open ${personas.find(p => p.id === activePersona)?.name}` : `Deploy ${personas.find(p => p.id === activePersona)?.name}`}
                           {!isDeploying && <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform"/>}
                        </button>
                     )}
                     {activePersona !== 'tutor' && activePersona !== 'examiner' && activePersona !== 'summarizer' && activePersona !== 'debater' && activePersona !== 'creative' && activePersona !== 'socrates' && activePersona !== 'einstein' && activePersona !== 'curie' && (
                        <p className="text-center text-[9px] md:text-[10px] font-black text-slate-300 uppercase tracking-widest">Initialization takes approx. 2.4s • Neural Protocol V4</p>
                     )}
                  </div>
               </div>

               {/* Waveform Visualization */}
               <div className="mt-auto pt-8 md:pt-20 flex flex-col items-center">
                  <div className="flex items-end gap-0.5 md:gap-1 mb-4 md:mb-6">
                     {[...Array(24)].map((_, i) => (
                        <div 
                           key={i} 
                           className={`w-0.5 md:w-1 rounded-full bg-slate-100 animate-[bounce_1.5s_infinite]`} 
                           style={{ 
                              height: `${10 + Math.random() * 40}px`, 
                              animationDelay: `${i * 0.1}s`,
                              backgroundColor: i % 2 === 0 ? '#3b82f610' : '#0f172a05'
                           }}
                        ></div>
                     ))}
                  </div>
                  <div className="flex items-center gap-2 md:gap-3">
                     <Waves size={14} className="text-slate-300" />
                     <span className="text-[8px] md:text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">Listening for Input</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default AIPortal;
