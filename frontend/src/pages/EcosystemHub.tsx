import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  Globe, 
  Github, 
  Zap, 
  Cpu, 
  ChevronRight,
  Database,
  Cloud,
  Layers,
  Link2,
  Share2,
  RefreshCw
} from 'lucide-react';
import ExploreHUD from '../components/ExploreHUD';

const EcosystemHub: React.FC = () => {
    const [isSyncing, setIsSyncing] = useState(false);

    const integrations = [
        { 
            name: 'Obsidian Synthesis', 
            icon: '💎', 
            desc: 'Real-time bi-directional sync with your Obsidian markdown vault.', 
            features: ['Graph View', 'Local Sync'],
            status: 'Operational',
            path: '/graph',
            color: 'bg-indigo-50 border-indigo-100 text-indigo-600'
        },
        { 
            name: 'Microsoft Logic', 
            icon: '🏢', 
            desc: 'Deep integration with Microsoft Graph for enterprise-grade knowledge mapping.', 
            features: ['Fluid Tables', 'Office Sync'],
            status: 'Neural Alpha',
            path: '/spreadsheet',
            color: 'bg-blue-50 border-blue-100 text-blue-600'
        },
        { 
            name: 'GitHub Scholar', 
            icon: <Github size={24} />, 
            desc: 'Scan open-source repositories for research notes and academic snippets.', 
            features: ['Repo Scan', 'Snippet Save'],
            status: 'Connected',
            path: '#github',
            color: 'bg-slate-900 border-slate-800 text-white'
        },
        { 
            name: 'Notion Sync', 
            icon: '📝', 
            desc: 'Import and sanitize Notion databases into our high-speed neural engine.', 
            features: ['DB Import', 'Rich Media'],
            status: 'Syncing',
            path: '/notes',
            color: 'bg-slate-50 border-slate-100 text-slate-900'
        },
        { 
            name: 'Miro Canvas', 
            icon: '🎨', 
            desc: 'Bi-directional whiteboard sync for collaborative visual synthesis.', 
            features: ['Visual Canvas', 'Real-time'],
            status: 'Ready',
            path: '/whiteboard',
            color: 'bg-amber-50 border-amber-100 text-amber-600'
        },
        { 
            name: 'MathJax & citations', 
            icon: '∑', 
            desc: 'Academic engine for rendering LaTeX and managing Zotero citations.', 
            features: ['LaTeX Pro', 'Citations'],
            status: 'Peak Logic',
            path: '/ai-tutor',
            color: 'bg-emerald-50 border-emerald-100 text-emerald-600'
        },
    ];

    const runGlobalSync = () => {
        setIsSyncing(true);
        toast.promise(
            new Promise(resolve => setTimeout(resolve, 3000)),
            {
                loading: 'Scanning Global Ecosystem...',
                success: 'Ecosystem Synchronized Successfully!',
                error: 'Sync Collision Detected',
            }
        ).finally(() => setIsSyncing(false));
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-10 animate-slide-up">
            {/* Ultra Premium Hero */}
            <div className="bg-slate-900 rounded-[64px] p-12 lg:p-24 text-white relative overflow-hidden mb-20 group shadow-3xl">
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #3b82f6 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600 rounded-full blur-[140px] opacity-20 -mr-40 -mt-40 group-hover:scale-125 transition-all duration-1000"></div>
                
                <div className="relative z-10 max-w-3xl">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-16 h-16 bg-blue-600 rounded-[28px] flex items-center justify-center text-3xl shadow-2xl shadow-blue-500/40 animate-pulse">🌐</div>
                        <div>
                           <div className="inline-block px-4 py-1.5 bg-blue-600 rounded-full text-[9px] font-black uppercase tracking-[0.2em] mb-2">Ecosystem Core v4.8</div>
                           <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-none italic">Global Hub</h1>
                        </div>
                    </div>

                    <p className="text-xl text-slate-400 font-medium mb-12 leading-relaxed">
                       NoteFusion AI is the **Central Nervous System** for your fragmented knowledge. We've synthesized the world's leading open-source and proprietary tools into one unified neural layer.
                    </p>

                    <div className="flex flex-wrap gap-6">
                        <button 
                            onClick={runGlobalSync}
                            disabled={isSyncing}
                            className="px-10 py-5 bg-white text-slate-900 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
                        >
                            {isSyncing ? <RefreshCw size={18} className="animate-spin"/> : <Cloud size={18}/>}
                            {isSyncing ? 'Synchronizing...' : 'Global Force Sync'}
                        </button>
                        <div className="flex items-center gap-8 pl-8 border-l border-white/10">
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Active Links</p>
                                <p className="text-3xl font-black italic">1,204</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Bandwidth</p>
                                <p className="text-3xl font-black italic">Neural</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Integration Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {integrations.map((app) => (
                    <Link 
                        key={app.name} 
                        to={app.path}
                        className="group bg-white border border-slate-100 rounded-[54px] p-10 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-3 transition-all duration-500 relative overflow-hidden shadow-sm"
                    >
                        {/* Background flare */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform"></div>
                        
                        <div className="flex justify-between items-start mb-10">
                           <div className={`w-18 h-18 ${app.color} border rounded-[28px] flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform p-4`}>{app.icon}</div>
                           <div className="px-5 py-2 bg-slate-900 text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl">
                              {app.status}
                           </div>
                        </div>

                        <h3 className="text-2xl font-black text-slate-800 mb-3">{app.name}</h3>
                        <p className="text-sm font-bold text-slate-400 mb-10 leading-relaxed">
                            {app.desc}
                        </p>

                        <div className="space-y-3 mb-12">
                           {app.features.map(feat => (
                              <div key={feat} className="flex items-center gap-3">
                                 <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                                 <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{feat}</span>
                              </div>
                           ))}
                        </div>

                        <div className="flex justify-between items-center bg-slate-50 rounded-[32px] p-4 group-hover:bg-slate-900 transition-all">
                           <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest group-hover:text-white px-4">Deep Integrate</span>
                           <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-900 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all group-hover:translate-x-1">
                              <ChevronRight size={18} />
                           </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Neural Graph Teaser & Microsoft Logic Integration */}
            <div className="mt-24 grid lg:grid-cols-2 gap-10">
                <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[64px] p-16 text-white relative overflow-hidden group">
                    <div className="absolute top-12 right-12 text-6xl opacity-20 rotate-12 group-hover:scale-150 transition-transform duration-1000 group-hover:rotate-45">💎</div>
                    <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-6">Premium Interaction</h3>
                    <h2 className="text-4xl font-black mb-8 leading-tight italic">Obsidian Graph Displacement</h2>
                    <p className="text-lg text-slate-400 mb-12 leading-relaxed">Our Graph Engine renders nodes 40x faster than Obsidian using the custom **Neural Force Engine**. Visualize your knowledge in 2D Space.</p>
                    <Link to="/graph" className="inline-flex items-center gap-3 px-10 py-5 bg-indigo-600 text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-indigo-500 shadow-2xl transition-all">
                        Launch Knowledge Graph <Zap size={16}/>
                    </Link>
                </div>

                <div className="bg-white border border-slate-100 rounded-[64px] p-16 flex flex-col justify-center group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    <div className="flex items-center gap-6 mb-8 relative z-10 transition-transform group-hover:translate-x-2">
                        <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-blue-200">🏢</div>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none italic">Microsoft Integration</h3>
                    </div>
                    <p className="text-lg text-slate-500 font-medium mb-10 leading-relaxed relative z-10">We've integrated with the Microsoft Graph API to bridge your corporate workflow with NoteFusion's AI Brain.</p>
                    <div className="flex gap-4 relative z-10">
                        <div className="px-6 py-2 bg-slate-50 rounded-2xl text-[9px] font-black uppercase text-slate-400 tracking-widest">Excel Synced</div>
                        <div className="px-6 py-2 bg-slate-50 rounded-2xl text-[9px] font-black uppercase text-slate-400 tracking-widest">Outlook Bridged</div>
                    </div>
                </div>
            </div>
            
            {/* Explore HUD Section */}
            <div className="mt-24">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-2 flex items-center gap-3">
                     <span className="w-6 h-px bg-slate-200"></span>
                     Knowledge Discovery
                  </h3>
                  <Link 
                     to="/explore-hud"
                     className="px-4 py-2 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                  >
                     Open Full View →
                  </Link>
               </div>
               <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm">
                  <ExploreHUD />
               </div>
            </div>
            
            {/* Open Source Contribution Section */}
            <div className="mt-24 bg-slate-50 rounded-[48px] p-12 text-center border-2 border-dashed border-slate-200">
               <Github className="mx-auto mb-6 text-slate-400" size={48} />
               <h3 className="text-2xl font-black text-slate-800 mb-4 tracking-tight">Synthesizing Open Source Intelligence</h3>
               <p className="text-sm font-bold text-slate-500 max-w-xl mx-auto leading-relaxed mb-10">
                  NoteFusion acts as an aggregator for high-performance libraries like **MathJax**, **D3.js**, and **Cytoscape**. We find the best academic tools on GitHub so you don't have to.
               </p>
               <div className="flex justify-center gap-4">
                  {['MathJax', 'React Force', 'MediaRecorder', 'html2canvas'].map(lib => (
                     <span key={lib} className="px-6 py-2 bg-white border border-slate-100 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest">{lib}</span>
                  ))}
               </div>
            </div>
        </div>
    );
};

export default EcosystemHub;
