import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, ArrowRight, Lock, Mail, AlertCircle, Compass } from 'lucide-react';
import { ViewMode } from '../App';
import { Logo } from '../components/Logo';

interface LoginViewProps {
  onNavigate: (view: ViewMode) => void;
  onSuccessRedirect?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onNavigate, onSuccessRedirect }) => {
  const { loginWithEmail, loginWithGoogle, loginAsGuest, loginAsLocalUser, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOperationNotAllowed, setIsOperationNotAllowed] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsOperationNotAllowed(false);
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await loginWithEmail(email, password);
      if (onSuccessRedirect) {
        onSuccessRedirect();
      } else {
        onNavigate('dashboard');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid credentials. Please double-check your email and password.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setIsOperationNotAllowed(true);
        setError('Email login is currently restricted. Please use Google or Local mode.');
      } else {
        setError(err.message || 'Authentication failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      setError(null);
      await loginWithGoogle();
      if (onSuccessRedirect) {
        onSuccessRedirect();
      } else {
        onNavigate('dashboard');
      }
    } catch (err: any) {
      console.error('Google login error:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Google sign-in failed.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      await loginAsGuest();
      if (onSuccessRedirect) {
        onSuccessRedirect();
      } else {
        onNavigate('dashboard');
      }
    } catch (err: any) {
      setError('Could not initialize guest session.');
    } finally {
      setLoading(false);
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
              Welcome back
            </h1>
            <p className="text-sm text-brand-text-secondary dark:text-dark-text-secondary font-light max-w-xs mx-auto">
              Continue your journey through collective wisdom and AI-driven insights.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-6 rounded-xl border border-brand-border dark:border-dark-border bg-brand-card dark:bg-dark-card text-brand-text-primary dark:text-dark-text-primary font-semibold hover:bg-slate-50 dark:hover:bg-dark-sec-bg transition-all shadow-sm"
          >
            {googleLoading ? (
              <div className="w-4 h-4 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            )}
            <span>Continue with Google</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-brand-border dark:border-dark-border w-full" />
            <span className="bg-brand-bg dark:bg-dark-bg px-4 text-[10px] font-bold uppercase tracking-widest text-brand-text-secondary dark:text-dark-text-secondary absolute">
              or use email
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

            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-bold text-brand-text-secondary dark:text-dark-text-secondary uppercase tracking-widest">Password</label>
                <button type="button" onClick={() => resetPassword(email)} className="text-[10px] font-bold text-brand-accent dark:text-dark-accent hover:underline">Forgot?</button>
              </div>
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

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full py-3.5 bg-brand-text-primary dark:bg-dark-text-primary text-brand-bg dark:text-dark-bg rounded-xl font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              {loading ? <div className="w-5 h-5 border-2 border-brand-bg border-t-transparent rounded-full animate-spin" /> : <>Log In <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="pt-6 border-t border-brand-border dark:border-dark-border space-y-4">
            <button
              onClick={handleGuestLogin}
              className="w-full py-3 border border-brand-border dark:border-dark-border rounded-xl text-xs font-bold text-brand-text-primary dark:text-dark-text-primary hover:bg-slate-50 dark:hover:bg-dark-sec-bg transition-all flex items-center justify-center gap-2"
            >
              <Compass className="w-4 h-4" />
              Continue as Guest
            </button>
            <p className="text-center text-xs text-brand-text-secondary dark:text-dark-text-secondary">
              New here? <button onClick={() => onNavigate('signup')} className="font-bold text-brand-accent dark:text-dark-accent hover:underline">Create an account</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
