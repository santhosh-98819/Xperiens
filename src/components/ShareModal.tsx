import React, { useState, useEffect } from 'react';
import { Experience, SolutionAnalysis } from '../types';
import {
  isExperienceSaved,
  saveExperienceLocally,
  isSolutionSaved,
  saveSolutionLocally,
} from '../services/api';
import {
  X,
  Share2,
  Bookmark,
  BookmarkCheck,
  Mail,
  Copy,
  Check,
  Send,
  MessageCircle,
  Linkedin,
  Twitter,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Share,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  experience?: Experience | null;
  solution?: SolutionAnalysis | null;
  onNavigateToSaved?: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  experience,
  solution,
  onNavigateToSaved,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const [emailSentNotice, setEmailSentNotice] = useState(false);

  const isExp = Boolean(experience);
  const title = isExp
    ? experience?.title || 'Community Experience'
    : solution?.originalProblem?.problem || solution?.problemSummary || 'Solution Action Plan';
  const category = isExp
    ? experience?.category || 'Everyday Problems'
    : solution?.originalProblem?.category || 'General';
  const situation = isExp
    ? experience?.situation || ''
    : solution?.originalProblem?.problem || '';
  const outcomeText = isExp
    ? experience?.outcome || ''
    : solution?.outcomeReport?.whatHappened || 'Action plan tested with Xperiens';
  const lessonText = isExp
    ? experience?.lesson || ''
    : solution?.outcomeReport?.whatLearned || solution?.overallReasoning || '';
  const actionsList = isExp
    ? experience?.actionsTaken || []
    : solution?.recommendationSteps?.map((s) => `${s.title}: ${s.description}`) || [];
  const outcomeStatus = isExp
    ? experience?.outcomeStatus || 'worked'
    : solution?.outcomeReport?.result || 'worked';

  useEffect(() => {
    if (isOpen) {
      if (experience) {
        setIsSaved(isExperienceSaved(experience.id));
      } else if (solution) {
        setIsSaved(isSolutionSaved(solution.id));
      }
      setCopiedLink(false);
      setCopiedSummary(false);
      setEmailSentNotice(false);
    }
  }, [isOpen, experience, solution]);

  if (!isOpen) return null;

  const currentUrl = window.location.href;

  const summaryText = `
🌟 Xperiens - Real Experience & Solution
Title: ${title}
Category: ${category}
Status: ${outcomeStatus === 'worked' ? '✅ Worked' : outcomeStatus === 'partially_worked' ? '⚠️ Partially Worked' : "❌ Didn't Work"}

📌 Situation:
${situation}

🛠️ Actions Taken / Recommendations:
${actionsList.map((a, i) => `${i + 1}. ${a}`).join('\n')}

🎯 Outcome:
${outcomeText}

💡 Core Lesson Learned:
"${lessonText}"

Explore more experiences and practical solutions on Xperiens:
${currentUrl}
`.trim();

  const handleToggleSave = () => {
    let savedNow = false;
    if (experience) {
      savedNow = saveExperienceLocally(experience);
    } else if (solution) {
      savedNow = saveSolutionLocally(solution);
    }
    setIsSaved(savedNow);

    if (savedNow) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#6366f1', '#10b981', '#3b82f6'],
        });
      } catch (e) {}
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (e) {
      console.warn('Clipboard write failed:', e);
    }
  };

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2500);
    } catch (e) {
      console.warn('Clipboard write failed:', e);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Xperiens: ${title}`,
          text: `Check out this real experience and outcome on Xperiens: "${title}" - Key takeaway: "${lessonText.slice(0, 100)}..."`,
          url: currentUrl,
        });
      } catch (e) {}
    }
  };

  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedText = encodeURIComponent(
    `Check out this real experience and outcome on Xperiens: "${title}" - Key takeaway: "${lessonText.slice(0, 90)}..."\n${currentUrl}`
  );
  const emailSubject = encodeURIComponent(`[Xperiens] Real Experience & Outcome: ${title}`);
  const emailBody = encodeURIComponent(
    `Hi,\n\nI wanted to share this real-world experience and solution plan from Xperiens with you:\n\n` +
      `Title: ${title}\nCategory: ${category}\nOutcome: ${outcomeStatus}\n\nSituation:\n${situation}\n\nKey Lesson Learned:\n"${lessonText}"\n\nRead the full details and step-by-step guidance here:\n${currentUrl}\n\nShared via Xperiens`
  );

  const handleSendCustomEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailTo.trim()) return;
    window.location.href = `mailto:${encodeURIComponent(emailTo.trim())}?subject=${emailSubject}&body=${emailBody}`;
    setEmailSentNotice(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs animate-fadeIn">
      <div
        id="share-experience-modal-card"
        className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scaleIn transition-colors"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-850/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs tracking-wider shadow-xs">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Share & Save Experience
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Save to your personal list, send to others, or post to social channels
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Target Preview Snippet */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-700 dark:text-slate-300 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[10px] uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
                {category}
              </span>
              <span
                className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                  outcomeStatus === 'worked'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : outcomeStatus === 'partially_worked'
                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                    : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                }`}
              >
                {outcomeStatus === 'worked' ? 'Worked' : outcomeStatus === 'partially_worked' ? 'Partially Worked' : "Didn't Work"}
              </span>
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-2 pt-1">{title}</h4>
            <p className="text-slate-600 dark:text-slate-400 italic line-clamp-2 text-[11px]">
              "{lessonText || situation}"
            </p>
          </div>

          {/* Section 1: Save to Personal Saved Items */}
          <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/60 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 font-bold text-xs text-indigo-950 dark:text-indigo-200">
                <Bookmark className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Save to My Saved Items</span>
              </div>
              <p className="text-[11px] text-indigo-800/80 dark:text-indigo-300/80">
                {isSaved
                  ? 'Currently bookmarked in your Saved list on your Profile.'
                  : 'Save this directly to your personal Saved tab to reference anytime.'}
              </p>
            </div>

            <button
              id="modal-toggle-save-btn"
              onClick={handleToggleSave}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 cursor-pointer shadow-xs ${
                isSaved
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {isSaved ? (
                <>
                  <BookmarkCheck className="w-4 h-4" />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4" />
                  <span>Save Item</span>
                </>
              )}
            </button>
          </div>

          {/* Section 2: Copy Link & Summary */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Direct Copy Options
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                id="modal-copy-link-btn"
                onClick={handleCopyLink}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-400" />}
                  <span>{copiedLink ? 'Link Copied!' : 'Copy Web Link'}</span>
                </span>
                <span className="text-[10px] text-slate-400 font-normal">URL</span>
              </button>

              <button
                id="modal-copy-summary-btn"
                onClick={handleCopySummary}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  {copiedSummary ? <Check className="w-4 h-4 text-emerald-600" /> : <Sparkles className="w-4 h-4 text-indigo-500" />}
                  <span>{copiedSummary ? 'Summary Copied!' : 'Copy Full Summary'}</span>
                </span>
                <span className="text-[10px] text-slate-400 font-normal">Markdown</span>
              </button>
            </div>
          </div>

          {/* Section 3: Email Notification / Send to Recipient */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Email Notification & Message
            </label>
            <form onSubmit={handleSendCustomEmail} className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="Enter recipient email address..."
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <button
                type="submit"
                id="modal-send-email-btn"
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 dark:bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Email</span>
              </button>
            </form>
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <a
                href={`mailto:?subject=${emailSubject}&body=${emailBody}`}
                className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
              >
                <Mail className="w-3 h-3" />
                <span>Open default email app with prefilled outcome</span>
              </a>
              {emailSentNotice && <span className="text-emerald-600 font-semibold">✓ Client opened</span>}
            </div>
          </div>

          {/* Section 4: Social & Instant Messengers */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Share to Communities & Messengers
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* WhatsApp */}
              <a
                href={`https://api.whatsapp.com/send?text=${encodedText}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp</span>
              </a>

              {/* LinkedIn */}
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-semibold bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 hover:bg-sky-100 border border-sky-200 dark:border-sky-800 transition-colors"
              >
                <Linkedin className="w-3.5 h-3.5 text-sky-600" />
                <span>LinkedIn</span>
              </a>

              {/* Twitter / X */}
              <a
                href={`https://twitter.com/intent/tweet?text=${encodedText}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors"
              >
                <Twitter className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
                <span>Twitter / X</span>
              </a>

              {/* Native Device Share (Mobile / Desktop) */}
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
                >
                  <Share className="w-3.5 h-3.5 text-indigo-600" />
                  <span>More...</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Shared items can be bookmarked and accessed offline</span>
          </span>

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
