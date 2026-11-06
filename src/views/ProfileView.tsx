import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Mail,
  Calendar,
  Sparkles,
  Shield,
  Edit3,
  Trash2,
  Lock,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Activity,
  Layers,
  Save,
  X,
  ArrowRight,
  Monitor,
  Palette,
  Image as ImageIcon,
  Camera,
  Upload,
  Globe,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useWritingAssist } from '../contexts/WritingAssistContext';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { BRAND_TAGLINE } from '../constants/brand';
import {
  UserProfile,
  Experience,
  SolutionAnalysis,
  Category,
  ProfileVisibility,
  OutcomeStatus,
} from '../types';
import {
  fetchUserActivityStats,
  fetchUserExperiences,
  updateUserExperience,
  deleteUserExperience,
  UserActivityStats,
} from '../services/firestoreService';
import {
  getLocalActiveSolutions,
  getLocalSavedSolutions,
  deleteExperience,
} from '../services/api';
import { AiWritingField } from '../components/AiWritingField';
import { ViewMode } from '../App';

interface ProfileViewProps {
  onNavigate: (view: ViewMode) => void;
  onSelectSolution: (solution: SolutionAnalysis) => void;
  soundEnabled: boolean;
  onToggleSound: (enabled: boolean) => void;
}

const ALL_CATEGORIES: Category[] = [
  'Career',
  'Education',
  'Technology',
  'Productivity',
  'Personal Decisions',
  'Finance',
  'Relationships',
  'Everyday Problems',
  'Other',
];

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
];

export const BANNER_PRESETS = [
  { id: 'deep-twilight', name: 'Deep Twilight', url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80', preview: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=300&auto=format&fit=crop&q=80' },
  { id: 'ocean-calm', name: 'Ocean Calm', url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1200&auto=format&fit=crop&q=80', preview: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=300&auto=format&fit=crop&q=80' },
  { id: 'cosmic-violet', name: 'Cosmic Violet', url: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=1200&auto=format&fit=crop&q=80', preview: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=300&auto=format&fit=crop&q=80' },
  { id: 'mountain-dusk', name: 'Mountain Dusk', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&auto=format&fit=crop&q=80', preview: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=300&auto=format&fit=crop&q=80' },
  { id: 'golden-sunset', name: 'Golden Sunset', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80', preview: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&auto=format&fit=crop&q=80' },
  { id: 'emerald-forest', name: 'Emerald Forest', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&auto=format&fit=crop&q=80', preview: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=300&auto=format&fit=crop&q=80' },
  { id: 'abstract-fluid', name: 'Abstract Fluid', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80', preview: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80' },
  { id: 'obsidian-minimal', name: 'Obsidian Dark', url: 'https://images.unsplash.com/photo-1604076913837-52ab5629fba9?w=1200&auto=format&fit=crop&q=80', preview: 'https://images.unsplash.com/photo-1604076913837-52ab5629fba9?w=300&auto=format&fit=crop&q=80' },
];

export const ProfileView: React.FC<ProfileViewProps> = ({ 
  onNavigate, 
  onSelectSolution,
}) => {
  const {
    currentUser,
    userProfile,
    isGuest,
    logout,
    updateUserProfile,
    deleteUserAccount,
  } = useAuth();

  const { isEnabled: aiWritingEnabled, setIsEnabled: setAiWritingEnabled } = useWritingAssist();
  const { themePreference, setThemePreference } = useTheme();
  const { t } = useLanguage();

  // Active section tab
  const [activeTab, setActiveTab] = useState<'overview' | 'experiences' | 'solutions' | 'settings'>('overview');

  // Stats
  const [stats, setStats] = useState<UserActivityStats>({
    experiencesShared: 0,
    solutionsTried: 0,
    successfulOutcomes: 0,
    savedSolutions: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // User Experiences & Solutions
  const [userExperiences, setUserExperiences] = useState<Experience[]>([]);
  const [userSolutions, setUserSolutions] = useState<SolutionAnalysis[]>([]);
  const [loadingExperiences, setLoadingExperiences] = useState(true);

  // Edit Profile State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editPhotoURL, setEditPhotoURL] = useState('');
  const [editBannerURL, setEditBannerURL] = useState('');
  const [editAbout, setEditAbout] = useState('');
  const [editInterests, setEditInterests] = useState<Category[]>([]);
  const [editAnonymousDefault, setEditAnonymousDefault] = useState(false);
  const [editVisibility, setEditVisibility] = useState<ProfileVisibility>('public');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Load data
  const loadUserData = async () => {
    if (!currentUser || isGuest) {
      setLoadingStats(false);
      setLoadingExperiences(false);
      return;
    }

    setLoadingStats(true);
    setLoadingExperiences(true);

    try {
      const userStats = await fetchUserActivityStats(currentUser.uid);
      const localSaved = getLocalSavedSolutions();
      const localActive = getLocalActiveSolutions();
      
      setStats({
        experiencesShared: userStats.experiencesShared,
        solutionsTried: Math.max(userStats.solutionsTried, localActive.filter(s => !!s.outcomeReport).length),
        successfulOutcomes: Math.max(userStats.successfulOutcomes, localActive.filter(s => s.outcomeReport?.result === 'worked').length),
        savedSolutions: Math.max(userStats.savedSolutions, localSaved.length),
      });

      const exps = await fetchUserExperiences(currentUser.uid);
      setUserExperiences(exps);

      const allSolutionsMap = new Map<string, SolutionAnalysis>();
      localSaved.forEach((s) => allSolutionsMap.set(s.id, { ...s, status: s.status || 'saved' }));
      localActive.forEach((s) => {
        const existing = allSolutionsMap.get(s.id);
        if (existing) {
          allSolutionsMap.set(s.id, { ...existing, ...s });
        } else {
          allSolutionsMap.set(s.id, s);
        }
      });
      setUserSolutions(Array.from(allSolutionsMap.values()));
    } catch (e) {
      console.warn('Error loading profile data:', e);
    } finally {
      setLoadingStats(false);
      setLoadingExperiences(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [currentUser, isGuest]);

  useEffect(() => {
    if (userProfile) {
      setEditDisplayName(userProfile.displayName || userProfile.name || '');
      setEditPhotoURL(userProfile.photoURL || '');
      setEditBannerURL(userProfile.bannerURL || '');
      setEditAbout(userProfile.about || '');
      setEditInterests(userProfile.interests || ['Everyday Problems', 'Productivity']);
      setEditAnonymousDefault(Boolean(userProfile.isAnonymous));
      setEditVisibility(userProfile.profileVisibility || 'public');
    }
  }, [userProfile, isEditingProfile]);

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSavingProfile(true);
    try {
      await updateUserProfile({
        displayName: editDisplayName.trim(),
        name: editDisplayName.trim(),
        photoURL: editPhotoURL.trim() || undefined,
        bannerURL: editBannerURL.trim() || undefined,
        about: editAbout.trim(),
        interests: editInterests,
        isAnonymous: editAnonymousDefault,
        profileVisibility: editVisibility,
        aiWritingAssistEnabled: aiWritingEnabled,
      });
      setSaveSuccessMsg(t('profile.save_success', 'Profile updated successfully.'));
      setTimeout(() => {
        setIsEditingProfile(false);
        setSaveSuccessMsg(null);
      }, 2000);
    } catch (err: any) {
      setEditError(err.message || t('common.error'));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDeleteExperience = async (expId: string) => {
    if (!window.confirm(t('profile.confirm_delete_exp', 'Are you sure you want to delete this experience?'))) return;
    try {
      await deleteUserExperience(expId);
      setUserExperiences(prev => prev.filter(e => e.id !== expId));
      setStats(prev => ({ ...prev, experiencesShared: Math.max(0, prev.experiencesShared - 1) }));
    } catch (err) {
      console.error('Delete failed:', err);
      // Optional: show user error message
    }
  };

  if (!currentUser || isGuest) {
    return (
      <div className="max-w-xl mx-auto py-24 px-6 text-center space-y-8">
        <div className="w-16 h-16 bg-brand-border dark:bg-dark-border rounded-full flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8 text-brand-text-secondary dark:text-dark-text-secondary" />
        </div>
        <div className="space-y-4">
          <h1 className="text-3xl font-serif font-bold text-brand-text-primary dark:text-dark-text-primary">{t('profile.title', 'Xperiens Profile')}</h1>
          <p className="text-brand-text-secondary dark:text-dark-text-secondary leading-relaxed">
            {t('profile.login_desc', 'Create a secure account to track your decisions, save tailored strategies, and contribute to the collective wisdom pool.')}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button onClick={() => onNavigate('signup')} className="w-full sm:w-auto px-8 py-3 bg-brand-accent dark:bg-dark-accent text-white rounded-lg font-bold">{t('common.signup')}</button>
          <button onClick={() => onNavigate('login')} className="w-full sm:w-auto px-8 py-3 border border-brand-border dark:border-dark-border text-brand-text-primary dark:text-dark-text-primary rounded-lg font-bold">{t('common.login')}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 space-y-12 animate-fadeIn pb-24">
      {/* Editorial Header */}
      <div className="relative overflow-hidden rounded-2xl border border-brand-border dark:border-dark-border bg-brand-card dark:bg-dark-card shadow-sm">
        <div className="h-48 sm:h-64 relative bg-slate-900">
          {userProfile?.bannerURL ? (
            <img src={userProfile.bannerURL} alt="Banner" className="w-full h-full object-cover opacity-60" />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-slate-900 to-indigo-900 opacity-40" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-card dark:from-dark-card to-transparent" />
        </div>

        <div className="px-8 pb-10 -mt-16 sm:-mt-24 relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
            <div className="relative">
              {userProfile?.photoURL ? (
                <img src={userProfile.photoURL} alt={userProfile.displayName || 'User'} className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl object-cover border-4 border-white dark:border-dark-card shadow-2xl" />
              ) : (
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl bg-dark-accent text-white flex items-center justify-center font-serif text-5xl border-4 border-white dark:border-dark-card shadow-2xl">
                   {userProfile?.displayName?.charAt(0) || 'U'}
                </div>
              )}
              <button onClick={() => setIsEditingProfile(true)} className="absolute bottom-2 right-2 p-2 bg-brand-text-primary dark:bg-dark-text-primary text-brand-bg dark:text-dark-bg rounded-lg shadow-lg hover:opacity-90">
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="text-center sm:text-left space-y-3 pb-2">
              <div className="flex items-center justify-center sm:justify-start gap-3">
                <h1 className="text-3xl sm:text-4xl font-serif font-bold text-brand-text-primary dark:text-dark-text-primary">
                  {userProfile?.displayName || 'User'}
                </h1>
                {userProfile?.isAnonymous && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-brand-border dark:border-dark-border text-brand-text-secondary dark:text-dark-text-secondary uppercase tracking-widest">{t('common.anonymous')} {t('common.mode', 'Mode')}</span>
                )}
              </div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-brand-text-secondary dark:text-dark-text-secondary font-light">
                <div className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> <span>{currentUser.email}</span></div>
                <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> <span>{t('profile.joined', 'Joined')} {new Date(currentUser.metadata.creationTime || Date.now()).toLocaleDateString()}</span></div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={logout} className="px-6 py-2 border border-brand-border dark:border-dark-border rounded-lg text-sm font-bold text-brand-text-primary dark:text-dark-text-primary hover:bg-slate-50 dark:hover:bg-dark-border transition-all flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              <span>{t('common.logout')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-8 border-b border-brand-border dark:border-dark-border pb-px overflow-x-auto scrollbar-hide">
        {[
          { id: 'overview', label: t('profile.overview'), icon: Activity },
          { id: 'experiences', label: t('profile.stories'), icon: Layers },
          { id: 'solutions', label: t('profile.tracks'), icon: Sparkles },
          { id: 'settings', label: t('profile.settings'), icon: Shield },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 pb-4 text-sm font-semibold whitespace-nowrap transition-all relative ${
              activeTab === tab.id
                ? 'text-brand-accent dark:text-dark-accent'
                : 'text-brand-text-secondary dark:text-dark-text-secondary hover:text-brand-text-primary dark:hover:text-dark-text-primary'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-accent dark:bg-dark-accent" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="space-y-12 animate-fadeIn">
            {/* Bio Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
               <div className="lg:col-span-2 space-y-6">
                <h3 className="text-xl font-serif font-bold text-brand-text-primary dark:text-dark-text-primary">{t('profile.about')}</h3>
                <p className="text-brand-text-secondary dark:text-dark-text-secondary leading-relaxed font-light italic">
                  {userProfile?.about || t('profile.no_about', "This member hasn't shared their story yet.")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {userProfile?.interests?.map(i => (
                    <span key={i} className="text-[11px] font-medium px-3 py-1 bg-brand-bg dark:bg-dark-sec-bg border border-brand-border dark:border-dark-border rounded-full text-brand-text-secondary dark:text-dark-text-secondary">
                      {i}
                    </span>
                  ))}
                </div>
                
                {/* Philosophy Section */}
                <div className="p-8 bg-brand-accent/5 dark:bg-dark-accent/5 rounded-2xl border border-brand-accent/10 dark:border-dark-accent/10 space-y-4">
                  <h3 className="text-xl font-serif font-bold text-brand-text-primary dark:text-dark-text-primary">
                    Our Philosophy
                  </h3>
                  <p className="text-sm font-serif italic text-brand-text-primary dark:text-dark-text-primary">
                    "{BRAND_TAGLINE}"
                  </p>
                  <p className="text-sm text-brand-text-secondary dark:text-dark-text-secondary leading-relaxed">
                    The answer you're searching for may be in someone else's lived experience. We are building a collective wisdom pool to ensure that your decisions are informed by the journeys of others.
                  </p>
                </div>
              </div>
              <div className="p-8 rounded-xl border border-brand-border dark:border-dark-border bg-brand-card dark:bg-dark-card space-y-8">
                <h3 className="text-sm font-semibold text-brand-text-secondary dark:text-dark-text-secondary uppercase tracking-widest">{t('profile.activity')}</h3>
                <div className="space-y-6">
                   {[
                    { label: t('profile.stat_shared', 'Experiences Shared'), value: stats.experiencesShared },
                    { label: t('profile.stat_tested', 'Solutions Tested'), value: stats.solutionsTried },
                    { label: t('profile.stat_success', 'Success Outcomes'), value: stats.successfulOutcomes },
                    { label: t('profile.stat_saved', 'Saved Resources'), value: stats.savedSolutions }
                  ].map((stat, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-xs text-brand-text-secondary dark:text-dark-text-secondary">{stat.label}</span>
                      <span className="text-lg font-serif font-bold text-brand-text-primary dark:text-dark-text-primary">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'experiences' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-serif font-bold text-brand-text-primary dark:text-dark-text-primary">{t('profile.stat_shared')}</h3>
              <button onClick={() => onNavigate('share-experience')} className="px-4 py-2 bg-brand-text-primary dark:bg-dark-text-primary text-brand-bg dark:text-dark-bg rounded-lg text-xs font-bold">{t('common.share_btn', 'New Story')}</button>
            </div>
            {userExperiences.length === 0 ? (
              <div className="p-20 border border-dashed border-brand-border dark:border-dark-border rounded-xl text-center">
                <p className="text-sm text-brand-text-secondary dark:text-dark-text-secondary">{t('profile.empty_stories', 'Your contributions will appear here.')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userExperiences.map((exp) => (
                  <div key={exp.id} className="p-6 rounded-xl border border-brand-border dark:border-dark-border bg-brand-card dark:bg-dark-card space-y-4 group">
                    <div className="flex items-center justify-between text-xs text-brand-text-secondary dark:text-dark-text-secondary">
                      <span>{exp.category}</span>
                      <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => handleDeleteExperience(exp.id)} className="text-rose-600 hover:opacity-80"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <h4 className="text-lg font-serif font-bold text-brand-text-primary dark:text-dark-text-primary leading-tight">{exp.title}</h4>
                    <p className="text-xs text-brand-text-secondary dark:text-dark-text-secondary line-clamp-2 italic">"{exp.lesson}"</p>
                    <div className="flex items-center gap-3 pt-2 text-[10px] font-bold uppercase tracking-widest text-brand-text-secondary dark:text-dark-text-secondary">
                       <span>{exp.isPublic ? t('common.public', 'Public') : t('common.private', 'Private')}</span>
                       <span aria-hidden="true">·</span>
                       <span>{exp.isAnonymous ? t('common.anonymous') : t('common.attributed')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'solutions' && (
          <div className="space-y-8 animate-fadeIn">
             <h3 className="text-xl font-serif font-bold text-brand-text-primary dark:text-dark-text-primary">{t('profile.tracks')}</h3>
             {userSolutions.length === 0 ? (
              <div className="p-20 border border-dashed border-brand-border dark:border-dark-border rounded-xl text-center">
                <p className="text-sm text-brand-text-secondary dark:text-dark-text-secondary">{t('profile.empty_tracks', 'Save AI-synthesized strategies to track them here.')}</p>
              </div>
             ) : (
              <div className="space-y-4">
                {userSolutions.map((sol) => (
                   <div key={sol.id} onClick={() => onSelectSolution(sol)} className="p-6 rounded-xl border border-brand-border dark:border-dark-border bg-brand-card dark:bg-dark-card flex items-center justify-between group cursor-pointer hover:border-brand-accent dark:hover:border-dark-accent transition-all">
                      <div className="space-y-2">
                        <div className="text-[10px] font-bold text-brand-text-secondary dark:text-dark-text-secondary uppercase tracking-widest">{sol.originalProblem.category}</div>
                        <h4 className="text-lg font-serif font-bold text-brand-text-primary dark:text-dark-text-primary">{sol.originalProblem.problem}</h4>
                        <div className="flex items-center gap-4 text-xs font-medium text-brand-accent dark:text-dark-accent">
                          <span>{sol.recommendationSteps.length} {t('common.step_plan', 'Step Plan')}</span>
                          {sol.outcomeReport && <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {t('common.resolved', 'Resolved')}</span>}
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-brand-border dark:text-dark-border group-hover:text-brand-accent dark:group-hover:text-dark-accent transition-all" />
                   </div>
                ))}
              </div>
             )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-12 animate-fadeIn max-w-2xl">
            {/* Language Preferences */}
            <div className="space-y-6">
              <h3 className="text-xl font-serif font-bold text-brand-text-primary dark:text-dark-text-primary border-b border-brand-border dark:border-dark-border pb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-accent" />
                {t('profile.language')}
              </h3>
              <LanguageSwitcher variant="bottom-sheet" />
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-serif font-bold text-brand-text-primary dark:text-dark-text-primary border-b border-brand-border dark:border-dark-border pb-4">Theme Preferences</h3>
              <div className="grid grid-cols-3 gap-4">
                {(['light', 'dark', 'system'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setThemePreference(p)}
                    className={`p-4 rounded-xl border text-sm font-semibold capitalize transition-all ${
                      themePreference === p
                        ? 'border-brand-accent dark:border-dark-accent bg-brand-bg dark:bg-dark-sec-bg text-brand-accent dark:text-dark-accent shadow-sm'
                        : 'border-brand-border dark:border-dark-border text-brand-text-secondary dark:text-dark-text-secondary hover:bg-slate-50 dark:hover:bg-dark-border'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                       <Palette className="w-4 h-4 opacity-70" />
                       {p}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-serif font-bold text-brand-text-primary dark:text-dark-text-primary border-b border-brand-border dark:border-dark-border pb-4">AI Assistant</h3>
              <div className="flex items-center justify-between p-6 rounded-xl bg-brand-bg dark:bg-dark-sec-bg border border-brand-border dark:border-dark-border">
                <div className="space-y-1">
                   <div className="text-sm font-bold text-brand-text-primary dark:text-dark-text-primary">Writing Suggestions</div>
                   <div className="text-xs text-brand-text-secondary dark:text-dark-text-secondary">Enable Gemini-powered drafting for your stories.</div>
                </div>
                <button
                  onClick={() => setAiWritingEnabled(!aiWritingEnabled)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${aiWritingEnabled ? 'bg-brand-accent dark:bg-dark-accent' : 'bg-brand-border dark:bg-dark-border'}`}
                >
                  <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${aiWritingEnabled ? 'translate-x-6' : ''}`} />
                </button>
              </div>
            </div>

            <div className="space-y-6 pt-12">
               <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest">Danger Zone</h3>
               <div className="p-6 rounded-xl border border-rose-200 dark:border-rose-950/40 bg-rose-50/30 dark:bg-rose-950/10 space-y-4">
                  <div className="text-xs text-rose-800 dark:text-rose-300">Once you delete your account, there is no going back. Please be certain.</div>
                  <button onClick={() => { if (window.confirm('Type DELETE to confirm account removal')) deleteUserAccount(); }} className="px-6 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold hover:opacity-90">Delete Account</button>
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-dark-bg/60 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-2xl bg-brand-card dark:bg-dark-card rounded-2xl border border-brand-border dark:border-dark-border shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 z-10 px-8 py-6 bg-brand-card dark:bg-dark-card border-b border-brand-border dark:border-dark-border flex items-center justify-between">
               <h3 className="text-xl font-serif font-bold text-brand-text-primary dark:text-dark-text-primary">Edit Profile</h3>
               <button onClick={() => setIsEditingProfile(false)} className="text-brand-text-secondary hover:text-brand-text-primary"><X className="w-6 h-6" /></button>
            </div>
            
            <form onSubmit={handleSaveProfile} className="p-8 space-y-8">
               <div className="space-y-3">
                  <label className="text-xs font-bold text-brand-text-secondary dark:text-dark-text-secondary uppercase tracking-widest">Display Name</label>
                  <input
                    type="text"
                    value={editDisplayName}
                    onChange={(e) => setEditDisplayName(e.target.value)}
                    className="w-full p-3 rounded-lg border border-brand-border dark:border-dark-border bg-brand-bg dark:bg-dark-sec-bg text-brand-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-brand-accent dark:focus:ring-dark-accent outline-none font-medium"
                    required
                  />
               </div>

               <div className="space-y-3">
                  <label className="text-xs font-bold text-brand-text-secondary dark:text-dark-text-secondary uppercase tracking-widest">Profile Photo URL</label>
                  <input
                    type="url"
                    value={editPhotoURL}
                    onChange={(e) => setEditPhotoURL(e.target.value)}
                    className="w-full p-3 rounded-lg border border-brand-border dark:border-dark-border bg-brand-bg dark:bg-dark-sec-bg text-brand-text-primary dark:text-dark-text-primary outline-none text-sm"
                  />
                  <div className="flex gap-2 pt-1">
                    {AVATAR_PRESETS.map((p, i) => (
                      <img key={i} src={p} onClick={() => setEditPhotoURL(p)} className={`w-8 h-8 rounded-full cursor-pointer border-2 transition-all ${editPhotoURL === p ? 'border-brand-accent' : 'border-transparent'}`} />
                    ))}
                  </div>
               </div>

               <div className="space-y-3">
                  <label className="text-xs font-bold text-brand-text-secondary dark:text-dark-text-secondary uppercase tracking-widest">Banner URL</label>
                  <input
                    type="url"
                    value={editBannerURL}
                    onChange={(e) => setEditBannerURL(e.target.value)}
                    className="w-full p-3 rounded-lg border border-brand-border dark:border-dark-border bg-brand-bg dark:bg-dark-sec-bg text-brand-text-primary dark:text-dark-text-primary outline-none text-sm"
                  />
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    {BANNER_PRESETS.slice(0, 4).map(p => (
                       <button key={p.id} type="button" onClick={() => setEditBannerURL(p.url)} className="h-10 rounded-lg overflow-hidden relative border border-brand-border group">
                          <img src={p.preview} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                       </button>
                    ))}
                  </div>
               </div>

               <div className="space-y-3">
                  <label className="text-xs font-bold text-brand-text-secondary dark:text-dark-text-secondary uppercase tracking-widest">About Me</label>
                  <textarea
                    value={editAbout}
                    onChange={(e) => setEditAbout(e.target.value)}
                    rows={4}
                    className="w-full p-4 rounded-lg border border-brand-border dark:border-dark-border bg-brand-bg dark:bg-dark-sec-bg text-brand-text-primary dark:text-dark-text-primary outline-none font-light leading-relaxed"
                    placeholder="Describe your domain expertise or what kind of decisions you help others with..."
                  />
               </div>

               <div className="flex items-center gap-4 pt-4 border-t border-brand-border dark:border-dark-border">
                  <button type="submit" disabled={savingProfile} className="flex-1 py-3 bg-brand-text-primary dark:bg-dark-text-primary text-brand-bg dark:text-dark-bg rounded-lg font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2">
                    {savingProfile ? 'Saving...' : <><Save className="w-4 h-4" /> Save Changes</>}
                  </button>
                  <button type="button" onClick={() => setIsEditingProfile(false)} className="px-8 py-3 border border-brand-border dark:border-dark-border rounded-lg font-bold text-brand-text-primary dark:text-dark-text-primary">Cancel</button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
