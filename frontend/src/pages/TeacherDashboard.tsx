import React from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, AlertTriangle, TrendingUp, Search } from 'lucide-react';
import { useAuth } from '../features/auth/context/AuthContext';

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();

  // Mock data for the dashboard
  const stats = [
    { label: "Active Students", value: "142", icon: <Users size={24} className="text-blue-500"/> },
    { label: "Assignments Graded", value: "89%", icon: <BookOpen size={24} className="text-emerald-500"/> },
    { label: "Class Average", value: "B+", icon: <TrendingUp size={24} className="text-purple-500"/> },
    { label: "Students at Risk", value: "3", icon: <AlertTriangle size={24} className="text-rose-500"/> },
  ];

  const students = [
    { name: "Alex Johnson", status: "Excelling", score: 94 },
    { name: "Sarah Williams", status: "On Track", score: 82 },
    { name: "Michael Chen", status: "Struggling (Calculus)", score: 61 },
    { name: "Emma Davis", status: "On Track", score: 78 },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 animate-fade-in">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Teacher Console</h1>
          <p className="text-slate-500 mt-2 font-medium">Welcome back, Professor {user?.name || 'Teacher'}. Here's your class overview.</p>
        </div>
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search students..." 
            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i} 
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <p className="text-slate-500 font-bold uppercase tracking-wider text-xs">{stat.label}</p>
              <div className="p-2 bg-slate-50 rounded-xl">{stat.icon}</div>
            </div>
            <h2 className="text-3xl font-black text-slate-900">{stat.value}</h2>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Users size={20} className="text-blue-500" /> Student Progress Watchlist
          </h3>
          <div className="space-y-4">
            {students.map((student, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{student.name}</h4>
                    <p className={`text-xs font-bold uppercase tracking-wider ${
                      student.status.includes('Struggling') ? 'text-rose-500' : 
                      student.status.includes('Excelling') ? 'text-emerald-500' : 'text-slate-500'
                    }`}>{student.status}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-slate-900">{student.score}%</div>
                  <div className="w-24 h-2 bg-slate-200 rounded-full mt-1 overflow-hidden">
                    <div 
                      className={`h-full ${student.score > 90 ? 'bg-emerald-500' : student.score < 70 ? 'bg-rose-500' : 'bg-blue-500'}`} 
                      style={{ width: `${student.score}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-xl">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <AlertTriangle size={20} className="text-amber-400" /> AI Insights
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-white/10 rounded-2xl border border-white/5 backdrop-blur-md">
              <h4 className="font-bold text-amber-300 text-sm mb-1">Concept Gap Detected</h4>
              <p className="text-slate-300 text-sm leading-relaxed">
                42% of your students missed the flashcards on "Limits and Continuity" this week. Consider reviewing this in your next lecture.
              </p>
              <button className="mt-3 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all w-full">
                Generate Review Quiz
              </button>
            </div>
            
            <div className="p-4 bg-white/10 rounded-2xl border border-white/5 backdrop-blur-md">
              <h4 className="font-bold text-emerald-400 text-sm mb-1">Engagement Spike</h4>
              <p className="text-slate-300 text-sm leading-relaxed">
                The visual mind-maps you uploaded resulted in a 60% higher retention rate compared to standard notes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
