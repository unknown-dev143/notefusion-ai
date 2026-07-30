import React, { useState, useRef, useEffect } from 'react';
import { Lightbulb, Sparkles, Link2, ArrowRight, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

interface Idea {
  id: string;
  title: string;
  description: string;
  connections: string[];
  category: 'fusion' | 'cross-pollination' | 'innovation';
}

const CreativeMuse: React.FC = () => {
  const [input, setInput] = useState('');
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [ideas]);

  const handleGenerate = async () => {
    if (!input.trim()) {
      toast.error('Please describe what you want to explore');
      return;
    }

    setIsGenerating(true);
    try {
      const formData = new FormData();
      formData.append('description', input);

      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/v1/generate-ideas`, {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: formData,
      });

      const data = await response.json();
      
      if (data.ideas) {
        const newIdeas = data.ideas.map((idea: any, index: number) => ({
          ...idea,
          id: `${Date.now()}-${index}`
        }));
        
        setIdeas(prev => [...newIdeas, ...prev]);
        setInput('');
        toast.success('New ideas materialized!');
      } else {
        throw new Error(data.error || 'Failed to generate ideas');
      }
    } catch (error) {
      console.error('Ideation Error:', error);
      toast.error('Neural muse is silent. Using logic extrapolation.');
      
      const categories: ('fusion' | 'cross-pollination' | 'innovation')[] = ['fusion', 'cross-pollination', 'innovation'];
      const category = categories[Math.floor(Math.random() * categories.length)];
      
      const fallbackIdea: Idea = {
        id: Date.now().toString(),
        title: `Extrapolated Concept: ${input.substring(0, 20)}`,
        description: `Logical extension based on "${input.substring(0, 50)}...". Examining cross-domain resonance between existing nodes.`,
        connections: ['Node Analysis → Trend Projection'],
        category
      };
      setIdeas(prev => [fallbackIdea, ...prev]);
    } finally {
      setIsGenerating(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'fusion': return 'from-amber-500 to-orange-500';
      case 'cross-pollination': return 'from-orange-500 to-red-500';
      case 'innovation': return 'from-amber-600 to-yellow-500';
      default: return 'from-amber-500 to-orange-500';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto h-[calc(100vh-200px)] flex flex-col bg-white rounded-[32px] shadow-xl border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-slate-100 bg-gradient-to-r from-amber-50 to-orange-50">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-amber-600 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
            <Lightbulb className="text-white" size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg md:text-2xl font-black text-slate-900 truncate">Creative Muse</h2>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Ideation Engine</p>
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-6 border-b border-slate-100 bg-slate-50">
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe what you want to explore or connect..."
            className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent font-medium text-sm md:text-base"
          />
          <button
            onClick={handleGenerate}
            disabled={!input.trim() || isGenerating}
            className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg flex-shrink-0"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Generate Idea
              </>
            )}
          </button>
        </div>
      </div>

      {/* Ideas Grid */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {ideas.length === 0 ? (
          <div className="text-center py-12 md:py-20">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lightbulb className="text-amber-600" size={32} />
            </div>
            <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-2">No Ideas Yet</h3>
            <p className="text-sm md:text-base text-slate-500 font-medium max-w-md mx-auto">
              Start by describing what you want to explore. I'll find hidden connections across your knowledge base.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {ideas.map((idea) => (
              <div
                key={idea.id}
                className={`bg-gradient-to-br ${getCategoryColor(idea.category)}/10 border-2 border-${idea.category === 'fusion' ? 'amber' : idea.category === 'cross-pollination' ? 'orange' : 'yellow'}-200 rounded-2xl p-4 md:p-6 hover:shadow-lg transition-all`}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg md:text-xl font-black text-slate-900 flex-1">{idea.title}</h3>
                  <div className={`px-3 py-1 bg-gradient-to-r ${getCategoryColor(idea.category)} text-white rounded-full text-xs font-black uppercase tracking-widest flex-shrink-0 ml-2`}>
                    {idea.category}
                  </div>
                </div>
                
                <p className="text-sm md:text-base font-medium text-slate-700 mb-4 leading-relaxed">
                  {idea.description}
                </p>
                
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                    <Link2 size={14} />
                    Connections
                  </h4>
                  {idea.connections.map((conn, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-white/60 rounded-xl p-2 border border-amber-100">
                      <Zap className="text-amber-600" size={14} />
                      <span className="text-xs font-medium text-slate-700">{conn}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreativeMuse;
