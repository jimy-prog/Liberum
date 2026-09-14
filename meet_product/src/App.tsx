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
