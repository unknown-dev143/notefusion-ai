import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Zap, ArrowRight, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SynapseConnection {
    id: string;
    title: string;
    snippet: string;
}

interface SynapseSidebarProps {
    content: string;
    isOpen: boolean;
    onClose: () => void;
}

const SynapseSidebar: React.FC<SynapseSidebarProps> = ({ content, isOpen, onClose }) => {
    const [connections, setConnections] = useState<SynapseConnection[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isOpen || content.length < 50) return;

        const timer = setTimeout(async () => {
            setIsLoading(true);
            try {
                const token = localStorage.getItem('token');
                const apiUrl = (window as any)._env_?.REACT_APP_API_URL || process.env.REACT_APP_API_URL || 'http://localhost:8000';
                const response = await fetch(`${apiUrl}/api/v1/ai/synapse`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    },
                    body: JSON.stringify({ content })
                });
                const data = await response.json();
                setConnections(data.connections || []);
            } catch (err) {
                console.error('Synapse error:', err);
            } finally {
                setIsLoading(false);
            }
        }, 1500); // Debounce

        return () => clearTimeout(timer);
    }, [content, isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ x: 400 }}
                    animate={{ x: 0 }}
                    exit={{ x: 400 }}
                    className="fixed top-0 right-0 w-[350px] h-screen bg-white border-l border-slate-100 shadow-2xl z-50 flex flex-col pt-24"
                >
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Share2 size={18} className="text-blue-600" />
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-800">Neural Synapse</h3>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-900 transition-colors">✕</button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {content.length < 50 ? (
                            <div className="text-center py-20 opacity-40">
                                <Brain size={32} className="mx-auto mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-widest">Type more to activate synapse...</p>
                            </div>
                        ) : isLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="animate-pulse bg-slate-50 h-24 rounded-2xl"></div>
                                ))}
                                <p className="text-center text-[8px] font-black uppercase tracking-widest text-blue-400 mt-4">Scanning Neural Map...</p>
                            </div>
                        ) : connections.length === 0 ? (
                            <div className="text-center py-20 opacity-40">
                                <Zap size={32} className="mx-auto mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-widest">No immediate connections found.</p>
                            </div>
                        ) : (
                            connections.map(note => (
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    key={note.id}
                                    onClick={() => navigate(`/notes/${note.id}`)}
                                    className="p-5 bg-slate-50 rounded-2xl border border-transparent hover:border-blue-100 hover:bg-white hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-pointer group"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-black text-slate-900 text-sm leading-tight group-hover:text-blue-600 transition-colors">{note.title}</h4>
                                        <ArrowRight size={14} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
                                    </div>
                                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed font-medium">{note.snippet}</p>
                                    <div className="mt-4 flex items-center gap-2">
                                        <span className="text-[8px] font-black uppercase tracking-widest text-blue-600/60">Semantic Match</span>
                                        <div className="h-px flex-1 bg-blue-100/50"></div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>

                    <div className="p-6 bg-slate-50/50 border-t border-slate-50">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                            Synapse automatically analyzes your content to find hidden patterns across your research nodes.
                        </p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SynapseSidebar;
