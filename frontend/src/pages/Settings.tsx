import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  Crown, 
  Shield, 
  Download, 
  FileText, 
  Database,
  Users,
  CreditCard,
  Settings as SettingsIcon,
  Bell,
  Palette,
  Lock,
  Trash2,
  Key,
  Mail,
  Globe,
  Zap,
  Cpu,
  Activity,
  ChevronRight,
  Monitor,
  Command,
  MessageSquare,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { microsoftService } from '../services/microsoftService';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [model, setModel] = useState('gpt-4o-mini');
  const { theme, setTheme: setGlobalTheme, resolvedTheme } = useTheme();
  const { user } = useAuth();
  const [microsoftConnected, setMicrosoftConnected] = useState(false);
  const [showKeys, setShowKeys] = useState(false);
  const [openaiKey, setOpenaiKey] = useState('********************************');
  const [jwtSecret, setJwtSecret] = useState('********************************');
  
  const [settings, setSettings] = useState<any>({
    theme: 'dark',
    ai_model: 'gpt-4o-mini',
    language: 'en',
    email_notifications: true
  });

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  React.useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/users/settings`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      setSettings(data);
      if (data.ai_model) setModel(data.ai_model);
      if (data.theme) setGlobalTheme(data.theme);
    } catch (err) {
      console.error('Failed to fetch settings');
    }
  };

  const saveSettings = async (newSettings?: any) => {
    const payload = newSettings || {
      ...settings,
      ai_model: model,
      theme: theme
    };
    try {
      const response = await fetch(`${API_BASE}/api/v1/users/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error();
      toast.success('Core Synchronized.', {
        style: {
          background: '#0f172a',
          color: '#fff',
          borderRadius: '24px',
          border: '1px solid rgba(255,255,255,0.1)'
        }
      });
    } catch (err) {
      toast.error('Sync failed');
    }
  };

  const handleMicrosoftLink = async () => {
    try {
      await microsoftService.login();
      setMicrosoftConnected(true);
      toast.success('Neural sync with Microsoft established!');
    } catch (error) {
      toast.error('Uplink failed');
    }
  };
  
  const TabButton = ({ id, label, icon }: { id: string, label: string, icon: React.ReactNode }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-4 px-8 py-5 w-full text-left transition-all relative group overflow-hidden ${
        activeTab === id 
        ? 'bg-blue-600 text-white shadow-3xl rounded-3xl scale-[1.02] z-10' 
        : 'text-slate-400 hover:bg-white/5 rounded-2xl'
      }`}
    >
      <div className={`${activeTab === id ? 'text-white' : 'text-blue-500'} group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">{label}</span>
      {activeTab === id && (
        <motion.div layoutId="tab-active" className="absolute right-4 w-2 h-2 bg-white rounded-full" />
      )}
    </button>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-20 animate-slide-up min-h-screen bg-slate-950">
      <div className="flex flex-col lg:flex-row gap-16">
        
        {/* Superior Sidebar HUD */}
        <div className="lg:w-96 space-y-6">
          <div className="px-8 mb-16">
             <div className="flex items-center gap-4 mb-4">
               <div className="w-16 h-16 bg-blue-600 rounded-[28px] flex items-center justify-center shadow-3xl shadow-blue-500/30">
                  <Cpu size={32} className="text-white" />
               </div>
               <div>
                 <h1 className="text-4xl font-black text-white italic tracking-tighter">System <span className="text-blue-500 opacity-50 underline decoration-blue-500/30 underline-offset-8">Core</span></h1>
                 <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Config Protocol V8.4</p>
               </div>
             </div>
          </div>
          
          <div className="space-y-3">
             <TabButton id="general" label="Interface" icon={<Palette size={20}/>} />
             <TabButton id="ai" label="AI Logic" icon={<SettingsIcon size={20}/>} />
             <TabButton id="subscription" label="Billing Protocol" icon={<Crown size={20}/>} />
             <TabButton id="integrations" label="Uplinks" icon={<Globe size={20}/>} />
             <TabButton id="security" label="Quantum Shield" icon={<Lock size={20}/>} />
             <TabButton id="notifications" label="Vocal Reminders" icon={<Bell size={20}/>} />
          </div>

          <div className="mt-20 px-8 p-10 bg-white/5 border border-white/5 rounded-[40px] relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
             <Activity className="text-blue-500 mb-6" size={24} />
             <h4 className="text-sm font-black text-white italic mb-2">Neural Status: Stable</h4>
             <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic">All systems performing within optimal cognitive thresholds.</p>
          </div>
        </div>

        {/* Neural Content Stage */}
        <div className="flex-1 bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[64px] p-20 shadow-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] -mr-64 -mt-64"></div>
          
          <AnimatePresence mode="wait">
            {activeTab === 'general' && (
              <motion.div 
                key="general"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-16"
              >
                <div>
                  <h2 className="text-4xl font-black text-white italic mb-4">Visual Synthesis</h2>
                  <p className="text-sm text-slate-400 font-medium">Fine-tune the ocular output of your Neural OS.</p>
                </div>

                <div className="grid grid-cols-2 gap-10">
                  <div 
                    onClick={() => setGlobalTheme('light')}
                    className={`p-10 rounded-[48px] border-2 cursor-pointer transition-all hover:scale-105 active:scale-95 ${resolvedTheme === 'light' ? 'border-blue-500 bg-white shadow-3xl text-slate-950' : 'border-white/10 bg-white/5 text-white'}`}
                  >
                    <div className="h-48 bg-slate-100/50 rounded-3xl mb-8 flex items-center justify-center text-6xl shadow-inner italic">Ø</div>
                    <p className="text-center text-xl font-black italic">Daylight Protocol</p>
                    <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] mt-3 opacity-50">High Refraction</p>
                  </div>
                  <div 
                    onClick={() => setGlobalTheme('dark')}
                    className={`p-10 rounded-[48px] border-2 cursor-pointer transition-all hover:scale-105 active:scale-95 ${resolvedTheme === 'dark' ? 'border-blue-500 bg-slate-950 shadow-3xl text-white' : 'border-white/10 bg-white/5 text-white'}`}
                  >
                    <div className="h-48 bg-slate-900 rounded-3xl mb-8 flex items-center justify-center text-6xl shadow-inner italic">Σ</div>
                    <p className="text-center text-xl font-black italic">Midnight Grid</p>
                    <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] mt-3 text-blue-500">✓ Active Stream</p>
                  </div>
                </div>

                <div className="pt-16 border-t border-white/5">
                  <h3 className="text-lg font-black text-white italic mb-10 flex items-center gap-4">
                     <Layers className="text-blue-500" /> Chromatic Uplinks
                  </h3>
                  <div className="flex gap-8">
                    {[
                      { color: '#3b82f6', name: 'Azure' },
                      { color: '#8b5cf6', name: 'Nebula' },
                      { color: '#10b981', name: 'Emerald' },
                      { color: '#f43f5e', name: 'Solar' },
                      { color: '#f59e0b', name: 'Nova' }
                    ].map(item => (
                      <div key={item.color} className="flex flex-col items-center gap-4 cursor-pointer group">
                        <div 
                          className="w-16 h-16 rounded-[24px] hover:scale-110 transition-all shadow-2xl group-hover:ring-4 ring-blue-500/20" 
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] italic">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'ai' && (
              <motion.div 
                key="ai"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-16"
              >
                <div>
                  <h2 className="text-4xl font-black text-white italic mb-4">Neural Engine</h2>
                  <p className="text-sm text-slate-400 font-medium italic underline decoration-blue-500/20 underline-offset-4">Assign cognitive priorities for your research synthesis.</p>
                </div>

                <div className="space-y-10">
                   <div className="p-10 bg-slate-950 border border-white/5 rounded-[48px] relative overflow-hidden group">
                      <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-6 block italic">Primary Logic Core</label>
                      <select 
                        value={model} 
                        onChange={e => setModel(e.target.value)}
                        className="w-full bg-transparent border-none outline-none text-2xl font-black text-white italic cursor-pointer appearance-none"
                      >
                        <option value="gpt-4o">Neural GPT-4o Protocol</option>
                        <option value="gpt-4o-mini">Neural GPT-4o Mini (Optimal)</option>
                        <option value="groq-llama-3">Llama-3 Overdrive (Groq)</option>
                        <option value="ollama-local">Local Synthesis Cluster (Ollama)</option>
                      </select>
                      <div className="mt-8 flex items-center gap-4 text-xs font-medium text-slate-400">
                         <Zap size={16} className="text-blue-500" />
                         <span>Estimated Complexity: <strong>Exponential</strong></span>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-10">
                      <div className="p-10 bg-white/5 border border-white/5 rounded-[40px]">
                         <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-6 italic text-center">Creativity Flux</p>
                         <div className="relative h-2 bg-slate-950 rounded-full overflow-hidden">
                            <div className="absolute left-0 top-0 h-full w-[70%] bg-blue-600 shadow-[0_0_20px_rgba(59,130,246,0.5)]"></div>
                         </div>
                         <div className="flex justify-between mt-4 text-[8px] font-black text-slate-600 uppercase">
                            <span>Logic</span>
                            <span>Nebula</span>
                         </div>
                      </div>
                      <div className="p-10 bg-white/5 border border-white/5 rounded-[40px]">
                         <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-6 italic text-center">Uplink Speed</p>
                         <div className="relative h-2 bg-slate-950 rounded-full overflow-hidden">
                            <div className="absolute left-0 top-0 h-full w-[90%] bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]"></div>
                         </div>
                         <div className="flex justify-between mt-4 text-[8px] font-black text-slate-600 uppercase">
                            <span>Standard</span>
                            <span>Quantum</span>
                         </div>
                      </div>
                   </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'subscription' && (
              <motion.div 
                key="subscription"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-16"
              >
                <div className="bg-gradient-to-br from-indigo-700 to-blue-900 rounded-[64px] p-20 text-white relative shadow-3xl overflow-hidden group">
                   <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-[100px] -mr-80 -mt-80 group-hover:scale-110 transition-transform duration-1000"></div>
                   <div className="relative z-10">
                      <div className="flex items-center gap-8 mb-12">
                         <div className="w-24 h-24 bg-white/10 backdrop-blur-3xl rounded-[32px] flex items-center justify-center border border-white/20 shadow-2xl">
                            <Crown size={48} className="text-blue-300" />
                         </div>
                         <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-300 mb-2 italic">Active Syndicate</p>
                            <h3 className="text-6xl font-black italic tracking-tighter">Neural Architect</h3>
                         </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-20 items-end">
                         <div>
                            <p className="text-indigo-100 text-lg font-medium leading-relaxed opacity-80 mb-10 italic">
                               Complete Access to the Global Synthesis Engine, Real-time Visual Cinema, and Quantum Graph Modules.
                            </p>
                            <button className="px-12 py-5 bg-white text-indigo-950 rounded-[28px] text-xs font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-3xl">
                               Manage Syndicate →
                            </button>
                         </div>
                         <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-2">Billing Frequency</p>
                            <p className="text-6xl font-black italic">$29<span className="text-2xl opacity-40">/mo</span></p>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                   <h3 className="text-xl font-black text-white italic mb-4">Uplink History</h3>
                   {[
                     { date: 'Cycle 28:01', amount: '29.00', protocol: 'SecurePay-V4' },
                     { date: 'Cycle 27:12', amount: '29.00', protocol: 'SecurePay-V4' },
                   ].map((inv, i) => (
                      <div key={i} className="p-8 bg-white/5 border border-white/5 rounded-[32px] flex items-center justify-between group hover:bg-white/10 transition-all">
                         <div className="flex items-center gap-5">
                            <FileText size={20} className="text-slate-500" />
                            <div>
                               <p className="text-sm font-black text-white italic">Internal Audit: {inv.date}</p>
                               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Status: SYNCHRONIZED</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-8">
                            <span className="text-xl font-black text-white lining-nums">${inv.amount}</span>
                            <Download size={18} className="text-blue-500 cursor-pointer hover:scale-125 transition-transform" />
                         </div>
                      </div>
                   ))}
                </div>
              </motion.div>
            )}

            {/* Default State for other tabs */}
            {!['general', 'ai', 'subscription'].includes(activeTab) && (
              <div className="h-full flex flex-col items-center justify-center text-center">
                 <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center mb-10 border border-white/5">
                    <Monitor size={48} className="text-slate-700" />
                 </div>
                 <h3 className="text-2xl font-black text-white italic mb-4 uppercase tracking-widest">Protocol Encrypted</h3>
                 <p className="text-slate-500 text-sm max-w-md italic">This configuration terminal requires a Tier 4 Neural Key to access. Contact your administrator for more info.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Global Command Center Floating */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-12 right-12 z-[200] flex gap-6"
      >
        <button 
          onClick={() => saveSettings()}
          className="px-16 py-6 bg-blue-600 text-white rounded-[32px] font-black italic text-sm tracking-[0.2em] shadow-3xl shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-4 group"
        >
          SYNC PROTOCOL <ChevronRight size={18} className="group-hover:translate-x-2 transition-transform" />
        </button>
      </motion.div>
    </div>
  );
};

export default Settings;
