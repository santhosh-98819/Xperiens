import React, { useState } from 'react';
import { SolutionAnalysis, Experience } from '../types';
import { ExperienceCard } from '../components/ExperienceCard';
import { EvidencePanel } from '../components/EvidencePanel';
import { PatternsPanel } from '../components/PatternsPanel';
import { SectionTag } from '../components/Badge';
import { ReportOutcomeModal } from '../components/ReportOutcomeModal';
import { Tooltip } from '../components/Tooltip';
import { saveSolutionLocally, saveActiveSolution, isSolutionSaved, updateSolutionStatus } from '../services/api';
import {
  Sparkles,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowLeft,
  Share2,
  Send,
  HelpCircle,
  ShieldAlert,
  Flame,
  CheckSquare,
  FileCheck2,
  PlayCircle,
} from 'lucide-react';
import { ViewMode } from '../App';

interface SolutionViewProps {
  solution: SolutionAnalysis;
  onBack: () => void;
  onNavigate: (view: ViewMode) => void;
}

export const SolutionView: React.FC<SolutionViewProps> = ({ solution, onBack, onNavigate }) => {
  const [isSaved, setIsSaved] = useState(() => isSolutionSaved(solution.id));
  const [currentStatus, setCurrentStatus] = useState<string>(() => solution.status || (solution.outcomeReport ? 'completed' : 'in_progress'));
  const [currentOutcome, setCurrentOutcome] = useState(solution.outcomeReport);
  const [outcomeModalOpen, setOutcomeModalOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const isCompleted = currentStatus === 'completed' || !!currentOutcome;

  const handleToggleSave = () => {
    const bookmarked = saveSolutionLocally({
      ...solution,
      status: currentStatus as any,
      outcomeReport: currentOutcome,
    });
    setIsSaved(bookmarked);
  };

  const handleToggleStatus = () => {
    const nextStatus = currentStatus === 'testing' || currentStatus === 'in_progress' ? 'completed' : 'testing';
    if (nextStatus === 'completed') {
      setOutcomeModalOpen(true);
    } else {
      setCurrentStatus(nextStatus);
      updateSolutionStatus(solution.id, nextStatus as any);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6 sm:py-10 space-y-8 animate-fadeIn pb-16">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <button
          onClick={onBack}
          id="back-to-ask-btn"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Modify Situation</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Badge */}
          {isCompleted ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Completed & Reported</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              <PlayCircle className="w-3.5 h-3.5 text-indigo-600" />
              <span>In Progress / Testing</span>
            </span>
          )}

          <Tooltip content="Copy link to this specific analysis" position="bottom">
            <button
              onClick={handleShare}
              id="share-solution-btn"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copySuccess ? 'Link Copied!' : 'Share'}</span>
            </button>
          </Tooltip>

          <Tooltip content="Bookmark this plan in My Solutions for offline tracking" position="bottom">
            <button
              onClick={handleToggleSave}
              id="save-solution-btn"
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isSaved
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-300'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-2xs'
              }`}
            >
              {isSaved ? <BookmarkCheck className="w-4 h-4 text-indigo-600" /> : <Bookmark className="w-4 h-4 text-slate-400" />}
              <span>{isSaved ? 'Saved to Solutions' : 'Save Solution'}</span>
            </button>
          </Tooltip>

          <Tooltip content="Report the real-world outcome after testing this recommendation" position="bottom">
            <button
              onClick={() => setOutcomeModalOpen(true)}
              id="report-outcome-top-btn"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-all cursor-pointer"
            >
              <CheckSquare className="w-3.5 h-3.5 text-emerald-300" />
              <span>{isCompleted ? 'Update Outcome' : 'Report Outcome'}</span>
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Safety Notice if applicable */}
      {solution.safetyNotice && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed font-medium">{solution.safetyNotice}</p>
        </div>
      )}

      {/* ==========================================
          SECTION 1: YOUR SITUATION
         ========================================== */}
      <section className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Your Diagnosed Situation
            </h2>
            <Tooltip content="Synthesized summary of your problem, goals, and constraints" position="top">
              <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
            </Tooltip>
          </div>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
            Category: {solution.originalProblem.category}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 text-sm sm:text-base text-slate-900 font-medium leading-relaxed">
          "{solution.problemSummary}"
        </div>

        {/* Detected Key Factors */}
        {solution.detectedFactors && solution.detectedFactors.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Important Factors Detected:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {solution.detectedFactors.map((factor, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 text-xs"
                >
                  <span className="font-semibold text-slate-800">{factor.factor}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      factor.impact === 'high'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    }`}
                  >
                    {factor.impact} Impact
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ==========================================
          SECTION 2: EXPERIENCE DISCOVERY (REAL vs DEMO vs ZERO)
         ========================================== */}
      {(() => {
        const realExps = solution.realCommunityExperiences || solution.relevantExperiences.filter((e) => !e.isDemo);
        const demoExps = solution.demoExperiences || solution.relevantExperiences.filter((e) => e.isDemo);

        return (
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  {realExps.length > 0 ? (
                    <SectionTag type="human" label="REAL COMMUNITY EXPERIENCES" />
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
                      <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
                      <span>NO COMMUNITY EXPERIENCES YET</span>
                    </div>
                  )}
                  <span className="text-xs text-slate-500 font-medium">
                    ({realExps.length} real community {realExps.length === 1 ? 'case' : 'cases'} in database)
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {realExps.length > 0
                    ? 'Relevant Real Community Experiences'
                    : 'Community Experience Database'}
                </h2>
              </div>
            </div>

            {/* Zero Real Community State */}
            {realExps.length === 0 ? (
              <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
                <div className="flex items-center gap-2.5 text-slate-900">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    CM
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    No community experiences yet
                  </h3>
                </div>
                <p className="text-slate-700 font-medium text-sm">
                  You're among the first people building the Xperiens experience knowledge base.
                </p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  As users solve challenges, test recommendations, and report outcomes, real community data will populate here. In the meantime, Xperiens provides <strong className="text-slate-800">General AI Guidance</strong> below.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {realExps.map((exp) => (
                  <ExperienceCard key={exp.id} experience={exp} />
                ))}
              </div>
            )}

            {/* Demo Experiences Section (Separated & Clearly Tagged) */}
            {demoExps.length > 0 && (
              <div className="pt-3 space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/70 border border-amber-200/80">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-200 text-amber-900 border border-amber-300">
                      DEMO EXPERIENCES
                    </span>
                    <span className="text-xs font-semibold text-amber-950">
                      Sample reference data for testing functionality only
                    </span>
                  </div>
                  <span className="text-[11px] text-amber-800 hidden sm:inline font-medium">
                    (Not real human experiences)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {demoExps.map((exp) => (
                    <ExperienceCard key={exp.id} experience={exp} />
                  ))}
                </div>
              </div>
            )}
          </section>
        );
      })()}

      {/* ==========================================
          SECTION 3: EXPERIENCE ANALYSIS (PATTERNS FOUND)
         ========================================== */}
      <section>
        <PatternsPanel patterns={solution.patterns} />
      </section>

      {/* ==========================================
          SECTION 4: RECOMMENDATION (AI GUIDANCE vs COMMUNITY)
         ========================================== */}
      <section className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-lg space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/80 pb-4">
          <div>
            {solution.isAiGuidanceOnly || solution.guidanceType === 'general_ai_guidance' ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-950 border border-amber-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>GENERAL AI GUIDANCE</span>
              </div>
            ) : (
              <SectionTag type="recommendation" label="COMMUNITY-INFORMED SOLUTION" />
            )}
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-2">
              Recommended Action Plan
            </h2>
          </div>

          <div className="text-xs text-emerald-300 font-medium bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-700/60">
            Tailored to your constraints & timeline
          </div>
        </div>

        {/* Clear Notice for General AI Guidance */}
        {(solution.isAiGuidanceOnly || solution.guidanceType === 'general_ai_guidance') && (
          <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-600/50 text-amber-200 text-xs space-y-1">
            <strong className="text-amber-100 block font-bold text-xs uppercase tracking-wider">
              Notice: General AI Guidance
            </strong>
            <p className="leading-relaxed text-amber-200/90 font-medium">
              This recommendation is generated by AI first-principles reasoning and is <strong>NOT</strong> based on community experience. Once community members try this plan and report results, real experiential data will refine future recommendations.
            </p>
          </div>
        )}

        {/* Sequential Step Cards */}
        <div className="space-y-4">
          {solution.recommendationSteps.map((step) => (
            <div
              key={step.stepNumber}
              className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-slate-600 transition-all space-y-2.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500 text-white flex items-center justify-center font-bold text-xs">
                    0{step.stepNumber}
                  </div>
                  <h3 className="font-bold text-base text-white">{step.title}</h3>
                </div>
                {step.timeframe && (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-700 text-slate-300">
                    {step.timeframe}
                  </span>
                )}
              </div>

              <p className="text-sm text-slate-300 leading-relaxed pl-10">
                {step.description}
              </p>

              {/* Explicit Why this step trace */}
              <div className="pl-10 pt-1">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/70 text-xs text-indigo-200">
                  <strong className="text-white block mb-0.5">Why this recommendation:</strong>
                  <span>{step.whyThisStep}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Overall Synthesis Reasoning */}
        <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 text-xs text-slate-300 leading-relaxed">
          <strong className="text-white block mb-1">Synthesis Logic:</strong>
          {solution.overallReasoning}
        </div>

        {/* Outcome Action banner inside recommendation */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-700/80">
          <div className="text-xs text-slate-300">
            Ready to test this plan? Try the solution and report back to build real community evidence.
          </div>
          <Tooltip content="Share what happened when you tried this plan" position="top">
            <button
              onClick={() => setOutcomeModalOpen(true)}
              id="ready-report-outcome-btn"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-600 text-slate-950 transition-all cursor-pointer shadow-md"
            >
              <CheckSquare className="w-4 h-4 text-slate-950" />
              <span>Report What Happened</span>
            </button>
          </Tooltip>
        </div>
      </section>

      {/* ==========================================
          SECTION 5: EVIDENCE BASE & CONFIDENCE
         ========================================== */}
      <section>
        <EvidencePanel evidence={solution.evidence} />
      </section>

      {/* ==========================================
          SECTION 6: UNCERTAINTIES & LIMITATIONS
         ========================================== */}
      {solution.uncertainties && solution.uncertainties.length > 0 && (
        <section className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h3 className="font-semibold text-base text-slate-900 dark:text-white">
                Uncertainties & System Boundaries
              </h3>
            </div>
            <SectionTag type="uncertainty" />
          </div>

          <p className="text-xs text-slate-500">
            What Xperiens does not know about your exact environment:
          </p>

          <ul className="space-y-2">
            {solution.uncertainties.map((u, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                <span className="leading-relaxed">{u}</span>
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
