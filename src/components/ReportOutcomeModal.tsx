import React, { useState } from 'react';
import { SolutionAnalysis, OutcomeStatus } from '../types';
import { reportOutcomeFeedback } from '../services/api';
import { AiWritingField } from './AiWritingField';
import confetti from 'canvas-confetti';
import { X, CheckCircle2, Clock, XCircle, Send, Share2 } from 'lucide-react';

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
      setError('Please describe what happened.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await reportOutcomeFeedback(solution.id, {
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
          colors: ['#8B9CF6', '#5969C7', '#10b981'],
        });
      } catch (e) {}

      setSubmittedSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to record outcome.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-dark-bg/60 backdrop-blur-md animate-fadeIn">
      <div className="bg-brand-card dark:bg-dark-card w-full max-w-xl rounded-2xl border border-brand-border dark:border-dark-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-8 py-6 border-b border-brand-border dark:border-dark-border flex items-center justify-between">
           <div className="space-y-1">
             <h3 className="text-xl font-serif font-bold text-brand-text-primary dark:text-dark-text-primary">Record Outcome</h3>
             <p className="text-xs text-brand-text-secondary dark:text-dark-text-secondary font-light">Contribute to the collective intelligence pool.</p>
           </div>
           <button onClick={onClose} className="text-brand-text-secondary hover:text-brand-text-primary transition-colors"><X className="w-6 h-6" /></button>
        </div>

        {submittedSuccess ? (
          <div className="p-12 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-2">
               <h4 className="text-2xl font-serif font-bold text-brand-text-primary dark:text-dark-text-primary">Wisdom Logged</h4>
               <p className="text-sm text-brand-text-secondary dark:text-dark-text-secondary max-w-sm mx-auto leading-relaxed">
                 Your trial outcome has been recorded. It will now help others facing similar challenges make more informed decisions.
               </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto">
            <div className="p-5 bg-brand-bg dark:bg-dark-sec-bg rounded-xl border border-brand-border dark:border-dark-border space-y-2">
              <span className="text-[10px] font-bold text-brand-text-secondary dark:text-dark-text-secondary uppercase tracking-widest opacity-60">Trialing Plan:</span>
              <p className="text-sm font-serif font-bold text-brand-text-primary dark:text-dark-text-primary line-clamp-1">"{solution.originalProblem.problem}"</p>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-bold text-brand-text-primary dark:text-dark-text-primary uppercase tracking-widest">01. What was the result?</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'worked', label: 'Worked', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-500' },
                  { id: 'partially_worked', label: 'Partial', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-500' },
                  { id: 'did_not_work', label: 'Failed', icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950/30', border: 'border-rose-500' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setResult(item.id as OutcomeStatus)}
                    className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-3 ${
                      result === item.id 
                        ? `${item.bg} ${item.border} ${item.color} shadow-sm` 
                        : 'bg-brand-card dark:bg-dark-card border-brand-border dark:border-dark-border text-brand-text-secondary'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-widest">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 bg-brand-bg dark:bg-dark-sec-bg rounded-xl border border-brand-border dark:border-dark-border flex items-start gap-4">
               <input
                 type="checkbox"
                 checked={shareWhatLearned}
                 onChange={(e) => setShareWhatLearned(e.target.checked)}
                 className="mt-1 rounded border-brand-border text-brand-accent"
               />
               <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-brand-accent dark:text-dark-accent" />
                    <span className="text-sm font-bold text-brand-text-primary dark:text-dark-text-primary">Share as Public Story</span>
                  </div>
                  <p className="text-xs text-brand-text-secondary dark:text-dark-text-secondary leading-relaxed font-light">
                    Transform this outcome into a structured experience card to help the community. You can still remain anonymous.
                  </p>
               </div>
            </div>

            <div className="space-y-6">
              <AiWritingField
                id="outcome-what-happened"
                fieldName="Description"
                label="02. What occurred?"
                required
                rows={3}
                value={whatHappened}
                onChange={setWhatHappened}
                placeholder="Describe the real-world execution..."
              />

              <AiWritingField
                id="outcome-what-learned"
                fieldName="Key Lesson"
                label="03. The primary lesson"
                rows={2}
                value={whatLearned}
                onChange={setWhatLearned}
                placeholder="What is the one thing others should know?"
              />
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-brand-border dark:border-dark-border">
               <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded border-brand-border text-brand-accent"
                  />
                  <span className="text-xs font-bold text-brand-text-secondary dark:text-dark-text-secondary uppercase tracking-widest">Post Anonymously</span>
               </label>
               
               <button
                 type="submit"
                 disabled={isSubmitting}
                 className="px-10 py-3 bg-brand-text-primary dark:bg-dark-text-primary text-brand-bg dark:text-dark-bg rounded-lg font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-3 shadow-xl"
               >
                 {isSubmitting ? 'Recording...' : <><Send className="w-4 h-4" /> Save Outcome</>}
               </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
