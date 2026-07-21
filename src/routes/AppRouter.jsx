import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from '@/pages/HomePage';
import { SearchPage } from '@/pages/SearchPage';
import { AboutPage } from '@/pages/AboutPage';
import { ContactPage } from '@/pages/ContactPage';
import { FavoritesPage } from '@/pages/FavoritesPage';
import { TeacherProfilePage } from '@/pages/TeacherProfilePage';
import { LoginPage } from '@/pages/LoginPage';
import { StudentDashboardPage } from '@/pages/StudentDashboardPage';
import { TeacherDashboardPage } from '@/pages/TeacherDashboardPage';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/about" element={<AboutPage />} />
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
