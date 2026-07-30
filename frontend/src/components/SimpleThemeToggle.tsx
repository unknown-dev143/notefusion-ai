import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface SimpleThemeToggleProps {
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const SimpleThemeToggle: React.FC<SimpleThemeToggleProps> = ({ 
  showLabel = false,
  size = 'medium' 
}) => {
  const { resolvedTheme, toggleTheme } = useTheme();
  
  const sizeClasses = {
    small: 'w-8 h-8 text-lg',
    medium: 'w-10 h-10 text-xl',
    large: 'w-12 h-12 text-2xl'
  };

  return (
    <button
      onClick={toggleTheme}
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${
        resolvedTheme === 'dark' 
          ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700 shadow-lg shadow-yellow-500/20' 
          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 shadow-md'
      }`}
      title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
      aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {resolvedTheme === 'dark' ? '☀️' : '🌙'}
      {showLabel && (
        <span className="ml-2 text-sm font-bold">
          {resolvedTheme === 'dark' ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  );
};

export default SimpleThemeToggle;
