import React, { createContext, useContext, useEffect, useState } from 'react';
import { LanguageChoice } from '../types';
import { dictionaries } from '../i18n/dictionaries';
import { useAuth } from './AuthContext';

interface LanguageContextType {
  language: LanguageChoice;
  setLanguage: (lang: LanguageChoice) => Promise<void>;
  t: (path: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile, updateUserProfile } = useAuth();
  const [language, setLanguageState] = useState<LanguageChoice>(() => {
    // 1. Check local storage for guest/returning user
    const saved = localStorage.getItem('xperiens_language_preference');
    if (saved) return saved as LanguageChoice;
    
    // 2. Browser detection
    const browserLang = navigator.language.split('-')[0];
    if (browserLang === 'ta') return 'ta';
    if (browserLang === 'hi') return 'hi';
    
    return 'en';
  });

  // Sync state if userProfile changes (e.g. login)
  useEffect(() => {
    if (userProfile?.languagePreference && userProfile.languagePreference !== language) {
      setLanguageState(userProfile.languagePreference);
      localStorage.setItem('xperiens_language_preference', userProfile.languagePreference);
    }
  }, [userProfile?.languagePreference]);

  const setLanguage = async (lang: LanguageChoice) => {
    setLanguageState(lang);
    localStorage.setItem('xperiens_language_preference', lang);
    
    if (userProfile && !userProfile.isGuest) {
      await updateUserProfile({ languagePreference: lang });
    }
  };

  const t = (path: string, fallback?: string): string => {
    const keys = path.split('.');
    let result = dictionaries[language] || dictionaries.en;
    
    for (const key of keys) {
      if (result[key] === undefined) {
        // Fallback to English if current language missing key
        let engResult = dictionaries.en;
        for (const engKey of keys) {
          if (engResult[engKey] === undefined) {
            return fallback || path;
          }
          engResult = engResult[engKey];
        }
        return engResult;
      }
      result = result[key];
    }
    
    return result;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
