import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useProgression } from '../contexts/ProgressionContext';
import { useLocation } from 'react-router-dom';
import { Sparkles, Send, X, Bot, User, Zap, MessageSquare, Brain, Loader2, Terminal, Cpu, Activity, Coins } from 'lucide-react';

const EmaCopilot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'ai' | 'user', content: string}[]>([
    { role: 'ai', content: 'Neural Core online. I am Ema, your Enhanced Mind Assistant. How can I facilitate your cognitive growth today?' }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [neuralStream, setNeuralStream] = useState<string>('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const { xp, level, addXP, progress, tokens } = useProgression();
  const location = useLocation();

  const getContextName = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Global System View';
    if (path.startsWith('/notes/')) return 'Specific Research Node';
    if (path === '/notes') return 'Knowledge Library';
    if (path === '/fusion-lab') return 'Neural Reactor Core';
    return 'Active Workspace';
  };

  const thoughts = ["Vectorizing knowledge...", "Cross-referencing datasets...", "Optimizing semantic paths...", "Synthesizing research...", "Scanning neural nodes...", "Initializing logic gates..."];

  useEffect(() => {
    if (isThinking) {
      const interval = setInterval(() => {
        setNeuralStream(thoughts[Math.floor(Math.random() * thoughts.length)]);
      }, 800);
      return () => clearInterval(interval);
    }
  }, [isThinking]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (overrideMsg?: string) => {
    const userMsg = overrideMsg || input;
    if (!userMsg.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setIsThinking(true);

    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: `Synthesis complete for ${getContextName()}. Ema has processed your request regarding "${userMsg}". I recommend cross-referencing this with your recent nodes for optimal retention.`
      }]);
      addXP(50);
      setIsThinking(false);
    }, 2000);
  };

  return (
    <>
      <div className="fixed bottom-10 left-10 z-[150]">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          className="w-16 h-16 bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700 rounded-[24px] shadow-2xl flex items-center justify-center text-white relative group border-4 border-white dark:border-slate-800"
        >
          <div className="absolute inset-0 bg-white/20 rounded-[20px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          {isOpen ? <X size={28} /> : <Sparkles className="animate-pulse" size={28} />}
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></span>
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -100, scale: 0.9 }}
            className="fixed bottom-32 left-10 w-[400px] h-[600px] glass rounded-[40px] shadow-2xl z-[150] flex flex-col overflow-hidden border-white/20"
          >
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-indigo-600 to-blue-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                  <Brain size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-black text-xs uppercase tracking-widest text-white/90">Ema (Enhanced Mind Assistant)</h3>
                    <span className="px-2 py-0.5 bg-white/20 rounded-md text-[8px] font-black text-white">LVL {level}</span>
                    <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-md text-[8px] font-black text-slate-900 flex items-center gap-1">
                      <Coins size={10} /> {tokens}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
                       <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          className="h-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                       ></motion.div>
                    </div>
                    <span className="text-[8px] text-white/50 font-black uppercase tracking-tighter">XP {xp % 1000} / 1000</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-2 rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Chat Body */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
              {messages.map((m, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  key={i} 
                  className={`flex ${m.role === 'ai' ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-[85%] p-4 rounded-[24px] text-sm font-medium leading-relaxed shadow-lg ${
                    m.role === 'ai' 
                      ? 'bg-white border border-slate-100 text-slate-800 rounded-tl-none' 
                      : 'bg-indigo-600 text-white shadow-indigo-200 rounded-tr-none'
                  }`}>
                    {m.role === 'ai' && (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 bg-indigo-50 rounded-full flex items-center justify-center">
                          <Cpu size={10} className="text-indigo-600" />
                        </div>
                        <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Ema Core</span>
                      </div>
                    )}
                    {m.content}
                  </div>
                </motion.div>
              ))}
              
              {isThinking && (
                <div className="flex justify-start animate-fade-in">
                  <div className="bg-slate-900 text-white p-4 rounded-[24px] rounded-tl-none max-w-[85%] shadow-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">Neural Stream Active</span>
                    </div>
                    <div className="flex items-center gap-2 bg-black/40 p-2 rounded-xl border border-white/5 font-mono text-[9px] text-emerald-400">
                      <Terminal size={12} />
                      <span className="animate-pulse">{neuralStream}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Smart Commands Overlay (Experimental) */}
            <div className="px-6 py-2 flex gap-2 overflow-x-auto no-scrollbar bg-slate-50 border-t border-slate-100/50">
               {[
                 { label: 'Summarize Context', icon: <MessageSquare size={12}/>, prompt: 'Summarize my current workspace.' },
                 { label: 'Find Gaps', icon: <Zap size={12}/>, prompt: 'Identify knowledge gaps here.' },
                 { label: 'Explain Logic', icon: <Brain size={12}/>, prompt: 'Break down the logic of this page.' }
               ].map((cmd) => (
                 <button 
                  key={cmd.label}
                  onClick={() => handleSend(cmd.prompt)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-[9px] font-black text-slate-500 uppercase tracking-widest hover:border-indigo-400 hover:text-indigo-600 transition-all whitespace-nowrap shadow-sm"
                 >
                   {cmd.icon} {cmd.label}
                 </button>
               ))}
            </div>

            {/* Input Area */}
            <div className="p-6 bg-slate-50 border-t border-slate-100">
              <div className="bg-white rounded-2xl p-2 border border-slate-200 flex items-center gap-2 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask your neural network..."
                  className="flex-1 bg-transparent px-3 py-2 outline-none text-sm font-bold text-slate-800 placeholder:text-slate-400"
                />
                <button 
                  onClick={() => handleSend()}
                  className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-colors"
                >
                  <Send size={18} />
                </button>
              </div>
              <div className="mt-4 flex items-center justify-center gap-4">
                  <button 
                    onClick={() => handleSend('Summarize my current view.')}
                    className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
                  >
                     <MessageSquare size={12}/> Summarize View
                  </button>
                  <div className="w-px h-3 bg-slate-200"></div>
                  <button 
                    onClick={() => handleSend('Generate flashcards for this context.')}
                    className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
                  >
                     <Zap size={12}/> AI Flashcards
                  </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default EmaCopilot;
