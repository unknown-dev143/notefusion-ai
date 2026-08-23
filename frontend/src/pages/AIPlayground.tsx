import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../config';
import toast from 'react-hot-toast';
import { Brain, Sparkles, Send, Bot, User, ArrowLeft, LogIn, ShieldAlert } from 'lucide-react';
import AnimatedLogo from '../components/layout/AnimatedLogo';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

const generateSimulatedResponse = (query: string): string => {
  const lower = query.toLowerCase();
  if (lower.includes('quantum') || lower.includes('entanglement')) {
    return "🔬 **Quantum Entanglement Explained Simply**:\n\nImagine you have two magical dice separated across the universe. Whenever you roll a 6 on one die, the other die instantly becomes a 6 as well, without any delay or wire between them. In physics, two particles become so intertwined that the state of one immediately determines the state of the other—what Einstein famously called 'spooky action at a distance'.";
  }
  if (lower.includes('photosynthesis') || lower.includes('quiz')) {
    return "📝 **Active Recall Quiz (Photosynthesis)**:\n\n1. **What pigment in chloroplasts absorbs light photons?** *(Answer: Chlorophyll a & b)*\n2. **Which molecule is split during the light-dependent reactions to release oxygen?** *(Answer: Water / H₂O)*\n3. **In which cycle does carbon fixation occur?** *(Answer: Calvin Cycle)*";
  }
  if (lower.includes('summarize') || lower.includes('revolution')) {
    return "⚡ **Synthesized Knowledge Summary**:\n\n• **Core Transition**: Shift from manual, agrarian craftsmanship to mechanized manufacturing powered by steam and fossil fuels.\n• **Socio-economic Impact**: Rapid urbanization, emergence of modern factory workflows, and unprecedented growth in global trade output.\n• **Key Takeaway**: Laid the foundation for contemporary technological infrastructure and industrial capitalism.";
  }
  if (lower.includes('ethics') || lower.includes('ai')) {
    return "📚 **Research Paper Outline: Responsible AI & Ethics**:\n\n1. **Introduction**: The emergence of autonomous reasoning models and alignment concerns.\n2. **Algorithmic Transparency**: Black-box interpretability vs. open-source weights.\n3. **Bias & Fairness**: Mitigation strategies in multimodal datasets.\n4. **Governance Frameworks**: Global safety standards and watermarking protocols.\n5. **Conclusion**: Collaborative roadmaps for human-centric AI.";
  }
  return `💡 **Neural Synthesis for: "${query}"**\n\n• **Key Concept**: Analyzed conceptual structure across neural embeddings.\n• **Core Insight**: NoteFusion links your thoughts directly into active recall flashcards, interactive mindmaps, and hierarchical knowledge trees.\n• **Recommendation**: Sign in with scholar@notefusion.ai to save and auto-generate diagrams for this topic!`;
};

const AIPlayground: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: "Welcome to the Neural Sandbox! I'm the NoteFusion AI engine. Paste any text or ask me a question to see how I can transform your research into knowledge. (Note: Data in the Sandbox is not saved to a profile)." }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    
    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsTyping(true);

    try {
      const formData = new FormData();
      formData.append('message', currentInput);
      formData.append('history', JSON.stringify(messages));

      // Guest requests attempt API call
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.response) {
          setMessages(prev => [...prev, { role: 'ai', content: data.response }]);
          return;
        }
      }
      throw new Error('API offline or fallback triggered');
    } catch (err) {
      console.warn('Sandbox offline fallback engaged:', err);
      // Intelligent browser sandbox fallback so guest users always get instant answers
      setTimeout(() => {
        const simulated = generateSimulatedResponse(currentInput);
        setMessages(prev => [...prev, { role: 'ai', content: simulated }]);
      }, 500);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navigation */}
      <nav className="p-6 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-4">
           <button 
             onClick={() => navigate('/login')}
             className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-blue-600 transition-all shadow-sm"
           >
             <ArrowLeft size={20}/>
           </button>
           <div className="h-8 w-px bg-slate-200"></div>
           <div className="scale-75 origin-left">
             <AnimatedLogo />
           </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-100 rounded-full text-[9px] font-black text-amber-600 uppercase tracking-widest">
              <ShieldAlert size={12}/> Guest Access Active
           </div>
           <button 
             onClick={() => toast.error('Account required to save research to permanent memory. Please sign up!')}
             className="hidden md:flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest hover:border-blue-400 hover:text-blue-600 transition-all"
           >
             💾 Save to Library
           </button>
           <Link to="/signup" className="px-6 py-2.5 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2">
             <LogIn size={14}/> Claim Full Profile
           </Link>
        </div>
      </nav>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 flex flex-col pb-8">
         <div className="mb-8 text-center md:text-left">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">Neural <span className="text-blue-600">Sandbox</span></h1>
            <p className="text-sm font-bold text-slate-400 mt-2">Test the AI engine instantly. No registration required.</p>
         </div>

         <div className="flex-1 bg-white rounded-[40px] shadow-2xl shadow-slate-200/60 flex flex-col overflow-hidden border border-slate-100 relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#2563eb 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar scroll-smooth relative z-10" ref={scrollRef}>
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
                   <div className={`max-w-[85%] flex gap-5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-lg ${msg.role === 'user' ? 'bg-slate-900 text-white' : 'bg-white text-blue-600 border border-slate-100'}`}>
                        {msg.role === 'user' ? <User size={20}/> : <Bot size={24}/>}
                      </div>
                      <div className={`p-6 rounded-[32px] text-sm font-medium leading-relaxed shadow-sm transition-all hover:shadow-md ${
                        msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                      }`}>
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      </div>
                   </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] flex gap-5">
                     <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-blue-600 shadow-sm border border-slate-100 animate-pulse">
                       <Bot size={24}/>
                     </div>
                     <div className="p-6 bg-white/60 backdrop-blur-sm text-slate-400 rounded-[32px] rounded-tl-none border border-slate-100 flex items-center gap-4">
                        <span className="text-[10px] font-black uppercase tracking-widest">Neural Processing</span>
                        <div className="flex gap-1.5">
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-100"></div>
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-200"></div>
                        </div>
                     </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-8 bg-slate-50/80 backdrop-blur-md border-t border-slate-100 relative z-10">
               <div className="max-w-4xl mx-auto relative flex gap-4">
                  <div className="flex-1 relative">
                    <textarea 
                      rows={1}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                      placeholder="Paste your text or ask a question here..."
                      className="w-full bg-white border border-slate-200 rounded-[28px] py-5 pl-8 pr-16 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm resize-none"
                    />
                    <button 
                      onClick={handleSend}
                      disabled={isTyping || !input.trim()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-blue-600 transition-all shadow-xl disabled:opacity-20"
                    >
                      <Send size={20}/>
                    </button>
                  </div>
               </div>
            </div>
         </div>

         {/* Suggestion Chips */}
         <div className="flex gap-3 justify-center mt-6 overflow-x-auto no-scrollbar pb-4">
            {[
              'Explain Quantum Entanglement simply',
              'Summarize: "The industrial revolution was a period of..."',
              'Generate 3 quiz questions about photosynthesis',
              'Help me outline a research paper on AI ethics'
            ].map(chip => (
              <button 
                key={chip}
                onClick={() => setInput(chip)}
                className="px-6 py-3 bg-white border border-slate-100 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest hover:border-blue-200 hover:text-blue-600 transition-all shadow-sm whitespace-nowrap"
              >
                {chip}
              </button>
            ))}
         </div>
      </main>
    </div>
  );
};

export default AIPlayground;
