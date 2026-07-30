import React from 'react';

interface AnimatedLogoProps {
  className?: string;
  size?: number;
}

const AnimatedLogo: React.FC<AnimatedLogoProps> = ({ className = '', size = 48 }) => {
  return (
    <div 
      className={`relative flex items-center justify-center ${className}`} 
      style={{ width: size, height: size }}
    >
      {/* Outer Glow */}
      <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-logo-pulse"></div>
      
      {/* Spinning Outer Ring */}
      <svg 
        viewBox="0 0 100 100" 
        className="absolute inset-0 w-full h-full animate-logo-spin"
      >
        <circle 
          cx="50" 
          cy="50" 
          r="45" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeDasharray="20 10" 
          className="text-blue-500/30"
        />
      </svg>
      
      {/* Dynamic Fusion Core */}
      <div className="relative w-[60%] h-[60%] rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 shadow-lg flex items-center justify-center overflow-hidden group">
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="text-white font-black text-xl select-none">NF</div>
        
        {/* Orbital Particle */}
        <div className="absolute w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_white] animate-orbit"></div>
      </div>
      
      {/* Reflection Shine */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden rounded-full">
        <div className="absolute -top-[100%] -left-[100%] w-[300%] h-[300%] bg-gradient-to-br from-transparent via-white/10 to-transparent rotate-45 transform translate-x-[-100%] translate-y-[-100%] animate-[shine_8s_infinite]"></div>
      </div>
    </div>
  );
};

export default AnimatedLogo;
