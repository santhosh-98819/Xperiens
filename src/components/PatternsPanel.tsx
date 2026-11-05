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
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-600" />
          <h3 className="font-semibold text-base text-slate-900">
            Patterns Found Across Experiences
          </h3>
        </div>
        <SectionTag type="analysis" label="AI PATTERNS" />
      </div>

      <p className="text-xs text-slate-500 italic">
        *Synthesized across available records. Note: These represent reported community observations, not universal laws.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {patterns.map((pattern, idx) => {
          const isEffective = pattern.type === 'effective';
          const isIneffective = pattern.type === 'ineffective';

          return (
            <div
              key={idx}
              className={`p-4 rounded-xl border transition-all ${
                isEffective
                  ? 'bg-emerald-50/40 border-emerald-200/80 text-emerald-950'
                  : isIneffective
                  ? 'bg-amber-50/40 border-amber-200/80 text-amber-950'
                  : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex items-start gap-2.5 mb-2">
                {isEffective ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                ) : isIneffective ? (
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <HelpCircle className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider block opacity-75">
                    {isEffective
                      ? 'Commonly Reported Approaches'
                      : isIneffective
                      ? 'Less Successful Approaches & Pitfalls'
                      : 'Observed Nuances'}
                  </span>
                  <h4 className="text-sm font-semibold mt-0.5">{pattern.title}</h4>
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed pl-7 mb-2.5">
                {pattern.description}
              </p>

              {pattern.sampleLessons && pattern.sampleLessons.length > 0 && (
                <div className="pl-7 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Key Reported Takeaways:
                  </span>
                  {pattern.sampleLessons.map((lesson, lIdx) => (
                    <div
                      key={lIdx}
                      className="text-xs text-slate-600 italic bg-white/70 p-2 rounded border border-slate-200/50"
                    >
                      "{lesson}"
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
