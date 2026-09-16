import { Navigate, Route, Routes } from "react-router";
import { MockProvider, useMock } from "@/mock/store";
import MockShell from "@/mock/MockShell";
import MockLandingPage from "@/mock/landing/Landing";
import { MockLoginPage, MockRegisterPage } from "@/mock/AuthPages";
import {
  AnalyticsPage,
  HistoryPage,
  MockDashboard,
  TestInfoPage,
  TestInstructionsPage,
  TestLibraryPage,
} from "@/mock/student/StudentPages";
import ResultsPage from "@/mock/student/ResultsPage";
import {
  AssignPage,
  CreateMockPage,
  MockLibraryPage,
  StudentsPage,
  TeacherDashboard as MockTeacherDashboard,
  TeacherResultsPage,
} from "@/mock/teacher/TeacherPages";
import ExamPage from "@/mock/exam/ExamPage";
import { MockSettingsPage } from "@/mock/SettingsPage";

function MockHome() {
  const { user } = useMock();
  return user?.role === "teacher" ? <MockTeacherDashboard /> : <MockDashboard />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<MockLandingPage />} />
      <Route path="/login" element={<MockLoginPage />} />
      <Route path="/register" element={<MockRegisterPage />} />
      <Route path="/test/:id" element={<ExamPage />} />
      <Route path="/app" element={<MockShell><MockHome /></MockShell>} />
      <Route path="/app/tests" element={<MockShell><TestLibraryPage /></MockShell>} />
      <Route path="/app/tests/:id" element={<MockShell><TestInfoPage /></MockShell>} />
      <Route path="/app/tests/:id/instructions" element={<MockShell><TestInstructionsPage /></MockShell>} />
      <Route path="/app/history" element={<MockShell><HistoryPage /></MockShell>} />
      <Route path="/app/results/:attemptId" element={<MockShell><ResultsPage /></MockShell>} />
      <Route path="/app/analytics" element={<MockShell><AnalyticsPage /></MockShell>} />
      <Route path="/app/library" element={<MockShell><MockLibraryPage /></MockShell>} />
      <Route path="/app/create" element={<MockShell><CreateMockPage /></MockShell>} />
      <Route path="/app/assign" element={<MockShell><AssignPage /></MockShell>} />
      <Route path="/app/students" element={<MockShell><StudentsPage /></MockShell>} />
      <Route path="/app/results" element={<MockShell><TeacherResultsPage /></MockShell>} />
      <Route path="/app/settings" element={<MockShell><MockSettingsPage /></MockShell>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <MockProvider>
      <AppRoutes />
    </MockProvider>
  );
}
