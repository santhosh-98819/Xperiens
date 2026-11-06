import React from 'react';
import { Sparkles } from 'lucide-react';
import { useWritingAssist } from '../contexts/WritingAssistContext';

interface AiWritingAssistantBannerProps {
  compact?: boolean;
}

export const AiWritingAssistantBanner: React.FC<AiWritingAssistantBannerProps> = () => {
  const { isEnabled, toggleEnabled } = useWritingAssist();

  return (
    <div className="px-5 py-3 rounded-xl bg-brand-bg dark:bg-dark-sec-bg border border-brand-border dark:border-dark-border text-xs flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-brand-accent dark:bg-dark-accent text-white flex items-center justify-center shrink-0 shadow-sm">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-brand-text-primary dark:text-dark-text-primary text-xs uppercase tracking-widest">Synthesis Assistant</span>
          <span className="text-[10px] text-brand-text-secondary dark:text-dark-text-secondary font-light truncate">
            Real-time spelling, clarity and tone optimization
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={toggleEnabled}
        className={`px-4 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all cursor-pointer border ${
          isEnabled
            ? 'bg-brand-text-primary dark:bg-dark-text-primary text-brand-bg dark:text-dark-bg border-brand-text-primary dark:border-dark-text-primary'
            : 'bg-brand-card dark:bg-dark-card text-brand-text-secondary dark:text-dark-text-secondary border-brand-border dark:border-dark-border hover:border-brand-accent'
        }`}
      >
        {isEnabled ? 'Active' : 'Enable AI'}
      </button>
    </div>
  );
};
