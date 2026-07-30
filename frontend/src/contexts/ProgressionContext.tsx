import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Coins, Sparkles, TrendingUp } from 'lucide-react';
import { api } from '../lib/api';

interface TokenTransaction {
  id: string;
  type: 'earn' | 'spend';
  amount: number;
  reason: string;
  timestamp: number;
}

interface ProgressionContextType {
  xp: number;
  level: number;
  tokens: number;
  addXP: (amount: number, reason?: string) => void;
  addTokens: (amount: number, reason: string) => void;
  spendTokens: (amount: number, reason: string) => boolean;
  nextLevelXP: number;
  progress: number;
  tokenHistory: TokenTransaction[];
  canAfford: (amount: number) => boolean;
}

const ProgressionContext = createContext<ProgressionContextType | undefined>(undefined);

export const ProgressionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [xp, setXP] = useState<number>(() => {
    const saved = localStorage.getItem('ema_xp');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [tokens, setTokens] = useState<number>(() => {
    const saved = localStorage.getItem('ema_tokens');
    return saved ? parseInt(saved, 10) : 100; // Start with 100 tokens
  });

  const [tokenHistory, setTokenHistory] = useState<TokenTransaction[]>(() => {
    const saved = localStorage.getItem('ema_token_history');
    return saved ? JSON.parse(saved) : [];
  });

  const level = Math.floor(xp / 1000) + 1;
  const nextLevelXP = level * 1000;
  const currentLevelStartXP = (level - 1) * 1000;
  const progress = ((xp - currentLevelStartXP) / 1000) * 100;

  useEffect(() => {
    localStorage.setItem('ema_xp', xp.toString());
  }, [xp]);

  useEffect(() => {
    localStorage.setItem('ema_tokens', tokens.toString());
  }, [tokens]);

  useEffect(() => {
    localStorage.setItem('ema_token_history', JSON.stringify(tokenHistory.slice(-50))); // Keep last 50 transactions
  }, [tokenHistory]);

  const fetchTokens = useCallback(async () => {
    try {
      if (localStorage.getItem('token')) {
        const response = await api.get('/tokens/balance');
        if (response?.data?.tokens !== undefined) {
          setTokens(response.data.tokens);
        }
      }
    } catch (error) {
      console.error('Failed to sync tokens from server', error);
    }
  }, []);

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);


  const addTokens = (amount: number, reason: string) => {
    setTokens(prev => prev + amount);
    
    const transaction: TokenTransaction = {
      id: `${Date.now()}-${Math.random()}`,
      type: 'earn',
      amount,
      reason,
      timestamp: Date.now()
    };
    
    setTokenHistory(prev => [...prev, transaction]);

    toast.success(
      <div className="flex items-center gap-2">
        <Coins className="text-yellow-400" size={20} />
        <span>+{amount} Neural Tokens</span>
      </div>,
      {
        duration: 3000,
        style: {
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
          color: '#fff',
          fontWeight: 'bold',
          border: '2px solid rgba(255,255,255,0.3)'
        }
      }
    );
    
    // Also try to sync with backend
    if (localStorage.getItem('token')) {
      api.post(`/tokens/earn?amount=${amount}`).catch(err => console.error("Could not sync tokens to server", err));
    }
  };

  const spendTokens = (amount: number, reason: string): boolean => {
    if (tokens < amount) {
      toast.error('Insufficient Neural Tokens', {
        icon: '⚠️',
        duration: 3000,
        style: {
          borderRadius: '16px',
          background: '#ef4444',
          color: '#fff',
          fontWeight: 'bold'
        }
      });
      return false;
    }

    setTokens(prev => prev - amount);
    
    const transaction: TokenTransaction = {
      id: `${Date.now()}-${Math.random()}`,
      type: 'spend',
      amount,
      reason,
      timestamp: Date.now()
    };
    
    setTokenHistory(prev => [...prev, transaction]);

    toast.success(
      <div className="flex items-center gap-2">
        <Sparkles className="text-blue-400" size={20} />
        <span>{reason} activated!</span>
      </div>,
      {
        duration: 3000,
        style: {
          borderRadius: '16px',
          background: '#3b82f6',
          color: '#fff',
          fontWeight: 'bold'
        }
      }
    );

    // Also try to sync with backend
    if (localStorage.getItem('token')) {
      api.post(`/tokens/use?amount=${amount}`).catch(err => console.error("Could not sync token usage to server", err));
    }

    return true;
  };

  const canAfford = (amount: number): boolean => {
    return tokens >= amount;
  };

  const addXP = (amount: number, reason?: string) => {
    const oldLevel = Math.floor(xp / 1000) + 1;
    const newXP = xp + amount;
    const newLevel = Math.floor(newXP / 1000) + 1;
    
    setXP(newXP);
    
    if (newLevel > oldLevel) {
      const tokenReward = newLevel * 10; // 10 tokens per level, scaling with level
      setTokens(prev => prev + tokenReward);
      
      toast.success(
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-emerald-400" size={24} />
            <span className="font-black text-lg">Level {newLevel} Reached!</span>
          </div>
          <div className="text-sm opacity-90">Ema's intelligence phase upgraded</div>
          <div className="flex items-center gap-2 mt-1 text-yellow-300">
            <Coins size={16} />
            <span className="font-bold">+{tokenReward} Neural Tokens</span>
          </div>
        </div>,
        {
          icon: '🚀',
          duration: 6000,
          style: {
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#fff',
            fontWeight: 'bold',
            border: '2px solid rgba(16, 185, 129, 0.3)',
            padding: '16px'
          }
        }
      );
    }
  };

  return (
    <ProgressionContext.Provider value={{ 
      xp, 
      level, 
      tokens,
      addXP, 
      addTokens,
      spendTokens,
      nextLevelXP, 
      progress,
      tokenHistory,
      canAfford
    }}>
      {children}
    </ProgressionContext.Provider>
  );
};

export const useProgression = () => {
  const context = useContext(ProgressionContext);
  if (context === undefined) {
    throw new Error('useProgression must be used within a ProgressionProvider');
  }
  return context;
};
