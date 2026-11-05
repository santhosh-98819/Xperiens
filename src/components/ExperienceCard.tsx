import React, { useState } from 'react';
import { Experience } from '../types';
import { QualityBadge, OutcomeBadge, DemoTag } from './Badge';
import { Tooltip } from './Tooltip';
import { ThumbsUp, ThumbsDown, ChevronDown, ChevronUp, User, Sparkles, Trash2, AlertCircle, Share2, UserCheck } from 'lucide-react';
import { voteExperience, deleteExperience } from '../services/api';
import { deleteUserExperience } from '../services/firestoreService';
import { ShareModal } from './ShareModal';
import { useAuth } from '../contexts/AuthContext';

interface ExperienceCardProps {
  experience: Experience;
  onVote?: (id: string, vote: 'useful' | 'not_useful') => void;
  onDelete?: (id: string) => void;
  showRelevance?: boolean;
  canDelete?: boolean;
  onClick?: () => void;
}

export const ExperienceCard: React.FC<ExperienceCardProps> = ({
  experience,
  onVote,
  onDelete,
  showRelevance = true,
  canDelete,
  onClick,
}) => {
  const { currentUser, isGuest, userProfile } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [usefulCount, setUsefulCount] = useState(experience.usefulCount);
  const [notUsefulCount, setNotUsefulCount] = useState(experience.notUsefulCount);
  const [userVoted, setUserVoted] = useState<'useful' | 'not_useful' | null>(experience.userVoted || null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // Author Verification: strictly verify if the logged-in user is the author who posted this experience
  const isAuthor = Boolean(
    currentUser &&
    !isGuest &&
    experience.userId &&
    (currentUser.uid === experience.userId || userProfile?.id === experience.userId)
  );

  // Delete option will show and work ONLY for the experience posted author
  const showDeleteOption = canDelete !== undefined ? (canDelete && isAuthor) : isAuthor;

  const handleVote = async (type: 'useful' | 'not_useful') => {
    if (userVoted === type) return;

    if (type === 'useful') {
      setUsefulCount((c) => c + 1);
      if (userVoted === 'not_useful') setNotUsefulCount((c) => Math.max(0, c - 1));
    } else {
      setNotUsefulCount((c) => c + 1);
      if (userVoted === 'useful') setUsefulCount((c) => Math.max(0, c - 1));
    }
    setUserVoted(type);

    await voteExperience(experience.id, type);
    if (onVote) onVote(experience.id, type);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthor) {
      setDeleteError('You can only delete experiences that you posted.');
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);
    try {
      // 1. Delete from Firestore if authenticated author
      if (currentUser && !isGuest) {
        try {
          await deleteUserExperience(experience.id);
        } catch (fsErr) {
          console.warn('Firestore direct delete notice:', fsErr);
        }
      }

      // 2. Delete via API endpoint (with backend author verification)
      const res = await deleteExperience(experience.id);
      if (!res.success && res.message && !res.message.includes('not found')) {
        setDeleteError(res.message || 'Failed to delete experience');
        setIsDeleting(false);
        return;
      }

      if (onDelete) {
        onDelete(experience.id);
      }
      setConfirmDelete(false);
    } catch (err: any) {
      console.error('Failed to delete experience:', err);
      setDeleteError(err.message || 'Failed to delete experience');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <article
      id={`experience-card-${experience.id}`}
      onClick={onClick}
      className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200/90 dark:border-amber-900/30 shadow-2xs hover:shadow-md hover:border-brand-soft-violet transition-all duration-200 overflow-hidden flex flex-col justify-between relative cursor-pointer"
    >
      {/* Delete Confirmation Overlay */}
      {confirmDelete && (
        <div className="absolute inset-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs z-20 p-5 flex flex-col justify-center items-center text-center space-y-3 animate-fadeIn">
          <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="space-y-1 max-w-xs">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Delete Experience?</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              This will permanently remove this experience from Xperiens community repository.
            </p>
            {deleteError && (
              <p className="text-xs text-rose-600 font-semibold pt-1">{deleteError}</p>
            )}
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => {
                setConfirmDelete(false);
                setDeleteError(null);
              }}
              disabled={isDeleting}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors cursor-pointer shadow-xs inline-flex items-center gap-1.5"
            >
              {isDeleting ? (
                <>
                  <div className="w-3 h-3 rounded-full border border-white border-t-transparent animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Confirm Delete</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Header bar with optional user profile banner */}
      <div className="relative overflow-hidden p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-850/40">
        {experience.bannerURL && (
          <div className="absolute inset-0 z-0">
            <img
              src={experience.bannerURL}
              alt="Creator Banner"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center opacity-25"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/80 to-white dark:from-slate-950/70 dark:via-slate-950/90 dark:to-slate-950" />
          </div>
        )}
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-200/70 dark:bg-amber-950/30 text-slate-800 dark:text-amber-300">
              {experience.category}
            </span>
            <QualityBadge label={experience.qualityLabel} />
            {isAuthor && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-800/60">
                <UserCheck className="w-3 h-3" />
                <span>Your Experience</span>
              </span>
            )}
            {experience.isDemo && (
              <Tooltip content="Created for testing and illustration. Demonstrates how real submissions look." position="top">
                <span><DemoTag /></span>
              </Tooltip>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {showRelevance && experience.relevanceScore !== undefined && (
              <Tooltip content="Calculated algorithmic match based on situation keywords, goals, and constraints" position="top">
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-800/60 cursor-help">
                  <Sparkles className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
                  <span>{experience.relevanceScore}% Relevant</span>
                </div>
              </Tooltip>
            )}

            <Tooltip content="Share or save this experience" position="top">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShareModalOpen(true);
                }}
                className="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
                title="Share experience"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </Tooltip>

            {/* Delete Option: Renders ONLY if current logged-in user is the author who posted this experience */}
            {showDeleteOption && (
              <Tooltip content="Delete your experience" position="top">
                <button
                  id={`delete-exp-btn-${experience.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmDelete(true);
                  }}
                  className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  title="Delete your experience"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                </button>
              </Tooltip>
            )}
          </div>
        </div>

        <h3 className="text-base font-semibold text-slate-900 dark:text-white leading-snug">
            {experience.title}
          </h3>

          <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 dark:text-slate-400">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>{experience.authorName}</span>
            <span>•</span>
            <span>{new Date(experience.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Structured Content (Situation -> Action -> Outcome -> Lesson) */}
      <div className="p-4 sm:p-5 space-y-3.5 text-sm flex-1">
        {/* Situation */}
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Situation
          </span>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50/70 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
            {experience.situation}
          </p>
        </div>

        {/* Actions Taken */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            What They Tried
          </span>
          <ul className="space-y-1 pl-1">
            {experience.actionsTaken.map((action, idx) => (
              <li key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                <span className="leading-snug">{action}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Outcome */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Outcome
            </span>
            <OutcomeBadge status={experience.outcomeStatus} />
          </div>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            {experience.outcome}
          </p>
        </div>

        {/* Lesson Learned */}
        <div className="space-y-1 pt-1">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Core Lesson Learned
          </span>
          <div className="p-3 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/60 text-indigo-950 dark:text-indigo-200 font-medium text-xs sm:text-sm leading-relaxed">
            "{experience.lesson}"
          </div>
        </div>

        {/* Extended details on accordion */}
        {expanded && (
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800 animate-fadeIn text-xs text-slate-600 dark:text-slate-400">
            {experience.whyChosen && (
              <div>
                <strong className="text-slate-700 dark:text-slate-300 block mb-0.5">Why they chose this approach:</strong>
                <p>{experience.whyChosen}</p>
              </div>
            )}
            {experience.whatWouldChange && (
              <div>
                <strong className="text-slate-700 dark:text-slate-300 block mb-0.5">What they would do differently:</strong>
                <p>{experience.whatWouldChange}</p>
              </div>
            )}
            {experience.tags && experience.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {experience.tags.map((tag, i) => (
                  <span key={i} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-[11px]">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer / Community Feedback bar */}
      <div className="px-4 py-3 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
        <button
          id={`toggle-expand-${experience.id}`}
          onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium cursor-pointer"
        >
          <span>{expanded ? 'Show Less' : 'Full Story'}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 hidden sm:inline">Useful?</span>
          <Tooltip content="Mark this real experience as helpful for decision-making" position="top">
            <button
              id={`vote-useful-${experience.id}`}
              onClick={() => handleVote('useful')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                userVoted === 'useful'
                  ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 font-semibold'
                  : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <ThumbsUp className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>{usefulCount}</span>
            </button>
          </Tooltip>

          <Tooltip content="Mark this experience as not applicable or unhelpful" position="top">
            <button
              id={`vote-not-useful-${experience.id}`}
              onClick={() => handleVote('not_useful')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                userVoted === 'not_useful'
                  ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700 font-semibold'
                  : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <ThumbsDown className="w-3 h-3 text-rose-500 dark:text-rose-400" />
              <span>{notUsefulCount}</span>
            </button>
          </Tooltip>
        </div>
      </div>
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        experience={experience}
      />
    </article>
  );
};
