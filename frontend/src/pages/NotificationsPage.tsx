import React, { useState, useEffect } from 'react';
import { Bell, Sparkles, Trash2, CheckCircle, Clock, Zap, Target, Shield, Flame, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface Notification {
    id: string;
    type: string;
    title: string;
    desc: string;
    time: string;
    unread: boolean;
    icon: string;
    actionUrl?: string;
}

const NotificationsPage: React.FC = () => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        const defaultNotifications: Notification[] = [
            { id: '1', type: 'AI Synthesis', title: 'Neural Map Ready', desc: 'Your workspace graph has been recalibrated based on the latest research nodes.', time: '2 mins ago', unread: true, icon: '🧠' },
            { id: '2', type: 'Collaborative', title: 'Peer Sync Invitation', desc: 'Sarah invited you to her "Quantum Physics" whiteboard session.', time: '1h ago', unread: true, icon: '🤝' },
            { id: '3', type: 'Security', title: 'Active Safeguard', desc: 'Neural encryption for your private folders has been successfully rotated.', time: '3h ago', unread: false, icon: '🔐' },
            { id: '4', type: 'Achievement', title: 'Focus Streak: 7 Days', desc: 'You have maintained your study momentum. +500 Scholar Points accrued.', time: 'Yesterday', unread: false, icon: '🔥' },
        ];

        // Merge with localStorage notifications
        const localNotifs = JSON.parse(localStorage.getItem('notefusion_notifications') || '[]');
        setNotifications([...localNotifs, ...defaultNotifications]);
    }, []);

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
        // Update local storage if it's a local one
        const localNotifs = JSON.parse(localStorage.getItem('notefusion_notifications') || '[]');
        const updatedLocal = localNotifs.map((n: any) => n.id === id ? { ...n, unread: false } : n);
        localStorage.setItem('notefusion_notifications', JSON.stringify(updatedLocal));
    };

    const deleteNotif = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
        const localNotifs = JSON.parse(localStorage.getItem('notefusion_notifications') || '[]');
        localStorage.setItem('notefusion_notifications', JSON.stringify(localNotifs.filter((n: any) => n.id !== id)));
    };

    const handleAction = (notif: Notification) => {
        markAsRead(notif.id);
        if (notif.actionUrl) {
            navigate(notif.actionUrl);
        }
    };

    const filtered = filter === 'unread' ? notifications.filter(n => n.unread) : notifications;

    return (
        <div className="max-w-5xl mx-auto px-6 py-12 animate-fade-in font-sans">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-16 px-4">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-[20px] shadow-xl shadow-blue-200 flex items-center justify-center">
                            <Bell className="text-white" size={24} />
                        </div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Signal Center</h1>
                    </div>
                    <p className="font-black text-slate-400 uppercase tracking-[0.3em] text-[11px] ml-1">Real-time intelligence from your neural network</p>
                </div>
                
                <div className="bg-white p-1.5 rounded-[28px] border border-slate-200 shadow-sm flex gap-1">
                    <button 
                        onClick={() => setFilter('all')}
                        className={`px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${filter === 'all' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}
                    >
                        Total Pulse
                    </button>
                    <button 
                        onClick={() => setFilter('unread')}
                        className={`px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${filter === 'unread' ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}
                    >
                        Unread Signals ({notifications.filter(n => n.unread).length})
                    </button>
                </div>
            </div>

            {/* Notifications Grid */}
            <div className="grid gap-6">
                <AnimatePresence mode="popLayout">
                    {filtered.map((notif) => (
                        <motion.div 
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            key={notif.id} 
                            onClick={() => handleAction(notif)}
                            className={`group relative flex items-start gap-8 p-10 rounded-[48px] border transition-all duration-500 cursor-pointer ${notif.unread ? 'bg-white border-slate-100 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)]' : 'bg-slate-50/50 border-transparent opacity-60 hover:opacity-100'}`}
                        >
                            {notif.unread && (
                                <div className="absolute top-10 left-6 w-3 h-3 rounded-full bg-blue-600 animate-pulse shadow-lg shadow-blue-400"></div>
                            )}
                            
                            <div className={`w-16 h-16 rounded-[24px] flex-shrink-0 flex items-center justify-center text-3xl shadow-lg transition-transform group-hover:scale-110 ${notif.unread ? 'bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600' : 'bg-slate-200 text-slate-400'}`}>
                                {notif.type === 'Kaggle Sync' ? <Database size={28} /> : notif.icon}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center flex-wrap gap-4 mb-3">
                                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border ${notif.unread ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-slate-200 text-slate-500 border-slate-300'}`}>
                                        {notif.type}
                                    </span>
                                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <Clock size={12} /> {notif.time}
                                    </div>
                                </div>
                                <h3 className={`text-2xl font-black mb-3 tracking-tight leading-tight ${notif.unread ? 'text-slate-900 group-hover:text-blue-600' : 'text-slate-600'} transition-colors`}>{notif.title}</h3>
                                <p className={`text-base font-medium leading-relaxed max-w-3xl ${notif.unread ? 'text-slate-500' : 'text-slate-400'}`}>{notif.desc}</p>
                                
                                {notif.actionUrl && notif.unread && (
                                    <button className="mt-6 flex items-center gap-2 text-[11px] font-black text-blue-600 uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                                        Activate Node <Zap size={14} className="animate-pulse" />
                                    </button>
                                )}
                            </div>

                            <div className="flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); markAsRead(notif.id); }}
                                    className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-blue-600 transition-all shadow-xl"
                                >
                                    <CheckCircle size={20} />
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); deleteNotif(notif.id); }}
                                    className="w-12 h-12 bg-white text-rose-500 border border-slate-100 rounded-2xl flex items-center justify-center hover:bg-rose-50 transition-all shadow-md"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filtered.length === 0 && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        className="text-center py-40 bg-slate-50 rounded-[60px] border-4 border-dashed border-slate-200"
                    >
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner shadow-slate-100">
                             <span className="text-5xl grayscale opacity-30">📪</span>
                        </div>
                        <h3 className="font-black text-slate-400 uppercase tracking-[0.3em] text-xs">Neural Silence // Clear Workspace</h3>
                    </motion.div>
                )}
            </div>

            {notifications.length > 0 && (
                <div className="mt-16 text-center border-t border-slate-100 pt-12">
                    <button 
                        onClick={() => {
                            setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
                            localStorage.setItem('notefusion_notifications', '[]');
                        }}
                        className="text-[11px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-[0.4em] transition-all hover:scale-110"
                    >
                        Flush All Signal Buffers
                    </button>
                </div>
            )}
        </div>
    );
};

export default NotificationsPage;
