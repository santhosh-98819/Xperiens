import React, { useState } from 'react';
import { Experience } from '../types';
import { QualityBadge, OutcomeBadge, DemoTag } from '../components/Badge';
import { ThumbsUp, ThumbsDown, User, Sparkles, Trash2, AlertCircle, Share2, ArrowLeft, MessageSquare, Heart } from 'lucide-react';
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
    setLikes(l => liked ? Math.max(0, l - 1) : l + 1);
    setLiked(!liked);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setComments(prev => [{
      id: String(Date.now()),
      author: userProfile?.name || currentUser?.displayName || 'Contributor',
      text: newComment.trim(),
      date: 'Just now'
    }, ...prev]);
    setNewComment('');
  };

  const handleDelete = async () => {
    if (!isAuthor) return;
    setIsDeleting(true);
    try {
      if (currentUser && !isGuest) await deleteUserExperience(experience.id);
      await deleteExperience(experience.id);
      if (onDelete) onDelete(experience.id);
      onBack();
    } catch (err: any) {
      setDeleteError(err.message || 'Deletion failed.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <article className="max-w-4xl mx-auto py-12 px-4 space-y-16 animate-fadeIn pb-32">
      {/* Top Nav */}
      <nav className="flex items-center justify-between border-b border-brand-border dark:border-dark-border pb-6">
        <button onClick={onBack} className="group flex items-center gap-2 text-xs font-bold text-brand-text-secondary hover:text-brand-text-primary transition-colors">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Wisdom
        </button>
        <div className="flex items-center gap-4">
          <button onClick={() => setShareModalOpen(true)} className="p-2 text-brand-text-secondary hover:text-brand-text-primary transition-colors"><Share2 className="w-5 h-5" /></button>
          {isAuthor && <button onClick={() => setConfirmDelete(true)} className="p-2 text-rose-500 hover:opacity-80 transition-opacity"><Trash2 className="w-5 h-5" /></button>}
        </div>
      </nav>

      {/* Delete Confirmation */}
      {confirmDelete && (
        <div className="p-8 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
             <h4 className="text-lg font-serif font-bold text-rose-900 dark:text-rose-200">Permanently delete this story?</h4>
             <p className="text-sm text-rose-700 dark:text-rose-400">This reflection will be removed from the collective knowledge base.</p>
          </div>
          <div className="flex gap-3">
             <button onClick={() => setConfirmDelete(false)} className="px-6 py-2 bg-white dark:bg-dark-bg border border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200 font-bold text-xs rounded-lg">Cancel</button>
             <button onClick={handleDelete} disabled={isDeleting} className="px-6 py-2 bg-rose-600 text-white font-bold text-xs rounded-lg">{isDeleting ? 'Deleting...' : 'Confirm Delete'}</button>
          </div>
        </div>
      )}

      {/* Editorial Header */}
      <header className="space-y-8 text-center">
        <div className="flex items-center justify-center gap-2 text-[10px] font-bold tracking-widest uppercase text-brand-text-secondary">
          <span>{experience.category}</span>
          <span aria-hidden="true">·</span>
          <QualityBadge label={experience.qualityLabel} />
          {experience.isDemo && <><span aria-hidden="true">·</span><DemoTag /></>}
        </div>

        <h1 className="text-4xl lg:text-6xl font-serif font-bold text-brand-text-primary dark:text-dark-text-primary leading-tight max-w-3xl mx-auto">
          {experience.title}
        </h1>

        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2 text-sm font-medium text-brand-text-primary dark:text-dark-text-primary">
             <User className="w-4 h-4" />
             <span>{experience.authorName}</span>
          </div>
          <span className="text-xs text-brand-text-secondary opacity-60">Published {new Date(experience.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
        </div>
      </header>

      {/* Hero Visualization */}
      <div className="aspect-[21/9] w-full rounded-[2rem] bg-brand-accent/5 dark:bg-dark-accent/5 border border-brand-accent/10 dark:border-dark-accent/10 overflow-hidden relative group">
         {experience.bannerURL ? (
           <img src={experience.bannerURL} alt="" className="w-full h-full object-cover" />
         ) : (
           <div className="w-full h-full flex items-center justify-center">
              <Sparkles className="w-16 h-16 text-brand-accent dark:text-dark-accent opacity-20 group-hover:scale-110 transition-transform duration-700" />
           </div>
         )}
         <div className="absolute inset-0 bg-gradient-to-t from-brand-bg dark:from-dark-bg via-transparent to-transparent opacity-40" />
      </div>

      {/* 6-Pillar Framework Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-12">
          {[
            { id: '01', title: 'The Initial Situation', val: experience.situation, serif: true },
            { id: '02', title: 'Tactical implementation', list: experience.actionsTaken },
            { id: '03', title: 'Strategic Rationale', val: experience.whyChosen },
            { id: '04', title: 'Observed Outcome', val: experience.outcome, badge: experience.outcomeStatus },
            { id: '05', title: 'The Core Lesson', val: experience.lesson, highlight: true },
            { id: '06', title: 'Retrospective Adjustments', val: experience.whatWouldChange, italic: true }
          ].map((pillar) => (
            <section key={pillar.id} className="space-y-4">
              <div className="flex items-center justify-between border-b border-brand-border dark:border-dark-border pb-2">
                <div className="flex items-center gap-3">
                   <span className="text-[10px] font-bold text-brand-accent dark:text-dark-accent">{pillar.id}</span>
                   <h2 className="text-[10px] font-bold tracking-widest uppercase text-brand-text-secondary">{pillar.title}</h2>
                </div>
                {pillar.badge && <OutcomeBadge status={pillar.badge as any} />}
              </div>

              {pillar.list ? (
                <ul className="space-y-4 pt-2">
                  {pillar.list.map((item, idx) => (
                    <li key={idx} className="flex gap-4 items-start text-sm text-brand-text-primary dark:text-dark-text-primary leading-relaxed">
                       <span className="w-1.5 h-1.5 rounded-full bg-brand-accent mt-2 shrink-0" />
                       {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className={`pt-2 ${pillar.highlight ? 'p-8 bg-brand-text-primary dark:bg-dark-accent text-white dark:text-dark-bg rounded-2xl italic font-serif text-xl' : pillar.serif ? 'font-serif text-lg leading-relaxed' : 'text-sm leading-relaxed'} ${pillar.italic ? 'italic text-brand-text-secondary' : 'text-brand-text-primary dark:text-dark-text-primary'}`}>
                  {pillar.val || 'Not documented.'}
                </div>
              )}
            </section>
          ))}
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-12">
          <section className="p-8 bg-brand-card dark:bg-dark-card border border-brand-border dark:border-dark-border rounded-2xl space-y-8">
             <div className="space-y-2">
                <h3 className="text-lg font-serif font-bold">Community Impact</h3>
                <p className="text-xs text-brand-text-secondary">Help others find this story by marking its utility.</p>
             </div>
             
             <div className="grid grid-cols-2 gap-3">
                <button onClick={() => handleVote('useful')} className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${userVoted === 'useful' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600' : 'border-brand-border dark:border-dark-border hover:bg-brand-bg dark:hover:bg-dark-bg'}`}>
                   <ThumbsUp className="w-5 h-5 mb-2" />
                   <span className="text-[10px] font-bold uppercase">Useful</span>
                   <span className="text-xs font-bold mt-1">{usefulCount}</span>
                </button>
                <button onClick={() => handleVote('not_useful')} className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${userVoted === 'not_useful' ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/20 text-rose-600' : 'border-brand-border dark:border-dark-border hover:bg-brand-bg dark:hover:bg-dark-bg'}`}>
                   <ThumbsDown className="w-5 h-5 mb-2" />
                   <span className="text-[10px] font-bold uppercase">N/A</span>
                   <span className="text-xs font-bold mt-1">{notUsefulCount}</span>
                </button>
             </div>

             <button onClick={handleLike} className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${liked ? 'bg-rose-500 border-rose-500 text-white' : 'border-brand-border dark:border-dark-border hover:bg-brand-bg dark:hover:bg-dark-bg'}`}>
                <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                <span className="text-xs font-bold">{likes} Likes</span>
             </button>
          </section>

          <section className="space-y-6">
             <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-brand-text-secondary border-b border-brand-border dark:border-dark-border pb-2">
                <MessageSquare className="w-3 h-3" />
                <span>Discussion</span>
             </div>

             <form onSubmit={handleAddComment} className="space-y-3">
                <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Share your perspective..." rows={3} className="w-full p-4 rounded-xl border border-brand-border dark:border-dark-border bg-brand-bg dark:bg-dark-bg text-sm focus:border-brand-accent outline-none" />
                <button type="submit" className="w-full py-3 bg-brand-text-primary dark:bg-dark-text-primary text-white dark:text-dark-bg text-xs font-bold rounded-xl hover:opacity-90 transition-opacity">Post Reflection</button>
             </form>

             <div className="space-y-6 pt-4">
                {comments.map((c) => (
                  <div key={c.id} className="space-y-2 group">
                     <div className="flex items-center justify-between text-[10px] font-bold tracking-widest uppercase text-brand-text-secondary">
                        <span>{c.author}</span>
                        <span className="opacity-40 group-hover:opacity-100 transition-opacity">{c.date}</span>
                     </div>
                     <p className="text-sm text-brand-text-primary dark:text-dark-text-primary leading-relaxed">{c.text}</p>
                  </div>
                ))}
             </div>
          </section>
        </aside>
      </div>

      <ShareModal isOpen={shareModalOpen} onClose={() => setShareModalOpen(false)} experience={experience} />
    </article>
  );
};
