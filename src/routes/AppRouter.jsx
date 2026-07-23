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
import { AdminDashboardPage } from '@/pages/AdminDashboardPage';
import { AdminTeachersPage } from '@/pages/AdminTeachersPage';
import { AdminTeacherDetailPage } from '@/pages/AdminTeacherDetailPage';
import { AdminListingsPage } from '@/pages/AdminListingsPage';
import { AdminListingDetailPage } from '@/pages/AdminListingDetailPage';
import { AdminComplaintsPage } from '@/pages/AdminComplaintsPage';
import { AdminTaxonomyPage } from '@/pages/AdminTaxonomyPage';
import { AdminPayoutsPage } from '@/pages/AdminPayoutsPage';
import { AdminStudentImportPage } from '@/pages/AdminStudentImportPage';
import { AdminSettingsPage } from '@/pages/AdminSettingsPage';
import { CalendarPage } from '@/pages/CalendarPage';
import { SessionsPage } from '@/pages/SessionsPage';
import { PackagesPage } from '@/pages/PackagesPage';
import { PackageDetailsPage } from '@/pages/PackageDetailsPage';
import { InvoicesPage } from '@/pages/InvoicesPage';
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
          path="/dashboard/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/teachers"
          element={
            <ProtectedRoute role="admin">
              <AdminTeachersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/teachers/:id"
          element={
            <ProtectedRoute role="admin">
              <AdminTeacherDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/listings"
          element={
            <ProtectedRoute role="admin">
              <AdminListingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/listings/:id"
          element={
            <ProtectedRoute role="admin">
              <AdminListingDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/complaints"
          element={
            <ProtectedRoute role="admin">
              <AdminComplaintsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/taxonomy"
          element={
            <ProtectedRoute role="admin">
              <AdminTaxonomyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/payouts"
          element={
            <ProtectedRoute role="admin">
              <AdminPayoutsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/student-import"
          element={
            <ProtectedRoute role="admin">
              <AdminStudentImportPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/settings"
          element={
            <ProtectedRoute role="admin">
              <AdminSettingsPage />
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
          path="/dashboard/student/sessions"
          element={
            <ProtectedRoute role="student">
              <SessionsPage />
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
        <Route
          path="/dashboard/student/invoices"
          element={
            <ProtectedRoute role="student">
              <InvoicesPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
