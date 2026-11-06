import React from 'react';
import { Compass, PlusCircle, LayoutDashboard, User, Moon, Sun, Search, MessageSquare, Layers } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ViewMode } from '../App';
import { motion } from 'motion/react';

interface NavbarProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
}) => {
  const { currentUser, isGuest } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const { t } = useLanguage();

  const desktopNavItems: { id: ViewMode; label: string; icon: React.ElementType }[] = [
    { id: 'home', label: t('common.home', 'Home'), icon: Compass },
    { id: 'experiences', label: t('common.discover', 'Discover'), icon: Search },
    { id: 'share-experience', label: t('common.share', 'Share'), icon: PlusCircle },
    { id: 'ask', label: t('common.ask', 'Ask'), icon: MessageSquare },
    { id: 'dashboard', label: t('common.account', 'Account'), icon: LayoutDashboard },
  ];

  const mobileNavItems: { id: ViewMode; label: string; icon: React.ElementType }[] = [
    { id: 'home', label: t('common.home', 'Home'), icon: Compass },
    { id: 'experiences', label: t('common.discover', 'Discover'), icon: Search },
    { id: 'share-experience', label: t('common.share', 'Share'), icon: PlusCircle },
    { id: 'solutions', label: t('common.solutions', 'My Exp'), icon: Layers },
    { id: 'profile', label: t('common.profile', 'Profile'), icon: User },
  ];

  const handleNav = (id: ViewMode) => {
    onNavigate(id);
  };

  return (
    <>
      {/* Desktop Top Bar */}
      <header className="sticky top-0 z-40 bg-brand-bg/80 dark:bg-dark-bg/80 backdrop-blur-md border-b border-brand-border dark:border-dark-border transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16 gap-8">
            
            {/* Zone 1: Brand title */}
            <button
              onClick={() => handleNav('home')}
              className="text-xl font-serif font-bold tracking-tight text-brand-text-primary dark:text-dark-text-primary whitespace-nowrap shrink-0 cursor-pointer"
            >
              Xperiens
            </button>

            {/* Zone 2: Nav links */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-brand-text-secondary dark:text-dark-text-secondary">
              {desktopNavItems.slice(1, 4).map((item) => {
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    className={`relative hover:text-brand-text-primary dark:hover:text-dark-text-primary transition-colors whitespace-nowrap shrink-0 ${
                      isActive ? 'text-brand-text-primary dark:text-dark-text-primary font-semibold' : ''
                    }`}
                  >
                    {item.label}
                    {isActive && (
                      <motion.span 
                        layoutId="nav-underline"
                        className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-brand-accent dark:bg-dark-accent" 
                      />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Zone 3: Actions + Theme + Language */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="hidden md:block">
                <LanguageSwitcher />
              </div>

              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 text-brand-text-secondary dark:text-dark-text-secondary hover:text-brand-text-primary dark:hover:text-dark-text-primary transition-colors cursor-pointer"
                aria-label="Toggle theme"
              >
                {resolvedTheme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              <div className="h-6 w-px bg-brand-border dark:bg-dark-border hidden md:block" />

              {currentUser && !isGuest ? (
                <button
                  type="button"
                  onClick={() => handleNav('profile')}
                  className="px-4 py-2 bg-brand-accent dark:bg-dark-accent text-white dark:text-dark-bg text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap shrink-0"
                >
                  {t('common.profile', 'Profile')}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleNav('login')}
                  className="px-4 py-2 bg-brand-accent dark:bg-dark-accent text-white dark:text-dark-bg text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap shrink-0"
                >
                  {t('common.login', 'Log In')}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation (5 specific items) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-brand-bg/95 dark:bg-dark-bg/95 backdrop-blur-md border-t border-brand-border dark:border-dark-border pb-safe transition-colors duration-300">
        <div className="flex items-center justify-around h-16 px-1">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNav(item.id)}
                className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
                  isActive 
                    ? 'text-brand-accent dark:text-dark-accent font-semibold' 
                    : 'text-brand-text-secondary dark:text-dark-text-secondary'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'fill-current opacity-20' : ''}`} />
                <span className="text-[10px] tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
