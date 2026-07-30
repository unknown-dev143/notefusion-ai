import React, { useState, useEffect } from 'react';
import { Globe, Eye, Copy, Trash2, ExternalLink, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { publishingService, PublishedSite } from '../features/publishing/services/publishingService';

const PublishingHub: React.FC = () => {
  const [publishedNotes, setPublishedNotes] = useState<PublishedSite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
      try {
          const sites = await publishingService.getSites();
          // Transform if needed, e.g. date format
          setPublishedNotes(sites);
      } catch (err) {
          toast.error('Failed to load sites');
      } finally {
          setLoading(false);
      }
  };

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  const unpublish = async (id: number) => {
    if (!window.confirm('Are you sure?')) return;
    try {
        await publishingService.deleteSite(id);
        setPublishedNotes(prev => prev.filter(n => n.id !== id));
        toast.success('Note unpublished');
    } catch (err) {
        toast.error('Failed to unpublish');
    }
  };

  const handleNewSite = async () => {
      const title = prompt('Enter site title:');
      if (!title) return;
      const slug = prompt('Enter URL slug (e.g. my-awesome-note):', title.toLowerCase().replace(/\s+/g, '-'));
      if (!slug) return;

      const url = `${window.location.origin}/public/${slug}`;

      try {
          const newSite = await publishingService.createSite({
              title,
              url,
          });
          setPublishedNotes([...publishedNotes, newSite]);
          toast.success('Site published!');
      } catch (err) {
          toast.error('Failed to publish');
      }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 animate-slide-up">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="bg-indigo-100 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-200">
           <Globe size={40} className="text-indigo-600"/>
        </div>
        <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tight">Public Portfolio</h1>
        <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">
           Share your knowledge with the world. Turn any note into a beautiful, SEO-optimized web page in seconds.
        </p>
      </div>

      {/* Published List */}
      <div className="bg-white rounded-[48px] border border-slate-100 shadow-2xl shadow-indigo-100/50 overflow-hidden mb-12">
         <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-xl font-black text-slate-800">Your Published Sites</h2>
            <button onClick={handleNewSite} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-200">
               <Plus size={16}/> New Site
            </button>
         </div>
         
         {loading ? <div className="p-10 text-center">Loading...</div> : publishedNotes.length > 0 ? (
            <div className="divide-y divide-slate-50">
               {publishedNotes.map(note => (
                  <div key={note.id} className="p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:bg-slate-50/30 transition-colors">
                     <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                           <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                           <h3 className="text-lg font-bold text-slate-900">{note.title}</h3>
                        </div>
                        <a href={note.url} target="_blank" rel="noopener noreferrer" className="text-indigo-500 text-sm font-medium hover:underline flex items-center gap-1">
                           {note.url} <ExternalLink size={12}/>
                        </a>
                        <p className="text-xs text-slate-400 mt-1">{new Date(note.created_at).toLocaleDateString()}</p>
                     </div>
                     
                     <div className="flex items-center gap-8">
                        <div className="text-center">
                           <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Views</p>
                           <p className="text-lg font-black text-slate-700 flex items-center gap-2 justify-center"><Eye size={16} className="text-slate-400"/> {note.views}</p>
                        </div>
                        <div className="flex items-center gap-2">
                           <button onClick={() => copyLink(note.url)} className="p-3 bg-white border border-slate-100 rounded-xl text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-all" title="Copy Link">
                              <Copy size={18}/>
                           </button>
                           <button onClick={() => unpublish(note.id)} className="p-3 bg-white border border-slate-100 rounded-xl text-slate-500 hover:text-rose-600 hover:border-rose-200 transition-all" title="Unpublish">
                              <Trash2 size={18}/>
                           </button>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         ) : (
            <div className="p-20 text-center text-slate-400">
               <Globe size={48} className="mx-auto mb-4 opacity-20"/>
               <p className="font-bold">No sites published yet.</p>
            </div>
         )}
      </div>

      {/* Analytics Preview */}
      <div className="grid md:grid-cols-3 gap-6">
         <div className="bg-slate-900 text-white p-8 rounded-[32px] shadow-xl">
            <h3 className="text-sm font-black uppercase tracking-widest opacity-60 mb-2">Total Views</h3>
            <p className="text-4xl font-black">{publishedNotes.reduce((acc, curr) => acc + curr.views, 0)}</p>
         </div>
         <div className="bg-indigo-600 text-white p-8 rounded-[32px] shadow-xl">
            <h3 className="text-sm font-black uppercase tracking-widest opacity-60 mb-2">Active Sites</h3>
            <p className="text-4xl font-black">{publishedNotes.length}</p>
         </div>
         <div className="bg-white border border-slate-100 p-8 rounded-[32px] shadow-xl">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-2">Top Referrer</h3>
            <p className="text-2xl font-black text-slate-800">Twitter / X</p>
         </div>
      </div>
    </div>
  );
};

export default PublishingHub;
