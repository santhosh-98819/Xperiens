import React, { useState } from 'react';
import { UserProfile } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useWritingAssist } from '../contexts/WritingAssistContext';
import { X, User, Shield, Check, LogOut, Trash2, Mail, Lock, UserPlus, Sparkles } from 'lucide-react';
import { ViewMode } from '../App';

interface AuthModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: ViewMode) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const { currentUser, userProfile, isGuest, logout, updateUserPreferences, loginWithGoogle } = useAuth();
  const { isEnabled: isWritingAssistEnabled, setIsEnabled: setWritingAssistEnabled } = useWritingAssist();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div
        id="auth-modal-card"
        className="bg-white w-full max-w-md rounded-3xl border border-slate-200 shadow-2xl overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
              CM
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                User Profile & Account
              </h3>
              <p className="text-xs text-slate-500">
                {isGuest || !currentUser ? 'Guest Mode' : 'Authenticated Firebase Account'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* User Status Card */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                {(userProfile?.name || currentUser?.displayName || 'G').charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">
                  {userProfile?.name || currentUser?.displayName || 'Guest Explorer'}
                </div>
                <div className="text-xs text-slate-500">
                  {isGuest || !currentUser ? 'Guest session (Data stored locally)' : currentUser.email}
                </div>
              </div>
            </div>
            {isGuest && (
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                Guest
              </span>
            )}
          </div>

          {/* If Guest: Prompt Sign Up / Login / Google */}
          {(isGuest || !currentUser) && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="text-xs text-slate-700 leading-relaxed">
                <span className="font-bold text-slate-900 block mb-1">Create an account to unlock:</span>
                • Cloud synchronization across devices
                <br />• Permanent solution tracking & history
                <br />• Verified community experience contributions
              </div>
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading}
                  className="w-full py-2 px-3 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 shadow-2xs cursor-pointer flex items-center justify-center gap-2"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Continue with Google</span>
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      onClose();
                      onNavigate('login');
                    }}
                    className="py-2 px-3 rounded-xl text-xs font-bold text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 shadow-2xs cursor-pointer text-center"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      onNavigate('signup');
                    }}
                    className="py-2 px-3 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs cursor-pointer text-center"
                  >
                    Create Account
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Edit Display Name */}
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Display Name
              </label>
              <input
                type="text"
                id="modal-display-name-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name or alias"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-hidden"
              />
            </div>

            {/* AI Writing Assistant Preference */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Real-Time AI Writing Assistant</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Subtle typo, grammar, and clarity suggestions while typing.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setWritingAssistEnabled(!isWritingAssistEnabled)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  isWritingAssistEnabled ? 'bg-indigo-600' : 'bg-slate-300'
                }`}
                role="switch"
                aria-checked={isWritingAssistEnabled}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    isWritingAssistEnabled ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                <span>Privacy & Security</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Your email is never shared publicly. When sharing experiences, you can choose anonymous attribution at any time.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              {currentUser && !isGuest ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              ) : (
                <div />
              )}

              <button
                type="submit"
                id="modal-save-profile-btn"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs cursor-pointer"
              >
                {isSaved ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
