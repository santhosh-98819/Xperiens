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
  Sparkles,
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
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (experience) setIsSaved(isExperienceSaved(experience.id));
      else if (solution) setIsSaved(isSolutionSaved(solution.id));
      setCopiedLink(false);
      setCopiedSummary(false);
    }
  }, [isOpen, experience, solution]);

  if (!isOpen) return null;

  const currentUrl = window.location.href;
  const title = experience?.title || solution?.originalProblem?.problem || 'Action Plan';
  
  const handleToggleSave = () => {
    let savedNow = false;
    if (experience) savedNow = saveExperienceLocally(experience);
    else if (solution) savedNow = saveSolutionLocally(solution);
    setIsSaved(savedNow);

    if (savedNow) {
      try {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.7 },
          colors: ['#8B9CF6', '#5969C7'],
        });
      } catch (e) {}
    }
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(currentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-dark-bg/60 backdrop-blur-md animate-fadeIn">
      <div className="bg-brand-card dark:bg-dark-card w-full max-w-lg rounded-2xl border border-brand-border dark:border-dark-border shadow-2xl overflow-hidden flex flex-col">
        <div className="px-8 py-6 border-b border-brand-border dark:border-dark-border flex items-center justify-between">
           <div className="space-y-1">
             <h3 className="text-xl font-serif font-bold text-brand-text-primary dark:text-dark-text-primary">Share Wisdom</h3>
             <p className="text-xs text-brand-text-secondary dark:text-dark-text-secondary font-light">Spread collective knowledge across your network.</p>
           </div>
           <button onClick={onClose} className="text-brand-text-secondary hover:text-brand-text-primary transition-colors"><X className="w-6 h-6" /></button>
        </div>

        <div className="p-8 space-y-8">
           <div className="p-5 bg-brand-bg dark:bg-dark-sec-bg rounded-xl border border-brand-border dark:border-dark-border space-y-2">
              <span className="text-[10px] font-bold text-brand-text-secondary dark:text-dark-text-secondary uppercase tracking-widest opacity-60">Item:</span>
              <p className="text-sm font-serif font-bold text-brand-text-primary dark:text-dark-text-primary line-clamp-2">"{title}"</p>
           </div>

           <div className="grid grid-cols-1 gap-4">
              <button
                onClick={handleToggleSave}
                className={`flex items-center justify-between p-5 rounded-xl border transition-all ${
                  isSaved 
                    ? 'bg-brand-accent dark:bg-dark-accent text-white border-brand-accent shadow-sm' 
                    : 'bg-brand-card dark:bg-dark-card border-brand-border dark:border-dark-border text-brand-text-primary hover:border-brand-accent'
                }`}
              >
                <div className="flex items-center gap-4">
                   <Bookmark className="w-5 h-5" />
                   <div className="text-left">
                      <div className="text-sm font-bold">Personal Library</div>
                      <div className={`text-[11px] opacity-70 ${isSaved ? 'text-white' : ''}`}>Reference this later in your profile.</div>
                   </div>
                </div>
                {isSaved && <Check className="w-4 h-4" />}
              </button>

              <button
                onClick={handleCopyLink}
                className="flex items-center justify-between p-5 rounded-xl border border-brand-border dark:border-dark-border bg-brand-card dark:bg-dark-card text-brand-text-primary hover:border-brand-accent transition-all"
              >
                <div className="flex items-center gap-4">
                   <Copy className="w-5 h-5 text-brand-text-secondary" />
                   <div className="text-left">
                      <div className="text-sm font-bold">Copy Link</div>
                      <div className="text-[11px] text-brand-text-secondary font-light">Copy URL to your clipboard.</div>
                   </div>
                </div>
                {copiedLink && <Check className="w-4 h-4 text-emerald-600" />}
              </button>
           </div>

           <div className="space-y-4">
              <label className="text-[10px] font-bold text-brand-text-secondary dark:text-dark-text-secondary uppercase tracking-widest">Instant Share</label>
              <div className="grid grid-cols-3 gap-3">
                 {[
                   { id: 'whatsapp', icon: MessageCircle, label: 'WhatsApp', color: 'text-emerald-600' },
                   { id: 'linkedin', icon: Linkedin, label: 'LinkedIn', color: 'text-sky-600' },
                   { id: 'twitter', icon: Twitter, label: 'Twitter', color: 'text-slate-900 dark:text-white' }
                 ].map(social => (
                   <button
                     key={social.id}
                     className="p-4 rounded-xl border border-brand-border dark:border-dark-border bg-brand-card dark:bg-dark-card hover:bg-slate-50 dark:hover:bg-dark-sec-bg transition-all flex flex-col items-center gap-2"
                   >
                     <social.icon className={`w-5 h-5 ${social.color}`} />
                     <span className="text-[10px] font-bold uppercase tracking-widest">{social.label}</span>
                   </button>
                 ))}
              </div>
           </div>
        </div>

        <div className="px-8 py-4 bg-brand-bg dark:bg-dark-sec-bg border-t border-brand-border dark:border-dark-border flex items-center justify-center">
           <p className="text-[10px] font-bold text-brand-text-secondary dark:text-dark-text-secondary uppercase tracking-widest flex items-center gap-2">
             <Sparkles className="w-3 h-3" />
             Knowledge is meant to be shared
           </p>
        </div>
      </div>
    </div>
  );
};
