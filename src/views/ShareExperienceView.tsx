import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Category, OutcomeStatus, Experience } from '../types';
import { submitExperience } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Tooltip } from '../components/Tooltip';
import { AiWritingField } from '../components/AiWritingField';
import { AiWritingAssistantBanner } from '../components/AiWritingAssistantBanner';
import {
  SHARE_CATEGORIES,
  getCategoryConfig,
  ShareCategoryConfig,
} from '../data/shareCategoryTaxonomy';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Send,
  User,
  Shield,
  HelpCircle,
  Edit3,
  Check,
  Tag,
  BookOpen,
  Info,
  AlertTriangle,
  RotateCcw,
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

  // Current Step (1: Category -> 2: Experience -> 3: Result -> 4: Share -> 5: Review)
  const [currentStep, setCurrentStep] = useState<FormStep>(1);

  // Form State
  const [category, setCategory] = useState<Category>('Education');
  const [customTitle, setCustomTitle] = useState('');

  // Category Question Answers (Preserved even if category is switched)
  const [q1TryingToDo, setQ1TryingToDo] = useState('');
  const [q2ProblemFaced, setQ2ProblemFaced] = useState('');
  const [q3WhatTried, setQ3WhatTried] = useState('');
  const [q4WhatHappened, setQ4WhatHappened] = useState('');
  const [q5WhatLearned, setQ5WhatLearned] = useState('');
  const [q6WhatDoDifferently, setQ6WhatDoDifferently] = useState('');

  // Step 3: Result
  const [outcomeStatus, setOutcomeStatus] = useState<OutcomeStatus>('worked');

  // Step 4: Share
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [authorName, setAuthorName] = useState(
    userProfile?.name || currentUser?.displayName || ''
  );

  // Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active Category Config
  const activeCategoryConfig: ShareCategoryConfig = getCategoryConfig(category);
  const CategoryIcon = activeCategoryConfig.icon;

  // Validation before proceeding
  const validateStep = (step: FormStep): boolean => {
    setError(null);
    if (step === 2) {
      if (!q1TryingToDo.trim() && !q2ProblemFaced.trim()) {
        setError('Please describe what you were trying to do and what problem you faced.');
        return false;
      }
      if (!q3WhatTried.trim()) {
        setError('Please share what you tried or did in your situation.');
        return false;
      }
      if (!q4WhatHappened.trim()) {
        setError('Please tell us what happened or what the result was.');
        return false;
      }
      if (!q5WhatLearned.trim()) {
        setError('Please share what you learned from this experience.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 5) {
        setCurrentStep((prev) => (prev + 1) as FormStep);
        window.scrollTo({ top: 120, behavior: 'smooth' });
      }
    }
  };

  const handleBack = () => {
    setError(null);
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as FormStep);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const handleSelectCategory = (catId: Category) => {
    setCategory(catId);
    setError(null);
    setCurrentStep(2);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleReset = () => {
    setQ1TryingToDo('');
    setQ2ProblemFaced('');
    setQ3WhatTried('');
    setQ4WhatHappened('');
    setQ5WhatLearned('');
    setQ6WhatDoDifferently('');
    setCustomTitle('');
    setOutcomeStatus('worked');
    setIsAnonymous(false);
    setError(null);
    setCurrentStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(2)) {
      setCurrentStep(2);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const actionsArray = q3WhatTried
      .split('\n')
      .map((a) => a.trim())
      .filter((a) => a.length > 0);

    // Map conversational answers to backend Experience model
    const situationCombined = q2ProblemFaced.trim()
      ? `${q1TryingToDo.trim()}\n\nChallenge faced: ${q2ProblemFaced.trim()}`
      : q1TryingToDo.trim();

    const titleGenerated =
      customTitle.trim() ||
      `${activeCategoryConfig.displayName}: ${q1TryingToDo.trim().slice(0, 50)}...`;

    try {
      const newExp = await submitExperience({
        title: titleGenerated,
        category: category,
        situation: situationCombined,
        actionsTaken: actionsArray.length > 0 ? actionsArray : [q3WhatTried.trim()],
        whyChosen: q1TryingToDo.trim(),
        outcome: q4WhatHappened.trim(),
        outcomeStatus,
        lesson: q5WhatLearned.trim(),
        whatWouldChange: q6WhatDoDifferently.trim(),
        isAnonymous,
        authorName: isAnonymous
          ? 'Anonymous Contributor'
          : authorName.trim() || userProfile?.name || 'Community Contributor',
        tags: [activeCategoryConfig.displayName, 'Community Experience'],
        bannerURL: userProfile?.bannerURL || '',
      });

      if (currentUser && !isGuest) {
        try {
          await setDoc(doc(db, 'experiences', newExp.id), newExp, { merge: true });
        } catch (fsErr) {
          console.info('Client direct Firestore persist notice:', fsErr);
        }
      }

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // confetti fallback
      }

      if (onExperienceAdded) {
        onExperienceAdded(newExp);
      }
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'We could not publish your experience. Please try again.');
      setIsSubmitting(false);
    }
  };

  const stepsList = [
    { number: 1, title: '1. Category' },
    { number: 2, title: '2. Your Experience' },
    { number: 3, title: '3. Result' },
    { number: 4, title: '4. Share' },
    { number: 5, title: '5. Review' },
  ];

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-10 space-y-8 animate-fadeIn pb-20">
      {/* ========================================================
          HEADER & INTRODUCTION
         ======================================================== */}
      <div className="space-y-3 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800">
          <BookOpen className="w-3.5 h-3.5" />
          <span>COMMUNITY KNOWLEDGE • REAL STORIES</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Share Your Experience
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl">
          What you learned from real life helps others avoid mistakes and find what works. Answer a few simple questions below.
        </p>
      </div>

      {/* ========================================================
          SUCCESS STATE
         ======================================================== */}
      {submitted ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center space-y-6 shadow-sm animate-fadeIn">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              Thank You for Sharing!
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              Your experience in <strong className="text-slate-900 dark:text-slate-200">{activeCategoryConfig.displayName}</strong> is now published in the community knowledge library. When someone faces a similar problem, they can learn from your tested steps.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              type="button"
              id="browse-database-btn"
              onClick={() => onNavigate('experiences')}
              className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 cursor-pointer shadow-sm transition-all"
            >
              Browse Experience Database
            </button>
            <button
              type="button"
              id="share-another-btn"
              onClick={() => {
                setSubmitted(false);
                handleReset();
              }}
              className="px-6 py-3 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition-all"
            >
              Share Another Experience
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* ========================================================
              STEP PROGRESS BAR (Simple & Clickable)
             ======================================================== */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 sm:p-4 shadow-xs">
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {stepsList.map((step) => {
                const isCurrent = currentStep === step.number;
                const isPassed = currentStep > step.number;
                return (
                  <button
                    key={step.number}
                    type="button"
                    onClick={() => {
                      if (isPassed || (step.number === 2 && validateStep(1))) {
                        setCurrentStep(step.number as FormStep);
                        setError(null);
                      }
                    }}
                    className={`py-2 px-1 sm:px-3 rounded-xl text-center transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                      isCurrent
                        ? 'bg-indigo-600 text-white font-bold shadow-xs'
                        : isPassed
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900'
                        : 'bg-slate-50 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 hover:text-slate-600'
                    }`}
                  >
                    <span className="text-[10px] sm:text-xs tracking-tight truncate">
                      {step.title}
                    </span>
                    {isPassed && (
                      <Check className="w-3 h-3 text-emerald-500 flex-shrink-0 hidden sm:inline" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ========================================================
              STEP 1: CATEGORY SELECTION
             ======================================================== */}
          {currentStep === 1 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6 animate-fadeIn">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Step 1 of 5
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                  What is your experience about?
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  Select the main topic below. We will show you questions specifically tailored to that category.
                </p>
              </div>

              {/* Category Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
                {SHARE_CATEGORIES.map((catConfig) => {
                  const Icon = catConfig.icon;
                  const isSelected = category === catConfig.id;

                  return (
                    <button
                      key={catConfig.id}
                      type="button"
                      id={`cat-card-${catConfig.id.toLowerCase().replace(/\s+/g, '-')}`}
                      onClick={() => handleSelectCategory(catConfig.id)}
                      className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer group relative ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-300 dark:ring-indigo-800'
                          : 'bg-white dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/40 dark:hover:bg-slate-800/60 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : `${catConfig.badgeBg} ${catConfig.badgeText}`
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        {isSelected ? (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white flex items-center gap-1">
                            <Check className="w-3 h-3" /> Selected
                          </span>
                        ) : (
                          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <h3 className="font-bold text-sm leading-snug">
                          {catConfig.displayName}
                        </h3>
                        <p
                          className={`text-xs line-clamp-2 ${
                            isSelected
                              ? 'text-indigo-100'
                              : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {catConfig.subtitle}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Selected: <strong className="text-slate-900 dark:text-slate-200">{activeCategoryConfig.displayName}</strong>
                </span>
                <button
                  type="button"
                  id="step1-continue-btn"
                  onClick={() => setCurrentStep(2)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs text-white bg-slate-900 dark:bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 cursor-pointer shadow-sm transition-all"
                >
                  <span>Continue to Questions</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================
              STEP 2: YOUR EXPERIENCE (Category-Specific Questions)
             ======================================================== */}
          {currentStep === 2 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-7 animate-fadeIn">
              {/* Category Active Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-slate-50 via-indigo-50/40 to-slate-50 dark:from-slate-950 dark:via-indigo-950/30 dark:to-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${activeCategoryConfig.badgeBg} ${activeCategoryConfig.badgeText} border ${activeCategoryConfig.borderClass}`}>
                    <CategoryIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      Step 2: Questions for {activeCategoryConfig.displayName}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {activeCategoryConfig.subtitle}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>Change Category</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* AI Writing Assistant Banner */}
              <AiWritingAssistantBanner />

              {/* Special Category Notice (Security / Medical / Privacy) */}
              {activeCategoryConfig.notice && (
                <div
                  className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 ${
                    activeCategoryConfig.notice.type === 'warning'
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-900'
                      : activeCategoryConfig.notice.type === 'shield'
                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 border border-rose-200 dark:border-rose-900'
                      : 'bg-teal-50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200 border border-teal-200 dark:border-teal-900'
                  }`}
                >
                  {activeCategoryConfig.notice.type === 'warning' && (
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  )}
                  {activeCategoryConfig.notice.type === 'shield' && (
                    <Shield className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  )}
                  {activeCategoryConfig.notice.type === 'info' && (
                    <Info className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <strong className="block font-bold">
                      {activeCategoryConfig.notice.title}
                    </strong>
                    <span>{activeCategoryConfig.notice.message}</span>
                  </div>
                </div>
              )}

              {/* Question 1: Trying to do */}
              <AiWritingField
                id="q1-trying-to-do"
                fieldName={activeCategoryConfig.q1.fieldName}
                fieldCategoryContext={activeCategoryConfig.displayName}
                label={activeCategoryConfig.q1.label}
                labelExtra={
                  <Tooltip content={activeCategoryConfig.q1.helperText || ''} position="top">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
                  </Tooltip>
                }
                required
                rows={2}
                value={q1TryingToDo}
                onChange={setQ1TryingToDo}
                placeholder={activeCategoryConfig.q1.placeholder}
                helperText={activeCategoryConfig.q1.helperText}
              />

              {/* Question 2: Problem faced */}
              <AiWritingField
                id="q2-problem-faced"
                fieldName={activeCategoryConfig.q2.fieldName}
                fieldCategoryContext={activeCategoryConfig.displayName}
                label={activeCategoryConfig.q2.label}
                labelExtra={
                  <Tooltip content={activeCategoryConfig.q2.helperText || ''} position="top">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
                  </Tooltip>
                }
                required
                rows={2}
                value={q2ProblemFaced}
                onChange={setQ2ProblemFaced}
                placeholder={activeCategoryConfig.q2.placeholder}
                helperText={activeCategoryConfig.q2.helperText}
              />

              {/* Question 3: What did you try */}
              <AiWritingField
                id="q3-what-tried"
                fieldName={activeCategoryConfig.q3.fieldName}
                fieldCategoryContext={activeCategoryConfig.displayName}
                label={activeCategoryConfig.q3.label}
                labelExtra={
                  <Tooltip content={activeCategoryConfig.q3.helperText || ''} position="top">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
                  </Tooltip>
                }
                required
                rows={3}
                value={q3WhatTried}
                onChange={setQ3WhatTried}
                placeholder={activeCategoryConfig.q3.placeholder}
                helperText={activeCategoryConfig.q3.helperText}
              />

              {/* Question 4: What happened / Result */}
              <AiWritingField
                id="q4-what-happened"
                fieldName={activeCategoryConfig.q4.fieldName}
                fieldCategoryContext={activeCategoryConfig.displayName}
                label={activeCategoryConfig.q4.label}
                labelExtra={
                  <Tooltip content={activeCategoryConfig.q4.helperText || ''} position="top">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
                  </Tooltip>
                }
                required
                rows={2}
                value={q4WhatHappened}
                onChange={setQ4WhatHappened}
                placeholder={activeCategoryConfig.q4.placeholder}
                helperText={activeCategoryConfig.q4.helperText}
              />

              {/* Question 5: What did you learn */}
              <AiWritingField
                id="q5-what-learned"
                fieldName={activeCategoryConfig.q5.fieldName}
                fieldCategoryContext={activeCategoryConfig.displayName}
                label={activeCategoryConfig.q5.label}
                labelExtra={
                  <Tooltip content={activeCategoryConfig.q5.helperText || ''} position="top">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
                  </Tooltip>
                }
                required
                rows={2}
                value={q5WhatLearned}
                onChange={setQ5WhatLearned}
                placeholder={activeCategoryConfig.q5.placeholder}
                helperText={activeCategoryConfig.q5.helperText}
              />

              {/* Question 6: What would you do differently next time */}
              <AiWritingField
                id="q6-what-do-differently"
                fieldName={activeCategoryConfig.q6.fieldName}
                fieldCategoryContext={activeCategoryConfig.displayName}
                label={activeCategoryConfig.q6.label}
                labelExtra={
                  <Tooltip content={activeCategoryConfig.q6.helperText || ''} position="top">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
                  </Tooltip>
                }
                rows={2}
                value={q6WhatDoDifferently}
                onChange={setQ6WhatDoDifferently}
                placeholder={activeCategoryConfig.q6.placeholder}
                helperText={activeCategoryConfig.q6.helperText}
              />

              {error && (
                <div className="p-3.5 bg-rose-50 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 text-xs rounded-xl border border-rose-200 dark:border-rose-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Step 2 Actions */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Categories</span>
                </button>

                <button
                  type="button"
                  id="step2-next-btn"
                  onClick={handleNext}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs text-white bg-slate-900 dark:bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 cursor-pointer shadow-sm transition-all"
                >
                  <span>Next: Result</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================
              STEP 3: RESULT (How did it go?)
             ======================================================== */}
          {currentStep === 3 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6 animate-fadeIn">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Step 3 of 5
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                  How did it go?
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  Every result is valuable. Sharing what didn't work saves others from making the same mistake.
                </p>
              </div>

              {/* 3 Outcome Options */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                {/* 1. It Worked */}
                <button
                  type="button"
                  id="result-worked-btn"
                  onClick={() => setOutcomeStatus('worked')}
                  className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                    outcomeStatus === 'worked'
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-300 dark:ring-emerald-800 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-300 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    {outcomeStatus === 'worked' && (
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-emerald-900 dark:text-emerald-200">
                      It worked
                    </h3>
                    <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 mt-1 leading-relaxed">
                      The approach solved the problem or achieved the desired goal.
                    </p>
                  </div>
                </button>

                {/* 2. It Partly Worked */}
                <button
                  type="button"
                  id="result-partly-worked-btn"
                  onClick={() => setOutcomeStatus('partially_worked')}
                  className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                    outcomeStatus === 'partially_worked'
                      ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-500 text-amber-950 dark:text-amber-200 ring-2 ring-amber-300 dark:ring-amber-800 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-300 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-300 flex items-center justify-center">
                      <Clock className="w-5 h-5" />
                    </div>
                    {outcomeStatus === 'partially_worked' && (
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-amber-900 dark:text-amber-200">
                      It partly worked
                    </h3>
                    <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-1 leading-relaxed">
                      Some parts helped, but it required changes or had mixed results.
                    </p>
                  </div>
                </button>

                {/* 3. It Didn't Work */}
                <button
                  type="button"
                  id="result-did-not-work-btn"
                  onClick={() => setOutcomeStatus('did_not_work')}
                  className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                    outcomeStatus === 'did_not_work'
                      ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-500 text-rose-950 dark:text-rose-200 ring-2 ring-rose-300 dark:ring-rose-800 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-rose-300 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300 flex items-center justify-center">
                      <XCircle className="w-5 h-5" />
                    </div>
                    {outcomeStatus === 'did_not_work' && (
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-rose-900 dark:text-rose-200">
                      It didn't work
                    </h3>
                    <p className="text-xs text-rose-800/80 dark:text-rose-300/80 mt-1 leading-relaxed">
                      The attempt failed or ran into dead-ends. Crucial for warning others!
                    </p>
                  </div>
                </button>
              </div>

              {/* Step 3 Actions */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Questions</span>
                </button>

                <button
                  type="button"
                  id="step3-next-btn"
                  onClick={handleNext}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs text-white bg-slate-900 dark:bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 cursor-pointer shadow-sm transition-all"
                >
                  <span>Next: How to Share</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================
              STEP 4: SHARE (Name vs Anonymous)
             ======================================================== */}
          {currentStep === 4 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6 animate-fadeIn">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Step 4 of 5
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                  How should we show your name?
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  You can share with your name and background, or contribute 100% anonymously.
                </p>
              </div>

              {/* 2 Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Option A: Show Name */}
                <button
                  type="button"
                  id="share-show-name-card"
                  onClick={() => setIsAnonymous(false)}
                  className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                    !isAnonymous
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500 text-indigo-950 dark:text-indigo-200 ring-2 ring-indigo-300 dark:ring-indigo-800'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/70 text-indigo-700 dark:text-indigo-300 flex items-center justify-center">
                      <User className="w-5 h-5" />
                    </div>
                    {!isAnonymous && <Check className="w-4 h-4 text-indigo-600" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      Show my name
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Build your contributor reputation in the Xperiens community.
                    </p>
                  </div>
                </button>

                {/* Option B: Anonymous */}
                <button
                  type="button"
                  id="share-anon-card"
                  onClick={() => setIsAnonymous(true)}
                  className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                    isAnonymous
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500 text-indigo-950 dark:text-indigo-200 ring-2 ring-indigo-300 dark:ring-indigo-800'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                      <Shield className="w-5 h-5" />
                    </div>
                    {isAnonymous && <Check className="w-4 h-4 text-indigo-600" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      Share anonymously
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Your name and identity will never be visible to other members.
                    </p>
                  </div>
                </button>
              </div>

              {/* Name Input if not anonymous */}
              {!isAnonymous && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 animate-fadeIn">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    Your Display Name or Role
                  </label>
                  <input
                    type="text"
                    id="author-name-input"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="e.g. Alex (Engineering Lead) or Maya (Student)"
                    className="w-full text-xs p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950 outline-hidden"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    This is how other learners will see your story signed.
                  </p>
                </div>
              )}

              {/* Optional Custom Title */}
              <div className="space-y-1.5 pt-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Give your story a title (Optional)
                </label>
                <input
                  type="text"
                  id="custom-title-input"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder={`e.g. ${activeCategoryConfig.displayName}: How I solved ${q1TryingToDo ? q1TryingToDo.slice(0, 35) : 'this challenge'}...`}
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-hidden"
                />
              </div>

              {/* Step 4 Actions */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Result</span>
                </button>

                <button
                  type="button"
                  id="step4-next-btn"
                  onClick={handleNext}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs text-white bg-slate-900 dark:bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 cursor-pointer shadow-sm transition-all"
                >
                  <span>Review & Submit</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================
              STEP 5: REVIEW & SUBMIT
             ======================================================== */}
          {currentStep === 5 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6 animate-fadeIn">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Step 5 of 5
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Review Your Experience
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  Please review your summary before publishing to the community.
                </p>
              </div>

              {/* Review Summary Card */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-5 sm:p-6 space-y-5">
                {/* Header Meta */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold ${activeCategoryConfig.badgeBg} ${activeCategoryConfig.badgeText} border ${activeCategoryConfig.borderClass}`}>
                      <CategoryIcon className="w-3.5 h-3.5" />
                      <span>{activeCategoryConfig.displayName}</span>
                    </span>

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                        outcomeStatus === 'worked'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                          : outcomeStatus === 'partially_worked'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                          : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                      }`}
                    >
                      {outcomeStatus === 'worked' ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : outcomeStatus === 'partially_worked' ? (
                        <Clock className="w-3.5 h-3.5" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {outcomeStatus === 'worked'
                          ? 'Result: It worked'
                          : outcomeStatus === 'partially_worked'
                          ? 'Result: It partly worked'
                          : "Result: It didn't work"}
                      </span>
                    </span>
                  </div>

                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Shared as:{' '}
                    <strong className="text-slate-800 dark:text-slate-200">
                      {isAnonymous
                        ? 'Anonymous Contributor'
                        : authorName || userProfile?.name || 'Community Member'}
                    </strong>
                  </span>
                </div>

                {/* 1. Experience Situation */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Experience
                  </h4>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {q1TryingToDo || 'No description provided.'}
                  </p>
                  {q2ProblemFaced && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                      <strong className="text-indigo-600 dark:text-indigo-400 block mb-0.5">
                        Problem Faced:
                      </strong>
                      {q2ProblemFaced}
                    </p>
                  )}
                </div>

                {/* 2. What I Tried */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    What I Tried
                  </h4>
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 space-y-1">
                    {q3WhatTried.split('\n').filter((l) => l.trim()).map((line, idx) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <span className="text-indigo-500 font-bold">•</span>
                        <span>{line}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Result / Outcome */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Result & What Happened
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    {q4WhatHappened}
                  </p>
                </div>

                {/* 4. What I Learned */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    What I Learned
                  </h4>
                  <p className="text-xs text-indigo-950 dark:text-indigo-200 bg-indigo-50/60 dark:bg-indigo-950/40 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900 italic">
                    "{q5WhatLearned}"
                  </p>
                  {q6WhatDoDifferently && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                      <strong className="text-slate-800 dark:text-slate-200 block mb-0.5">
                        What I would do differently:
                      </strong>
                      {q6WhatDoDifferently}
                    </p>
                  )}
                </div>
              </div>

              {error && (
                <div className="p-3.5 bg-rose-50 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 text-xs rounded-xl border border-rose-200 dark:border-rose-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Step 5 Actions */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Answers</span>
                </button>

                <button
                  type="button"
                  id="final-share-submit-btn"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-slate-900 dark:bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 disabled:opacity-50 transition-all cursor-pointer shadow-md"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Publishing to Community...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Share Experience</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
