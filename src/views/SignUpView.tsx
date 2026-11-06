import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRight, UserPlus, Mail, Lock, User, AlertCircle, Compass } from 'lucide-react';
import { ViewMode } from '../App';
import { Logo } from '../components/Logo';

interface SignUpViewProps {
  onNavigate: (view: ViewMode) => void;
  onSuccessRedirect?: () => void;
}

export const SignUpView: React.FC<SignUpViewProps> = ({ onNavigate, onSuccessRedirect }) => {
  const { signUpWithEmail, loginWithGoogle, loginAsGuest } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isAnonymousPref, setIsAnonymousPref] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!agreeTerms) {
      setError('Please agree to the terms to continue.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await signUpWithEmail(name, email, password, isAnonymousPref);
      if (onSuccessRedirect) {
        onSuccessRedirect();
      } else {
        onNavigate('dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setGoogleLoading(true);
      await loginWithGoogle();
      if (onSuccessRedirect) onSuccessRedirect();
      else onNavigate('dashboard');
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') setError(err.message);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md space-y-10 animate-fadeIn">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <Logo className="h-12 w-auto" />
          </div>
          <div className="space-y-3">
             <h1 className="text-4xl font-serif font-bold text-brand-text-primary dark:text-dark-text-primary tracking-tight">
              Create Account
            </h1>
            <p className="text-sm text-brand-text-secondary dark:text-dark-text-secondary font-light max-w-xs mx-auto">
              Join our community of thinkers and problem solvers.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <button
            onClick={handleGoogleSignUp}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-6 rounded-xl border border-brand-border dark:border-dark-border bg-brand-card dark:bg-dark-card text-brand-text-primary dark:text-dark-text-primary font-semibold hover:bg-slate-50 dark:hover:bg-dark-sec-bg transition-all shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-brand-border dark:border-dark-border w-full" />
            <span className="bg-brand-bg dark:bg-dark-bg px-4 text-[10px] font-bold uppercase tracking-widest text-brand-text-secondary dark:text-dark-text-secondary absolute">
              or register with email
            </span>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-800 dark:text-rose-300 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-brand-text-secondary dark:text-dark-text-secondary uppercase tracking-widest px-1">Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-brand-card dark:bg-dark-card border border-brand-border dark:border-dark-border rounded-xl focus:ring-2 focus:ring-brand-accent dark:focus:ring-dark-accent outline-none text-sm transition-all"
                  placeholder="Your display name"
                  required
                />
                <User className="w-4 h-4 absolute left-4 top-3.5 text-brand-text-secondary opacity-50" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-brand-text-secondary dark:text-dark-text-secondary uppercase tracking-widest px-1">Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-brand-card dark:bg-dark-card border border-brand-border dark:border-dark-border rounded-xl focus:ring-2 focus:ring-brand-accent dark:focus:ring-dark-accent outline-none text-sm transition-all"
                  placeholder="name@example.com"
                  required
                />
                <Mail className="w-4 h-4 absolute left-4 top-3.5 text-brand-text-secondary opacity-50" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-brand-text-secondary dark:text-dark-text-secondary uppercase tracking-widest px-1">Password</label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-brand-card dark:bg-dark-card border border-brand-border dark:border-dark-border rounded-xl focus:ring-2 focus:ring-brand-accent dark:focus:ring-dark-accent outline-none text-sm transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <Lock className="w-4 h-4 absolute left-4 top-3.5 text-brand-text-secondary opacity-50" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-brand-text-secondary dark:text-dark-text-secondary uppercase tracking-widest px-1">Confirm</label>
                <div className="relative">
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-brand-card dark:bg-dark-card border border-brand-border dark:border-dark-border rounded-xl focus:ring-2 focus:ring-brand-accent dark:focus:ring-dark-accent outline-none text-sm transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <Lock className="w-4 h-4 absolute left-4 top-3.5 text-brand-text-secondary opacity-50" />
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-dark-sec-bg border border-brand-border dark:border-dark-border rounded-xl">
               <input
                 type="checkbox"
                 checked={isAnonymousPref}
                 onChange={(e) => setIsAnonymousPref(e.target.checked)}
                 className="mt-1 rounded border-brand-border dark:border-dark-border text-brand-accent"
               />
               <div className="space-y-1">
                 <span className="block text-xs font-bold text-brand-text-primary dark:text-dark-text-primary">Default to Anonymous</span>
                 <p className="text-[10px] text-brand-text-secondary dark:text-dark-text-secondary leading-normal">Your stories will be shared as "Anonymous Contributor" by default.</p>
               </div>
            </div>

            <label className="flex items-start gap-3 px-1 cursor-pointer">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-1 rounded border-brand-border dark:border-dark-border text-brand-accent"
                required
              />
              <span className="text-[10px] text-brand-text-secondary dark:text-dark-text-secondary leading-normal">
                I agree to the <a href="#" className="font-bold text-brand-accent underline">Terms</a>, <a href="#" className="font-bold text-brand-accent underline">Guidelines</a> and <a href="#" className="font-bold text-brand-accent underline">Privacy Policy</a>.
              </span>
            </label>

            <button
              type="submit"
              disabled={loading || googleLoading || !agreeTerms}
              className="w-full py-3.5 bg-brand-text-primary dark:bg-dark-text-primary text-brand-bg dark:text-dark-bg rounded-xl font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            >
              {loading ? <div className="w-5 h-5 border-2 border-brand-bg border-t-transparent rounded-full animate-spin" /> : <>Join Xperiens <UserPlus className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="pt-6 border-t border-brand-border dark:border-dark-border space-y-4">
            <button
              onClick={() => onNavigate('login')}
              className="w-full py-3 border border-brand-border dark:border-dark-border rounded-xl text-xs font-bold text-brand-text-primary dark:text-dark-text-primary hover:bg-slate-50 dark:hover:bg-dark-sec-bg transition-all flex items-center justify-center gap-2"
            >
              Sign In Instead
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
