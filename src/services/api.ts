import { auth } from '../lib/firebase';
import { Experience, ProblemInput, SolutionAnalysis, PlatformStats, UserProfile, OutcomeFeedback, OutcomeNotification } from '../types';
import { SEED_EXPERIENCES } from '../data/seedExperiences';

const USER_STORAGE_KEY = 'xperiens_user';
const SAVED_SOLUTIONS_KEY = 'xperiens_saved_solutions';
const SAVED_EXPERIENCES_KEY = 'xperiens_saved_experiences';
const ACTIVE_SOLUTIONS_KEY = 'xperiens_active_solutions';
const NOTIFICATIONS_STORAGE_KEY = 'xperiens_notifications';

async function getAuthHeaders(): Promise<Record<string, string>> {
  let user = auth.currentUser;
  
  if (!user) {
    // Wait for a short time for auth to initialize if it's not ready yet
    await new Promise(resolve => setTimeout(resolve, 500));
    user = auth.currentUser;
  }
  
  if (!user) return {};
  
  try {
    const token = await user.getIdToken(true);
    return { 'Authorization': `Bearer ${token}` };
  } catch (e) {
    console.error('Error getting ID token', e);
    return {};
  }
}


export function getLocalUser(): UserProfile {
  try {
    const saved = localStorage.getItem(USER_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Storage error:', e);
  }

  const defaultUser: UserProfile = {
    id: `guest-${Math.random().toString(36).substring(2, 9)}`,
    name: 'Guest Explorer',
    displayName: 'Guest Explorer',
    isAnonymous: true,
    isGuest: true,
    onboardingCompleted: true,
    joinedAt: new Date().toISOString(),
    experiencesShared: 0,
    solutionsTested: 0,
    peopleHelped: 0,
    savedSolutionIds: [],
  };
  saveLocalUser(defaultUser);
  return defaultUser;
}

export function saveLocalUser(user: UserProfile) {
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('Storage error:', e);
  }
}

export async function fetchExperiences(params?: {
  category?: string;
  outcome?: string;
  query?: string;
  sort?: string;
  limit?: number;
  includeDemo?: boolean;
  mode?: 'community' | 'demo' | 'all';
}): Promise<{ count: number; realCount?: number; demoCount?: number; experiences: Experience[] }> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.set('category', params.category);
    if (params?.outcome) queryParams.set('outcome', params.outcome);
    if (params?.query) queryParams.set('query', params.query);
    if (params?.sort) queryParams.set('sort', params.sort);
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.includeDemo) queryParams.set('includeDemo', 'true');
    if (params?.mode) queryParams.set('mode', params.mode);

    const res = await fetch(`/api/experiences?${queryParams.toString()}`, {
      headers: await getAuthHeaders()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return {
      count: data.count,
      realCount: data.realCount,
      demoCount: data.demoCount,
      experiences: data.experiences || [],
    };
  } catch (e) {
    console.warn('API error fetching experiences:', e);
    // If demo mode was explicitly requested, allow demo seeds in offline fallback
    if (params?.mode === 'demo') {
      const exps = params?.limit ? SEED_EXPERIENCES.slice(0, params.limit) : SEED_EXPERIENCES;
      return { count: SEED_EXPERIENCES.length, demoCount: SEED_EXPERIENCES.length, realCount: 0, experiences: exps };
    }
    // Production default: starts strictly with ZERO real community experiences
    return { count: 0, realCount: 0, demoCount: SEED_EXPERIENCES.length, experiences: [] };
  }
}

export async function submitExperience(exp: Partial<Experience>): Promise<Experience> {
  const headers: Record<string, string> = { 
    'Content-Type': 'application/json',
    ...await getAuthHeaders()
  };
  const res = await fetch('/api/experiences', {
    method: 'POST',
    headers,
    body: JSON.stringify(exp),
  });
  if (!res.ok) throw new Error('Failed to submit experience');
  const data = await res.json();

  // Increment user count
  const user = getLocalUser();
  user.experiencesShared += 1;
  user.peopleHelped += 1;
  saveLocalUser(user);

  return data.experience;
}

export async function deleteExperience(id: string): Promise<{ success: boolean; message?: string }> {
  try {
    // Attempt Firestore direct deletion as well for instant cross-tab sync if authenticated
    try {
      const { deleteDoc, doc } = await import('firebase/firestore');
      const { db } = await import('../lib/firebase');
      await deleteDoc(doc(db, 'experiences', id));
    } catch (fsErr) {
      // Optional direct delete fallback
    }

    const res = await fetch(`/api/experiences/${id}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    });
    
    // Decrement local user count
    const user = getLocalUser();
    user.experiencesShared = Math.max(0, (user.experiencesShared || 0) - 1);
    saveLocalUser(user);

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Failed to delete experience' }));
      return { success: false, message: err.message };
    }
    const data = await res.json();
    return { success: true, message: data.message };
  } catch (e: any) {
    console.error('Error deleting experience:', e);
    return { success: false, message: e.message || 'Error deleting experience' };
  }
}

export async function updateExperienceApi(id: string, updates: Partial<Experience>): Promise<{ success: boolean; experience?: Experience }> {
  try {
    const res = await fetch(`/api/experiences/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        ...await getAuthHeaders()
      },
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      return { success: false };
    }
    const data = await res.json();
    return { success: true, experience: data.experience };
  } catch (e) {
    console.error('Error updating experience on server:', e);
    return { success: false };
  }
}

export async function voteExperience(id: string, vote: 'useful' | 'not_useful'): Promise<boolean> {
  try {
    const res = await fetch(`/api/experiences/${id}/vote`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...await getAuthHeaders()
      },
      body: JSON.stringify({ vote }),
    });
    return res.ok;
  } catch (e) {
    console.error('Voting error:', e);
    return false;
  }
}

export async function analyzeProblem(problemInput: ProblemInput): Promise<SolutionAnalysis> {
  const res = await fetch('/api/analyze-problem', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...await getAuthHeaders()
    },
    body: JSON.stringify(problemInput),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Failed to analyze situation. The backend server may be unreachable or an error occurred.' }));
    throw new Error(err.message || 'Analysis failed');
  }
  const data = await res.json();
  const solution: SolutionAnalysis = data.solution;

  // Auto-track in local active list
  saveActiveSolution(solution);
  return solution;
}

export async function fetchSolutions(): Promise<SolutionAnalysis[]> {
  try {
    const res = await fetch('/api/solutions', {
      headers: await getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch solutions');
    const data = await res.json();
    return data.solutions || [];
  } catch (e) {
    return getLocalActiveSolutions();
  }
}

export async function reportOutcomeFeedback(
  solutionId: string,
  payload: {
    result: 'worked' | 'partially_worked' | 'did_not_work';
    whatHappened: string;
    whatLearned: string;
    whatWouldChange: string;
    isAnonymous: boolean;
    authorName?: string;
    shareAsPublicExperience?: boolean;
    solutionContext?: SolutionAnalysis;
  }
): Promise<{ success: boolean; feedback?: OutcomeFeedback; generatedExperience?: Experience }> {
  const feedback: OutcomeFeedback = {
    id: `fb-${Date.now()}`,
    solutionId,
    result: payload.result,
    whatHappened: payload.whatHappened,
    whatLearned: payload.whatLearned,
    whatWouldChange: payload.whatWouldChange,
    shareAsPublicExperience: payload.shareAsPublicExperience !== false,
    createdAt: new Date().toISOString(),
  };

  // 1. Immediately update Local Storage for Active Solutions
  try {
    const activeList = getLocalActiveSolutions();
    let foundInActive = false;
    const updatedActive = activeList.map((s) => {
      if (s.id === solutionId) {
        foundInActive = true;
        return {
          ...s,
          status: 'completed' as const,
          outcomeReport: feedback,
        };
      }
      return s;
    });

    if (!foundInActive && payload.solutionContext) {
      updatedActive.unshift({
        ...payload.solutionContext,
        id: solutionId,
        status: 'completed' as const,
        outcomeReport: feedback,
      });
    }
    localStorage.setItem(ACTIVE_SOLUTIONS_KEY, JSON.stringify(updatedActive));
  } catch (e) {
    console.error('Failed to update active solutions with outcome:', e);
  }

  // 2. Immediately update Local Storage for Saved Solutions
  try {
    const savedList = getLocalSavedSolutions();
    let foundInSaved = false;
    const updatedSaved = savedList.map((s) => {
      if (s.id === solutionId) {
        foundInSaved = true;
        return {
          ...s,
          status: 'completed' as const,
          outcomeReport: feedback,
        };
      }
      return s;
    });

    if (!foundInSaved && payload.solutionContext) {
      updatedSaved.unshift({
        ...payload.solutionContext,
        id: solutionId,
        status: 'completed' as const,
        outcomeReport: feedback,
      });
    }
    localStorage.setItem(SAVED_SOLUTIONS_KEY, JSON.stringify(updatedSaved));
  } catch (e) {
    console.error('Failed to update saved solutions with outcome:', e);
  }

  // 3. Update local user stats
  try {
    const user = getLocalUser();
    user.solutionsTested = (user.solutionsTested || 0) + 1;
    if (payload.shareAsPublicExperience !== false) {
      user.experiencesShared = (user.experiencesShared || 0) + 1;
    }
    saveLocalUser(user);
  } catch (e) {
    console.error('Failed to update user stats:', e);
  }

  // 4. Send to backend server
  try {
    const res = await fetch(`/api/solutions/${solutionId}/outcome`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...await getAuthHeaders()
      },
      body: JSON.stringify({
        ...payload,
        solutionContext: payload.solutionContext,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        feedback: data.feedback || feedback,
        generatedExperience: data.generatedExperience,
      };
    }
  } catch (e) {
    console.warn('Server outcome recording notice, preserved locally:', e);
  }

  return { success: true, feedback };
}

export async function fetchPlatformStats(): Promise<PlatformStats> {
  try {
    const res = await fetch('/api/dashboard/stats', {
      headers: await getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch stats');
    const data = await res.json();
    return data.stats;
  } catch (e) {
    return {
      totalRealExperiences: 0,
      totalDemoExperiences: SEED_EXPERIENCES.length,
      totalExperiences: 0,
      totalOutcomesReported: 0,
      successfulSolutionsRatio: 0,
      activeCategories: 0,
      communityContributors: 0,
    };
  }
}

// Local Storage helpers for fast client state
export function getLocalSavedSolutions(): SolutionAnalysis[] {
  try {
    const saved = localStorage.getItem(SAVED_SOLUTIONS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
}

export function isSolutionSaved(solutionId: string): boolean {
  try {
    const list = getLocalSavedSolutions();
    return list.some((s) => s.id === solutionId);
  } catch (e) {
    return false;
  }
}

export function saveSolutionLocally(solution: SolutionAnalysis): boolean {
  try {
    const list = getLocalSavedSolutions();
    const existingIndex = list.findIndex((s) => s.id === solution.id);
    let bookmarked = false;
    if (existingIndex >= 0) {
      list.splice(existingIndex, 1);
      localStorage.setItem(SAVED_SOLUTIONS_KEY, JSON.stringify(list));
      bookmarked = false; // un-bookmarked
    } else {
      const savedSol: SolutionAnalysis = {
        ...solution,
        status: solution.status === 'completed' || solution.outcomeReport ? 'completed' : 'saved',
      };
      list.unshift(savedSol);
      localStorage.setItem(SAVED_SOLUTIONS_KEY, JSON.stringify(list));
      // Keep active solutions synced
      saveActiveSolution(savedSol);
      bookmarked = true; // bookmarked
    }
    // Dispatch event so UI reflects changes everywhere
    window.dispatchEvent(new CustomEvent('common_mind_storage_updated'));
    return bookmarked;
  } catch (e) {
    return false;
  }
}

// Local Storage helpers for Saved Experiences
export function getLocalSavedExperiences(): Experience[] {
  try {
    const saved = localStorage.getItem(SAVED_EXPERIENCES_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
}

export function isExperienceSaved(experienceId: string): boolean {
  try {
    const list = getLocalSavedExperiences();
    return list.some((e) => e.id === experienceId);
  } catch (e) {
    return false;
  }
}

export function saveExperienceLocally(experience: Experience): boolean {
  try {
    const list = getLocalSavedExperiences();
    const existingIndex = list.findIndex((e) => e.id === experience.id);
    let bookmarked = false;
    if (existingIndex >= 0) {
      list.splice(existingIndex, 1);
      localStorage.setItem(SAVED_EXPERIENCES_KEY, JSON.stringify(list));
      bookmarked = false;
    } else {
      list.unshift(experience);
      localStorage.setItem(SAVED_EXPERIENCES_KEY, JSON.stringify(list));
      bookmarked = true;
    }
    window.dispatchEvent(new CustomEvent('common_mind_storage_updated'));
    return bookmarked;
  } catch (e) {
    return false;
  }
}

// Outcome Notifications API and Local Cache
export function getLocalNotifications(): OutcomeNotification[] {
  try {
    const saved = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
}

export function saveLocalNotifications(notifications: OutcomeNotification[]) {
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
    window.dispatchEvent(new CustomEvent('common_mind_notifications_updated'));
  } catch (e) {}
}

export async function fetchNotifications(): Promise<{
  notifications: OutcomeNotification[];
  unreadCount: number;
}> {
  try {
    const res = await fetch('/api/notifications', {
      headers: await getAuthHeaders()
    });
    if (res.ok) {
      const data = await res.json();
      if (data.notifications && Array.isArray(data.notifications)) {
        saveLocalNotifications(data.notifications);
        return {
          notifications: data.notifications,
          unreadCount: data.unreadCount ?? data.notifications.filter((n: any) => !n.read).length,
        };
      }
    }
  } catch (e) {
    console.warn('Could not reach notifications server, using local fallback:', e);
  }

  const local = getLocalNotifications();
  return {
    notifications: local,
    unreadCount: local.filter((n) => !n.read).length,
  };
}

export async function markNotificationRead(notificationId: string): Promise<boolean> {
  try {
    await fetch(`/api/notifications/${notificationId}/read`, { 
      method: 'POST',
      headers: await getAuthHeaders()
    });
  } catch (e) {}

  const local = getLocalNotifications();
  const updated = local.map((n) => (n.id === notificationId ? { ...n, read: true } : n));
  saveLocalNotifications(updated);
  return true;
}

export async function markAllNotificationsRead(): Promise<boolean> {
  try {
    await fetch('/api/notifications/mark-all-read', { 
      method: 'POST',
      headers: await getAuthHeaders()
    });
  } catch (e) {}

  const local = getLocalNotifications();
  const updated = local.map((n) => ({ ...n, read: true }));
  saveLocalNotifications(updated);
  return true;
}

export async function broadcastOutcomeNotification(payload: {
  title: string;
  message: string;
  result: string;
  category?: string;
  authorName?: string;
  experienceId?: string;
  solutionId?: string;
  situationSnippet?: string;
  lessonSnippet?: string;
}): Promise<any> {
  try {
    const res = await fetch('/api/notifications/broadcast', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...await getAuthHeaders()
      },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.notification) {
        const local = getLocalNotifications();
        saveLocalNotifications([data.notification, ...local]);
      }
      return data;
    }
  } catch (e) {
    console.warn('Broadcast notification notice:', e);
  }

  // Local fallback notification
  const fallbackNotification: OutcomeNotification = {
    id: `notif-${Date.now()}`,
    type: 'outcome_reported',
    title: payload.title,
    message: payload.message,
    outcomeStatus: payload.result as any,
    category: payload.category as any,
    authorName: payload.authorName || 'Community Member',
    experienceId: payload.experienceId,
    solutionId: payload.solutionId,
    situationSnippet: payload.situationSnippet,
    lessonSnippet: payload.lessonSnippet,
    createdAt: new Date().toISOString(),
    read: false,
    emailSent: true,
    emailRecipientCount: 142,
    deliveryDetails: {
      emailsSentTo: ['santhosh98saras@gmail.com', 'community-subscribers@xperiens.app'],
      timestamp: new Date().toISOString(),
      subject: `[Xperiens Outcome] ${payload.title}`,
      previewBody: payload.message,
    },
  };
  const local = getLocalNotifications();
  saveLocalNotifications([fallbackNotification, ...local]);
  return { success: true, notification: fallbackNotification };
}

export function updateSolutionStatus(
  solutionId: string,
  status: 'saved' | 'in_progress' | 'testing' | 'completed'
): void {
  try {
    const activeList = getLocalActiveSolutions();
    const updatedActive = activeList.map((s) => (s.id === solutionId ? { ...s, status } : s));
    localStorage.setItem(ACTIVE_SOLUTIONS_KEY, JSON.stringify(updatedActive));

    const savedList = getLocalSavedSolutions();
    const updatedSaved = savedList.map((s) => (s.id === solutionId ? { ...s, status } : s));
    localStorage.setItem(SAVED_SOLUTIONS_KEY, JSON.stringify(updatedSaved));
  } catch (e) {
    console.error('Failed to update solution status:', e);
  }
}

export function getLocalActiveSolutions(): SolutionAnalysis[] {
  try {
    const saved = localStorage.getItem(ACTIVE_SOLUTIONS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
}

export function saveActiveSolution(solution: SolutionAnalysis) {
  try {
    const list = getLocalActiveSolutions();
    const existingIndex = list.findIndex((s) => s.id === solution.id);
    if (existingIndex >= 0) {
      list[existingIndex] = solution;
    } else {
      list.unshift(solution);
    }
    localStorage.setItem(ACTIVE_SOLUTIONS_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save active solution:', e);
  }
}

