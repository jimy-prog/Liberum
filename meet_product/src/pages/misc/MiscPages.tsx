import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Bell, Calendar, Check, ExternalLink, Globe, MessageSquare, Send, Sparkles, ShieldCheck } from "lucide-react";
import { Avatar, Badge, Btn, Card, EmptyState, Field, Input } from "@/components/ui-kit";
import { useApp } from "@/lib/store";
import { meetApi } from "@/lib/api";
import { fmtUzs } from "@/lib/data";
import { cn } from "@/lib/utils";

/* ================= MESSAGES ================= */
export function MessagesPage() {
  const { user } = useApp();
  const [searchParams] = useSearchParams();
  const initialUserId = searchParams.get("user") ? Number(searchParams.get("user")) : null;

  const [threads, setThreads] = useState<any[]>([]);
  const [activeContactId, setActiveContactId] = useState<number | null>(initialUserId);
  const [messages, setMessages] = useState<any[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const QUICK_INQUIRIES = [
    "Hi! Do you offer trial sessions?",
    "What is your schedule for weekend classes?",
    "Can you help me prepare for IELTS Task 2?",
    "Do you provide custom study materials?",
  ];

  // Fetch threads list
  useEffect(() => {
    meetApi.listDirectMessages()
      .then((data) => {
        if (data && data.length > 0) {
          setThreads(data);
          if (initialUserId) {
            setActiveContactId(initialUserId);
          } else if (!activeContactId) {
            setActiveContactId(data[0].userId);
          }
        } else {
          // fallback
          const fallback = user?.role === "student"
            ? [
                { userId: 4, name: "Timur Abdullaev", initials: "TA", color: "#7B61FF", last: "Welcome to IELTS Speaking! Ready for lessons.", time: "18:42", unread: 0 },
                { userId: 8, name: "Aziza Karimova", initials: "AK", color: "#7B61FF", last: "Review the notes before tomorrow.", time: "17:30", unread: 0 },
              ]
            : [
                { userId: 6, name: "Aziza Karimova (Student)", initials: "AK", color: "#1FAD55", last: "Thank you teacher! Homework is prepared.", time: "18:40", unread: 0 },
              ];
          setThreads(fallback);
          if (initialUserId) {
            setActiveContactId(initialUserId);
          } else if (!activeContactId) {
            setActiveContactId(fallback[0].userId);
          }
        }
      })
      .catch(() => {});
  }, [user, initialUserId]);

  // Load messages for active thread
  useEffect(() => {
    if (!activeContactId) return;
    meetApi.getThreadMessages(activeContactId)
      .then((data) => {
        setMessages(data || []);
      })
      .catch(() => {});

    const pollInterval = setInterval(() => {
      meetApi.getThreadMessages(activeContactId)
        .then((data) => {
          if (data) setMessages(data);
        })
        .catch(() => {});
    }, 4000);

    return () => clearInterval(pollInterval);
  }, [activeContactId]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (customText?: string) => {
    const textToSend = (customText || draft).trim();
    if (!textToSend || !activeContactId || sending) return;
    if (!customText) setDraft("");
    setSending(true);

    const optimistic = {
      id: Date.now(),
      from: "me",
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages(p => [...p, optimistic]);

    try {
      await meetApi.sendDirectMessage(activeContactId, textToSend);
    } catch {
      // keep optimistic
    } finally {
      setSending(false);
    }
  };

  const activeThread = threads.find(t => t.userId === activeContactId) || (initialUserId && activeContactId === initialUserId ? {
    userId: initialUserId,
    name: "Teacher",
    initials: "T",
    color: "#7B61FF",
    role: "teacher",
    time: "Now",
    unread: 0,
    last: "Direct Inquiry"
  } : threads[0]);

  return (
    <div className="mx-auto max-w-5xl animate-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-[28px] font-bold tracking-tight text-ink">Messages</h1>
          <p className="mt-1 text-sm text-ink-500">Ask questions, discuss study goals, and book verified lessons directly.</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1 text-xs text-ink-500">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Telegram Mirroring Active
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-[320px_1fr]">
        <Card className="overflow-hidden">
          <div className="border-b border-line bg-cloud/60 px-4 py-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-400">Conversations</span>
          </div>
          {threads.map((t) => (
            <button
              key={t.userId || t.name}
              onClick={() => setActiveContactId(t.userId)}
              className={cn(
                "flex w-full items-center gap-3 border-b border-line px-4 py-3.5 text-left transition hover:bg-cloud",
                t.userId === activeContactId && "bg-brand-50/60"
              )}
            >
              <Avatar initials={t.initials} color={t.color} size="md" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="truncate text-[13px] font-semibold text-ink">{t.name}</p>
                  <span className="text-[10px] text-ink-400">{t.time}</span>
                </div>
                <p className="mt-0.5 truncate text-xs text-ink-400">{t.last}</p>
              </div>
              {t.unread > 0 && (
                <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-brand-500 text-[9px] font-bold text-white">
                  {t.unread}
                </span>
              )}
            </button>
          ))}
          {threads.length === 0 && (
            <p className="p-4 text-center text-xs text-ink-400">No conversation threads yet.</p>
          )}
        </Card>

        <Card className="flex min-h-[500px] flex-col">
          {activeThread ? (
            <>
              <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <Avatar initials={activeThread.initials} color={activeThread.color} size="sm" />
                  <div>
                    <p className="text-sm font-semibold text-ink">{activeThread.name}</p>
                    <p className="text-[11px] text-ink-400 capitalize">{activeThread.role || "Teacher"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to="/app/teachers"
                    className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink transition hover:border-brand-500 hover:text-brand-600"
                  >
                    <Calendar size={13} /> Book Lesson
                  </Link>
                </div>
              </div>

              {/* Pre-booking Quick Inquiry Suggestions */}
              {messages.length === 0 && (
                <div className="border-b border-line/60 bg-brand-50/40 p-4">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-700">
                    <Sparkles size={13} /> Pre-Booking Quick Inquiries:
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {QUICK_INQUIRIES.map((q) => (
                      <button
                        key={q}
                        onClick={() => sendMessage(q)}
                        className="rounded-lg border border-brand-200 bg-white px-2.5 py-1.5 text-xs font-medium text-brand-900 transition hover:bg-brand-50 hover:border-brand-300 active:scale-95 text-left"
                      >
                        “{q}”
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex-1 space-y-3 overflow-y-auto p-5">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      "flex flex-col max-w-[80%] rounded-2xl px-4 py-2.5 text-[13px]",
                      m.from === "me"
                        ? "ml-auto bg-brand-500 text-white rounded-br-sm"
                        : "bg-cloud text-ink rounded-bl-sm ring-1 ring-line"
                    )}
                  >
                    <p className="leading-relaxed">{m.text}</p>
                    <span className={cn("mt-1 text-[10px]", m.from === "me" ? "text-brand-100 text-right" : "text-ink-400")}>
                      {m.time}
                    </span>
                  </div>
                ))}
                {messages.length === 0 && (
                  <div className="flex h-full items-center justify-center py-12 text-center text-xs text-ink-400">
                    Send a message or select a prompt above to start the conversation.
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              <div className="border-t border-line p-3">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage();
                  }}
                  className="flex items-center gap-2 rounded-full border border-line bg-cloud py-1 pl-4 pr-1 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/10 transition"
                >
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Type an inquiry message…"
                    className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-ink-300"
                  />
                  <button
                    type="submit"
                    disabled={!draft.trim() || sending}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-white transition hover:bg-brand-600 disabled:opacity-40"
                  >
                    <Send size={13} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center p-6">
              <EmptyState
                icon={<MessageSquare size={20} />}
                title="Select a contact"
                body="Choose someone from the list to start messaging."
              />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

/* ================= SETTINGS ================= */
export function SettingsPage() {
  const { user, signOut, updateUser } = useApp();
  const [name, setName] = useState(user?.name || "");
  const [telegramUsername, setTelegramUsername] = useState(user?.telegramUsername || "");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.name) setName(user.name);
    if (user?.telegramUsername) setTelegramUsername(user.telegramUsername);
  }, [user?.name, user?.telegramUsername]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUser({ name, telegramUsername });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl animate-fade-up">
      <h1 className="font-display text-[28px] font-bold tracking-tight text-ink">Settings</h1>
      <Card className="mt-6 p-6">
        <h2 className="font-display text-[15px] font-semibold text-ink">Account</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Full name">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
          </Field>
          <Field label="Email"><Input defaultValue={user?.email} disabled className="opacity-60" /></Field>
          <Field label="Language">
            <select className="h-11 w-full rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-brand-500">
              <option>English</option><option>Русский</option><option>O‘zbek</option>
            </select>
          </Field>
          <Field label="Timezone"><Input defaultValue="UTC+5 — Tashkent" disabled className="opacity-60" /></Field>
        </div>
        <div className="mt-5 flex items-center gap-3">
          <Btn onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </Btn>
          {saved && <Badge tone="green">Saved</Badge>}
        </div>
      </Card>

      {/* Telegram Connector */}
      <Card className="mt-4 p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-[15px] font-semibold text-ink">Telegram Notifications</h2>
              <Badge tone="brand">Uzbekistan Native</Badge>
            </div>
            <p className="mt-1 max-w-md text-xs leading-relaxed text-ink-500">
              Receive real-time instant booking notifications, classroom reminders 15 minutes before, and messages directly in your Telegram.
            </p>
          </div>
          <a
            href="https://t.me/LiberumMeetBot"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 rounded-full bg-[#24A1DE]/10 px-3 py-1.5 text-xs font-semibold text-[#24A1DE] transition hover:bg-[#24A1DE]/20"
          >
            Open Bot <ExternalLink size={12} />
          </a>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Field label="Your Telegram @username">
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-sm font-semibold text-ink-400">@</span>
                <Input
                  value={telegramUsername}
                  onChange={(e) => setTelegramUsername(e.target.value.replace(/^@/, ""))}
                  placeholder="username (e.g. jamshid_dev)"
                  className="pl-8"
                />
              </div>
            </Field>
          </div>
          <Btn onClick={handleSave} disabled={saving} size="md" className="shrink-0">
            {user?.telegramUsername ? "Update Telegram" : "Connect Telegram"}
          </Btn>
        </div>

        {user?.telegramUsername && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-3.5 py-2 text-xs font-medium text-emerald-700">
            <Check size={14} /> Linked to Telegram: @{user.telegramUsername} · Notifications Active
          </div>
        )}
      </Card>

      <Card className="mt-4 p-6">
        <h2 className="font-display text-[15px] font-semibold text-ink">Notifications</h2>
        <div className="mt-3 space-y-3">
          {["Telegram instant alerts (recommended for UZ)", "Lesson reminders (1 hour and 10 minutes before)", "New booking notifications", "Platform updates"].map((label, i) => (
            <label key={label} className="flex cursor-pointer items-center justify-between rounded-xl border border-line px-4 py-3 text-sm text-ink">
              <span className="flex items-center gap-2.5"><Bell size={14} className="text-ink-400" /> {label}</span>
              <input type="checkbox" defaultChecked={i < 3} className="h-4 w-4 accent-brand-500" />
            </label>
          ))}
        </div>
      </Card>

      <Card className="mt-4 p-6">
        <h2 className="font-display text-[15px] font-semibold text-ink">Liberum account</h2>
        <p className="mt-2 flex items-center gap-2 text-[13px] text-ink-500">
          <ShieldCheck size={14} className="text-brand-500" /> This account works across Meet, Studio, Mock, and AI.
        </p>
        <Btn variant="outline" className="mt-4" onClick={signOut}>Sign out</Btn>
      </Card>
    </div>
  );
}

/* ================= ADMIN ================= */
export function AdminPage() {
  const [tab, setTab] = useState<"users" | "teachers" | "lessons">("teachers");
  const [teachers, setTeachers] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      meetApi.getAdminTeachers().catch(() => []),
      meetApi.getAdminUsers().catch(() => []),
      meetApi.getAdminLessons().catch(() => []),
    ])
      .then(([t, u, l]) => {
        if (t && t.length > 0) setTeachers(t);
        if (u && u.length > 0) setUsers(u);
        if (l && l.length > 0) setLessons(l);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleToggleUser = async (userId: number) => {
    try {
      const res = await meetApi.toggleUserStatus(userId);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isActive: res.isActive } : u))
      );
    } catch {
      // ignore
    }
  };

  return (
    <div className="mx-auto max-w-5xl animate-fade-up">
      <div className="flex items-center gap-3">
        <h1 className="font-display text-[28px] font-bold tracking-tight text-ink">Admin Dashboard</h1>
        <Badge tone="ink"><ShieldCheck size={11} /> Master DB</Badge>
        {loading && <span className="text-xs text-ink-400 animate-pulse">Syncing...</span>}
      </div>
      <div className="mt-5 inline-flex rounded-full border border-line bg-white p-1">
        {(["teachers", "users", "lessons"] as const).map((v) => (
          <button key={v} onClick={() => setTab(v)} className={cn("h-8 rounded-full px-4 text-[13px] font-medium capitalize transition", tab === v ? "bg-ink text-white" : "text-ink-500 hover:text-ink")}>
            {v}
          </button>
        ))}
      </div>

      {tab === "teachers" && (
        <Card className="mt-5 overflow-hidden">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-line bg-cloud text-[11px] uppercase tracking-wide text-ink-400">
                <th className="px-5 py-3 font-medium">Teacher</th>
                <th className="px-5 py-3 font-medium">Subjects</th>
                <th className="px-5 py-3 font-medium">Rating</th>
                <th className="px-5 py-3 font-medium">Lessons Taught</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((t) => (
                <tr key={t.id} className="border-b border-line last:border-0 hover:bg-cloud/60">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar initials={t.initials} color={t.color} size="sm" />
                      <div>
                        <span className="font-semibold text-ink">{t.name}</span>
                        <p className="text-[11px] text-ink-400">{t.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-ink-500">{t.subjects?.join(", ") || "General"}</td>
                  <td className="px-5 py-3 font-medium text-ink">★ {t.rating?.toFixed(1)}</td>
                  <td className="px-5 py-3 text-ink-500">{t.lessonsTaught?.toLocaleString()}</td>
                  <td className="px-5 py-3">{t.verified ? <Badge tone="brand">Verified</Badge> : <Badge tone="gray">Standard</Badge>}</td>
                </tr>
              ))}
              {teachers.length === 0 && (
                <tr><td colSpan={5} className="py-6 text-center text-ink-400">No teachers found in database.</td></tr>
              )}
            </tbody>
          </table>
        </Card>
      )}

      {tab === "users" && (
        <Card className="mt-5 overflow-hidden">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-line bg-cloud text-[11px] uppercase tracking-wide text-ink-400">
                <th className="px-5 py-3 font-medium">User</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-line last:border-0 hover:bg-cloud/60">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar initials={u.initials} color={u.color} size="sm" />
                      <span className="font-semibold text-ink">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3"><Badge tone={u.role === "teacher" ? "brand" : "gray"} className="capitalize">{u.role}</Badge></td>
                  <td className="px-5 py-3 text-ink-500">{u.email}</td>
                  <td className="px-5 py-3">
                    <Badge tone={u.isActive ? "green" : "red"}>{u.isActive ? "Active" : "Deactivated"}</Badge>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => handleToggleUser(u.id)}
                      className={cn("text-xs font-medium transition", u.isActive ? "text-ink-400 hover:text-danger" : "text-brand-600 hover:underline")}
                    >
                      {u.isActive ? "Deactivate" : "Reactivate"}
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={5} className="py-6 text-center text-ink-400">No users found.</td></tr>
              )}
            </tbody>
          </table>
        </Card>
      )}

      {tab === "lessons" && (
        <Card className="mt-5 overflow-hidden">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-line bg-cloud text-[11px] uppercase tracking-wide text-ink-400">
                <th className="px-5 py-3 font-medium">Lesson</th>
                <th className="px-5 py-3 font-medium">Teacher</th>
                <th className="px-5 py-3 font-medium">Student</th>
                <th className="px-5 py-3 font-medium">When</th>
                <th className="px-5 py-3 font-medium">Price</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {lessons.map((l) => (
                <tr key={l.id} className="border-b border-line last:border-0 hover:bg-cloud/60">
                  <td className="px-5 py-3 font-semibold text-ink">{l.title}</td>
                  <td className="px-5 py-3 text-ink-500">{l.teacher}</td>
                  <td className="px-5 py-3 text-ink-500">{l.student}</td>
                  <td className="px-5 py-3 text-ink-500">{l.when}</td>
                  <td className="px-5 py-3 font-medium text-ink">{fmtUzs(l.price)}</td>
                  <td className="px-5 py-3"><Badge tone={l.status === "completed" ? "green" : "brand"}>{l.status}</Badge></td>
                </tr>
              ))}
              {lessons.length === 0 && (
                <tr><td colSpan={6} className="py-6 text-center text-ink-400">No bookings recorded yet.</td></tr>
              )}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="mx-auto max-w-2xl py-16 animate-fade-up">
      <EmptyState icon={<Globe size={20} />} title={title} body="This section is part of the roadmap and arrives after the MVP." />
    </div>
  );
}
