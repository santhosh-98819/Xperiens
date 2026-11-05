import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { ViewMode } from '../App';
import { UserProfile } from '../types';
import { Logo } from './Logo';

interface NavbarProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  user?: UserProfile;
  activeSolutionsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
}) => {
  const { currentUser, isGuest, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: ViewMode; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'ask', label: 'Ask Xperiens' },
    { id: 'experiences', label: 'Stories' },
    { id: 'solutions', label: 'Plans' },
    { id: 'dashboard', label: 'Dashboard' },
  ];

  const handleNav = (id: ViewMode) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    onNavigate('home');
  };

  return (
    <header className="sticky top-0 z-40 bg-brand-warm-ivory/80 dark:bg-brand-charcoal/80 backdrop-blur-md border-b border-brand-charcoal/10 dark:border-brand-warm-ivory/10 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-8">
          
          {/* Zone 1: Brand title */}
          <button
            onClick={() => handleNav('home')}
            className="flex items-center shrink-0 cursor-pointer"
          >
            <Logo className="h-10 w-auto" />
          </button>

          {/* Zone 2: 5 nav links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-brand-charcoal/70 dark:text-brand-warm-ivory/70">
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`hover:text-brand-soft-violet dark:hover:text-brand-soft-violet transition-colors whitespace-nowrap shrink-0 ${
                    isActive ? 'text-brand-deep-indigo dark:text-brand-soft-violet font-semibold' : ''
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center shrink-0">
            {currentUser && !isGuest ? (
              <button
                onClick={() => handleNav('profile')}
                className="px-4 py-2 bg-brand-deep-indigo dark:bg-brand-soft-violet text-white text-sm font-semibold rounded-full hover:opacity-90 transition-opacity"
              >
                Profile
              </button>
            ) : (
              <button
                onClick={() => handleNav('login')}
                className="px-4 py-2 bg-brand-deep-indigo dark:bg-brand-soft-violet text-white text-sm font-semibold rounded-full hover:opacity-90 transition-opacity"
              >
                Sign In
              </button>
            )}
             <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden ml-4 p-2 text-brand-charcoal dark:text-brand-warm-ivory"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-brand-charcoal/10 dark:border-brand-warm-ivory/10 bg-brand-warm-ivory dark:bg-brand-charcoal px-4 py-4 space-y-4"
          >
             {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className="block w-full text-left py-2 text-brand-charcoal dark:text-brand-warm-ivory"
                >
                  {item.label}
                </button>
             ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
