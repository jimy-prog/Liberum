// API client for Meet Liberum backend integration
import type { BookingDraft, DayAvailability, Lesson, Role, Teacher, User } from "./types";

const API_BASE = "/api/meet";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    credentials: "include", // send cookies
  });

  if (!res.ok) {
    let errorMsg = "Request failed";
    try {
      const data = await res.json();
      errorMsg = data.detail || data.message || errorMsg;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return res.json();
}

export const meetApi = {
  // Auth
  async register(name: string, email: string, password: string, role: Role) {
    return request<{ success: boolean; user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, role }),
    });
  },

  async login(identifier: string, password: string) {
    return request<{ success: boolean; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ identifier, password }),
    });
  },

  async getMe() {
    return request<User>("/auth/me");
  },

  async logout() {
    return request<{ success: boolean }>("/auth/logout", {
      method: "POST",
    });
  },

  async updateAccount(data: { name?: string; language?: string }) {
    return request<{ success: boolean; user: User }>("/auth/account", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Teachers
  async listTeachers() {
    return request<Teacher[]>("/teachers");
  },

  async getTeacher(id: string) {
    return request<Teacher>(`/teachers/${id}`);
  },

  async getMyTeacherProfile() {
    return request<Teacher>("/teacher/my-profile");
  },

  async updateMyTeacherProfile(data: {
    headline: string;
    bio: string;
    subjects: string[];
    specializations: string[];
    languages: string[];
    experienceYears: number;
    lessons: { id?: string; title: string; durationMin: number; priceUzs: number; description: string }[];
  }) {
    return request<{ success: boolean }>("/teacher/my-profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Availability
  async getMyAvailability() {
    return request<DayAvailability[]>("/teacher/availability");
  },

  async updateMyAvailability(days: DayAvailability[]) {
    return request<{ success: boolean }>("/teacher/availability", {
      method: "PUT",
      body: JSON.stringify(days),
    });
  },

  // Bookings & Lessons
  async bookLesson(draft: BookingDraft) {
    return request<Lesson>("/bookings", {
      method: "POST",
      body: JSON.stringify(draft),
    });
  },

  async listLessons() {
    return request<Lesson[]>("/lessons");
  },

  async completeLesson(id: string) {
    return request<{ success: boolean }>(`/lessons/${id}/complete`, {
      method: "POST",
    });
  },

  // Classroom Chat
  async getClassroomMessages(lessonId: string) {
    return request<{ id: number; from: "me" | "them"; name: string; text: string; time: string }[]>(
      `/classroom/${lessonId}/messages`
    );
  },

  async sendClassroomMessage(lessonId: string, text: string) {
    return request<{ id: number; from: "me" | "them"; name: string; text: string; time: string }>(
      `/classroom/${lessonId}/messages`,
      {
        method: "POST",
        body: JSON.stringify({ text }),
      }
    );
  },

  // Notifications
  async listNotifications() {
    return request<{ id: string; title: string; body: string; time: string; read: boolean; kind: "booking" | "reminder" | "system" }[]>(
      "/notifications"
    );
  },

  async markNotificationsRead() {
    return request<{ success: boolean }>("/notifications/mark-read", {
      method: "POST",
    });
  },

  // Stats
  async getTeacherStats() {
    return request<{
      lessonsToday: number;
      thisWeek: number;
      rating: number;
      reviewsCount: number;
      earnings: number;
    }>("/teacher/stats");
  },

  // Direct Messages
  async listDirectMessages() {
    return request<{
      userId: number;
      name: string;
      role: string;
      initials: string;
      color: string;
      last: string;
      time: string;
      unread: number;
    }[]>("/messages");
  },

  async getThreadMessages(contactId: number) {
    return request<{
      id: number;
      from: "me" | "them";
      text: string;
      time: string;
    }[]>(`/messages/${contactId}`);
  },

  async sendDirectMessage(recipientId: number, message: string) {
    return request<{
      id: number;
      from: "me";
      text: string;
      time: string;
    }>("/messages", {
      method: "POST",
      body: JSON.stringify({ recipient_id: recipientId, message }),
    });
  },
};
