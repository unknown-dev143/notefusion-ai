import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../features/auth/context/AuthContext';
import { useNotes } from '../features/notes/context/NoteContext';
import { API_URL } from '../config';
import toast from 'react-hot-toast';
import { Brain, Sparkles, Trash2, Share2, Send, Bot, User, FileSpreadsheet, Network } from 'lucide-react';
import { spreadsheetService } from '../features/spreadsheets/services/spreadsheetService';
import { mindMapService } from '../features/mindmaps/services/mindMapService';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

const AITutor: React.FC = () => {
  const { user } = useAuth();
  const { notes } = useNotes();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: `Greetings${user ? ', ' + user.name : ', scholar'}. I'm your Personal AI Tutor. I've analyzed your recent research data. What shall we master today?` }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [spreadsheets, setSpreadsheets] = useState<any[]>([]);
  const [mindmaps, setMindmaps] = useState<any[]>([]);

  useEffect(() => {
    const fetchKnowledge = async () => {
      try {
        const [sheets, maps] = await Promise.all([
          spreadsheetService.getSpreadsheets(),
          mindMapService.getMindMaps()
        ]);
        setSpreadsheets(sheets);
        setMindmaps(maps);
      } catch (err) {
        console.error('Failed to load auxiliary knowledge roots', err);
      }
    };
    fetchKnowledge();
  }, []);

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

      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.response) {
        setMessages(prev => [...prev, { role: 'ai', content: data.response }]);
      } else {
        throw new Error('No response from AI');
      }
    } catch (err) {
      console.error('Chat error:', err);
      
      // Smart Fallback: Search Notes, Sheets, and Maps
      const keywords = currentInput.toLowerCase().split(' ').filter(w => w.length > 3);
      
      const foundNote = notes.find(n => 
          keywords.some(k => n.title.toLowerCase().includes(k) || n.content.toLowerCase().includes(k))
      );

      const foundSheet = spreadsheets.find(s => 
          keywords.some(k => s.title.toLowerCase().includes(k))
      );

      const foundMap = mindmaps.find(m => 
          keywords.some(k => m.title.toLowerCase().includes(k))
      );

      let aiResponse = "";
      if (foundNote) {
          aiResponse = `[OFFLINE MODE] Neural sync detected. Accessing your knowledge base...\n\nFound a match in your note: **"${foundNote.title}"**.\n\nSummary: "${foundNote.content.substring(0, 150)}..."\n\nI can analyze the relational logic of this note for you.`;
      } else if (foundSheet) {
          aiResponse = `[OFFLINE MODE] Analytical data located. Found a match in your Neural Sheet: **"${foundSheet.title}"**.\n\nThis sheet contains structured analytical data that I can help you process or visualize once the neural connection is restored.`;
      } else if (foundMap) {
          aiResponse = `[OFFLINE MODE] Relational map detected. Found a match in your Mind Map: **"${foundMap.title}"**.\n\nThis cognitive map contains structural nodes that define the hierarchy of your research. What part shall we drill down into?`;
      } else {
          const suggestions = [...notes.slice(0, 1), ...spreadsheets.slice(0, 1), ...mindmaps.slice(0, 1)].map(n => n.title).join('", "');
          aiResponse = `[OFFLINE MODE] I couldn't find a precise match for "${currentInput}". \n\nHowever, I am tracking your active knowledge roots: "${suggestions}". Try asking about those.`;
      }

      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: aiResponse
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-140px)] flex flex-col animate-slide-up py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 px-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-blue-600 rounded-[28px] flex items-center justify-center text-3xl shadow-2xl shadow-blue-500/20 ai-sparkle">
            <Bot size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">Neural <span className="text-blue-600">Mentor</span></h1>
            <div className="flex items-center gap-4 mt-1">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Neural Mentorship Online</span>
              </div>
              <div className="h-3 w-px bg-slate-200"></div>
              <div className="flex gap-3 text-[9px] font-black text-blue-500 uppercase tracking-widest">
                <span className="flex items-center gap-1"><Brain size={10}/> {notes.length} Roots</span>
                <span className="flex items-center gap-1"><FileSpreadsheet size={10}/> {spreadsheets.length} Sheets</span>
                <span className="flex items-center gap-1"><Network size={10}/> {mindmaps.length} Maps</span>
              </div>
            </div>
          </div>
        </div>
        <div className="hidden md:flex gap-3">
           <button onClick={() => setMessages([])} className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm">
             <Trash2 size={20}/>
           </button>
           <button 
             onClick={() => {
                navigator.clipboard.writeText(messages.map(m => `[${m.role.toUpperCase()}]: ${m.content}`).join('\n'));
                toast.success('Conversation copied to clipboard');
             }} 
             className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm"
           >
             <Share2 size={20}/>
           </button>
        </div>
      </div>

      {/* Chat Area - Glassmorphism */}
      <div className="flex-1 glass border-white/20 rounded-[48px] shadow-2xl shadow-slate-200/50 flex flex-col overflow-hidden relative border">
        
        <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar scroll-smooth" ref={scrollRef}>
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-20">
               <Brain size={64} className="mb-6 text-slate-300" />
               <h3 className="text-xl font-black text-slate-400">Knowledge Ready</h3>
               <p className="text-sm font-medium text-slate-400">Ask your mentor about your synthesized research.</p>
            </div>
          )}
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
               <div className={`max-w-[85%] flex gap-5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-lg ${msg.role === 'user' ? 'bg-slate-900 text-white' : 'bg-white text-blue-600 border border-slate-50'}`}>
                    {msg.role === 'user' ? <User size={20}/> : <Sparkles size={20}/>}
                  </div>
                  <div className={`p-6 rounded-[32px] text-sm font-medium leading-relaxed shadow-sm transition-all hover:shadow-md ${
                    msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white/80 backdrop-blur-md text-slate-800 rounded-tl-none border border-white/50'
                  }`}>
                    {msg.content}
                  </div>
               </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="max-w-[80%] flex gap-5">
                 <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-blue-600 shadow-sm border border-slate-50 animate-pulse">
                   <Sparkles size={20}/>
                 </div>
                 <div className="p-6 bg-white/40 backdrop-blur-sm text-slate-400 rounded-[32px] rounded-tl-none border border-white/50 flex items-center gap-4">
                    <span className="text-[10px] font-black uppercase tracking-widest">Analyzing Knowledge</span>
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

        {/* Input Area - Integrated */}
        <div className="p-8 pb-10 bg-white/50 backdrop-blur-xl border-t border-white/50 relative z-10">
           <div className="max-w-4xl mx-auto relative flex gap-4">
              <div className="flex-1 relative group">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Master your subjects. Ask the Neural Mentor..."
                  className="w-full bg-white/80 border border-slate-100 rounded-[32px] py-6 pl-8 pr-16 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-xl shadow-slate-200/20 group-hover:border-blue-200"
                />
                <button 
                  onClick={handleSend}
                  disabled={isTyping || !input.trim()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-14 h-14 bg-slate-900 text-white rounded-3xl flex items-center justify-center hover:bg-blue-600 hover:scale-105 active:scale-95 transition-all shadow-2xl disabled:opacity-20 disabled:scale-100"
                >
                  <Send size={24}/>
                </button>
              </div>
           </div>
        </div>
      </div>

       {/* Quick Suggestion Chips */}
       <div className="flex gap-3 justify-center mt-6 overflow-x-auto no-scrollbar pb-4">
          {[
            'Summarize my Calculus notes',
            'Quiz me on Neuroscience',
            'Explain state-space search',
            'Define metabolic pathways'
          ].map(chip => (
            <button 
              key={chip}
              onClick={() => setInput(chip)}
              className="px-6 py-3 bg-white border border-slate-100 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest hover:border-blue-200 hover:text-blue-600 transition-all shadow-sm whitespace-nowrap"
            >
              {chip}
            </button>
          ))}
       </div>
    </div>
  );
};

export default AITutor;
