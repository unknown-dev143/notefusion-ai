import React, { useState } from 'react';
import { Database, Search, Download, Code, CheckCircle, BarChart2, TrendingUp, Filter, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const KaggleHub: React.FC = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<'datasets' | 'notebooks' | 'models'>('datasets');

    const [datasets, setDatasets] = useState([
        { id: 1, title: 'Global Temperature Trends (1850-2023)', type: 'Dataset', size: '1.2GB', votes: 4520, loaded: false, category: 'Science', meta: 'Historical climate data' },
        { id: 2, title: 'Neural Network Architectures', type: 'Notebook', size: '12MB', votes: 890, loaded: true, category: 'AI', meta: 'PyTorch implementations' },
        { id: 3, title: 'S&P 500 Historical Data', type: 'Dataset', size: '450MB', votes: 2100, loaded: false, category: 'Finance', meta: 'Stock market CSVs' },
        { id: 4, title: 'Quantum Computing Simulators', type: 'Code', size: '200KB', votes: 156, loaded: false, category: 'Computing', meta: 'Qiskit tutorials' },
        { id: 5, title: 'Customer Sentiment Analysis', type: 'Dataset', size: '89MB', votes: 1240, loaded: false, category: 'Business', meta: 'Social media scrapes' },
        { id: 6, title: 'MNIST Digits Classification', type: 'Dataset', size: '15MB', votes: 10200, loaded: false, category: 'AI', meta: 'Handwritten digit data' },
    ]);

    const loadDataset = (id: number) => {
        setIsLoading(id);
        setTimeout(() => {
            setDatasets(prev => prev.map(ds => ds.id === id ? { ...ds, loaded: true } : ds));
            setIsLoading(null);
            
            const ds = datasets.find(d => d.id === id);
            
            // Add a notification to local storage for the tracker
            const newNotif = {
                id: 'kaggle-' + Date.now(),
                type: 'Kaggle Sync',
                title: `${ds?.title} Imported`,
                desc: 'Dataset is now available in your Neural Sheets and Slide Maker.',
                time: 'Just now',
                unread: true,
                icon: '📊',
                actionUrl: '/slide-maker'
            };
            const existing = JSON.parse(localStorage.getItem('notefusion_notifications') || '[]');
            localStorage.setItem('notefusion_notifications', JSON.stringify([newNotif, ...existing]));

            toast.success(
                (t) => (
                    <span className="flex items-center gap-3">
                        Neural weights synchronized! 
                        <button 
                            onClick={() => {
                                toast.dismiss(t.id);
                                navigate('/slide-maker');
                            }}
                            className="bg-slate-900 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase"
                        >
                            Visualize
                        </button>
                    </span>
                ),
                { duration: 5000 }
            );
        }, 1500);
    };

    const filtered = datasets.filter(ds => 
        ds.title.toLowerCase().includes(search.toLowerCase()) || 
        ds.category.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto px-6 py-10 animate-fade-in font-sans">
            {/* Hero Header */}
            <div className="bg-[#0F172A] rounded-[60px] p-16 text-white relative flex flex-col items-center overflow-hidden mb-12 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] ring-1 ring-white/10">
                <div className="absolute top-0 left-0 w-full h-full">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[120px] rounded-full"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(#ffffff10_1px,transparent_1px)] [background-size:40px_40px] opacity-20"></div>
                </div>
                
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="z-10 text-center"
                >
                    <div className="flex justify-center mb-6">
                        <div className="bg-white/10 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-2">
                            <Sparkles size={14} className="text-blue-400" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">AI-Powered Data Retrieval</span>
                        </div>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-[900] mb-6 tracking-tighter leading-none">Kaggle Data Nexus</h1>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs max-w-2xl mb-12 leading-loose">
                        Seamlessly bridge professional datasets into your workspace. Optimize your research trajectory with high-fidelity analytical imports.
                    </p>
                </motion.div>

                <div className="w-full max-w-3xl bg-white/5 backdrop-blur-2xl border border-white/10 p-2.5 rounded-[32px] flex flex-col md:flex-row items-center gap-4 transition-all z-10 shadow-2xl focus-within:ring-4 focus-within:ring-blue-500/30">
                    <div className="flex items-center flex-1 w-full px-4 gap-4">
                        <Search className="text-slate-500" size={24} />
                        <input 
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Identify dataset, notebook, or neural model..."
                            className="flex-1 bg-transparent py-5 outline-none font-bold text-lg text-white placeholder:text-slate-600"
                        />
                    </div>
                    <button className="w-full md:w-auto px-12 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[24px] text-sm font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-blue-500/20">
                        Query Nexus
                    </button>
                </div>

                <div className="flex gap-8 mt-12 z-10">
                    <div className="flex flex-col items-center">
                        <span className="text-2xl font-black">5.2M+</span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Datasets</span>
                    </div>
                    <div className="h-10 w-px bg-white/10"></div>
                    <div className="flex flex-col items-center">
                        <span className="text-2xl font-black">850K+</span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Notebooks</span>
                    </div>
                    <div className="h-10 w-px bg-white/10"></div>
                    <div className="flex flex-col items-center">
                        <span className="text-2xl font-black">12ms</span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sync Speed</span>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap justify-between items-center gap-6 mb-10">
                <div className="bg-white p-1.5 rounded-[24px] border border-slate-200 shadow-sm flex gap-1">
                    {['datasets', 'notebooks', 'models'].map((tab) => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <div className="flex gap-3">
                    <button className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm">
                        <Filter size={20} />
                    </button>
                    <button className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm">
                        <TrendingUp size={20} />
                    </button>
                </div>
            </div>

            {/* Results Grid */}
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                    {filtered.map((ds) => (
                        <motion.div 
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            key={ds.id} 
                            className="bg-white border border-slate-200 rounded-[40px] p-8 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all group flex flex-col relative overflow-hidden ring-1 ring-slate-100"
                        >
                            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50/50 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-blue-100/50 transition-colors"></div>
                            
                            <div className="flex justify-between items-start mb-6">
                                <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center text-white shadow-xl ${ds.type === 'Dataset' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : ds.type === 'Notebook' ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-orange-500 to-rose-600'}`}>
                                    {ds.type === 'Dataset' ? <Database size={28} /> : ds.type === 'Notebook' ? <BarChart2 size={28} /> : <Code size={28} />}
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Affinity</div>
                                    <div className="text-sm font-black text-slate-900 flex items-center justify-end gap-1">
                                        <TrendingUp size={12} className="text-emerald-500" /> {ds.votes}
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1">
                                <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border mb-4 inline-block ${ds.type === 'Dataset' ? 'bg-blue-50 border-blue-100 text-blue-600' : ds.type === 'Notebook' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-orange-50 border-orange-100 text-orange-600'}`}>
                                    {ds.category} // {ds.type}
                                </span>
                                <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight leading-tight group-hover:text-blue-600 transition-colors">{ds.title}</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6 italic">"{ds.meta}"</p>
                            </div>

                            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Storage</span>
                                    <span className="text-sm font-black text-slate-700">{ds.size}</span>
                                </div>
                                
                                <div className="z-10">
                                    {ds.loaded ? (
                                        <button className="flex items-center gap-2 px-6 py-3 bg-slate-50 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl border border-slate-200 cursor-not-allowed">
                                            <CheckCircle size={14} /> Synchronized
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => loadDataset(ds.id)} 
                                            disabled={isLoading !== null} 
                                            className="flex items-center gap-2 px-8 py-3.5 bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl hover:bg-blue-600 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 relative overflow-hidden"
                                        >
                                            {isLoading === ds.id ? (
                                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                            ) : (
                                                <>
                                                    <Download size={14} /> Import Data
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-32 bg-slate-50 rounded-[60px] border-4 border-dashed border-slate-200">
                    <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Search size={40} className="text-slate-400" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 mb-2">Nexus Empty</h3>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No neural nodes matched your query signature</p>
                </div>
            )}
        </div>
    );
};

export default KaggleHub;
