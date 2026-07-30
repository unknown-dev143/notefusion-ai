import React from 'react';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

const NeuralLoader: React.FC = () => {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-12">
            <div className="relative mb-8">
                {/* Outer Glow */}
                <motion.div 
                    animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute inset-0 bg-blue-500 rounded-full blur-3xl"
                />
                
                {/* Rotating Rings */}
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute -inset-4 border-2 border-dashed border-blue-200/30 rounded-full"
                />
                
                <motion.div 
                    animate={{ rotate: -360 }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                    className="absolute -inset-8 border border-blue-100/20 rounded-full"
                />

                <div className="relative bg-white p-8 rounded-[32px] shadow-2xl shadow-blue-500/10 border border-blue-50">
                    <motion.div
                        animate={{ 
                            scale: [1, 1.1, 1],
                            rotateY: [0, 180, 360]
                        }}
                        transition={{ 
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        <Brain size={48} className="text-blue-600" />
                    </motion.div>
                </div>
            </div>

            <div className="text-center">
                <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight uppercase">Cognitive Sync</h3>
                <div className="flex items-center gap-2 justify-center">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
                <p className="mt-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">Initializing Neural Analytics...</p>
            </div>
        </div>
    );
};

export default NeuralLoader;
