import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProgression } from '../contexts/ProgressionContext';
import { Coins, Sparkles, Zap, Brain, Flame, Star, Lock, Check, TrendingUp, Gift } from 'lucide-react';
import toast from 'react-hot-toast';

interface TokenItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: React.ReactNode;
  color: string;
  category: 'boost' | 'feature' | 'cosmetic';
  action: () => void;
}

const TokenShop: React.FC = () => {
  const { tokens, spendTokens, addTokens, canAfford, addXP } = useProgression();
  const [activeCategory, setActiveCategory] = useState<'boost' | 'feature' | 'cosmetic'>('boost');

  const shopItems: TokenItem[] = [
    {
      id: 'xp-boost-small',
      name: 'XP Boost (Small)',
      description: 'Instantly gain 500 XP',
      cost: 50,
      icon: <TrendingUp size={24} />,
      color: 'from-blue-500 to-cyan-500',
      category: 'boost',
      action: () => {
        addXP(500, 'Purchased Small XP Boost');
        toast.success('Gained 500 XP!');
      }
    },
    {
      id: 'xp-boost-large',
      name: 'XP Boost (Large)',
      description: 'Instantly gain 2000 XP',
      cost: 150,
      icon: <Star size={24} />,
      color: 'from-purple-500 to-pink-500',
      category: 'boost',
      action: () => {
        addXP(2000, 'Purchased Large XP Boost');
        toast.success('Gained 2000 XP!');
      }
    },
    {
      id: 'ai-priority',
      name: 'AI Priority Mode',
      description: 'Get faster AI responses for 24 hours',
      cost: 100,
      icon: <Zap size={24} />,
      color: 'from-yellow-500 to-orange-500',
      category: 'feature',
      action: () => {
        toast.success('AI Priority Mode Enabled!');
      }
    },
    {
      id: 'neural-fusion-boost',
      name: 'Neural Fusion Boost',
      description: 'Enhanced synthesis quality for 10 fusions',
      cost: 200,
      icon: <Flame size={24} />,
      color: 'from-orange-500 to-red-500',
      category: 'feature',
      action: () => {
        toast.success('Neural Fusion Boost Enabled!');
      }
    },
    {
      id: 'ema-theme-dark',
      name: 'Ema Dark Theme',
      description: 'Unlock premium dark theme for Ema',
      cost: 300,
      icon: <Sparkles size={24} />,
      color: 'from-slate-700 to-slate-900',
      category: 'cosmetic',
      action: () => {
        toast.success('Premium Dark Theme Unlocked!');
      }
    },
    {
      id: 'daily-token-gift',
      name: 'Daily Token Gift',
      description: 'Claim your free daily tokens!',
      cost: 0,
      icon: <Gift size={24} />,
      color: 'from-emerald-500 to-teal-500',
      category: 'boost',
      action: () => {
        const dailyBonus = 25;
        const lastClaim = localStorage.getItem('last_daily_claim');
        const today = new Date().toDateString();
        
        if (lastClaim === today) {
          toast.error('Already claimed today! Come back tomorrow.', {
            icon: '⏰',
            duration: 3000
          });
          return;
        }
        
        addTokens(dailyBonus, 'Daily Login Bonus');
        localStorage.setItem('last_daily_claim', today);
      }
    }
  ];

  const filteredItems = shopItems.filter(item => item.category === activeCategory);

  const handlePurchase = (item: TokenItem) => {
    if (item.cost === 0) {
      item.action();
      return;
    }

    if (spendTokens(item.cost, item.name)) {
      item.action();
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 animate-slide-up">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl shadow-xl">
            <Coins size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Neural Token Shop</h1>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">
              Premium features powered by your achievements
            </p>
          </div>
        </div>

        {/* Token Balance */}
        <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-amber-900 uppercase tracking-widest mb-2">Your Balance</p>
              <div className="flex items-center gap-3">
                <Coins size={40} className="text-white" />
                <span className="text-5xl font-black text-white">{tokens}</span>
                <span className="text-lg font-bold text-amber-100">Neural Tokens</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-black text-amber-900 uppercase tracking-widest mb-2">Earn More</p>
              <p className="text-sm font-bold text-white">Level up Ema • Complete tasks • Daily bonuses</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-8 bg-slate-100 p-2 rounded-2xl">
        {[
          { id: 'boost' as const, label: 'Boosts', icon: <TrendingUp size={16} /> },
          { id: 'feature' as const, label: 'Features', icon: <Brain size={16} /> },
          { id: 'cosmetic' as const, label: 'Cosmetics', icon: <Sparkles size={16} /> }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
              activeCategory === cat.id
                ? 'bg-white text-blue-600 shadow-lg'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {cat.icon}
            {cat.label}
          </button>
        ))}
      </div>

      {/* Shop Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="wait">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className={`group relative bg-white border border-slate-100 rounded-3xl p-6 hover:shadow-2xl transition-all duration-300 ${
                !canAfford(item.cost) && item.cost > 0 ? 'opacity-50' : ''
              }`}
            >
              {/* Icon */}
              <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                {item.icon}
              </div>

              {/* Content */}
              <h3 className="text-lg font-black text-slate-900 mb-2">{item.name}</h3>
              <p className="text-sm text-slate-500 font-medium mb-4 leading-relaxed">{item.description}</p>

              {/* Price & Action */}
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <Coins size={20} className="text-yellow-500" />
                  <span className="text-2xl font-black text-slate-900">
                    {item.cost === 0 ? 'FREE' : item.cost}
                  </span>
                </div>
                <button
                  onClick={() => handlePurchase(item)}
                  disabled={!canAfford(item.cost) && item.cost > 0}
                  className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                    canAfford(item.cost) || item.cost === 0
                      ? 'bg-slate-900 text-white hover:bg-blue-600 hover:scale-105 active:scale-95'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {item.cost === 0 ? 'Claim' : canAfford(item.cost) ? 'Purchase' : 'Locked'}
                </button>
              </div>

              {/* Lock Overlay */}
              {!canAfford(item.cost) && item.cost > 0 && (
                <div className="absolute top-4 right-4">
                  <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center">
                    <Lock size={16} className="text-white" />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4 opacity-20">🏪</div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">Coming Soon</h3>
          <p className="text-slate-400 font-medium">More items will be added to this category soon!</p>
        </div>
      )}
    </div>
  );
};

export default TokenShop;
