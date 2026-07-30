import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Globe, ArrowLeft, Loader } from 'lucide-react';
import { publishingService, PublishedSite } from '../features/publishing/services/publishingService';

const PublicSiteView: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [site, setSite] = useState<PublishedSite | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [note, setNote] = useState<any>(null);

  useEffect(() => {
    const fetchSite = async () => {
      if (!slug) return;
      try {
        const data = await publishingService.getPublicSite(slug);
        if (data.site) {
          setSite(data.site);
          setNote(data.note);
        } else {
          setError('Site not found');
        }
      } catch (err) {
        setError('Failed to load published site');
      } finally {
        setLoading(false);
      }
    };
    fetchSite();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  if (error || !site) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <Globe size={64} className="text-slate-300 mb-6" />
        <h1 className="text-3xl font-black text-slate-800 mb-4">404 - Not Found</h1>
        <p className="text-slate-500 mb-8 max-w-md">{error || 'This published site does not exist or has been removed.'}</p>
        <Link to="/" className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Public Header */}
      <header className="border-b border-slate-100 py-6 px-8 flex justify-between items-center bg-slate-50/50">
        <div className="flex items-center gap-3">
          <Globe className="text-indigo-600" size={24} />
          <h1 className="text-xl font-black text-slate-800 tracking-tight">{site.title}</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{site.views} views</span>
          <Link to="/" className="text-indigo-600 text-sm font-bold hover:underline flex items-center gap-2">
            Built with NoteFusion <ArrowLeft size={14} />
          </Link>
        </div>
      </header>

      {/* Public Content area */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        <article className="prose prose-slate prose-lg max-w-none">
          {note ? (
            <div>
              <h1 className="text-4xl font-black mb-8 text-slate-900">{note.title}</h1>
              <div 
                className="note-content"
                dangerouslySetInnerHTML={{ __html: note.content }} 
              />
            </div>
          ) : (
            <>
              <p className="text-xl text-slate-600 font-medium mb-8 leading-relaxed">
                Welcome to the public page for <strong>{site.title}</strong>. This content is published via NoteFusion's neural publishing network.
              </p>
              <div className="p-8 bg-indigo-50/50 border border-indigo-100 rounded-3xl">
                <h3 className="text-lg font-bold text-indigo-900 mb-4">No Content Attached</h3>
                <p className="text-indigo-700/80">
                  This public page exists, but the associated Note (ID: <code>{site.note_id || 'null'}</code>) could not be found or has not been attached yet.
                </p>
              </div>
            </>
          )}
        </article>
      </main>
    </div>
  );
};

export default PublicSiteView;
