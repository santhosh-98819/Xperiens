import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
} from 'firebase/firestore';
import { deleteUser, updatePassword } from 'firebase/auth';
import { db, auth } from '../lib/firebase';
import { UserProfile, Experience, SolutionAnalysis, Category, ProfileVisibility } from '../types';
import { saveLocalUser, getLocalUser } from './api';

export interface UserActivityStats {
  experiencesShared: number;
  solutionsTried: number;
  successfulOutcomes: number;
  savedSolutions: number;
}

/**
 * Fetch real activity statistics for a user from Firestore (Strictly 0 if no records)
 */
export async function fetchUserActivityStats(userId: string): Promise<UserActivityStats> {
  if (!userId || userId.startsWith('guest-')) {
    return {
      experiencesShared: 0,
      solutionsTried: 0,
      successfulOutcomes: 0,
      savedSolutions: 0,
    };
  }

  try {
    // 1. Experiences shared count
    const expQuery = query(collection(db, 'experiences'), where('userId', '==', userId));
    const expSnap = await getDocs(expQuery);
    const experiencesShared = expSnap.size;

    // 2. Outcomes / Solutions tested
    let solutionsTried = 0;
    let successfulOutcomes = 0;

    try {
      const feedbackQuery = query(collection(db, 'outcomeFeedback'), where('userId', '==', userId));
      const feedbackSnap = await getDocs(feedbackQuery);
      solutionsTried = feedbackSnap.size;

      feedbackSnap.forEach((doc) => {
        const data = doc.data();
        if (data.result === 'worked') {
          successfulOutcomes += 1;
        }
      });
    } catch (e) {
      console.warn('Outcome feedback query notice:', e);
    }

    // 3. Saved solutions count
    let savedSolutions = 0;
    try {
      const savedQuery = query(collection(db, 'savedSolutions'), where('userId', '==', userId));
      const savedSnap = await getDocs(savedQuery);
      savedSolutions = savedSnap.size;
    } catch (e) {
      console.warn('Saved solutions query notice:', e);
    }

    return {
      experiencesShared,
      solutionsTried,
      successfulOutcomes,
      savedSolutions,
    };
  } catch (err) {
    console.warn('Failed to fetch user stats from Firestore:', err);
    return {
      experiencesShared: 0,
      solutionsTried: 0,
      successfulOutcomes: 0,
      savedSolutions: 0,
    };
  }
}

/**
 * Fetch all experiences submitted by the current user
 */
export async function fetchUserExperiences(userId: string): Promise<Experience[]> {
  if (!userId || userId.startsWith('guest-')) return [];

  try {
    const q = query(
      collection(db, 'experiences'),
      where('userId', '==', userId)
    );
    const snap = await getDocs(q);
    const list: Experience[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({
        id: docSnap.id,
        userId: data.userId,
        authorName: data.authorName || 'Community Contributor',
        isAnonymous: Boolean(data.isAnonymous),
        isDemo: Boolean(data.isDemo),
        title: data.title || 'Untitled Experience',
        category: data.category || 'Other',
        situation: data.situation || '',
        actionsTaken: data.actionsTaken || [],
        whyChosen: data.whyChosen || '',
        outcome: data.outcome || '',
        outcomeStatus: data.outcomeStatus || 'worked',
        lesson: data.lesson || '',
        whatWouldChange: data.whatWouldChange || '',
        usefulCount: data.usefulCount || 0,
        notUsefulCount: data.notUsefulCount || 0,
        qualityLabel: data.qualityLabel || 'Useful Experience',
        qualityScore: data.qualityScore || 90,
        createdAt: data.createdAt || new Date().toISOString(),
        tags: data.tags || [],
      });
    });

    // Sort by createdAt descending
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  } catch (err) {
    console.warn('Error fetching user experiences from Firestore:', err);
    return [];
  }
}

/**
 * Update an experience document
 */
export async function updateUserExperience(
  expId: string,
  updates: Partial<Experience>
): Promise<boolean> {
  try {
    const ref = doc(db, 'experiences', expId);
    await updateDoc(ref, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    console.error('Error updating experience in Firestore:', err);
    throw err;
  }
}

/**
 * Delete an experience document
 */
export async function deleteUserExperience(expId: string): Promise<boolean> {
  try {
    const ref = doc(db, 'experiences', expId);
    await deleteDoc(ref);
    return true;
  } catch (err) {
    console.error('Error deleting experience in Firestore:', err);
    throw err;
  }
}

/**
 * Update User Profile document in Firestore
 */
export async function saveUserProfileToFirestore(
  userId: string,
  profileData: Partial<UserProfile>
): Promise<void> {
  try {
    const ref = doc(db, 'users', userId);
    await updateDoc(ref, {
      ...profileData,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Error saving profile to Firestore, creating if missing:', err);
    const ref = doc(db, 'users', userId);
    await setDoc(ref, {
      ...profileData,
      id: userId,
      uid: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  }
}

/**
 * Permanently delete the user's account and associated personal data from Firestore & Auth
 */
export async function deleteAccountAndData(userId: string): Promise<void> {
  const user = auth.currentUser;
  if (!user || user.uid !== userId) {
    throw new Error('Not authenticated to delete this account.');
  }

  // 1. Delete Firestore user document
  try {
    const userRef = doc(db, 'users', userId);
    await deleteDoc(userRef);
  } catch (e) {
    console.warn('User document delete notice:', e);
  }

  // 2. Delete user's private data if any
  try {
    const expQuery = query(collection(db, 'experiences'), where('userId', '==', userId));
    const expSnap = await getDocs(expQuery);
    const deletePromises = expSnap.docs.map((d) => deleteDoc(d.ref));
    await Promise.all(deletePromises);
  } catch (e) {
    console.warn('Experiences delete notice:', e);
  }

  // 3. Delete Firebase Auth user
  await deleteUser(user);
}
