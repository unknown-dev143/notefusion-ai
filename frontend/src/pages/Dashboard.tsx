import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainFeatures from '../components/MainFeatures';
import { Share2, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../features/auth/context/AuthContext';
import { useWebSocket } from '../contexts/WebSocketContext';
import { activitiesApi, StreakInfo } from '../api';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { isConnected } = useWebSocket();
  const { user } = useAuth();
  /* New Dashboard Features State */
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [activeInsight, setActiveInsight] = React.useState(0);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [streakInfo, setStreakInfo] = useState<StreakInfo | null>(null);
  const currentStreak = user?.streak_days || 0;
  const [focusVelocity, setFocusVelocity] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [dailyQuests, setDailyQuests] = useState<{text: string, xp: string, done: boolean}[]>([]);
  
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const currentDay = new Date().getDay();

  React.useEffect(() => {
    const initDashboard = async () => {
      try {
        // Log activity
        await activitiesApi.logActivity('viewed_dashboard');
        // Fetch streak
        const streak = await activitiesApi.getStreak();
        setStreakInfo(streak);
        // Fetch velocity
        const velocity = await activitiesApi.getVelocity();
        setFocusVelocity(velocity);
        // Fetch quests
        const quests = await activitiesApi.getQuests();
        setDailyQuests(quests);
      } catch (err) {
        console.error('Failed to initialize dashboard activities:', err);
      }
    };
    initDashboard();
  }, []);

  const insights = [
    { text: "Your retention on 'Calculus III' is at 92%. Ready for the Advanced Exam?", action: "Start Quiz", icon: "🧠", path: "/exam" },
    { text: "You have 12 notes without tags. Let AI organize them for you?", action: "Auto-Tag", icon: "🏷️", path: "/notes" },
    { text: "Historical Analysis notes are gaining complexity. Switch to Mind Map view?", action: "Open Map", icon: "🌀", path: "/graph" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 animate-slide-up">
      {/* Streak Modal - Premium Polish */}
      {showStreakModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fade-in" onClick={() => setShowStreakModal(false)}>
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"></div>
           <div className="bg-white rounded-[40px] p-10 max-w-md w-full shadow-2xl relative overflow-hidden animate-slide-up" onClick={e => e.stopPropagation()}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full -mr-24 -mt-24 blur-3xl"></div>
              
              <div className="text-center mb-10 relative z-10">
                 <div className="text-7xl mb-6 drop-shadow-2xl animate-float">🔥</div>
                 <h2 className="text-3xl font-black text-slate-900 tracking-tighter">{currentStreak} Day <span className="text-orange-500">Streak!</span></h2>
                 <p className="text-slate-400 font-medium text-sm mt-3 leading-relaxed">
                    You're on fire! Keep studying to earn the <span className="text-slate-900 font-bold tracking-widest text-[10px] uppercase">Scholar Supreme</span> badge.
                 </p>
              </div>

              <div className="grid grid-cols-7 gap-2 mb-10">
                 {days.map((d, i) => (
                    <div key={d} className="flex flex-col items-center gap-3">
                       <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{d[0]}</span>
                       <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black transition-all ${
                          i <= currentDay 
                          ? 'bg-orange-500 text-white shadow-xl shadow-orange-500/30 scale-100 rotate-6' 
                          : 'bg-slate-50 text-slate-200 border border-slate-100'
                       }`}>
                          {i <= currentDay ? '✓' : ''}
                       </div>
                    </div>
                 ))}
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100 flex items-center justify-between">
                 <div className="text-left">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bonus</p>
                    <p className="text-xl font-black text-slate-900">+1,200 XP</p>
                 </div>
                 <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm">💎</div>
              </div>

              <button 
                onClick={() => setShowStreakModal(false)} 
                className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-orange-600 hover:shadow-2xl hover:shadow-orange-200 transition-all active:scale-95"
              >
                 Maintain Neural Sync
              </button>
           </div>
        </div>
      )}

      {/* Hero Welcome - Enhanced with AI Insights */}
      <div className="flex flex-col xl:flex-row justify-between items-start gap-12 mb-16 animate-slide-up animate-stagger-2">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
             <div className="relative flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse shadow-[0_0_10px_rgba(37,99,235,0.5)]"></span>
                <span className="absolute w-4 h-4 rounded-full border border-blue-600 animate-[ping_2s_infinite] opacity-30"></span>
             </div>
             <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">Neural Core Online</span>
             <div className="h-px w-24 bg-gradient-to-r from-blue-600/20 to-transparent ml-2"></div>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[0.9] mb-4">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 animate-gradient">Scholar</span>
          </h1>
          <p className="text-slate-400 font-medium text-lg max-w-2xl">
            Your intelligence engine is primed. You have <span className="text-slate-900 font-bold">4 active projects</span> and <span className="text-blue-600 font-bold underline decoration-2 underline-offset-4 cursor-pointer">3 pending syntheses</span> waiting for review.
          </p>
        </div>

        {/* AI Smart Insight Panel */}
        <div className="w-full xl:w-[450px] glass rounded-[32px] p-8 relative overflow-hidden group border-blue-100 shadow-xl shadow-blue-500/5 ai-sparkle transition-all hover:scale-[1.02] neon-blue scanline">
           <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full -mr-12 -mt-12 blur-2xl"></div>
           <div className="flex items-center gap-2 mb-4">
              <span className="text-base">🚀</span>
              <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest">AI Next Step</h3>
           </div>
           
           <div className="min-h-[80px]">
              <p className="text-base font-bold text-slate-800 leading-snug mb-6">
                "{insights[activeInsight].text}"
              </p>
           </div>

           <div className="flex items-center justify-between gap-4">
              <button 
                onClick={() => navigate((insights[activeInsight] as any).path)}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
              >
                {insights[activeInsight].action}
              </button>
              <div className="flex gap-1">
                 {insights.map((_, i) => (
                    <button 
                       key={i} 
                       onClick={() => setActiveInsight(i)}
                       className={`w-2 h-2 rounded-full transition-all ${i === activeInsight ? 'bg-blue-600 w-4' : 'bg-slate-200 hover:bg-slate-300'}`}
                    />
                 ))}
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 animate-slide-up animate-stagger-1">
        {[
          { label: 'Scholar Level', value: `Level ${user?.level || 1}`, icon: '💎', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Total XP', value: (user?.xp || 0).toLocaleString(), icon: '📈', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Knowledge Streak', value: `${currentStreak} Days`, icon: '🔥', color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map((stat, i) => (
          <div 
            key={i} 
            onClick={() => {
               if (stat.label.includes('Streak')) setShowStreakModal(true);
               else navigate('/statistics');
            }}
            className={`bg-white border border-slate-100 rounded-[32px] p-6 flex items-center gap-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group cursor-pointer ${stat.label.includes('Streak') ? 'hover:border-orange-200' : 'hover:border-blue-200'}`}
          >
            <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center text-2xl group-hover:rotate-12 transition-transform`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900 leading-none">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Neural Web Clipper - New Feature */}
      <div className="mb-16 animate-slide-up animate-stagger-2">
         <div className="bg-white border border-slate-100 rounded-[40px] p-10 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-emerald-500/10 transition-colors"></div>
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
               <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
                        <Share2 size={20} />
                     </div>
                     <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Neural Research Clip</span>
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Instant Insight Engine</h2>
                  <p className="text-slate-400 font-medium text-sm max-w-xl">
                     Paste any academic URL or article link. Our intelligence engine will automatically synthesize it into your neural map with automated tagging and summaries.
                  </p>
               </div>
               <div className="w-full md:w-[450px]">
                  <div className="bg-slate-50 border border-slate-100 p-2 rounded-2xl flex items-center gap-3 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                     <input 
                        type="text" 
                        placeholder="https://scholar.google.com/..." 
                        className="flex-1 bg-transparent px-4 py-3 outline-none text-sm font-bold text-slate-800 placeholder:text-slate-300"
                        onKeyDown={async (e) => {
                           if (e.key === 'Enter') {
                              const url = (e.target as HTMLInputElement).value;
                              if (!url) return;
                              const t = toast.loading('Synthesizing research...');
                              try {
                                 const token = localStorage.getItem('token');
                                 const apiUrl = (window as any)._env_?.REACT_APP_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:8000';
                                 const res = await fetch(`${apiUrl}/api/v1/ai/clip`, {
                                    method: 'POST',
                                    headers: {
                                       'Content-Type': 'application/json',
                                       ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                                    },
                                    body: JSON.stringify({ url })
                                 });
                                 const data = await res.json();
                                 if (data.status === 'success') {
                                    toast.dismiss(t);
                                    toast.success('Note synthesized: ' + data.title);
                                    navigate(`/notes/${data.note_id}`);
                                 } else {
                                    throw new Error(data.error);
                                 }
                              } catch (err) {
                                 toast.dismiss(t);
                                 toast.error('Synthesis failed. Check URL access.');
                              }
                           }
                        }}
                     />
                     <div className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest">
                        CLIP
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Main Interface */}
        <div className="lg:col-span-2 space-y-12 animate-slide-up animate-stagger-3">
          {/* Quick Launch Cards */}
          <div>
            <div className="flex items-center justify-between mb-8 px-2">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                <span className="w-6 h-px bg-slate-200"></span>
                Intelligence Command
              </h3>
              <div className="flex items-center gap-2">
                 <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`}></span>
                 <span className="text-[10px] font-bold text-slate-400 uppercase">{isConnected ? 'Neural Sync Active' : 'Neural Sync Pending'}</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { name: 'Slide Maker', desc: 'Auto-generate presentations', path: '/slide-maker', icon: '📽️', color: 'from-blue-600 to-indigo-700' },
                { name: 'Kaggle Nexus', desc: 'Import datasets & models', path: '/kaggle', icon: '📊', color: 'from-emerald-500 to-teal-600' },
                { name: 'Fusion Lab', desc: 'Synthesize neural datasets', path: '/fusion-lab', icon: '🔥', color: 'from-orange-500 to-rose-600' },
                { name: 'Whiteboard', desc: 'Infinite canvas for creative nodes', path: '/whiteboard', icon: '🖊️', color: 'from-purple-600 to-pink-600' },
                { name: 'Graph View', desc: 'Neural knowledge visualization', path: '/graph', icon: '💎', color: 'from-indigo-600 to-purple-700' },
                { name: 'Testing Hub', desc: 'Active recall & cognitive tests', path: '/testing', icon: '🎯', color: 'from-slate-700 to-slate-900' },
              ].map((tool) => (
                <Link key={tool.name} to={tool.path} className={`group relative p-8 rounded-[40px] bg-gradient-to-br ${tool.color} text-white shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02] overflow-hidden min-h-[160px] flex flex-col justify-between card-hover`}>
                   <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform"></div>
                   <div className="text-3xl mb-4 group-hover:rotate-12 transition-transform">{tool.icon}</div>
                   <div>
                      <h4 className="text-xl font-black mb-1">{tool.name}</h4>
                      <p className="text-xs font-medium text-white/70 leading-relaxed max-w-[200px]">{tool.desc}</p>
                   </div>
                   <div className="absolute bottom-6 right-6 w-10 h-10 bg-white/10 rounded-xl backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 border border-white/20">
                      →
                   </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Activity Ledger */}
          <div className="bg-white border border-slate-100 rounded-[48px] p-10 shadow-sm relative overflow-hidden animate-slide-up animate-stagger-4 group/ledger">
             <div className="flex justify-between items-center mb-10">
                <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none px-2 flex items-center gap-3">
                   Knowledge Sync Ledger 
                   <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-1 rounded-full animate-pulse">LIVE</span>
                </h3>
                <button 
                  onClick={() => navigate('/notifications')}
                  className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline px-4 py-2 bg-blue-50 rounded-xl"
                >
                  View All Logs
                </button>
             </div>
             <div className="space-y-2">
                {[
                  { title: 'Neuroscience Synthesis', type: 'AI Synthesis', time: '2 mins ago', status: 'Completed', icon: '🧠' },
                  { title: 'Calculus III Whiteboard', type: 'Collaboration', time: '1h ago', status: 'In Progress', icon: '🎨' },
                  { title: 'Historical Analysis', type: 'Note Group', time: '3h ago', status: 'Updated', icon: '📝' },
                ].map((act, i) => (
                   <div 
                      key={act.title} 
                      onClick={() => navigate('/notifications')}
                      className="group flex items-center justify-between p-6 hover:bg-slate-50/80 rounded-[32px] transition-all cursor-pointer border border-transparent hover:border-slate-100"
                    >
                    <div className="flex items-center gap-5">
                       <div className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center shadow-sm text-xl group-hover:scale-110 group-hover:rotate-6 transition-transform">
                         {act.icon}
                       </div>
                       <div>
                          <h5 className="font-black text-slate-800 tracking-tight">{act.title}</h5>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{act.type}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-sm font-bold text-slate-900 mb-1">{act.status}</p>
                       <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{act.time}</p>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

         {/* Sidebar Info */}
         <div className="space-y-8 animate-slide-up animate-stagger-5">
            
            {/* Velocity Visualizer (New) */}
            <div className="bg-white border border-slate-100 rounded-[40px] p-8 shadow-sm">
               <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-6 px-2">Focus Velocity</h3>
               <div className="flex items-end justify-between gap-1 h-32 mb-6 px-2">
                  {focusVelocity.map((v, i) => (
                     <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <div 
                           className={`w-full rounded-t-lg transition-all duration-1000 ${i === 6 ? 'bg-blue-600 shadow-lg shadow-blue-200' : 'bg-slate-100'}`} 
                           style={{ height: `${v}%` }}
                        ></div>
                        <span className="text-[8px] font-black text-slate-300 uppercase">{days[(currentDay - (6 - i) + 7) % 7][0]}</span>
                     </div>
                  ))}
               </div>
               <div className="flex justify-between items-center text-[10px] font-black text-slate-900 px-2">
                  <span>VELOCITY</span>
                  <span className="text-blue-600">{focusVelocity[6]}%</span>
               </div>
            </div>

            {/* Daily Quests Widget */}
            <div className="bg-slate-900 rounded-[40px] p-8 shadow-2xl shadow-slate-200 transform hover:-translate-y-1 transition-all relative overflow-hidden group scanline">
               <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full -mb-16 -mr-16 blur-2xl"></div>
               <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-500 mb-6 px-2 flex items-center gap-2">
                  ⚡ DAILY OBJECTIVES
               </h3>
               <div className="space-y-4 relative z-10">
                  {dailyQuests.map((q, i) => (
                     <div key={i} className={`flex items-center justify-between p-4 rounded-2xl transition-all ${q.done ? 'bg-white/5 opacity-40' : 'bg-white/10 border border-white/5 hover:bg-white/15'}`}>
                        <div className="flex items-center gap-3">
                           <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${q.done ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-700'}`}>{q.done && '✓'}</div>
                           <span className={`text-xs font-bold ${q.done ? 'text-slate-400 line-through' : 'text-white'}`}>{q.text}</span>
                        </div>
                        <span className="text-[9px] font-black bg-blue-600 text-white px-2 py-1 rounded-lg">{q.xp}</span>
                     </div>
                  ))}
               </div>
            </div>

            {/* Progress Tracker Card */}
            <div className="bg-white border border-slate-100 rounded-[48px] p-10 shadow-sm relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600 rounded-full -mr-24 -mt-24 blur-3xl opacity-5 group-hover:scale-125 transition-transform duration-700"></div>
               
               <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-10 px-2">Knowledge Density</h3>
               
               <div className="flex justify-center mb-12">
                  <div className="relative w-48 h-48 flex items-center justify-center">
                     <svg className="w-full h-full transform -rotate-90">
                        <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-slate-50" />
                        <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray={552} strokeDashoffset={552 - (552 * 0.85)} className="text-blue-600 transition-all duration-1000 ease-out" strokeLinecap="round" />
                     </svg>
                     <div className="absolute text-center">
                        <span className="text-5xl font-black block leading-none text-slate-900">85<span className="text-xl text-blue-600">%</span></span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Optimal</span>
                     </div>
                  </div>
               </div>

               <div className="space-y-4 px-2">
                  <div className="flex justify-between items-center text-xs font-bold">
                     <span className="text-slate-400 uppercase tracking-widest text-[9px]">Monthly Synthesis</span>
                     <span className="text-slate-900">1.2k / 1.5k</span>
                  </div>
                  <div className="h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                     <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 w-[85%] rounded-full"></div>
                  </div>
               </div>

                <button 
                  onClick={() => navigate('/statistics')}
                  className="w-full mt-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:shadow-xl hover:shadow-slate-200 transition-all"
                >
                  Review Depth
                </button>
            </div>
         </div>
      </div>

    </div>
  );
};

export default Dashboard;
