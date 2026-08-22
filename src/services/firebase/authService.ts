import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  sendPasswordResetEmail as firebaseSendPasswordReset,
  sendEmailVerification as firebaseSendEmailVerification,
  updateProfile as firebaseUpdateProfile,
  updatePassword as firebaseUpdatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from './config';
import type { UserProfile } from '../../types';

export interface AuthResult {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  error?: string;
}

const getDefaultTimezone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
};

// Fetch User Profile directly from Firestore
export const getUserProfileDoc = async (uid: string): Promise<UserProfile | null> => {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
  } catch (e) {
    console.warn('Error fetching user profile doc:', e);
  }
  return null;
};

// Save User Profile directly to Firestore
export const saveUserProfileDoc = async (profile: UserProfile): Promise<void> => {
  if (!profile.uid) return;
  try {
    await setDoc(doc(db, 'users', profile.uid), profile, { merge: true });
  } catch (e) {
    console.warn('Error saving user profile doc:', e);
  }
};

// Sign in with Google (Standard LMS Sign-In)
export const signInWithGoogle = async (): Promise<AuthResult> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    let profile = await getUserProfileDoc(user.uid);

    if (!profile) {
      profile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'Learner',
        photoURL: user.photoURL || undefined,
        role: 'student',
        timezone: getDefaultTimezone(),
        dailyLearningTarget: 45,
        xp: 0,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
        totalActiveDays: 0,
        totalLearningMinutes: 0,
        completedCoursesCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await saveUserProfileDoc(profile);
    }

    return { user, profile };
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    return { user: null, profile: null, error: error.message || 'Failed to sign in with Google' };
  }
};

// Sign in with Email and Password
export const signInWithEmail = async (email: string, pass: string): Promise<AuthResult> => {
  try {
    const result = await signInWithEmailAndPassword(auth, email.trim(), pass);
    const user = result.user;
    let profile = await getUserProfileDoc(user.uid);

    if (!profile) {
      profile = {
        uid: user.uid,
        email: user.email || email,
        displayName: user.displayName || email.split('@')[0],
        photoURL: user.photoURL || undefined,
        role: 'student',
        timezone: getDefaultTimezone(),
        dailyLearningTarget: 45,
        xp: 0,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
        totalActiveDays: 0,
        totalLearningMinutes: 0,
        completedCoursesCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await saveUserProfileDoc(profile);
    }

    return { user, profile };
  } catch (error: any) {
    return { user: null, profile: null, error: error.message || 'Invalid email or password' };
  }
};

// Register with Email and Password
export const registerWithEmail = async (
  email: string,
  pass: string,
  name: string
): Promise<AuthResult> => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    const user = result.user;

    await firebaseUpdateProfile(user, { displayName: name.trim() });

    const newProfile: UserProfile = {
      uid: user.uid,
      email: user.email || email,
      displayName: name.trim() || email.split('@')[0],
      photoURL: user.photoURL || undefined,
      role: 'student',
      timezone: getDefaultTimezone(),
      dailyLearningTarget: 45,
      xp: 0,
      level: 1,
      currentStreak: 0,
      longestStreak: 0,
      totalActiveDays: 0,
      totalLearningMinutes: 0,
      completedCoursesCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveUserProfileDoc(newProfile);

    try {
      await firebaseSendEmailVerification(user);
    } catch (e) {
      console.warn('Could not send email verification:', e);
    }

    return { user, profile: newProfile };
  } catch (error: any) {
    return { user: null, profile: null, error: error.message || 'Registration failed' };
  }
};

// Send Password Reset
export const sendPasswordReset = async (email: string): Promise<{ success: boolean; error?: string }> => {
  try {
    await firebaseSendPasswordReset(auth, email.trim());
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Could not send password reset email' };
  }
};

export const resetPassword = sendPasswordReset;

// Change Password for Authenticated User
export const changeUserPassword = async (
  currentPass: string,
  newPass: string
): Promise<{ success: boolean; error?: string }> => {
  const currentUser = auth.currentUser;
  if (!currentUser || !currentUser.email) {
    return { success: false, error: 'User is not currently authenticated' };
  }

  try {
    const credential = EmailAuthProvider.credential(currentUser.email, currentPass);
    await reauthenticateWithCredential(currentUser, credential);
    await firebaseUpdatePassword(currentUser, newPass);
    return { success: true };
  } catch (error: any) {
    console.error('Password change error:', error);
    return { success: false, error: error.message || 'Failed to update password. Please check your current password.' };
  }
};

// Sign Out
export const logout = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
  }
};
