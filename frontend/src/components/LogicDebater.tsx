import React, { useState, useRef, useEffect } from 'react';
import { Flame, MessageSquare, AlertTriangle, ArrowRight, Brain } from 'lucide-react';
import toast from 'react-hot-toast';

interface DebateMessage {
  role: 'user' | 'debater';
  content: string;
  timestamp: Date;
  challengeType?: 'assumption' | 'logic' | 'evidence';
}

const LogicDebater: React.FC = () => {
  const [messages, setMessages] = useState<DebateMessage[]>([
    {
      role: 'debater',
      content: "I'm your Logic Debater. I'll challenge your assumptions, question your logic, and help you refine your arguments. What statement or thesis would you like me to examine?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: DebateMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsThinking(true);

    try {
      const formData = new FormData();
      formData.append('message', input);
      formData.append('history', JSON.stringify(messages));
      formData.append('system_prompt', "You are a Logic Debater. Your goal is to critically examine the user's statements, challenge their assumptions, find logical fallacies, and request evidence for claims. Be rigorous but constructive. If you find a challenge, state it clearly.");
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/v1/chat`, {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: formData,
      });

      const data = await response.json();
      
      if (data.response) {
        const debaterResponse: DebateMessage = {
          role: 'debater',
          content: data.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, debaterResponse]);
      } else {
        throw new Error('No response from AI');
      }
    } catch (error) {
      console.error('Debater error:', error);
      toast.error('Neural connection failed. Operating in fallback mode.');
      
      const debugResponses = [
        "What evidence supports this assumption? Could the opposite be true?",
        "Let's examine the logical structure. What if we consider an alternative premise?",
        "What evidence contradicts this? Are there counter-examples we should consider?"
      ];

      const debaterResponse: DebateMessage = {
        role: 'debater',
        content: debugResponses[Math.floor(Math.random() * debugResponses.length)],
        timestamp: new Date()
      };
      setMessages(prev => [...prev, debaterResponse]);
    } finally {
      setIsThinking(false);
    }
  };

  const getChallengeIcon = (type?: string) => {
    switch (type) {
      case 'assumption': return '💭';
      case 'logic': return '🧠';
      case 'evidence': return '📊';
      default: return '🔥';
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto h-[calc(100vh-200px)] flex flex-col bg-white rounded-[32px] shadow-xl border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-slate-100 bg-gradient-to-r from-purple-50 to-fuchsia-50">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-600 to-fuchsia-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
            <Flame className="text-white" size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg md:text-2xl font-black text-slate-900 truncate">Logic Debater</h2>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Critical Mirror</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6" ref={scrollRef}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
          >
            <div className={`max-w-[85%] md:max-w-[80%] flex gap-2 md:gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div
                className={`w-8 h-8 md:w-10 md:h-10 rounded-2xl flex items-center justify-center flex-shrink-0 text-sm md:text-lg ${
                  msg.role === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gradient-to-br from-purple-100 to-fuchsia-100 text-purple-600'
                }`}
              >
                {msg.role === 'user' ? '👤' : getChallengeIcon(msg.challengeType)}
              </div>
              <div
                className={`p-3 md:p-4 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-purple-600 text-white rounded-tr-none'
                    : 'bg-slate-50 text-slate-800 rounded-tl-none border border-slate-100'
                }`}
              >
                {msg.challengeType && (
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="text-purple-600" size={14} />
                    <span className="text-xs font-black text-purple-600 uppercase tracking-widest">
                      {msg.challengeType} Challenge
                    </span>
                  </div>
                )}
                <p className="text-sm md:text-base font-medium leading-relaxed">{msg.content}</p>
                <span className="text-xs opacity-70 mt-2 block">
                  {msg.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex justify-start animate-fade-in">
            <div className="max-w-[80%] flex gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-100 to-fuchsia-100 flex items-center justify-center">
                <Brain className="text-purple-600 animate-pulse" size={20} />
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl rounded-tl-none border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Analyzing logic...
                  </span>
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce delay-75"></div>
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce delay-150"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 md:p-6 border-t border-slate-100 bg-slate-50">
        <div className="flex gap-2 md:gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Present your argument or statement..."
            className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium text-sm md:text-base"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isThinking}
            className="px-4 md:px-6 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg flex-shrink-0"
          >
            Send <ArrowRight size={16} />
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-3 text-center font-medium">
          💡 I'll challenge your assumptions and help refine your logic
        </p>
      </div>
    </div>
  );
};

export default LogicDebater;
