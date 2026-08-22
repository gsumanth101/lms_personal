import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from './config';
import type {
  Course,
  Lesson,
  Enrollment,
  LessonProgress,
  LearningActivity,
  ActivityType,
  Note,
  Goal,
  Task,
  ScheduleSession,
  Achievement,
  Certificate,
  UserProfile,
  QuizAttempt,
  AssignmentSubmission,
} from '../../types';

// ==========================================
// TIMEZONE & DATE UTILITIES
// ==========================================

export const getDateInTimezone = (date: Date = new Date(), timezone = 'UTC'): string => {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(date); // YYYY-MM-DD
  } catch {
    return date.toISOString().split('T')[0];
  }
};

export const getYesterdayInTimezone = (date: Date = new Date(), timezone = 'UTC'): string => {
  const yesterday = new Date(date.getTime() - 24 * 60 * 60 * 1000);
  return getDateInTimezone(yesterday, timezone);
};

// ==========================================
// 1. COURSES & LESSONS (REAL-TIME FIRESTORE)
// ==========================================

export const getAllCourses = async (): Promise<Course[]> => {
  try {
    const snap = await getDocs(collection(db, 'courses'));
    if (snap.empty) {
      return [];
    }
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Course));
  } catch (error) {
    console.error('Error fetching courses from Firestore:', error);
    return [];
  }
};

export const subscribeToCourses = (callback: (courses: Course[]) => void) => {
  try {
    const q = collection(db, 'courses');
    return onSnapshot(
      q,
      (snap) => {
        if (snap.empty) {
          callback([]);
          return;
        }
        const courses = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Course));
        callback(courses);
      },
      (err) => {
        console.warn('Firestore courses subscription error:', err);
        callback([]);
      }
    );
  } catch {
    callback([]);
    return () => {};
  }
};

export const getCourseById = async (courseId: string): Promise<Course | null> => {
  try {
    const snap = await getDoc(doc(db, 'courses', courseId));
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Course;
    }
  } catch (e) {
    console.warn('Error getting course doc:', e);
  }
  return null;
};

export const getLessonsForCourse = async (courseId: string): Promise<Lesson[]> => {
  try {
    const snap = await getDocs(collection(db, `courses/${courseId}/lessons`));
    if (snap.empty) {
      return [];
    }

    const all = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Lesson));
    const seen = new Map<string, Lesson>();

    for (const l of all) {
      const key = l.driveFileId || l.title;
      if (!seen.has(key)) {
        seen.set(key, l);
      } else if (l.id.match(new RegExp(`^${courseId}_lesson_\\d+$`))) {
        // Prefer clean ID e.g. courseId_lesson_X over long slug IDs
        seen.set(key, l);
      }
    }


    return Array.from(seen.values()).sort((a, b) => a.order - b.order);
  } catch (error) {
    console.error(`Error fetching lessons for course ${courseId}:`, error);
    return [];
  }
};


export const saveDiscoveredDriveCoursesToFirestore = async (
  courses: Course[],
  lessonsByCourse: Record<string, Lesson[]>
): Promise<{ savedCourses: number; savedLessons: number }> => {
  let savedCourses = 0;
  let savedLessons = 0;

  for (const course of courses) {
    const courseLessons = lessonsByCourse[course.id] || course.lessons || [];

    try {
      await setDoc(doc(db, 'courses', course.id), course, { merge: true });
      savedCourses++;

      for (const lesson of courseLessons) {
        await setDoc(doc(db, `courses/${course.id}/lessons`, lesson.id), lesson, { merge: true });
        savedLessons++;
      }
    } catch (e) {
      console.warn(`Error writing course ${course.id} to Firestore:`, e);
    }
  }

  return { savedCourses, savedLessons };
};

// ==========================================
// 2. LEARNING ACTIVITIES & REAL STREAK ENGINE
// ==========================================

export const recordLearningActivity = async (
  userId: string,
  activityData: {
    activityType: ActivityType;
    courseId?: string;
    courseTitle?: string;
    lessonId?: string;
    lessonTitle?: string;
    durationMinutes?: number;
    metadata?: Record<string, any>;
  }
): Promise<LearningActivity | null> => {
  if (!userId) return null;

  try {
    // 1. Fetch current user profile
    const userDocRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userDocRef);
    let userProfile: UserProfile = userSnap.exists()
      ? (userSnap.data() as UserProfile)
      : {
          uid: userId,
          displayName: 'Learner',
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

    const timezone = userProfile.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    const now = new Date();
    const todayDate = getDateInTimezone(now, timezone);
    const yesterdayDate = getYesterdayInTimezone(now, timezone);

    // 2. Calculate streak updates based on calendar days in user's timezone
    let currentStreak = userProfile.currentStreak || 0;
    let totalActiveDays = userProfile.totalActiveDays || 0;
    const lastActive = userProfile.lastActivityDate;

    if (!lastActive) {
      // First ever activity
      currentStreak = 1;
      totalActiveDays = 1;
    } else if (lastActive === todayDate) {
      // Already active today, streak is maintained
      if (currentStreak === 0) currentStreak = 1;
    } else if (lastActive === yesterdayDate) {
      // Active yesterday, increment streak
      currentStreak += 1;
      totalActiveDays += 1;
    } else {
      // Missed at least one day, reset streak to 1
      currentStreak = 1;
      totalActiveDays += 1;
    }

    const longestStreak = Math.max(userProfile.longestStreak || 0, currentStreak);
    const addedMinutes = Math.round(activityData.durationMinutes || 5);
    const totalLearningMinutes = (userProfile.totalLearningMinutes || 0) + addedMinutes;

    // XP allocation by activity type
    let xpGain = 10;
    if (activityData.activityType === 'LESSON_COMPLETED') xpGain = 100;
    else if (activityData.activityType === 'COURSE_COMPLETED') xpGain = 500;
    else if (activityData.activityType === 'QUIZ_COMPLETED') xpGain = 80;
    else if (activityData.activityType === 'PRACTICE_COMPLETED') xpGain = 50;
    else if (activityData.activityType === 'ASSIGNMENT_SUBMITTED') xpGain = 150;

    const newXp = (userProfile.xp || 0) + xpGain;
    const newLevel = Math.max(1, Math.floor(newXp / 500) + 1);

    // 3. Save activity record in users/{userId}/activities
    const activityId = `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const activityRecord: LearningActivity = {
      id: activityId,
      userId,
      activityType: activityData.activityType,
      courseId: activityData.courseId,
      courseTitle: activityData.courseTitle,
      lessonId: activityData.lessonId,
      lessonTitle: activityData.lessonTitle,
      durationMinutes: addedMinutes,
      metadata: activityData.metadata,
      timestamp: now.toISOString(),
      date: todayDate,
      timezone,
    };

    await setDoc(doc(db, `users/${userId}/activities`, activityId), activityRecord);

    // 4. Update user profile document in Firestore
    const updatedProfile: Partial<UserProfile> = {
      currentStreak,
      longestStreak,
      totalActiveDays,
      totalLearningMinutes,
      lastActivityDate: todayDate,
      xp: newXp,
      level: newLevel,
      updatedAt: now.toISOString(),
    };

    await setDoc(userDocRef, updatedProfile, { merge: true });

    return activityRecord;
  } catch (e) {
    console.warn('Error recording learning activity:', e);
    return null;
  }
};

export const getUserActivities = async (userId: string, limitCount = 100): Promise<LearningActivity[]> => {
  if (!userId) return [];
  try {
    const q = query(
      collection(db, `users/${userId}/activities`),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    if (snap.empty) return [];
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as LearningActivity));
  } catch (e) {
    console.warn('Error fetching user activities:', e);
    return [];
  }
};

export const getUserWeeklyStudyHours = async (
  userId: string,
  timezone: string = 'UTC'
): Promise<Array<{ day: string; date: string; hours: number }>> => {
  if (!userId) return [];

  try {
    const activities = await getUserActivities(userId, 200);
    const dayMap: Record<string, number> = {};

    // Get dates for past 7 days
    const result: Array<{ day: string; date: string; hours: number }> = [];
    const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = getDateInTimezone(d, timezone);
      const dayName = DAYS_SHORT[d.getDay()];
      dayMap[dateStr] = 0;
      result.push({ day: dayName, date: dateStr, hours: 0 });
    }

    activities.forEach((act) => {
      if (act.date && dayMap[act.date] !== undefined) {
        dayMap[act.date] += act.durationMinutes || 0;
      }
    });

    return result.map((r) => ({
      ...r,
      hours: Math.round(((dayMap[r.date] || 0) / 60) * 10) / 10,
    }));
  } catch (e) {
    console.warn('Error computing weekly study hours:', e);
    return [];
  }
};

export const getUserActivityHeatmapData = async (
  userId: string
): Promise<Record<string, number>> => {
  if (!userId) return {};
  try {
    const activities = await getUserActivities(userId, 500);
    const map: Record<string, number> = {};

    activities.forEach((act) => {
      if (act.date) {
        map[act.date] = (map[act.date] || 0) + 1;
      }
    });

    return map;
  } catch (e) {
    console.warn('Error fetching heatmap activity:', e);
    return {};
  }
};

// ==========================================
// 3. ENROLLMENTS & REAL-TIME PROGRESS
// ==========================================

export const getUserEnrollments = async (userId: string): Promise<Enrollment[]> => {
  if (!userId) return [];
  try {
    const snap = await getDocs(collection(db, `users/${userId}/enrollments`));
    if (snap.empty) return [];
    return snap.docs.map((d) => ({ ...d.data() } as Enrollment));
  } catch (e) {
    console.warn('Error fetching enrollments:', e);
    return [];
  }
};

export const subscribeToUserEnrollments = (
  userId: string,
  callback: (enrollments: Record<string, Enrollment>) => void
) => {
  if (!userId) {
    callback({});
    return () => {};
  }

  try {
    const q = collection(db, `users/${userId}/enrollments`);
    return onSnapshot(
      q,
      (snap) => {
        const map: Record<string, Enrollment> = {};
        snap.docs.forEach((d) => {
          const e = d.data() as Enrollment;
          map[e.courseId] = e;
        });
        callback(map);
      },
      (err) => {
        console.warn('Firestore enrollment snapshot error:', err);
      }
    );
  } catch {
    return () => {};
  }
};

export const subscribeToUserProgress = (
  userId: string,
  callback: (progressMap: Record<string, LessonProgress>) => void
) => {
  if (!userId) {
    callback({});
    return () => {};
  }

  try {
    const q = collection(db, `users/${userId}/progress`);
    return onSnapshot(
      q,
      (snap) => {
        const map: Record<string, LessonProgress> = {};
        snap.docs.forEach((d) => {
          const p = d.data() as LessonProgress;
          map[p.lessonId] = p;
        });
        callback(map);
      },
      (err) => {
        console.warn('Firestore progress snapshot error:', err);
      }
    );
  } catch {
    return () => {};
  }
};

export const enrollInCourse = async (
  userId: string,
  courseId: string,
  totalLessons: number
): Promise<Enrollment> => {
  const now = new Date().toISOString();
  const enrollDocRef = doc(db, `users/${userId}/enrollments`, courseId);

  // Return existing if already enrolled
  try {
    const existing = await getDoc(enrollDocRef);
    if (existing.exists()) {
      return existing.data() as Enrollment;
    }
  } catch {}

  const enrollment: Enrollment = {
    courseId,
    userId,
    startedAt: now,
    lastAccessedAt: now,
    progress: 0,
    completedLessons: [],
    totalLessons: totalLessons || 1,
    completed: false,
  };

  try {
    await setDoc(enrollDocRef, enrollment, { merge: true });
    await recordLearningActivity(userId, {
      activityType: 'LESSON_STARTED',
      courseId,
      durationMinutes: 5,
    });
  } catch (e) {
    console.warn('Firestore enroll write:', e);
  }

  return enrollment;
};

export const getLessonProgress = async (
  userId: string,
  courseId: string,
  lessonId: string
): Promise<LessonProgress | null> => {
  if (!userId) return null;
  try {
    const snap = await getDoc(doc(db, `users/${userId}/progress`, `${courseId}_${lessonId}`));
    if (snap.exists()) {
      return snap.data() as LessonProgress;
    }
  } catch (e) {
    console.warn('Error getting lesson progress doc:', e);
  }
  return null;
};

export const saveLessonProgress = async (
  userId: string,
  courseId: string,
  lessonId: string,
  watchTime: number,
  duration: number,
  forceComplete?: boolean,
  forceUncomplete?: boolean,
  courseTitle?: string,
  lessonTitle?: string
): Promise<{ progress: LessonProgress; enrollment: Enrollment | null; courseJustCompleted: boolean }> => {
  let enrollment: Enrollment | null = null;
  let courseJustCompleted = false;
  let progressRecord: LessonProgress = {
    courseId,
    lessonId,
    userId,
    watchTime: Math.round(watchTime),
    duration: Math.round(duration),
    percentage: 0,
    completed: false,
    lastWatchedAt: new Date().toISOString(),
  };

  try {
    // 1. Fetch existing lesson progress to check prior completion state
    const progDocRef = doc(db, `users/${userId}/progress`, `${courseId}_${lessonId}`);
    const existingProgSnap = await getDoc(progDocRef);
    const wasAlreadyCompleted = existingProgSnap.exists() && Boolean(existingProgSnap.data()?.completed);

    const percentage = duration > 0 ? Math.min(100, Math.round((watchTime / duration) * 100)) : 0;
    const isCompleted = forceUncomplete
      ? false
      : (forceComplete || percentage >= 90 || wasAlreadyCompleted);

    progressRecord = {
      courseId,
      lessonId,
      userId,
      watchTime: Math.round(watchTime),
      duration: Math.round(duration),
      percentage: isCompleted ? 100 : percentage,
      completed: isCompleted,
      lastWatchedAt: new Date().toISOString(),
      completedAt: isCompleted ? (existingProgSnap.data()?.completedAt || new Date().toISOString()) : undefined,
    };

    // Save progress under users/{uid}/progress/{courseId_lessonId}
    await setDoc(progDocRef, progressRecord, { merge: true });


    // 2. Query true total lessons for course
    let actualTotalLessons = 30;
    try {
      const courseDoc = await getDoc(doc(db, 'courses', courseId));
      if (courseDoc.exists()) {
        actualTotalLessons = courseDoc.data()?.totalLessons || 30;
      }
    } catch {}

    // 3. Fetch existing enrollment
    const enrollDocRef = doc(db, `users/${userId}/enrollments`, courseId);
    const enrollSnap = await getDoc(enrollDocRef);

    let currentEnroll: Enrollment;
    if (enrollSnap.exists()) {
      currentEnroll = enrollSnap.data() as Enrollment;
    } else {
      currentEnroll = {
        courseId,
        userId,
        startedAt: new Date().toISOString(),
        lastAccessedAt: new Date().toISOString(),
        progress: 0,
        completedLessons: [],
        totalLessons: actualTotalLessons,
        completed: false,
      };
    }

    const completedSet = new Set(currentEnroll.completedLessons || []);

    if (isCompleted) {
      completedSet.add(lessonId);
    } else if (forceUncomplete) {
      completedSet.delete(lessonId);
    }


    const completedArray = Array.from(completedSet);
    const effectiveTotal = currentEnroll.totalLessons || actualTotalLessons || 1;
    const overallProgress = effectiveTotal > 0
      ? Math.min(100, Math.round((completedArray.length / effectiveTotal) * 100))
      : 0;

    const isFullyCompleted = overallProgress >= 100;
    if (isFullyCompleted && !currentEnroll.completed) {
      courseJustCompleted = true;
    }

    enrollment = {
      ...currentEnroll,
      totalLessons: effectiveTotal,
      progress: overallProgress,
      completedLessons: completedArray,
      completed: isFullyCompleted,
      completedAt: isFullyCompleted ? currentEnroll.completedAt || new Date().toISOString() : undefined,
      lastAccessedAt: new Date().toISOString(),
    };

    // 4. Save updated enrollment
    await setDoc(enrollDocRef, enrollment, { merge: true });

    // 5. Record activity and update streak on qualifying progress
    if (isCompleted && !wasAlreadyCompleted) {
      const durationMins = Math.max(1, Math.round((duration || 1800) / 60));
      await recordLearningActivity(userId, {
        activityType: 'LESSON_COMPLETED',
        courseId,
        courseTitle,
        lessonId,
        lessonTitle,
        durationMinutes: durationMins,
      });

      // Auto update linked goals
      await updateCourseLinkedGoals(userId, courseId, overallProgress);
    } else if (watchTime > 30) {
      // Periodic watch activity
      await recordLearningActivity(userId, {
        activityType: 'VIDEO_WATCHED',
        courseId,
        courseTitle,
        lessonId,
        lessonTitle,
        durationMinutes: Math.round(watchTime / 60) || 1,
      });
    }
  } catch (e) {
    console.warn('Firestore progress write error:', e);
  }

  return { progress: progressRecord, enrollment, courseJustCompleted };
};

// Mark entire course completed (all lessons)
export const markEntireCourseComplete = async (
  userId: string,
  courseId: string,
  lessons: Lesson[],
  courseTitle?: string
): Promise<Enrollment> => {
  const now = new Date().toISOString();
  const allLessonIds = lessons.map((l) => l.id);

  // Batch progress write for all lessons
  for (const l of lessons) {
    const prog: LessonProgress = {
      courseId,
      lessonId: l.id,
      userId,
      watchTime: l.duration || 1800,
      duration: l.duration || 1800,
      percentage: 100,
      completed: true,
      lastWatchedAt: now,
      completedAt: now,
    };
    try {
      await setDoc(doc(db, `users/${userId}/progress`, `${courseId}_${l.id}`), prog, { merge: true });
    } catch {}
  }

  const enrollment: Enrollment = {
    courseId,
    userId,
    startedAt: now,
    lastAccessedAt: now,
    progress: 100,
    completedLessons: allLessonIds,
    totalLessons: lessons.length || 1,
    completed: true,
    completedAt: now,
  };

  try {
    await setDoc(doc(db, `users/${userId}/enrollments`, courseId), enrollment, { merge: true });
    await recordLearningActivity(userId, {
      activityType: 'COURSE_COMPLETED',
      courseId,
      courseTitle,
      durationMinutes: 30,
    });
    await updateCourseLinkedGoals(userId, courseId, 100);
  } catch (e) {
    console.warn('Firestore mark course complete error:', e);
  }

  return enrollment;
};

// ==========================================
// 4. USER PRESENCE
// ==========================================

export const updateUserPresence = async (userProfile: UserProfile): Promise<void> => {
  if (!userProfile?.uid) return;

  try {
    const presenceRef = doc(db, 'presence', userProfile.uid);
    await setDoc(
      presenceRef,
      {
        uid: userProfile.uid,
        displayName: userProfile.displayName || 'Learner',
        photoURL: userProfile.photoURL || null,
        email: userProfile.email || '',
        xp: userProfile.xp || 0,
        level: userProfile.level || 1,
        lastActive: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (e) {
    console.warn('Presence update error:', e);
  }
};

export const subscribeToActiveLearners = (callback: (learners: UserProfile[]) => void) => {
  try {
    const q = collection(db, 'presence');
    return onSnapshot(
      q,
      (snap) => {
        if (snap.empty) {
          callback([]);
          return;
        }
        const learners = snap.docs.map((d) => d.data() as UserProfile);
        callback(learners);
      },
      (err) => {
        console.warn('Presence listener fallback:', err);
        callback([]);
      }
    );
  } catch {
    return () => {};
  }
};

// ==========================================
// 5. USER NOTES (REAL-TIME FIRESTORE)
// ==========================================

export const getUserNotes = async (userId: string): Promise<Note[]> => {
  if (!userId) return [];
  try {
    const snap = await getDocs(collection(db, `users/${userId}/notes`));
    if (snap.empty) return [];
    const notes = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Note));
    notes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return notes;
  } catch (e) {
    console.warn('Error fetching notes from Firestore:', e);
    return [];
  }
};

export const subscribeToUserNotes = (userId: string, callback: (notes: Note[]) => void) => {
  if (!userId) {
    callback([]);
    return () => {};
  }

  try {
    const q = collection(db, `users/${userId}/notes`);
    return onSnapshot(
      q,
      (snap) => {
        const notes = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Note));
        notes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        callback(notes);
      },
      (err) => console.warn('Notes snapshot error:', err)
    );
  } catch {
    return () => {};
  }
};

export const saveUserNote = async (
  userId: string,
  note: Partial<Note> & { title: string; content: string }
): Promise<Note> => {
  const now = new Date().toISOString();
  const noteId = note.id || `note_${Date.now()}`;

  const savedNote: Note = {
    id: noteId,
    userId,
    title: note.title,
    content: note.content,
    courseId: note.courseId,
    courseTitle: note.courseTitle,
    lessonId: note.lessonId,
    lessonTitle: note.lessonTitle,
    videoTimestamp: note.videoTimestamp,
    tags: note.tags || ['General'],
    isPinned: note.isPinned || false,
    createdAt: note.createdAt || now,
    updatedAt: now,
  };

  try {
    await setDoc(doc(db, `users/${userId}/notes`, noteId), savedNote, { merge: true });
  } catch (e) {
    console.warn('Firestore note write error:', e);
  }

  return savedNote;
};

export const deleteUserNote = async (userId: string, noteId: string): Promise<void> => {
  if (!userId || !noteId) return;
  try {
    await deleteDoc(doc(db, `users/${userId}/notes`, noteId));
  } catch (e) {
    console.warn('Firestore note delete error:', e);
  }
};

// ==========================================
// 6. USER GOALS (AUTO-SYNC & CRUD)
// ==========================================

export const getUserGoals = async (userId: string): Promise<Goal[]> => {
  if (!userId) return [];
  try {
    const snap = await getDocs(collection(db, `users/${userId}/goals`));
    if (snap.empty) return [];
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Goal));
  } catch (e) {
    console.warn('Error fetching goals:', e);
    return [];
  }
};

export const saveUserGoal = async (
  userId: string,
  goal: Partial<Goal> & { title: string; type: Goal['type'] }
): Promise<Goal> => {
  const now = new Date().toISOString();
  const goalId = goal.id || `goal_${Date.now()}`;

  const saved: Goal = {
    id: goalId,
    userId,
    title: goal.title,
    description: goal.description,
    type: goal.type,
    targetMinutes: goal.targetMinutes || 60,
    currentMinutes: goal.currentMinutes || 0,
    courseId: goal.courseId,
    courseTitle: goal.courseTitle,
    progress: goal.progress || 0,
    completed: goal.completed || false,
    deadline: goal.deadline,
    targetDate: goal.targetDate,
    milestones: goal.milestones || [],
    createdAt: goal.createdAt || now,
    updatedAt: now,
  };

  try {
    await setDoc(doc(db, `users/${userId}/goals`, goalId), saved, { merge: true });
  } catch (e) {
    console.warn('Firestore goal save error:', e);
  }

  return saved;
};

export const subscribeToUserGoals = (userId: string, callback: (goals: Goal[]) => void) => {
  if (!userId) {
    callback([]);
    return () => {};
  }

  try {
    const q = collection(db, `users/${userId}/goals`);
    return onSnapshot(
      q,
      (snap) => {
        if (snap.empty) {
          callback([]);
          return;
        }
        const goals = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Goal));
        goals.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        callback(goals);
      },
      (err) => {
        console.warn('Goals subscription fallback:', err);
        callback([]);
      }
    );
  } catch {
    return () => {};
  }
};

export const deleteUserGoal = async (userId: string, goalId: string): Promise<void> => {
  if (!userId || !goalId) return;
  try {
    await deleteDoc(doc(db, `users/${userId}/goals`, goalId));
  } catch (e) {
    console.warn('Firestore delete goal error:', e);
  }
};


export const updateCourseLinkedGoals = async (
  userId: string,
  courseId: string,
  courseProgress: number
): Promise<void> => {
  try {
    const goals = await getUserGoals(userId);
    const linkedGoals = goals.filter((g) => g.courseId === courseId);

    for (const g of linkedGoals) {
      await saveUserGoal(userId, {
        ...g,
        progress: courseProgress,
        completed: courseProgress >= 100,
      });
    }
  } catch (e) {
    console.warn('Error auto-updating course goals:', e);
  }
};

// ==========================================
// 7. USER TASKS (KANBAN & CRUD)
// ==========================================

export const getUserTasks = async (userId: string): Promise<Task[]> => {
  if (!userId) return [];
  try {
    const snap = await getDocs(collection(db, `users/${userId}/tasks`));
    if (snap.empty) return [];
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Task));
  } catch (e) {
    console.warn('Error fetching tasks:', e);
    return [];
  }
};

export const saveUserTask = async (
  userId: string,
  task: Partial<Task> & { title: string }
): Promise<Task> => {
  const now = new Date().toISOString();
  const taskId = task.id || `task_${Date.now()}`;

  const saved: Task = {
    id: taskId,
    userId,
    title: task.title,
    priority: task.priority || 'medium',
    status: task.status || 'todo',
    dueDate: task.dueDate,
    estimatedMinutes: task.estimatedMinutes || 25,
    courseId: task.courseId,
    courseTitle: task.courseTitle,
    lessonId: task.lessonId,
    completedAt: task.status === 'completed' ? now : undefined,
    createdAt: task.createdAt || now,
    updatedAt: now,
  };

  try {
    await setDoc(doc(db, `users/${userId}/tasks`, taskId), saved, { merge: true });
  } catch (e) {
    console.warn('Firestore task save error:', e);
  }

  return saved;
};

export const deleteUserTask = async (userId: string, taskId: string): Promise<void> => {
  if (!userId || !taskId) return;
  try {
    await deleteDoc(doc(db, `users/${userId}/tasks`, taskId));
  } catch (e) {
    console.warn('Firestore task delete error:', e);
  }
};

export const subscribeToUserTasks = (userId: string, callback: (tasks: Task[]) => void) => {
  if (!userId) {
    callback([]);
    return () => {};
  }
  try {
    const q = collection(db, `users/${userId}/tasks`);
    return onSnapshot(
      q,
      (snap) => {
        if (snap.empty) {
          callback([]);
          return;
        }
        const tasks = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Task));
        callback(tasks);
      },
      (err) => {
        console.warn('Tasks subscription fallback:', err);
        callback([]);
      }
    );
  } catch {
    return () => {};
  }
};

// ==========================================
// 8. SCHEDULE & CALENDAR PLANNER
// ==========================================

export const getUserSchedule = async (userId: string): Promise<ScheduleSession[]> => {
  if (!userId) return [];
  try {
    const snap = await getDocs(collection(db, `users/${userId}/schedules`));
    if (snap.empty) return [];
    const sessions = snap.docs.map((d) => ({ id: d.id, ...d.data() } as ScheduleSession));
    sessions.sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
    return sessions;
  } catch (e) {
    console.warn('Error fetching schedules:', e);
    return [];
  }
};

export const subscribeToUserSchedule = (userId: string, callback: (sessions: ScheduleSession[]) => void) => {
  if (!userId) {
    callback([]);
    return () => {};
  }
  try {
    const q = collection(db, `users/${userId}/schedules`);
    return onSnapshot(
      q,
      (snap) => {
        if (snap.empty) {
          callback([]);
          return;
        }
        const sessions = snap.docs.map((d) => ({ id: d.id, ...d.data() } as ScheduleSession));
        sessions.sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
        callback(sessions);
      },
      (err) => {
        console.warn('Schedule subscription fallback:', err);
        callback([]);
      }
    );
  } catch {
    return () => {};
  }
};

export const saveScheduleSession = async (
  userId: string,
  session: Partial<ScheduleSession> & { title: string; date: string; startTime: string; endTime: string }
): Promise<ScheduleSession> => {
  const sessId = session.id || `sess_${Date.now()}`;

  const saved: ScheduleSession = {
    id: sessId,
    userId,
    title: session.title,
    courseId: session.courseId,
    courseTitle: session.courseTitle,
    lessonId: session.lessonId,
    lessonTitle: session.lessonTitle,
    date: session.date,
    startTime: session.startTime,
    endTime: session.endTime,
    durationMinutes: session.durationMinutes || 45,
    dayOfWeek: session.dayOfWeek,
    type: session.type || 'Lecture',
    color: session.color || '#4648d4',
    priority: session.priority || 'medium',
    notes: session.notes,
    completed: session.completed || false,
    recurring: session.recurring || 'none',
    createdAt: session.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, `users/${userId}/schedules`, sessId), saved, { merge: true });
  } catch (e) {
    console.warn('Firestore schedule save error:', e);
  }

  return saved;
};

export const deleteScheduleSession = async (userId: string, sessionId: string): Promise<void> => {
  if (!userId || !sessionId) return;
  try {
    await deleteDoc(doc(db, `users/${userId}/schedules`, sessionId));
  } catch (e) {
    console.warn('Firestore delete schedule session error:', e);
  }
};

// ==========================================
// 9. QUIZ ATTEMPTS & PERSISTENCE
// ==========================================

export const saveQuizAttempt = async (
  userId: string,
  attempt: Omit<QuizAttempt, 'id' | 'userId'>
): Promise<QuizAttempt> => {
  const attemptId = `quiz_att_${Date.now()}`;
  const record: QuizAttempt = {
    id: attemptId,
    userId,
    ...attempt,
  };

  try {
    await setDoc(doc(db, `users/${userId}/quiz_attempts`, attemptId), record);

    if (attempt.passed) {
      await recordLearningActivity(userId, {
        activityType: 'QUIZ_COMPLETED',
        courseId: attempt.courseId,
        courseTitle: attempt.quizTitle,
        durationMinutes: Math.round(attempt.timeSpentSeconds / 60) || 10,
        metadata: { score: attempt.score, percentage: attempt.percentage },
      });
    }
  } catch (e) {
    console.warn('Firestore quiz attempt write error:', e);
  }

  return record;
};

export const getUserQuizAttempts = async (userId: string): Promise<QuizAttempt[]> => {
  if (!userId) return [];
  try {
    const snap = await getDocs(collection(db, `users/${userId}/quiz_attempts`));
    if (snap.empty) return [];
    const attempts = snap.docs.map((d) => ({ id: d.id, ...d.data() } as QuizAttempt));
    attempts.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
    return attempts;
  } catch (e) {
    console.warn('Error fetching quiz attempts:', e);
    return [];
  }
};

// ==========================================
// 10. ASSIGNMENTS & PROJECT SUBMISSIONS
// ==========================================

export const saveAssignmentSubmission = async (
  userId: string,
  sub: Omit<AssignmentSubmission, 'id' | 'userId'>
): Promise<AssignmentSubmission> => {
  const subId = `asg_sub_${Date.now()}`;
  const record: AssignmentSubmission = {
    id: subId,
    userId,
    ...sub,
  };

  try {
    await setDoc(doc(db, `users/${userId}/assignments`, subId), record);

    await recordLearningActivity(userId, {
      activityType: 'ASSIGNMENT_SUBMITTED',
      courseId: sub.courseId,
      durationMinutes: 30,
      metadata: { githubUrl: sub.githubUrl },
    });
  } catch (e) {
    console.warn('Firestore assignment submission write error:', e);
  }

  return record;
};

export const getUserAssignments = async (userId: string): Promise<AssignmentSubmission[]> => {
  if (!userId) return [];
  try {
    const snap = await getDocs(collection(db, `users/${userId}/assignments`));
    if (snap.empty) return [];
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AssignmentSubmission));
  } catch (e) {
    console.warn('Error fetching user assignments:', e);
    return [];
  }
};

// ==========================================
// 11. REAL ACHIEVEMENTS & GAMIFICATION
// ==========================================

export const computeUserAchievements = (
  userProfile: UserProfile | null,
  enrollments: Record<string, Enrollment>,
  quizAttempts: QuizAttempt[] = []
): Achievement[] => {
  const enrollList = Object.values(enrollments);
  const completedCourses = enrollList.filter((e) => e.completed);
  const totalCompletedLessons = enrollList.reduce((acc, e) => acc + (e.completedLessons?.length || 0), 0);
  const streak = userProfile?.currentStreak || 0;
  const passedQuizzes = quizAttempts.filter((q) => q.passed);
  const totalMinutes = userProfile?.totalLearningMinutes || 0;

  return [
    {
      id: 'ach_first_lesson',
      code: 'FIRST_LESSON',
      title: 'First Step',
      description: 'Completed your very first video lesson on LearnOS.',
      icon: 'play_circle',
      xp: 100,
      category: 'course',
      unlocked: totalCompletedLessons >= 1,
      progress: Math.min(1, totalCompletedLessons),
      maxProgress: 1,
    },
    {
      id: 'ach_streak_3',
      code: '3_DAY_STREAK',
      title: 'Momentum Builder',
      description: 'Maintained an active 3-day learning streak.',
      icon: 'local_fire_department',
      xp: 150,
      category: 'streak',
      unlocked: streak >= 3,
      progress: Math.min(3, streak),
      maxProgress: 3,
    },
    {
      id: 'ach_streak_7',
      code: '7_DAY_STREAK',
      title: 'Consistency Champion',
      description: 'Maintained an unbroken 7-day learning streak.',
      icon: 'bolt',
      xp: 300,
      category: 'streak',
      unlocked: streak >= 7,
      progress: Math.min(7, streak),
      maxProgress: 7,
    },
    {
      id: 'ach_quiz_passed',
      code: 'QUIZ_MASTER',
      title: 'Diagnostic Ace',
      description: 'Passed a technical concept quiz with an 80%+ score.',
      icon: 'psychology',
      xp: 200,
      category: 'quiz',
      unlocked: passedQuizzes.length >= 1,
      progress: Math.min(1, passedQuizzes.length),
      maxProgress: 1,
    },
    {
      id: 'ach_ten_hours',
      code: '10_HOURS_LEARNED',
      title: 'Deep Focus',
      description: 'Logged over 10 hours (600 minutes) of active study time.',
      icon: 'timer',
      xp: 350,
      category: 'productivity',
      unlocked: totalMinutes >= 600,
      progress: Math.min(600, totalMinutes),
      maxProgress: 600,
    },
    {
      id: 'ach_first_course',
      code: 'FIRST_COURSE',
      title: 'Course Graduate',
      description: 'Finished 100% of the lessons in a full course.',
      icon: 'emoji_events',
      xp: 500,
      category: 'course',
      unlocked: completedCourses.length >= 1,
      progress: Math.min(1, completedCourses.length),
      maxProgress: 1,
    },
    {
      id: 'ach_five_courses',
      code: 'FIVE_COURSES',
      title: 'Master Learner',
      description: 'Completed 5 distinct courses from your curriculum.',
      icon: 'military_tech',
      xp: 1500,
      category: 'course',
      unlocked: completedCourses.length >= 5,
      progress: Math.min(5, completedCourses.length),
      maxProgress: 5,
    },
  ];
};

export const getUserAchievements = async (userId: string): Promise<Achievement[]> => {
  if (!userId) return [];
  try {
    const snap = await getDocs(collection(db, `users/${userId}/achievements`));
    if (snap.empty) return [];
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Achievement));
  } catch (e) {
    console.warn('Error fetching achievements:', e);
    return [];
  }
};

// ==========================================
// 12. CERTIFICATES GENERATOR (ISOLATED FIRESTORE)
// ==========================================

export const getUserCertificates = async (userId: string): Promise<Certificate[]> => {
  if (!userId) return [];
  try {
    const snap = await getDocs(collection(db, `users/${userId}/certificates`));
    if (snap.empty) return [];
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Certificate));
  } catch (e) {
    console.warn('Error fetching certificates:', e);
    return [];
  }
};

export const generateCertificateForCompletion = async (
  userId: string,
  userName: string,
  course: Course
): Promise<Certificate> => {
  // Check if certificate already exists
  const existingCerts = await getUserCertificates(userId);
  const found = existingCerts.find((c) => c.courseId === course.id);
  if (found) {
    return found;
  }

  const certNumber = `LOS-${new Date().getFullYear()}-${course.id.toUpperCase().replace('COURSE_', '')}-${Math.floor(10000 + Math.random() * 90000)}`;
  const cert: Certificate = {
    id: `cert_${Date.now()}`,
    certificateNumber: certNumber,
    userId,
    userName,
    courseId: course.id,
    courseTitle: course.title,
    instructorName: course.instructor?.name || 'Senior Instructor',
    issueDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    hoursCompleted: Math.round(((course.totalDuration || 3600) / 3600) * 10) / 10 || 1.5,
    skills: course.tags || ['Software Engineering', 'Curriculum Mastery'],
    verificationUrl: `https://learnos.ai/verify/${certNumber}`,
  };

  try {
    await setDoc(doc(db, `users/${userId}/certificates`, cert.id), cert);
  } catch (e) {
    console.warn('Firestore cert save error:', e);
  }

  return cert;
};
