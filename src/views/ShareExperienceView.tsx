import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Category, OutcomeStatus, Experience, ExperienceValidationResult } from '../types';
import { submitExperience, validateExperience } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import {
  SHARE_CATEGORIES,
  getCategoryConfig,
} from '../data/shareCategoryTaxonomy';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Check,
  Send,
  AlertCircle,
} from 'lucide-react';
import { ViewMode } from '../App';

interface ShareExperienceViewProps {
  onNavigate: (view: ViewMode) => void;
  onExperienceAdded?: (exp: Experience) => void;
}

type FormStep = 1 | 2 | 3 | 4 | 5;

export const ShareExperienceView: React.FC<ShareExperienceViewProps> = ({
  onNavigate,
  onExperienceAdded,
}) => {
  const { currentUser, userProfile, isGuest } = useAuth();
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState<FormStep>(1);
  const [category, setCategory] = useState<Category>('Education');
  const [customTitle, setCustomTitle] = useState('');
  const [q1TryingToDo, setQ1TryingToDo] = useState('');
  const [q2ProblemFaced, setQ2ProblemFaced] = useState('');
  const [q3WhatTried, setQ3WhatTried] = useState('');
  const [q4WhatHappened, setQ4WhatHappened] = useState('');
  const [q5WhatLearned, setQ5WhatLearned] = useState('');
  const [q6WhatDoDifferently, setQ6WhatDoDifferently] = useState('');
  const [outcomeStatus, setOutcomeStatus] = useState<OutcomeStatus>('worked');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [authorName, setAuthorName] = useState(userProfile?.name || currentUser?.displayName || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quality Guard State
  const [validationResult, setValidationResult] = useState<ExperienceValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [bypassWarning, setBypassWarning] = useState(false);

  // Clear validation if inputs change
  React.useEffect(() => {
    setValidationResult(null);
    setBypassWarning(false);
  }, [q1TryingToDo, q2ProblemFaced, q3WhatTried, q4WhatHappened, q5WhatLearned, q6WhatDoDifferently]);

  const activeCategoryConfig = getCategoryConfig(category);

  const validateStep = (step: FormStep): boolean => {
    setError(null);
    if (step === 2) {
      if (!q1TryingToDo.trim() || !q3WhatTried.trim() || !q4WhatHappened.trim() || !q5WhatLearned.trim()) {
        setError(t('share.error_mandatory'));
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 5) {
        setCurrentStep((prev) => (prev + 1) as FormStep);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleBack = () => {
    setError(null);
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as FormStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectCategory = (catId: Category) => {
    setCategory(catId);
    setCurrentStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Authenticity & Quality Guard Validation
    if (!validationResult || (!validationResult.isValid) || (validationResult.riskLevel !== 'low' && !bypassWarning)) {
      setIsValidating(true);
      try {
        const pillars = {
          trying_to_do: q1TryingToDo,
          problem_faced: q2ProblemFaced,
          what_tried: q3WhatTried,
          what_happened: q4WhatHappened,
          what_learned: q5WhatLearned,
          what_differently: q6WhatDoDifferently
        };
        const result = await validateExperience(pillars, userProfile?.languagePreference);
        setValidationResult(result);
        setIsValidating(false);

        if (!result.isValid) {
          // Block publication due to meaningless content or high risk
          return;
        }

        if (result.riskLevel !== 'low' && !bypassWarning) {
          // Show warning for medium/high risk but allow bypass if they choose
          return;
        }
      } catch (err) {
        console.warn('Quality Guard bypassed due to service error:', err);
        setIsValidating(false);
      }
    }

    setIsSubmitting(true);

    const situationCombined = q2ProblemFaced.trim()
      ? `${q1TryingToDo.trim()}\n\nChallenge: ${q2ProblemFaced.trim()}`
      : q1TryingToDo.trim();

    const titleGenerated = customTitle.trim() || `${activeCategoryConfig.displayName}: Reflection`;

    try {
      const newExp = await submitExperience({
        title: titleGenerated,
        category: category,
        situation: situationCombined,
        actionsTaken: q3WhatTried.split('\n').filter(a => a.trim().length > 0),
        whyChosen: q1TryingToDo.trim(),
        outcome: q4WhatHappened.trim(),
        outcomeStatus,
        lesson: q5WhatLearned.trim(),
        whatWouldChange: q6WhatDoDifferently.trim(),
        isAnonymous,
        authorName: isAnonymous ? t('common.anonymous') : authorName.trim() || 'Contributor',
        tags: [category],
        bannerURL: userProfile?.bannerURL || '',
      });

      if (currentUser && !isGuest) {
        await setDoc(doc(db, 'experiences', newExp.id), newExp, { merge: true });
      }

      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      if (onExperienceAdded) onExperienceAdded(newExp);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || t('common.error'));
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center space-y-8 animate-fadeIn">
        <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-serif font-bold text-brand-text-primary dark:text-dark-text-primary">{t('share.success.title')}</h2>
          <p className="text-brand-text-secondary dark:text-dark-text-secondary leading-relaxed">
            {t('share.success.desc')}
          </p>
        </div>
        <button
          onClick={() => onNavigate('experiences')}
          className="px-8 py-3 bg-brand-text-primary dark:bg-dark-text-primary text-white dark:text-dark-bg font-bold rounded-lg shadow-sm"
        >
          {t('share.success.cta')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-12 animate-fadeIn pb-32">
      <header className="space-y-4 border-b border-brand-border dark:border-dark-border pb-8">
        <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-brand-text-secondary dark:text-dark-text-secondary">
          <BookOpen className="w-3 h-3" />
          <span>{t('share.studio')}</span>
        </div>
        <h1 className="text-3xl lg:text-5xl font-serif font-bold text-brand-text-primary dark:text-dark-text-primary">{t('share.title')}</h1>
        <p className="text-brand-text-secondary dark:text-dark-text-secondary max-w-2xl text-lg leading-relaxed">
          {t('share.subtitle')}
        </p>
      </header>

      {/* Progress Bar */}
      <div className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map((s) => (
          <div key={s} className="space-y-2">
            <div className={`h-1 rounded-full transition-colors ${currentStep >= s ? 'bg-brand-accent dark:bg-dark-accent' : 'bg-brand-border dark:border-dark-border'}`} />
            <span className={`text-[9px] font-bold tracking-widest uppercase block ${currentStep === s ? 'text-brand-text-primary dark:text-dark-text-primary' : 'text-brand-text-secondary dark:text-dark-text-secondary opacity-40'}`}>
              {t('common.step', 'Step')} 0{s}
            </span>
          </div>
        ))}
      </div>

      <div className="space-y-10">
        {/* Step 1: Category */}
        {currentStep === 1 && (
          <div className="space-y-8 animate-fadeIn">
            <div className="space-y-1">
              <h2 className="text-2xl font-serif font-bold">{t('share.step1_title')}</h2>
              <p className="text-sm text-brand-text-secondary dark:text-dark-text-secondary">{t('share.step1_desc')}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {SHARE_CATEGORIES.map((catConfig) => (
                <button
                  key={catConfig.id}
                  onClick={() => handleSelectCategory(catConfig.id)}
                  className={`p-6 text-left border rounded-xl transition-all group ${category === catConfig.id ? 'border-brand-accent dark:border-dark-accent bg-brand-accent/5 dark:bg-dark-accent/5' : 'border-brand-border dark:border-dark-border hover:border-brand-accent/50 dark:hover:border-dark-accent/50'}`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${catConfig.badgeBg} ${catConfig.badgeText} opacity-80 group-hover:opacity-100 transition-opacity`}>
                    <catConfig.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif font-bold text-brand-text-primary dark:text-dark-text-primary mb-1">{catConfig.displayName}</h3>
                  <p className="text-xs text-brand-text-secondary dark:text-dark-text-secondary leading-relaxed">{catConfig.subtitle}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Reflection Pillars */}
        {currentStep === 2 && (
          <div className="space-y-12 animate-fadeIn">
            <div className="space-y-1 border-l-2 border-brand-accent dark:border-dark-accent pl-6 py-2">
              <h2 className="text-2xl font-serif font-bold">{t('share.step2_title')}</h2>
              <p className="text-sm text-brand-text-secondary dark:text-dark-text-secondary">{t('share.step2_desc')}</p>
            </div>
            
            <div className="space-y-10">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="q1" className="text-xs font-bold uppercase tracking-widest text-brand-text-secondary dark:text-dark-text-secondary">
                    {t('share.pillars.p1.label')} <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] font-mono text-brand-text-secondary opacity-60">{t('share.pillars.p1.field')}</span>
                </div>
                <textarea
                  id="q1"
                  rows={3}
                  value={q1TryingToDo}
                  onChange={(e) => setQ1TryingToDo(e.target.value)}
                  placeholder={t('share.pillars.p1.placeholder')}
                  className="w-full p-4 rounded-xl border border-brand-border dark:border-dark-border bg-brand-bg dark:bg-dark-bg text-brand-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-brand-accent dark:focus:ring-dark-accent outline-none font-light leading-relaxed resize-y"
                  required
                />
                <p className="text-xs text-brand-text-secondary dark:text-dark-text-secondary italic">{t('share.pillars.p1.helper')}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="q2" className="text-xs font-bold uppercase tracking-widest text-brand-text-secondary dark:text-dark-text-secondary">
                    {t('share.pillars.p2.label')}
                  </label>
                  <span className="text-[10px] font-mono text-brand-text-secondary opacity-60">{t('share.pillars.p2.field')}</span>
                </div>
                <textarea
                  id="q2"
                  rows={3}
                  value={q2ProblemFaced}
                  onChange={(e) => setQ2ProblemFaced(e.target.value)}
                  placeholder={t('share.pillars.p2.placeholder')}
                  className="w-full p-4 rounded-xl border border-brand-border dark:border-dark-border bg-brand-bg dark:bg-dark-bg text-brand-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-brand-accent dark:focus:ring-dark-accent outline-none font-light leading-relaxed resize-y"
                />
                <p className="text-xs text-brand-text-secondary dark:text-dark-text-secondary italic">{t('share.pillars.p2.helper')}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="q3" className="text-xs font-bold uppercase tracking-widest text-brand-text-secondary dark:text-dark-text-secondary">
                    {t('share.pillars.p3.label')} <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] font-mono text-brand-text-secondary opacity-60">{t('share.pillars.p3.field')}</span>
                </div>
                <textarea
                  id="q3"
                  rows={3}
                  value={q3WhatTried}
                  onChange={(e) => setQ3WhatTried(e.target.value)}
                  placeholder={t('share.pillars.p3.placeholder')}
                  className="w-full p-4 rounded-xl border border-brand-border dark:border-dark-border bg-brand-bg dark:bg-dark-bg text-brand-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-brand-accent dark:focus:ring-dark-accent outline-none font-light leading-relaxed resize-y"
                  required
                />
                <p className="text-xs text-brand-text-secondary dark:text-dark-text-secondary italic">{t('share.pillars.p3.helper')}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="q4" className="text-xs font-bold uppercase tracking-widest text-brand-text-secondary dark:text-dark-text-secondary">
                    {t('share.pillars.p4.label')} <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] font-mono text-brand-text-secondary opacity-60">{t('share.pillars.p4.field')}</span>
                </div>
                <textarea
                  id="q4"
                  rows={3}
                  value={q4WhatHappened}
                  onChange={(e) => setQ4WhatHappened(e.target.value)}
                  placeholder={t('share.pillars.p4.placeholder')}
                  className="w-full p-4 rounded-xl border border-brand-border dark:border-dark-border bg-brand-bg dark:bg-dark-bg text-brand-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-brand-accent dark:focus:ring-dark-accent outline-none font-light leading-relaxed resize-y"
                  required
                />
                <p className="text-xs text-brand-text-secondary dark:text-dark-text-secondary italic">{t('share.pillars.p4.helper')}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="q5" className="text-xs font-bold uppercase tracking-widest text-brand-text-secondary dark:text-dark-text-secondary">
                    {t('share.pillars.p5.label')} <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] font-mono text-brand-text-secondary opacity-60">{t('share.pillars.p5.field')}</span>
                </div>
                <textarea
                  id="q5"
                  rows={3}
                  value={q5WhatLearned}
                  onChange={(e) => setQ5WhatLearned(e.target.value)}
                  placeholder={t('share.pillars.p5.placeholder')}
                  className="w-full p-4 rounded-xl border border-brand-border dark:border-dark-border bg-brand-bg dark:bg-dark-bg text-brand-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-brand-accent dark:focus:ring-dark-accent outline-none font-light leading-relaxed resize-y"
                  required
                />
                <p className="text-xs text-brand-text-secondary dark:text-dark-text-secondary italic">{t('share.pillars.p5.helper')}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="q6" className="text-xs font-bold uppercase tracking-widest text-brand-text-secondary dark:text-dark-text-secondary">
                    {t('share.pillars.p6.label')}
                  </label>
                  <span className="text-[10px] font-mono text-brand-text-secondary opacity-60">{t('share.pillars.p6.field')}</span>
                </div>
                <textarea
                  id="q6"
                  rows={3}
                  value={q6WhatDoDifferently}
                  onChange={(e) => setQ6WhatDoDifferently(e.target.value)}
                  placeholder={t('share.pillars.p6.placeholder')}
                  className="w-full p-4 rounded-xl border border-brand-border dark:border-dark-border bg-brand-bg dark:bg-dark-bg text-brand-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-brand-accent dark:focus:ring-dark-accent outline-none font-light leading-relaxed resize-y"
                />
                <p className="text-xs text-brand-text-secondary dark:text-dark-text-secondary italic">{t('share.pillars.p6.helper')}</p>
              </div>
            </div>

            {error && <p className="text-sm font-bold text-rose-500 italic">{error}</p>}

            <div className="flex justify-between items-center pt-8 border-t border-brand-border dark:border-dark-border">
              <button onClick={handleBack} className="text-sm font-bold text-brand-text-secondary flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> {t('share.btn_back')}
              </button>
              <button onClick={handleNext} className="px-10 py-4 bg-brand-text-primary dark:bg-dark-text-primary text-white dark:text-dark-bg font-bold rounded-lg shadow-sm flex items-center gap-2">
                {t('share.btn_next')}: {t('common.outcome', 'Outcome')} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Result Status */}
        {currentStep === 3 && (
          <div className="space-y-12 animate-fadeIn max-w-2xl">
             <div className="space-y-1">
              <h2 className="text-2xl font-serif font-bold">{t('share.step3_title')}</h2>
              <p className="text-sm text-brand-text-secondary dark:text-dark-text-secondary">{t('share.step3_desc')}</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {[
                { id: 'worked', icon: CheckCircle2, title: t('share.outcomes.worked.title'), desc: t('share.outcomes.worked.desc'), color: 'text-emerald-600' },
                { id: 'partially_worked', icon: Clock, title: t('share.outcomes.partially_worked.title'), desc: t('share.outcomes.partially_worked.desc'), color: 'text-amber-600' },
                { id: 'did_not_work', icon: XCircle, title: t('share.outcomes.did_not_work.title'), desc: t('share.outcomes.did_not_work.desc'), color: 'text-rose-600' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setOutcomeStatus(opt.id as OutcomeStatus)}
                  className={`p-6 text-left border rounded-xl transition-all flex items-center gap-6 ${outcomeStatus === opt.id ? 'border-brand-accent dark:border-dark-accent bg-brand-accent/5 dark:bg-dark-accent/5' : 'border-brand-border dark:border-dark-border'}`}
                >
                  <opt.icon className={`w-8 h-8 ${opt.color}`} />
                  <div>
                    <h3 className="font-bold text-brand-text-primary dark:text-dark-text-primary">{opt.title}</h3>
                    <p className="text-sm text-brand-text-secondary dark:text-dark-text-secondary">{opt.desc}</p>
                  </div>
                  {outcomeStatus === opt.id && <Check className="w-5 h-5 text-brand-accent ml-auto" />}
                </button>
              ))}
            </div>

            <div className="flex justify-between items-center pt-8 border-t border-brand-border dark:border-dark-border">
              <button onClick={handleBack} className="text-sm font-bold text-brand-text-secondary flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> {t('share.btn_back')}
              </button>
              <button onClick={handleNext} className="px-10 py-4 bg-brand-text-primary dark:bg-dark-text-primary text-white dark:text-dark-bg font-bold rounded-lg shadow-sm flex items-center gap-2">
                {t('share.btn_next')}: {t('common.identification', 'Identification')} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Identity */}
        {currentStep === 4 && (
          <div className="space-y-12 animate-fadeIn max-w-2xl">
             <div className="space-y-1">
              <h2 className="text-2xl font-serif font-bold">{t('share.step4_title')}</h2>
              <p className="text-sm text-brand-text-secondary dark:text-dark-text-secondary">{t('share.step4_desc')}</p>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4">
                <button
                  onClick={() => setIsAnonymous(false)}
                  className={`flex-1 p-6 border rounded-xl transition-all text-center ${!isAnonymous ? 'border-brand-accent bg-brand-accent/5' : 'border-brand-border'}`}
                >
                  <span className="font-bold block">{t('share.identity.attributed')}</span>
                  <span className="text-[10px] text-brand-text-secondary uppercase">{t('share.identity.attributed_desc')}</span>
                </button>
                <button
                  onClick={() => setIsAnonymous(true)}
                  className={`flex-1 p-6 border rounded-xl transition-all text-center ${isAnonymous ? 'border-brand-accent bg-brand-accent/5' : 'border-brand-border'}`}
                >
                  <span className="font-bold block">{t('share.identity.anonymous')}</span>
                  <span className="text-[10px] text-brand-text-secondary uppercase">{t('share.identity.anonymous_desc')}</span>
                </button>
              </div>

              {!isAnonymous && (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-widest uppercase text-brand-text-secondary">{t('share.identity.display_name')}</label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder={t('share.identity.display_name_placeholder')}
                    className="w-full p-4 rounded-xl border border-brand-border dark:border-dark-border bg-brand-bg dark:bg-dark-bg text-brand-text-primary dark:text-dark-text-primary"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-bold tracking-widest uppercase text-brand-text-secondary">{t('share.identity.custom_title')}</label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder={t('share.identity.custom_title_placeholder')}
                  className="w-full p-4 rounded-xl border border-brand-border dark:border-dark-border bg-brand-bg dark:bg-dark-bg text-brand-text-primary dark:text-dark-text-primary"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-8 border-t border-brand-border dark:border-dark-border">
              <button onClick={handleBack} className="text-sm font-bold text-brand-text-secondary flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> {t('share.btn_back')}
              </button>
              <button onClick={handleNext} className="px-10 py-4 bg-brand-text-primary dark:bg-dark-text-primary text-white dark:text-dark-bg font-bold rounded-lg shadow-sm flex items-center gap-2">
                {t('common.review_publish', 'Review & Publish')} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {currentStep === 5 && (
          <div className="space-y-12 animate-fadeIn">
            <div className="space-y-1">
              <h2 className="text-2xl font-serif font-bold">{t('share.step5_title')}</h2>
              <p className="text-sm text-brand-text-secondary dark:text-dark-text-secondary">{t('share.step5_desc')}</p>
            </div>

            {/* Quality Guard Feedback */}
            {isValidating && (
              <div className="p-6 bg-brand-accent/5 dark:bg-dark-accent/5 border border-brand-accent/20 rounded-xl animate-pulse flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-medium">Verifying experience authenticity and quality...</p>
              </div>
            )}

            {validationResult && !validationResult.isValid && (
              <div className="p-6 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
                   <AlertCircle className="w-5 h-5" />
                   Quality Guard: Meaningless Content Blocked
                </div>
                <p className="text-sm text-brand-text-secondary dark:text-dark-text-secondary">{validationResult.feedback || validationResult.reason}</p>
                {validationResult.suggestedFixes && validationResult.suggestedFixes.length > 0 && (
                  <ul className="list-disc list-inside text-xs space-y-1 text-brand-text-secondary opacity-80">
                    {validationResult.suggestedFixes.map((fix, i) => <li key={i}>{fix}</li>)}
                  </ul>
                )}
                <button onClick={() => setCurrentStep(2)} className="text-xs font-bold text-brand-accent underline">Return to edit pillars</button>
              </div>
            )}

            {validationResult && validationResult.isValid && validationResult.riskLevel !== 'low' && !bypassWarning && (
               <div className="p-6 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
                   <AlertCircle className="w-5 h-5" />
                   Quality Guard: Quality Assessment Warning
                </div>
                <p className="text-sm text-brand-text-secondary dark:text-dark-text-secondary">{validationResult.feedback}</p>
                {validationResult.suggestedFixes && validationResult.suggestedFixes.length > 0 && (
                  <ul className="list-disc list-inside text-xs space-y-1 text-brand-text-secondary opacity-80">
                    {validationResult.suggestedFixes.map((fix, i) => <li key={i}>{fix}</li>)}
                  </ul>
                )}
                <div className="flex gap-4 pt-2">
                   <button onClick={() => setCurrentStep(2)} className="px-4 py-2 border border-brand-border rounded-lg text-xs font-bold">Edit Details</button>
                   <button onClick={() => setBypassWarning(true)} className="px-4 py-2 bg-amber-600 text-white rounded-lg text-xs font-bold">Publish Anyway</button>
                </div>
              </div>
            )}

            <div className="p-10 bg-brand-card dark:bg-dark-card border border-brand-border dark:border-dark-border rounded-2xl space-y-10">
              <div className="flex items-center justify-between gap-4 border-b border-brand-border dark:border-dark-border pb-6">
                <div className="space-y-1">
                   <h3 className="text-2xl font-serif font-bold text-brand-text-primary dark:text-dark-text-primary">{customTitle || activeCategoryConfig.displayName + ' Reflection'}</h3>
                   <div className="flex items-center gap-2 text-xs text-brand-text-secondary">
                      <span>{isAnonymous ? t('common.anonymous') : authorName}</span>
                      <span>·</span>
                      <span>{category}</span>
                   </div>
                </div>
                <div className={`px-3 py-1 rounded border border-current text-[10px] font-bold uppercase ${outcomeStatus === 'worked' ? 'text-emerald-600' : outcomeStatus === 'partially_worked' ? 'text-amber-600' : 'text-rose-600'}`}>
                  {outcomeStatus.replace('_', ' ')}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                 {[
                   { label: t('share.pillars.p1.label'), val: q1TryingToDo },
                   { label: t('share.pillars.p2.label'), val: q2ProblemFaced },
                   { label: t('share.pillars.p3.label'), val: q3WhatTried },
                   { label: t('share.pillars.p4.label'), val: q4WhatHappened },
                   { label: t('share.pillars.p5.label'), val: q5WhatLearned },
                   { label: t('share.pillars.p6.label'), val: q6WhatDoDifferently }
                 ].map((pillar) => (
                   <div key={pillar.label} className="space-y-1">
                     <span className="text-[9px] font-bold tracking-widest uppercase text-brand-text-secondary opacity-60">{pillar.label}</span>
                     <p className="text-sm text-brand-text-primary dark:text-dark-text-primary leading-relaxed">{pillar.val || t('common.not_specified', 'Not specified.')}</p>
                   </div>
                 ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-8 border-t border-brand-border dark:border-dark-border">
              <button onClick={handleBack} className="text-sm font-bold text-brand-text-secondary flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> {t('share.btn_back')}
              </button>
              <button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className="px-12 py-4 bg-brand-accent dark:bg-dark-accent text-white dark:text-dark-bg font-bold rounded-lg shadow-lg flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? t('share.btn_publishing') : t('share.btn_publish')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
