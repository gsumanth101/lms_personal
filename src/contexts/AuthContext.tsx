import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase/config';
import {
  signInWithGoogle as authSignInWithGoogle,
  signInWithEmail as authSignInWithEmail,
  registerWithEmail as authRegisterWithEmail,
  logout as authLogout,
  type AuthResult,
} from '../services/firebase/authService';
import { updateUserPresence } from '../services/firebase/firestoreService';
import type { UserProfile } from '../types';

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  signInWithGoogle: () => Promise<AuthResult>;
  signInWithEmail: (email: string, pass: string) => Promise<AuthResult>;
  registerWithEmail: (email: string, pass: string, name: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const SESSION_PROFILE_KEY = 'learnos_user_profile';
const SESSION_EXPIRY_KEY = 'learnos_session_expires';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// Read persisted profile from localStorage if session is still valid (< 1 day)
const getCachedSessionProfile = (): UserProfile | null => {
  try {
    const raw = localStorage.getItem(SESSION_PROFILE_KEY);
    const expires = localStorage.getItem(SESSION_EXPIRY_KEY);
    if (raw && expires && Date.now() < Number(expires)) {
      return JSON.parse(raw) as UserProfile;
    }
  } catch (e) {
    console.warn('Error reading cached session:', e);
  }
  return null;
};

const saveSessionToStorage = (profile: UserProfile) => {
  try {
    localStorage.setItem(SESSION_PROFILE_KEY, JSON.stringify(profile));
    localStorage.setItem(SESSION_EXPIRY_KEY, (Date.now() + ONE_DAY_MS).toString());
  } catch (e) {
    console.warn('Error saving session cache:', e);
  }
};

const clearSessionFromStorage = () => {
  try {
    localStorage.removeItem(SESSION_PROFILE_KEY);
    localStorage.removeItem(SESSION_EXPIRY_KEY);
  } catch (e) {
    console.warn('Error clearing session cache:', e);
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const cachedProfile = getCachedSessionProfile();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(cachedProfile);
  const [loading, setLoading] = useState<boolean>(!cachedProfile);

  // Real-Time Firebase Auth & Firestore Profile Listener
  useEffect(() => {
    let unsubscribeFirestoreDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (unsubscribeFirestoreDoc) {
        unsubscribeFirestoreDoc();
        unsubscribeFirestoreDoc = null;
      }

      if (fbUser) {
        setUser(fbUser);

        // Real-Time Firestore Snapshot Subscription on users/{uid}
        const userDocRef = doc(db, 'users', fbUser.uid);
        unsubscribeFirestoreDoc = onSnapshot(
          userDocRef,
          async (snapshot) => {
            if (snapshot.exists()) {
              const liveProfile = snapshot.data() as UserProfile;
              setUserProfile(liveProfile);
              saveSessionToStorage(liveProfile);
            } else {
              // Create initial profile doc in Firestore if missing
              const initialProfile: UserProfile = {
                uid: fbUser.uid,
                email: fbUser.email || '',
                displayName: fbUser.displayName || 'Learner',
                photoURL: fbUser.photoURL || undefined,
                role: 'student',
                xp: 0,
                level: 1,
                currentStreak: 0,
                longestStreak: 0,
                totalLearningMinutes: 0,
                completedCoursesCount: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              try {
                await setDoc(userDocRef, initialProfile, { merge: true });
                setUserProfile(initialProfile);
                saveSessionToStorage(initialProfile);
              } catch (e) {
                console.warn('Firestore setDoc user profile error:', e);
              }
            }
            setLoading(false);
          },
          (error) => {
            console.warn('Firestore user profile snapshot error:', error);
            setLoading(false);
          }
        );
      } else {
        // Only clear if the 1-day cached session has expired
        const validCache = getCachedSessionProfile();
        if (!validCache) {
          setUser(null);
          setUserProfile(null);
          clearSessionFromStorage();
        }
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeFirestoreDoc) {
        unsubscribeFirestoreDoc();
      }
    };
  }, []);

  // Update Presence timestamp on activity
  useEffect(() => {
    if (userProfile?.uid) {
      updateUserPresence(userProfile);
    }
  }, [userProfile?.uid]);

  const signInWithGoogle = async (): Promise<AuthResult> => {
    setLoading(true);
    try {
      const res = await authSignInWithGoogle();
      if (res.user && res.profile) {
        setUser(res.user);
        setUserProfile(res.profile);
        saveSessionToStorage(res.profile);
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, pass: string): Promise<AuthResult> => {
    setLoading(true);
    try {
      const res = await authSignInWithEmail(email, pass);
      if (res.user && res.profile) {
        setUser(res.user);
        setUserProfile(res.profile);
        saveSessionToStorage(res.profile);
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  const registerWithEmail = async (
    email: string,
    pass: string,
    name: string
  ): Promise<AuthResult> => {
    setLoading(true);
    try {
      const res = await authRegisterWithEmail(email, pass, name);
      if (res.user && res.profile) {
        setUser(res.user);
        setUserProfile(res.profile);
        saveSessionToStorage(res.profile);
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    clearSessionFromStorage();
    await authLogout();
    setUser(null);
    setUserProfile(null);
  };

  const updateUserProfile = async (updates: Partial<UserProfile>): Promise<void> => {
    if (!userProfile?.uid) return;

    const updated = { ...userProfile, ...updates, updatedAt: new Date().toISOString() };
    setUserProfile(updated);
    saveSessionToStorage(updated);

    try {
      await updateDoc(doc(db, 'users', userProfile.uid), {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Firestore updateDoc user profile error:', e);
    }
  };

  const isAuthenticated = Boolean(userProfile && userProfile.uid);

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        isAuthenticated,
        signInWithGoogle,
        signInWithEmail,
        registerWithEmail,
        logout,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
