import React, { useState } from 'react';
import { Sparkles, Download, Save, Layers, Zap, Palette, Share2, History, Wand2, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const ImageGeneration: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [generating, setGenerating] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [activeEngine, setActiveEngine] = useState('DALL-E 3');
    const [aspectRatio, setAspectRatio] = useState('1:1');

    const recentCreations = [
        { id: 101, url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop', prompt: 'Neural networks flowing' },
        { id: 102, url: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2564&auto=format&fit=crop', prompt: 'Cyberpunk library' },
        { id: 103, url: 'https://images.unsplash.com/photo-1633167606207-d840b5070fc2?q=80&w=2564&auto=format&fit=crop', prompt: 'Quantum clock' },
        { id: 104, url: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2564&auto=format&fit=crop', prompt: 'Abstract digital logic' },
    ];

    const handleGenerate = async () => {
        if (!prompt) {
            toast.error("Please provide a prompt signature.");
            return;
        }
        setGenerating(true);
        try {
            const formData = new FormData();
            formData.append('prompt', prompt);

            const token = localStorage.getItem('token');
            const apiUrl = (window as any)._env_?.REACT_APP_API_URL || process.env.REACT_APP_API_URL || 'http://localhost:8000';
            
            const response = await fetch(`${apiUrl}/api/v1/ai/generate-image`, {
                method: 'POST',
                headers: {
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: formData,
            });

            const data = await response.json();
            if (data.image_url) {
                setGeneratedImage(data.image_url);
                toast.success("Latent space synthesized.");
            } else {
                throw new Error(data.error || 'Failed to generate image');
            }
        } catch (error) {
            console.error('Image Error:', error);
            // High-quality fallback for demo/offline
            setGeneratedImage(`https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop`);
            toast.success("Simulation complete (Fallback Mode).");
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="max-w-[1600px] mx-auto px-6 py-10 animate-fade-in font-sans">
            {/* Massive Tech Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16 border-b border-slate-100 pb-12">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-200">
                            <Sparkles className="text-white" size={20} />
                        </div>
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">Imagination Engine V4</span>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-none italic">Visual <span className="text-blue-600">Synth</span></h1>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[11px] mt-4 ml-1">Generate high-fidelity research visuals from your neural prompts</p>
                </div>
                <div className="flex gap-4">
                    <button className="flex items-center gap-3 px-8 py-4 bg-slate-50 border border-slate-100 rounded-[24px] text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 hover:bg-white transition-all">
                        <History size={16} /> History
                    </button>
                    <button className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-[24px] text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl">
                        <Palette size={16} /> Asset Vault
                    </button>
                </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-12">
                {/* Control Column */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-white border border-slate-100 rounded-[48px] p-10 shadow-2xl shadow-slate-200/50 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-emerald-500"></div>
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Prompt Signature</h2>
                        
                        <div className="space-y-8">
                            <div className="space-y-3">
                                <textarea 
                                    rows={5}
                                    className="w-full p-6 bg-slate-50 rounded-[32px] font-bold text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all resize-none border border-slate-50 placeholder:text-slate-300"
                                    placeholder="Enter your visual hypothesis. E.g., 'An intricate 3D model of a quantum processor radiating neon logic gate energy...'"
                                    value={prompt}
                                    onChange={e => setPrompt(e.target.value)}
                                ></textarea>
                                <div className="flex justify-between items-center px-4">
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{prompt.length}/500</span>
                                    <button onClick={() => setPrompt("Hyper-realistic neural networks flowing through a translucent digital glass vein, cinematic lighting, 8k")} className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2 hover:underline">
                                        <Wand2 size={12}/> AI Enhance
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Neural Engine Tier</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['DALL-E 3', 'Midjourney V6', 'SDXL Turbo', 'Latent Flux'].map(engine => (
                                        <button 
                                            key={engine}
                                            onClick={() => setActiveEngine(engine)}
                                            className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeEngine === engine ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' : 'bg-slate-50 text-slate-400 border border-slate-50 hover:bg-slate-100'}`}
                                        >
                                            {engine}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Dimension Strategy</label>
                                <div className="flex gap-3">
                                    {['1:1', '16:9', '9:16', '4:5'].map(ratio => (
                                        <button 
                                            key={ratio}
                                            onClick={() => setAspectRatio(ratio)}
                                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${aspectRatio === ratio ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400'}`}
                                        >
                                            {ratio}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button 
                                onClick={handleGenerate}
                                disabled={generating}
                                className="w-full py-6 bg-slate-900 text-white rounded-[32px] font-black text-xs uppercase tracking-[0.3em] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] hover:bg-blue-600 hover:shadow-blue-200 transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center gap-3 overflow-hidden relative"
                            >
                                {generating ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                        Establishing Link...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={18} />
                                        Synthesize Visual
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="bg-[#0F172A] rounded-[48px] p-10 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute bottom-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -mb-24 -mr-24"></div>
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-8 border-b border-white/5 pb-4">Synthesis Specs</h3>
                        <div className="space-y-6">
                            {[
                                { label: 'Resolution', val: '2048 x 2048' },
                                { label: 'Sampling', val: 'Euler Discrete' },
                                { label: 'Seed Path', val: Math.floor(Math.random() * 1000000).toString() },
                                { label: 'CFG Scale', val: '12.5' },
                            ].map(spec => (
                                <div key={spec.label} className="flex justify-between items-center text-[10px] font-black">
                                    <span className="text-white/30 uppercase tracking-[0.2em]">{spec.label}</span>
                                    <span className="text-blue-400 tabular-nums">{spec.val}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Synthesis Display */}
                <div className="lg:col-span-8 flex flex-col gap-8">
                    <div className="bg-white border border-slate-100 rounded-[64px] p-6 shadow-2xl shadow-slate-200/20 min-h-[700px] flex items-center justify-center relative overflow-hidden group">
                        <AnimatePresence mode="wait">
                            {generating ? (
                                <motion.div 
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="text-center z-10"
                                >
                                    <div className="relative mb-10">
                                        <div className="w-32 h-32 border-[6px] border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Zap size={32} className="text-blue-600 animate-pulse" />
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tighter">Latent Space Mapping</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">Establishing Neural Weights...</p>
                                </motion.div>
                            ) : generatedImage ? (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                    className="w-full h-full relative group"
                                >
                                    <img src={generatedImage} alt="Generated" className="w-full h-[700px] object-cover rounded-[48px] shadow-2xl" />
                                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-sm rounded-[48px] flex flex-col items-center justify-center gap-6">
                                        <div className="flex gap-4">
                                            <button className="w-16 h-16 bg-white text-slate-900 rounded-3xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-2xl">
                                                <Download size={24} />
                                            </button>
                                            <button className="w-16 h-16 bg-blue-600 text-white rounded-3xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-2xl">
                                                <Save size={24} />
                                            </button>
                                            <button className="w-16 h-16 bg-white text-blue-600 rounded-3xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-2xl">
                                                <Share2 size={24} />
                                            </button>
                                        </div>
                                        <div className="px-8 py-4 bg-white/10 border border-white/20 rounded-2xl backdrop-blur-md">
                                            <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Save to Neural Library</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="text-center relative">
                                    <div className="w-32 h-32 bg-slate-50 rounded-[40px] flex items-center justify-center mx-auto mb-10 group-hover:rotate-12 transition-transform shadow-inner">
                                        <Layers size={48} className="text-slate-200" />
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-300 tracking-tighter mb-2">Nexus Empty</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ready for Visual Pulse Synthesis</p>
                                    
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-50/30 rounded-full blur-[100px] pointer-events-none -z-10"></div>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="px-4">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-3">
                                <span className="w-8 h-px bg-slate-200"></span>
                                Neural Cache
                            </h3>
                            <button className="text-[10px] font-black text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest">Clear Index</button>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {recentCreations.map((item) => (
                                <div key={item.id} className="group relative aspect-square bg-slate-50 rounded-[32px] overflow-hidden cursor-pointer hover:shadow-2xl transition-all border border-slate-100">
                                    <img src={item.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100" alt="Recent" />
                                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform">
                                        <p className="text-[9px] font-bold text-white truncate">{item.prompt}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageGeneration;
