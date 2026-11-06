import React from 'react';
import { EvidenceBreakdown } from '../types';
import { ShieldCheck, Info, CheckCircle2, Clock, XCircle, BarChart3, AlertCircle, Sparkles, Users } from 'lucide-react';

interface EvidencePanelProps {
  evidence: EvidenceBreakdown;
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({ evidence }) => {
  const isZeroCommunity = evidence.isAiGuidanceOnly || (evidence.totalRealAnalyzed ?? evidence.totalAnalyzed ?? 0) === 0;
  const total = evidence.totalRealAnalyzed ?? evidence.totalAnalyzed ?? 0;
  const posPct = total > 0 ? Math.round((evidence.positiveOutcomes / total) * 100) : 0;
  const mixPct = total > 0 ? Math.round((evidence.mixedOutcomes / total) * 100) : 0;
  const unsPct = total > 0 ? Math.round((evidence.unsuccessfulOutcomes / total) * 100) : 0;

  if (isZeroCommunity) {
    return (
      <div className="bg-brand-card dark:bg-dark-card rounded-2xl border border-brand-border dark:border-dark-border p-8 space-y-8">
        <div className="flex items-center justify-between border-b border-brand-border dark:border-dark-border pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-brand-text-secondary dark:text-dark-text-secondary">
              <BarChart3 className="w-3 h-3" />
              <span>Evidence Integrity</span>
            </div>
            <h3 className="text-xl font-serif font-bold text-brand-text-primary dark:text-dark-text-primary">
              Data Grounding
            </h3>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-amber-600 dark:text-amber-500">
            <Users className="w-3 h-3" />
            <span>0 Real Records</span>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/50 space-y-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <h4 className="text-sm font-bold text-brand-text-primary dark:text-dark-text-primary">Pioneering Category</h4>
          </div>
          <p className="text-sm text-brand-text-secondary dark:text-dark-text-secondary leading-relaxed italic font-serif">
            Because no real human experiences exist in the database for this scenario yet, the recommendation is labeled <strong className="text-brand-text-primary dark:text-dark-text-primary">GENERAL AI GUIDANCE</strong>.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-brand-bg dark:bg-dark-bg border border-brand-border dark:border-dark-border rounded-lg space-y-1 opacity-40">
            <span className="text-[9px] font-bold tracking-widest uppercase text-brand-text-secondary dark:text-dark-text-secondary">Positive</span>
            <div className="text-xl font-serif font-bold text-brand-text-primary dark:text-dark-text-primary">0%</div>
          </div>
          <div className="p-4 bg-brand-bg dark:bg-dark-bg border border-brand-border dark:border-dark-border rounded-lg space-y-1 opacity-40">
            <span className="text-[9px] font-bold tracking-widest uppercase text-brand-text-secondary dark:text-dark-text-secondary">Unsuccessful</span>
            <div className="text-xl font-serif font-bold text-brand-text-primary dark:text-dark-text-primary">0%</div>
          </div>
        </div>

        <div className="flex items-start gap-3 pt-4 border-t border-brand-border dark:border-dark-border">
          <Info className="w-4 h-4 text-brand-text-secondary dark:text-dark-text-secondary opacity-40 shrink-0 mt-0.5" />
          <p className="text-[10px] text-brand-text-secondary dark:text-dark-text-secondary leading-relaxed">
            <strong className="text-brand-text-primary dark:text-dark-text-primary">Integrity Principle:</strong> Xperiens never invents fake community numbers. Your reported outcome will become the first verified record here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-card dark:bg-dark-card rounded-2xl border border-brand-border dark:border-dark-border p-8 space-y-8">
      <div className="flex items-center justify-between border-b border-brand-border dark:border-dark-border pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-brand-text-secondary dark:text-dark-text-secondary">
            <BarChart3 className="w-3 h-3" />
            <span>Verification Base</span>
          </div>
          <h3 className="text-xl font-serif font-bold text-brand-text-primary dark:text-dark-text-primary">
            Empirical Grounding
          </h3>
        </div>
        
        <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-emerald-600 dark:text-emerald-500">
          <ShieldCheck className="w-3 h-3" />
          <span>{evidence.confidencePercentage}% Confidence</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 bg-brand-bg dark:bg-dark-bg border border-brand-border dark:border-dark-border rounded-xl space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold tracking-widest uppercase text-brand-text-secondary dark:text-dark-text-secondary opacity-60">Verified Records</span>
            <div className="text-3xl font-serif font-bold text-brand-text-primary dark:text-dark-text-primary">{total}</div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-brand-accent dark:text-dark-accent" />
            <span className="text-[11px] font-medium text-brand-text-secondary dark:text-dark-text-secondary">Real Community Contributors</span>
          </div>
        </div>

        <div className="p-6 bg-brand-bg dark:bg-dark-bg border border-brand-border dark:border-dark-border rounded-xl flex flex-col justify-between">
          <div className="space-y-1">
             <span className="text-[10px] font-bold tracking-widest uppercase text-brand-text-secondary dark:text-dark-text-secondary opacity-60">Outcome Distribution</span>
             <div className="h-2 w-full bg-brand-border dark:bg-dark-border rounded-full overflow-hidden flex mt-3">
               <div style={{ width: `${posPct}%` }} className="bg-emerald-500 h-full transition-all" />
               <div style={{ width: `${mixPct}%` }} className="bg-amber-400 h-full transition-all" />
               <div style={{ width: `${unsPct}%` }} className="bg-rose-400 h-full transition-all" />
             </div>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-bold text-brand-text-primary dark:text-dark-text-primary uppercase tracking-wider">{posPct}% Positive</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-[10px] font-bold text-brand-text-primary dark:text-dark-text-primary uppercase tracking-wider">{mixPct}% Mixed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              <span className="text-[10px] font-bold text-brand-text-primary dark:text-dark-text-primary uppercase tracking-wider">{unsPct}% Failed</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-3 pt-4 border-t border-brand-border dark:border-dark-border">
        <Info className="w-4 h-4 text-brand-text-secondary dark:text-dark-text-secondary opacity-40 shrink-0 mt-0.5" />
        <p className="text-[10px] text-brand-text-secondary dark:text-dark-text-secondary leading-relaxed">
          <strong className="text-brand-text-primary dark:text-dark-text-primary">Caveat:</strong> {evidence.disclaimer} Xperiens synthesizes historical patterns rather than predicting guaranteed outcomes.
        </p>
      </div>
    </div>
  );
};
