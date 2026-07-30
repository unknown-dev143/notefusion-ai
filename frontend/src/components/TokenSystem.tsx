import React, { useState, useEffect } from 'react';
import { Coins, Zap, TrendingUp, Gift } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import API_CONFIG from '../config/api';

interface TokenBalance {
  tokens: number;
  tokens_used: number;
  tokens_earned: number;
  last_reset: string;
}

const TokenSystem: React.FC = () => {
  const [balance, setBalance] = useState<TokenBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers: any = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      const response = await axios.get(API_CONFIG.TOKENS.BALANCE, { headers });
      setBalance(response.data);
    } catch (error) {
      // If not authenticated, show default balance
      setBalance({
        tokens: 100,
        tokens_used: 0,
        tokens_earned: 0,
        last_reset: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const earnTokens = async (amount: number) => {
    try {
      const token = localStorage.getItem('token');
      const headers: any = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      await axios.post(
        API_CONFIG.TOKENS.EARN,
        { amount },
        { headers }
      );
      toast.success(`Earned ${amount} tokens!`);
      fetchBalance();
    } catch (error) {
      toast.error('Failed to earn tokens');
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 bg-white rounded-2xl border border-slate-100">
        <div className="animate-pulse">Loading tokens...</div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
            <Coins className="text-white" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">Token Balance</h3>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Your Credits</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-slate-900">{balance?.tokens || 0}</div>
          <p className="text-xs font-bold text-slate-500">tokens</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white/60 rounded-xl p-3 border border-white/80">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="text-emerald-600" size={14} />
            <span className="text-xs font-black text-slate-600 uppercase tracking-widest">Earned</span>
          </div>
          <div className="text-xl font-black text-slate-900">{balance?.tokens_earned || 0}</div>
        </div>
        <div className="bg-white/60 rounded-xl p-3 border border-white/80">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="text-blue-600" size={14} />
            <span className="text-xs font-black text-slate-600 uppercase tracking-widest">Used</span>
          </div>
          <div className="text-xl font-black text-slate-900">{balance?.tokens_used || 0}</div>
        </div>
      </div>


    </div>
  );
};

export default TokenSystem;
