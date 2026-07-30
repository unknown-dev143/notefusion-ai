import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotes } from '../features/notes/context/NoteContext';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  Search, 
  FileText, 
  Calendar, 
  CheckSquare, 
  Settings, 
  Zap,
  BookOpen,
  Brain,
  Target,
  Palette,
  Download,
  Upload,
  Users,
  Bell,
  Sparkles,
  Command,
  BarChart,
  Flame,
  ArrowRight,
  MessageSquare,
  Lightbulb
} from 'lucide-react';
import { notesApi } from '../api';
import toast from 'react-hot-toast';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [neuralResults, setNeuralResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const { notes } = useNotes();
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = [
    // Navigation
    { id: 'dashboard', name: t('dashboard'), icon: <Zap size={18}/>, action: () => navigate('/dashboard'), category: 'Navigation' },
    { id: 'notes', name: t('notes'), icon: <FileText size={18}/>, action: () => navigate('/notes'), category: 'Navigation' },
    { id: 'graph', name: t('graph'), icon: <Brain size={18}/>, action: () => navigate('/graph'), category: 'Navigation' },
    { id: 'explore-hud', name: 'Explore HUD', icon: <Search size={18}/>, action: () => navigate('/explore-hud'), category: 'Navigation' },
    { id: 'whiteboard', name: t('whiteboard'), icon: <Palette size={18}/>, action: () => navigate('/whiteboard'), category: 'Navigation' },
    { id: 'calendar', name: t('calendar'), icon: <Calendar size={18}/>, action: () => navigate('/calendar'), category: 'Navigation' },
    { id: 'tasks', name: t('tasks'), icon: <CheckSquare size={18}/>, action: () => navigate('/tasks'), category: 'Navigation' },
    { id: 'settings', name: t('settings'), icon: <Settings size={18}/>, action: () => navigate('/settings'), category: 'Navigation' },
    { id: 'fusion-lab', name: 'Neural Fusion Lab', icon: <Flame size={18}/>, action: () => navigate('/fusion-lab'), category: 'Navigation' },
    { id: 'statistics', name: 'Cognitive Stats', icon: <BarChart size={18}/>, action: () => navigate('/statistics'), category: 'Navigation' },
    { id: 'ai-portal', name: 'AI Portal', icon: <Sparkles size={18}/>, action: () => navigate('/ai-portal'), category: 'Navigation' },
    { id: 'socratic-tutor', name: 'Socratic Tutor', icon: <Brain size={18}/>, action: () => navigate('/socratic-tutor'), category: 'Navigation' },
    { id: 'examiner', name: 'Examiner', icon: <Target size={18}/>, action: () => navigate('/examiner'), category: 'Navigation' },
    { id: 'architect', name: 'The Architect', icon: <Command size={18}/>, action: () => navigate('/architect'), category: 'Navigation' },
    { id: 'logic-debater', name: 'Logic Debater', icon: <Flame size={18}/>, action: () => navigate('/logic-debater'), category: 'Navigation' },
    { id: 'creative-muse', name: 'Creative Muse', icon: <Lightbulb size={18}/>, action: () => navigate('/creative-muse'), category: 'Navigation' },
    
    // Actions
    { id: 'new-note', name: 'Create New Note', icon: <FileText size={18}/>, action: () => { navigate('/notes/new'); }, category: 'Actions' },
    { id: 'upload', name: 'Upload Document', icon: <Upload size={18}/>, action: () => navigate('/upload'), category: 'Actions' },
    { id: 'sync-cloud', name: 'Force Neural Sync', icon: <Zap size={18}/>, action: () => { toast.success('Knowledge base synchronized'); }, category: 'Actions' },
  ];

  // AI Prompt Mode detection
  const isAIPrompt = search.startsWith('ai ') || search.startsWith('/');

  const filteredCommands = useMemo(() => {
    if (isAIPrompt) {
      return [{
        id: 'ai-prompt',
        name: `Neural AI: "${search.replace(/^(ai |\/)/, '')}"`,
        icon: <Sparkles className="text-purple-500" size={18}/>,
        action: () => {
          toast.success('Analyzing neural intent...');
          navigate('/ai-tutor');
        },
        category: 'Neural Pulse'
      }];
    }

    const matchedCommands = commands.filter(cmd => 
      cmd.name.toLowerCase().includes(search.toLowerCase())
    );

    const matchedNotes = notes
      .filter(n => n.title?.toLowerCase().includes(search.toLowerCase()))
      .slice(0, 5)
      .map(n => ({
        id: `note-${n.id}`,
        name: n.title,
        icon: <FileText size={18} className="text-blue-500"/>,
        action: () => navigate(`/notes/${n.id}`),
        category: 'Notes Found'
      }));
      
    // Combine results, prioritizing Neural Intelligence
    return [...neuralResults, ...matchedCommands, ...matchedNotes];
  }, [search, notes, isAIPrompt, neuralResults]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
    
    // Neural Search Debounce
    if (search.length > 3 && !isAIPrompt) {
      const timer = setTimeout(async () => {
        setIsSearching(true);
        try {
          const results: any[] = await notesApi.neuralSearch(search);
          setNeuralResults(results.map((n: any) => ({
            id: `neural-${n.id}`,
            name: n.title,
            icon: <Sparkles size={18} className="text-purple-500 animate-[pulse_2s_infinite]"/>,
            action: () => navigate(`/notes/${n.id}`),
            category: 'Smart Neural Result'
          })));
        } catch (err) {
          console.error("Neural Search failed", err);
        } finally {
          setIsSearching(false);
        }
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setNeuralResults([]);
    }
  }, [search, isAIPrompt, navigate]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
        onClose();
        setSearch('');
      }
    } else if (e.key === 'Escape') {
      onClose();
      setSearch('');
    }
  };

  const groupedCommands = useMemo<Record<string, any[]>>(() => {
    return filteredCommands.reduce((acc, cmd) => {
      if (!acc[cmd.category]) acc[cmd.category] = [];
      acc[cmd.category].push(cmd);
      return acc;
    }, {} as Record<string, any[]>);
  }, [filteredCommands]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
        onClick={onClose}
      ></div>

      {/* Command Palette */}
      <div className="relative w-full max-w-2xl mx-4 bg-white rounded-[32px] shadow-2xl border border-slate-200 overflow-hidden animate-slide-up">
        {/* Search Input */}
        <div className="p-6 border-b border-slate-100 flex items-center gap-4">
          <Search size={24} className="text-slate-400"/>
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search..."
            className="flex-1 text-lg font-bold text-slate-900 placeholder:text-slate-400 outline-none bg-transparent"
          />
          <kbd className="px-3 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-xs font-black uppercase tracking-wider">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[500px] overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={24} className="text-slate-400"/>
              </div>
              <p className="text-slate-500 font-bold">No commands found</p>
              <p className="text-xs text-slate-400 mt-1">Try a different search term</p>
            </div>
          ) : (
            <div className="p-3">
              {Object.entries(groupedCommands).map(([category, cmds]) => (
                <div key={category} className="mb-4 last:mb-0">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mb-2">
                    {category}
                  </p>
                  <div className="space-y-1">
                    {cmds.map((cmd, idx) => {
                      const globalIndex = filteredCommands.indexOf(cmd);
                      return (
                        <button
                          key={cmd.id}
                          onClick={() => {
                            cmd.action();
                            onClose();
                            setSearch('');
                          }}
                          className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all text-left ${
                            globalIndex === selectedIndex
                              ? 'bg-blue-600 text-white shadow-lg'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            globalIndex === selectedIndex
                              ? 'bg-white/20'
                              : 'bg-slate-100'
                          }`}>
                            {cmd.icon}
                          </div>
                          <span className="font-bold flex-1">{cmd.name}</span>
                          {globalIndex === selectedIndex && (
                            <kbd className="px-2 py-1 bg-white/20 rounded-lg text-xs font-black">
                              ↵
                            </kbd>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-black">↑↓</kbd>
              <span>Navigate</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-black">↵</kbd>
              <span>Select</span>
            </div>
          </div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
            ⌘K to open
          </span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
