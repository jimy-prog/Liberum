export type Role = "student" | "teacher";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  initials: string;
}

export interface LessonOption {
  id: string;
  title: string;
  durationMin: number;
  priceUzs: number;
  description: string;
}

export interface DayAvailability {
  day: string; // Mon..Sun
  enabled: boolean;
  ranges: { start: string; end: string }[];
}

export interface Teacher {
  id: string;
  name: string;
  initials: string;
  title: string;
  subjects: string[];
  specializations: string[];
  experienceYears: number;
  languages: string[];
  bio: string;
  rating: number;
  reviewsCount: number;
  studentsTaught: number;
  lessonsTaught: number;
  verified: boolean;
  online: boolean;
  color: string; // avatar tint
  lessons: LessonOption[];
  availability: DayAvailability[];
  nextAvailable: string;
}

export type LessonStatus =
  | "scheduled"
  | "starting-soon"
  | "live"
  | "completed"
  | "cancelled";

export interface Lesson {
  id: string;
  teacherId: string;
  studentId: string;
  teacherName: string;
  studentName: string;
  title: string;
  date: string; // e.g. "Tue, Aug 25"
  time: string; // e.g. "17:30"
  durationMin: number;
  priceUzs: number;
  status: LessonStatus;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  kind: "booking" | "reminder" | "system";
}

export interface BookingDraft {
  teacherId: string;
  lessonOptionId: string;
  date: string;
  time: string;
}
