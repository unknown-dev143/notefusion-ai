import React, { useState, useEffect } from 'react';
import { notesApi, Note } from '../api';
import { ShoppingBag, Lock, Unlock, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const NoteMarketplace: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  const fetchNotes = async () => {
    try {
      const data = await notesApi.getMarketplace();
      setNotes(data);
    } catch (err) {
      toast.error('Failed to load marketplace');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handlePurchase = async (id: string) => {
    try {
      setPurchasingId(id);
      const res = await notesApi.purchaseNote(id);
      if (res.status === 'success') {
        toast.success(res.message);
        // Optimistic UI update
        setNotes(prev => prev.map(note => 
          note.id === id 
            ? { ...note, content: 'Content unlocked. View Node.' } 
            : note
        ));
        fetchNotes(); // Fetch in background to get real decrypted content
      } else if (res.status === 'already_owned') {
        toast('You already own this note', { icon: 'ℹ️' });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Purchase failed');
    } finally {
      setPurchasingId(null);
    }
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Neural Marketplace</h1>
          <p className="text-slate-400 font-medium">Acquire high-density knowledge nodes from the community.</p>
        </div>
        
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search knowledge nodes..." 
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-bold text-slate-800"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm flex flex-col h-full animate-pulse">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl"></div>
                <div className="w-20 h-8 bg-slate-100 rounded-xl"></div>
              </div>
              <div className="w-3/4 h-6 bg-slate-100 rounded-lg mb-4"></div>
              <div className="w-full h-4 bg-slate-50 rounded mb-2"></div>
              <div className="w-5/6 h-4 bg-slate-50 rounded mb-6"></div>
              <div className="mt-auto pt-6 flex items-center justify-between border-t border-slate-50">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100"></div>
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100"></div>
                </div>
                <div className="w-10 h-10 bg-slate-100 rounded-xl"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredNotes.map((note) => (
            <motion.div 
              key={note.id}
              whileHover={{ y: -5 }}
              className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm hover:shadow-xl transition-all relative overflow-hidden flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-xl">
                  {note.content.includes('[Purchase') ? <Lock size={20} /> : <Unlock size={20} />}
                </div>
                <div className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest">
                  {note.price > 0 ? `${note.price} Tokens` : 'Free'}
                </div>
              </div>

              <h3 className="text-xl font-black text-slate-900 mb-2 leading-tight">{note.title}</h3>
              <p className="text-sm text-slate-400 font-medium mb-6 line-clamp-3">
                {note.content}
              </p>

              <div className="mt-auto pt-6 flex items-center justify-between border-t border-slate-50">
                <div className="flex -space-x-2">
                   {[1, 2, 3].map(i => (
                     <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100"></div>
                   ))}
                   <span className="text-[10px] font-bold text-slate-400 self-center ml-4 uppercase tracking-tighter">142 Purchases</span>
                </div>
                
                {note.content.includes('[Purchase') ? (
                  <button 
                    onClick={() => handlePurchase(note.id)}
                    disabled={purchasingId === note.id}
                    className={`p-3 rounded-xl transition-colors shadow-lg ${purchasingId === note.id ? 'bg-slate-200 text-slate-400' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100'}`}
                  >
                    {purchasingId === note.id ? <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div> : <ShoppingBag size={18} />}
                  </button>
                ) : (
                  <button 
                    onClick={() => window.location.href = `/notes/${note.id}`}
                    className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                  >
                    View Node →
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && filteredNotes.length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🌑</div>
          <h2 className="text-2xl font-black text-slate-900">No nodes found</h2>
          <p className="text-slate-400">Try a different search or check back later.</p>
        </div>
      )}
    </div>
  );
};

export default NoteMarketplace;
