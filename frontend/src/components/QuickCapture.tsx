import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Mic, MicOff, X, Send, Tag, Pin } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNotes } from '../features/notes/context/NoteContext';

const QuickCapture: React.FC = () => {
  const { createNote } = useNotes();
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState('');
  const [tags, setTags] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // Open with keyboard shortcut Alt+C
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'c') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const startVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Voice recognition not supported in this browser.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onresult = (e: any) => {
      const transcript = Array.from(e.results)
        .map((r: any) => r[0].transcript)
        .join('');
      setText(prev => prev + (prev ? ' ' : '') + transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => {
      setIsListening(false);
      toast.error('Voice capture failed.');
    };
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    toast.success('Listening...', { icon: '🎙️', duration: 2000 });
  };

  const stopVoice = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const handleSave = async () => {
    if (!text.trim()) {
      toast.error('Write something first!');
      return;
    }
    setIsSaving(true);
    try {
      const parsedTags = tags.split(',').map(t => t.trim()).filter(Boolean);
      await createNote({
        title: `Quick Capture — ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        content: text.trim(),
        tags: ['quick-capture', ...parsedTags],
        isPinned,
        isArchived: false,
        color: '#f0fdf4',
      } as any);
      toast.success('Captured & Saved! ⚡', { duration: 3000 });
      setText('');
      setTags('');
      setIsPinned(false);
      setIsOpen(false);
    } catch {
      toast.error('Save failed.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <motion.button
        id="quick-capture-btn"
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-24 right-6 z-[150] w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/30 sm:bottom-8 sm:right-24"
        title="Quick Capture (Alt+C)"
      >
        <Zap size={24} className="text-white" />
      </motion.button>

      {/* Capture Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[160] bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="fixed bottom-8 right-6 sm:right-24 z-[170] w-full max-w-md"
            >
              <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-slate-100">
                {/* Header */}
                <div className="flex items-center justify-between px-8 pt-8 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                      <Zap size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900">Quick Capture</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Alt+C to toggle • Esc to close</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Body */}
                <div className="px-8 pb-8 space-y-4">
                  {/* Text Area */}
                  <textarea
                    ref={textareaRef}
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSave(); }}
                    placeholder="Capture your thought instantly..."
                    rows={4}
                    className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent resize-none placeholder:text-slate-300 leading-relaxed"
                  />

                  {/* Tags + Pin Row */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <Tag size={14} className="text-slate-400 shrink-0" />
                      <input
                        value={tags}
                        onChange={e => setTags(e.target.value)}
                        placeholder="Add tags (comma separated)"
                        className="flex-1 bg-transparent text-xs font-medium text-slate-700 outline-none placeholder:text-slate-300"
                      />
                    </div>
                    <button
                      onClick={() => setIsPinned(!isPinned)}
                      className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${isPinned ? 'bg-amber-500 text-white shadow-lg shadow-amber-200' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                      title="Pin note"
                    >
                      <Pin size={16} />
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={isListening ? stopVoice : startVoice}
                      className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${isListening ? 'bg-red-100 text-red-600 border-2 border-red-200 animate-pulse' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                      {isListening ? <><MicOff size={16} /> Stop</> : <><Mic size={16} /> Voice</>}
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving || !text.trim()}
                      className="flex-[2] py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-emerald-300/40 hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:scale-100"
                    >
                      {isSaving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Send size={16} /> Save Note ⌘↵</>}
                    </button>
                  </div>

                  {/* Word count */}
                  <p className="text-[10px] font-bold text-slate-300 text-right">
                    {text.trim() ? text.trim().split(/\s+/).length : 0} words
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default QuickCapture;
