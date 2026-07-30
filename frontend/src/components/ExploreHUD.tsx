import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Sparkles, 
  TrendingUp, 
  BookOpen, 
  Link2, 
  Zap, 
  Brain, 
  Layers, 
  Target, 
  ChevronRight,
  Maximize2,
  Share2,
  Activity,
  Command
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface ExploreResult {
  id: string;
  title: string;
  type: 'note' | 'connection' | 'concept';
  relevance: number;
  preview: string;
  tags: string[];
  lastAccessed: string;
}

const ExploreHUD: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ExploreResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'notes' | 'connections' | 'concepts'>('all');
  const [selectedResult, setSelectedResult] = useState<ExploreResult | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length > 2) {
        handleSearch();
      } else {
        setResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockResults: ExploreResult[] = [
        {
          id: '1',
          title: 'Synaptic Plasticity & Memory',
          type: 'note',
          relevance: 98,
          preview: 'Exploration of long-term potentiation and its role in hippocampal mapping...',
          tags: ['Neuroscience', 'Memory', 'Research'],
          lastAccessed: '2 hours ago'
        },
        {
          id: '2',
          title: 'Calculus III → Neural Networks',
          type: 'connection',
          relevance: 92,
          preview: 'Synthesized relationship between multivariable gradients and backpropagation efficiency...',
          tags: ['Mathematics', 'AI', 'Synthesis'],
          lastAccessed: '1 day ago'
        },
        {
          id: '3',
          title: 'Recursive Logic Processing',
          type: 'concept',
          relevance: 89,
          preview: 'Core principle defined in Synthesis Protocol V4 regarding self-optimizing data structures...',
          tags: ['Logic', 'Systems', 'V4'],
          lastAccessed: 'Just now'
        },
        {
          id: '4',
          title: 'Graph Theory Foundations',
          type: 'note',
          relevance: 85,
          preview: 'Relational database mapping using non-linear node architectures...',
          tags: ['Math', 'Graphs', 'Archive'],
          lastAccessed: '3 days ago'
        }
      ];
      
      setResults(mockResults);
    } catch (error) {
      toast.error('Neural uplink failed');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredResults = useMemo(() => {
    if (activeTab === 'all') return results;
    return results.filter(r => r.type === activeTab.slice(0, -1));
  }, [results, activeTab]);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-10">
      
      {/* Search Stage */}
      <div className="bg-white/80 backdrop-blur-3xl border border-slate-100 rounded-[64px] p-16 shadow-2xl shadow-slate-200/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full -mr-48 -mt-48 blur-3xl"></div>
        
        <div className="flex items-center gap-6 mb-12">
          <div className="w-16 h-16 bg-blue-600 rounded-[28px] flex items-center justify-center shadow-2xl shadow-blue-200">
             <Command className="text-white" size={32} />
          </div>
          <div>
             <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic">Knowledge <span className="text-blue-600">HUD</span></h2>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Neural Synthesis Engine V4.2</p>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-y-0 left-8 flex items-center pointer-events-none">
            <Search className="text-slate-300 group-focus-within:text-blue-500 transition-colors" size={28} />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search synaptic nodes, connections, or master concepts..."
            className="w-full pl-24 pr-10 py-8 bg-slate-50/50 border border-slate-100 rounded-[40px] text-2xl font-black placeholder:text-slate-200 text-slate-800 focus:outline-none focus:ring-8 focus:ring-blue-500/5 focus:bg-white transition-all shadow-inner"
          />
          {isLoading && (
            <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
               <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-4 mt-12">
           {['all', 'notes', 'connections', 'concepts'].map((tab) => (
             <button
               key={tab}
               onClick={() => setActiveTab(tab as any)}
               className={`px-10 py-5 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all ${
                 activeTab === tab 
                 ? 'bg-slate-900 text-white shadow-2xl shadow-slate-300' 
                 : 'bg-white border border-slate-100 text-slate-400 hover:bg-slate-50'
               }`}
             >
               {tab}
             </button>
           ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        
        {/* Results Stream */}
        <div className="lg:col-span-12 space-y-6">
           {filteredResults.length === 0 && !isLoading ? (
              <div className="py-32 text-center bg-white border border-slate-100 rounded-[64px] border-dashed">
                 <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8">
                    <Brain className="text-slate-200" size={48} />
                 </div>
                 <h3 className="text-2xl font-black text-slate-900 mb-2">Awaiting Neural Query</h3>
                 <p className="text-slate-400 font-medium">Input a research vector to begin discovery</p>
              </div>
           ) : (
              <div className="grid md:grid-cols-2 gap-6">
                 <AnimatePresence>
                   {filteredResults.map((result, idx) => (
                     <motion.div
                       key={result.id}
                       initial={{ opacity: 0, y: 20 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: idx * 0.1 }}
                       onClick={() => setSelectedResult(result)}
                       className="group bg-white border border-slate-100 p-8 rounded-[48px] hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-200 transition-all cursor-pointer relative overflow-hidden"
                     >
                        <div className="flex items-start justify-between mb-6">
                           <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                                result.type === 'note' ? 'bg-blue-50 text-blue-600' :
                                result.type === 'connection' ? 'bg-indigo-50 text-indigo-600' :
                                'bg-purple-50 text-purple-600'
                              }`}>
                                 {result.type === 'note' && <BookOpen size={24} />}
                                 {result.type === 'connection' && <Link2 size={24} />}
                                 {result.type === 'concept' && <Sparkles size={24} />}
                              </div>
                              <div>
                                 <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">{result.title}</h3>
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{result.type} node</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-xl">
                              <TrendingUp className="text-emerald-500" size={14} />
                              <span className="text-xs font-black text-emerald-600">{result.relevance}%</span>
                           </div>
                        </div>

                        <p className="text-sm font-medium text-slate-500 leading-relaxed mb-8">
                           {result.preview}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-8">
                           {result.tags.map(tag => (
                             <span key={tag} className="px-4 py-1.5 bg-slate-50 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest">#{tag}</span>
                           ))}
                        </div>

                        <div className="flex justify-between items-center pt-6 border-t border-slate-50">
                           <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Sync: {result.lastAccessed}</span>
                           <div className="flex gap-2">
                             <button className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all"><Share2 size={16} className="text-slate-400" /></button>
                             <button className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                                Open Node <ChevronRight size={14} />
                             </button>
                           </div>
                        </div>
                     </motion.div>
                   ))}
                 </AnimatePresence>
              </div>
           )}
        </div>
      </div>

      {/* Insight Sidebar Overlay (Mocked) */}
      {selectedResult && (
        <motion.div 
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          className="fixed inset-y-0 right-0 w-[500px] bg-white shadow-[-50px_0_100px_rgba(0,0,0,0.1)] z-50 p-12 border-l border-slate-100 flex flex-col"
        >
           <button onClick={() => setSelectedResult(null)} className="absolute top-10 right-10 p-4 hover:bg-slate-50 rounded-2xl">✕</button>
           
           <div className="mb-12 pt-10">
              <div className={`w-16 h-16 rounded-[28px] flex items-center justify-center mb-8 shadow-2xl ${
                selectedResult.type === 'note' ? 'bg-blue-600 text-white' :
                selectedResult.type === 'connection' ? 'bg-indigo-600 text-white' :
                'bg-purple-600 text-white'
              }`}>
                 {selectedResult.type === 'note' && <BookOpen size={32} />}
                 {selectedResult.type === 'connection' && <Link2 size={32} />}
                 {selectedResult.type === 'concept' && <Sparkles size={32} />}
              </div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic leading-none mb-4">{selectedResult.title}</h2>
              <div className="flex gap-3">
                 <span className="px-4 py-1.5 bg-blue-100 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">Active Link</span>
                 <span className="px-4 py-1.5 bg-slate-100 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest">Neural V4.2</span>
              </div>
           </div>

           <div className="flex-1 space-y-10 overflow-auto pr-4 custom-scrollbar">
              <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <Brain size={16} /> AI Synthesis Preview
                 </h4>
                 <p className="text-base text-slate-700 font-medium leading-relaxed italic">
                    "This node is a critical gateway. It bridges your current research on <strong>{selectedResult.tags[0]}</strong> with fundamental principles of <strong>{selectedResult.tags[1]}</strong>. Opening this will likely trigger a new cluster formation in your Neural Mind Map."
                 </p>
              </div>

              <div className="space-y-6">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Node Metrics</h4>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 bg-white border border-slate-100 rounded-3xl">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Impact Scale</p>
                       <div className="flex items-center gap-3">
                          <Activity className="text-blue-500" size={16} />
                          <span className="text-xl font-black text-slate-900">High</span>
                       </div>
                    </div>
                    <div className="p-6 bg-white border border-slate-100 rounded-3xl">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Neural Health</p>
                       <div className="flex items-center gap-3">
                          <Zap className="text-emerald-500" size={16} />
                          <span className="text-xl font-black text-slate-900">Optimal</span>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="p-8 bg-slate-900 rounded-[40px] shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl"></div>
                 <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-6">Suggested Vector</h4>
                 <p className="text-sm font-medium text-slate-300 mb-8">
                    Follow this path to synthesize a <strong>Master Study Blueprint</strong> from this node's core data.
                 </p>
                 <button className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-blue-700 transition-all">
                    Initiate Protocol →
                 </button>
              </div>
           </div>

           <div className="pt-10 border-t border-slate-100 flex gap-4">
              <button className="flex-1 py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-3">
                 <Maximize2 size={18} /> Enter Focus Mode
              </button>
           </div>
        </motion.div>
      )}
    </div>
  );
};

export default ExploreHUD;
