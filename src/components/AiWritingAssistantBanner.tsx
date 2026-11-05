import React from 'react';
import { Sparkles } from 'lucide-react';
import { useWritingAssist } from '../contexts/WritingAssistContext';

interface AiWritingAssistantBannerProps {
  compact?: boolean;
}

export const AiWritingAssistantBanner: React.FC<AiWritingAssistantBannerProps> = () => {
  const { isEnabled, toggleEnabled } = useWritingAssist();

  return (
    <div className="px-3.5 py-2 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 text-xs flex items-center justify-between gap-2.5">
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-6 h-6 rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center shrink-0">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
        <div className="flex items-center gap-2 truncate">
          <span className="font-bold text-slate-900 dark:text-slate-100 text-xs shrink-0">AI Writing Assistant</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline truncate">
            • Real-time spelling, clarity & tone helper
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={toggleEnabled}
          id="global-ai-assist-toggle"
          className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
            isEnabled
              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 dark:hover:bg-rose-950 dark:hover:text-rose-300'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-600 hover:text-white'
          }`}
        >
          {isEnabled ? 'Active (Click to Turn Off)' : 'Turn ON'}
        </button>
      </div>
    </div>
  );
};

