import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../features/auth/context/AuthContext';
import { toast } from 'react-hot-toast';

interface GamificationData {
  xp_gained: number;
  new_xp: number;
  new_level: number;
  level_up: boolean;
  streak_days: number;
  bonus_tokens: number;
  message: string;
}

const GamificationOverlay: React.FC = () => {
  const { refreshUser } = useAuth();
  const [activeUpdate, setActiveUpdate] = useState<GamificationData | null>(null);

  useEffect(() => {
    const handleUpdate = (event: any) => {
      const data = event.detail as GamificationData;
      setActiveUpdate(data);
      
      // Auto-refresh user profile to show new stats
      if (refreshUser) refreshUser();

      // Show toast message
      if (data.level_up) {
        toast.success(data.message, {
          duration: 5000,
          icon: '🎊',
          style: {
            borderRadius: '16px',
            background: '#1e1b4b',
            color: '#fff',
            fontWeight: 'bold',
            border: '2px solid #6366f1'
          }
        });
      } else if (data.bonus_tokens > 0) {
        toast.success(data.message, { icon: '🪙' });
      }

      // Hide overlay after 3 seconds
      setTimeout(() => setActiveUpdate(null), 3000);
    };

    window.addEventListener('gamification-update', handleUpdate);
    return () => window.removeEventListener('gamification-update', handleUpdate);
  }, [refreshUser]);

  return (
    <AnimatePresence>
      {activeUpdate && (
        <div className="fixed inset-0 pointer-events-none z-[9999] flex items-center justify-center overflow-hidden">
          {/* XP Float Up Animation */}
          <motion.div
            initial={{ y: 50, opacity: 0, scale: 0.5 }}
            animate={{ y: -150, opacity: 1, scale: 1.2 }}
            exit={{ y: -300, opacity: 0 }}
            className="flex flex-col items-center"
          >
            <div className="text-4xl font-black text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.8)] mb-2">
              +{activeUpdate.xp_gained} XP
            </div>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              Neural Growth
            </div>
          </motion.div>

          {/* Level Up Flash */}
          {activeUpdate.level_up && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1 }}
              className="absolute inset-0 bg-blue-500/10 pointer-events-none"
            />
          )}

          {/* Streak Badge Animation */}
          {activeUpdate.streak_days > 1 && (
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              className="absolute top-24 right-8 bg-gradient-to-br from-orange-500 to-red-600 p-4 rounded-2xl shadow-2xl border-2 border-white/20 flex items-center gap-3"
            >
              <span className="text-3xl">🔥</span>
              <div>
                <div className="text-[10px] font-black text-white/70 uppercase tracking-tighter">Current Streak</div>
                <div className="text-2xl font-black text-white">{activeUpdate.streak_days} Days</div>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
};

export default GamificationOverlay;
