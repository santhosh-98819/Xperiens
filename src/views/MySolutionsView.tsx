import React, { useState, useEffect } from 'react';
import { SolutionAnalysis } from '../types';
import { getLocalSavedSolutions, getLocalActiveSolutions, saveSolutionLocally, isSolutionSaved } from '../services/api';
import { ReportOutcomeModal } from '../components/ReportOutcomeModal';
import { Tooltip } from '../components/Tooltip';
import {
  CheckSquare,
  Bookmark,
  BookmarkCheck,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  HelpCircle,
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

  // Merge unique
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

  const completedCount = allList.filter((s) => s.status === 'completed' || !!s.outcomeReport).length;
  const savedCount = allList.filter((s) => savedIds.has(s.id) || s.status === 'saved').length;
  const testingCount = allList.filter(
    (s) => (s.status === 'testing' || s.status === 'in_progress' || !s.status) && s.status !== 'completed' && !s.outcomeReport
  ).length;

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
    <div className="max-w-5xl mx-auto py-6 sm:py-10 space-y-8 animate-fadeIn pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900/50 mb-2">
            <CheckSquare className="w-3.5 h-3.5" />
            <span>ACTION & OUTCOME TRACKER</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            My Solutions
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Track strategies you are testing, review personalized recommendations, and record outcomes.
          </p>
        </div>

        <Tooltip content="Submit a new challenge to generate another tailored recommendation" position="left">
          <button
            id="ask-new-problem-btn"
            onClick={() => onNavigate('ask')}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-slate-900 hover:bg-indigo-700 shadow-sm transition-all flex-shrink-0 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-emerald-300" />
            <span>Ask New Situation</span>
          </button>
        </Tooltip>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 text-xs font-medium pb-2 overflow-x-auto">
        {[
          { id: 'all', label: `All Solutions (${allList.length})` },
          {
            id: 'testing',
            label: `In Progress / Testing (${testingCount})`,
          },
          {
            id: 'completed',
            label: `Completed (${completedCount})`,
          },
          { id: 'saved', label: `Saved (${savedCount})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Solutions List */}
      {filteredList.length === 0 ? (
        <div className="p-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
              No solutions in this tab
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Submit a problem to generate an experience-based plan, bookmark recommendations, or report outcomes.
            </p>
          </div>
          <button
            onClick={() => onNavigate('ask')}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-2xs cursor-pointer"
          >
            Diagnose a Problem Now
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredList.map((sol) => {
            const isCompleted = sol.status === 'completed' || !!sol.outcomeReport;
            const isSaved = savedIds.has(sol.id) || sol.status === 'saved';
            const isTesting = (sol.status === 'testing' || sol.status === 'in_progress' || !sol.status) && !isCompleted;

            return (
              <div
                key={sol.id}
                id={`solution-row-${sol.id}`}
                className="p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 hover:border-indigo-300 hover:shadow-2xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {sol.originalProblem.category}
                    </span>

                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        Completed & Reported
                      </span>
                    ) : isTesting ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        <PlayCircle className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                        In Progress / Testing
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        <Bookmark className="w-3 h-3" />
                        Saved
                      </span>
                    )}

                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {new Date(sol.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    {sol.originalProblem.problem}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                    {sol.problemSummary}
                  </p>

                  <div className="text-xs text-indigo-700 dark:text-indigo-400 font-medium flex items-center gap-2">
                    <span>
                      {sol.recommendationSteps.length} Step Plan
                    </span>
                    <span>•</span>
                    <span>
                      Based on {sol.relevantExperiences.length} peer experiences ({sol.evidence.confidencePercentage}% confidence)
                    </span>
                  </div>

                  {sol.outcomeReport && (
                    <div className="p-2.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900 text-xs text-emerald-900 dark:text-emerald-100 mt-2">
                      <strong className="block mb-0.5">Your Reported Outcome ({sol.outcomeReport.result.toUpperCase()}):</strong>
                      <p className="italic">"{sol.outcomeReport.whatHappened}"</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-row md:flex-col items-center md:items-end gap-2 flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="flex items-center gap-2">
                    <Tooltip content={isSaved ? "Remove from saved bookmarks" : "Save this plan"} position="top">
                      <button
                        onClick={(e) => handleToggleSave(sol, e)}
                        className={`p-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer border ${
                          isSaved
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                            : 'bg-white text-slate-500 hover:text-slate-800 border-slate-200'
                        }`}
                      >
                        {isSaved ? <BookmarkCheck className="w-4 h-4 text-indigo-600" /> : <Bookmark className="w-4 h-4" />}
                      </button>
                    </Tooltip>

                    <button
                      onClick={() => onSelectSolution(sol)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                      <span>View Plan</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <Tooltip content={isCompleted ? "Update your reported outcome" : "Record what happened when you tried this solution"} position="left">
                    <button
                      onClick={() => setSelectedForOutcome(sol)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        isCompleted
                          ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                          : 'text-white bg-indigo-600 hover:bg-indigo-700 shadow-2xs'
                      }`}
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>{isCompleted ? 'Update Outcome' : 'Report Outcome'}</span>
                    </button>
                  </Tooltip>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Outcome Modal */}
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
