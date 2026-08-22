import React, { createContext, useContext, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from './AuthContext';
import {
  getAllCourses,
  getLessonsForCourse,
  subscribeToCourses,
  subscribeToUserEnrollments,
  subscribeToUserProgress,
  enrollInCourse as firestoreEnroll,
  saveLessonProgress,
  markEntireCourseComplete as firestoreMarkEntireCourseComplete,
  generateCertificateForCompletion,
  saveDiscoveredDriveCoursesToFirestore,
} from '../services/firebase/firestoreService';
import { discoverCoursesAndLessons } from '../services/googleDrive/driveService';
import type { Course, Lesson, Enrollment, LessonProgress, Certificate } from '../types';

interface LearningContextType {
  courses: Course[];
  loadingCourses: boolean;
  activeCourse: Course | null;
  activeLesson: Lesson | null;
  courseLessons: Lesson[];
  enrollments: Record<string, Enrollment>;
  progressMap: Record<string, LessonProgress>;
  recentCompletedCertificate: Certificate | null;
  showCompletionModal: boolean;
  setShowCompletionModal: (show: boolean) => void;
  loadCourse: (courseId: string) => Promise<void>;
  selectLesson: (lesson: Lesson) => void;
  enrollCourse: (courseId: string) => Promise<void>;
  recordProgress: (
    courseId: string,
    lessonId: string,
    watchTime: number,
    duration: number,
    forceComplete?: boolean,
    forceUncomplete?: boolean,
    courseTitle?: string,
    lessonTitle?: string
  ) => Promise<void>;
  markCurrentLessonComplete: () => Promise<void>;
  markCourseComplete: (courseId: string) => Promise<void>;
  refreshCourses: (onProgress?: (step: string, pct: number) => void) => Promise<void>;
}

const LearningContext = createContext<LearningContextType | undefined>(undefined);

export const LearningProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile, updateUserProfile } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState<boolean>(true);
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [courseLessons, setCourseLessons] = useState<Lesson[]>([]);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [enrollments, setEnrollments] = useState<Record<string, Enrollment>>({});
  const [progressMap, setProgressMap] = useState<Record<string, LessonProgress>>({});
  const [recentCompletedCertificate, setRecentCompletedCertificate] = useState<Certificate | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState<boolean>(false);

  // Real-Time Courses Subscription
  useEffect(() => {
    setLoadingCourses(true);
    const unsubscribeCourses = subscribeToCourses((data) => {
      setCourses(data);
      setLoadingCourses(false);
    });

    return () => unsubscribeCourses();
  }, []);

  // Real-Time Enrollments & Progress Subscription for Authenticated User
  useEffect(() => {
    if (!userProfile?.uid) return;

    const unsubscribeEnrollments = subscribeToUserEnrollments(userProfile.uid, (enrollMap) => {
      setEnrollments(enrollMap);
    });

    const unsubscribeProgress = subscribeToUserProgress(userProfile.uid, (progMap) => {
      setProgressMap(progMap);
    });

    return () => {
      unsubscribeEnrollments();
      unsubscribeProgress();
    };
  }, [userProfile?.uid]);

  const loadCourse = async (courseId: string) => {
    let course = courses.find((c) => c.id === courseId);
    if (!course) {
      const all = await getAllCourses();
      setCourses(all);
      course = all.find((c) => c.id === courseId);
    }

    if (course) {
      setActiveCourse(course);
      const lessons = await getLessonsForCourse(courseId);
      setCourseLessons(lessons);

      if (lessons.length > 0) {
        const enroll = enrollments[courseId];
        if (enroll && enroll.completedLessons?.length > 0) {
          const nextLesson = lessons.find((l) => !enroll.completedLessons.includes(l.id));
          setActiveLesson(nextLesson || lessons[0]);
        } else {
          setActiveLesson(lessons[0]);
        }
      }
    }
  };

  const selectLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
  };

  const enrollCourse = async (courseId: string) => {
    if (!userProfile?.uid) return;
    const lessons = await getLessonsForCourse(courseId);
    const totalLessons = lessons.length || 10;

    const enroll = await firestoreEnroll(userProfile.uid, courseId, totalLessons);
    setEnrollments((prev) => ({ ...prev, [courseId]: enroll }));
  };

  const recordProgress = async (
    courseId: string,
    lessonId: string,
    watchTime: number,
    duration: number,
    forceComplete?: boolean,
    forceUncomplete?: boolean,
    courseTitle?: string,
    lessonTitle?: string
  ) => {
    if (!userProfile?.uid) return;

    const cTitle = courseTitle || activeCourse?.title || 'Course';
    const lTitle = lessonTitle || activeLesson?.title || 'Lesson';

    const result = await saveLessonProgress(
      userProfile.uid,
      courseId,
      lessonId,
      watchTime,
      duration,
      forceComplete,
      forceUncomplete,
      cTitle,
      lTitle
    );

    // Update state maps immediately for near real-time response
    setProgressMap((prev) => ({ ...prev, [lessonId]: result.progress }));
    if (result.enrollment) {
      setEnrollments((prev) => ({ ...prev, [courseId]: result.enrollment! }));
    }

    // Trigger celebratory confetti & certificate generation if course reaches 100%
    if (result.courseJustCompleted && activeCourse) {
      const cert = await generateCertificateForCompletion(
        userProfile.uid,
        userProfile.displayName || 'Learner',
        activeCourse
      );
      setRecentCompletedCertificate(cert);
      setShowCompletionModal(true);

      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4648d4', '#6063ee', '#10b981', '#f59e0b', '#ec4899'],
      });

      updateUserProfile({
        completedCoursesCount: (userProfile.completedCoursesCount || 0) + 1,
        xp: (userProfile.xp || 0) + 500,
      });
    }
  };

  const markCurrentLessonComplete = async () => {
    if (activeCourse && activeLesson) {
      await recordProgress(
        activeCourse.id,
        activeLesson.id,
        activeLesson.duration || 1800,
        activeLesson.duration || 1800,
        true,
        false,
        activeCourse.title,
        activeLesson.title
      );
    }
  };

  const markCourseComplete = async (courseId: string) => {
    if (!userProfile?.uid) return;
    const targetCourse = activeCourse?.id === courseId ? activeCourse : courses.find((c) => c.id === courseId);
    if (!targetCourse) return;

    const lessons = courseLessons.length > 0 && activeCourse?.id === courseId 
      ? courseLessons 
      : await getLessonsForCourse(courseId);

    const updatedEnrollment = await firestoreMarkEntireCourseComplete(
      userProfile.uid,
      courseId,
      lessons,
      targetCourse.title
    );
    setEnrollments((prev) => ({ ...prev, [courseId]: updatedEnrollment }));

    const cert = await generateCertificateForCompletion(
      userProfile.uid,
      userProfile.displayName || 'Learner',
      targetCourse
    );
    setRecentCompletedCertificate(cert);
    setShowCompletionModal(true);

    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#4648d4', '#6063ee', '#10b981', '#f59e0b', '#ec4899'],
    });

    updateUserProfile({
      completedCoursesCount: (userProfile.completedCoursesCount || 0) + 1,
      xp: (userProfile.xp || 0) + 500,
    });
  };

  const refreshCourses = async (onProgress?: (step: string, pct: number) => void) => {
    setLoadingCourses(true);
    try {
      const result = await discoverCoursesAndLessons(onProgress);
      await saveDiscoveredDriveCoursesToFirestore(result.courses, result.lessonsByCourse);
      setCourses(result.courses);
    } finally {
      setLoadingCourses(false);
    }
  };

  return (
    <LearningContext.Provider
      value={{
        courses,
        loadingCourses,
        activeCourse,
        activeLesson,
        courseLessons,
        enrollments,
        progressMap,
        recentCompletedCertificate,
        showCompletionModal,
        setShowCompletionModal,
        loadCourse,
        selectLesson,
        enrollCourse,
        recordProgress,
        markCurrentLessonComplete,
        markCourseComplete,
        refreshCourses,
      }}
    >
      {children}
    </LearningContext.Provider>
  );
};

export const useLearning = (): LearningContextType => {
  const context = useContext(LearningContext);
  if (!context) {
    throw new Error('useLearning must be used within a LearningProvider');
  }
  return context;
};
