import React, { useState } from 'react';
import { SolutionAnalysis, OutcomeStatus } from '../types';
import { reportOutcomeFeedback } from '../services/api';
import { AiWritingField } from './AiWritingField';
import confetti from 'canvas-confetti';
import { X, CheckCircle2, Clock, XCircle, Sparkles, Shield, Send, Share2, Lock } from 'lucide-react';

interface ReportOutcomeModalProps {
  solution: SolutionAnalysis;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReportOutcomeModal: React.FC<ReportOutcomeModalProps> = ({
  solution,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [result, setResult] = useState<OutcomeStatus>('worked');
  const [shareWhatLearned, setShareWhatLearned] = useState<boolean>(true);
  const [whatHappened, setWhatHappened] = useState('');
  const [whatLearned, setWhatLearned] = useState('');
  const [whatWouldChange, setWhatWouldChange] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [authorName, setAuthorName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatHappened.trim()) {
      setError('Please describe what happened during your trial.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await reportOutcomeFeedback(solution.id, {
        result,
        whatHappened: whatHappened.trim(),
        whatLearned: whatLearned.trim() || 'Practical execution and structured tracking gave key insights.',
        whatWouldChange: whatWouldChange.trim(),
        isAnonymous,
        authorName: authorName.trim() || undefined,
        shareAsPublicExperience: shareWhatLearned,
        solutionContext: solution,
      });

      try {
        confetti({
          particleCount: 85,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#6366f1', '#3b82f6', '#f59e0b'],
        });
      } catch (e) {}

      setSubmittedSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to record outcome. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div
        id="report-outcome-modal-card"
        className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs tracking-wider">
              CM
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                How Did It Go?
              </h3>
              <p className="text-xs text-slate-500">
                Report your outcome to build real community knowledge
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submittedSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">
              {shareWhatLearned ? 'Real Community Experience Created!' : 'Outcome Recorded!'}
            </h4>
            <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
              {shareWhatLearned
                ? "Your response has been structured into a real community experience. It is now immediately available in the Xperiens knowledge base to help future users!"
                : "Your trial outcome has been saved to your private solution history."}
            </p>
            {shareWhatLearned && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs font-semibold text-emerald-900">
                ✓ Added to Real Community Experiences (Count +1)
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
            {/* Target Solution Summary */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
              <span className="font-bold text-slate-900 block mb-0.5">Solution Evaluated:</span>
              <p className="line-clamp-2 italic text-slate-600">"{solution.originalProblem.problem}"</p>
            </div>

            {/* Question 1: How did it go? */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
                1. How did it go? <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  id="outcome-worked-btn"
                  onClick={() => setResult('worked')}
                  className={`p-3 rounded-xl border text-center text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                    result === 'worked'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Worked</span>
                </button>

                <button
                  type="button"
                  id="outcome-partial-btn"
                  onClick={() => setResult('partially_worked')}
                  className={`p-3 rounded-xl border text-center text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                    result === 'partially_worked'
                      ? 'bg-amber-50 border-amber-500 text-amber-800 ring-2 ring-amber-500/20'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Partially worked</span>
                </button>

                <button
                  type="button"
                  id="outcome-failed-btn"
                  onClick={() => setResult('did_not_work')}
                  className={`p-3 rounded-xl border text-center text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                    result === 'did_not_work'
                      ? 'bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-500/20'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>Didn't work</span>
                </button>
              </div>
            </div>

            {/* Question 2: Would you like to share what you learned? */}
            <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-indigo-700" />
                  <label className="text-xs font-bold text-indigo-950">
                    Would you like to share what you learned?
                  </label>
                </div>
                <input
                  type="checkbox"
                  id="share-what-learned-toggle"
                  checked={shareWhatLearned}
                  onChange={(e) => setShareWhatLearned(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-indigo-800/80 leading-relaxed">
                {shareWhatLearned
                  ? "Yes! Converting your response into a structured real community experience helps future users make better decisions."
                  : "No, save privately to my personal history only."}
              </p>
            </div>

            {/* What happened */}
            <AiWritingField
              id="outcome-what-happened-input"
              fieldName="Outcome / What Happened"
              label="What happened?"
              required
              rows={3}
              value={whatHappened}
              onChange={setWhatHappened}
              placeholder="Describe what occurred when you put the recommendation into practice..."
            />

            {/* What did you learn */}
            <AiWritingField
              type="input"
              id="outcome-what-learned-input"
              fieldName="Lesson Learned"
              label="What did you learn? (Key Takeaway)"
              value={whatLearned}
              onChange={setWhatLearned}
              placeholder="e.g. Taking small trial steps before making commitments prevented friction..."
            />

            {/* What would you do differently */}
            <AiWritingField
              type="input"
              id="outcome-what-change-input"
              fieldName="What Would Change"
              label="What would you do differently?"
              value={whatWouldChange}
              onChange={setWhatWouldChange}
              placeholder="e.g. Involve collaborators earlier in the timeline..."
            />

            {/* Privacy & Author options */}
            {shareWhatLearned && (
              <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Post anonymously</span>
                </label>

                {!isAnonymous && (
                  <input
                    type="text"
                    placeholder="Your Name / Role (e.g. Alex, Designer)"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="text-xs p-2 rounded-lg border border-slate-300 w-full sm:w-52 outline-hidden"
                  />
                )}
              </div>
            )}

            {error && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
                {error}
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="submit-outcome-btn"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Recording...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>{shareWhatLearned ? 'Publish Real Experience' : 'Save Outcome'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
