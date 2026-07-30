import React, { useState, useRef, useEffect } from 'react';
import { Command, FileText, Sparkles, ArrowRight, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

interface SynthesisBlueprint {
  id: string;
  title: string;
  corePrinciples: string[];
  compressedContent: string;
  density: number;
}

const Architect: React.FC = () => {
  const [input, setInput] = useState('');
  const [blueprints, setBlueprints] = useState<SynthesisBlueprint[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [blueprints]);

  const handleSynthesize = async () => {
    if (!input.trim()) {
      toast.error('Please provide content to synthesize');
      return;
    }

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('content', input);

      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/v1/synthesize-blueprint`, {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: formData,
      });

      const data = await response.json();
      
      if (data.title) {
        const newBlueprint: SynthesisBlueprint = {
          id: Date.now().toString(),
          title: data.title,
          corePrinciples: data.corePrinciples || [],
          compressedContent: data.compressedContent,
          density: data.density || 85
        };
        
        setBlueprints(prev => [newBlueprint, ...prev]);
        setInput('');
        toast.success('Synthesis blueprint created!');
      } else {
        throw new Error(data.error || 'Failed to synthesize');
      }
    } catch (error) {
      console.error('Synthesis Error:', error);
      toast.error('Neural pathway unstable. Creating low-density fallback.');
      
      const newBlueprint: SynthesisBlueprint = {
        id: Date.now().toString(),
        title: `Partial Synthesis: ${input.substring(0, 20)}`,
        corePrinciples: ['Core concept extraction'],
        compressedContent: input.substring(0, 150) + '...',
        density: 45
      };
      setBlueprints(prev => [newBlueprint, ...prev]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto h-[calc(100vh-200px)] flex flex-col bg-white rounded-[32px] shadow-xl border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-teal-50">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
            <Command className="text-white" size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg md:text-2xl font-black text-slate-900 truncate">The Architect</h2>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Knowledge Compressor</p>
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-6 border-b border-slate-100 bg-slate-50">
        <div className="flex flex-col md:flex-row gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your content here (notes, articles, transcripts)..."
            className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-medium min-h-[100px] md:min-h-[120px] resize-none"
          />
          <button
            onClick={handleSynthesize}
            disabled={!input.trim() || isProcessing}
            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg flex-shrink-0"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Synthesizing...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Create Blueprint
              </>
            )}
          </button>
        </div>
      </div>

      {/* Blueprints List */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4" ref={scrollRef}>
        {blueprints.length === 0 ? (
          <div className="text-center py-12 md:py-20">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="text-emerald-600" size={32} />
            </div>
            <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-2">No Blueprints Yet</h3>
            <p className="text-sm md:text-base text-slate-500 font-medium max-w-md mx-auto">
              Start by pasting content above to create your first high-density synthesis blueprint
            </p>
          </div>
        ) : (
          blueprints.map((blueprint) => (
            <div
              key={blueprint.id}
              className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-4 md:p-6 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg md:text-xl font-black text-slate-900 mb-2">{blueprint.title}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="text-emerald-600" size={16} />
                    <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">
                      {blueprint.density}% Density
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 mb-4">
                <h4 className="text-xs font-black text-slate-600 uppercase tracking-widest">Core Principles</h4>
                {blueprint.corePrinciples.map((principle, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 flex-shrink-0"></div>
                    <p className="text-sm font-medium text-slate-700">{principle}</p>
                  </div>
                ))}
              </div>
              
              <div className="bg-white/60 rounded-xl p-3 border border-emerald-100">
                <p className="text-xs font-medium text-slate-600 leading-relaxed">{blueprint.compressedContent}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Architect;
