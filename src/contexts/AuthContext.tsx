import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  deleteUser,
} from 'firebase/auth';
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
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';
import { UserProfile, ProfileVisibility, Category } from '../types';
import { getLocalUser, saveLocalUser } from '../services/api';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isGuest: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (name: string, email: string, pass: string, isAnonymousPref?: boolean) => Promise<void>;
  loginAsGuest: () => Promise<void>;
  loginAsLocalUser: (name: string, email?: string) => void;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  changePassword: (newPass: string) => Promise<void>;
  updateUserPreferences: (prefs: Partial<UserProfile>) => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  deleteUserAccount: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => getLocalUser());
  const [loading, setLoading] = useState(true);

  // Sync profile from Firestore or create initial record
  const fetchOrCreateProfile = async (user: User, customName?: string, isAnonPref?: boolean) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      let userSnap;
      try {
        userSnap = await getDoc(userRef);
      } catch (firestoreErr) {
        console.warn('Could not read user profile from Firestore:', firestoreErr);
        userSnap = null;
      }

      if (userSnap && userSnap.exists()) {
        const data = userSnap.data();
        const profile: UserProfile = {
          id: user.uid,
          uid: user.uid,
          name: data.displayName || data.name || (user.isAnonymous ? 'Guest Explorer' : user.displayName || 'Community Member'),
          displayName: data.displayName || data.name || user.displayName || 'Community Member',
          email: user.email || data.email || undefined,
          photoURL: data.photoURL || user.photoURL || undefined,
          bannerURL: data.bannerURL || undefined,
          about: data.about || '',
          interests: (data.interests as Category[]) || [],
          isAnonymous: data.isAnonymous !== undefined ? Boolean(data.isAnonymous) : Boolean(user.isAnonymous),
          profileVisibility: (data.profileVisibility as ProfileVisibility) || 'public',
          themePreference: data.themePreference || undefined,
          languagePreference: data.languagePreference || undefined,
          aiWritingAssistEnabled: data.aiWritingAssistEnabled !== undefined ? Boolean(data.aiWritingAssistEnabled) : true,
          onboardingCompleted: data.onboardingCompleted !== undefined ? Boolean(data.onboardingCompleted) : true,
          isGuest: user.isAnonymous,
          joinedAt: data.createdAt || new Date().toISOString(),
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
          experiencesShared: data.experiencesShared || 0,
          solutionsTested: data.solutionsTested || 0,
          peopleHelped: data.peopleHelped || 0,
          savedSolutionIds: data.savedSolutionIds || [],
        };
        setUserProfile(profile);
        saveLocalUser(profile);
      } else {
        const initialName = customName || (user.isAnonymous ? 'Guest Explorer' : user.displayName || 'Community Member');
        // Preserve any guest theme stored in localStorage
        let savedGuestTheme: any = 'system';
        try {
          savedGuestTheme = localStorage.getItem('xperiens_theme_preference') || localStorage.getItem('commonmind_theme_preference') || 'system';
        } catch {
          // ignore
        }

        const newProfileData = {
          id: user.uid,
          uid: user.uid,
          name: initialName,
          displayName: initialName,
          email: user.email || '',
          photoURL: user.photoURL || '',
          about: '',
          interests: ['Everyday Problems', 'Productivity', 'Career'],
          isAnonymous: user.isAnonymous || Boolean(isAnonPref),
          profileVisibility: 'public',
          themePreference: savedGuestTheme,
          aiWritingAssistEnabled: true,
          onboardingCompleted: true,
          displayNamePreference: isAnonPref ? 'anonymous' : 'public',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          experiencesShared: 0,
          solutionsTested: 0,
          peopleHelped: 0,
          savedSolutionIds: [],
        };
        try {
          await setDoc(userRef, newProfileData);
        } catch (setErr) {
          console.warn('Could not write user profile to Firestore:', setErr);
        }

        const profile: UserProfile = {
          id: user.uid,
          uid: user.uid,
          name: initialName,
          displayName: initialName,
          email: user.email || undefined,
          photoURL: user.photoURL || undefined,
          about: '',
          interests: newProfileData.interests as Category[],
          isAnonymous: newProfileData.isAnonymous,
          profileVisibility: 'public',
          themePreference: savedGuestTheme,
          aiWritingAssistEnabled: true,
          onboardingCompleted: true,
          isGuest: user.isAnonymous,
          joinedAt: newProfileData.createdAt,
          createdAt: newProfileData.createdAt,
          updatedAt: newProfileData.updatedAt,
          experiencesShared: 0,
          solutionsTested: 0,
          peopleHelped: 0,
          savedSolutionIds: [],
        };
        setUserProfile(profile);
        saveLocalUser(profile);
      }
    } catch (err) {
      console.warn('Firestore profile sync error:', err);
      // Fallback local memory profile so app remains responsive
      const fallbackProfile: UserProfile = {
        id: user.uid,
        uid: user.uid,
        name: customName || (user.isAnonymous ? 'Guest Explorer' : user.displayName || 'Community Member'),
        displayName: customName || user.displayName || 'Community Member',
        email: user.email || undefined,
        photoURL: user.photoURL || undefined,
        about: '',
        interests: ['Everyday Problems', 'Productivity'],
        isAnonymous: user.isAnonymous || false,
        profileVisibility: 'public',
        aiWritingAssistEnabled: true,
        onboardingCompleted: true,
        isGuest: user.isAnonymous,
        joinedAt: new Date().toISOString(),
        experiencesShared: 0,
        solutionsTested: 0,
        peopleHelped: 0,
        savedSolutionIds: [],
      };
      setUserProfile(fallbackProfile);
      saveLocalUser(fallbackProfile);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchOrCreateProfile(user);
      } else {
        const local = getLocalUser();
        if (local) {
          setUserProfile(local);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const cred = await signInWithPopup(auth, provider);
      await fetchOrCreateProfile(cred.user);
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        // User voluntarily closed the popup; return gracefully without raising disruptive error
        return;
      }
      if (err.code === 'auth/popup-blocked') {
        const customErr = new Error(
          'Google Sign-in popup was blocked by your browser. Please allow pop-ups for this site or open the app in a new browser tab.'
        );
        (customErr as any).code = err.code;
        throw customErr;
      }
      throw err;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      await fetchOrCreateProfile(cred.user);
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        const errorMsg =
          'Email/Password sign-in is not enabled in the Firebase Console. Please use "Continue with Google" or continue as a Guest.';
        const newErr = new Error(errorMsg);
        (newErr as any).code = err.code;
        throw newErr;
      }
      throw err;
    }
  };

  const signUpWithEmail = async (name: string, email: string, pass: string, isAnonymousPref = false) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      await updateProfile(cred.user, {
        displayName: isAnonymousPref ? 'Anonymous Member' : name.trim(),
      });
      await fetchOrCreateProfile(cred.user, name.trim(), isAnonymousPref);
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        const errorMsg =
          'Email/Password sign-up is not enabled in your Firebase Console. Please use "Continue with Google" or click "Continue as Guest".';
        const newErr = new Error(errorMsg);
        (newErr as any).code = err.code;
        throw newErr;
      }
      throw err;
    }
  };

  const loginAsGuest = async () => {
    try {
      const cred = await signInAnonymously(auth);
      await fetchOrCreateProfile(cred.user, 'Guest Explorer');
    } catch (err: any) {
      console.warn('Firebase anonymous auth unavailable, falling back to local guest mode:', err.message);
      const guestProfile: UserProfile = {
        id: `guest-${Date.now()}`,
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
      setUserProfile(guestProfile);
      saveLocalUser(guestProfile);
    }
  };

  const loginAsLocalUser = (name: string, email?: string) => {
    const localProfile: UserProfile = {
      id: `user-${Date.now()}`,
      name: name.trim() || 'Community Member',
      displayName: name.trim() || 'Community Member',
      email: email?.trim(),
      isAnonymous: false,
      isGuest: false,
      onboardingCompleted: true,
      joinedAt: new Date().toISOString(),
      experiencesShared: 0,
      solutionsTested: 0,
      peopleHelped: 0,
      savedSolutionIds: [],
    };
    setUserProfile(localProfile);
    saveLocalUser(localProfile);
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Sign out error:', e);
    }
    const guestUser: UserProfile = {
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
    setUserProfile(guestUser);
    saveLocalUser(guestUser);
    setCurrentUser(null);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  };

  const changePassword = async (newPass: string) => {
    if (!auth.currentUser) throw new Error('You must be logged in to change your password.');
    await updatePassword(auth.currentUser, newPass);
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (currentUser) {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const updatePayload = {
          ...data,
          updatedAt: new Date().toISOString(),
        };
        await updateDoc(userRef, updatePayload);

        // Also update Auth profile if name or photo changed
        if (data.displayName || data.name || data.photoURL !== undefined) {
          await updateProfile(currentUser, {
            displayName: data.displayName || data.name || currentUser.displayName || undefined,
            photoURL: data.photoURL || currentUser.photoURL || undefined,
          });
        }
      } catch (err) {
        console.warn('Failed to update user profile in Firestore:', err);
      }
    }

    setUserProfile((prev) => {
      const updated: UserProfile = prev
        ? {
            ...prev,
            ...data,
            name: data.displayName || data.name || prev.name,
            displayName: data.displayName || data.name || prev.displayName,
          }
        : {
            id: currentUser?.uid || `user-${Date.now()}`,
            name: data.displayName || data.name || 'Community Member',
            displayName: data.displayName || data.name || 'Community Member',
            isAnonymous: Boolean(data.isAnonymous),
            isGuest: Boolean(currentUser?.isAnonymous),
            onboardingCompleted: true,
            joinedAt: new Date().toISOString(),
            experiencesShared: 0,
            solutionsTested: 0,
            peopleHelped: 0,
            savedSolutionIds: [],
            ...data,
          };
      saveLocalUser(updated);
      return updated;
    });
  };

  const updateUserPreferences = async (prefs: Partial<UserProfile>) => {
    await updateUserProfile(prefs);
  };

  const deleteUserAccount = async () => {
    if (!currentUser) throw new Error('No user is currently logged in.');
    const uid = currentUser.uid;

    // 1. Delete Firestore documents
    try {
      const userRef = doc(db, 'users', uid);
      await deleteDoc(userRef);
    } catch (err) {
      console.warn('Error deleting user doc:', err);
    }

    // 2. Delete user's experiences
    try {
      const expQuery = query(collection(db, 'experiences'), where('userId', '==', uid));
      const expSnap = await getDocs(expQuery);
      const deleteOps = expSnap.docs.map((d) => deleteDoc(d.ref));
      await Promise.all(deleteOps);
    } catch (err) {
      console.warn('Error deleting user experiences:', err);
    }

    // 3. Delete Firebase Auth user
    await deleteUser(currentUser);

    // Reset local state
    const guestUser: UserProfile = {
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
    setUserProfile(guestUser);
    saveLocalUser(guestUser);
    setCurrentUser(null);
  };

  const refreshProfile = async () => {
    if (currentUser) {
      await fetchOrCreateProfile(currentUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        isGuest: Boolean(currentUser?.isAnonymous || userProfile?.isGuest),
        loginWithGoogle,
        loginWithEmail,
        signUpWithEmail,
        loginAsGuest,
        loginAsLocalUser,
        logout,
        resetPassword,
        changePassword,
        updateUserPreferences,
        updateUserProfile,
        deleteUserAccount,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
