import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Zap, 
  Target, 
  Link as LinkIcon, 
  Layers, 
  TrendingUp, 
  ArrowRight,
  ChevronRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
  Plus,
  MessageSquare,
  Edit3
} from 'lucide-react';
import { useAuth } from '../features/auth/context/AuthContext';
import { api } from '../lib/api';

interface LearningMetrics {
  retention_rate: number;
  concepts_mastered: number;
  connections_made: number;
  lvi_score: number;
  date: string;
}

const LearningDashboard: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<LearningMetrics | null>(null);
  const [recallQueue, setRecallQueue] = useState<any[]>([]);
  const [activeConcept, setActiveConcept] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeLayer, setActiveLayer] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [metricsRes, queueRes, conceptsRes] = await Promise.all([
          api.get('/learning/metrics'),
          api.get('/learning/recall-queue'),
          api.get('/learning/concepts?limit=1')
        ]);
        
        setMetrics(metricsRes.data);
        setRecallQueue(queueRes.data || []);
        if (conceptsRes.data && conceptsRes.data.length > 0) {
          setActiveConcept(conceptsRes.data[0]);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
        // Fallback mock data
        setMetrics({
          retention_rate: 0.85,
          concepts_mastered: 24,
          connections_made: 56,
          lvi_score: 72.4,
          date: new Date().toISOString()
        });
        setRecallQueue([
          { title: 'The Cold War Origins', time: 'Ready', color: 'rose' },
          { title: 'Array.prototype.reduce()', time: 'Overdue', color: 'purple' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const layers = [
    { name: 'Input', icon: <BookOpen />, desc: 'Smart Knowledge Capture', color: 'blue', status: 'Optimal' },
    { name: 'Understand', icon: <Brain />, desc: 'Active Processing', color: 'purple', status: 'Focus Needed' },
    { name: 'Memory', icon: <Clock />, desc: 'Smart Recall Engine', color: 'orange', status: '3 Ready' },
    { name: 'Connect', icon: <LinkIcon />, desc: 'Knowledge Graph Brain', color: 'emerald', status: 'Expanding' },
    { name: 'Apply', icon: <Target />, desc: 'Learning by Doing', color: 'rose', status: '1 Challenge' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8 pb-20">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-blue-600/10 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                Personal Learning Engine v2.0
              </span>
              <div className="h-px w-8 bg-slate-200"></div>
              <div className="flex items-center gap-2 group cursor-help">
                 <span className="text-[10px] font-black text-slate-400 capitalize">Profile: Logical-Sequential</span>
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm animate-pulse"></div>
              </div>
            </div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight">
              Neural <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Commander</span>
            </h1>
          </motion.div>

          {/* LVI Score Card */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-6 rounded-[32px] shadow-2xl shadow-blue-500/10 border border-slate-100 flex items-center gap-6 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-blue-500/10 transition-all"></div>
            <div className="relative">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle cx="40" cy="40" r="32" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                <circle 
                  cx="40" cy="40" r="32" stroke="currentColor" strokeWidth="8" fill="transparent" 
                  strokeDasharray={2 * Math.PI * 32}
                  strokeDashoffset={2 * Math.PI * 32 * (1 - (metrics?.lvi_score || 0) / 100)}
                  className="text-blue-600 transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-black text-slate-900">{metrics?.lvi_score.toFixed(0)}</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Learning Velocity (LVI)</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-slate-900 tracking-tighter">Increased 18%</span>
                <TrendingUp size={16} className="text-emerald-500" />
              </div>
            </div>
          </motion.div>
        </header>
        {/* Active Synthetic Stream */}
        <div className="mb-8 flex gap-3 overflow-hidden mask-fade-right pointer-events-none">
           {[
             { engine: 'Librarian', action: 'Synthesizing knowledge atoms...', color: 'bg-blue-500' },
             { engine: 'Researcher', action: 'Mapping synaptic connections...', color: 'bg-emerald-500' },
             { engine: 'Coach', action: 'Optimizing recall intervals...', color: 'bg-orange-500' }
           ].map((item, i) => (
             <motion.div 
               key={i}
               initial={{ x: 200, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               transition={{ duration: 0.8, delay: i * 0.3 }}
               className="flex items-center gap-2.5 bg-white border border-slate-100 rounded-full px-4 py-1.5 whitespace-nowrap shadow-sm"
             >
                <span className={`w-1.5 h-1.5 rounded-full ${item.color} animate-pulse`}></span>
                <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">{item.engine}</span>
                <span className="text-[9px] font-bold text-slate-400 italic">{item.action}</span>
             </motion.div>
           ))}
        </div>
        {/* The 5-Layer System Visual */}
        <section className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-8">
          {layers.map((layer, idx) => (
            <motion.div
              key={layer.name}
              whileHover={{ y: -5 }}
              onClick={() => setActiveLayer(idx)}
              className={`cursor-pointer p-6 rounded-[32px] border transition-all duration-500 ${
                activeLayer === idx 
                ? `bg-white border-${layer.color}-500 shadow-2xl shadow-${layer.color}-500/10` 
                : 'bg-white/50 border-slate-100 hover:bg-white hover:border-slate-200 shadow-sm'
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-inner ${
                activeLayer === idx ? `bg-${layer.color}-600 text-white` : `bg-${layer.color}-50 text-${layer.color}-600`
              }`}>
                {React.cloneElement(layer.icon as React.ReactElement, { size: 24 })}
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-1">{layer.name}</h3>
              <p className="text-[11px] font-medium text-slate-400 leading-tight mb-4">{layer.desc}</p>
              <div className="flex items-center justify-between mt-auto">
                <span className={`text-[9px] font-bold px-2 py-1 rounded-lg ${
                  activeLayer === idx ? `bg-${layer.color}-50 text-${layer.color}-700` : 'bg-slate-100 text-slate-500'
                }`}>
                  {layer.status}
                </span>
                <ChevronRight size={14} className={activeLayer === idx ? `text-${layer.color}-400` : 'text-slate-300'} />
              </div>
            </motion.div>
          ))}
        </section>

        {/* Dynamic Detail Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Main Action Area */}
          <div className="xl:col-span-2 space-y-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeLayer}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-xl overflow-hidden relative"
              >
                <div className={`absolute top-0 right-0 w-64 h-64 bg-${layers[activeLayer].color}-500/5 rounded-full -mr-32 -mt-32 blur-3xl`}></div>
                
                <div className="flex justify-between items-start mb-10 relative">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Layer {activeLayer + 1}: {layers[activeLayer].name}</h2>
                    <p className="text-slate-400 font-medium">{layers[activeLayer].desc}</p>
                  </div>
                  <button 
                    onClick={() => {
                      const routes = ['/notes', '/ai-portal', '/learn', '/graph', '/fusion-lab'];
                      window.location.href = routes[activeLayer];
                    }}
                    className={`px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all`}
                  >
                    Optimize Layer
                  </button>
                </div>

                {/* Content based on layer */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                  {activeLayer === 0 && (
                    <>
                      <div 
                        onClick={() => window.location.href = '/notes/new'}
                        className="group bg-slate-50 p-6 rounded-3xl border border-dashed border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer flex flex-col items-center justify-center text-center shadow-inner hover:shadow-none"
                      >
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                          <Plus size={20} className="text-blue-600" />
                        </div>
                        <h4 className="text-xs font-black uppercase tracking-widest mb-1">AI Synthesis Ingest</h4>
                        <p className="text-[10px] font-medium text-slate-400">PDF, Audio, Video, or Text</p>
                      </div>
                      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Recent Captures</h4>
                        <div className="space-y-3">
                          {['Quantum Mechanics Notes', 'Calculus III Textbook', 'Machine Learning Lecture'].map(item => (
                            <div key={item} className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm border border-slate-50 border-r-4 border-r-blue-500">
                              <span className="text-[11px] font-bold text-slate-700">{item}</span>
                              <CheckCircle2 size={14} className="text-emerald-500" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                  {activeLayer === 1 && (
                    <div className="md:col-span-2 bg-indigo-600 rounded-[40px] p-10 text-white flex flex-col md:flex-row items-center gap-10 relative overflow-hidden group shadow-2xl">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-110 transition-transform"></div>
                      <div className="flex-1 text-center md:text-left z-10">
                        <div className="flex items-center gap-3 mb-6">
                           <Zap size={16} className="text-amber-400" />
                           <span className="text-[10px] font-black uppercase tracking-[0.3em] font-mono">Cognitive Conflict Trigger</span>
                           <div className="h-px w-8 bg-white/20"></div>
                        </div>
                        <h3 className="text-3xl font-black mb-4 tracking-tight leading-tight italic">Deep Processing Active</h3>
                        <p className="text-indigo-100 text-sm mb-8 leading-relaxed font-medium">
                          Based on your latest intake ({activeConcept?.title || 'Neural Networks'}), can you explain the core mechanism using an analogy from **Architecture** or **Biology**?
                        </p>
                        <div className="flex flex-wrap gap-4">
                          <button 
                            onClick={() => window.location.href = '/learn'}
                            className="bg-white text-indigo-600 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all hover:scale-105 shadow-xl shadow-indigo-700/20"
                          >
                            Speak Analogy
                          </button>
                          <button 
                            onClick={() => window.location.href = '/learn'}
                            className="bg-indigo-500/50 text-white border border-indigo-400/30 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-400 transition-all hover:scale-105"
                          >
                            Write Detail
                          </button>
                        </div>
                      </div>
                      <div className="shrink-0 w-40 h-40 bg-white/5 border border-white/10 rounded-[32px] flex flex-col items-center justify-center p-6 backdrop-blur-md">
                         <Brain size={48} className="text-white opacity-40 mb-3 animate-[pulse_3s_infinite]" />
                         <span className="text-[9px] font-black text-indigo-200 uppercase tracking-widest text-center">Attention Span: 18m Optimal</span>
                      </div>
                    </div>
                  )}
                  {activeLayer === 2 && (
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
                      <div className="bg-orange-500 rounded-[32px] p-8 text-white flex flex-col justify-between shadow-xl shadow-orange-500/20 group relative overflow-hidden">
                         <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
                         <div className="z-10">
                            <Clock size={32} className="mb-6 opacity-30" />
                            <h3 className="text-xl font-black mb-2 tracking-tight">Active Sync</h3>
                            <p className="text-orange-100 text-[10px] font-black uppercase tracking-widest italic font-mono">Neural Decay Compensated</p>
                         </div>
                         <div className="mt-8 z-10">
                            <span className="text-6xl font-black tracking-tighter">{recallQueue.length || 0}</span>
                            <span className="text-[10px] font-black uppercase ml-2 opacity-60 italic leading-none block mt-1">Due for Synaptic Refresh</span>
                         </div>
                      </div>
                      <div 
                        onClick={() => window.location.href = '/learn'}
                        className="bg-white rounded-[32px] p-8 border border-slate-100 flex flex-col justify-between group cursor-pointer hover:border-orange-500 hover:bg-orange-50/10 transition-all shadow-sm active:scale-[0.98]"
                      >
                         <div>
                            <div className="flex justify-between items-center mb-6">
                               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Synaptic Retention Force</h4>
                               <TrendingUp size={14} className="text-orange-500" />
                            </div>
                            <div className="h-32 flex items-end gap-2 px-2">
                                {[35, 45, 60, 55, 75, 85, 92].map((h, i) => (
                                  <div key={i} className={`flex-1 rounded-t-xl group relative transition-all duration-700 delay-[${i*100}ms] ${i === 6 ? 'bg-orange-500 shadow-lg shadow-orange-500/30' : 'bg-slate-100 hover:bg-orange-200'}`} style={{ height: `${h}%` }}>
                                     <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-black px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-xl">Intensity {h}%</div>
                                  </div>
                                ))}
                            </div>
                         </div>
                         <div className="flex justify-between items-center mt-6 pt-6 border-t border-slate-50">
                            <p className="text-[10px] font-bold text-slate-400 italic">"Your memory decay rate has stabilized by <span className="text-orange-600">8.4%</span> this week."</p>
                            <div className="flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                               <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Execute Refresh</span>
                               <ArrowRight size={16} className="text-orange-500" />
                            </div>
                         </div>
                      </div>
                    </div>
                  )}
                  {activeLayer === 3 && (
                    <div className="md:col-span-2 space-y-6 animate-slide-up">
                      <div className="bg-emerald-600 rounded-[32px] p-8 text-white relative overflow-hidden group shadow-2xl shadow-emerald-600/10">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-110 transition-transform"></div>
                        <h3 className="text-2xl font-black mb-4 tracking-tighter italic">Knowledge Graph Density</h3>
                        <div className="flex items-center gap-4 mb-6">
                           <span className="text-5xl font-black italic tracking-tighter font-serif">68%</span>
                           <div className="px-3 py-1.5 bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest backdrop-blur-md">Expanding Stage</div>
                        </div>
                        <p className="text-emerald-100 text-sm max-w-md italic leading-relaxed">
                           "Success: We've connected your recent **Machine Learning** notes with your foundational **Linear Algebra** graph. The connection strength is growing."
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         {['Prerequisite Detection', 'Adjacent Concepts'].map((title, i) => (
                           <div key={title} 
                             onClick={() => window.location.href = '/graph'}
                             className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 hover:border-emerald-500 hover:bg-white transition-all cursor-pointer group shadow-sm"
                           >
                             <div className="flex justify-between items-center mb-4">
                                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{title}</h4>
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${i === 0 ? 'bg-amber-50 text-amber-500' : 'bg-blue-50 text-blue-500'}`}>
                                   {i === 0 ? <Target size={14}/> : <LinkIcon size={14}/>}
                                </div>
                             </div>
                             <p className="text-[11px] font-bold text-slate-400 italic leading-snug mb-2">AI Researcher found 3 missing links.</p>
                             <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest group-hover:underline">Re-map Graph →</span>
                           </div>
                         ))}
                      </div>
                    </div>
                  )}
                  {activeLayer === 4 && (
                    <div className="md:col-span-2 bg-slate-900 rounded-[40px] p-10 text-white relative overflow-hidden group shadow-2xl animate-scale-in">
                        <div className="absolute inset-0 bg-rose-500/5 group-hover:bg-rose-500/10 transition-colors pointer-events-none"></div>
                        <div className="relative flex flex-col md:flex-row gap-12 items-center">
                           <div className="flex-1">
                              <div className="flex items-center gap-3 mb-6">
                                 <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
                                 <span className="p-1 px-3 bg-rose-600/20 text-rose-500 text-[10px] font-black uppercase tracking-[0.3em] font-mono rounded-lg">Mastery Module</span>
                                 <div className="h-px w-12 bg-slate-700"></div>
                              </div>
                              <h3 className="text-4xl font-black mb-4 tracking-tighter leading-none italic uppercase">Apply: Newtonian Dynamics</h3>
                              <p className="text-slate-400 text-sm mb-10 leading-relaxed font-medium italic">
                                 "Demonstrate mastery: Describe how you would utilize Newton's 2nd Law to calculate the thrust required for a drone of 1.4kg to hover in mid-air."
                              </p>
                              <button 
                                onClick={() => window.location.href = '/fusion-lab'}
                                className="px-10 py-5 bg-rose-600 text-white rounded-[24px] font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-rose-600/30 hover:bg-rose-500 transition-all transform hover:-translate-y-1"
                              >
                                 Open Submission Portal →
                              </button>
                           </div>
                           <div className="shrink-0 w-48 h-48 bg-slate-800/80 rounded-[48px] border border-white/5 flex items-center justify-center text-7xl opacity-80 shadow-2xl animate-float">
                              🎯
                           </div>
                        </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Knowledge Quick Connect */}
            <div className="bg-slate-900 rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full -mr-48 -mt-48 blur-3xl"></div>
               <div className="relative flex flex-col md:flex-row justify-between items-center gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                       <Zap size={20} className="text-amber-400 fill-amber-400" />
                       <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Connection Engine</span>
                    </div>
                    <h2 className="text-3xl font-black tracking-tighter mb-4 leading-none">Your Brain is <br/><span className="text-blue-400 italic font-medium">Auto-Syncing</span></h2>
                    <p className="text-slate-400 text-sm mb-8 max-w-md italic font-medium">
                       "Based on your recent Physics notes, I've linked 'Vectors' with your older 'Calculus II' concepts. The knowledge gap has reduced by 12%."
                    </p>
                    <button 
                      onClick={() => window.location.href = '/graph'}
                      className="bg-white text-slate-900 px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-400 hover:text-white transition-all transform hover:-translate-y-1"
                    >
                       View Connection Map
                    </button>
                  </div>
                  <div className="w-full md:w-64 h-64 bg-slate-800 rounded-[32px] border border-slate-700 flex items-center justify-center p-8 overflow-hidden relative shadow-2xl">
                     <div className="absolute inset-0 bg-blue-500/5 animate-pulse"></div>
                     <div className="relative grid grid-cols-2 gap-4">
                        {[1,2,3,4].map(i => (
                          <div key={i} className="w-16 h-16 bg-slate-700 rounded-2xl border border-slate-600 animate-pulse" style={{ animationDelay: `${i*200}ms` }}></div>
                        ))}
                        <div className="absolute inset-0 flex items-center justify-center">
                           <LinkIcon size={32} className="text-blue-500 animate-bounce" />
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
            {/* Recall Queue */}
            <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-xl shadow-orange-500/5">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
                    <Clock size={18} />
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-widest">Recall Queue</h3>
                </div>
                <span className="text-[10px] font-black bg-orange-500 text-white px-2 py-1 rounded-lg">3 DUE</span>
              </div>
              
              <div className="space-y-4">
                {[
                  { title: 'Bernoulli\'s Principle', time: 'Ready', color: 'blue' },
                  { title: 'The Cold War Origins', time: 'Ready', color: 'rose' },
                  { title: 'Array.prototype.reduce()', time: 'Overdue', color: 'purple' },
                ].map(item => (
                  <div 
                    key={item.title} 
                    onClick={() => window.location.href = '/learn'}
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-orange-200 transition-colors cursor-pointer group"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="text-[11px] font-black text-slate-900">{item.title}</h4>
                      <ArrowRight size={14} className="text-slate-300 group-hover:text-orange-500 transition-colors" />
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 mt-2 block">{item.time}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => window.location.href = '/learn'}
                className="w-full mt-6 py-4 bg-orange-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 shadow-xl shadow-orange-500/20 transition-all"
              >
                Start Review Session
              </button>
            </div>

            {/* Cognitive Profile Analysis */}
            <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-xl overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-purple-500/10 transition-all"></div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                  <Sparkles size={18} />
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-800">Neural Sync Profile</h3>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                   <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Sync Strength</p>
                   <span className="text-[11px] font-black text-purple-600">88%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                   <div className="bg-purple-600 h-full w-[88%] shadow-[0_0_10px_rgba(147,51,234,0.3)]"></div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                   <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Inferred Style</p>
                      <p className="text-xs font-black text-slate-900 uppercase">Logical-Visual</p>
                   </div>
                   <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Focus Window</p>
                      <p className="text-xs font-black text-slate-900 uppercase">28 Minutes</p>
                   </div>
                </div>

                <p className="text-[10px] text-slate-500 italic leading-relaxed">
                   "The AI has observed high retention with graphical analogies. Future summaries will include more structural diagrams."
                </p>
                <div className="pt-4 border-t border-slate-100 flex gap-4">
                  <button 
                    onClick={() => window.location.href = '/ai-tutor'}
                    className="flex-1 bg-purple-600 text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-purple-500/20 hover:bg-purple-700 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                  >
                     <MessageSquare size={14} /> Open Neural Mentor
                  </button>
                </div>
              </div>
            </div>

            {/* Creative Canvas */}
            <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
              <div className="flex items-center gap-3 mb-6 relative">
                 <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                   <Edit3 size={18} />
                 </div>
                 <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">Whiteboard Engine</h3>
              </div>
              <p className="text-[11px] text-slate-400 mb-6 italic leading-relaxed relative">
                 Visualize concepts and build custom mind maps. Auto-syncs directly to your knowledge graph.
              </p>
              <button 
                 onClick={() => window.location.href = '/whiteboard'}
                 className="w-full bg-blue-600 text-white rounded-2xl py-4 font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-blue-500/30 hover:bg-blue-500 transition-all flex items-center justify-center gap-2"
              >
                 Launch Creative Canvas
              </button>
            </div>

            {/* Achievement / Stats */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full -mb-16 -mr-12 blur-3xl"></div>
              <h3 className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-8">Intellect Rank</h3>
              
              <div className="flex items-center gap-6 mb-8">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-4xl shadow-inner border border-white/5">
                  🥈
                </div>
                <div>
                  <p className="text-xl font-black italic">Ascended Sage</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">Top 5% Learner</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-1">
                  <span>Progress to Grandmaster</span>
                  <span>82%</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-indigo-500 h-full w-[82%] shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default LearningDashboard;
