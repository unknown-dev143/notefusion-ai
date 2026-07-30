import React, { useMemo, useState } from 'react';
import { Scissors, Copy, ClipboardPaste, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useNotes } from '../features/notes/context/NoteContext';

const WebClipper: React.FC = () => {
  const [url, setUrl] = useState('');
  const [isClipping, setIsClipping] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualContent, setManualContent] = useState('');
  const [clippedContent, setClippedContent] = useState<{ title: string; source: string; content: string; noteId?: string } | null>(null);
  const navigate = useNavigate();
  const { createNote } = useNotes();

  const normalizedUrl = useMemo(() => {
    const raw = url.trim();
    if (!raw) return '';
    if (/^https?:\/\//i.test(raw)) return raw;
    return `https://${raw}`;
  }, [url]);

  const fetchReadableText = async (targetUrl: string): Promise<string | null> => {
    // Client-side “reader” proxy to bypass CORS for many sites.
    // If it fails, we still allow manual paste.
    try {
      const res = await fetch(`https://r.jina.ai/${targetUrl}`);
      if (!res.ok) return null;
      const text = await res.text();
      return text?.slice(0, 20000) || null; // cap to keep notes reasonable
    } catch {
      return null;
    }
  };

  const buildMarkdown = (title: string, source: string, body?: string | null) => {
    const date = new Date().toLocaleString();
    const safeTitle = title?.trim() || 'Web Clip';
    const contentBlock = body?.trim()
      ? `\n\n---\n\n## Clipped Content (Reader)\n\n${body.trim()}\n`
      : `\n\n---\n\n## Notes\n\n- Paste highlights or important excerpts here.\n`;

    return `# ${safeTitle}\n\n**Source**: ${source}\n\n**Clipped**: ${date}\n${contentBlock}`;
  };

  const handleClipUrl = async () => {
    if (!normalizedUrl) {
      toast.error('Paste a valid URL first');
      return;
    }

    setIsClipping(true);
    try {
      const readable = await fetchReadableText(normalizedUrl);
      const titleGuess = manualTitle?.trim() || new URL(normalizedUrl).hostname;
      const markdown = buildMarkdown(titleGuess, normalizedUrl, readable);

      const note = await createNote({
        title: titleGuess,
        content: markdown,
        tags: ['web-clipper'],
        isPinned: false,
        isArchived: false,
        folderId: null,
        reminder: null,
        metadata: { sourceUrl: normalizedUrl, clippedAt: new Date().toISOString(), clipper: 'web-clipper' },
        type: 'text',
      } as any);

      setClippedContent({ title: titleGuess, source: normalizedUrl, content: markdown, noteId: note.id });
      toast.success('Saved to Notes');
    } catch (e) {
      console.error(e);
      toast.error('Failed to save clip. Check backend connection.');
    } finally {
      setIsClipping(false);
    }
  };

  const handleClipManual = async () => {
    const title = manualTitle.trim() || 'Manual Clip';
    const body = manualContent.trim();
    if (!body) {
      toast.error('Paste some content to save');
      return;
    }

    setIsClipping(true);
    try {
      const markdown = `# ${title}\n\n${body}\n`;
      const note = await createNote({
        title,
        content: markdown,
        tags: ['web-clipper', 'manual'],
        isPinned: false,
        isArchived: false,
        folderId: null,
        reminder: null,
        metadata: { clippedAt: new Date().toISOString(), clipper: 'web-clipper', mode: 'manual' },
        type: 'text',
      } as any);

      setClippedContent({ title, source: 'manual', content: markdown, noteId: note.id });
      toast.success('Saved to Notes');
    } catch (e) {
      console.error(e);
      toast.error('Failed to save note');
    } finally {
      setIsClipping(false);
    }
  };

  const handlePasteClipboardUrl = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) return toast.error('Clipboard is empty');
      setUrl(text.trim());
      toast.success('Pasted URL from clipboard');
    } catch {
      toast.error('Clipboard access blocked by browser');
    }
  };

  const handleCopyText = async () => {
    if (!clippedContent?.content) return;
    try {
      await navigator.clipboard.writeText(clippedContent.content);
      toast.success('Copied');
    } catch {
      toast.error('Copy failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10 animate-slide-up flex flex-col items-center">
      <div className="w-full max-w-4xl text-center mb-10 md:mb-16">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-24 h-24 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-200">
          <Scissors size={48} className="text-white"/>
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 md:mb-6 tracking-tight">
          Web Clipper
        </h1>
        <p className="text-base md:text-xl text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
          Save articles, research papers, and inspiration from the web directly to your NoteFusion workspace.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 md:gap-12 w-full max-w-6xl">
        {/* Clip URL */}
        <div className="bg-white p-6 md:p-10 rounded-[32px] md:rounded-[48px] shadow-xl border border-slate-100 flex flex-col justify-center">
           <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-4 md:mb-6">Quick Clip URL</h2>

           <div className="flex flex-col gap-3 mb-4">
             <input 
               type="text" 
               placeholder="Paste URL here (https://...)" 
               value={url}
               onChange={(e) => setUrl(e.target.value)}
               className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
             />
             <input
               type="text"
               placeholder="Optional title (defaults to site hostname)"
               value={manualTitle}
               onChange={(e) => setManualTitle(e.target.value)}
               className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
             />
           </div>

           <div className="flex flex-col sm:flex-row gap-3 mb-6">
             <button 
               onClick={handleClipUrl}
               disabled={isClipping}
               className="flex-1 px-6 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all disabled:opacity-50"
             >
               {isClipping ? 'Clipping...' : 'Clip & Save'}
             </button>
             <button
               onClick={handlePasteClipboardUrl}
               className="px-6 py-4 bg-white border border-slate-200 rounded-2xl font-black text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
             >
               <ClipboardPaste size={18} /> Paste URL
             </button>
           </div>
           
           {clippedContent && (
             <div className="p-5 bg-slate-50 rounded-3xl border border-slate-200 animate-fade-in">
               <h3 className="font-black text-slate-800 mb-2">{clippedContent.title}</h3>
               <p className="text-xs text-slate-500 font-mono mb-4 truncate">{clippedContent.source}</p>
               <div className="flex flex-col sm:flex-row gap-3">
                 <button
                   onClick={() => clippedContent.noteId && navigate(`/notes/${clippedContent.noteId}`)}
                   disabled={!clippedContent.noteId}
                   className="flex-1 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                 >
                   <ExternalLink size={16} /> View Note
                 </button>
                 <button
                   onClick={handleCopyText}
                   className="flex-1 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
                 >
                   <Copy size={16} /> Copy Text
                 </button>
               </div>
             </div>
           )}
        </div>

        {/* Manual Paste */}
        <div className="bg-slate-900 p-6 md:p-10 rounded-[32px] md:rounded-[48px] shadow-2xl text-white relative overflow-hidden">
           <div className="relative z-10">
             <h2 className="text-2xl md:text-3xl font-black mb-4 md:mb-6">Paste & Save (Always Works)</h2>
             <p className="text-slate-300 font-medium mb-4 text-sm md:text-base">
               Some sites block clipping due to CORS. If “Clip URL” doesn’t fetch text, paste highlights or the article body here and save it as a Note.
             </p>

             <div className="space-y-3 mb-4">
               <input
                 type="text"
                 placeholder="Title for your clip"
                 value={manualTitle}
                 onChange={(e) => setManualTitle(e.target.value)}
                 className="w-full p-4 bg-slate-800 border border-slate-700 rounded-2xl font-bold text-white outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all"
               />
               <textarea
                 placeholder="Paste article text / highlights..."
                 value={manualContent}
                 onChange={(e) => setManualContent(e.target.value)}
                 className="w-full min-h-[180px] p-4 bg-slate-800 border border-slate-700 rounded-2xl font-medium text-white outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all resize-none"
               />
             </div>

             <button
               onClick={handleClipManual}
               disabled={isClipping}
               className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black hover:bg-slate-100 transition-all disabled:opacity-50"
             >
               Save Pasted Content
             </button>
           </div>
           
           {/* Decor */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600 rounded-full blur-[100px] opacity-30 -mr-20 -mt-20"></div>
           <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-600 rounded-full blur-[80px] opacity-30 -ml-10 -mb-10"></div>
        </div>
      </div>
    </div>
  );
};

export default WebClipper;
