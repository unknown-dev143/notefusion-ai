import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotes } from '../features/notes/context/NoteContext';
import { formatDistanceToNow } from 'date-fns';
import { 
  Grid as GridIcon, List as ListIcon, MoreVertical, 
  Pin, Trash2, Copy, Search, ArrowUpDown, Clock, FileText, Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

type SortOption = 'updated' | 'created' | 'title' | 'words';
type ViewMode = 'grid' | 'list';

const Notes: React.FC = () => {
  const { notes, fetchNotes, loading, updateNote, deleteNote, createNote, pinNote } = useNotes();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('updated');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  
  // Context menu state
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Global Keyboard shortcut for New Note
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + N
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        navigate('/notes/new');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  // Handle clicking outside context menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute dynamic categories (tags)
  const categories = useMemo(() => {
    const allTags = new Set<string>();
    notes.forEach(note => {
      if (note.tags) note.tags.forEach(t => allTags.add(t));
    });
    return ['all', ...Array.from(allTags).sort()];
  }, [notes]);

  // Helper: word count
  const getWordCount = (text: string) => {
    return text ? text.split(/\s+/).filter(Boolean).length : 0;
  };

  // Filter & Sort Logic
  const filteredNotes = useMemo(() => {
    let result = notes.filter(note => {
      const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           note.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filter === 'all' || (note.tags && note.tags.some(t => t.toLowerCase() === filter.toLowerCase()));
      return matchesSearch && matchesFilter && !note.isArchived;
    });

    result = result.sort((a, b) => {
      // Pinned always on top
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      // Then sort by chosen sort criteria
      switch (sortBy) {
        case 'updated':
          return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
        case 'created':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'words':
          return getWordCount(b.content) - getWordCount(a.content);
        default:
          return 0;
      }
    });

    return result;
  }, [notes, searchQuery, filter, sortBy]);

  const handleDuplicate = async (e: React.MouseEvent, note: any) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveMenu(null);
    const toastId = toast.loading('Duplicating...');
    try {
      await createNote({
        title: `${note.title} (Copy)`,
        content: note.content,
        tags: note.tags,
        isPinned: false,
        isArchived: false,
        color: note.color
      } as any);
      toast.success('Note duplicated', { id: toastId });
    } catch {
      toast.error('Failed to duplicate', { id: toastId });
    }
  };

  const handleDelete = async (e: React.MouseEvent, noteId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveMenu(null);
    const toastId = toast.loading('Deleting...');
    try {
      await deleteNote(noteId);
      toast.success('Note deleted', { id: toastId });
    } catch {
      toast.error('Failed to delete', { id: toastId });
    }
  };

  const handleTogglePin = async (e: React.MouseEvent, note: any) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveMenu(null);
    try {
      if (pinNote) {
         await pinNote(note.id, !note.isPinned);
      } else {
         await updateNote(note.id, { isPinned: !note.isPinned });
      }
      toast.success(note.isPinned ? 'Unpinned' : 'Pinned');
    } catch {
      toast.error('Failed to update pin status');
    }
  };

  if (loading) {
     return (
        <div className="max-w-7xl mx-auto px-4 py-20 text-center animate-pulse">
           <div className="text-6xl mb-4">🧠</div>
           <h2 className="text-xl font-black text-slate-300 uppercase tracking-widest">Loading Knowledge Base...</h2>
        </div>
     );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-900 mb-2">My Knowledge library</h1>
          <p className="font-bold text-slate-400 uppercase tracking-widest text-[11px] flex gap-3">
            <span>Manage your research</span>
            <span className="hidden sm:inline opacity-50">•</span>
            <span className="hidden sm:inline text-slate-300">Press <kbd className="font-sans px-1 text-[9px] border rounded bg-slate-50 border-slate-200 text-slate-500">⌘ N</kbd> to quick-create</span>
          </p>
        </div>
        <Link to="/notes/new" className="bg-blue-600 text-white px-8 py-4 rounded-[20px] font-black text-sm shadow-xl shadow-blue-200 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
           <Plus size={18} /> New Note
        </Link>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        {/* Search */}
        <div className="flex-1 relative group">
          <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search notes..."
            className="w-full bg-white border border-slate-100 rounded-[28px] py-4 pl-14 pr-6 text-sm font-bold text-slate-600 outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 shadow-sm transition-all placeholder:font-medium placeholder:text-slate-300"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Sort */}
        <div className="flex bg-white border border-slate-100 p-2 rounded-[24px] shadow-sm">
          <div className="flex items-center pl-3 pr-2 text-slate-400">
             <ArrowUpDown size={14} />
          </div>
          <select 
            className="bg-transparent border-none outline-none text-xs font-black uppercase tracking-widest text-slate-600 focus:ring-0 cursor-pointer px-2"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
          >
            <option value="updated">Recently Edited</option>
            <option value="created">Recently Created</option>
            <option value="title">Title (A-Z)</option>
            <option value="words">Word Count</option>
          </select>
        </div>

        {/* View Toggle */}
        <div className="flex bg-white border border-slate-100 p-2 rounded-[24px] shadow-sm">
           <button 
             onClick={() => setViewMode('grid')}
             className={`p-3 rounded-[16px] transition-all ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:bg-slate-50'}`}
           >
             <GridIcon size={18} />
           </button>
           <button 
             onClick={() => setViewMode('list')}
             className={`p-3 rounded-[16px] transition-all ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:bg-slate-50'}`}
           >
             <ListIcon size={18} />
           </button>
        </div>
      </div>

      {/* Tags Filter */}
      <div className="flex gap-2 mb-10 overflow-x-auto no-scrollbar pb-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-6 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${filter === cat ? 'bg-slate-800 text-white shadow-md' : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Notes Display */}
      {filteredNotes.length > 0 ? (
        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
          <AnimatePresence>
            {filteredNotes.map((note) => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={note.id} 
                className={`group relative bg-white border border-slate-100 rounded-[32px] p-8 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300 flex ${viewMode === 'list' ? 'flex-row items-center gap-8 min-h-[140px]' : 'flex-col min-h-[300px]'} overflow-hidden cursor-pointer`}
                onClick={() => navigate(`/notes/${note.id}`)}
              >
                {/* Visual accents */}
                <div className={`absolute top-0 right-0 w-32 h-32 ${note.color || 'bg-blue-500'} rounded-full -mr-16 -mt-16 transition-all group-hover:scale-[2] opacity-[0.03] group-hover:opacity-[0.08]`}></div>
                
                {note.isPinned && (
                  <div className="absolute top-6 left-6 w-8 h-8 bg-amber-100 text-amber-500 rounded-xl flex items-center justify-center shadow-sm z-10">
                    <Pin size={14} fill="currentColor" />
                  </div>
                )}

                {/* Content Block */}
                <div className={`flex-1 ${note.isPinned ? 'mt-8' : ''} ${viewMode === 'list' ? '!mt-0 flex items-center justify-between w-full' : ''}`}>
                   
                   <div className={viewMode === 'list' ? 'flex-1 min-w-0 pr-8' : ''}>
                     <div className="flex items-center gap-2 mb-4">
                       {note.tags && note.tags.slice(0, 2).map(tag => (
                         <span key={tag} className="text-[9px] font-black bg-slate-100 text-slate-500 px-3 py-1.5 rounded-xl uppercase tracking-[0.2em]">{tag}</span>
                       ))}
                       {note.tags && note.tags.length > 2 && (
                         <span className="text-[9px] font-black text-slate-400">+{note.tags.length - 2}</span>
                       )}
                     </div>
                     
                     <h3 className={`font-black text-slate-800 leading-tight mb-2 group-hover:text-blue-600 transition-colors truncate ${viewMode === 'list' ? 'text-2xl' : 'text-xl line-clamp-2 white-space-normal'}`}>
                       {note.title}
                     </h3>
                     
                     <div className={`text-sm text-slate-500 font-medium ${viewMode === 'list' ? 'line-clamp-1' : 'line-clamp-4'}`} dangerouslySetInnerHTML={{ __html: note.content.substring(0, 150) + '...' }} />
                   </div>

                   {/* Footer Metadata */}
                   <div className={`${viewMode === 'grid' ? 'mt-auto pt-6 border-t border-slate-50' : 'flex flex-col items-end gap-2 pr-12'} flex justify-between items-center w-full z-10`}>
                      <div className="flex items-center gap-4 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                        <div className="flex items-center gap-1.5"><Clock size={12}/> {note.updatedAt ? formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true }) : 'Just now'}</div>
                        <div className="flex items-center gap-1.5"><FileText size={12}/> {getWordCount(note.content)} words</div>
                      </div>
                   </div>
                </div>

                {/* Context Menu Button */}
                <div className={`absolute ${viewMode === 'list' ? 'right-6 top-1/2 -translate-y-1/2' : 'right-4 top-4'} z-20`} ref={menuRef}>
                  <button 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveMenu(activeMenu === note.id ? null : note.id); }}
                    className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors shadow-sm"
                  >
                    <MoreVertical size={18} />
                  </button>
                  
                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {activeMenu === note.id && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        className="absolute right-0 top-12 w-48 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden"
                      >
                        <div className="p-2 space-y-1">
                          <button onClick={(e) => handleTogglePin(e, note)} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
                            <Pin size={14} className={note.isPinned ? "text-amber-500 fill-amber-500" : ""} /> {note.isPinned ? 'Unpin Note' : 'Pin to Top'}
                          </button>
                          <button onClick={(e) => handleDuplicate(e, note)} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
                            <Copy size={14} /> Duplicate
                          </button>
                          <div className="h-px bg-slate-100 my-1 mx-2" />
                          <button onClick={(e) => handleDelete(e, note.id)} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-24 bg-white rounded-[48px] border border-dashed border-slate-200">
           <div className="text-7xl mb-6 opacity-40">📝</div>
           <h2 className="text-2xl font-black text-slate-800 mb-3">No notes found</h2>
           <p className="text-slate-400 font-bold max-w-sm mx-auto mb-8 text-sm leading-relaxed">
             {searchQuery ? "We couldn't find any notes matching your search or filters." : "Your knowledge library is waiting to be filled. Start capturing ideas!"}
           </p>
           {searchQuery || filter !== 'all' ? (
             <button onClick={() => { setSearchQuery(''); setFilter('all'); }} className="inline-flex bg-slate-100 text-slate-600 px-8 py-4 rounded-[20px] font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">
                Clear Filters
             </button>
           ) : (
             <Link to="/notes/new" className="inline-flex bg-blue-600 text-white px-10 py-4 rounded-[20px] font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-200 hover:scale-105 active:scale-95 transition-all">
                Create First Note
             </Link>
           )}
        </div>
      )}
    </div>
  );
};

export default Notes;
