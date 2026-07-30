import React, { useState } from 'react';

const NotesPage: React.FC = () => {
    const [search, setSearch] = useState('');
    
    const notes = [
        { id: '1', title: 'Neuroscience & Synaptic Plasticity', category: 'Biology', date: '2h ago', preview: 'The study of how neurons communicate and adapt over time...', color: 'bg-blue-500' },
        { id: '2', title: 'Calculus III: Triple Integrals', category: 'Mathematics', date: '5h ago', preview: 'Computing volume across complex 3D boundary surfaces...', color: 'bg-indigo-500' },
        { id: '3', title: 'The Feudal System in Europe', category: 'History', date: 'Yesterday', preview: 'A hierarchy of land ownership and military obligation...', color: 'bg-emerald-500' },
        { id: '4', title: 'Quantum Mechanics Intro', category: 'Physics', date: 'Oct 28', preview: 'Wave-particle duality and the observer effect on electron states...', color: 'bg-rose-500' },
    ];

    return (
        <div className="max-w-7xl mx-auto px-6 py-10 animate-slide-up">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
                <div>
                   <h1 className="text-4xl font-black text-slate-800 mb-2 tracking-tight">Knowledge Ledger</h1>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Archived Cognitive Synthesizations</p>
                </div>
                <div className="flex w-full md:w-auto gap-4">
                   <div className="relative flex-1 md:w-80">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                      <input 
                        type="text" 
                        placeholder="Search your library..." 
                        className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all shadow-sm"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                      />
                   </div>
                   <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-black hover:scale-105 active:scale-95 transition-all">New Entry</button>
                </div>
            </div>

            {/* Quick Filters */}
            <div className="flex gap-3 mb-12 overflow-x-auto pb-4 no-scrollbar">
               {['All Entries', 'Synthesis Logs', 'Audio Transcripts', 'Visual Mindmaps', 'Mathematics', 'Biology'].map((f, i) => (
                  <button key={f} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${i === 0 ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white border border-slate-50 text-slate-400 hover:bg-slate-50'}`}>
                     {f}
                  </button>
               ))}
            </div>

            {/* Template Gallery Section */}
            <div className="mb-16">
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8 px-2 flex items-center gap-3">
                  <span className="w-6 h-px bg-slate-200"></span>
                  Synthesis Blueprints
               </h3>
               <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {[
                     { name: 'Lecture Master', icon: '🎓', color: 'bg-blue-50' },
                     { name: 'Lab Report', icon: '🔬', color: 'bg-emerald-50' },
                     { name: 'Research Paper', icon: '📄', color: 'bg-purple-50' },
                     { name: 'Case Study', icon: '🏢', color: 'bg-amber-50' },
                     { name: 'Meeting Notes', icon: '🤝', color: 'bg-rose-50' },
                  ].map(t => (
                     <div key={t.name} className="p-6 bg-white border border-slate-50 rounded-[32px] hover:shadow-xl hover:shadow-slate-100 transition-all cursor-pointer text-center group">
                        <div className={`w-12 h-12 ${t.color} rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 group-hover:scale-110 transition-all`}>{t.icon}</div>
                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{t.name}</p>
                     </div>
                  ))}
               </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {notes.map((note) => (
                    <div key={note.id} className="group bg-white border border-slate-50 rounded-[40px] p-8 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 cursor-pointer flex flex-col h-[320px]">
                        <div className="flex justify-between items-start mb-6">
                           <span className={`px-3 py-1 rounded-lg ${note.color} text-white text-[9px] font-black uppercase tracking-widest`}>{note.category}</span>
                           <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{note.date}</span>
                        </div>
                        
                        <h3 className="text-xl font-black text-slate-800 mb-4 leading-tight group-hover:text-blue-600 transition-colors">{note.title}</h3>
                        <p className="text-sm font-medium text-slate-400 leading-relaxed line-clamp-4 flex-1">{note.preview}</p>
                        
                        <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center">
                           <div className="flex -space-x-2">
                              <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px]">🤖</div>
                              <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px]">📄</div>
                           </div>
                           <span className="text-[10px] font-black text-slate-900 group-hover:translate-x-1 transition-transform">Read Synthesis →</span>
                        </div>
                    </div>
                ))}

                {/* Create Card */}
                <div className="bg-slate-50 border-2 border-dashed border-slate-100 rounded-[40px] p-8 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-blue-200 transition-all h-[320px]">
                   <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl mb-6 shadow-sm group-hover:scale-110 transition-transform">＋</div>
                   <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-2">New Knowledge Entry</h4>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Store or synthesize new data</p>
                </div>
            </div>
        </div>
    );
};

export default NotesPage;
