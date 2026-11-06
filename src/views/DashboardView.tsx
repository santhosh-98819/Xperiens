import React, { useState, useEffect } from 'react';
import { UserProfile, PlatformStats, SolutionAnalysis } from '../types';
import { fetchPlatformStats, getLocalSavedSolutions, getLocalActiveSolutions, getLocalUser } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Sparkles,
  Heart,
  CheckCircle2,
  ArrowRight,
  Brain,
  Compass,
  Camera,
} from 'lucide-react';
import { ViewMode } from '../App';

interface DashboardViewProps {
  user?: UserProfile;
  onNavigate: (view: ViewMode) => void;
  onSelectSolution: (solution: SolutionAnalysis) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user: propUser,
  onNavigate,
  onSelectSolution,
}) => {
  const { userProfile, currentUser } = useAuth();
  const activeUser = userProfile || propUser || getLocalUser();
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [activeSolutions, setActiveSolutions] = useState<SolutionAnalysis[]>([]);
  const [savedSolutions, setSavedSolutions] = useState<SolutionAnalysis[]>([]);

  const bannerURL = userProfile?.bannerURL || activeUser?.bannerURL;
  const displayName = userProfile?.displayName || userProfile?.name || activeUser?.name || currentUser?.displayName || 'Friend';
  const photoURL = userProfile?.photoURL || activeUser?.photoURL;
  const initialLetter = displayName.charAt(0).toUpperCase();

  useEffect(() => {
    fetchPlatformStats().then(setPlatformStats);
    setActiveSolutions(getLocalActiveSolutions());
    setSavedSolutions(getLocalSavedSolutions());
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const allSolutionsMap = new Map<string, SolutionAnalysis>();
  savedSolutions.forEach((s) => allSolutionsMap.set(s.id, s));
  activeSolutions.forEach((s) => {
    const existing = allSolutionsMap.get(s.id);
    if (existing) {
      allSolutionsMap.set(s.id, {
        ...existing,
        ...s,
        status: s.status || existing.status,
        outcomeReport: s.outcomeReport || existing.outcomeReport,
      });
    } else {
      allSolutionsMap.set(s.id, s);
    }
  });
  const allSolutions = Array.from(allSolutionsMap.values());
  const completedSolutions = allSolutions.filter((s) => s.status === 'completed' || !!s.outcomeReport);

  return (
    <div className="max-w-6xl mx-auto py-8 sm:py-12 px-6 space-y-12 animate-fadeIn pb-24">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-2xl border border-brand-border dark:border-dark-border bg-brand-card dark:bg-dark-card min-h-[280px] flex flex-col justify-end">
        {bannerURL ? (
          <div className="absolute inset-0 z-0">
            <img
              src={bannerURL}
              alt="Profile Banner"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/90 via-dark-bg/40 to-transparent" />
          </div>
        ) : (
          <div className="absolute inset-0 z-0 bg-slate-900">
             <div className="absolute inset-0 bg-linear-to-br from-indigo-900/40 to-slate-900" />
          </div>
        )}

        <div className="relative z-10 p-8 sm:p-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="shrink-0">
              {photoURL ? (
                <img
                  src={photoURL}
                  alt={displayName}
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover border-2 border-white dark:border-dark-border shadow-lg"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-dark-accent text-white flex items-center justify-center font-serif text-3xl border-2 border-white dark:border-dark-border shadow-lg">
                  {initialLetter}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-white/70 text-xs font-medium tracking-wide uppercase">
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
                {activeUser.role && (
                   <>
                    <span aria-hidden="true">·</span>
                    <span>{activeUser.role}</span>
                   </>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white leading-tight">
                {getGreeting()}, {displayName}
              </h1>
              <p className="text-sm sm:text-base text-white/80 max-w-lg leading-relaxed font-light">
                {activeUser.bio || "What's on your mind today? Check your active tracks or explore collective wisdom."}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('ask')}
              className="px-6 py-3 bg-brand-accent dark:bg-dark-accent text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-all flex items-center gap-2 shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ask Xperiens</span>
            </button>
            <button
              onClick={() => onNavigate('profile')}
              className="p-3 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all"
              aria-label="Edit Banner"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Impact Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: 'Active Tracks',
            value: activeSolutions.length,
            sub: `${activeSolutions.filter((s) => s.status === 'testing').length} in progress`,
            icon: Brain,
            color: 'text-indigo-600 dark:text-indigo-400',
            bg: 'bg-indigo-50 dark:bg-indigo-950/30'
          },
          {
            label: 'Outcomes Logged',
            value: completedSolutions.length,
            sub: 'Trials recorded',
            icon: CheckCircle2,
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-50 dark:bg-emerald-950/30'
          },
          {
            label: 'Experiences Shared',
            value: activeUser.experiencesShared || 0,
            sub: 'Community contributions',
            icon: Compass,
            color: 'text-sky-600 dark:text-sky-400',
            bg: 'bg-sky-50 dark:bg-sky-950/30'
          },
          {
            label: 'Community Impact',
            value: activeUser.peopleHelped || 0,
            sub: 'Peers helped',
            icon: Heart,
            color: 'text-rose-600 dark:text-rose-400',
            bg: 'bg-rose-50 dark:bg-rose-950/30'
          }
        ].map((stat, i) => (
          <div key={i} className="p-6 rounded-xl border border-brand-border dark:border-dark-border bg-brand-card dark:bg-dark-card space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-brand-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">{stat.label}</span>
              <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-serif font-bold text-brand-text-primary dark:text-dark-text-primary">{stat.value}</div>
              <div className="text-xs text-brand-text-secondary dark:text-dark-text-secondary">{stat.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left: Active Strategy Plans */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-brand-border dark:border-dark-border pb-4">
            <h2 className="text-xl font-serif font-bold text-brand-text-primary dark:text-dark-text-primary">
              Active Strategy Plans
            </h2>
            <button
              onClick={() => onNavigate('solutions')}
              className="text-sm font-semibold text-brand-accent dark:text-dark-accent hover:underline flex items-center gap-1 transition-all"
            >
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {activeSolutions.length === 0 ? (
            <div className="p-12 border border-dashed border-brand-border dark:border-dark-border rounded-xl text-center space-y-4">
              <p className="text-sm text-brand-text-secondary dark:text-dark-text-secondary">
                No active strategy plans found. Start by asking a question.
              </p>
              <button
                onClick={() => onNavigate('ask')}
                className="px-6 py-2 bg-brand-text-primary dark:bg-dark-text-primary text-brand-bg dark:text-dark-bg rounded-lg text-sm font-bold hover:opacity-90"
              >
                Ask Xperiens
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {activeSolutions.slice(0, 3).map((sol) => (
                <div
                  key={sol.id}
                  onClick={() => onSelectSolution(sol)}
                  className="group p-6 rounded-xl border border-brand-border dark:border-dark-border bg-brand-card dark:bg-dark-card hover:border-brand-accent dark:hover:border-dark-accent transition-all cursor-pointer flex items-center justify-between gap-6"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs text-brand-text-secondary dark:text-dark-text-secondary">
                      <span className="font-semibold text-brand-text-primary dark:text-dark-text-primary">{sol.originalProblem.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{new Date(sol.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                    </div>
                    <h3 className="text-lg font-serif font-bold text-brand-text-primary dark:text-dark-text-primary group-hover:text-brand-accent dark:group-hover:text-dark-accent transition-colors line-clamp-1">
                      {sol.originalProblem.problem}
                    </h3>
                    <div className="flex items-center gap-4 text-xs font-medium text-brand-accent dark:text-dark-accent">
                      <span>{sol.recommendationSteps.length} Steps</span>
                      <span aria-hidden="true">·</span>
                      <span>{sol.evidence.confidencePercentage}% Confidence</span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-brand-border dark:text-dark-border group-hover:text-brand-accent dark:group-hover:text-dark-accent transition-all" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Platform Health & Collective Insights */}
        <div className="space-y-8">
          <div className="space-y-6">
             <h2 className="text-xl font-serif font-bold text-brand-text-primary dark:text-dark-text-primary border-b border-brand-border dark:border-dark-border pb-4">
              Collective Pool
            </h2>
            
            <div className="p-8 rounded-xl bg-brand-text-primary dark:bg-dark-text-primary text-brand-bg dark:text-dark-bg space-y-6">
              <div className="space-y-4">
                 {[
                  { label: 'Verified Cases', value: platformStats?.totalRealExperiences || 0 },
                  { label: 'Outcomes Reported', value: platformStats?.totalOutcomesReported || 0 },
                  { label: 'Contributors', value: platformStats?.communityContributors || 0 },
                  { label: 'Success Rate', value: platformStats && platformStats.totalOutcomesReported > 0 ? `${platformStats.successfulSolutionsRatio}%` : '—' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-xs font-medium opacity-70">{item.label}</span>
                    <span className="text-sm font-serif font-bold">{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <p className="text-xs leading-relaxed opacity-80 font-light">
                  Every outcome logged refines our collective intelligence, making solutions smarter for the next person.
                </p>
                <button
                  onClick={() => onNavigate('share-experience')}
                  className="w-full py-3 bg-white dark:bg-dark-bg text-brand-text-primary dark:text-dark-text-primary rounded-lg text-xs font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  <span>Share Your Story</span>
                  <Compass className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl border border-brand-border dark:border-dark-border bg-brand-card dark:bg-dark-card space-y-4">
            <h3 className="text-sm font-serif font-bold text-brand-text-primary dark:text-dark-text-primary">Profile Integrity</h3>
            <p className="text-xs text-brand-text-secondary dark:text-dark-text-secondary leading-relaxed">
              Maintain an active profile to build trust within the community. Verified contributors receive higher visibility.
            </p>
            <button
              onClick={() => onNavigate('profile')}
              className="text-xs font-bold text-brand-accent dark:text-dark-accent hover:underline"
            >
              Manage Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
