import React, { useState, useRef, useEffect } from 'react';
import { Brain, MessageSquare, Lightbulb, ArrowRight, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

interface Message {
  role: 'user' | 'tutor';
  content: string;
  timestamp: Date;
}

const SocraticTutor: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'tutor',
      content: "Hello! I'm your Socratic Tutor. Instead of giving you answers, I'll guide you through questions to help you discover the solution yourself. What topic would you like to explore?",
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

    const userMessage: Message = {
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
      formData.append('system_prompt', "You are a Socratic Tutor. Never give direct answers. Instead, guide the user by asking insightful questions that help them discover the answer themselves based on their provided context and current knowledge.");
      
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
        const tutorResponse: Message = {
          role: 'tutor',
          content: data.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, tutorResponse]);
      } else {
        throw new Error('No response from AI');
      }
    } catch (error) {
      console.error('Tutor error:', error);
      toast.error('Neural connection failed. Operating in fallback mode.');
      
      const tutorResponse: Message = {
        role: 'tutor',
        content: generateSocraticResponse(input),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, tutorResponse]);
    } finally {
      setIsThinking(false);
    }
  };

  const generateSocraticResponse = (userInput: string): string => {
    // Simple Socratic response generator - replace with actual AI
    const responses = [
      `That's an interesting point. What evidence supports that idea?`,
      `Let's think about this differently. What would happen if the opposite were true?`,
      `Can you break down that concept into smaller parts? What are the fundamental components?`,
      `What assumptions are you making here? Are they always valid?`,
      `How does this relate to what you already know? Can you find connections?`,
      `What questions does this raise? What would you need to know to fully understand this?`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  return (
    <div className="w-full max-w-5xl mx-auto h-[calc(100vh-200px)] flex flex-col bg-white rounded-[32px] shadow-xl border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Brain className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900">Socratic Tutor</h2>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Cognitive Coach • Deep Questioning</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={scrollRef}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
          >
            <div className={`max-w-[80%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600'
                }`}
              >
                {msg.role === 'user' ? '👤' : <Lightbulb size={20} />}
              </div>
              <div
                className={`p-4 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-slate-50 text-slate-800 rounded-tl-none border border-slate-100'
                }`}
              >
                <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
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
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                <Sparkles className="text-blue-600 animate-pulse" size={20} />
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl rounded-tl-none border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Tutor is thinking...
                  </span>
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-75"></div>
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-150"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-6 border-t border-slate-100 bg-slate-50">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask a question or share your thoughts..."
            className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isThinking}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
          >
            Send <ArrowRight size={16} />
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-3 text-center font-medium">
          💡 I'll guide you through questions, not give direct answers
        </p>
      </div>
    </div>
  );
};

export default SocraticTutor;
