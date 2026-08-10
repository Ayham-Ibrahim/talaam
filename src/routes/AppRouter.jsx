import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from '@/pages/HomePage';
import { SearchPage } from '@/pages/SearchPage';
import { AboutPage } from '@/pages/AboutPage';
import { HowItWorksPage } from '@/pages/HowItWorksPage';
import { ContactPage } from '@/pages/ContactPage';
import { FavoritesPage } from '@/pages/FavoritesPage';
import { TeacherProfilePage } from '@/pages/TeacherProfilePage';
import { PaymentSuccessPage } from '@/pages/PaymentSuccessPage';
import { PaymentCancelPage } from '@/pages/PaymentCancelPage';
import { LoginPage } from '@/pages/LoginPage';
import { CompleteProfilePage } from '@/pages/CompleteProfilePage';
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
import { AdminTeacherImportPage } from '@/pages/AdminTeacherImportPage';
import { AdminSettingsPage } from '@/pages/AdminSettingsPage';
import { CalendarPage } from '@/pages/CalendarPage';
import { TeacherCalendarPage } from '@/pages/TeacherCalendarPage';
import { SessionsPage } from '@/pages/SessionsPage';
import { PackagesPage } from '@/pages/PackagesPage';
import { PackageDetailsPage } from '@/pages/PackageDetailsPage';
import { InvoicesPage } from '@/pages/InvoicesPage';
import { StudentReviewsPage } from '@/pages/StudentReviewsPage';
import { StudentSettingsPage } from '@/pages/StudentSettingsPage';
import { TeacherPackagesPage } from '@/pages/TeacherPackagesPage';
import { TeacherSessionsPage } from '@/pages/TeacherSessionsPage';
import { TeacherSessionDetailsPage } from '@/pages/TeacherSessionDetailsPage';
import { TeacherStudentsPage } from '@/pages/TeacherStudentsPage';
import { TeacherSettingsPage } from '@/pages/TeacherSettingsPage';
import { TeacherBookingRequestsPage } from '@/pages/TeacherBookingRequestsPage';
import { TeacherStudentDetailsPage } from '@/pages/TeacherStudentDetailsPage';
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
        <Route path="/payments/success" element={<PaymentSuccessPage />} />
        <Route path="/payments/cancel" element={<PaymentCancelPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/complete-profile"
          element={
            <ProtectedRoute>
              <CompleteProfilePage />
            </ProtectedRoute>
          }
        />
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
          path="/dashboard/admin/teacher-import"
          element={
            <ProtectedRoute role="admin">
              <AdminTeacherImportPage />
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
        <Route
          path="/dashboard/student/reviews"
          element={
            <ProtectedRoute role="student">
              <StudentReviewsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/student/settings"
          element={
            <ProtectedRoute role="student">
              <StudentSettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/teacher/calendar"
          element={
            <ProtectedRoute role="teacher">
              <TeacherCalendarPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/teacher/packages"
          element={
            <ProtectedRoute role="teacher">
              <TeacherPackagesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/teacher/sessions"
          element={
            <ProtectedRoute role="teacher">
              <TeacherSessionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/teacher/sessions/:id"
          element={
            <ProtectedRoute role="teacher">
              <TeacherSessionDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/teacher/students"
          element={
            <ProtectedRoute role="teacher">
              <TeacherStudentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/teacher/students/:id"
          element={
            <ProtectedRoute role="teacher">
              <TeacherStudentDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/teacher/settings"
          element={
            <ProtectedRoute role="teacher">
              <TeacherSettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/teacher/booking-requests"
          element={
            <ProtectedRoute role="teacher">
              <TeacherBookingRequestsPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
