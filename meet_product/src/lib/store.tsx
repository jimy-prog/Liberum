import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { DEMO_STUDENT, DEMO_TEACHER, STUDENT_LESSONS, TEACHER_LESSONS } from "./data";
import { meetApi } from "./api";
import type { AppNotification, BookingDraft, Lesson, Role, User } from "./types";

interface AppState {
  user: User | null;
  loading: boolean;
  signIn: (role: Role) => void;
  loginWithBackend: (email: string, password: string) => Promise<User>;
  registerWithBackend: (name: string, email: string, password: string, role: Role) => Promise<User>;
  signOut: () => Promise<void>;
  lessons: Lesson[];
  bookLesson: (draft: BookingDraft) => Promise<Lesson>;
  completeLesson: (id: string) => Promise<void>;
  notifications: AppNotification[];
  markAllRead: () => Promise<void>;
  refreshLessons: () => Promise<void>;
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem("lm-user");
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  });

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync /auth/me on initial load if cookie exists
  useEffect(() => {
    async function checkAuth() {
      try {
        const me = await meetApi.getMe();
        if (me && me.id) {
          setUser(me);
          localStorage.setItem("lm-user", JSON.stringify(me));
        }
      } catch {
        // Not authenticated on backend or offline
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  // Fetch lessons & notifications whenever user changes
  const refreshLessons = async () => {
    if (!user) {
      setLessons([]);
      setNotifications([]);
      return;
    }

    try {
      const backendLessons = await meetApi.listLessons();
      if (backendLessons && backendLessons.length > 0) {
        setLessons(backendLessons);
      } else {
        // Fallback to initial seed lessons
        const fallback = user.role === "teacher" ? TEACHER_LESSONS : STUDENT_LESSONS;
        setLessons(fallback);
      }

      const backendNotifs = await meetApi.listNotifications();
      if (backendNotifs && backendNotifs.length > 0) {
        setNotifications(backendNotifs);
      } else {
        setNotifications([
          {
            id: "n1",
            kind: "system",
            title: "Welcome to Liberum Meet",
            body: "Your profile is active. Browse teachers or manage your schedule.",
            time: "Just now",
            read: false,
          },
        ]);
      }
    } catch {
      // Offline fallback
      const fallback = user.role === "teacher" ? TEACHER_LESSONS : STUDENT_LESSONS;
      setLessons(fallback);
    }
  };

  useEffect(() => {
    if (user) {
      localStorage.setItem("lm-user", JSON.stringify(user));
      refreshLessons();
    } else {
      localStorage.removeItem("lm-user");
      setLessons([]);
      setNotifications([]);
    }
  }, [user]);

  const loginWithBackend = async (email: string, password: string) => {
    const res = await meetApi.login(email, password);
    setUser(res.user);
    return res.user;
  };

  const registerWithBackend = async (name: string, email: string, password: string, role: Role) => {
    const res = await meetApi.register(name, email, password, role);
    setUser(res.user);
    return res.user;
  };

  const signOut = async () => {
    try {
      await meetApi.logout();
    } catch {
      // ignore
    }
    setUser(null);
    localStorage.removeItem("lm-user");
  };

  const bookLesson = async (draft: BookingDraft) => {
    try {
      const newLesson = await meetApi.bookLesson(draft);
      setLessons((prev) => [newLesson, ...prev]);
      await refreshLessons();
      return newLesson;
    } catch (e: any) {
      // Fallback local booking if backend is unavailable
      const fallback: Lesson = {
        id: "les-" + Date.now(),
        teacherId: draft.teacherId,
        studentId: user?.id ?? "student-1",
        teacherName: "Teacher",
        studentName: user?.name ?? "Student",
        title: "Booked Lesson",
        date: draft.date,
        time: draft.time,
        durationMin: 60,
        priceUzs: 100000,
        status: "scheduled",
      };
      setLessons((prev) => [fallback, ...prev]);
      return fallback;
    }
  };

  const completeLesson = async (id: string) => {
    try {
      await meetApi.completeLesson(id);
    } catch {
      // ignore
    }
    setLessons((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: "completed" as const } : l))
    );
  };

  const markAllRead = async () => {
    try {
      await meetApi.markNotificationsRead();
    } catch {
      // ignore
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const value: AppState = {
    user,
    loading,
    signIn: (role) => {
      const demo = role === "teacher" ? DEMO_TEACHER : DEMO_STUDENT;
      setUser(demo);
    },
    loginWithBackend,
    registerWithBackend,
    signOut,
    lessons,
    bookLesson,
    completeLesson,
    notifications,
    markAllRead,
    refreshLessons,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp outside provider");
  return v;
}
