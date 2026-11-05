import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { ThemePreference } from '../types';
import { useAuth } from './AuthContext';

type ResolvedTheme = 'light' | 'dark';

interface ThemeContextType {
  themePreference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setThemePreference: (pref: ThemePreference) => void;
  toggleTheme: () => void;
}

const THEME_STORAGE_KEY = 'xperiens_theme_preference';
const LEGACY_STORAGE_KEY = 'commonmind_theme_preference';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Helper to get system preference
const getSystemTheme = (): ResolvedTheme => {
  if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};

// Helper to get initial preference from localStorage or fallback to system
const getInitialPreference = (): ThemePreference => {
  if (typeof window !== 'undefined') {
    try {
      const stored = (localStorage.getItem(THEME_STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY)) as ThemePreference | null;
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        return stored;
      }
    } catch {
      // fallback
    }
  }
  return 'system';
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile, updateUserPreferences, isGuest, currentUser } = useAuth();

  const [themePreference, setThemePreferenceState] = useState<ThemePreference>(() => {
    return getInitialPreference();
  });

  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() => getSystemTheme());

  // Listen to OS system color scheme changes in real-time
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else if (mediaQuery.addListener) {
      // Compatibility fallback
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  // Sync with Firestore profile preference if available
  useEffect(() => {
    if (userProfile?.themePreference) {
      const dbPref = userProfile.themePreference;
      if (dbPref === 'light' || dbPref === 'dark' || dbPref === 'system') {
        setThemePreferenceState(dbPref);
        try {
          localStorage.setItem(THEME_STORAGE_KEY, dbPref);
        } catch {
          // ignore
        }
      }
    }
  }, [userProfile?.themePreference]);

  // Compute resolved active theme ('light' or 'dark')
  const resolvedTheme: ResolvedTheme =
    themePreference === 'system' ? systemTheme : themePreference;

  // Apply 'dark' class to html element and data-theme
  useEffect(() => {
    const root = document.documentElement;
    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }
  }, [resolvedTheme]);

  // Handle user selecting a theme preference
  const setThemePreference = useCallback(
    async (pref: ThemePreference) => {
      setThemePreferenceState(pref);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, pref);
      } catch {
        // storage error safe
      }

      // If user is authenticated (and not a pure guest without profile update), persist to Firestore
      if (currentUser && !isGuest) {
        try {
          await updateUserPreferences({ themePreference: pref });
        } catch (err) {
          console.error('Failed to save theme preference in profile:', err);
        }
      }
    },
    [currentUser, isGuest, updateUserPreferences]
  );

  // Quick toggle (cycles between light and dark; if in system, toggles to opposite of current resolved)
  const toggleTheme = useCallback(() => {
    if (resolvedTheme === 'dark') {
      setThemePreference('light');
    } else {
      setThemePreference('dark');
    }
  }, [resolvedTheme, setThemePreference]);

  return (
    <ThemeContext.Provider
      value={{
        themePreference,
        resolvedTheme,
        setThemePreference,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
