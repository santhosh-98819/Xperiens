import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  User as UserIcon,
  Mail,
  Calendar,
  Sparkles,
  Shield,
  Eye,
  EyeOff,
  Edit3,
  Trash2,
  Lock,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Share2,
  Bookmark,
  Activity,
  Layers,
  Heart,
  HelpCircle,
  Save,
  X,
  Plus,
  ArrowRight,
  Sliders,
  Check,
  Globe,
  LockKeyhole,
  Users,
  Sun,
  Moon,
  Monitor,
  Palette,
  Image as ImageIcon,
  Camera,
  Upload,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useWritingAssist } from '../contexts/WritingAssistContext';
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
  saveActiveSolution,
  saveSolutionLocally,
  deleteExperience,
} from '../services/api';
import { AiWritingField } from '../components/AiWritingField';
import { Tooltip } from '../components/Tooltip';
import { ReportOutcomeModal } from '../components/ReportOutcomeModal';
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
  {
    id: 'deep-twilight',
    name: 'Deep Twilight',
    url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80',
    preview: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'ocean-calm',
    name: 'Ocean Calm',
    url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1200&auto=format&fit=crop&q=80',
    preview: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'cosmic-violet',
    name: 'Cosmic Violet',
    url: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=1200&auto=format&fit=crop&q=80',
    preview: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'mountain-dusk',
    name: 'Mountain Dusk',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&auto=format&fit=crop&q=80',
    preview: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'golden-sunset',
    name: 'Golden Sunset',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80',
    preview: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'emerald-forest',
    name: 'Emerald Forest',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&auto=format&fit=crop&q=80',
    preview: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'abstract-fluid',
    name: 'Abstract Fluid',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    preview: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'obsidian-minimal',
    name: 'Obsidian Dark',
    url: 'https://images.unsplash.com/photo-1604076913837-52ab5629fba9?w=1200&auto=format&fit=crop&q=80',
    preview: 'https://images.unsplash.com/photo-1604076913837-52ab5629fba9?w=300&auto=format&fit=crop&q=80',
  },
];

export const ProfileView: React.FC<ProfileViewProps> = ({ 
  onNavigate, 
  onSelectSolution,
  soundEnabled,
  onToggleSound
}) => {
  const {
    currentUser,
    userProfile,
    isGuest,
    logout,
    updateUserProfile,
    resetPassword,
    changePassword,
    deleteUserAccount,
  } = useAuth();

  const { isEnabled: aiWritingEnabled, setIsEnabled: setAiWritingEnabled } = useWritingAssist();
  const { themePreference, setThemePreference, resolvedTheme } = useTheme();

  // Active section tab
  const [activeTab, setActiveTab] = useState<'overview' | 'experiences' | 'solutions' | 'settings'>('overview');

  // Real stats from Firebase
  const [stats, setStats] = useState<UserActivityStats>({
    experiencesShared: 0,
    solutionsTried: 0,
    successfulOutcomes: 0,
    savedSolutions: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // User Experiences
  const [userExperiences, setUserExperiences] = useState<Experience[]>([]);
  const [loadingExperiences, setLoadingExperiences] = useState(true);

  // User Solutions
  const [userSolutions, setUserSolutions] = useState<SolutionAnalysis[]>([]);
  const [solutionFilter, setSolutionFilter] = useState<'all' | 'saved' | 'testing' | 'worked' | 'partially_worked' | 'did_not_work' | 'completed'>('all');
  const [selectedSolutionForOutcome, setSelectedSolutionForOutcome] = useState<SolutionAnalysis | null>(null);

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

  // Quick Banner Customizer Modal
  const [bannerModalOpen, setBannerModalOpen] = useState(false);
  const [isDirectUpdatingBanner, setIsDirectUpdatingBanner] = useState(false);
  const [bannerQuickMsg, setBannerQuickMsg] = useState<string | null>(null);

  // Edit Experience Modal
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [editExpTitle, setEditExpTitle] = useState('');
  const [editExpCategory, setEditExpCategory] = useState<Category>('Career');
  const [editExpSituation, setEditExpSituation] = useState('');
  const [editExpActions, setEditExpActions] = useState<string[]>([]);
  const [editExpLesson, setEditExpLesson] = useState('');
  const [editExpOutcome, setEditExpOutcome] = useState('');
  const [editExpOutcomeStatus, setEditExpOutcomeStatus] = useState<OutcomeStatus>('worked');
  const [savingExp, setSavingExp] = useState(false);

  // Delete Experience Modal
  const [expToDelete, setExpToDelete] = useState<Experience | null>(null);
  const [isDeletingExp, setIsDeletingExp] = useState(false);

  // Delete Account Confirmation Modal
  const [deleteAccountModalOpen, setDeleteAccountModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Change Password Modal
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Load activity data on mount or user change
  const loadUserData = async () => {
    if (!currentUser || isGuest) {
      setLoadingStats(false);
      setLoadingExperiences(false);
      return;
    }

    setLoadingStats(true);
    setLoadingExperiences(true);

    try {
      // 1. Fetch real activity statistics from Firestore
      const userStats = await fetchUserActivityStats(currentUser.uid);
      
      // Merge with local saved count if higher
      const localSaved = getLocalSavedSolutions();
      const localActive = getLocalActiveSolutions();
      
      const realStats: UserActivityStats = {
        experiencesShared: userStats.experiencesShared,
        solutionsTried: Math.max(userStats.solutionsTried, localActive.filter(s => !!s.outcomeReport).length),
        successfulOutcomes: Math.max(userStats.successfulOutcomes, localActive.filter(s => s.outcomeReport?.result === 'worked').length),
        savedSolutions: Math.max(userStats.savedSolutions, localSaved.length),
      };
      setStats(realStats);

      // 2. Fetch user experiences from Firestore
      const exps = await fetchUserExperiences(currentUser.uid);
      setUserExperiences(exps);

      // 3. Load user solutions from local storage and firestore
      const localSavedIds = new Set(localSaved.map((s) => s.id));
      const allSolutionsMap = new Map<string, SolutionAnalysis>();
      localSaved.forEach((s) => {
        allSolutionsMap.set(s.id, {
          ...s,
          status: s.status || (s.outcomeReport ? 'completed' : 'saved'),
        });
      });
      localActive.forEach((s) => {
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
      setUserSolutions(Array.from(allSolutionsMap.values()));
    } catch (e) {
      console.warn('Error loading user profile data:', e);
    } finally {
      setLoadingStats(false);
      setLoadingExperiences(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [currentUser, isGuest]);

  // Sync form inputs when opening edit mode
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

  // Direct banner selector (1-click preset apply or upload)
  const handleDirectSelectBanner = async (bannerUrl: string) => {
    setIsDirectUpdatingBanner(true);
    setBannerQuickMsg(null);
    try {
      await updateUserProfile({
        bannerURL: bannerUrl.trim() || undefined,
      });
      setEditBannerURL(bannerUrl.trim());
      setBannerQuickMsg('Banner updated successfully!');
      setTimeout(() => {
        setBannerQuickMsg(null);
      }, 2500);
    } catch (err: any) {
      setBannerQuickMsg(err.message || 'Failed to update banner.');
    } finally {
      setIsDirectUpdatingBanner(false);
    }
  };

  // Handle banner local image file upload
  const handleBannerFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2.5 * 1024 * 1024) {
      setBannerQuickMsg('Image size should be under 2.5MB for fast loading.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result as string;
      setEditBannerURL(base64Data);
      handleDirectSelectBanner(base64Data);
    };
    reader.readAsDataURL(file);
  };

  // Format account created date
  const getCreatedDateDisplay = () => {
    const rawDate = userProfile?.createdAt || userProfile?.joinedAt || currentUser?.metadata?.creationTime;
    if (!rawDate) return 'Recently Joined';
    try {
      const date = new Date(rawDate);
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (e) {
      return 'Recently Joined';
    }
  };

  // Handle Save Profile
  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setEditError(null);
    setSaveSuccessMsg(null);

    const trimmedName = editDisplayName.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setEditError('Display name must be at least 2 characters.');
      return;
    }
    if (trimmedName.length > 40) {
      setEditError('Display name cannot exceed 40 characters.');
      return;
    }

    setSavingProfile(true);
    try {
      const updates: Partial<UserProfile> = {
        displayName: trimmedName,
        name: trimmedName,
        photoURL: editPhotoURL.trim() || undefined,
        bannerURL: editBannerURL.trim() || undefined,
        about: editAbout.trim(),
        interests: editInterests,
        isAnonymous: editAnonymousDefault,
        profileVisibility: editVisibility,
        aiWritingAssistEnabled: aiWritingEnabled,
      };

      await updateUserProfile(updates);
      setSaveSuccessMsg('Profile updated successfully.');
      setTimeout(() => {
        setIsEditingProfile(false);
        setSaveSuccessMsg(null);
      }, 1400);
    } catch (err: any) {
      setEditError(err.message || 'Failed to save profile changes.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Toggle Interest Chip
  const handleToggleInterest = (category: Category) => {
    setEditInterests((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  // Handle Experience Edit Open
  const handleOpenEditExp = (exp: Experience) => {
    setEditingExperience(exp);
    setEditExpTitle(exp.title);
    setEditExpCategory(exp.category);
    setEditExpSituation(exp.situation);
    setEditExpActions([...exp.actionsTaken]);
    setEditExpLesson(exp.lesson);
    setEditExpOutcome(exp.outcome);
    setEditExpOutcomeStatus(exp.outcomeStatus);
  };

  // Save Experience Edits
  const handleSaveExperienceEdit = async () => {
    if (!editingExperience) return;
    setSavingExp(true);
    try {
      const updates: Partial<Experience> = {
        title: editExpTitle.trim() || editingExperience.title,
        category: editExpCategory,
        situation: editExpSituation.trim(),
        actionsTaken: editExpActions.filter((a) => a.trim().length > 0),
        lesson: editExpLesson.trim(),
        outcome: editExpOutcome.trim(),
        outcomeStatus: editExpOutcomeStatus,
      };

      await updateUserExperience(editingExperience.id, updates);
      setUserExperiences((prev) =>
        prev.map((e) => (e.id === editingExperience.id ? { ...e, ...updates } : e))
      );
      setEditingExperience(null);
    } catch (err) {
      console.error('Failed to update experience:', err);
    } finally {
      setSavingExp(false);
    }
  };

  // Toggle Experience Sharing (Anonymous vs Public, and Public vs Private)
  const handleToggleExpSharing = async (exp: Experience, field: 'isAnonymous' | 'isPublic') => {
    try {
      const newExpVal = !exp[field];
      const updates: Partial<Experience> = {
        [field]: newExpVal,
        authorName:
          field === 'isAnonymous'
            ? newExpVal
              ? 'Anonymous Contributor'
              : userProfile?.displayName || userProfile?.name || 'Community Contributor'
            : exp.authorName,
      };

      await updateUserExperience(exp.id, updates);
      setUserExperiences((prev) =>
        prev.map((e) => (e.id === exp.id ? { ...e, ...updates } : e))
      );
    } catch (err) {
      console.error('Failed to toggle sharing status:', err);
    }
  };

  // Delete Experience Trigger
  const handleDeleteExperience = (exp: Experience) => {
    setExpToDelete(exp);
  };

  // Confirm Delete Experience
  const handleConfirmDeleteExperience = async () => {
    if (!expToDelete) return;
    setIsDeletingExp(true);
    try {
      // 1. Delete from server and local storage
      await deleteExperience(expToDelete.id);

      // 2. Delete from Firestore if authenticated
      if (currentUser && !isGuest) {
        await deleteUserExperience(expToDelete.id);
      }

      // 3. Update state
      setUserExperiences((prev) => prev.filter((e) => e.id !== expToDelete.id));
      setStats((prev) => ({
        ...prev,
        experiencesShared: Math.max(0, prev.experiencesShared - 1),
      }));
      setExpToDelete(null);
    } catch (err) {
      console.error('Failed to delete experience:', err);
    } finally {
      setIsDeletingExp(false);
    }
  };

  // Handle Delete Account
  const handleConfirmDeleteAccount = async () => {
    if (deleteConfirmText.trim().toUpperCase() !== 'DELETE') {
      setDeleteError('Please type "DELETE" exactly to confirm account removal.');
      return;
    }

    setIsDeletingAccount(true);
    setDeleteError(null);
    try {
      await deleteUserAccount();
      setDeleteAccountModalOpen(false);
      onNavigate('home');
    } catch (err: any) {
      if (err.code === 'auth/requires-recent-login') {
        setDeleteError('Security Notice: Deleting your account requires a recent login. Please log out and log in again before deleting.');
      } else {
        setDeleteError(err.message || 'Failed to delete account. Please try again.');
      }
    } finally {
      setIsDeletingAccount(false);
    }
  };

  // Handle Password Update / Reset
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await changePassword(newPassword);
      setPasswordMsg({ type: 'success', text: 'Password changed successfully.' });
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setPasswordModalOpen(false);
        setPasswordMsg(null);
      }, 1500);
    } catch (err: any) {
      if (err.code === 'auth/requires-recent-login') {
        setPasswordMsg({
          type: 'error',
          text: 'Changing your password requires recent authentication. Please log out and log in again.',
        });
      } else {
        setPasswordMsg({ type: 'error', text: err.message || 'Failed to change password.' });
      }
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Filter solutions list
  const filteredSolutions = userSolutions.filter((s) => {
    const isCompleted = s.status === 'completed' || !!s.outcomeReport;
    const isSaved = s.status === 'saved' || getLocalSavedSolutions().some((saved) => saved.id === s.id);
    const isTesting = (s.status === 'testing' || s.status === 'in_progress' || !s.status) && !isCompleted;

    if (solutionFilter === 'all') return true;
    if (solutionFilter === 'saved') return isSaved;
    if (solutionFilter === 'testing') return isTesting;
    if (solutionFilter === 'completed') return isCompleted;
    if (solutionFilter === 'worked') return s.outcomeReport?.result === 'worked';
    if (solutionFilter === 'partially_worked') return s.outcomeReport?.result === 'partially_worked';
    if (solutionFilter === 'did_not_work') return s.outcomeReport?.result === 'did_not_work';
    return true;
  });

  // ==========================================
  // 1. GUEST / UNAUTHENTICATED LOCK SCREEN
  // ==========================================
  if (!currentUser || isGuest) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 animate-fadeIn pb-20">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto shadow-2xs">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 tracking-wider uppercase border border-slate-200">
              Authenticated Access Required
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Personal Xperiens Profile
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Create a free account to create and manage your personal Xperiens profile.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              id="profile-lock-signup-btn"
              onClick={() => onNavigate('signup')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-sm transition-all cursor-pointer"
            >
              <span>Sign Up</span>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </button>
            <button
              id="profile-lock-login-btn"
              onClick={() => onNavigate('login')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all cursor-pointer"
            >
              <span>Log In</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 2. AUTHENTICATED PROFILE VIEW
  // ==========================================
  const displayName = userProfile?.displayName || userProfile?.name || currentUser.displayName || 'Community Member';
  const email = userProfile?.email || currentUser.email || 'No email attached';
  const photoURL = userProfile?.photoURL || currentUser.photoURL;
  const bannerURL = userProfile?.bannerURL;
  const initialLetter = displayName.charAt(0).toUpperCase();

  return (
    <div className="max-w-6xl mx-auto py-6 sm:py-10 space-y-8 animate-fadeIn pb-20 font-sans">
      {/* Top Banner & Profile Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        {/* Dynamic Profile Header Banner */}
        <div className="h-44 sm:h-56 md:h-64 relative bg-slate-950 overflow-hidden group">
          {bannerURL ? (
            <img
              src={bannerURL}
              alt="Profile Banner"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 opacity-95 transition-transform duration-700 group-hover:scale-105" />
          )}

          {/* Scrim Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />

          {/* Badges & Quick Action Controls in Banner */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 backdrop-blur-md shadow-xs">
              ✓ Verified Member
            </span>
            <button
              id="change-banner-header-btn"
              onClick={() => setBannerModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-slate-900/80 hover:bg-slate-900 backdrop-blur-md border border-white/20 shadow-md transition-all cursor-pointer hover:border-indigo-400"
              title="Change header banner"
            >
              <Camera className="w-3.5 h-3.5 text-indigo-400" />
              <span>Change Banner</span>
            </button>
          </div>

          {/* Quick Toast feedback inside banner if updated */}
          {bannerQuickMsg && (
            <div className="absolute bottom-4 left-6 z-10 px-3.5 py-1.5 rounded-xl bg-emerald-500/90 backdrop-blur-md text-white text-xs font-bold shadow-lg animate-fadeIn flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>{bannerQuickMsg}</span>
            </div>
          )}
        </div>

        {/* Profile Card Main Body */}
        <div className="px-6 sm:px-10 pb-8 pt-4 relative bg-white dark:bg-slate-900">
          {/* Avatar & Header Action Controls Row */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-20 sm:-mt-24 mb-3">
            {/* Avatar */}
            <div className="relative group flex-shrink-0">
              {photoURL ? (
                <img
                  id="profile-avatar-img"
                  src={photoURL}
                  alt={displayName}
                  referrerPolicy="no-referrer"
                  className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl object-cover border-4 border-white dark:border-slate-900 shadow-xl bg-slate-100 ring-2 ring-slate-900/10 dark:ring-white/10"
                />
              ) : (
                <div
                  id="profile-avatar-fallback"
                  className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-indigo-600 text-white flex items-center justify-center font-bold text-4xl sm:text-5xl border-4 border-white dark:border-slate-900 shadow-xl ring-2 ring-slate-900/10 dark:ring-white/10"
                >
                  {initialLetter}
                </div>
              )}
              <button
                onClick={() => setIsEditingProfile(true)}
                className="absolute bottom-1 right-1 p-2 rounded-xl bg-slate-900 text-white hover:bg-indigo-600 shadow-md transition-all cursor-pointer border-2 border-white dark:border-slate-900"
                title="Change avatar photo"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 sm:pb-2">
              <button
                id="edit-profile-main-btn"
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-2xs ${
                  isEditingProfile
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200 dark:shadow-none'
                }`}
              >
                <Edit3 className="w-4 h-4" />
                <span>{isEditingProfile ? 'Close Editor' : 'Edit Profile'}</span>
              </button>

              <button
                id="profile-logout-btn"
                onClick={logout}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Log Out</span>
              </button>
            </div>
          </div>

          {/* Name & Identity Block with corrected proper vertical clearance */}
          <div className="space-y-2 text-center sm:text-left pt-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                {displayName}
              </h1>
              {userProfile?.isAnonymous && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  Anonymous Sharing Default
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6 text-xs text-slate-500 dark:text-slate-400 font-medium pt-0.5">
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{email}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Joined {getCreatedDateDisplay()}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                <span>UID: {currentUser.uid.slice(0, 8)}...</span>
              </div>
            </div>
          </div>

          {/* About Me & Interests Section */}
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-2">
              <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">About Me</h2>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {userProfile?.about?.trim() || (
                  <span className="text-slate-400 dark:text-slate-500 italic">
                    No bio provided yet. Click "Edit Profile" to add details about your background, domain focus, or decision-making goals.
                  </span>
                )}
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Interests & Domains</h2>
              <div className="flex flex-wrap gap-1.5">
                {userProfile?.interests && userProfile.interests.length > 0 ? (
                  userProfile.interests.map((interest) => (
                    <span
                      key={interest}
                      className="text-xs font-medium px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800"
                    >
                      {interest}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 dark:text-slate-500 italic">No categories selected</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==========================================
          EDIT PROFILE FORM (Collapsible Panel)
          ========================================== */}
      {isEditingProfile && (
        <div id="edit-profile-card" className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-indigo-200 dark:border-indigo-900/60 shadow-md space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center">
                <Edit3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Your Profile</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Update your public identity, banner, bio, and preferences.</p>
              </div>
            </div>
            <button
              onClick={() => setIsEditingProfile(false)}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {saveSuccessMsg && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {editError && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800 text-xs sm:text-sm font-semibold flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0" />
              <span>{editError}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-6">
            {/* Display Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Display Name *
              </label>
              <input
                id="edit-display-name-input"
                type="text"
                value={editDisplayName}
                onChange={(e) => setEditDisplayName(e.target.value)}
                placeholder="e.g. Alex Morgan"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-slate-900 dark:text-white bg-white dark:bg-slate-800"
                required
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Visible on public experiences and community discussions.</p>
            </div>

            {/* Profile Photo / Avatar Presets */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Profile Photo (Image URL or Pick Preset)
              </label>
              <input
                id="edit-photo-url-input"
                type="url"
                value={editPhotoURL}
                onChange={(e) => setEditPhotoURL(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-slate-900 dark:text-white bg-white dark:bg-slate-800"
              />
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Quick Presets:</span>
                <div className="flex items-center gap-2">
                  {AVATAR_PRESETS.map((preset, idx) => (
                    <img
                      key={idx}
                      src={preset}
                      alt="Preset"
                      onClick={() => setEditPhotoURL(preset)}
                      className={`w-7 h-7 rounded-full object-cover cursor-pointer transition-transform hover:scale-110 border ${
                        editPhotoURL === preset ? 'ring-2 ring-indigo-600 scale-105' : 'border-slate-200 dark:border-slate-700'
                      }`}
                    />
                  ))}
                  {editPhotoURL && (
                    <button
                      type="button"
                      onClick={() => setEditPhotoURL('')}
                      className="text-[10px] text-rose-600 dark:text-rose-400 hover:underline ml-1"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Header Banner Section */}
            <div className="space-y-2.5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Profile Header Banner</span>
                </label>
                {editBannerURL && (
                  <button
                    type="button"
                    onClick={() => setEditBannerURL('')}
                    className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline font-semibold"
                  >
                    Reset to Default Banner
                  </button>
                )}
              </div>

              {/* Preview Banner */}
              <div className="h-24 w-full rounded-xl overflow-hidden relative border border-slate-200 dark:border-slate-700 shadow-2xs">
                {editBannerURL ? (
                  <img
                    src={editBannerURL}
                    alt="Banner preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 flex items-center justify-center">
                    <span className="text-xs font-semibold text-slate-300">Default Gradient Banner</span>
                  </div>
                )}
              </div>

              {/* Banner Presets Grid */}
              <div>
                <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-2">Curated Banner Themes:</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {BANNER_PRESETS.map((preset) => {
                    const isSelected = editBannerURL === preset.url;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setEditBannerURL(preset.url)}
                        className={`relative h-14 rounded-xl overflow-hidden border text-left transition-all cursor-pointer group ${
                          isSelected
                            ? 'ring-2 ring-indigo-600 border-indigo-600 shadow-sm'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-400'
                        }`}
                      >
                        <img
                          src={preset.preview}
                          alt={preset.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/30 transition-colors" />
                        <span className="absolute bottom-1 left-1.5 text-[10px] font-bold text-white drop-shadow-xs">
                          {preset.name}
                        </span>
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Banner URL & Upload Button */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <div className="sm:col-span-2">
                  <input
                    id="edit-banner-url-input"
                    type="url"
                    value={editBannerURL}
                    onChange={(e) => setEditBannerURL(e.target.value)}
                    placeholder="Or enter custom banner image URL..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-medium text-slate-900 dark:text-white bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label
                    htmlFor="banner-upload-file-input"
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 text-xs font-semibold cursor-pointer shadow-2xs transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5 text-slate-500" />
                    <span>Upload Image</span>
                    <input
                      id="banner-upload-file-input"
                      type="file"
                      accept="image/*"
                      onChange={handleBannerFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* About Me with AI Writing Assistant Support */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  About Me (Bio)
                </label>
                <span className="text-[10px] text-slate-400">AI Assistant enabled</span>
              </div>
              <AiWritingField
                fieldName="bio"
                value={editAbout}
                onChange={setEditAbout}
                rows={3}
                placeholder="Share a short summary about your background, career focus, or what challenges you frequently navigate..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-normal text-slate-900 bg-white leading-relaxed"
              />
            </div>

            {/* Selected Interests Multi-Select */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Your Primary Interests & Domains
              </label>
              <div className="flex flex-wrap gap-2">
                {ALL_CATEGORIES.map((cat) => {
                  const isSelected = editInterests.includes(cat);
                  return (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => handleToggleInterest(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-2xs ring-1 ring-indigo-600'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      {isSelected && '✓ '}
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Save Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                id="save-profile-btn"
                type="submit"
                disabled={savingProfile}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{savingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ==========================================
          XPERIENS ACTIVITY (Real Firebase Stats)
          ========================================== */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Xperiens Activity
            </h2>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Real-time Firebase metrics</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Experiences Shared */}
          <Tooltip content="Total real experiences you have submitted and shared with the Xperiens repository" position="top">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:border-indigo-200 transition-all">
              <div className="flex items-center justify-between text-indigo-600 mb-2">
                <Share2 className="w-5 h-5" />
                <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                  Submissions
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {loadingStats ? '...' : stats.experiencesShared}
              </p>
              <p className="text-xs font-semibold text-slate-600 mt-1">Experiences Shared</p>
            </div>
          </Tooltip>

          {/* Card 2: Solutions Tried */}
          <Tooltip content="Decisions and action plans you have actively tested in the real world" position="top">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:border-indigo-200 transition-all">
              <div className="flex items-center justify-between text-indigo-600 mb-2">
                <Layers className="w-5 h-5" />
                <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                  Tested
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {loadingStats ? '...' : stats.solutionsTried}
              </p>
              <p className="text-xs font-semibold text-slate-600 mt-1">Solutions Tried</p>
            </div>
          </Tooltip>

          {/* Card 3: Successful Outcomes */}
          <Tooltip content="Solutions and tests that yielded verified positive outcomes in your life or career" position="top">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:border-indigo-200 transition-all">
              <div className="flex items-center justify-between text-emerald-600 mb-2">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full">
                  Resolved
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {loadingStats ? '...' : stats.successfulOutcomes}
              </p>
              <p className="text-xs font-semibold text-slate-600 mt-1">Successful Outcomes</p>
            </div>
          </Tooltip>

          {/* Card 4: Saved Solutions */}
          <Tooltip content="Bookmarked decision guides and strategy frameworks saved for future reference" position="top">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:border-indigo-200 transition-all">
              <div className="flex items-center justify-between text-indigo-600 mb-2">
                <Bookmark className="w-5 h-5" />
                <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                  Saved
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {loadingStats ? '...' : stats.savedSolutions}
              </p>
              <p className="text-xs font-semibold text-slate-600 mt-1">Saved Solutions</p>
            </div>
          </Tooltip>
        </div>
      </div>

      {/* ==========================================
          PROFILE NAVIGATION TABS
          ========================================== */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs sm:text-sm font-semibold overflow-x-auto">
        <button
          id="tab-btn-experiences"
          onClick={() => setActiveTab('experiences')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'experiences'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>My Experiences ({userExperiences.length})</span>
        </button>

        <button
          id="tab-btn-solutions"
          onClick={() => setActiveTab('solutions')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'solutions'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>My Solutions ({userSolutions.length})</span>
        </button>

        <button
          id="tab-btn-settings"
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'settings'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Privacy & Settings</span>
        </button>
      </div>

      {/* ==========================================
          TAB 1: MY EXPERIENCES
          ========================================== */}
      {activeTab === 'experiences' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">My Experiences</h2>
              <p className="text-xs text-slate-600">
                Manage, edit, or toggle anonymity for situations you have shared with the community.
              </p>
            </div>
            <button
              onClick={() => onNavigate('share-experience')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Share New Experience</span>
            </button>
          </div>

          {loadingExperiences ? (
            <div className="text-center py-12 text-slate-400 text-sm">Loading your experiences from Firestore...</div>
          ) : userExperiences.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <Share2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800">You haven't shared any experiences yet</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Sharing what you tried, what happened, and what you learned helps others facing identical situations.
                </p>
              </div>
              <button
                onClick={() => onNavigate('share-experience')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 transition-all"
              >
                <span>Share Your First Experience</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userExperiences.map((exp) => (
                <div
                  key={exp.id}
                  className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header Tags */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {exp.category}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            exp.outcomeStatus === 'worked'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : exp.outcomeStatus === 'partially_worked'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {exp.outcomeStatus === 'worked'
                            ? 'Worked'
                            : exp.outcomeStatus === 'partially_worked'
                            ? 'Partially Worked'
                            : "Didn't Work"}
                        </span>
                      </div>
                    </div>

                    {/* Title & Situation */}
                    <div>
                      <h3 className="font-bold text-base text-slate-900 leading-snug">{exp.title}</h3>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-3 leading-relaxed">
                        {exp.situation}
                      </p>
                    </div>

                    {/* Actions Summary */}
                    {exp.actionsTaken && exp.actionsTaken.length > 0 && (
                      <div className="bg-slate-50 rounded-xl p-3 space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          What Was Tried:
                        </span>
                        <ul className="text-xs text-slate-700 space-y-0.5">
                          {exp.actionsTaken.slice(0, 2).map((a, i) => (
                            <li key={i} className="line-clamp-1">
                              • {a}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Lesson Learned */}
                    <div className="bg-indigo-50/60 rounded-xl p-3 border border-indigo-100/80">
                      <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">
                        Lesson Learned:
                      </span>
                      <p className="text-xs text-slate-800 line-clamp-2 mt-0.5 leading-relaxed">
                        {exp.lesson}
                      </p>
                    </div>
                  </div>

                  {/* Footer & Controls */}
                  <div className="pt-3 border-t border-slate-100 space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                      <span>{new Date(exp.createdAt).toLocaleDateString()}</span>
                      <div className="flex items-center gap-2">
                        <span className={exp.isAnonymous ? 'text-indigo-600 font-semibold' : 'text-slate-500'}>
                          {exp.isAnonymous ? '👤 Anonymous' : '🌐 Public Name'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <div className="flex items-center gap-1.5">
                        <Tooltip
                          content={exp.isAnonymous ? 'Switch to showing your public name' : 'Switch to anonymous attribution'}
                          position="top"
                        >
                          <button
                            onClick={() => handleToggleExpSharing(exp, 'isAnonymous')}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          >
                            {exp.isAnonymous ? 'Make Public' : 'Make Anon'}
                          </button>
                        </Tooltip>

                        <button
                          onClick={() => handleOpenEditExp(exp)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        >
                          Edit
                        </button>
                      </div>

                      <button
                        onClick={() => handleDeleteExperience(exp)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Delete experience"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==========================================
          TAB 2: MY SOLUTIONS
          ========================================== */}
      {activeTab === 'solutions' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">My Solutions</h2>
              <p className="text-xs text-slate-600">
                Track strategies you are testing, review personalized recommendations, and record outcomes.
              </p>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {[
                { id: 'all', label: 'All' },
                { id: 'testing', label: 'Testing' },
                { id: 'saved', label: 'Saved' },
                { id: 'completed', label: 'Completed' },
                { id: 'worked', label: 'Worked' },
                { id: 'did_not_work', label: "Didn't Work" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSolutionFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    solutionFilter === f.id
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {filteredSolutions.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <Layers className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800">No solutions found in this category</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Ask Xperiens to diagnose a challenge and synthesize a step-by-step action plan.
                </p>
              </div>
              <button
                onClick={() => onNavigate('ask')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Ask Xperiens</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSolutions.map((sol) => (
                <div
                  key={sol.id}
                  className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {sol.originalProblem?.category || 'General'}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {sol.recommendationSteps?.length || 4} Steps Plan
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-base text-slate-900 leading-snug">
                        {sol.originalProblem?.problem || sol.problemSummary}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                        {sol.overallReasoning}
                      </p>
                    </div>

                    {sol.outcomeReport && (
                      <div className="bg-emerald-50/70 rounded-xl p-3 border border-emerald-100 space-y-1">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                          Reported Outcome:
                        </span>
                        <p className="text-xs text-emerald-950 font-medium">
                          {sol.outcomeReport.whatHappened || 'Implemented the strategy successfully.'}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onSelectSolution(sol)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-indigo-600 transition-all cursor-pointer"
                    >
                      <span>View Full Plan</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    {!sol.outcomeReport ? (
                      <button
                        onClick={() => setSelectedSolutionForOutcome(sol)}
                        className="px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-all cursor-pointer"
                      >
                        Report Outcome
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                        ✓ Outcome Logged
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==========================================
          TAB 3: PRIVACY & SETTINGS
          ========================================== */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Appearance / Theme Settings Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-6 transition-colors">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 flex items-center justify-center">
                <Palette className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Appearance</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Customize the interface theme and visual mode for Xperiens.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">Interface Theme</span>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Select your preferred color scheme or synchronize with your operating system.
                  </p>
                </div>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/70 px-2.5 py-1 rounded-lg border border-indigo-100 dark:border-indigo-800/60 capitalize">
                  Active: {themePreference === 'system' ? `System (${resolvedTheme})` : themePreference}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: 'light' as const,
                    label: 'Light',
                    icon: Sun,
                    badge: '☀️ Light',
                    desc: 'Clean light background, crisp typography, and purple accents.',
                  },
                  {
                    id: 'dark' as const,
                    label: 'Dark',
                    icon: Moon,
                    badge: '🌙 Dark',
                    desc: 'Carefully balanced dark canvas with high contrast and eye comfort.',
                  },
                  {
                    id: 'system' as const,
                    label: 'System Default',
                    icon: Monitor,
                    badge: '🖥️ System Default',
                    desc: 'Automatically synchronizes with your device theme in real-time.',
                  },
                ].map((item) => {
                  const isSelected = themePreference === item.id;
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      id={`theme-option-${item.id}`}
                      onClick={() => setThemePreference(item.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 relative ${
                        isSelected
                          ? 'bg-indigo-50/80 dark:bg-indigo-950/60 border-indigo-600 dark:border-indigo-500 ring-2 ring-indigo-600 dark:ring-indigo-500 shadow-2xs'
                          : 'bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        {isSelected && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/80 px-2 py-0.5 rounded-full">
                            <Check className="w-3 h-3" />
                            <span>Selected</span>
                          </span>
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{item.badge}</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Startup Sound Toggle */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/50">
                <div className="space-y-1">
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    Startup Sound
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-400 max-w-lg">
                    Play a gentle melodic chime when Xperiens launches.
                  </p>
                </div>

                <button
                  id="toggle-startup-sound-btn"
                  onClick={() => onToggleSound(!soundEnabled)}
                  className={`w-14 h-8 rounded-full transition-all duration-300 flex items-center p-1 cursor-pointer ${
                    soundEnabled ? 'bg-indigo-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                  }`}
                >
                  <motion.div 
                    layout
                    className="w-6 h-6 rounded-full bg-white shadow-sm" 
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Privacy & Sharing Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Privacy & Sharing Preferences</h3>
                <p className="text-xs text-slate-500">Configure how your name, profile, and contributions are shared.</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Anonymous Sharing Toggle */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">Anonymous Experience Sharing</span>
                    <Tooltip
                      content="When ON, experiences you submit will never show your display name or email. They are safely attributed to 'Anonymous Member'."
                      position="top"
                    >
                      <HelpCircle className="w-4 h-4 text-slate-400 cursor-pointer" />
                    </Tooltip>
                  </div>
                  <p className="text-xs text-slate-600 max-w-lg">
                    Automatically protect your identity across all submitted trials and lessons learned.
                  </p>
                </div>

                <button
                  id="toggle-anon-sharing-btn"
                  onClick={async () => {
                    const newVal = !userProfile?.isAnonymous;
                    await updateUserProfile({ isAnonymous: newVal });
                  }}
                  className={`w-14 h-8 rounded-full transition-colors flex items-center p-1 cursor-pointer ${
                    userProfile?.isAnonymous ? 'bg-indigo-600 justify-end' : 'bg-slate-300 justify-start'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-white shadow-sm" />
                </button>
              </div>

              {/* Profile Visibility Selector */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">Profile Visibility</span>
                  <Tooltip
                    content="Control who can see your bio, profile card, and public contributions on Xperiens."
                    position="top"
                  >
                    <HelpCircle className="w-4 h-4 text-slate-400 cursor-pointer" />
                  </Tooltip>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: 'public',
                      label: 'Public',
                      icon: Globe,
                      desc: 'Visible to all community members and problem solvers.',
                    },
                    {
                      id: 'limited',
                      label: 'Limited',
                      icon: Users,
                      desc: 'Visible only to verified, registered contributors.',
                    },
                    {
                      id: 'private',
                      label: 'Private',
                      icon: LockKeyhole,
                      desc: 'Visible exclusively to you. Hidden from public listings.',
                    },
                  ].map((v) => {
                    const isSelected = (userProfile?.profileVisibility || 'public') === v.id;
                    const Icon = v.icon;
                    return (
                      <div
                        key={v.id}
                        onClick={async () => {
                          await updateUserProfile({ profileVisibility: v.id as ProfileVisibility });
                        }}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                          isSelected
                            ? 'bg-indigo-50/70 border-indigo-600 ring-2 ring-indigo-600 shadow-2xs'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <Icon className={`w-5 h-5 ${isSelected ? 'text-indigo-600' : 'text-slate-500'}`} />
                          {isSelected && <span className="text-xs font-bold text-indigo-600">Active</span>}
                        </div>
                        <h4 className="text-xs font-bold text-slate-900">{v.label}</h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed">{v.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* AI Writing Assistant Setting Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">AI Writing Assistant</h3>
                <p className="text-xs text-slate-500">Real-time suggestions for clarity, typos, and tone.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="space-y-1">
                <span className="text-sm font-bold text-slate-900">Real-Time Writing Assistant</span>
                <p className="text-xs text-slate-600 max-w-lg">
                  Get optional spelling, grammar, clarity, and alternative-word suggestions while typing.
                </p>
              </div>

              <button
                id="toggle-ai-assist-setting-btn"
                onClick={() => setAiWritingEnabled(!aiWritingEnabled)}
                className={`w-14 h-8 rounded-full transition-colors flex items-center p-1 cursor-pointer ${
                  aiWritingEnabled ? 'bg-emerald-600 justify-end' : 'bg-slate-300 justify-start'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-white shadow-sm" />
              </button>
            </div>
          </div>

          {/* Account Security & Danger Zone Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Account Security</h3>
                <p className="text-xs text-slate-500">Manage credentials or permanently delete account.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Password Management</h4>
                  <p className="text-xs text-slate-500">Update your account password securely.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPasswordModalOpen(true)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer"
                  >
                    Change Password
                  </button>
                  <button
                    onClick={async () => {
                      if (currentUser.email) {
                        await resetPassword(currentUser.email);
                        alert(`Password reset link sent to ${currentUser.email}`);
                      }
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-all cursor-pointer"
                  >
                    Send Reset Link
                  </button>
                </div>
              </div>

              {/* Danger Zone: Delete Account */}
              <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-rose-900">Delete Xperiens Account</h4>
                  <p className="text-xs text-rose-700">
                    Permanently delete your profile, credentials, and associated personal records.
                  </p>
                </div>
                <button
                  id="open-delete-account-modal-btn"
                  onClick={() => setDeleteAccountModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-all cursor-pointer self-start sm:self-auto shadow-2xs"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: EDIT EXPERIENCE
          ========================================== */}
      {editingExperience && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-slate-200 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Edit Experience</h3>
              <button
                onClick={() => setEditingExperience(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">Title</label>
                <input
                  type="text"
                  value={editExpTitle}
                  onChange={(e) => setEditExpTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">Category</label>
                <select
                  value={editExpCategory}
                  onChange={(e) => setEditExpCategory(e.target.value as Category)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 bg-white"
                >
                  {ALL_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">Situation</label>
                <AiWritingField
                  fieldName="situation"
                  value={editExpSituation}
                  onChange={setEditExpSituation}
                  rows={3}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">Outcome Summary</label>
                <AiWritingField
                  fieldName="outcome"
                  value={editExpOutcome}
                  onChange={setEditExpOutcome}
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">Lesson Learned</label>
                <AiWritingField
                  fieldName="lesson"
                  value={editExpLesson}
                  onChange={setEditExpLesson}
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm text-slate-900"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingExperience(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingExp}
                onClick={handleSaveExperienceEdit}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700"
              >
                {savingExp ? 'Saving...' : 'Save Updates'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: CHANGE PASSWORD
          ========================================== */}
      {passwordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Change Password</h3>
              <button
                onClick={() => setPasswordModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {passwordMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold ${
                  passwordMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {passwordMsg.text}
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-indigo-600 disabled:opacity-50"
                >
                  {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: DELETE ACCOUNT CONFIRMATION
          ========================================== */}
      {deleteAccountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-rose-200 shadow-2xl space-y-5">
            <div className="flex items-center gap-3 text-rose-600 pb-2">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">Permanently Delete Account?</h3>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-950 space-y-2 leading-relaxed">
              <p className="font-bold">
                "This permanently deletes your Xperiens account and associated personal data. This action cannot be undone."
              </p>
              <p>
                All your profile information, private solution trials, and saved records will be purged from the database.
              </p>
            </div>

            {deleteError && (
              <div className="p-3 rounded-xl bg-rose-100 text-rose-900 text-xs font-semibold">
                {deleteError}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                To confirm, type <span className="text-rose-600 font-black">DELETE</span> below:
              </label>
              <input
                id="confirm-delete-text-input"
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE to confirm"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-bold text-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteAccountModalOpen(false);
                  setDeleteConfirmText('');
                  setDeleteError(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                id="confirm-delete-account-final-btn"
                type="button"
                disabled={deleteConfirmText.trim().toUpperCase() !== 'DELETE' || isDeletingAccount}
                onClick={handleConfirmDeleteAccount}
                className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {isDeletingAccount ? 'Deleting...' : 'Delete My Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: QUICK BANNER CUSTOMIZER
          ========================================== */}
      {bannerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Customize Profile Banner</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Select a curated theme, provide an image URL, or upload from your device.</p>
                </div>
              </div>
              <button
                onClick={() => setBannerModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Active Banner Preview */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Current Banner Preview
              </span>
              <div className="h-28 w-full rounded-2xl overflow-hidden relative border border-slate-200 dark:border-slate-800 shadow-inner">
                {userProfile?.bannerURL ? (
                  <img
                    src={userProfile.bannerURL}
                    alt="Active Banner"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 flex items-center justify-center">
                    <span className="text-xs font-semibold text-slate-300">Default Gradient Banner</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-slate-950/20" />
                <div className="absolute bottom-2.5 left-3 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden shadow-sm bg-slate-800">
                    {photoURL ? (
                      <img src={photoURL} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                        {initialLetter}
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-bold text-white drop-shadow-xs">{displayName}</span>
                </div>
              </div>
            </div>

            {/* Preset Themes Grid */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Curated Banner Presets (1-Click Apply)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {BANNER_PRESETS.map((preset) => {
                  const isActive = userProfile?.bannerURL === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      disabled={isDirectUpdatingBanner}
                      onClick={() => handleDirectSelectBanner(preset.url)}
                      className={`relative h-18 rounded-2xl overflow-hidden border text-left transition-all cursor-pointer group shadow-2xs ${
                        isActive
                          ? 'ring-2 ring-indigo-600 border-indigo-600 scale-[1.02]'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-400'
                      }`}
                    >
                      <img
                        src={preset.preview}
                        alt={preset.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/25 transition-colors" />
                      <span className="absolute bottom-1.5 left-2 text-[10px] font-bold text-white drop-shadow-xs">
                        {preset.name}
                      </span>
                      {isActive && (
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Upload or Custom URL Actions */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Upload Custom Image or Paste URL
              </span>

              <div className="flex flex-col sm:flex-row items-center gap-2">
                <input
                  id="modal-custom-banner-url-input"
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={editBannerURL}
                  onChange={(e) => setEditBannerURL(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  disabled={!editBannerURL || isDirectUpdatingBanner}
                  onClick={() => handleDirectSelectBanner(editBannerURL)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer whitespace-nowrap shadow-xs"
                >
                  Apply URL
                </button>
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <label
                  htmlFor="modal-banner-file-input"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer transition-colors shadow-2xs"
                >
                  <Upload className="w-4 h-4 text-indigo-500" />
                  <span>Upload from Device</span>
                  <input
                    id="modal-banner-file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleBannerFileUpload}
                    className="hidden"
                  />
                </label>

                {userProfile?.bannerURL && (
                  <button
                    type="button"
                    disabled={isDirectUpdatingBanner}
                    onClick={() => handleDirectSelectBanner('')}
                    className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                  >
                    Reset to Default
                  </button>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setBannerModalOpen(false)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 transition-all cursor-pointer shadow-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: REPORT OUTCOME
          ========================================== */}
      {selectedSolutionForOutcome && (
        <ReportOutcomeModal
          solution={selectedSolutionForOutcome}
          isOpen={true}
          onClose={() => setSelectedSolutionForOutcome(null)}
          onSuccess={() => {
            setSelectedSolutionForOutcome(null);
            loadUserData();
          }}
        />
      )}

      {/* ==========================================
          MODAL: DELETE EXPERIENCE CONFIRMATION
          ========================================== */}
      {expToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-rose-200 dark:border-rose-900/60 shadow-2xl space-y-5">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400 pb-1">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Delete Experience?</h3>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-950 dark:text-rose-200 space-y-1.5 leading-relaxed">
              <p className="font-bold">
                "{expToDelete.title}"
              </p>
              <p>
                This will permanently remove this experience and its lessons from the Xperiens community knowledge base. This action cannot be undone.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setExpToDelete(null)}
                disabled={isDeletingExp}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingExp}
                onClick={handleConfirmDeleteExperience}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
              >
                {isDeletingExp ? (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Permanently</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
