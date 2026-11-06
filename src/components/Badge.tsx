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
      <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-brand-text-secondary dark:text-dark-text-secondary">
        <User className="w-3 h-3" />
        <span>{label || 'Real Human Experience'}</span>
      </div>
    );
  }
  if (type === 'analysis') {
    return (
      <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-brand-accent dark:text-dark-accent">
        <Brain className="w-3 h-3" />
        <span>{label || 'AI Pattern Analysis'}</span>
      </div>
    );
  }
  if (type === 'recommendation') {
    return (
      <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-brand-accent dark:text-dark-accent">
        <Sparkles className="w-3 h-3" />
        <span>{label || 'Xperiens Recommendation'}</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-amber-600 dark:text-amber-500">
      <AlertTriangle className="w-3 h-3" />
      <span>{label || 'Uncertainties & Limits'}</span>
    </div>
  );
};

export const QualityBadge: React.FC<{ label?: QualityLabel }> = ({ label }) => {
  switch (label) {
    case 'Highly Relevant':
      return (
        <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-500">
          <ShieldCheck className="w-3 h-3" />
          Highly Relevant
        </span>
      );
    case 'Useful Experience':
      return (
        <span className="flex items-center gap-1 text-[11px] font-medium text-blue-600 dark:text-blue-500">
          <CheckCircle2 className="w-3 h-3" />
          Useful Experience
        </span>
      );
    case 'Limited Evidence':
      return (
        <span className="flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-500">
          <Clock className="w-3 h-3" />
          Limited Evidence
        </span>
      );
    case 'Conflicting Experiences':
      return (
        <span className="flex items-center gap-1 text-[11px] font-medium text-purple-600 dark:text-purple-500">
          <AlertTriangle className="w-3 h-3" />
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
        <span className="flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase text-emerald-600 dark:text-emerald-500">
          <CheckCircle2 className="w-3 h-3" />
          Worked
        </span>
      );
    case 'partially_worked':
      return (
        <span className="flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase text-amber-600 dark:text-amber-500">
          <Clock className="w-3 h-3" />
          Partially Worked
        </span>
      );
    case 'did_not_work':
      return (
        <span className="flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase text-rose-600 dark:text-rose-500">
          <XCircle className="w-3 h-3" />
          Didn't Work
        </span>
      );
  }
};

export const DemoTag: React.FC = () => {
  return (
    <span className="flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase text-amber-600 dark:text-amber-500">
      <AlertTriangle className="w-3 h-3" />
      Demo
    </span>
  );
};
