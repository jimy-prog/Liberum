import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { HISTORY, MOCK_TESTS, type AttemptResult, type MockTest } from "./data";
import type { AppNotification, Role, User } from "@/lib/types";

/* ---------- Mock account store (same identity pattern as Meet) ---------- */
interface MockState {
  user: User | null;
  signIn: (user: User | Role) => void;
  clearHistory: () => void;
  signOut: () => void;
  notifications: AppNotification[];
  markAllRead: () => void;
  attempts: AttemptResult[];
  addAttempt: (a: AttemptResult) => void;
  refreshAttempts: () => Promise<void>;
  tests: MockTest[];
}

const Ctx = createContext<MockState | null>(null);

const MOCK_STUDENT: User = { id: "mu-s", name: "Jasur Toshev", email: "jasur@student.liberum.uz", role: "student", initials: "JT" };
const MOCK_TEACHER: User = { id: "mu-t", name: "Aziza Karimova", email: "aziza@liberum.uz", role: "teacher", initials: "AK" };

const seedNotifs = (role: Role): AppNotification[] =>
  role === "student"
    ? [
        { id: "n1", kind: "booking", title: "Results available", body: "IELTS Academic Mock 01 — Overall 7.0. See your full breakdown.", time: "2h ago", read: false },
        { id: "n2", kind: "reminder", title: "Test deadline approaching", body: "IELTS Academic Mock 02 assigned by Aziza K. is due in 3 days.", time: "Yesterday", read: false },
        { id: "n3", kind: "system", title: "New test assigned", body: "Your teacher assigned IELTS Academic Mock 02.", time: "2 days ago", read: true },
      ]
    : [
        { id: "n1", kind: "booking", title: "Student completed test", body: "Bekzod Alimov finished IELTS Academic Mock 01 — Overall 7.5.", time: "3h ago", read: false },
        { id: "n2", kind: "system", title: "Assignment created", body: "IELTS Academic Mock 02 assigned to 8 students.", time: "Yesterday", read: true },
      ];

export function MockProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem("mock-user");
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  });
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [attempts, setAttempts] = useState<AttemptResult[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("mock-attempts") || "null") ?? HISTORY;
    } catch {
      return HISTORY;
    }
  });

  const [tests, setTests] = useState<MockTest[]>(() => {
    try {
      const cached = localStorage.getItem("mock-tests");
      return cached ? JSON.parse(cached) : MOCK_TESTS;
    } catch {
      return MOCK_TESTS;
    }
  });

  const refreshTests = async () => {
    try {
      const res = await fetch("/api/mock/tests");
      if (res.ok) {
        const data = await res.json();
        if (data.tests && data.tests.length > 0) {
          setTests(data.tests);
          localStorage.setItem("mock-tests", JSON.stringify(data.tests));
        }
      }
    } catch (e) {
      console.warn("Could not fetch backend tests:", e);
    }
  };

  const refreshAttempts = async () => {
    try {
      const res = await fetch("/api/mock/attempts/history");
      if (res.ok) {
        const data = await res.json();
        if (data.history && Array.isArray(data.history) && data.history.length > 0) {
          setAttempts(data.history);
          localStorage.setItem("mock-attempts", JSON.stringify(data.history));
        }
      }
    } catch (e) {
      console.warn("Could not fetch backend history:", e);
    }
  };

  // Sync tests and attempts on mount and user change
  useEffect(() => {
    refreshTests();
  }, []);

  useEffect(() => {
    if (user) {
      refreshAttempts();
    }
  }, [user]);

  // Verify / sync user session from backend on mount
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data && data.id) {
          const rawRole = data.role?.toLowerCase() || "student";
          const isTeacher = ["teacher", "owner", "admin"].includes(rawRole);
          const name = data.full_name || data.username || "User";
          const initials = name
            .split(" ")
            .map((w: string) => w[0])
            .join("")
            .substring(0, 2)
            .toUpperCase() || "U";

          const syncdUser: User = {
            id: String(data.id),
            name: name,
            email: data.email || "",
            role: isTeacher ? "teacher" : "student",
            initials: initials,
          };
          setUser(syncdUser);
        }
      })
      .catch(() => {
        // Fallback to local session
      });
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem("mock-user", JSON.stringify(user));
    else localStorage.removeItem("mock-user");
    setNotifications(user ? seedNotifs(user.role) : []);
  }, [user]);

  useEffect(() => {
    localStorage.setItem("mock-attempts", JSON.stringify(attempts));
  }, [attempts]);

  const value = useMemo<MockState>(
    () => ({
      user,
      signIn: (u) => {
        if (typeof u === "string") {
          setUser(u === "teacher" ? MOCK_TEACHER : MOCK_STUDENT);
        } else {
          setUser(u);
        }
      },
      clearHistory: () => setAttempts([]),
      signOut: () => setUser(null),
      notifications,
      markAllRead: () => setNotifications((p) => p.map((n) => ({ ...n, read: true }))),
      attempts,
      addAttempt: (a) => setAttempts((p) => [a, ...p]),
      refreshAttempts,
      tests,
    }),
    [user, notifications, attempts, tests]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useMock() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useMock outside provider");
  return v;
}

/* ---------- Exam session store ---------- */
export interface ExamSession {
  answers: Record<string, string>;
  flags: string[];
  writing: Record<string, string>;
  sectionIndex: number;
  timeLeft: number; // seconds, current section
  submitted: boolean;
}

const emptySession: ExamSession = {
  answers: {},
  flags: [],
  writing: {},
  sectionIndex: 0,
  timeLeft: 0,
  submitted: false,
};

export function loadSession(): ExamSession {
  try {
    return { ...emptySession, ...(JSON.parse(localStorage.getItem("mock-session") || "{}") as Partial<ExamSession>) };
  } catch {
    return emptySession;
  }
}

export function saveSession(s: ExamSession) {
  localStorage.setItem("mock-session", JSON.stringify(s));
}

export function clearSession() {
  localStorage.removeItem("mock-session");
}
