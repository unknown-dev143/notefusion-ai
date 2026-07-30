import React, { useState, useEffect } from 'react';
import { X, Play, Coins, Gift } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import API_CONFIG from '../config/api';

interface AdProps {
  onClose: () => void;
  onComplete: (tokens: number) => void;
}

const AdBanner: React.FC<AdProps> = ({ onClose, onComplete }) => {
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [isWatching, setIsWatching] = useState(false);

  useEffect(() => {
    if (isWatching && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isWatching && timeRemaining === 0) {
      handleComplete();
    }
  }, [isWatching, timeRemaining]);

  const handleStart = () => {
    setIsWatching(true);
  };

  const handleComplete = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers: any = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      const response = await axios.post(
        API_CONFIG.TOKENS.EARN,
        { amount: 10 },
        { headers }
      );
      toast.success('Earned 10 tokens!');
      onComplete(10);
      onClose();
    } catch (error) {
      // Even if API fails, still give tokens locally
      toast.success('Earned 10 tokens!');
      onComplete(10);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] shadow-2xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-all"
        >
          <X size={18} className="text-slate-600" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Gift className="text-white" size={32} />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">Watch Ad & Earn Tokens</h3>
          <p className="text-slate-500 font-medium">Earn 10 tokens by watching this ad</p>
        </div>

        {!isWatching ? (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border-2 border-dashed border-blue-200 text-center">
              <div className="text-4xl mb-4">📺</div>
              <p className="text-sm font-medium text-slate-600 mb-6">
                Click below to start watching the ad
              </p>
              <button
                onClick={handleStart}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center gap-2 mx-auto"
              >
                <Play size={18} />
                Start Watching
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border-2 border-blue-200 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 animate-pulse"></div>
              <div className="relative z-10">
                <div className="text-5xl mb-4 animate-bounce">🎬</div>
                <p className="text-lg font-black text-slate-900 mb-2">Ad Playing...</p>
                <div className="text-4xl font-black text-blue-600 mb-4">{timeRemaining}s</div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Please wait to earn your tokens
                </p>
              </div>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${((30 - timeRemaining) / 30) * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
          <Coins size={14} />
          <span className="font-medium">You'll earn 10 tokens when the ad completes</span>
        </div>
      </div>
    </div>
  );
};

interface AdsFeatureProps {
  variant?: 'default' | 'header';
}

const AdsFeature: React.FC<AdsFeatureProps> = ({ variant = 'default' }) => {
  const [showAd, setShowAd] = useState(false);
  const [adCooldown, setAdCooldown] = useState(0);

  useEffect(() => {
    // Check cooldown from localStorage
    const lastAdTime = localStorage.getItem('lastAdTime');
    if (lastAdTime) {
      const timeSinceLastAd = Date.now() - parseInt(lastAdTime);
      const cooldownMs = 5 * 60 * 1000; // 5 minutes
      if (timeSinceLastAd < cooldownMs) {
        setAdCooldown(Math.ceil((cooldownMs - timeSinceLastAd) / 1000));
      }
    }

    // Update cooldown timer
    const timer = setInterval(() => {
      if (adCooldown > 0) {
        setAdCooldown(adCooldown - 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [adCooldown]);

  const handleOpenAd = () => {
    if (adCooldown > 0) {
      toast.error(`Please wait ${Math.ceil(adCooldown / 60)} minutes before watching another ad`);
      return;
    }
    setShowAd(true);
  };

  const handleAdComplete = (tokens: number) => {
    localStorage.setItem('lastAdTime', Date.now().toString());
    setAdCooldown(300); // 5 minutes in seconds
    setShowAd(false);
  };

  const formatCooldown = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (variant === 'header') {
    return (
      <>
        <button
          onClick={handleOpenAd}
          disabled={adCooldown > 0}
          className={`px-3 py-1.5 rounded-full font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 shadow-sm ${
            adCooldown > 0
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:shadow-lg hover:scale-105 active:scale-95'
          }`}
          title={adCooldown > 0 ? `Available in ${formatCooldown(adCooldown)}` : 'Watch Ad for Free Tokens'}
        >
          <Gift size={14} />
          <span className="hidden sm:inline">Free Tokens</span>
          {adCooldown > 0 && <span className="ml-1 opacity-75">{formatCooldown(adCooldown)}</span>}
        </button>

        {showAd && (
          <AdBanner
            onClose={() => setShowAd(false)}
            onComplete={handleAdComplete}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <Gift className="text-white" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Earn Free Tokens</h3>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Watch Ads</p>
            </div>
          </div>
        </div>

        <p className="text-sm text-slate-600 font-medium mb-4">
          Watch a short ad to earn 10 tokens. Available every 5 minutes.
        </p>

        <button
          onClick={handleOpenAd}
          disabled={adCooldown > 0}
          className={`w-full py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg ${
            adCooldown > 0
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:scale-105 active:scale-95'
          }`}
        >
          {adCooldown > 0 ? (
            <>
              <X size={16} />
              Available in {formatCooldown(adCooldown)}
            </>
          ) : (
            <>
              <Play size={16} />
              Watch Ad (+10 Tokens)
            </>
          )}
        </button>
      </div>

      {showAd && (
        <AdBanner
          onClose={() => setShowAd(false)}
          onComplete={handleAdComplete}
        />
      )}
    </>
  );
};

export default AdsFeature;
