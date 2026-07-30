import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, X, Clock, Tag, Bell, Calendar as CalendarIcon, Sparkles, Brain, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { API_URL } from '../config';
import { microsoftService } from '../services/microsoftService';

const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [events, setEvents] = useState<Record<string, Array<{id?: number, title: string, color: string, time?: string, date: string}>>>({});
  
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  React.useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/calendar`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      
      const grouped: Record<string, any[]> = {};
      data.forEach((ev: any) => {
        const d = new Date(ev.date).getDate().toString();
        if (!grouped[d]) grouped[d] = [];
        grouped[d].push(ev);
      });
      setEvents(grouped);
    } catch (err) {
      console.error('Failed to load events');
    }
  };

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
    setShowEventModal(true);
  };

  const addEvent = async (title: string, color: string, time: string) => {
    if (selectedDay) {
      const dateStr = `${currentDate.getFullYear()}-${(currentDate.getMonth()+1).toString().padStart(2,'0')}-${selectedDay.toString().padStart(2,'0')}`;
      
      try {
        const response = await fetch(`${API_BASE}/api/v1/calendar`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify({ title, color, time, date: dateStr })
        });
        if (!response.ok) throw new Error();
        toast.success('Event added to calendar!');
        setShowEventModal(false);
        fetchEvents(); // Refresh
      } catch (err) {
        toast.error('Failed to save event');
      }
    }
  };

  const renderDays = () => {
    const days = [];
    const totalDays = daysInMonth(currentDate.getMonth(), currentDate.getFullYear());
    const firstDay = firstDayOfMonth(currentDate.getMonth(), currentDate.getFullYear());
    const today = new Date();

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="min-h-[120px] p-2 border-r border-b border-slate-50 bg-slate-50/20"></div>);
    }

    for (let d = 1; d <= totalDays; d++) {
      const isToday = today.getDate() === d && today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear();
      const dayEvents = events[d.toString()] || [];
      
      days.push(
        <div 
          key={d} 
          onClick={() => handleDayClick(d)}
          className={`min-h-[140px] p-6 border-r border-b border-white/10 transition-all hover:bg-white/40 group cursor-pointer relative overflow-hidden ${isToday ? 'bg-blue-600 shadow-[inset_0_0_80px_rgba(255,255,255,0.1)]' : 'bg-white/5'}`}
        >
          <div className="flex justify-between items-start mb-6 relative z-10">
             <span className={`text-[10px] font-black ${isToday ? 'text-white' : 'text-slate-400 group-hover:text-slate-900'} uppercase tracking-widest`}>
                {d.toString().padStart(2, '0')}
             </span>
             {isToday && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>}
          </div>
          
          <div className="space-y-1.5 relative z-10">
             {dayEvents.map((event, idx) => (
                <div 
                  key={idx}
                  className={`text-[8px] font-black px-2.5 py-2 rounded-xl border-white/30 border-l-[3px] uppercase tracking-wider backdrop-blur-md shadow-sm group-hover:scale-[1.02] transition-transform ${
                    isToday ? 'bg-white/20 text-white' :
                    event.color === 'blue' ? 'text-blue-700 bg-blue-500/10 border-l-blue-600' :
                    event.color === 'purple' ? 'text-purple-700 bg-purple-500/10 border-l-purple-600' :
                    event.color === 'emerald' ? 'text-emerald-700 bg-emerald-500/10 border-l-emerald-600' :
                    event.color === 'amber' ? 'text-amber-700 bg-amber-500/10 border-l-amber-600' :
                    'text-slate-700 bg-slate-500/10 border-l-slate-600'
                  }`}
                >
                  {event.time && <span className="opacity-50 mr-2">{event.time}</span>} {event.title}
                </div>
             ))}
          </div>
          {!isToday && <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 transition-colors pointer-events-none"></div>}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 animate-slide-up">
       {/* Calendar Header */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
          <div className="flex items-center gap-6">
             <div className="w-16 h-16 bg-blue-600 rounded-[28px] flex items-center justify-center text-white shadow-2xl shadow-blue-500/20 ai-sparkle">
                <CalendarIcon size={32}/>
             </div>
             <div>
                <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight leading-none">
                   {monthNames[currentDate.getMonth()]} <span className="text-blue-600 font-black">{currentDate.getFullYear()}</span>
                </h1>
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Neural Academic Pulse • Predictive Schedule</p>
                </div>
             </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 glass p-2 rounded-2xl border-white/20 shadow-xl">
               <button onClick={prevMonth} className="w-10 h-10 flex items-center justify-center hover:bg-white/50 rounded-xl transition-all text-slate-400 hover:text-slate-900">
                  <ChevronLeft size={20}/>
               </button>
               <div className="w-px h-6 bg-slate-200/50"></div>
               <button onClick={() => setCurrentDate(new Date())} className="px-6 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-blue-600 transition-colors">Current</button>
               <div className="w-px h-6 bg-slate-200/50"></div>
               <button onClick={nextMonth} className="w-10 h-10 flex items-center justify-center hover:bg-white/50 rounded-xl transition-all text-slate-400 hover:text-slate-900">
                  <ChevronRight size={20}/>
               </button>
            </div>
            <button 
              onClick={() => {
                toast.promise(
                  microsoftService.syncCalendar(Object.values(events).flat()),
                  {
                    loading: 'Syncing with Outlook...',
                    success: 'Calendar synced with Microsoft 365!',
                    error: 'Failed to sync with Outlook',
                  }
                );
              }}
              className="px-6 py-4 bg-white border-2 border-slate-100 text-slate-600 rounded-[24px] font-black text-xs uppercase tracking-widest hover:border-blue-200 hover:text-blue-600 transition-all flex items-center gap-3"
              title="Sync with Microsoft Outlook"
            >
              <RefreshCw size={18}/>
              <span className="hidden lg:inline">Sync Outlook</span>
            </button>
            <button 
              onClick={() => { setSelectedDay(new Date().getDate()); setShowEventModal(true); }}
              className="px-8 py-4 bg-slate-900 text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-2xl shadow-slate-200 hover:bg-blue-600 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
            >
              <Plus size={18}/>
              Plan Node
            </button>
          </div>
       </div>

       {/* Grid Layout - Glassmorphism */}
       <div className="glass border-white/20 rounded-[56px] shadow-2xl shadow-slate-200/50 overflow-hidden relative border min-h-[800px] flex flex-col">
          {/* Week Headers */}
          <div className="grid grid-cols-7 border-b border-white/20 bg-white/40 backdrop-blur-md">
             {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                <div key={day} className="py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{day}</div>
             ))}
          </div>

          {/* Day Grid */}
          <div className="grid grid-cols-7 flex-1">
             {renderDays()}
          </div>

          {/* Visual Decors */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-[120px] pointer-events-none -mr-64 -mt-64"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-100/20 rounded-full blur-[120px] pointer-events-none -ml-64 -mb-64"></div>
       </div>

       {/* Event Modal */}
       {showEventModal && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 animate-fade-in">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowEventModal(false)}></div>
           <div className="relative bg-white rounded-[40px] p-10 max-w-lg w-full shadow-2xl animate-slide-up">
             <div className="flex justify-between items-center mb-8">
               <div>
                 <h3 className="text-2xl font-black text-slate-900">Create Event</h3>
                 <p className="text-sm text-slate-400 font-medium">
                   {monthNames[currentDate.getMonth()]} {selectedDay}, {currentDate.getFullYear()}
                 </p>
               </div>
               <button 
                 onClick={() => setShowEventModal(false)}
                 className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition-all"
               >
                 <X size={20} className="text-slate-400"/>
               </button>
             </div>

             <form onSubmit={(e) => {
               e.preventDefault();
               const formData = new FormData(e.currentTarget);
               addEvent(
                 formData.get('title') as string,
                 formData.get('color') as string,
                 formData.get('time') as string
               );
             }}>
               <div className="space-y-6">
                 <div>
                   <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 block">
                     Event Title
                   </label>
                   <input
                     name="title"
                     type="text"
                     required
                     placeholder="e.g., Study Session, Exam, Meeting..."
                     className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                   />
                 </div>

                 <div>
                   <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                     <Clock size={14}/>
                     Time
                   </label>
                   <input
                     name="time"
                     type="time"
                     className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                   />
                 </div>

                 <div>
                   <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                     <Tag size={14}/>
                     Color
                   </label>
                   <div className="grid grid-cols-5 gap-3">
                     {[
                       { name: 'Blue', value: 'blue', bg: 'bg-blue-500' },
                       { name: 'Purple', value: 'purple', bg: 'bg-purple-500' },
                       { name: 'Emerald', value: 'emerald', bg: 'bg-emerald-500' },
                       { name: 'Amber', value: 'amber', bg: 'bg-amber-500' },
                       { name: 'Rose', value: 'rose', bg: 'bg-rose-500' },
                     ].map((color) => (
                       <label key={color.value} className="cursor-pointer group">
                         <input type="radio" name="color" value={color.value} defaultChecked={color.value === 'blue'} className="sr-only peer" />
                         <div className={`w-full h-12 ${color.bg} rounded-2xl peer-checked:ring-4 peer-checked:ring-offset-2 peer-checked:ring-${color.value}-500 transition-all group-hover:scale-110`}></div>
                         <p className="text-[9px] font-black text-slate-400 uppercase text-center mt-2">{color.name}</p>
                       </label>
                     ))}
                   </div>
                 </div>

                 <div className="flex gap-3 pt-4">
                   <button
                     type="button"
                     onClick={() => setShowEventModal(false)}
                     className="flex-1 py-4 bg-slate-100 text-slate-700 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all"
                   >
                     Cancel
                   </button>
                   <button
                     type="submit"
                     className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-200 hover:scale-105 active:scale-95 transition-all"
                   >
                     Create Event
                   </button>
                 </div>
               </div>
             </form>
           </div>
         </div>
       )}

       {/* Legend */}
       <div className="mt-8 flex items-center justify-center gap-6 text-xs font-bold text-slate-500">
         <div className="flex items-center gap-2">
           <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
           <span>Study Sessions</span>
         </div>
         <div className="flex items-center gap-2">
           <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
           <span>AI Tasks</span>
         </div>
         <div className="flex items-center gap-2">
           <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
           <span>Exams</span>
         </div>
         <div className="flex items-center gap-2">
           <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
           <span>Reviews</span>
         </div>
       </div>
    </div>
  );
};

export default CalendarPage;
