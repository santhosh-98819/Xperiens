import React, { useState } from 'react';
import { useLegalAcceptance } from '../hooks/useLegalAcceptance';
import { Logo } from '../components/Logo';

interface LegalAcceptanceViewProps {
  onComplete: () => void;
  onNavigate: (view: string) => void;
}

export const LegalAcceptanceView: React.FC<LegalAcceptanceViewProps> = ({ onComplete, onNavigate }) => {
  const { acceptCurrentLegalDocuments, acceptanceLoading } = useLegalAcceptance();
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    try {
      await acceptCurrentLegalDocuments();
      onComplete();
    } catch (e) {
      setError("We couldn't save your acceptance. Please check your connection and try again.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-12 p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
      <div className="flex items-center gap-3">
        <Logo className="h-10 w-auto" />
      </div>
      <h1 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">Before you continue</h1>
      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
        Please review and accept our Terms & Conditions and Community Guidelines and acknowledge our Privacy Policy to continue using Xperiens.
      </p>
      
      <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
        <button onClick={() => onNavigate('terms-and-conditions')} className="block text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer">Terms & Conditions →</button>
        <button onClick={() => onNavigate('community-guidelines')} className="block text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer">Community Guidelines →</button>
        <button onClick={() => onNavigate('privacy-policy')} className="block text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer">Privacy Policy →</button>
      </div>

      <div className="flex items-start gap-3 pt-2">
        <input 
          type="checkbox" 
          id="legal-acceptance" 
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-1 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
        />
        <label htmlFor="legal-acceptance" className="text-sm text-slate-700 dark:text-slate-300 cursor-pointer leading-snug">
          I agree to the Terms & Conditions and Community Guidelines, and I acknowledge the Privacy Policy.
        </label>
      </div>

      {error && <p className="text-sm text-rose-600 font-semibold">{error}</p>}

      <button 
        onClick={handleSubmit}
        disabled={!agreed || acceptanceLoading}
        className="w-full py-3 bg-brand-accent dark:bg-dark-accent text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer"
      >
        {acceptanceLoading ? 'Saving...' : 'Accept & Continue to Xperiens'}
      </button>
    </div>
  );
};
