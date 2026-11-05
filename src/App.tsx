import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { UserProfile, Experience, SolutionAnalysis, Category } from './types';
import {
  getLocalUser,
  fetchExperiences,
  getLocalActiveSolutions,
  getLocalSavedSolutions,
} from './services/api';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { HomeView } from './views/HomeView';
import { AskView } from './views/AskView';
import { SolutionView } from './views/SolutionView';
import { ExperiencesView } from './views/ExperiencesView';
import { ShareExperienceView } from './views/ShareExperienceView';
import { MySolutionsView } from './views/MySolutionsView';
import { DashboardView } from './views/DashboardView';
import { ProfileView } from './views/ProfileView';
import { ExperienceDetailView } from './views/ExperienceDetailView';
import { OnboardingView } from './views/OnboardingView';
import { LoginView } from './views/LoginView';
import { SignUpView } from './views/SignUpView';
import { LegalAcceptanceView } from './views/LegalAcceptanceView';
import { PrivacyPolicyView } from './views/PrivacyPolicyView';
import { TermsAndConditionsView } from './views/TermsAndConditionsView';
import { CommunityGuidelinesView } from './views/CommunityGuidelinesView';
import { useLegalAcceptance } from './hooks/useLegalAcceptance';

export type ViewMode =
  | 'home'
  | 'ask'
  | 'solution'
  | 'experiences'
  | 'share-experience'
  | 'solutions'
  | 'dashboard'
  | 'profile'
  | 'onboarding'
  | 'login'
  | 'signup'
  | 'experience-detail'
  | 'legal-acceptance'
  | 'privacy-policy'
  | 'terms-and-conditions'
  | 'community-guidelines';

import { SplashScreen } from './components/SplashScreen';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      const stored = localStorage.getItem('xperiens_startup_sound');
      return stored === null ? true : stored === 'true';
    } catch {
      return true;
    }
  });
  const [currentView, setCurrentView] = useState<ViewMode>('onboarding');
  const [previousView, setPreviousView] = useState<ViewMode>('home'); // To track where to return to
  const { needsAcceptance, acceptanceLoading } = useLegalAcceptance();
  const [user, setUser] = useState<UserProfile>(getLocalUser());
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [featuredExperiences, setFeaturedExperiences] = useState<Experience[]>([]);
  const [currentSolution, setCurrentSolution] = useState<SolutionAnalysis | null>(null);
  const [currentExperience, setCurrentExperience] = useState<Experience | null>(null);

  // Ask view state presets
  const [askInitialProblem, setAskInitialProblem] = useState<string>('');
  const [askInitialCategory, setAskInitialCategory] = useState<Category>('Career');

  // Solution counters
  const [activeSolutionsCount, setActiveSolutionsCount] = useState<number>(0);

  const refreshCounts = () => {
    const active = getLocalActiveSolutions();
    const saved = getLocalSavedSolutions();
    const uniqueIds = new Set([...active.map((s) => s.id), ...saved.map((s) => s.id)]);
    setActiveSolutionsCount(uniqueIds.size);
  };

  const handleToggleSound = (enabled: boolean) => {
    setSoundEnabled(enabled);
    localStorage.setItem('xperiens_startup_sound', String(enabled));
  };

  useEffect(() => {
    fetchExperiences({ limit: 6 }).then((data) => {
      setFeaturedExperiences(data.experiences);
    });
    refreshCounts();
  }, []);

  useEffect(() => {
    if (needsAcceptance && currentView !== 'signup' && currentView !== 'login' && currentView !== 'legal-acceptance' && currentView !== 'privacy-policy' && currentView !== 'terms-and-conditions' && currentView !== 'community-guidelines') {
      setCurrentView('legal-acceptance');
    }
  }, [needsAcceptance, currentView]);

  const handleNavigate = (view: ViewMode) => {
    setPreviousView(currentView);
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    refreshCounts();
  };

  const handleBack = () => {
    setCurrentView(previousView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProblemPreset = (problemText: string, category?: Category) => {
    setAskInitialProblem(problemText);
    if (category) setAskInitialCategory(category);
  };

  const handleAnalysisComplete = (solution: SolutionAnalysis) => {
    setCurrentSolution(solution);
    setCurrentView('solution');
    refreshCounts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectSolution = (solution: SolutionAnalysis) => {
    setCurrentSolution(solution);
    setCurrentView('solution');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectExperience = (exp: Experience) => {
    setCurrentExperience(exp);
    setCurrentView('experience-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-warm-ivory dark:bg-brand-charcoal text-brand-charcoal dark:text-brand-warm-ivory font-sans transition-colors duration-200">
      {/* Splash Screen - Only shown on initial load */}
      <AnimatePresence>
        {showSplash && (
          <SplashScreen 
            onComplete={() => setShowSplash(false)} 
            soundEnabled={soundEnabled}
          />
        )}
      </AnimatePresence>
      {/* Top Navigation - Only show if not on onboarding */}
      {currentView !== 'onboarding' && (
        <Navbar
          currentView={currentView}
          onNavigate={handleNavigate}
          user={user}
          onOpenAuth={() => setAuthModalOpen(true)}
          activeSolutionsCount={activeSolutionsCount}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {currentView === 'home' && (
          <HomeView
            onNavigate={handleNavigate}
            onSelectProblemPreset={handleSelectProblemPreset}
            featuredExperiences={featuredExperiences}
            onSelectExperience={handleSelectExperience}
          />
        )}

        {currentView === 'onboarding' && (
          <OnboardingView
            onComplete={() => handleNavigate('home')}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'login' && (
          <LoginView
            onNavigate={handleNavigate}
            onSuccessRedirect={() => handleNavigate('dashboard')}
          />
        )}

        {currentView === 'signup' && (
          <SignUpView
            onNavigate={handleNavigate}
            onSuccessRedirect={() => handleNavigate('dashboard')}
          />
        )}

        {currentView === 'legal-acceptance' && (
          <LegalAcceptanceView onComplete={() => handleNavigate('home')} onNavigate={handleNavigate} />
        )}

        {currentView === 'privacy-policy' && <PrivacyPolicyView onBack={handleBack} />}
        {currentView === 'terms-and-conditions' && <TermsAndConditionsView onBack={handleBack} />}
        {currentView === 'community-guidelines' && <CommunityGuidelinesView onBack={handleBack} />}

        {currentView === 'ask' && (
          <AskView
            initialProblem={askInitialProblem}
            initialCategory={askInitialCategory}
            onAnalysisComplete={handleAnalysisComplete}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'solution' && currentSolution && (
          <SolutionView
            solution={currentSolution}
            onBack={() => handleNavigate('ask')}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'experiences' && (
          <ExperiencesView
            initialCategory={askInitialCategory}
            onNavigate={handleNavigate}
            onSelectExperience={handleSelectExperience}
          />
        )}

        {currentView === 'share-experience' && (
          <ShareExperienceView
            onNavigate={handleNavigate}
            onExperienceAdded={(newExp) => {
              setFeaturedExperiences((prev) => [newExp, ...prev]);
            }}
          />
        )}

        {currentView === 'solutions' && (
          <MySolutionsView
            onSelectSolution={handleSelectSolution}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'dashboard' && (
          <DashboardView
            user={user}
            onNavigate={handleNavigate}
            onSelectSolution={handleSelectSolution}
          />
        )}

        {currentView === 'profile' && (
          <ProfileView
            onNavigate={handleNavigate}
            onSelectSolution={handleSelectSolution}
            soundEnabled={soundEnabled}
            onToggleSound={handleToggleSound}
          />
        )}

        {currentView === 'experience-detail' && currentExperience && (
          <ExperienceDetailView
            experience={currentExperience}
            onBack={() => handleNavigate('experiences')}
          />
        )}
      </main>

      {/* Global Footer - Only show if not on onboarding */}
      {currentView !== 'onboarding' && <Footer onNavigate={handleNavigate} />}

      {/* User Profile / Auth Modal */}
      <AuthModal
        user={user}
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onUpdateUser={(updated) => setUser(updated)}
      />
    </div>
  );
}
