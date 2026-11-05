import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, ArrowRight, UserPlus, Mail, Lock, User, AlertCircle, ShieldCheck, Compass } from 'lucide-react';
import { ViewMode } from '../App';
import { Logo } from '../components/Logo';

interface SignUpViewProps {
  onNavigate: (view: ViewMode) => void;
  onSuccessRedirect?: () => void;
}

export const SignUpView: React.FC<SignUpViewProps> = ({ onNavigate, onSuccessRedirect }) => {
  const { signUpWithEmail, loginWithGoogle, loginAsGuest, loginAsLocalUser } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isAnonymousPref, setIsAnonymousPref] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOperationNotAllowed, setIsOperationNotAllowed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsOperationNotAllowed(false);

    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!email.trim()) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!agreeTerms) {
      setError('You must agree to the Terms & Conditions and Community Guidelines and acknowledge the Privacy Policy to create an Xperiens account.');
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
      console.error('Sign up error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please log in instead.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Please use at least 6 characters.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setIsOperationNotAllowed(true);
        setError(
          'Email/Password sign-up is not enabled in this Firebase project. You can click "Continue with Google" below, or continue in Quick Guest Mode without any setup.'
        );
      } else {
        setError(err.message || 'Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
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
      console.error('Google sign-up error:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Google sign-in was cancelled or failed.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGuestSignUp = async () => {
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
      console.error('Guest sign-up error:', err);
      setError('Could not initialize guest session.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLocalProfile = () => {
    loginAsLocalUser(name.trim() || 'Community Member', email.trim() || undefined);
    if (onSuccessRedirect) {
      onSuccessRedirect();
    } else {
      onNavigate('dashboard');
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
            Create Your Account
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Join Xperiens to track your problem-solving outcomes, save tailored solutions, and contribute experiences.
          </p>
        </div>

        {/* Google Sign-In Primary Option */}
        <div>
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={googleLoading || loading}
            id="signup-google-btn"
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
            Or Register with Email
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
                  onClick={handleGoogleSignUp}
                  className="py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer text-center"
                >
                  Sign in with Google
                </button>
                <button
                  type="button"
                  onClick={handleCreateLocalProfile}
                  className="py-1.5 px-3 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs cursor-pointer text-center"
                >
                  Use Local Profile ({name.trim() || 'Community Member'})
                </button>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Full Name or Display Name
            </label>
            <div className="relative">
              <input
                id="signup-name-input"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Morgan"
                className="w-full px-4 py-2.5 pl-10 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-900"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <input
                id="signup-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                className="w-full px-4 py-2.5 pl-10 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-900"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  id="signup-password-input"
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

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Confirm
              </label>
              <div className="relative">
                <input
                  id="signup-confirm-password-input"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 pl-10 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-900"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>
          </div>

          {/* Privacy preference */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isAnonymousPref}
                onChange={(e) => setIsAnonymousPref(e.target.checked)}
                className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <div className="text-xs text-slate-700 leading-snug">
                <span className="font-semibold block text-slate-900">Default to Anonymous Display</span>
                <span className="text-slate-500">
                  When you share experiences, display as "Anonymous Contributor" instead of your name.
                </span>
              </div>
            </label>
          </div>

          {/* Terms checkbox */}
          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600">
            <input
              type="checkbox"
              required
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span>
              I agree to the <a href="/terms-and-conditions" target="_blank" className="font-semibold text-indigo-600 hover:underline">Terms & Conditions</a> and <a href="/community-guidelines" target="_blank" className="font-semibold text-indigo-600 hover:underline">Community Guidelines</a>, and I acknowledge the <a href="/privacy-policy" target="_blank" className="font-semibold text-indigo-600 hover:underline">Privacy Policy</a>.
            </span>
          </label>

          <button
            type="submit"
            id="signup-submit-btn"
            disabled={loading || googleLoading || !agreeTerms}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <>
                <span>Create Free Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick guest option */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <button
            type="button"
            onClick={handleGuestSignUp}
            id="signup-guest-btn"
            className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-semibold text-xs text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 text-slate-500" />
            <span>Continue as Guest (Instant Access)</span>
          </button>
        </div>

        <div className="text-center pt-1">
          <span className="text-xs text-slate-500">Already have an account? </span>
          <button
            onClick={() => onNavigate('login')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
          >
            Log In
          </button>
        </div>
      </div>
    </div>
  );
};
