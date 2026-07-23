import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from '@/pages/HomePage';
import { SearchPage } from '@/pages/SearchPage';
import { AboutPage } from '@/pages/AboutPage';
import { HowItWorksPage } from '@/pages/HowItWorksPage';
import { ContactPage } from '@/pages/ContactPage';
import { FavoritesPage } from '@/pages/FavoritesPage';
import { TeacherProfilePage } from '@/pages/TeacherProfilePage';
import { LoginPage } from '@/pages/LoginPage';
import { StudentDashboardPage } from '@/pages/StudentDashboardPage';
import { TeacherDashboardPage } from '@/pages/TeacherDashboardPage';
import { CalendarPage } from '@/pages/CalendarPage';
import { PackagesPage } from '@/pages/PackagesPage';
import { PackageDetailsPage } from '@/pages/PackageDetailsPage';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/teacher/:id" element={<TeacherProfilePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard/student"
          element={
            <ProtectedRoute role="student">
              <StudentDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/teacher"
          element={
            <ProtectedRoute role="teacher">
              <TeacherDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/student/calendar"
          element={
            <ProtectedRoute role="student">
              <CalendarPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/student/packages"
          element={
            <ProtectedRoute role="student">
              <PackagesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/student/packages/:id"
          element={
            <ProtectedRoute role="student">
              <PackageDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
