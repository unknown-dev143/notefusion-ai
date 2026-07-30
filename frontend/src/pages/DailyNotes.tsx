import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Search, 
  Sparkles, 
  Brain, 
  Target, 
  Lock, 
  Layout, 
  Layers, 
  Clock, 
  Zap,
  CheckCircle2,
  Calendar as LucideCalendar
} from 'lucide-react';
import { useNotes } from '../features/notes/context/NoteContext';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const DailyNotes: React.FC = () => {
  const { notes, createNote } = useNotes();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<'journal' | 'briefing' | 'synthesis'>('journal');
  const [briefing, setBriefing] = useState<any>(null);
  const [synthesis, setSynthesis] = useState<any>(null);
  const [statsData, setStatsData] = useState<any>(null);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchStats();
    fetchBriefing();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/stats`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      });
      const data = await response.json();
      setStatsData(data);
    } catch (err) {}
  };

  const fetchBriefing = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/ai/daily-briefing`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      });
      const data = await response.json();
      setBriefing(data);
    } catch (err) {}
  };

  const fetchSynthesis = async (content: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/ai/daily-synthesis`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}` 
        },
        body: JSON.stringify({ content })
      });
      const data = await response.json();
      setSynthesis(data);
    } catch (err) {}
  };

  useEffect(() => {
    const note = getTodayNote();
    if (activeTab === 'synthesis' && note && !synthesis) {
      fetchSynthesis(note.content);
    }
  }, [activeTab]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getDailyNoteTitle = (date: Date) => {
    return `Daily Note - ${date.toISOString().split('T')[0]}`;
  };

  const getTodayNote = () => {
    const title = getDailyNoteTitle(currentDate);
    return notes.find(note => note.title === title);
  };

  const createDailyNote = async () => {
    setIsSyncing(true);
    const title = getDailyNoteTitle(currentDate);
    const content = `# ${formatDate(currentDate)}

## Morning Reflection

### Today's Goals
- [ ] Implement Neural Sync Core
- [ ] Review Cognitive Science Synthesis
- [ ] Deep Work: 2 x 90min blocks

### Gratitude
I'm grateful for:
1. The capacity for deep focus.
2. The emerging clarity in complex research datasets.
3. The collaborative potential of neural systems.

## Daily Log

### 🌅 Morning
Focused on structural logic and foundational principles.

### 🌞 Afternoon
Synthesis phase for cognitive mapping and relational data.

### 🌙 Evening
Review of milestones and preparation for tomorrow's exploration.

## Quick Captures
- Observation: Synaptic pathways are highly dependent on recursive learning logic.

## Tomorrow's Preview
- [ ] Finalize Archival Logic
- [ ] Expand Synthesis Blueprints

---
*Created via Neural Protocol V4: ${new Date().toLocaleTimeString()}*`;

    try {
      await createNote({
        title,
        content,
        tags: ['daily', 'journal', currentDate.toISOString().split('T')[0]],
        isPinned: false,
        isArchived: false,
        color: '#f0f9ff'
      } as any);
      
      toast.success('Neural Daily Note Synchronized!', { icon: '🧠' });
    } catch (error) {
      toast.error('Neural pathway obstructed. Creation failed.');
    } finally {
      setIsSyncing(false);
    }
  };

  const goToPreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const existingNote = getTodayNote();
  const isToday = currentDate.toDateString() === new Date().toDateString();

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 animate-slide-up bg-slate-50/30 min-h-screen">
      <div className="grid lg:grid-cols-12 gap-10">
        
        {/* Sidebar: Calendar & Stats */}
        <div className="lg:col-span-4 space-y-8 h-fit lg:sticky lg:top-24">
           {/* Calendar Card */}
           <div className="bg-white border border-slate-100 rounded-[40px] p-8 shadow-xl shadow-slate-200/50">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <CalendarIcon className="text-blue-600" size={24}/>
                    Neural Calendar
                 </h3>
                 <button 
                   onClick={() => setCurrentDate(new Date())}
                   className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                 >
                   Today
                 </button>
              </div>
              
              <div className="grid grid-cols-7 gap-2 mb-8">
                 {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                   <div key={d} className="text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">{d}</div>
                 ))}
                 {[...Array(30)].map((_, i) => {
                    const d = i + 1;
                    const isSelected = currentDate.getDate() === d;
                    return (
                      <button 
                        key={i}
                        onClick={() => {
                          const newD = new Date(currentDate);
                          newD.setDate(d);
                          setCurrentDate(newD);
                        }}
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black transition-all ${isSelected ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 scale-110' : 'text-slate-500 hover:bg-slate-50'}`}
                      >
                        {d}
                      </button>
                    );
                 })}
              </div>

              <div className="space-y-4">
                 <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Month Progress</span>
                    <span className="text-sm font-black text-slate-900">82%</span>
                 </div>
                 <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 w-[82%] rounded-full"></div>
                 </div>
              </div>
           </div>

           {/* Stats Cards */}
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-lg shadow-slate-200/50">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Weekly Streak</p>
                 <p className="text-3xl font-black text-orange-600">{statsData?.streak || 0} <span className="text-sm font-black text-slate-300">Days</span></p>
              </div>
              <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-lg shadow-slate-200/50">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Logs</p>
                 <p className="text-3xl font-black text-blue-600">{statsData?.daily_note_count || 0}</p>
              </div>
           </div>

           <div className="bg-slate-900 rounded-[40px] p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              <div className="flex items-center gap-3 mb-6 relative z-10">
                 <Sparkles className="text-blue-400" size={20}/>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Neural Pro Tip</span>
              </div>
              <p className="text-sm font-medium text-slate-300 leading-relaxed relative z-10">
                 Synthesize your evening reflection into a <strong>Study Blueprint</strong> to accelerated long-term retention via the examiner node.
              </p>
           </div>
        </div>

        {/* Main Content: The Journal */}
        <div className="lg:col-span-8">
           {/* Date Header */}
           <div className="bg-white border border-slate-100 rounded-[48px] p-10 mb-8 shadow-xl shadow-slate-200/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                 <div>
                    <div className="flex items-center gap-4 mb-3">
                       <button onClick={goToPreviousDay} className="p-2 hover:bg-slate-50 rounded-xl transition-all"><ChevronLeft className="text-slate-400" size={24}/></button>
                       <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
                          {formatDate(currentDate)}
                       </h2>
                       <button onClick={goToNextDay} className="p-2 hover:bg-slate-50 rounded-xl transition-all disabled:opacity-30" disabled={isToday}><ChevronRight className="text-slate-400" size={24}/></button>
                    </div>
                    {isToday && (
                       <div className="flex items-center gap-3">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Live Sync Active</span>
                       </div>
                    )}
                 </div>

                 <div className="flex gap-3">
                    <button className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-600 transition-all border border-slate-100">
                       <Search size={20}/>
                    </button>
                    <button className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-600 transition-all border border-slate-100">
                       <Layers size={20}/>
                    </button>
                    {!existingNote && (
                       <button 
                         onClick={createDailyNote}
                         disabled={isSyncing}
                         className="px-8 py-4 bg-blue-600 text-white rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-200 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3"
                       >
                          {isSyncing ? 'Establishing Link...' : <Plus size={18}/>}
                          {isSyncing ? 'Syncing...' : 'Initiate Log'}
                       </button>
                    )}
                 </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-8 mt-12 border-t border-slate-100 pt-8">
                 {[
                   { id: 'journal', label: 'Cognitive Journal', icon: <Brain size={16}/> },
                   { id: 'briefing', label: 'Neural Briefing', icon: <Sparkles size={16}/> },
                   { id: 'synthesis', label: 'EOD Synthesis', icon: <Zap size={16}/> },
                 ].map(tab => (
                   <button 
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id as any)}
                     className={`flex items-center gap-3 pb-4 relative transition-all ${activeTab === tab.id ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                   >
                      {tab.icon}
                      <span className="text-xs font-black uppercase tracking-widest">{tab.label}</span>
                      {activeTab === tab.id && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full" />}
                   </button>
                 ))}
              </div>
           </div>

           {/* Dynamic Content Area */}
           <AnimatePresence mode="wait">
              {activeTab === 'journal' && (
                 <motion.div 
                   key="journal"
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -20 }}
                   className="space-y-8"
                 >
                    {existingNote ? (
                       <div className="bg-white border border-slate-100 rounded-[64px] p-12 md:p-16 shadow-2xl shadow-slate-200/50">
                          <div className="flex items-center gap-3 mb-12">
                             <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                                <CheckCircle2 size={24}/>
                             </div>
                             <div>
                                <h4 className="text-sm font-black text-slate-900 uppercase">Synchronized Content</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Protocol V4 Active</p>
                             </div>
                          </div>

                          <div className="prose prose-slate prose-lg max-w-none prose-headings:font-black prose-headings:tracking-tighter prose-p:font-medium prose-p:text-slate-600 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:py-1 prose-blockquote:rounded-r-xl">
                             <div className="whitespace-pre-wrap font-sans leading-relaxed">
                                {existingNote.content}
                             </div>
                          </div>

                          <div className="mt-16 flex flex-wrap gap-4 pt-12 border-t border-slate-100">
                             <button 
                               onClick={() => window.location.href = `/notes/${existingNote.id}`}
                               className="px-10 py-5 bg-slate-900 text-white rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-blue-600 hover:shadow-2xl hover:shadow-blue-200 transition-all flex items-center gap-3"
                             >
                                <Layout size={18}/> Full Editor Protocol
                             </button>
                             <button className="px-10 py-5 bg-slate-50 text-slate-400 rounded-[24px] font-black text-xs uppercase tracking-widest border border-slate-100 hover:bg-white hover:text-slate-900 transition-all flex items-center gap-3">
                                <Lock size={18}/> Protect Node
                             </button>
                          </div>
                       </div>
                    ) : (
                       <div className="bg-white border border-slate-100 rounded-[64px] p-24 text-center shadow-xl shadow-slate-200/50">
                          <div className="w-32 h-32 bg-slate-50 rounded-[40px] flex items-center justify-center mx-auto mb-10 group-hover:scale-110 transition-transform">
                             <Plus size={48} className="text-slate-200"/>
                          </div>
                          <h3 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter italic">Void Node Detected</h3>
                          <p className="text-slate-400 font-medium text-lg max-w-md mx-auto mb-12 leading-relaxed">
                             No cognitive sync exists for this chronology. Initiate a daily protocol to capture your neural state.
                          </p>
                          <button 
                            onClick={createDailyNote}
                            className="px-16 py-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-[32px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-300 hover:scale-105 active:scale-95 transition-all"
                          >
                             Initiate Neural Sync
                          </button>
                       </div>
                    )}
                 </motion.div>
              )}

              {activeTab === 'briefing' && (
                 <motion.div 
                   key="briefing"
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -20 }}
                   className="space-y-8"
                 >
                    <div className="bg-white border border-slate-100 rounded-[64px] p-16 shadow-2xl shadow-slate-200/50">
                       <div className="flex items-center gap-3 mb-12">
                          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-lg shadow-blue-100">
                             <Sparkles size={28}/>
                          </div>
                          <h3 className="text-3xl font-black text-slate-900 tracking-tight">AI Morning Briefing</h3>
                                            <div className="space-y-8">
                          <div className="p-8 bg-blue-50/50 rounded-[40px] border border-blue-100/50">
                             <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4">Focus Core</p>
                             <p className="text-xl font-bold text-slate-800 leading-snug">
                                {briefing?.focus || "Analyzing your neural landscape... Connect more data for a deeper briefing."}
                             </p>
                          </div>
 
                          <div className="grid md:grid-cols-2 gap-6">
                             <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100">
                                <h4 className="text-xs font-black text-slate-400 uppercase mb-6 tracking-widest flex items-center gap-2">
                                   <Clock size={14}/> Timeline Overview
                                </h4>
                                <ul className="space-y-4 text-sm font-bold text-slate-700">
                                   {briefing?.timeline?.map((item: string, idx: number) => (
                                      <li key={idx} className="flex items-center gap-4"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> {item}</li>
                                   )) || <li className="text-slate-400">No events scheduled</li>}
                                </ul>
                             </div>
                             <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100">
                                <h4 className="text-xs font-black text-slate-400 uppercase mb-6 tracking-widest flex items-center gap-2">
                                   <Target size={14}/> Key Objectives
                                </h4>
                                <ul className="space-y-4 text-sm font-bold text-slate-700">
                                   {briefing?.objectives?.map((obj: string, idx: number) => (
                                      <li key={idx} className="flex items-center gap-3">🎯 {obj}</li>
                                   )) || <li className="text-slate-400">Define your goals for today</li>}
                                </ul>
                             </div>
                          </div>
                       </div>
             </div>
                    </div>
                 </motion.div>
              )}

              {activeTab === 'synthesis' && (
                 <motion.div 
                   key="synthesis"
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -20 }}
                   className="space-y-8"
                 >
                    <div className="bg-slate-900 border border-slate-800 rounded-[64px] p-16 shadow-2xl relative overflow-hidden">
                       <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-purple-600/5 pointer-events-none"></div>
                       
                       <div className="flex items-center gap-3 mb-12 relative z-10">
                          <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/20">
                             <Zap size={28}/>
                          </div>
                          <h3 className="text-3xl font-black text-white tracking-tight">End-of-Day Synthesis</h3>
                       </div>

                       <div className="grid md:grid-cols-3 gap-8 mb-12 relative z-10">
                          <div className="p-8 bg-white/5 rounded-[40px] border border-white/5 backdrop-blur-3xl text-center">
                             <p className="text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">Knowledge Density</p>
                             <p className="text-4xl font-black text-white">{synthesis?.density || 0}<span className="text-blue-500">%</span></p>
                          </div>
                          <div className="p-8 bg-white/5 rounded-[40px] border border-white/5 backdrop-blur-3xl text-center">
                             <p className="text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">Focus Level</p>
                             <p className="text-4xl font-black text-white">{synthesis?.focus_level || "..."}</p>
                          </div>
                          <div className="p-8 bg-white/5 rounded-[40px] border border-white/5 backdrop-blur-3xl text-center">
                             <p className="text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">New Connections</p>
                             <p className="text-4xl font-black text-white">{synthesis?.connections || 0}</p>
                          </div>
                       </div>

                       <div className="p-10 bg-white/5 rounded-[40px] border border-white/5 relative z-10">
                          <h4 className="text-xs font-black text-blue-400 uppercase mb-6 tracking-widest flex items-center gap-2">
                             <Brain size={16}/> AI Cognitive Review
                          </h4>
                          <p className="text-base text-slate-300 font-medium leading-relaxed italic border-l-2 border-blue-500 pl-8 overflow-hidden">
                             {synthesis?.review || "Complete your daily note to generate a synthesis of your learning progress."}
                          </p>
                       </div>
                    </div>
                 </motion.div>
              )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default DailyNotes;
