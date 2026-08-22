import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { LearningProvider } from './contexts/LearningContext';

// Layout & Route Guard
import { AppShell } from './components/common/AppShell';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Public Auth Pages
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { ForgotPasswordPage } from './pages/public/ForgotPasswordPage';

// Student Core LMS Pages
import { DashboardPage } from './pages/student/DashboardPage';
import { CoursesPage } from './pages/student/CoursesPage';
import { CourseDetailPage } from './pages/student/CourseDetailPage';
import { CoursePlayerPage } from './pages/student/CoursePlayerPage';
import { SchedulePage } from './pages/student/SchedulePage';
import { GoalsPage } from './pages/student/GoalsPage';
import { TasksPage } from './pages/student/TasksPage';
import { NotesPage } from './pages/student/NotesPage';
import { AnalyticsPage } from './pages/student/AnalyticsPage';
import { AchievementsPage } from './pages/student/AchievementsPage';
import { CertificatesPage } from './pages/student/CertificatesPage';
import { QuizzesPage } from './pages/student/QuizzesPage';
import { QuizActivePage } from './pages/student/QuizActivePage';
import { AssignmentsPage } from './pages/student/AssignmentsPage';
import { PracticeLabPage } from './pages/student/PracticeLabPage';
import { ProfilePage } from './pages/student/ProfilePage';
import { SettingsPage } from './pages/student/SettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 10, // 10 mins
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <LearningProvider>
            <BrowserRouter>
              <Routes>
                {/* Main Entry & Authentication */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                {/* Authenticated Application Shell */}
                <Route
                  element={
                    <ProtectedRoute>
                      <AppShell />
                    </ProtectedRoute>
                  }
                >
                  {/* Dashboard */}
                  <Route path="/dashboard" element={<DashboardPage />} />

                  {/* Course Discovery & Player */}
                  <Route path="/courses" element={<CoursesPage />} />
                  <Route path="/courses/:id" element={<CourseDetailPage />} />
                  <Route path="/learning" element={<CoursesPage />} />
                  <Route path="/learning/:courseId" element={<CoursePlayerPage />} />
                  <Route path="/learn/:courseId" element={<CoursePlayerPage />} />
                  <Route path="/learn" element={<CoursesPage />} />


                  {/* Practice, Quizzes & Assignments */}
                  <Route path="/quizzes" element={<QuizzesPage />} />
                  <Route path="/quiz/:quizId" element={<QuizActivePage />} />
                  <Route path="/assignments" element={<AssignmentsPage />} />
                  <Route path="/practice" element={<PracticeLabPage />} />

                  {/* Productivity Workspaces */}
                  <Route path="/schedule" element={<SchedulePage />} />
                  <Route path="/goals" element={<GoalsPage />} />
                  <Route path="/tasks" element={<TasksPage />} />
                  <Route path="/notes" element={<NotesPage />} />

                  {/* Analytics & Gamification */}
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/achievements" element={<AchievementsPage />} />
                  <Route path="/certificates" element={<CertificatesPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>

                {/* Catch-all fallback */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </BrowserRouter>
          </LearningProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
