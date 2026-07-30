import React, { useState, useEffect } from 'react';
import NeuralLoader from '../components/NeuralLoader';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

const StatisticsPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/v1/stats`, {
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });
        const data = await response.json();
        // Artificial delay for neural sync effect
        await new Promise(resolve => setTimeout(resolve, 1500));
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="bg-white min-h-screen">
        <NeuralLoader />
      </div>
    );
  }

  const lineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        fill: true,
        label: 'Knowledge Growth',
        data: stats.growth_velocity || [120, 190, 300, 500, 480, 600, 750],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#3b82f6',
        pointBorderWidth: 2,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        titleFont: { family: 'Plus Jakarta Sans', weight: 'bold' as const },
        bodyFont: { family: 'Plus Jakarta Sans' },
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { weight: 'bold' as const, size: 10 } } },
      y: { grid: { color: '#f1f5f9' }, ticks: { font: { weight: 'bold' as const, size: 10 } } },
    },
  };

  const doughnutData = {
    labels: ['Engineering', 'Design', 'Science', 'Math'],
    datasets: [
      {
        data: [45, 25, 20, 10],
        backgroundColor: ['#6366f1', '#ec4899', '#10b981', '#f59e0b'],
        borderWidth: 0,
        hoverOffset: 10,
      },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight leading-none">Cognitive Analytics</h1>
          <p className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Neural-network based performance tracking</p>
        </div>
        <div className="flex gap-4">
           <div className="px-6 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm text-xs font-black uppercase text-slate-500 tracking-widest cursor-pointer hover:bg-slate-50 transition-all">Export PDF</div>
           <div className="px-6 py-3 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-200 text-xs font-black uppercase tracking-widest cursor-pointer hover:scale-105 active:scale-95 transition-all">Real-time Sync</div>
        </div>
      </div>

      {/* Hero Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
         {[
           { label: 'Total Pages', value: stats.note_count || '4,850', trend: '+12%', icon: '📄' },
           { label: 'Deep Work', value: (stats.note_count * 2) + 'h', trend: '+5h', icon: '⚡' },
           { label: 'Synthesis', value: stats.efficiency.retention + '%', trend: 'Peak', icon: '🧠' },
           { label: 'Vault Nodes', value: stats.mindmap_count, trend: 'Synced', icon: '🏆' },
         ].map((stat, i) => (
           <div key={i} className="bg-white border border-slate-50 rounded-[32px] p-8 shadow-sm hover:shadow-md transition-shadow group">
              <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">{stat.icon}</div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                 <h2 className="text-3xl font-black text-slate-800">{stat.value}</h2>
                 <span className="text-[9px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">{stat.trend}</span>
              </div>
           </div>
         ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-12">
        {/* Main Growth Graph */}
        <div className="lg:col-span-2 bg-white border border-slate-50 rounded-[48px] p-10 shadow-sm flex flex-col min-h-[450px]">
          <div className="flex justify-between items-center mb-10">
             <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Growth Velocity</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Knowledge acquisition over 7 months</p>
             </div>
             <div className="flex gap-2">
                <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest">Yearly</button>
                <button className="px-4 py-2 bg-slate-100 text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-200">Monthly</button>
             </div>
          </div>
          
          <div className="flex-1 w-full relative">
             <Line data={lineData} options={lineOptions} />
          </div>
        </div>

        {/* Breakdown Panel */}
        <div className="space-y-8">
           <div className="bg-slate-900 rounded-[48px] p-10 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600 rounded-full -mr-24 -mt-24 blur-3xl opacity-20 group-hover:scale-125 transition-transform duration-700"></div>
              
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-8 px-2">Knowledge Domains</h3>
              
              <div className="h-48 relative flex items-center justify-center mb-8">
                 <Doughnut data={doughnutData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                 <div className="absolute text-center pointer-events-none">
                    <p className="text-2xl font-black leading-none">{stats.efficiency.retention}%</p>
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Mastery</p>
                 </div>
              </div>

              <div className="space-y-3 px-2">
                 {[
                   { label: 'Engineering', val: 45, color: 'bg-indigo-500' },
                   { label: 'Design', val: 25, color: 'bg-pink-500' },
                   { label: 'Applied Science', val: stats.efficiency.creativity / 2, color: 'bg-emerald-500' },
                 ].map(item => (
                   <div key={item.label} className="flex items-center justify-between group/row">
                      <div className="flex items-center gap-3">
                         <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                         <span className="text-[10px] font-black text-slate-400 group-hover/row:text-white transition-colors uppercase tracking-widest">{item.label}</span>
                      </div>
                      <span className="text-xs font-black">{item.val}%</span>
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-white border border-slate-50 rounded-[48px] p-10 shadow-sm">
              <h3 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-6 px-2">Efficiency Tracker</h3>
              <div className="space-y-6">
                 {[
                   { label: 'Concentration', val: stats.efficiency.concentration },
                   { label: 'Retention', val: stats.efficiency.retention },
                   { label: 'Creativity', val: stats.efficiency.creativity },
                 ].map(m => (
                    <div key={m.label}>
                       <div className="flex justify-between items-center mb-2 px-1">
                          <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{m.label}</span>
                          <span className="text-[10px] font-black text-blue-600">{m.val}%</span>
                       </div>
                       <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${m.val}%` }}></div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* Neural Network Visualization (The Graph) */}
      <div className="bg-slate-950 rounded-[56px] p-12 text-white relative overflow-hidden group">
         <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #3b82f6 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
         
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
            <div>
               <h3 className="text-2xl font-black tracking-tight mb-2">Neural Connection Map</h3>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active nodes across your global knowledge base</p>
            </div>
            <div className="flex gap-4">
               <div className="flex items-center gap-3 px-5 py-2.5 bg-white/5 rounded-2xl border border-white/5">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">4,204 Synapses</span>
               </div>
               <button className="px-8 py-3 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">Launch Graph Studio</button>
            </div>
         </div>

         <div className="h-[500px] relative flex items-center justify-center">
            {/* Mock Neural Graph UI */}
            <div className="absolute w-[600px] h-[600px] border border-blue-500/10 rounded-full animate-[spin_60s_linear_infinite]"></div>
            <div className="absolute w-[400px] h-[400px] border border-blue-400/20 rounded-full animate-[spin_40s_linear_infinite_reverse]"></div>
            
            <div className="relative z-20 grid grid-cols-4 gap-x-24 gap-y-12">
               {[
                  { label: 'Neuroscience', size: 'w-24 h-24', color: 'bg-blue-600 shadow-[0_0_30px_rgba(59,130,246,0.5)]' },
                  { label: 'Calculus', size: 'w-16 h-16', color: 'bg-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.4)]' },
                  { label: 'Medieval', size: 'w-20 h-20', color: 'bg-emerald-600 shadow-[0_0_25px_rgba(16,185,129,0.4)]' },
                  { label: 'Logic', size: 'w-12 h-12', color: 'bg-rose-600 shadow-[0_0_15px_rgba(225,29,72,0.3)]' },
                  { label: 'Ethics', size: 'w-14 h-14', color: 'bg-amber-600 shadow-[0_0_18px_rgba(217,119,6,0.3)]' },
                  { label: 'Physics', size: 'w-20 h-20', color: 'bg-purple-600 shadow-[0_0_25px_rgba(147,51,234,0.4)]' },
               ].map((node, i) => (
                  <div key={i} className="flex flex-col items-center group/node cursor-pointer">
                     <div className={`${node.size} ${node.color} rounded-full flex items-center justify-center mb-4 transition-transform group-hover/node:scale-125 duration-500`}>
                        <div className="w-1/2 h-1/2 bg-white/20 rounded-full blur-sm"></div>
                     </div>
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover/node:text-white transition-colors">{node.label}</span>
                  </div>
               ))}
            </div>

            {/* Connecting Lines (Mock) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
               <line x1="20%" y1="30%" x2="50%" y2="50%" stroke="white" strokeWidth="1" strokeDasharray="5,5" />
               <line x1="80%" y1="30%" x2="50%" y2="50%" stroke="white" strokeWidth="1" strokeDasharray="5,5" />
               <line x1="20%" y1="70%" x2="50%" y2="50%" stroke="white" strokeWidth="1" strokeDasharray="5,5" />
               <line x1="80%" y1="70%" x2="50%" y2="50%" stroke="white" strokeWidth="1" strokeDasharray="5,5" />
            </svg>
         </div>
      </div>
    </div>
  );
};

export default StatisticsPage;
