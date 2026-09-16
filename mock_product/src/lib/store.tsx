import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DEMO_STUDENT, DEMO_TEACHER, STUDENT_LESSONS, TEACHER_LESSONS, TEACHERS } from "./data";
import type { AppNotification, BookingDraft, Lesson, Role, User } from "./types";

interface AppState {
  user: User | null;
  signIn: (role: Role) => void;
  signOut: () => void;
  lessons: Lesson[];
  bookLesson: (draft: BookingDraft) => Lesson;
  completeLesson: (id: string) => void;
  notifications: AppNotification[];
  markAllRead: () => void;
}

const Ctx = createContext<AppState | null>(null);

const seedNotifications = (role: Role): AppNotification[] =>
  role === "student"
    ? [
        { id: "n1", kind: "reminder", title: "Lesson starts in 1 hour", body: "IELTS Speaking Practice with Aziza Karimova · Today 17:30", time: "1h ago", read: false },
        { id: "n2", kind: "booking", title: "Your lesson has been booked", body: "General English with Jamshid Mahkamov · Thu, Aug 27 · 16:00", time: "Yesterday", read: false },
        { id: "n3", kind: "system", title: "Welcome to Liberum Meet", body: "Complete your profile to get better teacher matches.", time: "2 days ago", read: true },
      ]
    : [
        { id: "n1", kind: "booking", title: "New lesson booking", body: "Jasur Toshev booked IELTS Speaking Practice · Today 17:30", time: "24 min ago", read: false },
        { id: "n2", kind: "reminder", title: "Lesson starts in 1 hour", body: "IELTS Speaking Practice with Jasur Toshev · Today 17:30", time: "1h ago", read: false },
        { id: "n3", kind: "system", title: "Your profile is live", body: "Students can now find and book you on Liberum Meet.", time: "3 days ago", read: true },
      ];

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem("lm-user");
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  });
  const [extraLessons, setExtraLessons] = useState<Lesson[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("lm-lessons") || "[]") as Lesson[];
    } catch {
      return [];
    }
  });
  const [completedIds, setCompletedIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("lm-completed") || "[]") as string[];
    } catch {
      return [];
    }
  });
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    if (user) localStorage.setItem("lm-user", JSON.stringify(user));
    else localStorage.removeItem("lm-user");
    setNotifications(user ? seedNotifications(user.role) : []);
  }, [user]);

  useEffect(() => {
    localStorage.setItem("lm-lessons", JSON.stringify(extraLessons));
  }, [extraLessons]);
  useEffect(() => {
    localStorage.setItem("lm-completed", JSON.stringify(completedIds));
  }, [completedIds]);

  const lessons = useMemo(() => {
    const base = user?.role === "teacher" ? TEACHER_LESSONS : STUDENT_LESSONS;
    return [...extraLessons, ...base].map((l) =>
      completedIds.includes(l.id) ? { ...l, status: "completed" as const } : l
    );
  }, [user, extraLessons, completedIds]);

  const value: AppState = {
    user,
    signIn: (role) => setUser(role === "student" ? DEMO_STUDENT : DEMO_TEACHER),
    signOut: () => setUser(null),
    lessons,
    bookLesson: (draft) => {
      const teacher = TEACHERS.find((t) => t.id === draft.teacherId)!;
      const opt = teacher.lessons.find((l) => l.id === draft.lessonOptionId)!;
      const lesson: Lesson = {
        id: "booked-" + Date.now(),
        teacherId: teacher.id,
        studentId: user?.id ?? "u-student",
        teacherName: teacher.name,
        studentName: user?.name ?? DEMO_STUDENT.name,
        title: opt.title,
        date: draft.date,
        time: draft.time,
        durationMin: opt.durationMin,
        priceUzs: opt.priceUzs,
        status: "scheduled",
      };
      setExtraLessons((p) => [lesson, ...p]);
      setNotifications((p) => [
        {
          id: "n" + Date.now(),
          kind: "booking",
          title: "Your lesson has been booked",
          body: `${opt.title} with ${teacher.name} · ${draft.date} · ${draft.time}`,
          time: "Just now",
          read: false,
        },
        ...p,
      ]);
      return lesson;
    },
    completeLesson: (id) => setCompletedIds((p) => [...p, id]),
    notifications,
    markAllRead: () => setNotifications((p) => p.map((n) => ({ ...n, read: true }))),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp outside provider");
  return v;
}
