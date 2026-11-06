import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Compass,
  CheckCircle2,
  ShieldCheck,
  Brain,
  Layers,
  HelpCircle,
  X,
  Share2,
  AlertTriangle,
  Lightbulb,
  Lock,
  ThumbsUp,
  UserCheck,
} from 'lucide-react';
import { ViewMode } from '../App';
import { Logo } from '../components/Logo';
import { useLanguage } from '../contexts/LanguageContext';
import { BRAND_TAGLINE } from '../constants/brand';

interface OnboardingProps {
  onComplete: () => void;
  onNavigate: (view: ViewMode) => void;
}

export const OnboardingView: React.FC<OnboardingProps> = ({ onComplete, onNavigate }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { t } = useLanguage();

  const steps = [
    {
      number: '01',
      title: t('onboarding.step1.title'),
      subtitle: t('onboarding.step1.subtitle'),
      icon: <Brain className="w-8 h-8 text-brand-accent dark:text-dark-accent" />,
      content: (
        <div className="space-y-6 text-brand-text-secondary dark:text-dark-text-secondary leading-relaxed text-sm sm:text-base font-light">
          <p className="font-serif font-bold text-brand-text-primary dark:text-dark-text-primary text-xl sm:text-2xl leading-tight">
            {t('onboarding.step1.p1')}
          </p>
          <div className="p-6 bg-brand-bg dark:bg-dark-sec-bg rounded-xl border border-brand-border dark:border-dark-border space-y-3">
            <span className="font-bold block text-xs text-brand-text-primary dark:text-dark-text-primary flex items-center gap-2 uppercase tracking-widest">
              <Sparkles className="w-4 h-4 text-brand-accent dark:text-dark-accent" />
              {t('onboarding.step1.feature1')}
            </span>
            <p className="text-xs sm:text-sm leading-relaxed opacity-80">
              {t('onboarding.step1.feature1_desc')}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <span className="font-bold text-brand-text-primary dark:text-dark-text-primary block text-xs uppercase tracking-widest">{t('onboarding.step1.feature2')}</span>
              <span className="text-xs opacity-70">{t('onboarding.step1.feature2_desc')}</span>
            </div>
            <div className="space-y-1">
              <span className="font-bold text-brand-text-primary dark:text-dark-text-primary block text-xs uppercase tracking-widest">{t('onboarding.step1.feature3')}</span>
              <span className="text-xs opacity-70">{t('onboarding.step1.feature3_desc')}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      number: '02',
      title: t('onboarding.step2_title', 'How Xperiens Works'),
      subtitle: t('onboarding.step2_subtitle', 'The 8-step closed-loop problem solving cycle'),
      icon: <Layers className="w-8 h-8 text-brand-accent dark:text-dark-accent" />,
      content: (
        <div className="space-y-6">
          <p className="text-xs sm:text-sm text-brand-text-secondary dark:text-dark-text-secondary font-light">
            {t('onboarding.step2_desc', 'Xperiens follows an evidence-backed intelligence cycle that continuously refines collective knowledge:')}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { step: '1', title: t('common.situation'), desc: 'Context & details' },
              { step: '2', title: 'Human Cases', desc: 'Search trials' },
              { step: '3', title: 'Analysis', desc: 'Weigh outcomes' },
              { step: '4', title: 'Strategy', desc: 'AI action plan' },
              { step: '5', title: 'Trial', desc: 'Real world test' },
              { step: '6', title: 'Report', desc: 'Log outcome' },
              { step: '7', title: 'Wisdom', desc: 'Publish lesson' },
              { step: '8', title: 'Impact', desc: 'Help others' },
            ].map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-brand-border dark:border-dark-border bg-brand-card dark:bg-dark-card flex flex-col justify-between aspect-square">
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">{item.step}</span>
                <div>
                  <div className="text-xs font-bold text-brand-text-primary dark:text-dark-text-primary leading-tight mb-1">{item.title}</div>
                  <div className="text-[10px] text-brand-text-secondary dark:text-dark-text-secondary leading-snug">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      number: '03',
      title: t('onboarding.step3_title', 'The Wisdom Pool'),
      subtitle: t('onboarding.step3_subtitle', 'An honest baseline that grows with the community'),
      icon: <Compass className="w-8 h-8 text-brand-accent dark:text-dark-accent" />,
      content: (
        <div className="space-y-6 text-brand-text-secondary dark:text-dark-text-secondary text-sm font-light leading-relaxed">
          <div className="p-6 bg-brand-bg dark:bg-dark-sec-bg rounded-xl border border-brand-border dark:border-dark-border space-y-3">
            <div className="flex items-center gap-2 font-bold text-brand-text-primary dark:text-dark-text-primary text-xs uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4 text-brand-accent dark:text-dark-accent" />
              <span>{t('onboarding.step3_feature', 'Zero Synthetic Baseline')}</span>
            </div>
            <p className="text-xs sm:text-sm opacity-80 leading-relaxed">
              {t('onboarding.step3_desc', 'Xperiens does not use fake data. Our library grows only through genuine human contributions, ensuring every lesson is rooted in reality.')}
            </p>
          </div>
          <p className="font-serif font-bold text-brand-text-primary dark:text-dark-text-primary text-xl leading-snug">
            “{t('onboarding.step3_quote', 'Collective human wisdom meets AI-driven analysis.')}”
          </p>
          <div className="text-xs opacity-70 italic border-l border-brand-border dark:border-dark-border pl-4">
             {t('onboarding.step3_note', 'Note: Any demo or reference data used during early platform growth is explicitly labeled with an "Editorial Reference" tag to maintain absolute transparency.')}
          </div>
        </div>
      ),
    },
    {
      number: '04',
      title: t('onboarding.step4_title', 'Privacy & Control'),
      subtitle: t('onboarding.step4_subtitle', 'You maintain full ownership of your data'),
      icon: <Lock className="w-8 h-8 text-brand-accent dark:text-dark-accent" />,
      content: (
        <div className="space-y-6 text-brand-text-secondary dark:text-dark-text-secondary text-sm font-light">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: t('common.anonymous'), desc: 'Share without revealing your identity.' },
              { label: 'Private Tracks', desc: 'Keep your strategy plans for your eyes only.' },
              { label: 'Full Portability', desc: 'Delete your experiences or account anytime.' },
              { label: 'Secure Hosting', desc: 'Encrypted storage with industry standards.' },
            ].map((f, i) => (
              <div key={i} className="p-5 bg-brand-bg dark:bg-dark-sec-bg rounded-xl border border-brand-border dark:border-dark-border space-y-2">
                <span className="font-bold text-brand-text-primary dark:text-dark-text-primary block text-xs uppercase tracking-widest">{f.label}</span>
                <span className="text-xs opacity-70 leading-relaxed">{f.desc}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-[10px] font-bold uppercase tracking-widest opacity-50 pt-4">
            {t('common.protected_by', 'Protected by Firebase Authentication & Secure Rules')}
          </p>
        </div>
      ),
    },
  ];

  const current = steps[currentStep];
  const isFinalStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-dark-bg py-12 px-6 flex flex-col justify-center items-center">
      <div className="max-w-2xl w-full space-y-12 animate-fadeIn">
        <div className="flex flex-col items-center text-center space-y-6">
          <Logo className="h-10 w-auto" />
          <p className="text-sm font-serif italic text-brand-text-secondary dark:text-dark-text-secondary">
            {BRAND_TAGLINE}
          </p>
          <div className="flex items-center gap-1.5">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-500 ${
                  i === currentStep ? 'w-8 bg-brand-accent dark:bg-dark-accent' : 'w-2 bg-brand-border dark:border-dark-border'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="bg-brand-card dark:bg-dark-card rounded-2xl border border-brand-border dark:border-dark-border shadow-sm p-8 sm:p-12 space-y-10 relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="space-y-3">
                <div className="text-[10px] font-bold uppercase tracking-widest text-brand-accent dark:text-dark-accent">
                   {t('common.phase', 'Phase')} {current.number}
                </div>
                <h2 className="text-3xl font-serif font-bold text-brand-text-primary dark:text-dark-text-primary tracking-tight">
                  {current.title}
                </h2>
                <p className="text-sm text-brand-text-secondary dark:text-dark-text-secondary font-light">
                  {current.subtitle}
                </p>
              </div>

              <div>{current.content}</div>
            </motion.div>
          </AnimatePresence>

          <div className="pt-8 border-t border-brand-border dark:border-dark-border flex flex-col sm:flex-row items-center justify-between gap-6">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all ${
                currentStep === 0 ? 'opacity-0 pointer-events-none' : 'text-brand-text-secondary dark:text-dark-text-secondary hover:text-brand-text-primary dark:hover:text-dark-text-primary'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('common.back')}</span>
            </button>

            {!isFinalStep ? (
              <button
                onClick={handleNext}
                className="w-full sm:w-auto px-8 py-3 bg-brand-text-primary dark:bg-dark-text-primary text-brand-bg dark:text-dark-bg rounded-lg font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <span>{t('common.continue', 'Continue')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onComplete}
                className="w-full sm:w-auto px-8 py-3 bg-brand-accent dark:bg-dark-accent text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <span>{t('onboarding.enter')}</span>
                <Sparkles className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <button
          onClick={onComplete}
          className="text-[10px] font-bold uppercase tracking-widest text-brand-text-secondary dark:text-dark-text-secondary hover:text-brand-text-primary dark:hover:text-dark-text-primary transition-all underline underline-offset-4"
        >
          {t('onboarding.skip')}
        </button>
      </div>
    </div>
  );
};
