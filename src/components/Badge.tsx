import React from 'react';
import { QualityLabel, OutcomeStatus } from '../types';
import { Sparkles, User, Brain, AlertTriangle, ShieldCheck, CheckCircle2, XCircle, Clock } from 'lucide-react';

export interface BadgeProps {
  type?: 'experience' | 'analysis' | 'recommendation' | 'uncertainty' | 'demo';
  className?: string;
  children?: React.ReactNode;
}

export const SectionTag: React.FC<{
  type: 'human' | 'analysis' | 'recommendation' | 'uncertainty';
  label?: string;
}> = ({ type, label }) => {
  if (type === 'human') {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 dark:bg-sky-950/70 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
        <User className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
        <span>{label || 'REAL HUMAN EXPERIENCE'}</span>
      </div>
    );
  }
  if (type === 'analysis') {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
        <Brain className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
        <span>{label || 'AI PATTERN ANALYSIS'}</span>
      </div>
    );
  }
  if (type === 'recommendation') {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
        <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span>{label || 'XPERIENS RECOMMENDATION'}</span>
      </div>
    );
  }
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
      <span>{label || 'UNCERTAINTIES & LIMITS'}</span>
    </div>
  );
};

export const QualityBadge: React.FC<{ label?: QualityLabel }> = ({ label }) => {
  switch (label) {
    case 'Highly Relevant':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          Highly Relevant
        </span>
      );
    case 'Useful Experience':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          <CheckCircle2 className="w-3 h-3 text-blue-600 dark:text-blue-400" />
          Useful Experience
        </span>
      );
    case 'Limited Evidence':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
          Limited Evidence
        </span>
      );
    case 'Conflicting Experiences':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
          <AlertTriangle className="w-3 h-3 text-purple-600 dark:text-purple-400" />
          Conflicting Experiences
        </span>
      );
    default:
      return null;
  }
};

export const OutcomeBadge: React.FC<{ status: OutcomeStatus }> = ({ status }) => {
  switch (status) {
    case 'worked':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          WORKED
        </span>
      );
    case 'partially_worked':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          PARTIALLY WORKED
        </span>
      );
    case 'did_not_work':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
          <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
          DIDN'T WORK
        </span>
      );
  }
};

export const DemoTag: React.FC = () => {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
      DEMO EXPERIENCE
    </span>
  );
};
