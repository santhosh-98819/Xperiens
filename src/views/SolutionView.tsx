import React, { useState } from 'react';
import { SolutionAnalysis, Experience } from '../types';
import { ExperienceCard } from '../components/ExperienceCard';
import { EvidencePanel } from '../components/EvidencePanel';
import { PatternsPanel } from '../components/PatternsPanel';
import { SectionTag } from '../components/Badge';
import { ReportOutcomeModal } from '../components/ReportOutcomeModal';
import { Tooltip } from '../components/Tooltip';
import { saveSolutionLocally, isSolutionSaved } from '../services/api';
import {
  Sparkles,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  ArrowLeft,
  Share2,
  ShieldAlert,
  CheckSquare,
  PlayCircle,
  HelpCircle,
  BrainCircuit,
  User,
} from 'lucide-react';
import { ViewMode } from '../App';

interface SolutionViewProps {
  solution: SolutionAnalysis;
  onBack: () => void;
  onNavigate: (view: ViewMode) => void;
}

export const SolutionView: React.FC<SolutionViewProps> = ({ solution, onBack, onNavigate }) => {
  const [isSaved, setIsSaved] = useState(() => isSolutionSaved(solution.id));
  const [outcomeModalOpen, setOutcomeModalOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const isCompleted = !!solution.outcomeReport;

  const handleToggleSave = () => {
    const bookmarked = saveSolutionLocally({
      ...solution,
    });
    setIsSaved(bookmarked);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 space-y-16 animate-fadeIn pb-32">
      {/* Top Header / Action Bar */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-brand-border dark:border-dark-border pb-8">
        <div className="space-y-4">
          <button
            onClick={onBack}
            className="group flex items-center gap-2 text-xs font-bold text-brand-text-secondary dark:text-dark-text-secondary hover:text-brand-text-primary dark:hover:text-dark-text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Modify Situation
          </button>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-brand-accent dark:text-dark-accent">
              <BrainCircuit className="w-3 h-3" />
              <span>AI-Driven Analysis</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-serif font-bold text-brand-text-primary dark:text-dark-text-primary">Actionable Wisdom</h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-brand-text-primary dark:text-dark-text-primary bg-brand-bg dark:bg-dark-bg border border-brand-border dark:border-dark-border rounded-lg hover:bg-brand-border/10 dark:hover:bg-dark-border/10 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            {copySuccess ? 'Link Copied' : 'Share Plan'}
          </button>

          <button
            onClick={handleToggleSave}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg border transition-all ${
              isSaved
                ? 'bg-brand-accent dark:bg-dark-accent text-white dark:text-dark-bg border-brand-accent dark:border-dark-accent'
                : 'text-brand-text-primary dark:text-dark-text-primary bg-brand-bg dark:bg-dark-bg border-brand-border dark:border-dark-border hover:bg-brand-border/10'
            }`}
          >
            {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4 text-brand-text-secondary" />}
            {isSaved ? 'Saved to Plans' : 'Save Plan'}
          </button>

          <button
            onClick={() => setOutcomeModalOpen(true)}
            className="flex items-center gap-2 px-6 py-2 text-xs font-bold text-white dark:text-dark-bg bg-brand-text-primary dark:bg-dark-text-primary rounded-lg hover:opacity-90 transition-opacity"
          >
            <CheckSquare className="w-4 h-4" />
            {isCompleted ? 'Update Outcome' : 'Report Result'}
          </button>
        </div>
      </header>

      {/* Safety Notice */}
      {solution.safetyNotice && (
        <div className="p-6 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200 text-sm flex items-start gap-4 italic font-serif">
          <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0" />
          <p className="leading-relaxed">{solution.safetyNotice}</p>
        </div>
      )}

      {/* ==========================================
          SECTION 1: SITUATION RECAP
         ========================================== */}
      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-[10px] font-bold tracking-widest uppercase text-brand-text-secondary dark:text-dark-text-secondary">Diagnosed Situation</h2>
          <div className="p-8 bg-brand-card dark:bg-dark-card border border-brand-border dark:border-dark-border rounded-2xl italic font-serif text-xl lg:text-2xl text-brand-text-primary dark:text-dark-text-primary leading-relaxed">
            "{solution.problemSummary}"
          </div>
        </div>

        {solution.detectedFactors && solution.detectedFactors.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {solution.detectedFactors.map((factor, idx) => (
              <div key={idx} className="p-4 bg-brand-bg dark:bg-dark-bg border border-brand-border dark:border-dark-border rounded-lg space-y-1">
                <span className="text-[9px] font-bold tracking-widest uppercase text-brand-text-secondary dark:text-dark-text-secondary">Critical Factor</span>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-brand-text-primary dark:text-dark-text-primary">{factor.factor}</span>
                  <span className={`text-[9px] font-black uppercase ${factor.impact === 'high' ? 'text-rose-500' : 'text-brand-accent'}`}>
                    {factor.impact}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ==========================================
          SECTION 2: COMMUNITY EXPERIENCE (DISTINCT FROM AI)
         ========================================== */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-brand-border dark:border-dark-border pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-brand-text-secondary dark:text-dark-text-secondary">
              <User className="w-3 h-3" />
              <span>Collective Wisdom</span>
            </div>
            <h2 className="text-2xl font-serif font-bold text-brand-text-primary dark:text-dark-text-primary">Relevant Human Experiences</h2>
          </div>
          <p className="text-xs text-brand-text-secondary dark:text-dark-text-secondary font-medium">
            Found {solution.relevantExperiences.length} historical records
          </p>
        </div>

        {solution.relevantExperiences.length === 0 ? (
          <div className="py-16 px-6 text-center bg-brand-bg dark:bg-dark-bg border border-brand-border dark:border-dark-border rounded-2xl space-y-4">
            <HelpCircle className="w-10 h-10 text-brand-text-secondary dark:text-dark-text-secondary mx-auto opacity-30" />
            <div className="space-y-2">
              <h3 className="font-serif font-bold text-brand-text-primary dark:text-dark-text-primary">No community records found yet</h3>
              <p className="text-sm text-brand-text-secondary dark:text-dark-text-secondary max-w-md mx-auto">
                You're pioneering this category. The AI guidance below is based on first-principles, but your trial will become the first real human record.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {solution.relevantExperiences.map((exp) => (
              <ExperienceCard key={exp.id} experience={exp} showRelevance={true} />
            ))}
          </div>
        )}
      </section>

      {/* ==========================================
          SECTION 3: AI RECOMMENDATION (VISUALLY DISTINCT)
         ========================================== */}
      <section className="bg-dark-bg text-dark-text-primary rounded-3xl p-8 lg:p-12 space-y-12 shadow-2xl relative overflow-hidden">
        {/* Subtle background motif */}
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Sparkles className="w-64 h-64" />
        </div>

        <div className="space-y-8 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-white/10 pb-8">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-dark-accent/10 border border-dark-accent/20 rounded-full text-[10px] font-bold tracking-widest uppercase text-dark-accent">
                <BrainCircuit className="w-3 h-3" />
                <span>AI Synthesis Plan</span>
              </div>
              <h2 className="text-3xl font-serif font-bold">Recommended Strategy</h2>
            </div>
            
            {(solution.isAiGuidanceOnly || solution.guidanceType === 'general_ai_guidance') && (
              <div className="max-w-xs p-3 bg-amber-400/10 border border-amber-400/20 rounded-lg text-[11px] text-amber-200 italic leading-relaxed">
                Notice: This strategy is derived from AI principles as no real community records currently match your exact situation.
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-10">
            {solution.recommendationSteps.map((step, idx) => (
              <div key={idx} className="flex gap-6 group">
                <div className="hidden sm:flex flex-col items-center gap-4">
                  <div className="w-10 h-10 rounded-full border-2 border-dark-accent/30 flex items-center justify-center text-sm font-bold text-dark-accent shrink-0 group-hover:border-dark-accent transition-colors">
                    {idx + 1}
                  </div>
                  <div className="w-px h-full bg-white/10" />
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <div className="sm:hidden w-6 h-6 rounded-full border border-dark-accent/30 flex items-center justify-center text-[10px] font-bold text-dark-accent">
                        {idx + 1}
                      </div>
                      <h3 className="text-xl font-serif font-bold text-white">{step.title}</h3>
                      {step.timeframe && (
                        <span className="text-[10px] font-bold tracking-wider uppercase text-white/40">{step.timeframe}</span>
                      )}
                    </div>
                    <p className="text-dark-text-secondary leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-1">
                    <span className="text-[9px] font-bold tracking-widest uppercase text-dark-accent">The Rationale</span>
                    <p className="text-xs text-dark-text-secondary italic">
                      {step.whyThisStep}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-white/10">
             <div className="max-w-2xl space-y-2">
                <span className="text-[10px] font-bold tracking-widest uppercase text-white/40">Synthesis Logic</span>
                <p className="text-sm text-dark-text-secondary leading-relaxed font-serif italic">
                  "{solution.overallReasoning}"
                </p>
             </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          SECTION 4: ANALYSIS TOOLS (PATTERNS & EVIDENCE)
         ========================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <PatternsPanel patterns={solution.patterns} />
        <EvidencePanel evidence={solution.evidence} />
      </section>

      {/* Uncertainties */}
      {solution.uncertainties && solution.uncertainties.length > 0 && (
        <section className="p-8 bg-brand-bg dark:bg-dark-bg border border-brand-border dark:border-dark-border rounded-2xl space-y-6">
          <div className="flex items-center gap-2 border-b border-brand-border dark:border-dark-border pb-4">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <h3 className="font-serif font-bold text-brand-text-primary dark:text-dark-text-primary text-xl">Limits & Uncertainties</h3>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
            {solution.uncertainties.map((u, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-brand-text-secondary dark:text-dark-text-secondary">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                {u}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Outcome Modal */}
      <ReportOutcomeModal
        solution={solution}
        isOpen={outcomeModalOpen}
        onClose={() => setOutcomeModalOpen(false)}
        onSuccess={() => {
          setOutcomeModalOpen(false);
          onNavigate('solutions');
        }}
      />
    </div>
  );
};
