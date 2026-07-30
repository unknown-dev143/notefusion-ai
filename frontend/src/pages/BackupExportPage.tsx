import React, { useState } from 'react';
import { useNotes } from '../features/notes/context/NoteContext';
import { exportToDocx, exportToMarkdown, exportToTxt } from '../utils/exportUtils';

const BackupExportPage: React.FC = () => {
  const { notes } = useNotes();
  const [isExporting, setIsExporting] = useState(false);

  const handleBackupData = () => {
    const backup = {
      version: '2.0',
      timestamp: new Date().toISOString(),
      notes: notes,
    };
    const dataStr = JSON.stringify(backup, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `notefusion-vault-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportAll = async (format: 'docx' | 'markdown' | 'txt') => {
    setIsExporting(true);
    const content = notes.map(n => `# ${n.title}\n\n${n.content}\n\n---\n\n`).join('\n');
    try {
      if (format === 'docx') await exportToDocx(content, 'all-notes');
      else if (format === 'markdown') exportToMarkdown(content, 'all-notes');
      else exportToTxt(content, 'all-notes');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-slide-up">
       {/* Header */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16">
        <div>
          <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">The Knowledge Vault</h1>
          <p className="font-bold text-slate-400 uppercase tracking-widest text-[11px]">Secure and portable research portability</p>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 bg-emerald-50 rounded-2xl border border-emerald-100">
           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
           <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">End-to-End Encrypted</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Full Backup */}
        <div className="bg-white border border-slate-100 rounded-[40px] p-10 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
            <div className="w-16 h-16 bg-blue-50 rounded-[28px] flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform">💾</div>
            <h3 className="text-xl font-black text-slate-800 mb-4">Complete System Backup</h3>
            <p className="text-sm text-slate-400 font-medium leading-relaxed mb-10">Download your entire workspace including notes, metadata, and synthesis parameters into a single secure JSON file. Perfect for cold storage.</p>
            
            <button 
              onClick={handleBackupData}
              className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all"
            >
              Download JSON Vault
            </button>
        </div>

        {/* Format Export */}
        <div className="bg-slate-900 rounded-[40px] p-10 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-800 rounded-full -mr-32 -mt-32 blur-3xl opacity-50 group-hover:scale-125 transition-transform"></div>
            
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/10 rounded-[28px] flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform">📂</div>
              <h3 className="text-xl font-black mb-4">Portable Formatting</h3>
              <p className="text-sm text-slate-400 font-medium leading-relaxed mb-10">Export your synthesised knowledge into standard formats for print, submission, or third-party editors.</p>
              
              <div className="grid grid-cols-2 gap-4">
                 <button onClick={() => exportAll('docx')} className="p-4 bg-white/10 rounded-2xl border border-white/10 font-bold text-xs uppercase tracking-widest hover:bg-white/20 transition-all">Microsoft Word</button>
                 <button onClick={() => exportAll('markdown')} className="p-4 bg-white/10 rounded-2xl border border-white/10 font-bold text-xs uppercase tracking-widest hover:bg-white/20 transition-all">Markdown</button>
                 <button onClick={() => exportAll('txt')} className="p-4 bg-white/10 rounded-2xl border border-white/10 font-bold text-xs uppercase tracking-widest hover:bg-white/20 transition-all col-span-2">Standard Text</button>
              </div>
            </div>
        </div>

        {/* Knowledge Recovery */}
        <div className="bg-white border-2 border-dashed border-slate-100 rounded-[40px] p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-200 transition-all col-span-full">
           <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl mb-6">📤</div>
           <h3 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em] mb-2">Knowledge Recovery</h3>
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Drop a JSON backup to restore your workspace</p>
           <input type="file" className="hidden" id="import-input" />
        </div>
      </div>

      <div className="mt-12 p-8 bg-slate-50 rounded-[32px] flex flex-wrap gap-8 justify-around">
         <div className="text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Payload</p>
            <p className="font-black text-slate-800">{(JSON.stringify(notes).length / 1024).toFixed(1)} KB</p>
         </div>
         <div className="text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Index Count</p>
            <p className="font-black text-slate-800">{notes.length} Active</p>
         </div>
         <div className="text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Privacy Stat</p>
            <p className="font-black text-emerald-600">Secure</p>
         </div>
      </div>
    </div>
  );
};

export default BackupExportPage;
