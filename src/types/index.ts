export type UserRole = 'student';

export interface UserProfile {
  uid: string;
  email?: string;
  phoneNumber?: string;
  displayName: string;
  photoURL?: string;
  username?: string;
  bio?: string;
  role?: UserRole;
  learningLevel?: 'beginner' | 'intermediate' | 'advanced';
  interests?: string[];
  goals?: string[];
  dailyLearningTarget?: number; // minutes per day
  preferredStudyTime?: 'morning' | 'afternoon' | 'evening' | 'night';
  preferredDays?: string[];
  timezone?: string;
  lastActivityDate?: string; // YYYY-MM-DD
  totalActiveDays?: number;
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  totalLearningMinutes: number;
  completedCoursesCount: number;
  createdAt: string;
  updatedAt: string;
}

export type DriveFileType = 
  | 'VIDEO' 
  | 'PDF' 
  | 'DOCUMENT' 
  | 'PRESENTATION' 
  | 'SPREADSHEET' 
  | 'IMAGE' 
  | 'OTHER';

export interface LessonResource {
  id: string;
  driveFileId?: string;
  storagePath?: string;
  title: string;
  mimeType: string;
  fileType: DriveFileType;
  size?: number;
  webViewLink?: string;
  downloadUrl?: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  driveFileId?: string;
  storagePath?: string;
  videoUrl?: string;
  title: string;
  description?: string;
  order: number;
  mimeType: string;
  fileType: DriveFileType;
  duration?: number; // in seconds
  size?: number;
  webViewLink?: string;
  streamUrl?: string;
  moduleName?: string;
  resources?: LessonResource[];
  transcript?: string;
  summary?: string;
  createdTime?: string;
  modifiedTime?: string;
}

export interface CourseModule {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  driveFolderId?: string;
  title: string;
  description: string;
  thumbnail: string;
  thumbnailStoragePath?: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  instructor: {
    name: string;
    avatar?: string;
    title?: string;
  };
  totalLessons: number;
  totalDuration: number; // in seconds
  lastSynced: string;
  published: boolean;
  tags: string[];
  modules?: CourseModule[];
  lessons?: Lesson[];
  requirements?: string[];
  learningOutcomes?: string[];
}

export interface Enrollment {
  courseId: string;
  userId: string;
  startedAt: string;
  lastAccessedAt: string;
  progress: number; // 0 - 100
  completedLessons: string[]; // lesson ids
  totalLessons: number;
  completed: boolean;
  completedAt?: string;
  certificateId?: string;
}

export interface LessonProgress {
  courseId: string;
  lessonId: string;
  userId: string;
  watchTime: number; // in seconds
  duration: number; // in seconds
  percentage: number; // 0 - 100
  completed: boolean;
  lastWatchedAt: string;
  completedAt?: string;
}

export type ActivityType =
  | 'LESSON_STARTED'
  | 'LESSON_COMPLETED'
  | 'VIDEO_WATCHED'
  | 'QUIZ_COMPLETED'
  | 'PRACTICE_COMPLETED'
  | 'ASSIGNMENT_SUBMITTED'
  | 'COURSE_COMPLETED'
  | 'GOAL_COMPLETED';

export interface LearningActivity {
  id: string;
  userId: string;
  activityType: ActivityType;
  courseId?: string;
  courseTitle?: string;
  lessonId?: string;
  lessonTitle?: string;
  durationMinutes: number;
  metadata?: Record<string, any>;
  timestamp: string; // ISO 8601
  date: string; // YYYY-MM-DD
  timezone?: string;
}

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  courseId?: string;
  courseTitle?: string;
  lessonId?: string;
  lessonTitle?: string;
  videoTimestamp?: number;
  tags: string[];
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Bookmark {
  id: string;
  userId: string;
  courseId: string;
  courseTitle: string;
  lessonId?: string;
  lessonTitle?: string;
  videoTimestamp?: number;
  title: string;
  noteSnippet?: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  type: 'daily' | 'weekly' | 'course' | 'skill' | 'custom';
  targetMinutes?: number;
  currentMinutes?: number;
  courseId?: string;
  courseTitle?: string;
  progress: number;
  completed: boolean;
  deadline?: string;
  targetDate?: string;
  milestones?: {
    id: string;
    title: string;
    completed: boolean;
  }[];
  createdAt: string;
  updatedAt: string;
}

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export interface Task {
  id: string;
  userId: string;
  title: string;
  courseId?: string;
  courseTitle?: string;
  lessonId?: string;
  dueDate?: string;
  priority: TaskPriority;
  status: TaskStatus;
  estimatedMinutes?: number;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleSession {
  id: string;
  userId: string;
  title: string;
  courseId?: string;
  courseTitle?: string;
  lessonId?: string;
  lessonTitle?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  durationMinutes?: number;
  dayOfWeek?: number | string;
  type?: string;
  color?: string;
  priority?: 'low' | 'medium' | 'high';
  notes?: string;
  completed: boolean;
  recurring?: 'none' | 'daily' | 'weekly';
  createdAt: string;
  updatedAt?: string;
}

export interface Achievement {
  id: string;
  code: string;
  title: string;
  description: string;
  icon: string;
  xp: number;
  category: 'streak' | 'course' | 'quiz' | 'mastery' | 'productivity';
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}

export interface Certificate {
  id: string;
  certificateNumber: string;
  userId: string;
  userName: string;
  courseId: string;
  courseTitle: string;
  instructorName: string;
  issueDate: string;
  hoursCompleted: number;
  skills: string[];
  verificationUrl: string;
}

export interface ActivityDay {
  date: string; // YYYY-MM-DD
  minutes: number;
  lessonsCompleted: number;
  streakCount: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topic: string;
}

export interface Quiz {
  id: string;
  title: string;
  courseId?: string;
  course: string;
  questionCount: number;
  timeLimitMinutes: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  passingScore: number; // percentage
  tags: string[];
  weakTopicDetected?: string;
  questions: QuizQuestion[];
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  quizTitle: string;
  courseId?: string;
  answers: Record<number, number>; // questionIndex -> selectedOption
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  weakTopics: string[];
  startedAt: string;
  completedAt: string;
  timeSpentSeconds: number;
}

export type AssignmentStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'GRADED' | 'COMPLETED' | 'OVERDUE';

export interface Assignment {
  id: string;
  title: string;
  courseId?: string;
  course: string;
  dueDate: string;
  rubric: string[];
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  userId: string;
  courseId?: string;
  githubUrl: string;
  demoUrl?: string;
  notes?: string;
  status: AssignmentStatus;
  grade?: string;
  score?: number;
  feedback?: string;
  submittedAt: string;
  gradedAt?: string;
}
