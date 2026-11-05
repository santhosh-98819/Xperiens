import React, { useState, useEffect } from 'react';
import { UserProfile, PlatformStats, SolutionAnalysis } from '../types';
import { fetchPlatformStats, getLocalSavedSolutions, getLocalActiveSolutions, getLocalUser } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Tooltip } from '../components/Tooltip';
import {
  LayoutDashboard,
  Sparkles,
  User,
  Heart,
  CheckCircle2,
  Bookmark,
  Share2,
  ArrowRight,
  TrendingUp,
  Brain,
  Compass,
  CheckSquare,
  HelpCircle,
  Camera,
  Award,
} from 'lucide-react';
import { motion } from 'motion/react';
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
    <div className="max-w-6xl mx-auto py-6 sm:py-10 space-y-8 animate-fadeIn pb-16">
      {/* ========================================================
          GREETING BANNER WITH PROFILE BANNER THEME
         ======================================================== */}
      <div className="relative overflow-hidden rounded-3xl shadow-lg border border-slate-200/80 dark:border-slate-800 text-white min-h-[220px] flex flex-col justify-between">
        {/* Banner Background (Image or Dynamic Theme Gradient) */}
        {bannerURL ? (
          <div className="absolute inset-0 z-0">
            <img
              src={bannerURL}
              alt="Profile Banner Theme"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />
            {/* Cinematic Multilayer Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/75 to-indigo-950/85 backdrop-blur-[0.5px]" />
          </div>
        ) : (
          <div className="absolute inset-0 z-0 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900">
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />
          </div>
        )}

        {/* Content Container */}
        <div className="relative z-10 p-6 sm:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4 sm:gap-5">
            {/* Avatar with Ring */}
            <div className="relative flex-shrink-0">
              {photoURL ? (
                <img
                  src={photoURL}
                  alt={displayName}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white/80 shadow-md"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center font-black text-2xl border-2 border-white/80 shadow-md">
                  {initialLetter}
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-slate-900 shadow-2xs" />
            </div>

            {/* Title & Greeting Info */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 backdrop-blur-xs">
                  <LayoutDashboard className="w-3 h-3 text-indigo-300" />
                  <span>DECISION DASHBOARD</span>
                </div>
                {activeUser.role && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/15 text-white/90 font-medium backdrop-blur-xs">
                    {activeUser.role}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white drop-shadow-xs">
                {getGreeting()}, {displayName}
              </h1>

              <p className="text-xs sm:text-sm text-slate-200/90 max-w-xl leading-relaxed">
                {activeUser.bio || "What's on your mind today? Check your active problem test loops or explore real peer cases."}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 flex-shrink-0 pt-2 lg:pt-0">
            <Tooltip content="Diagnose a new situation with human cases + AI synthesis" position="bottom">
              <button
                id="dash-ask-btn"
                onClick={() => onNavigate('ask')}
                className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl font-bold text-xs sm:text-sm text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-md transition-all cursor-pointer hover:scale-102"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Ask Xperiens</span>
              </button>
            </Tooltip>

            <Tooltip content="Contribute a solution trial or life lesson to the repository" position="bottom">
              <button
                id="dash-share-exp-btn"
                onClick={() => onNavigate('share-experience')}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm text-white bg-white/15 hover:bg-white/25 border border-white/20 backdrop-blur-xs transition-all cursor-pointer"
              >
                <span>Share Learning</span>
              </button>
            </Tooltip>

            <Tooltip content="Customize your banner theme, avatar, and bio" position="bottom">
              <button
                id="dash-edit-banner-btn"
                onClick={() => onNavigate('profile')}
                className="p-2.5 sm:p-3 rounded-xl text-white/80 hover:text-white bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-xs transition-all cursor-pointer"
                title="Change Banner Theme"
                aria-label="Change profile banner theme"
              >
                <Camera className="w-4 h-4" />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* User Impact & Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Problems */}
        <Tooltip content="View all decisions currently being tested or tracked" position="top">
          <div
            onClick={() => onNavigate('solutions')}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-2xs transition-all cursor-pointer space-y-2 h-full"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span>Active Problems</span>
              <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Brain className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {activeSolutions.length}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {activeSolutions.filter((s) => s.status === 'testing').length} in active testing
            </p>
          </div>
        </Tooltip>

        {/* Card 2: Solutions Tested & Completed */}
        <Tooltip content="Plans where you have tested and reported outcomes" position="top">
          <div
            onClick={() => onNavigate('solutions')}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-2xs transition-all cursor-pointer space-y-2 h-full"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span>Completed Solutions</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-900 dark:text-emerald-400">
              {completedSolutions.length}
            </div>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
              Outcomes recorded in repository
            </p>
          </div>
        </Tooltip>

        {/* Card 3: Experiences Shared */}
        <Tooltip content="Number of real-world experiences contributed to the community" position="top">
          <div
            onClick={() => onNavigate('experiences')}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-700 hover:shadow-2xs transition-all cursor-pointer space-y-2 h-full"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span>Experiences Shared</span>
              <div className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <Compass className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {activeUser.experiencesShared || 0}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Contributing to collective intelligence
            </p>
          </div>
        </Tooltip>

        {/* Card 4: People Helped */}
        <Tooltip content="Estimated users who have referenced your submitted experiences" position="top">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/50 to-emerald-50/30 dark:from-indigo-950/30 dark:to-emerald-950/20 border border-indigo-200/70 dark:border-indigo-800/60 space-y-2 h-full">
            <div className="flex items-center justify-between text-xs font-semibold text-indigo-900 dark:text-indigo-300">
              <span>Community Impact</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                <Heart className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {activeUser.peopleHelped > 0 ? activeUser.peopleHelped : 0}
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
              {activeUser.peopleHelped > 0
                ? `Your experiences have helped ${activeUser.peopleHelped} people.`
                : 'Share an experience to help community peers.'}
            </p>
          </div>
        </Tooltip>
      </div>

      {/* Main Grid: Active Solutions & Platform Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Active Solutions & Recent Tracks */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Active Strategy Plans
            </h2>
            <button
              onClick={() => onNavigate('solutions')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {activeSolutions.length === 0 ? (
            <div className="p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-2xs">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                You haven't submitted any problems yet.
              </p>
              <button
                onClick={() => onNavigate('ask')}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 dark:bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 cursor-pointer"
              >
                Ask Xperiens
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {activeSolutions.slice(0, 3).map((sol) => (
                <div
                  key={sol.id}
                  onClick={() => onSelectSolution(sol)}
                  className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {sol.originalProblem.category}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(sol.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">
                      {sol.originalProblem.problem}
                    </h3>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                      {sol.recommendationSteps.length} Steps • {sol.evidence.confidencePercentage}% Evidence Confidence
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Platform Health & Collective Insights */}
        <div className="space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Collective Knowledge Pool
          </h2>

          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xs">
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Real Community Cases:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {platformStats ? platformStats.totalRealExperiences : 0} verified
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Reported Outcomes:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {platformStats ? platformStats.totalOutcomesReported : 0} trials
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Community Contributors:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {platformStats ? platformStats.communityContributors : 0} people
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Demo Reference Records:</span>
                <span className="font-bold text-amber-800 dark:text-amber-400">
                  {platformStats ? platformStats.totalDemoExperiences : 0} demo cases
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Outcome Success Rate:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {platformStats && platformStats.totalOutcomesReported > 0
                    ? `${platformStats.successfulSolutionsRatio}% positive`
                    : 'Awaiting 1st trial'}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
              {(!platformStats || platformStats.totalRealExperiences === 0) ? (
                <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900 text-[11px] text-amber-900 dark:text-amber-300 space-y-1">
                  <span className="font-bold block">No community experiences yet</span>
                  <p className="leading-relaxed">
                    You're among the first people building the Xperiens experience knowledge base. Share a real outcome to create the first entry.
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">The Xperiens Principle:</span>
                  <p>
                    Every trial you log as an outcome directly refines future reasoning, making solutions smarter for the next person facing your challenge.
                  </p>
                </div>
              )}

              <button
                onClick={() => onNavigate('profile')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/50 hover:bg-indigo-100/80 dark:hover:bg-indigo-900/60 border border-indigo-100 dark:border-indigo-900/50 text-indigo-900 dark:text-indigo-300 text-xs font-bold transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Manage Profile & Banner Theme</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
