import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { notesApi, Note } from '../api';
import { BookOpen, Share2, Copy, Download, Home } from 'lucide-react';
import toast from 'react-hot-toast';

const SharedNoteView: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNote = async () => {
      if (!token) return;
      try {
        const data = await notesApi.getSharedNote(token);
        setNote(data);
      } catch (err) {
        toast.error('Note not found or link expired');
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [token]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
        <div className="text-6xl mb-6">🏜️</div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">Node Not Found</h1>
        <p className="text-slate-400 mb-8">This knowledge node is no longer public or the link is invalid.</p>
        <button 
          onClick={() => navigate('/')}
          className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold flex items-center gap-2"
        >
          <Home size={18} /> Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>{note.title} | NoteFusion AI</title>
        <meta name="description" content={`Unlock this premium Knowledge Node on NoteFusion AI: ${note.content.substring(0, 100)}...`} />
        <meta property="og:title" content={note.title} />
        <meta property="og:description" content={`Unlock this premium Knowledge Node on NoteFusion AI`} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={note.title} />
        <meta name="twitter:description" content={`Unlock this premium Knowledge Node on NoteFusion AI`} />
      </Helmet>
      
      {/* Premium Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">
            <BookOpen size={20} />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 leading-none">{note.title}</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Shared Knowledge Node</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleCopyLink}
            className="p-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
            title="Copy Link"
          >
            <Share2 size={18} />
          </button>
          <button 
            onClick={() => navigate('/login')}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-100"
          >
            Import to My Library
          </button>
        </div>
      </header>

      {/* Note Content */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        <article className="prose prose-slate lg:prose-xl max-w-none">
          <div className="mb-12">
            <div className="flex flex-wrap gap-2 mb-6">
              {note.tags && (Array.isArray(note.tags) ? note.tags : (note.tags as string).split(',')).map(tag => (
                <span key={tag} className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs font-bold">#{tag}</span>
              ))}
            </div>
          </div>
          
          <div className="text-slate-800 leading-relaxed whitespace-pre-wrap font-medium">
            {note.content}
          </div>
        </article>

        <footer className="mt-20 pt-10 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-400 font-medium mb-4">Powered by NoteFusion AI — Your Intelligent Knowledge Engine</p>
          <button 
            onClick={() => navigate('/register')}
            className="text-xs font-black text-blue-600 uppercase tracking-widest hover:underline"
          >
            Create Your Own Neural Map →
          </button>
        </footer>
      </main>
    </div>
  );
};

export default SharedNoteView;
