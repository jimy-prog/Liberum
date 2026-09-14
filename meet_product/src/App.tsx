import { Navigate, Route, Routes } from "react-router";
import { AppProvider, useApp } from "@/lib/store";
import AppShell from "@/components/AppShell";
import LandingPage from "@/pages/landing/Landing";
import { ForgotPasswordPage, LoginPage, RegisterPage } from "@/pages/auth/AuthPages";
import {
  BookingPage,
  FindTeachersPage,
  MyLessonsPage,
  StudentDashboard,
  TeacherProfilePage,
} from "@/pages/student/StudentPages";
import {
  AvailabilityPage,
  TeacherCalendarPage,
  TeacherDashboard,
  TeacherEarningsPage,
  TeacherLessonsPage,
  TeacherProfileEditor,
} from "@/pages/teacher/TeacherPages";
import ClassroomPage from "@/pages/classroom/Classroom";
import { AdminPage, MessagesPage, SettingsPage } from "@/pages/misc/MiscPages";

function Home() {
  const { user } = useApp();
  return user?.role === "teacher" ? <TeacherDashboard /> : <StudentDashboard />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/classroom/:lessonId" element={<ClassroomPage />} />
      <Route
        path="/teachers/:id"
        element={
          <div className="min-h-screen bg-[#F6F7F9] p-4 sm:p-8">
            <header className="mx-auto mb-6 flex max-w-6xl items-center justify-between">
              <a href="/" className="font-display text-xl font-bold tracking-tight text-ink">
                Liber<span className="text-brand-500">um</span>
                <span className="ml-2 rounded-full bg-brand-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-600">Meet</span>
              </a>
              <div className="flex items-center gap-3">
                <a href="/login" className="text-xs font-semibold text-ink-600 hover:text-ink">Log in</a>
                <a href="/register" className="rounded-full bg-brand-500 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-600">Get Started</a>
              </div>
            </header>
            <TeacherProfilePage />
          </div>
        }
      />
      <Route
        path="/app"
        element={
          <AppShell>
            <Home />
          </AppShell>
        }
      />
      <Route
        path="/app/teachers"
        element={
          <AppShell>
            <FindTeachersPage />
          </AppShell>
        }
      />
      <Route
        path="/app/teachers/:id"
        element={
          <AppShell>
            <TeacherProfilePage />
          </AppShell>
        }
      />
      <Route
        path="/app/book/:id"
        element={
          <AppShell>
            <BookingPage />
          </AppShell>
        }
      />
      <Route
        path="/app/lessons"
        element={
          <AppShell>
            <LessonsRouter />
          </AppShell>
        }
      />
      <Route
        path="/app/availability"
        element={
          <AppShell>
            <AvailabilityPage />
          </AppShell>
        }
      />
      <Route
        path="/app/calendar"
        element={
          <AppShell>
            <TeacherCalendarPage />
          </AppShell>
        }
      />
      <Route
        path="/app/profile"
        element={
          <AppShell>
            <TeacherProfileEditor />
          </AppShell>
        }
      />
      <Route
        path="/app/earnings"
        element={
          <AppShell>
            <TeacherEarningsPage />
          </AppShell>
        }
      />
      <Route
        path="/app/messages"
        element={
          <AppShell>
            <MessagesPage />
          </AppShell>
        }
      />
      <Route
        path="/app/settings"
        element={
          <AppShell>
            <SettingsPage />
          </AppShell>
        }
      />
      <Route
        path="/app/admin"
        element={
          <AppShell>
            <AdminPage />
          </AppShell>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function LessonsRouter() {
  const { user } = useApp();
  return user?.role === "teacher" ? <TeacherLessonsPage /> : <MyLessonsPage />;
}

export default function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}
