import React, { useState } from 'react';
import { SimpleThemeToggle } from './SimpleThemeToggle';
import { useTheme } from '../contexts/ThemeContext';

export const FloatingThemeToggle: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { resolvedTheme } = useTheme();

  return (
    <div className="fixed bottom-24 right-6 z-50 animate-slide-up">
      <div 
        className={`transition-all duration-300 ${
          isExpanded ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
        }`}
      >
        <div className={`mb-3 px-4 py-2 rounded-full shadow-lg ${
          resolvedTheme === 'dark' 
            ? 'bg-slate-800 text-white border border-slate-700' 
            : 'bg-white text-slate-900 border border-slate-200'
        }`}>
          <p className="text-xs font-black whitespace-nowrap">
            {resolvedTheme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </p>
        </div>
      </div>
      
      <div 
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        className="flex justify-end"
      >
        <div className={`shadow-2xl rounded-full transition-all duration-300 hover:scale-110 ${
          resolvedTheme === 'dark' 
            ? 'shadow-yellow-500/30' 
            : 'shadow-blue-500/30'
        }`}>
          <SimpleThemeToggle size="large" />
        </div>
      </div>
    </div>
  );
};

export default FloatingThemeToggle;
