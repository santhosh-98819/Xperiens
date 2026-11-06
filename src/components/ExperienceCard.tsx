import React, { useState } from 'react';
import { Experience } from '../types';
import { QualityBadge, OutcomeBadge, DemoTag } from './Badge';
import { Tooltip } from './Tooltip';
import { ThumbsUp, ThumbsDown, ChevronDown, ChevronUp, User, Sparkles, Trash2, AlertCircle, Share2, UserCheck } from 'lucide-react';
import { voteExperience, deleteExperience } from '../services/api';
import { deleteUserExperience } from '../services/firestoreService';
import { ShareModal } from './ShareModal';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

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
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const [usefulCount, setUsefulCount] = useState(experience.usefulCount);
  const [notUsefulCount, setNotUsefulCount] = useState(experience.notUsefulCount);
  const [userVoted, setUserVoted] = useState<'useful' | 'not_useful' | null>(experience.userVoted || null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const isAuthor = Boolean(
    currentUser &&
    !isGuest &&
    experience.userId &&
    (currentUser.uid === experience.userId || userProfile?.id === experience.userId)
  );

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
      setDeleteError(t('profile.error_not_author', 'You can only delete experiences that you posted.'));
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);
    try {
      if (currentUser && !isGuest) {
        try {
          await deleteUserExperience(experience.id);
        } catch (fsErr) {
          console.warn('Firestore direct delete notice:', fsErr);
        }
      }

      const res = await deleteExperience(experience.id);
      if (!res.success && res.message && !res.message.includes('not found')) {
        setDeleteError(res.message || t('common.error'));
        setIsDeleting(false);
        return;
      }

      if (onDelete) {
        onDelete(experience.id);
      }
      setConfirmDelete(false);
    } catch (err: any) {
      console.error('Failed to delete experience:', err);
      setDeleteError(err.message || t('common.error'));
    } finally {
      setIsDeleting(false);
    }
  };

  const formattedDate = new Date(experience.createdAt).toLocaleDateString(undefined, { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });

  return (
    <article
      onClick={onClick}
      className="group bg-brand-card dark:bg-dark-card rounded-2xl border border-brand-border dark:border-dark-border overflow-hidden flex flex-col h-full hover:border-brand-accent dark:hover:border-dark-accent transition-all duration-300 relative cursor-pointer"
    >
      {/* Delete Confirmation Overlay */}
      {confirmDelete && (
        <div className="absolute inset-0 bg-brand-bg/95 dark:bg-dark-bg/95 backdrop-blur-sm z-20 p-6 flex flex-col justify-center items-center text-center space-y-4 animate-fadeIn">
          <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-lg font-serif font-bold text-brand-text-primary dark:text-dark-text-primary">{t('profile.delete_story_title', 'Delete Story?')}</h4>
            <p className="text-sm text-brand-text-secondary dark:text-dark-text-secondary">
              {t('profile.delete_story_confirm', 'This will permanently remove this experience from the platform.')}
            </p>
            {deleteError && (
              <p className="text-xs text-rose-600 font-semibold pt-1">{deleteError}</p>
            )}
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setConfirmDelete(false);
                setDeleteError(null);
              }}
              disabled={isDeleting}
              className="px-4 py-2 rounded-lg text-sm font-bold text-brand-text-secondary dark:text-dark-text-secondary bg-brand-border/20 dark:bg-dark-border/20 hover:bg-brand-border/40 dark:hover:bg-dark-border/40 transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm inline-flex items-center gap-2"
            >
              {isDeleting ? t('common.deleting', 'Deleting...') : t('common.confirm_delete', 'Confirm Delete')}
            </button>
          </div>
        </div>
      )}

      {/* Main Layout */}
      <div className="flex flex-col h-full">
        {/* Banner/Header */}
        <div className="p-6 pb-4 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-brand-text-secondary dark:text-dark-text-secondary">
              <span>{experience.category}</span>
              <span aria-hidden="true">·</span>
              <QualityBadge label={experience.qualityLabel} />
              {experience.isDemo && (
                <>
                  <span aria-hidden="true">·</span>
                  <DemoTag />
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShareModalOpen(true);
                }}
                className="p-1.5 text-brand-text-secondary dark:text-dark-text-secondary hover:text-brand-accent dark:hover:text-dark-accent transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </button>
              {showDeleteOption && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmDelete(true);
                  }}
                  className="p-1.5 text-brand-text-secondary dark:text-dark-text-secondary hover:text-rose-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <h3 className="text-xl font-serif font-bold text-brand-text-primary dark:text-dark-text-primary leading-tight group-hover:text-brand-accent dark:group-hover:text-dark-accent transition-colors">
            {experience.title}
          </h3>

          <div className="flex items-center gap-2 text-xs text-brand-text-secondary dark:text-dark-text-secondary">
            <span className="font-semibold text-brand-text-primary dark:text-dark-text-primary">{experience.authorName}</span>
            <span aria-hidden="true">·</span>
            <span>{formattedDate}</span>
            {isAuthor && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-brand-accent dark:text-dark-accent font-bold">{t('common.your_story', 'Your Story')}</span>
              </>
            )}
          </div>
        </div>

        {/* Content Preview */}
        <div className="px-6 py-4 flex-1 space-y-6">
          <div className="space-y-2">
            <div className="text-[10px] font-bold tracking-widest uppercase text-brand-text-secondary dark:text-dark-text-secondary opacity-60">{t('common.situation', 'Situation')}</div>
            <p className="text-sm text-brand-text-primary dark:text-dark-text-primary leading-relaxed line-clamp-3">
              {experience.situation}
            </p>
          </div>

          <div className="space-y-3">
             <div className="text-[10px] font-bold tracking-widest uppercase text-brand-text-secondary dark:text-dark-text-secondary opacity-60">{t('common.core_lesson', 'Core Lesson')}</div>
             <div className="p-4 rounded-xl bg-brand-accent/5 dark:bg-dark-accent/5 border border-brand-accent/10 dark:border-dark-accent/10 italic font-serif text-brand-text-primary dark:text-dark-text-primary">
               "{experience.lesson}"
             </div>
          </div>

          {expanded && (
            <div className="space-y-6 pt-4 border-t border-brand-border dark:border-dark-border animate-fadeIn">
              <div className="space-y-2">
                <div className="text-[10px] font-bold tracking-widest uppercase text-brand-text-secondary dark:text-dark-text-secondary opacity-60">{t('common.actions_taken', 'Actions Taken')}</div>
                <ul className="space-y-2">
                  {experience.actionsTaken.map((action, idx) => (
                    <li key={idx} className="text-sm text-brand-text-primary dark:text-dark-text-primary flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-brand-accent dark:bg-dark-accent mt-2 shrink-0" />
                      {action}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-bold tracking-widest uppercase text-brand-text-secondary dark:text-dark-text-secondary opacity-60">{t('common.outcome', 'Outcome')}</div>
                  <OutcomeBadge status={experience.outcomeStatus} />
                </div>
                <p className="text-sm text-brand-text-primary dark:text-dark-text-primary leading-relaxed">
                  {experience.outcome}
                </p>
              </div>

              {experience.whatWouldChange && (
                <div className="space-y-2">
                  <div className="text-[10px] font-bold tracking-widest uppercase text-brand-text-secondary dark:text-dark-text-secondary opacity-60">{t('common.retrospective', 'Retrospective')}</div>
                  <p className="text-sm text-brand-text-primary dark:text-dark-text-primary leading-relaxed italic">
                    {experience.whatWouldChange}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-brand-border dark:border-dark-border flex items-center justify-between">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="text-xs font-bold text-brand-text-primary dark:text-dark-text-primary hover:text-brand-accent dark:hover:text-dark-accent transition-colors flex items-center gap-1"
          >
            {expanded ? t('common.show_less', 'Show less') : t('common.read_more', 'Read full story')}
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleVote('useful');
              }}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-all ${
                userVoted === 'useful' 
                  ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30' 
                  : 'text-brand-text-secondary dark:text-dark-text-secondary hover:text-brand-text-primary dark:hover:text-dark-text-primary'
              }`}
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${userVoted === 'useful' ? 'fill-current' : ''}`} />
              <span className="text-xs font-bold tabular-nums">{usefulCount}</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleVote('not_useful');
              }}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-all ${
                userVoted === 'not_useful' 
                  ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30' 
                  : 'text-brand-text-secondary dark:text-dark-text-secondary hover:text-brand-text-primary dark:hover:text-dark-text-primary'
              }`}
            >
              <ThumbsDown className={`w-3.5 h-3.5 ${userVoted === 'not_useful' ? 'fill-current' : ''}`} />
              <span className="text-xs font-bold tabular-nums">{notUsefulCount}</span>
            </button>
          </div>
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
