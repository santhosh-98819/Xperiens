import React from 'react';
import { ViewMode } from '../App';
import { Logo } from './Logo';
import { useLanguage } from '../contexts/LanguageContext';

export const Footer: React.FC<{ onNavigate: (view: ViewMode) => void }> = ({ onNavigate }) => {
  const { t } = useLanguage();
  
  return (
    <footer className="bg-brand-card dark:bg-dark-bg border-t border-brand-border dark:border-dark-border pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2 space-y-6">
            <button onClick={() => onNavigate('home')} className="block cursor-pointer">
              <Logo className="h-10 w-auto" />
            </button>
            <p className="text-brand-text-secondary dark:text-dark-text-secondary text-sm leading-relaxed max-w-sm font-light">
              {t('home.hero.description')}
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-text-primary dark:text-dark-text-primary">{t('common.navigation', 'Navigation')}</h4>
            <nav className="flex flex-col gap-3 text-sm font-medium text-brand-text-secondary dark:text-dark-text-secondary">
              <button onClick={() => onNavigate('home')} className="w-fit hover:text-brand-accent dark:hover:text-dark-accent transition-colors">{t('common.home', 'Home')}</button>
              <button onClick={() => onNavigate('experiences')} className="w-fit hover:text-brand-accent dark:hover:text-dark-accent transition-colors">{t('common.discover', 'Discover Stories')}</button>
              <button onClick={() => onNavigate('solutions')} className="w-fit hover:text-brand-accent dark:hover:text-dark-accent transition-colors">{t('common.insights', 'My Insights')}</button>
              <button onClick={() => onNavigate('share-experience')} className="w-fit hover:text-brand-accent dark:hover:text-dark-accent transition-colors">{t('common.share', 'Share Story')}</button>
            </nav>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-text-primary dark:text-dark-text-primary">{t('common.legal', 'Legal')}</h4>
            <nav className="flex flex-col gap-3 text-sm font-medium text-brand-text-secondary dark:text-dark-text-secondary">
              <button onClick={() => onNavigate('privacy-policy')} className="w-fit hover:text-brand-accent dark:hover:text-dark-accent transition-colors">{t('common.privacy', 'Privacy Policy')}</button>
              <button onClick={() => onNavigate('terms-and-conditions')} className="w-fit hover:text-brand-accent dark:hover:text-dark-accent transition-colors">{t('common.terms', 'Terms of Service')}</button>
              <button onClick={() => onNavigate('community-guidelines')} className="w-fit hover:text-brand-accent dark:hover:text-dark-accent transition-colors">{t('common.guidelines', 'Guidelines')}</button>
            </nav>
          </div>
        </div>

        <div className="pt-8 border-t border-brand-border dark:border-dark-border flex flex-col sm:flex-row justify-between gap-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-brand-text-secondary dark:text-dark-text-secondary">
            © {new Date().getFullYear()} Xperiens · {t('common.tagline')}
          </p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-brand-text-secondary dark:text-dark-text-secondary">
            {t('common.built_for', 'Built for the human journey')}
          </p>
        </div>
      </div>
    </footer>
  );
};
