import React from 'react';
import { PatternInsight } from '../types';
import { SectionTag } from './Badge';
import { CheckCircle2, AlertTriangle, HelpCircle, Layers } from 'lucide-react';

interface PatternsPanelProps {
  patterns: PatternInsight[];
}

export const PatternsPanel: React.FC<PatternsPanelProps> = ({ patterns }) => {
  if (!patterns || patterns.length === 0) return null;

  return (
    <div className="bg-brand-card dark:bg-dark-card rounded-2xl border border-brand-border dark:border-dark-border p-8 space-y-8">
      <div className="flex items-center justify-between border-b border-brand-border dark:border-dark-border pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-brand-text-secondary dark:text-dark-text-secondary">
            <Layers className="w-3 h-3" />
            <span>Pattern Detection</span>
          </div>
          <h3 className="text-xl font-serif font-bold text-brand-text-primary dark:text-dark-text-primary">
            Observed Community Patterns
          </h3>
        </div>
        <SectionTag type="analysis" />
      </div>

      <div className="grid grid-cols-1 gap-6">
        {patterns.map((pattern, idx) => {
          const isEffective = pattern.type === 'effective';
          const isIneffective = pattern.type === 'ineffective';

          return (
            <div
              key={idx}
              className="space-y-4"
            >
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg shrink-0 ${
                  isEffective 
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600' 
                    : isIneffective 
                    ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600' 
                    : 'bg-brand-bg dark:bg-dark-bg text-brand-text-secondary'
                }`}>
                  {isEffective ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : isIneffective ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : (
                    <HelpCircle className="w-5 h-5" />
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-brand-text-secondary dark:text-dark-text-secondary opacity-60">
                      {isEffective
                        ? 'Effective Strategy'
                        : isIneffective
                        ? 'Common Pitfall'
                        : 'Contextual Nuance'}
                    </span>
                    <h4 className="text-lg font-serif font-bold text-brand-text-primary dark:text-dark-text-primary">{pattern.title}</h4>
                  </div>
                  
                  <p className="text-sm text-brand-text-secondary dark:text-dark-text-secondary leading-relaxed">
                    {pattern.description}
                  </p>

                  {pattern.sampleLessons && pattern.sampleLessons.length > 0 && (
                    <div className="pt-2 space-y-2">
                      {pattern.sampleLessons.map((lesson, lIdx) => (
                        <div
                          key={lIdx}
                          className="text-xs text-brand-text-primary dark:text-dark-text-primary italic font-serif border-l-2 border-brand-accent dark:border-dark-accent pl-4 py-1"
                        >
                          "{lesson}"
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <p className="text-[10px] text-brand-text-secondary dark:text-dark-text-secondary italic border-t border-brand-border dark:border-dark-border pt-4">
        *Synthesized across available records. These represent reported community observations.
      </p>
    </div>
  );
};
