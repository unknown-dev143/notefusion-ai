import React, { useState, useEffect } from 'react';
import styles from './AdvancedSearch.module.css';
import { useNotes } from '../features/notes/context/NoteContext';
import AIService from '../features/ai/services/AIService';
import { Sparkles, Brain, Search } from 'lucide-react';

interface AdvancedSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ isOpen, onClose }) => {
  const { notes } = useNotes();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isSemanticMode, setIsSemanticMode] = useState(true);
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const performSearch = async () => {
       if (!query.trim()) {
          setResults([]);
          return;
       }
       setIsSearching(true);
       if (isSemanticMode) {
          const semanticResults = await AIService.semanticSearch(query, notes);
          setResults(semanticResults);
       } else {
          const filtered = notes.filter(n => n.title.toLowerCase().includes(query.toLowerCase()));
          setResults(filtered.map(f => ({ ...f, type: 'note', icon: '📝' })));
       }
       setIsSearching(false);
       setSelectedIndex(0);
    };

    const debounce = setTimeout(performSearch, 300);
    return () => clearTimeout(debounce);
  }, [query, isSemanticMode, notes]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
      }
      if (e.key === 'Enter' && results[selectedIndex]) {
        // Handle selection
        console.log('Selected:', results[selectedIndex]);
        onClose();
      }
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, selectedIndex, results]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.searchHeader}>
          <div className="flex items-center gap-3 w-full">
             <Search size={24} className="text-slate-400" />
             <input 
               autoFocus
               className={styles.searchInput}
               placeholder={isSemanticMode ? "Search by meaning (e.g. 'How do I start a business?')" : "Search by keyword..."}
               value={query}
               onChange={e => setQuery(e.target.value)}
             />
          </div>
          <button 
             onClick={() => setIsSemanticMode(!isSemanticMode)}
             className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${isSemanticMode ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
          >
             {isSemanticMode ? <Brain size={12}/> : <Search size={12}/>}
             {isSemanticMode ? 'Semantic Active' : 'Keyword Only'}
          </button>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 ml-4">
            <span className="text-2xl">×</span>
          </button>
        </div>

        <div className={styles.filterBar}>
          {['all', 'notes', 'recordings', 'drawings'].map(f => (
            <button
              key={f}
              className={`${styles.filterBadge} ${filter === f ? styles.activeFilter : ''}`}
              onClick={() => {
                setFilter(f);
                setSelectedIndex(0);
              }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div className={styles.resultsArea}>
          {isSearching ? (
             <div className="text-center py-20 animate-pulse">
                <Brain size={40} className="mx-auto text-blue-500 mb-4" />
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest italic">Neural Lookup in Progress...</p>
             </div>
          ) : query.length > 0 ? (
            results.length > 0 ? (
              results.map((result, index) => (
                <div 
                  key={result.id} 
                  className={`${styles.resultItem} ${index === selectedIndex ? 'bg-blue-50 border-l-4 border-blue-600 shadow-sm' : ''}`}
                >
                  <div className={`${styles.resultIcon} ${index === selectedIndex ? 'bg-blue-100 text-blue-600' : 'bg-slate-100'}`}>
                     {result.icon || '📝'}
                  </div>
                  <div className={styles.resultInfo}>
                    <div className="flex items-center justify-between">
                       <h4 className={index === selectedIndex ? 'text-blue-600 text-sm font-black' : 'text-sm font-bold'}>{result.title}</h4>
                       {isSemanticMode && result.relevance && (
                          <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                             {Math.round(result.relevance * 100)}% Semantic Match
                          </span>
                       )}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 truncate">{result.content?.substring(0, 100)}</p>
                  </div>
                </div>
              ))
            ) : (
               <div className="text-center py-20">
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No matches found in your neural network</p>
               </div>
            )
          ) : (
            <div className="text-center py-12 text-slate-400">
              <p className="font-medium">Initiate Cognitive Search</p>
              <p className="text-xs mt-1">Search through AI notes, lecture transcripts, and whiteboard drawings</p>
              <div className="mt-8 flex justify-center gap-4">
                 <div className="px-4 py-2 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-[9px] uppercase font-black text-slate-400">Brain Mapping</div>
                 <div className="px-4 py-2 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-[9px] uppercase font-black text-slate-400">Cross-linking</div>
                 <div className="px-4 py-2 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-[9px] uppercase font-black text-slate-400">Semantic Vector</div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t flex gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
           <span><kbd className="bg-white border p-1 rounded">↵</kbd> to select</span>
           <span><kbd className="bg-white border p-1 rounded">↑↓</kbd> to navigate</span>
           <span><kbd className="bg-white border p-1 rounded">esc</kbd> to close</span>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearch;
