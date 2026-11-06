import React, { useState, useEffect } from 'react';
import { SolutionAnalysis } from '../types';
import { getLocalSavedSolutions, getLocalActiveSolutions, saveSolutionLocally } from '../services/api';
import { ReportOutcomeModal } from '../components/ReportOutcomeModal';
import {
  CheckSquare,
  Bookmark,
  BookmarkCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  PlayCircle,
} from 'lucide-react';
import { ViewMode } from '../App';

interface MySolutionsViewProps {
  onSelectSolution: (solution: SolutionAnalysis) => void;
  onNavigate: (view: ViewMode) => void;
}

export const MySolutionsView: React.FC<MySolutionsViewProps> = ({
  onSelectSolution,
  onNavigate,
}) => {
  const [activeSolutions, setActiveSolutions] = useState<SolutionAnalysis[]>([]);
  const [savedSolutions, setSavedSolutions] = useState<SolutionAnalysis[]>([]);
  const [selectedForOutcome, setSelectedForOutcome] = useState<SolutionAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'testing' | 'saved' | 'completed'>('all');

  const loadSolutions = () => {
    const active = getLocalActiveSolutions();
    const saved = getLocalSavedSolutions();
    setActiveSolutions(active);
    setSavedSolutions(saved);
  };

  useEffect(() => {
    loadSolutions();
  }, []);

  const savedIds = new Set(savedSolutions.map((s) => s.id));

  const allMap = new Map<string, SolutionAnalysis>();
  savedSolutions.forEach((s) => {
    allMap.set(s.id, {
      ...s,
      status: s.status || (s.outcomeReport ? 'completed' : 'saved'),
    });
  });
  activeSolutions.forEach((s) => {
    const existing = allMap.get(s.id);
    if (existing) {
      allMap.set(s.id, {
        ...existing,
        ...s,
        status: s.status || existing.status,
        outcomeReport: s.outcomeReport || existing.outcomeReport,
      });
    } else {
      allMap.set(s.id, s);
    }
  });
  const allList = Array.from(allMap.values());

  const filteredList = allList.filter((s) => {
    const isCompleted = s.status === 'completed' || !!s.outcomeReport;
    const isSaved = savedIds.has(s.id) || s.status === 'saved';
    const isTesting = (s.status === 'testing' || s.status === 'in_progress' || !s.status) && !isCompleted;

    if (activeTab === 'testing') return isTesting;
    if (activeTab === 'saved') return isSaved;
    if (activeTab === 'completed') return isCompleted;
    return true;
  });

  const handleToggleSave = (sol: SolutionAnalysis, e: React.MouseEvent) => {
    e.stopPropagation();
    saveSolutionLocally(sol);
    loadSolutions();
  };

  return (
    <div className="max-w-6xl mx-auto py-12 sm:py-16 px-6 space-y-12 animate-fadeIn pb-24">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-brand-border dark:border-dark-border pb-10">
        <div className="space-y-4">
           <div className="text-xs font-bold text-brand-accent dark:text-dark-accent uppercase tracking-widest flex items-center gap-2">
              <CheckSquare className="w-4 h-4" />
              <span>Inquiry Tracking</span>
           </div>
           <h1 className="text-4xl font-serif font-bold text-brand-text-primary dark:text-dark-text-primary tracking-tight">
             My Insights
           </h1>
           <p className="text-lg text-brand-text-secondary dark:text-dark-text-secondary font-light max-w-xl">
             Review synthesized recommendations, track ongoing trials, and record outcomes to refine future reasoning.
           </p>
        </div>

        <button
          onClick={() => onNavigate('ask')}
          className="w-full md:w-auto px-8 py-3 bg-brand-text-primary dark:bg-dark-text-primary text-brand-bg dark:text-dark-bg rounded-lg font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg"
        >
          <Sparkles className="w-4 h-4" />
          <span>New Situation</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-8 border-b border-brand-border dark:border-dark-border pb-px overflow-x-auto scrollbar-hide">
        {[
          { id: 'all', label: `All Plans (${allList.length})` },
          { id: 'testing', label: `In Testing` },
          { id: 'completed', label: `Completed` },
          { id: 'saved', label: `Bookmarked` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all relative whitespace-nowrap ${
              activeTab === tab.id
                ? 'text-brand-accent dark:text-dark-accent'
                : 'text-brand-text-secondary dark:text-dark-text-secondary hover:text-brand-text-primary dark:hover:text-dark-text-primary'
            }`}
          >
            <span>{tab.label}</span>
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-accent dark:bg-dark-accent" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {filteredList.length === 0 ? (
        <div className="py-24 text-center border border-dashed border-brand-border dark:border-dark-border rounded-2xl space-y-6">
           <p className="text-brand-text-secondary dark:text-dark-text-secondary font-light">No plans found in this section.</p>
           <button onClick={() => onNavigate('ask')} className="text-xs font-bold text-brand-accent dark:text-dark-accent hover:underline uppercase tracking-widest">Diagnose Situation</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredList.map((sol) => {
            const isCompleted = sol.status === 'completed' || !!sol.outcomeReport;
            const isSaved = savedIds.has(sol.id) || sol.status === 'saved';
            const isTesting = (sol.status === 'testing' || sol.status === 'in_progress' || !sol.status) && !isCompleted;

            return (
              <div
                key={sol.id}
                className="group p-8 bg-brand-card dark:bg-dark-card border border-brand-border dark:border-dark-border rounded-xl hover:border-brand-accent dark:hover:border-dark-accent transition-all flex flex-col md:flex-row md:items-center justify-between gap-8"
              >
                <div className="space-y-4 flex-1">
                   <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-brand-text-secondary dark:text-dark-text-secondary">
                      <span className="text-brand-text-primary dark:text-dark-text-primary">{sol.originalProblem.category}</span>
                      <span aria-hidden="true">·</span>
                      {isCompleted ? (
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3" /> Resolved</span>
                      ) : isTesting ? (
                        <span className="text-brand-accent dark:text-dark-accent flex items-center gap-1.5"><PlayCircle className="w-3 h-3" /> In Testing</span>
                      ) : (
                        <span className="flex items-center gap-1.5"><Bookmark className="w-3 h-3" /> Saved</span>
                      )}
                      <span aria-hidden="true">·</span>
                      <span>{new Date(sol.createdAt).toLocaleDateString()}</span>
                   </div>

                   <h3 className="text-xl font-serif font-bold text-brand-text-primary dark:text-dark-text-primary group-hover:text-brand-accent dark:group-hover:text-dark-accent transition-colors">
                     {sol.originalProblem.problem}
                   </h3>

                   <div className="flex items-center gap-6 text-xs font-medium text-brand-text-secondary dark:text-dark-text-secondary">
                      <span>{sol.recommendationSteps.length} Step Plan</span>
                      <span aria-hidden="true">·</span>
                      <span>{sol.evidence.confidencePercentage}% Confidence</span>
                   </div>

                   {sol.outcomeReport && (
                      <div className="p-4 bg-brand-bg dark:bg-dark-sec-bg border border-brand-border dark:border-dark-border rounded-lg text-xs leading-relaxed italic opacity-80">
                         "{sol.outcomeReport.whatHappened}"
                      </div>
                   )}
                </div>

                <div className="flex items-center gap-3">
                   <button
                     onClick={(e) => handleToggleSave(sol, e)}
                     className={`p-3 rounded-lg border transition-all ${
                       isSaved ? 'bg-brand-accent dark:bg-dark-accent text-white border-brand-accent' : 'border-brand-border dark:border-dark-border text-brand-text-secondary hover:text-brand-text-primary'
                     }`}
                   >
                     {isSaved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                   </button>
                   <button
                     onClick={() => onSelectSolution(sol)}
                     className="px-6 py-3 border border-brand-text-primary dark:border-dark-text-primary rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-brand-text-primary dark:hover:bg-dark-text-primary hover:text-brand-bg dark:hover:text-dark-bg transition-all flex items-center gap-2"
                   >
                     Review Plan <ArrowRight className="w-4 h-4" />
                   </button>
                   <button
                     onClick={() => setSelectedForOutcome(sol)}
                     className={`px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                       isCompleted ? 'bg-emerald-600 text-white' : 'bg-brand-text-primary dark:bg-dark-text-primary text-brand-bg dark:text-dark-bg'
                     }`}
                   >
                     {isCompleted ? 'Outcome Logged' : 'Log Trial'}
                   </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedForOutcome && (
        <ReportOutcomeModal
          solution={selectedForOutcome}
          isOpen={true}
          onClose={() => setSelectedForOutcome(null)}
          onSuccess={() => {
            setSelectedForOutcome(null);
            loadSolutions();
          }}
        />
      )}
    </div>
  );
};
