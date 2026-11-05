import React, { useState } from 'react';
import { Experience } from '../types';
import { QualityBadge, OutcomeBadge, DemoTag } from '../components/Badge';
import { Tooltip } from '../components/Tooltip';
import { ThumbsUp, ThumbsDown, User, Sparkles, Trash2, AlertCircle, Share2, UserCheck, ArrowLeft, MessageSquare, Heart } from 'lucide-react';
import { voteExperience, deleteExperience } from '../services/api';
import { deleteUserExperience } from '../services/firestoreService';
import { ShareModal } from '../components/ShareModal';
import { useAuth } from '../contexts/AuthContext';

interface ExperienceDetailViewProps {
  experience: Experience;
  onBack: () => void;
  onVote?: (id: string, vote: 'useful' | 'not_useful') => void;
  onDelete?: (id: string) => void;
}

export const ExperienceDetailView: React.FC<ExperienceDetailViewProps> = ({
  experience,
  onBack,
  onVote,
  onDelete,
}) => {
  const { currentUser, isGuest, userProfile } = useAuth();
  const [usefulCount, setUsefulCount] = useState(experience.usefulCount);
  const [notUsefulCount, setNotUsefulCount] = useState(experience.notUsefulCount);
  const [userVoted, setUserVoted] = useState<'useful' | 'not_useful' | null>(experience.userVoted || null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  
  // Comments state
  const [comments, setComments] = useState<Array<{ id: string; author: string; text: string; date: string }>>([
    { id: '1', author: 'Elena Rostova', text: 'This was extremely helpful when I faced a similar hurdle last quarter.', date: '2 days ago' },
    { id: '2', author: 'Marcus Vance', text: 'The emphasis on step 2 completely changed my workflow.', date: 'Yesterday' }
  ]);
  const [newComment, setNewComment] = useState('');
  const [likes, setLikes] = useState(usefulCount);
  const [liked, setLiked] = useState(false);

  const isAuthor = Boolean(
    currentUser &&
    !isGuest &&
    experience.userId &&
    (currentUser.uid === experience.userId || userProfile?.id === experience.userId)
  );

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

  const handleLike = () => {
    if (liked) {
      setLikes(l => Math.max(0, l - 1));
      setLiked(false);
    } else {
      setLikes(l => l + 1);
      setLiked(true);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setComments(prev => [
      {
        id: String(Date.now()),
        author: userProfile?.displayName || currentUser?.email?.split('@')[0] || 'Community Member',
        text: newComment.trim(),
        date: 'Just now'
      },
      ...prev
    ]);
    setNewComment('');
  };

  const handleDelete = async () => {
    if (!isAuthor) {
      setDeleteError('You can only delete experiences that you posted.');
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);
    try {
      if (currentUser && !isGuest) {
        try {
          await deleteUserExperience(experience.id);
        } catch (fsErr) {
          console.warn('Firestore delete notice:', fsErr);
        }
      }

      const res = await deleteExperience(experience.id);
      if (!res.success && res.message && !res.message.includes('not found')) {
        setDeleteError(res.message || 'Failed to delete experience');
        setIsDeleting(false);
        return;
      }

      if (onDelete) {
        onDelete(experience.id);
      }
      onBack();
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete experience');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <article className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-10 animate-fadeIn pb-24">
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-charcoal dark:text-brand-warm-ivory hover:text-brand-soft-violet transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Stories</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShareModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-brand-charcoal/5 dark:bg-brand-warm-ivory/10 text-brand-charcoal dark:text-brand-warm-ivory hover:bg-brand-charcoal/10 transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>

          {isAuthor && (
            <button
              onClick={() => setConfirmDelete(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal / Banner */}
      {confirmDelete && (
        <div className="p-6 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-rose-600 dark:text-rose-400 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-rose-900 dark:text-rose-200 text-sm">Delete this experience?</h4>
              <p className="text-xs text-rose-700 dark:text-rose-300">This action cannot be undone.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold shadow-xs"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-rose-700"
            >
              {isDeleting ? 'Deleting...' : 'Confirm Delete'}
            </button>
          </div>
        </div>
      )}

      {/* Editorial Header */}
      <div className="space-y-6 text-center max-w-2xl mx-auto">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-brand-deep-indigo/10 dark:bg-brand-soft-violet/20 text-brand-deep-indigo dark:text-brand-warm-ivory uppercase tracking-wider">
            {experience.category}
          </span>
          <QualityBadge label={experience.qualityLabel} />
          {experience.isDemo && <DemoTag />}
        </div>

        <h1 className="text-3xl sm:text-5xl font-serif text-brand-deep-indigo dark:text-brand-warm-ivory tracking-tight leading-tight">
          {experience.title}
        </h1>

        <div className="flex items-center justify-center gap-3 text-sm text-brand-charcoal/60 dark:text-brand-warm-ivory/60">
          <div className="flex items-center gap-1.5">
            <User className="w-4 h-4" />
            <span className="font-medium text-brand-charcoal dark:text-brand-warm-ivory">{experience.authorName}</span>
          </div>
          <span>•</span>
          <time dateTime={experience.createdAt}>
            {new Date(experience.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
          </time>
        </div>
      </div>

      {/* Hero Media / Banner Header */}
      <div className="h-72 sm:h-96 w-full rounded-3xl bg-brand-lavender-mist dark:bg-slate-900 border border-brand-charcoal/10 dark:border-brand-warm-ivory/10 overflow-hidden relative shadow-sm flex items-center justify-center">
        {experience.bannerURL ? (
          <>
            <img
              src={experience.bannerURL}
              alt="Creator Banner"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
            <div className="text-center p-6 space-y-2 relative z-10 text-white">
              <Sparkles className="w-8 h-8 text-brand-soft-violet mx-auto" />
              <p className="text-lg font-serif italic text-white drop-shadow-sm">"{experience.title}"</p>
              <span className="text-xs text-white/80 uppercase tracking-widest font-sans">Verified Experience Insight</span>
            </div>
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-deep-indigo/20 via-transparent to-brand-soft-violet/10"></div>
            <div className="text-center p-6 space-y-2 z-10">
              <Sparkles className="w-8 h-8 text-brand-soft-violet mx-auto" />
              <p className="text-sm font-serif italic text-brand-deep-indigo dark:text-brand-warm-ivory">"{experience.title}"</p>
              <span className="text-xs text-brand-charcoal/50 dark:text-brand-warm-ivory/50 uppercase tracking-widest">Verified Experience Insight</span>
            </div>
          </>
        )}
      </div>

      {/* Complete Experience Content & Six Mandatory Reflection Pillars */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Main Prose Content (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-8 font-sans text-brand-charcoal dark:text-brand-warm-ivory leading-relaxed">
          
          {/* Pillar 1: Situation */}
          <section className="space-y-3 p-6 rounded-2xl bg-white dark:bg-brand-charcoal border border-brand-charcoal/10 dark:border-brand-warm-ivory/10 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-soft-violet">Pillar 1: Initial Situation</span>
            </div>
            <p className="text-base font-serif leading-relaxed text-brand-charcoal/90 dark:text-brand-warm-ivory/90">
              {experience.situation}
            </p>
          </section>

          {/* Pillar 2: Actions Taken */}
          <section className="space-y-3 p-6 rounded-2xl bg-white dark:bg-brand-charcoal border border-brand-charcoal/10 dark:border-brand-warm-ivory/10 shadow-2xs">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-soft-violet">Pillar 2: Actions Taken</span>
            <ul className="space-y-2.5">
              {experience.actionsTaken.map((action, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm">
                  <span className="w-6 h-6 rounded-full bg-brand-deep-indigo/10 dark:bg-brand-soft-violet/20 text-brand-deep-indigo dark:text-brand-warm-ivory flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Pillar 3: Why This Approach Was Chosen */}
          {experience.whyChosen && (
            <section className="space-y-3 p-6 rounded-2xl bg-white dark:bg-brand-charcoal border border-brand-charcoal/10 dark:border-brand-warm-ivory/10 shadow-2xs">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-soft-violet">Pillar 3: Strategic Rationale</span>
              <p className="text-sm text-brand-charcoal/80 dark:text-brand-warm-ivory/80 leading-relaxed">
                {experience.whyChosen}
              </p>
            </section>
          )}

          {/* Pillar 4: Outcome */}
          <section className="space-y-3 p-6 rounded-2xl bg-white dark:bg-brand-charcoal border border-brand-charcoal/10 dark:border-brand-warm-ivory/10 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-soft-violet">Pillar 4: Observed Outcome</span>
              <OutcomeBadge status={experience.outcomeStatus} />
            </div>
            <p className="text-base font-serif leading-relaxed text-brand-charcoal/90 dark:text-brand-warm-ivory/90">
              {experience.outcome}
            </p>
          </section>

          {/* Pillar 5: Core Lesson Learned */}
          <section className="space-y-3 p-6 rounded-2xl bg-brand-deep-indigo text-white shadow-md">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-soft-violet">Pillar 5: Core Lesson Learned</span>
            <blockquote className="text-lg font-serif italic text-indigo-100">
              "{experience.lesson}"
            </blockquote>
          </section>

          {/* Pillar 6: What Would Change / Future Adaptation */}
          {experience.whatWouldChange && (
            <section className="space-y-3 p-6 rounded-2xl bg-white dark:bg-brand-charcoal border border-brand-charcoal/10 dark:border-brand-warm-ivory/10 shadow-2xs">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-soft-violet">Pillar 6: Retrospective & Adjustments</span>
              <p className="text-sm text-brand-charcoal/80 dark:text-brand-warm-ivory/80 leading-relaxed">
                {experience.whatWouldChange}
              </p>
            </section>
          )}
        </div>

        {/* Sidebar: Metadata, Likes & Comments (Right col) */}
        <div className="space-y-6">
          {/* Interaction Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-brand-charcoal border border-brand-charcoal/10 dark:border-brand-warm-ivory/10 shadow-sm space-y-6">
            <h3 className="font-serif text-lg text-brand-deep-indigo dark:text-brand-warm-ivory">Engage with Story</h3>

            <div className="flex items-center justify-between pt-2 border-t border-brand-charcoal/10 dark:border-brand-warm-ivory/10">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  liked
                    ? 'bg-rose-50 text-rose-600 border border-rose-200'
                    : 'bg-brand-charcoal/5 dark:bg-brand-warm-ivory/10 text-brand-charcoal dark:text-brand-warm-ivory hover:opacity-80'
                }`}
              >
                <Heart className={`w-4 h-4 ${liked ? 'fill-rose-600 text-rose-600' : ''}`} />
                <span>{likes} Likes</span>
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleVote('useful')}
                  className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                    userVoted === 'useful'
                      ? 'bg-emerald-100 text-emerald-800 font-bold'
                      : 'bg-brand-charcoal/5 dark:bg-brand-warm-ivory/10 text-brand-charcoal dark:text-brand-warm-ivory'
                  }`}
                  title="Mark Useful"
                >
                  <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{usefulCount}</span>
                </button>

                <button
                  onClick={() => handleVote('not_useful')}
                  className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                    userVoted === 'not_useful'
                      ? 'bg-rose-100 text-rose-800 font-bold'
                      : 'bg-brand-charcoal/5 dark:bg-brand-warm-ivory/10 text-brand-charcoal dark:text-brand-warm-ivory'
                  }`}
                  title="Mark Not Useful"
                >
                  <ThumbsDown className="w-3.5 h-3.5 text-rose-500" />
                  <span>{notUsefulCount}</span>
                </button>
              </div>
            </div>

            {experience.tags && experience.tags.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-brand-charcoal/10 dark:border-brand-warm-ivory/10">
                <span className="text-xs font-semibold text-brand-charcoal/60 dark:text-brand-warm-ivory/60 block">Tags</span>
                <div className="flex flex-wrap gap-1.5">
                  {experience.tags.map((tag, i) => (
                    <span key={i} className="px-2.5 py-1 bg-brand-charcoal/5 dark:bg-brand-warm-ivory/10 text-brand-charcoal dark:text-brand-warm-ivory rounded-lg text-xs">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="p-6 rounded-2xl bg-white dark:bg-brand-charcoal border border-brand-charcoal/10 dark:border-brand-warm-ivory/10 shadow-sm space-y-6">
            <h3 className="font-serif text-lg text-brand-deep-indigo dark:text-brand-warm-ivory flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-brand-soft-violet" />
              <span>Discussion ({comments.length})</span>
            </h3>

            <form onSubmit={handleAddComment} className="space-y-3">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add your perspective or question..."
                rows={3}
                className="w-full p-3 rounded-xl border border-brand-charcoal/10 dark:border-brand-warm-ivory/10 bg-brand-warm-ivory/50 dark:bg-slate-900 text-xs focus:ring-2 focus:ring-brand-soft-violet outline-none resize-none"
              ></textarea>
              <button
                type="submit"
                className="w-full py-2.5 bg-brand-deep-indigo dark:bg-brand-soft-violet text-white text-xs font-bold rounded-xl hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
              >
                Post Comment
              </button>
            </form>

            <div className="space-y-4 pt-2">
              {comments.map((c) => (
                <div key={c.id} className="p-3.5 rounded-xl bg-brand-warm-ivory/40 dark:bg-slate-900/60 border border-brand-charcoal/5 dark:border-brand-warm-ivory/5 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-brand-deep-indigo dark:text-brand-warm-ivory">{c.author}</span>
                    <span className="text-[10px] text-brand-charcoal/50 dark:text-brand-warm-ivory/50">{c.date}</span>
                  </div>
                  <p className="text-xs text-brand-charcoal/80 dark:text-brand-warm-ivory/80 leading-relaxed">{c.text}</p>
                </div>
              ))}
            </div>
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
