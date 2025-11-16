import React, { useState } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactElement;
  position?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
    right: 'left-full top-1/2 -translate-y-1/2 ml-1.5',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-1.5',
    left: 'right-full top-1/2 -translate-y-1/2 mr-1.5',
  } as const;

  const arrowClasses = {
    top: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2',
    right: 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2',
    bottom: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2',
    left: 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2',
  } as const;

  return (
    <div 
      className={`relative inline-block group ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div 
          className={`
            absolute z-50 px-3 py-1.5 text-sm text-white bg-gray-800 rounded whitespace-nowrap
            shadow-lg animate-fade-in
            ${positionClasses[position]}
            transition-opacity duration-150 ease-in-out
          `}
          role="tooltip"
        >
          {content}
          <div 
            className={`
              absolute w-3 h-3 bg-gray-800 transform rotate-45 -z-10
              ${arrowClasses[position]}
            `}
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );
};

export default Tooltip;
