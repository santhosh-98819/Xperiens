import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, ArrowRight, Lock, Mail, AlertCircle, Compass, User } from 'lucide-react';
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
        setError('Invalid email or password. Please double-check your credentials.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many unsuccessful attempts. Please try again later or reset password.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setIsOperationNotAllowed(true);
        setError(
          'Email/Password login is not enabled in this Firebase project. You can click "Continue with Google" or continue as a Guest.'
        );
      } else {
        setError(err.message || 'Failed to log in. Please try again.');
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
        setError(err.message || 'Google sign-in was cancelled or failed.');
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
      console.error('Guest login error:', err);
      setError('Could not continue as guest. Please try email sign in.');
    } finally {
      setLoading(false);
    }
  };

  const handleLocalUserLogin = () => {
    loginAsLocalUser(email ? email.split('@')[0] : 'Community Member', email || undefined);
    if (onSuccessRedirect) {
      onSuccessRedirect();
    } else {
      onNavigate('dashboard');
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address above to receive password reset instructions.');
      return;
    }
    try {
      setIsResetting(true);
      setError(null);
      await resetPassword(email);
      setResetSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset link.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 py-10">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <Logo className="h-10 w-auto" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Welcome Back
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Log in to access your personal dashboard, saved solutions, and contributed experiences.
          </p>
        </div>

        {/* Google Sign In */}
        <div>
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            id="login-google-btn"
            className="w-full inline-flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl font-semibold text-xs text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-2xs transition-all cursor-pointer hover:border-indigo-400"
          >
            {googleLoading ? (
              <div className="w-4 h-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>Continue with Google</span>
          </button>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 absolute">
            Or Sign In with Email
          </span>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
            {isOperationNotAllowed && (
              <div className="pt-2 border-t border-rose-200/80 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer text-center"
                >
                  Sign in with Google
                </button>
                <button
                  type="button"
                  onClick={handleLocalUserLogin}
                  className="py-1.5 px-3 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs cursor-pointer text-center"
                >
                  Continue with Local Session
                </button>
              </div>
            )}
          </div>
        )}

        {resetSent && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>Password reset email sent! Check your inbox.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <input
                id="login-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 pl-10 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-900"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={isResetting}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
              >
                {isResetting ? 'Sending link...' : 'Forgot password?'}
              </button>
            </div>
            <div className="relative">
              <input
                id="login-password-input"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 pl-10 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-900"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            id="login-submit-btn"
            disabled={loading || googleLoading}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <>
                <span>Log In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Guest and Sign Up Options */}
        <div className="space-y-2.5 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={handleGuestLogin}
            disabled={loading || googleLoading}
            id="login-guest-btn"
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 text-slate-500" />
            <span>Continue as Guest</span>
          </button>

          <div className="text-center pt-2">
            <span className="text-xs text-slate-500">Don't have an account yet? </span>
            <button
              onClick={() => onNavigate('signup')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
            >
              Create an Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
