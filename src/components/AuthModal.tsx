import React, { useState } from 'react';
import { UserProfile } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { X, Shield, Check, LogOut, Globe } from 'lucide-react';
import { ViewMode } from '../App';

interface AuthModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: ViewMode) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const { currentUser, userProfile, isGuest, logout, updateUserPreferences, loginWithGoogle } = useAuth();
  const { t } = useLanguage();
  const [name, setName] = useState(userProfile?.name || 'Explorer');
  const [isSaved, setIsSaved] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      await updateUserPreferences({ name: name.trim() });
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
        onClose();
      }, 800);
    }
  };

  const handleLogout = async () => {
    await logout();
    onClose();
    onNavigate('home');
  };

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      await loginWithGoogle();
      onClose();
    } catch (e) {
      console.error('Google sign in error:', e);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-dark-bg/60 backdrop-blur-md animate-fadeIn">
      <div className="bg-brand-card dark:bg-dark-card w-full max-w-md rounded-2xl border border-brand-border dark:border-dark-border shadow-2xl overflow-hidden flex flex-col">
        <div className="px-8 py-6 border-b border-brand-border dark:border-dark-border flex items-center justify-between">
           <div className="space-y-1">
             <h3 className="text-xl font-serif font-bold text-brand-text-primary dark:text-dark-text-primary">{t('common.account')}</h3>
             <p className="text-xs text-brand-text-secondary dark:text-dark-text-secondary font-light">{isGuest ? t('common.guest_explorer', 'Guest Explorer') : t('common.verified_member', 'Verified Member')}</p>
           </div>
           <button onClick={onClose} className="text-brand-text-secondary hover:text-brand-text-primary transition-colors"><X className="w-6 h-6" /></button>
        </div>

        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto scrollbar-hide">
           <div className="p-6 bg-brand-bg dark:bg-dark-sec-bg rounded-xl border border-brand-border dark:border-dark-border flex items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-brand-accent dark:bg-dark-accent text-white flex items-center justify-center font-serif text-2xl shadow-sm">
                 {(userProfile?.name || currentUser?.displayName || 'G').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                 <div className="text-lg font-serif font-bold text-brand-text-primary dark:text-dark-text-primary truncate">
                    {userProfile?.name || currentUser?.displayName || t('common.guest_explorer', 'Guest Explorer')}
                 </div>
                 <div className="text-xs text-brand-text-secondary dark:text-dark-text-secondary truncate font-light">
                    {isGuest ? t('common.local_session', 'Local Session Only') : currentUser?.email}
                 </div>
              </div>
           </div>

           {(isGuest || !currentUser) && (
             <div className="space-y-4">
                <p className="text-sm text-brand-text-secondary dark:text-dark-text-secondary leading-relaxed font-light">
                  {t('common.auth_desc', 'Authenticate to enable cloud synchronization and contribute to the collective wisdom library.')}
                </p>
                <div className="grid grid-cols-1 gap-3">
                   <button
                     onClick={handleGoogleSignIn}
                     disabled={googleLoading}
                     className="w-full py-3 px-4 rounded-lg bg-brand-card dark:bg-dark-card border border-brand-border dark:border-dark-border text-brand-text-primary dark:text-dark-text-primary font-bold text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-dark-sec-bg transition-all flex items-center justify-center gap-3"
                   >
                     <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
                     <span>{t('common.continue_google', 'Continue with Google')}</span>
                   </button>
                   <div className="grid grid-cols-2 gap-3">
                       <button onClick={() => { onClose(); onNavigate('login'); }} className="py-3 border border-brand-border dark:border-dark-border rounded-lg text-[10px] font-bold uppercase tracking-widest text-brand-text-primary">{t('common.login')}</button>
                       <button onClick={() => { onClose(); onNavigate('signup'); }} className="py-3 bg-brand-accent dark:bg-dark-accent text-white rounded-lg text-[10px] font-bold uppercase tracking-widest">{t('common.signup')}</button>
                   </div>
                </div>
             </div>
           )}

           <div className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-brand-text-secondary dark:text-dark-text-secondary uppercase tracking-widest">{t('share.identity.display_name')}</label>
                 <div className="flex gap-2">
                   <input
                     type="text"
                     value={name}
                     onChange={(e) => setName(e.target.value)}
                     className="flex-1 p-3 rounded-lg border border-brand-border dark:border-dark-border bg-brand-bg dark:bg-dark-sec-bg text-brand-text-primary dark:text-dark-text-primary focus:ring-1 focus:ring-brand-accent outline-none font-medium text-sm"
                   />
                   <button 
                     onClick={handleSave}
                     className="px-4 bg-brand-text-primary dark:bg-dark-text-primary text-brand-bg dark:text-dark-bg rounded-lg font-bold text-xs uppercase tracking-widest shadow-sm"
                   >
                     {isSaved ? <Check className="w-4 h-4" /> : t('common.save')}
                   </button>
                 </div>
              </div>

              <div className="space-y-3">
                 <div className="flex items-center gap-2 text-brand-text-secondary dark:text-dark-text-secondary">
                    <Globe className="w-3.5 h-3.5 text-brand-accent dark:text-dark-accent" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{t('profile.language')}</span>
                 </div>
                 <LanguageSwitcher variant="dropdown" />
              </div>

              <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl text-[10px] text-emerald-800 dark:text-emerald-300 font-light leading-relaxed border border-emerald-100 dark:border-emerald-900">
                 <Shield className="w-4 h-4 shrink-0" />
                 <span>{t('common.security_notice', 'Your data is stored securely. Sharing only happens when you explicitly choose to help the community.')}</span>
              </div>

              {currentUser && !isGuest && (
                <div className="pt-4 border-t border-brand-border dark:border-dark-border">
                  <button type="button" onClick={handleLogout} className="flex items-center gap-2 text-rose-600 font-bold text-[10px] uppercase tracking-widest">
                    <LogOut className="w-4 h-4" /> {t('common.logout')}
                  </button>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};
