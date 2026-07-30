import React, { useState } from 'react';

const Payment: React.FC = () => {
    const bundles = [
        { id: 'starter', name: 'Lite Scholar', tokens: 100, price: 4.99, color: 'from-blue-500 to-blue-600' },
        { id: 'pro', name: 'Master Scholar', tokens: 500, price: 14.99, color: 'from-indigo-600 to-purple-700', popular: true, bonus: '+50 Bonus' },
        { id: 'unlimited', name: 'Apex Scholar', tokens: 2000, price: 39.99, color: 'from-slate-800 to-slate-950', bonus: '+200 Bonus' },
    ];

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 animate-slide-up">
            {/* Header */}
            <div className="text-center mb-16">
                <div className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">Token Marketplace</div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">Fuel Your Intelligence</h1>
                <p className="max-w-xl mx-auto text-slate-400 font-medium">Acquire Scholar Tokens to power advanced AI synthesis, image generation, and real-time Peer-Sync sessions.</p>
                
                <div className="mt-8 flex justify-center gap-8">
                   <div className="text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Balance</p>
                      <p className="text-2xl font-black text-slate-900">850 Tokens</p>
                   </div>
                   <div className="w-px h-10 bg-slate-100"></div>
                   <div className="text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Rewards Tier</p>
                      <p className="text-2xl font-black text-blue-600">Gold Scholar</p>
                   </div>
                </div>
            </div>

            {/* Bundles */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {bundles.map((bundle) => (
                    <div key={bundle.id} className={`group relative bg-white border border-slate-100 rounded-[48px] p-10 flex flex-col transition-all hover:shadow-2xl hover:shadow-slate-200/50 ${bundle.popular ? 'ring-4 ring-blue-500/10 scale-105' : ''}`}>
                        {bundle.popular && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">Most Scalable</div>
                        )}
                        
                        <div className="mb-8">
                            <h3 className="text-xl font-black text-slate-900 mb-1">{bundle.name}</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Single Purchase</p>
                        </div>

                        <div className={`w-full aspect-video rounded-[32px] bg-gradient-to-br ${bundle.color} mb-8 flex flex-col items-center justify-center text-white relative overflow-hidden`}>
                           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform"></div>
                           <span className="text-4xl mb-2 font-black">🪙 {bundle.tokens}</span>
                           <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Scholar Tokens</span>
                           {bundle.bonus && (
                            <div className="mt-4 px-3 py-1 bg-white/20 rounded-full text-[9px] font-black uppercase">{bundle.bonus}</div>
                           )}
                        </div>

                        <div className="flex items-baseline gap-1 mb-8">
                            <span className="text-4xl font-black text-slate-900">${bundle.price}</span>
                            <span className="text-xs font-bold text-slate-400">/one-time</span>
                        </div>

                        <div className="space-y-4 mb-10 flex-1">
                            {['Neural Synthesis', 'Image Synthesis', 'Peer Session Lock', '24/7 Expert Tutor'].map(feat => (
                                <div key={feat} className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[10px]">✓</div>
                                    <span className="text-xs font-bold text-slate-600">{feat}</span>
                                </div>
                            ))}
                        </div>

                        <button className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-100 hover:bg-black group-hover:scale-105 active:scale-95 transition-all">
                           Secure Purchase
                        </button>
                    </div>
                ))}
            </div>

            <div className="mt-20 p-10 bg-slate-50 rounded-[48px] border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8">
               <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm">🛡️</div>
                  <div>
                     <h4 className="text-lg font-black text-slate-900 leading-none mb-2">Military-Grade Encryption</h4>
                     <p className="text-xs font-medium text-slate-400">All transactions are processed via Stripe with 256-bit SSL encryption.</p>
                  </div>
               </div>
               <div className="flex gap-4">
                  <div className="w-12 h-8 bg-white border border-slate-100 rounded-lg opacity-40"></div>
                  <div className="w-12 h-8 bg-white border border-slate-100 rounded-lg opacity-40"></div>
                  <div className="w-12 h-8 bg-white border border-slate-100 rounded-lg opacity-40"></div>
               </div>
            </div>
        </div>
    );
};

export default Payment;
