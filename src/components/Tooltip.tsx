import React, { useState, useRef } from 'react';
import { HelpCircle, Info } from 'lucide-react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  showIcon?: boolean;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  className = '',
  showIcon = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const showTooltip = () => {
    timeoutRef.current = window.setTimeout(() => {
      setIsVisible(true);
    }, 150);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-slate-900 border-x-transparent border-b-transparent border-4',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-slate-900 border-x-transparent border-t-transparent border-4',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-slate-900 border-y-transparent border-r-transparent border-4',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-slate-900 border-y-transparent border-l-transparent border-4',
  };

  return (
    <div
      className={`relative inline-flex items-center group ${className}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      tabIndex={0}
      role="tooltip"
      aria-label={content}
    >
      {children}
      {showIcon && (
        <Info className="w-3.5 h-3.5 ml-1 text-slate-400 hover:text-indigo-600 cursor-help flex-shrink-0" />
      )}

      {isVisible && (
        <div
          className={`absolute z-50 px-2.5 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-100 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs rounded-lg shadow-xl whitespace-normal max-w-xs pointer-events-none transition-all duration-150 animate-fadeIn border border-slate-200 dark:border-slate-700/80 leading-tight ${positionClasses[position]}`}
          style={{ width: 'max-content', maxWidth: '240px' }}
        >
          {content}
          <div className={`absolute w-0 h-0 dark:hidden ${arrowClasses[position]}`} />
          <div className={`absolute w-0 h-0 hidden dark:block ${arrowClasses[position].replace(/border-(t|b|l|r)-slate-900/g, 'border-$1-slate-800')}`} />
        </div>
      )}
    </div>
  );
};

export const InfoTooltip: React.FC<{ text: string; className?: string }> = ({ text, className = '' }) => {
  return (
    <Tooltip content={text} position="top" className={className}>
      <HelpCircle className="w-3.5 h-3.5 text-slate-400 hover:text-indigo-600 cursor-help inline ml-1 transition-colors" />
    </Tooltip>
  );
};
