import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Experience, Category } from '../types';
import { ViewMode } from '../App';
import { ExperienceCard } from '../components/ExperienceCard';
import { useLanguage } from '../contexts/LanguageContext';
import { BRAND_TAGLINE } from '../constants/brand';
import { Search, ArrowRight, Compass, Eye, GraduationCap, Lightbulb } from 'lucide-react';

interface HomeViewProps {
  onNavigate: (view: ViewMode) => void;
  onSelectProblemPreset: (problemText: string, category?: Category) => void;
  featuredExperiences: Experience[];
  onSelectExperience?: (exp: Experience) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  onSelectProblemPreset,
  featuredExperiences,
  onSelectExperience,
}) => {
  const [quickInput, setQuickInput] = useState('');
  const { t } = useLanguage();

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSelectProblemPreset(quickInput.trim(), 'Other');
    onNavigate('ask');
  };

  const steps = [
    { title: t('home.how_it_works.discover'), icon: Search, desc: t('home.how_it_works.discover_desc') },
    { title: t('home.how_it_works.understand'), icon: Eye, desc: t('home.how_it_works.understand_desc') },
    { title: t('home.how_it_works.learn'), icon: GraduationCap, desc: t('home.how_it_works.learn_desc') },
    { title: t('home.how_it_works.apply'), icon: Lightbulb, desc: t('home.how_it_works.apply_desc') },
  ];

  return (
    <div className="space-y-24 py-16 pb-32">
      {/* Premium Editorial Hero */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="max-w-3xl mx-auto text-center space-y-8 px-4"
      >
        <div className="space-y-4">
          <h1 className="text-[clamp(2.5rem,8vw,5rem)] font-serif text-brand-text-primary dark:text-dark-text-primary tracking-tight leading-[1.1] text-balance">
            {t('home.hero.headline')}
          </h1>
          <p className="text-[clamp(0.875rem,2vw,1rem)] font-serif italic text-brand-text-secondary dark:text-dark-text-secondary">
            {BRAND_TAGLINE}
          </p>
          <p className="text-[clamp(1.125rem,3vw,1.5rem)] font-serif italic text-brand-text-secondary dark:text-dark-text-secondary leading-relaxed pt-4">
            {t('home.hero.subheadline')}
          </p>
        </div>
        
        <p className="text-[clamp(1rem,2vw,1.125rem)] text-brand-text-secondary dark:text-dark-text-secondary max-w-xl mx-auto leading-relaxed">
          {t('home.hero.description')}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <button 
            onClick={() => onNavigate('experiences')}
            className="px-6 py-3 bg-brand-accent dark:bg-dark-accent text-white dark:text-dark-bg font-bold rounded-lg hover:opacity-90 transition-opacity shadow-sm"
          >
            {t('home.hero.cta_primary')}
          </button>
          <button 
            onClick={() => onNavigate('share-experience')}
            className="px-6 py-3 bg-transparent border border-brand-border dark:border-dark-border text-brand-text-primary dark:text-dark-text-primary font-bold rounded-lg hover:bg-brand-border/10 dark:hover:bg-dark-border/10 transition-colors"
          >
            {t('home.hero.cta_secondary')}
          </button>
        </div>

        {/* Quick Search */}
        <form onSubmit={handleQuickSubmit} className="relative max-w-xl mx-auto pt-8">
          <div className="relative group">
            <input
              type="text"
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              placeholder={t('common.search')}
              className="w-full pl-10 pr-24 py-4 rounded-xl border border-brand-border dark:border-dark-border bg-brand-card dark:bg-dark-card text-brand-text-primary dark:text-dark-text-primary shadow-sm focus:border-brand-accent dark:focus:border-dark-accent outline-none transition-all"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-secondary dark:text-dark-text-secondary" />
            <button 
              type="submit" 
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-brand-text-primary dark:bg-dark-text-primary text-white dark:text-dark-bg rounded-lg font-bold text-xs hover:opacity-90 transition-opacity"
            >
              {t('common.search_btn', 'Search')}
            </button>
          </div>
        </form>
      </motion.section>

      {/* 4-Step Visual Explanation */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className="space-y-4 text-center group">
                <div className="w-12 h-12 rounded-xl bg-brand-accent/5 dark:bg-dark-accent/5 flex items-center justify-center border border-brand-border/50 dark:border-dark-border/50 mx-auto">
                  <Icon className="w-5 h-5 text-brand-accent dark:text-dark-accent" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-serif font-bold text-brand-text-primary dark:text-dark-text-primary">{step.title}</h3>
                  <p className="text-xs text-brand-text-secondary dark:text-dark-text-secondary leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Experiences */}
      <section className="max-w-6xl mx-auto px-4 space-y-8">
        <div className="flex items-end justify-between border-b border-brand-border dark:border-dark-border pb-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-serif font-bold text-brand-text-primary dark:text-dark-text-primary">{t('home.featured.title')}</h2>
            <p className="text-sm text-brand-text-secondary dark:text-dark-text-secondary">{t('home.featured.subtitle')}</p>
          </div>
          <button 
            onClick={() => onNavigate('experiences')} 
            className="group flex items-center gap-1 text-xs font-bold text-brand-accent dark:text-dark-accent hover:underline decoration-2 underline-offset-4"
          >
            {t('home.featured.view_all')}
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
        
        {featuredExperiences.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredExperiences.slice(0, 3).map((exp) => (
              <ExperienceCard
                key={exp.id}
                experience={exp}
                showRelevance={false}
                onClick={() => onSelectExperience && onSelectExperience(exp)}
              />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center border border-dashed border-brand-border dark:border-dark-border rounded-2xl">
            <p className="text-sm text-brand-text-secondary dark:text-dark-text-secondary italic">{t('home.featured.empty')}</p>
          </div>
        )}
      </section>

      {/* Editorial Footer Note */}
      <section className="max-w-3xl mx-auto px-4 text-center py-16 bg-brand-accent/5 dark:bg-dark-accent/5 rounded-3xl border border-brand-accent/10 dark:border-dark-accent/10">
        <div className="space-y-6">
          <Compass className="w-8 h-8 text-brand-accent dark:text-dark-accent mx-auto" />
          <h2 className="text-2xl font-serif font-bold text-brand-text-primary dark:text-dark-text-primary">{t('home.mission.title')}</h2>
          <p className="text-sm text-brand-text-secondary dark:text-dark-text-secondary leading-relaxed max-w-lg mx-auto">
            {t('home.mission.desc')}
          </p>
          <button 
            onClick={() => onNavigate('onboarding')}
            className="text-xs font-bold text-brand-text-primary dark:text-dark-text-primary underline decoration-brand-accent dark:decoration-dark-accent decoration-2 underline-offset-4"
          >
            {t('home.mission.cta')}
          </button>
        </div>
      </section>
    </div>
  );
};
