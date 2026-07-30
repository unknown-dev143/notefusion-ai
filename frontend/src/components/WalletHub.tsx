import React, { useState, useEffect } from 'react';
import { Wallet, CreditCard, X, Gift, Coins, TrendingUp, Zap } from 'lucide-react';
import axios from 'axios';
import API_CONFIG from '../config/api';
import AdsFeature from './AdsFeature';
import { Link } from 'react-router-dom';

interface TokenBalance {
  tokens: number;
  tokens_used: number;
  tokens_earned: number;
  last_reset: string;
}

const WalletHub: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [balance, setBalance] = useState<TokenBalance | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchBalance();
    }
  }, [isOpen]);

  const fetchBalance = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers: any = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      const response = await axios.get(API_CONFIG.TOKENS.BALANCE, { headers });
      setBalance(response.data);
    } catch (error) {
      // Fallback/Mock
      setBalance({
        tokens: 1250,
        tokens_used: 450,
        tokens_earned: 1700,
        last_reset: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Header Icon */}
      <button 
        onClick={() => setIsOpen(true)}
        className="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 text-orange-600 rounded-xl flex items-center justify-center shadow-sm hover:shadow-md hover:scale-105 transition-all relative group"
        title="Wallet & Rewards"
      >
        <Gift size={20} className="group-hover:rotate-12 transition-transform"/>
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
        </span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4" onClick={() => setIsOpen(false)}>
          <div className="bg-white rounded-[40px] w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto animate-slide-up" onClick={e => e.stopPropagation()}>
            
            {/* Header */}
            <div className="bg-slate-900 text-white p-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-[80px] opacity-20 -mr-20 -mt-20"></div>
               <div className="flex justify-between items-start relative z-10">
                  <div>
                    <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                       <Wallet size={24}/> Wallet & Rewards
                    </h2>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2">Manage your premium credits</p>
                  </div>
                  <button onClick={() => setIsOpen(false)} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors">
                     <X size={20}/>
                  </button>
               </div>

               {/* Balance Big Display */}
               <div className="mt-8 flex items-end gap-2 relative z-10">
                  <span className="text-5xl font-black tracking-tighter">{balance?.tokens || 0}</span>
                  <span className="text-lg font-bold text-slate-400 mb-2">credits</span>
               </div>
            </div>

            <div className="p-8 space-y-8">
               
               {/* Stats Grid */}
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-[24px] border border-slate-100">
                     <div className="flex items-center gap-2 text-emerald-600 mb-2">
                        <TrendingUp size={16}/>
                        <span className="text-[10px] font-black uppercase tracking-widest">Earned</span>
                     </div>
                     <span className="text-xl font-black text-slate-900">{balance?.tokens_earned || 0}</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-[24px] border border-slate-100">
                     <div className="flex items-center gap-2 text-blue-600 mb-2">
                        <Zap size={16}/>
                        <span className="text-[10px] font-black uppercase tracking-widest">Used</span>
                     </div>
                     <span className="text-xl font-black text-slate-900">{balance?.tokens_used || 0}</span>
                  </div>
               </div>

               {/* Ad Feature Section */}
               <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                     <Gift size={14}/> Free Rewards
                  </h3>
                  <AdsFeature variant="default" />
               </div>

               {/* Payment List Section */}
               <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                     <CreditCard size={14}/> Top Up Balance
                  </h3>
                  <div className="space-y-3">
                     {[
                        { amount: 100, price: '$0.99', popular: false },
                        { amount: 550, price: '$4.99', popular: true },
                        { amount: 1200, price: '$9.99', popular: false },
                     ].map((plan) => (
                        <button key={plan.amount} className={`w-full flex items-center justify-between p-4 rounded-[24px] border transition-all hover:scale-[1.02] active:scale-[0.98] ${plan.popular ? 'bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-200' : 'bg-white border-slate-200 hover:border-blue-500'}`}>
                           <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${plan.popular ? 'bg-white/10' : 'bg-slate-100 text-slate-600'}`}>
                                 💎
                              </div>
                              <div className="text-left">
                                 <p className="font-black text-sm">{plan.amount} Credits</p>
                                 {plan.popular && <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Most Popular</p>}
                              </div>
                           </div>
                           <span className="font-black text-sm">{plan.price}</span>
                        </button>
                     ))}
                  </div>
                  <div className="mt-8 text-center border-t border-slate-100 pt-6">
                     <button onClick={() => setIsOpen(false)} className="text-sm font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors flex items-center justify-center gap-2 mx-auto">
                        <span>←</span> Back to Dashboard
                     </button>
                  </div>
               </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WalletHub;
