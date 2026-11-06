import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageChoice } from '../types';
import { Globe, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const languages: { code: LanguageChoice; label: string; sublabel: string }[] = [
  { code: 'en', label: 'English', sublabel: 'Simple English' },
  { code: 'ta', label: 'தமிழ்', sublabel: 'Native Tamil' },
  { code: 'ta_trans', label: 'Tanglish', sublabel: 'Tamil Transliterated' },
  { code: 'hi', label: 'हिन्दी', sublabel: 'Native Hindi' },
  { code: 'hi_trans', label: 'Hinglish', sublabel: 'Hindi Transliterated' },
];

export const LanguageSwitcher: React.FC<{ variant?: 'dropdown' | 'list' | 'bottom-sheet' }> = ({ variant = 'dropdown' }) => {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState<LanguageChoice>(language);

  const currentLang = languages.find(l => l.code === language) || languages[0];

  const handleApply = async () => {
    await setLanguage(selectedLang);
    setIsOpen(false);
  };

  if (variant === 'list') {
    return (
      <div className="grid grid-cols-1 gap-3">
        {languages.map((lang) => (
          <button
            key={lang.code}
            type="button"
            onClick={() => setLanguage(lang.code)}
            className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
              language === lang.code
                ? 'bg-brand-accent/10 border-brand-accent text-brand-accent dark:bg-dark-accent/10 dark:border-dark-accent dark:text-dark-accent'
                : 'bg-brand-card dark:bg-dark-card border-brand-border dark:border-dark-border hover:border-brand-accent/50'
            }`}
          >
            <div className="text-left">
              <div className="font-medium text-brand-text-primary dark:text-dark-text-primary">{lang.label}</div>
              <div className="text-xs text-brand-text-secondary dark:text-dark-text-secondary">{lang.sublabel}</div>
            </div>
            {language === lang.code && <Check className="w-5 h-5 text-brand-accent dark:text-dark-accent" />}
          </button>
        ))}
      </div>
    );
  }

  if (variant === 'bottom-sheet') {
    return (
      <>
        <button
          type="button"
          onClick={() => {
            setSelectedLang(language);
            setIsOpen(true);
          }}
          className="w-full flex items-center justify-between p-4 rounded-xl border border-brand-border dark:border-dark-border bg-brand-card dark:bg-dark-card hover:border-brand-accent transition-all text-sm font-medium"
        >
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-brand-accent dark:text-dark-accent" />
            <div className="text-left">
              <div className="font-serif font-bold text-brand-text-primary dark:text-dark-text-primary">{t('profile.language', 'Language & Style')}</div>
              <div className="text-xs text-brand-text-secondary dark:text-dark-text-secondary">{currentLang.label} ({currentLang.sublabel})</div>
            </div>
          </div>
          <span className="text-xs font-bold text-brand-accent dark:text-dark-accent">Change</span>
        </button>

        <AnimatePresence>
          {isOpen && (
            <div className="fixed inset-0 z-50 flex flex-col justify-end">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-xs" 
                onClick={() => setIsOpen(false)}
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="relative z-10 w-full max-w-lg mx-auto bg-brand-card dark:bg-dark-card border-t border-brand-border dark:border-dark-border rounded-t-3xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[85vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between border-b border-brand-border dark:border-dark-border pb-4">
                  <div className="space-y-1">
                    <h3 className="text-xl font-serif font-bold text-brand-text-primary dark:text-dark-text-primary">Select Language & Style</h3>
                    <p className="text-xs text-brand-text-secondary dark:text-dark-text-secondary">Applies instantly across the entire platform.</p>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-full hover:bg-brand-border/20 text-brand-text-secondary"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => setSelectedLang(lang.code)}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                        selectedLang === lang.code
                          ? 'bg-brand-accent/10 border-brand-accent text-brand-accent dark:bg-dark-accent/10 dark:border-dark-accent dark:text-dark-accent shadow-sm'
                          : 'bg-brand-bg dark:bg-dark-sec-bg border-brand-border dark:border-dark-border text-brand-text-primary dark:text-dark-text-primary'
                      }`}
                    >
                      <div className="text-left">
                        <div className="font-serif font-bold">{lang.label}</div>
                        <div className="text-xs opacity-70">{lang.sublabel}</div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedLang === lang.code ? 'border-brand-accent bg-brand-accent text-white dark:border-dark-accent dark:bg-dark-accent dark:text-dark-bg' : 'border-brand-border'}`}>
                        {selectedLang === lang.code && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="pt-4 flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 py-3.5 border border-brand-border dark:border-dark-border rounded-xl font-bold text-xs uppercase tracking-widest text-brand-text-primary dark:text-dark-text-primary"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleApply}
                    className="flex-1 py-3.5 bg-brand-accent dark:bg-dark-accent text-white dark:text-dark-bg rounded-xl font-bold text-xs uppercase tracking-widest shadow-md hover:opacity-90"
                  >
                    Apply Language
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setSelectedLang(language);
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card/50 border border-border hover:border-accent/50 transition-all text-sm font-medium"
      >
        <Globe className="w-4 h-4 text-accent" />
        <span>{currentLang.label}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-full mt-2 right-0 w-64 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-3 space-y-2">
                <div className="px-2 py-1 text-xs font-semibold text-secondary uppercase tracking-wider">
                  {t('profile.language', 'Select Language')}
                </div>
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      setLanguage(lang.code);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
                      language === lang.code
                        ? 'bg-accent text-white'
                        : 'hover:bg-accent/10 text-primary'
                    }`}
                  >
                    <div className="text-left">
                      <div className="text-sm font-medium">{lang.label}</div>
                      <div className={`text-[10px] ${language === lang.code ? 'text-white/70' : 'text-secondary'}`}>
                        {lang.sublabel}
                      </div>
                    </div>
                    {language === lang.code && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
