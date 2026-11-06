import React, { useState, useEffect, useMemo } from 'react';
import {
  ProblemInput,
  Category,
  UrgencyLevel,
  SolutionAnalysis,
  Experience,
} from '../types';
import { analyzeProblem, fetchExperiences } from '../services/api';
import { CATEGORY_TAXONOMY, ALL_CATEGORIES, CategoryMetadata } from '../data/categoryTaxonomy';
import { AiWritingField } from '../components/AiWritingField';
import { AiWritingAssistantBanner } from '../components/AiWritingAssistantBanner';
import { useLanguage } from '../contexts/LanguageContext';
import { ViewMode } from '../App';
import {
  Sparkles,
  ArrowRight,
  Brain,
  AlertCircle,
  FileText,
  Lightbulb,
  Compass,
  RotateCcw,
  BookOpen,
  ArrowUpRight,
  Sliders,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AskViewProps {
  initialProblem?: string;
  initialCategory?: Category;
  onAnalysisComplete: (solution: SolutionAnalysis) => void;
  onNavigate?: (view: ViewMode) => void;
}

export const AskView: React.FC<AskViewProps> = ({
  initialProblem = '',
  initialCategory = 'Career',
  onAnalysisComplete,
  onNavigate,
}) => {
  const [problem, setProblem] = useState(initialProblem);
  const [context, setContext] = useState('');
  const [goal, setGoal] = useState('');
  const [alreadyTried, setAlreadyTried] = useState('');
  const [budget, setBudget] = useState('');
  const [timeConstraint, setTimeConstraint] = useState('');
  const [resources, setResources] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [category, setCategory] = useState<Category>(initialCategory);
  const [urgency, setUrgency] = useState<UrgencyLevel>('medium');
  const [categoryDetails, setCategoryDetails] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'form' | 'experiences' | 'patterns'>('form');
  const [categoryExperiences, setCategoryExperiences] = useState<Experience[]>([]);
  const [loadingCategoryExps, setLoadingCategoryExps] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const { t, language } = useLanguage();

  const LOADING_STAGES = [
    t('ask.loading_step1', 'Verifying context and category...'),
    t('ask.loading_step2', 'Searching verified community trials...'),
    t('ask.loading_step3', 'Analyzing successful outcomes...'),
    t('ask.loading_step4', 'Extracting practical pitfalls...'),
    t('ask.loading_step5', 'Synthesizing your action plan...'),
    t('ask.loading_step6', 'Finalizing editorial strategy...')
  ];

  const currentCategoryData: CategoryMetadata = useMemo(() => {
    return CATEGORY_TAXONOMY[category] || CATEGORY_TAXONOMY['Other'];
  }, [category]);

  useEffect(() => {
    if (initialProblem && !problem) setProblem(initialProblem);
  }, [initialProblem]);

  useEffect(() => {
    let isMounted = true;
    const loadCategoryData = async () => {
      setLoadingCategoryExps(true);
      try {
        const res = await fetchExperiences({ category, limit: 6 });
        if (isMounted) setCategoryExperiences(res.experiences || []);
      } catch (err) {
        console.warn('Failed to load experiences:', err);
      } finally {
        if (isMounted) setLoadingCategoryExps(false);
      }
    };
    loadCategoryData();
    return () => { isMounted = false; };
  }, [category]);

  const handleCategoryDetailChange = (fieldId: string, value: string) => {
    setCategoryDetails(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleApplyPreset = (scenario: any) => {
    setProblem(scenario.data.problem);
    setContext(scenario.data.context);
    setGoal(scenario.data.goal);
    setAlreadyTried(scenario.data.alreadyTried || '');
    setCategory(scenario.data.category);
    setUrgency(scenario.data.urgency);
    setActiveTab('form');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problem.trim()) {
      setError(t('common.error_required_problem', 'Please describe your situation.'));
      return;
    }

    setIsLoading(true);
    setError(null);
    setCurrentStageIdx(0);

    const stageInterval = setInterval(() => {
      setCurrentStageIdx(prev => (prev < LOADING_STAGES.length - 1 ? prev + 1 : prev));
    }, 1000);

    try {
      const solution = await analyzeProblem({
        problem: problem.trim(),
        context: context.trim(),
        goal: goal.trim() || 'Find a tested solution',
        alreadyTried: alreadyTried.trim(),
        constraints: { budget, time: timeConstraint, resources, experienceLevel },
        category,
        urgency,
        includeDemoData: true,
        languageStyle: language,
      });
      clearInterval(stageInterval);
      onAnalysisComplete(solution);
    } catch (err: any) {
      clearInterval(stageInterval);
      setError(err.message || t('common.error_generic', 'Analysis failed. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  const CategoryIcon = currentCategoryData.icon;

  return (
    <div className="max-w-5xl mx-auto py-12 sm:py-16 px-6 space-y-16 pb-24">
      {/* Editorial Hero */}
      <div className="space-y-6 max-w-2xl">
         <div className="text-xs font-bold text-brand-accent dark:text-dark-accent uppercase tracking-widest flex items-center gap-2">
            <Brain className="w-4 h-4" />
            <span>{t('common.synthesized_intelligence', 'Synthesized Intelligence')}</span>
         </div>
         <h1 className="text-4xl sm:text-5xl font-serif font-bold text-brand-text-primary dark:text-dark-text-primary tracking-tight leading-tight">
           {t('ask.headline')}
         </h1>
         <p className="text-lg text-brand-text-secondary dark:text-dark-text-secondary font-light leading-relaxed">
           {t('ask.description')}
         </p>
      </div>

      {/* Category Selection */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-brand-border dark:border-dark-border pb-4">
          <h2 className="text-xs font-bold text-brand-text-primary dark:text-dark-text-primary uppercase tracking-widest">{t('ask.step1')}</h2>
          <span className="text-xs text-brand-text-secondary dark:text-dark-text-secondary">{t('common.current', 'Current')}: {category}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {ALL_CATEGORIES.map(catId => {
            const meta = CATEGORY_TAXONOMY[catId];
            const Icon = meta.icon;
            const isSelected = category === catId;
            return (
              <button
                key={catId}
                onClick={() => setCategory(catId)}
                className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between aspect-square group ${
                  isSelected
                    ? 'bg-brand-text-primary dark:bg-dark-text-primary text-brand-bg dark:text-dark-bg border-brand-text-primary dark:border-dark-text-primary shadow-lg'
                    : 'bg-brand-card dark:bg-dark-card border-brand-border dark:border-dark-border text-brand-text-primary dark:text-dark-text-primary hover:border-brand-accent dark:hover:border-dark-accent'
                }`}
              >
                <div className={`p-2 rounded-lg w-fit transition-colors ${isSelected ? 'bg-white/10' : 'bg-brand-bg dark:bg-dark-sec-bg'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-xs leading-tight">{meta.shortLabel}</div>
                  <div className={`text-[10px] opacity-60 line-clamp-1`}>{meta.simpleTitle}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Form & Context Tabs */}
      <div className="space-y-10">
        <div className="flex items-center gap-8 border-b border-brand-border dark:border-dark-border pb-px overflow-x-auto scrollbar-hide">
          {[
            { id: 'form', label: t('ask.form_tab'), icon: FileText },
            { id: 'experiences', label: t('ask.stories_tab'), icon: BookOpen },
            { id: 'patterns', label: t('ask.presets_tab'), icon: Lightbulb },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 pb-4 text-xs font-bold uppercase tracking-widest transition-all relative ${
                activeTab === tab.id
                  ? 'text-brand-accent dark:text-dark-accent'
                  : 'text-brand-text-secondary dark:text-dark-text-secondary hover:text-brand-text-primary dark:hover:text-dark-text-primary'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-accent dark:bg-dark-accent" />}
            </button>
          ))}
        </div>

        <div className="min-h-[400px]">
          {activeTab === 'form' && (
            <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleSubmit} className="space-y-10">
              <AiWritingAssistantBanner />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <AiWritingField
                    id="problem-textarea"
                    fieldName="Situation"
                    label={t('ask.dilemma_label')}
                    required
                    rows={4}
                    value={problem}
                    onChange={setProblem}
                    placeholder={t('ask.dilemma_placeholder', 'Describe your current bottleneck in detail...')}
                  />
                  <AiWritingField
                    id="context-textarea"
                    fieldName="Context"
                    label={t('ask.context_label')}
                    rows={3}
                    value={context}
                    onChange={setContext}
                    placeholder={t('ask.context_placeholder', 'What specific factors make this unique?')}
                  />
                </div>

                <div className="space-y-8">
                   <div className="p-8 rounded-xl bg-brand-bg dark:bg-dark-sec-bg border border-brand-border dark:border-dark-border space-y-6">
                      <h3 className="text-xs font-bold text-brand-text-primary dark:text-dark-text-primary uppercase tracking-widest flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-brand-accent dark:text-dark-accent" />
                        <span>{t('common.domain_specifics', 'Domain Specifics')}</span>
                      </h3>
                      <div className="space-y-6">
                        {currentCategoryData.customFields.map(field => (
                          <div key={field.id} className="space-y-2">
                            <label className="text-xs font-semibold text-brand-text-secondary dark:text-dark-text-secondary">{field.label}</label>
                            <input
                              type="text"
                              value={categoryDetails[field.id] || ''}
                              onChange={(e) => handleCategoryDetailChange(field.id, e.target.value)}
                              placeholder={field.placeholder}
                              className="w-full p-3 rounded-lg border border-brand-border dark:border-dark-border bg-brand-card dark:bg-dark-card text-sm focus:ring-1 focus:ring-brand-accent outline-none"
                            />
                          </div>
                        ))}
                      </div>
                   </div>

                   <div className="space-y-4">
                      <label className="text-xs font-bold text-brand-text-primary dark:text-dark-text-primary uppercase tracking-widest">{t('ask.urgency')}</label>
                      <div className="flex gap-2">
                        {(['low', 'medium', 'high'] as UrgencyLevel[]).map(level => (
                          <button
                            key={level}
                            type="button"
                            onClick={() => setUrgency(level)}
                            className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all ${
                              urgency === level 
                                ? 'bg-brand-text-primary dark:bg-dark-text-primary text-brand-bg dark:text-dark-bg border-brand-text-primary dark:border-dark-text-primary' 
                                : 'border-brand-border dark:border-dark-border text-brand-text-secondary dark:text-dark-text-secondary'
                            }`}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                   </div>
                </div>
              </div>

              <div className="pt-10 border-t border-brand-border dark:border-dark-border flex flex-col sm:flex-row items-center justify-between gap-6">
                <button type="button" onClick={() => setProblem('')} className="flex items-center gap-2 text-xs font-bold text-brand-text-secondary dark:text-dark-text-secondary hover:text-brand-text-primary">
                  <RotateCcw className="w-4 h-4" />
                  <span>{t('common.clear', 'Clear Inquiry')}</span>
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto px-10 py-4 bg-brand-accent dark:bg-dark-accent text-white rounded-lg font-bold text-sm uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-3 shadow-xl"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{t('ask.synthesize_btn')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.form>
          )}

          {activeTab === 'experiences' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
              {categoryExperiences.map(exp => (
                <div key={exp.id} className="p-6 rounded-xl border border-brand-border dark:border-dark-border bg-brand-card dark:bg-dark-card space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-accent dark:text-dark-accent">{exp.outcomeStatus}</span>
                  </div>
                  <h4 className="text-lg font-serif font-bold text-brand-text-primary dark:text-dark-text-primary">{exp.title}</h4>
                  <p className="text-xs text-brand-text-secondary dark:text-dark-text-secondary line-clamp-3 leading-relaxed">{exp.situation}</p>
                  <button
                    onClick={() => { setProblem(exp.situation); setActiveTab('form'); }}
                    className="text-xs font-bold text-brand-text-primary dark:text-dark-text-primary hover:underline flex items-center gap-2"
                  >
                    <span>{t('common.use_as_reference', 'Use as Reference')}</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'patterns' && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                {currentCategoryData.sampleScenarios.map((sc, i) => (
                  <div key={i} className="p-6 rounded-xl border border-brand-border dark:border-dark-border bg-brand-card dark:bg-dark-card space-y-4">
                    <h4 className="text-lg font-serif font-bold text-brand-text-primary dark:text-dark-text-primary">{sc.title}</h4>
                    <p className="text-xs text-brand-text-secondary dark:text-dark-text-secondary">{sc.summary}</p>
                    <button
                      onClick={() => handleApplyPreset(sc)}
                      className="text-xs font-bold text-brand-accent dark:text-dark-accent hover:underline"
                    >
                      {t('common.apply_scenario', 'Apply Scenario Template')}
                    </button>
                  </div>
                ))}
             </div>
          )}
        </div>
      </div>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-brand-bg/80 dark:bg-dark-bg/80 backdrop-blur-md">
            <div className="max-w-md w-full text-center space-y-8 p-12">
               <div className="relative w-20 h-20 mx-auto">
                 <div className="absolute inset-0 border-2 border-brand-accent/20 rounded-full" />
                 <motion.div
                   animate={{ rotate: 360 }}
                   transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                   className="absolute inset-0 border-2 border-brand-accent border-t-transparent rounded-full"
                 />
                 <Brain className="absolute inset-0 m-auto w-8 h-8 text-brand-accent animate-pulse" />
               </div>
               <div className="space-y-3">
                 <h3 className="text-xl font-serif font-bold text-brand-text-primary dark:text-dark-text-primary">{t('ask.loading_msg')}</h3>
                 <p className="text-sm text-brand-text-secondary dark:text-dark-text-secondary font-light min-h-[1.5rem]">{LOADING_STAGES[currentStageIdx]}</p>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
