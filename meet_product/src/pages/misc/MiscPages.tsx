import { useState } from "react";
import { Bell, Globe, MessageSquare, Send, ShieldCheck } from "lucide-react";
import { Avatar, Badge, Btn, Card, EmptyState, Field, Input } from "@/components/ui-kit";
import { useApp } from "@/lib/store";
import { fmtUzs, TEACHERS } from "@/lib/data";
import { cn } from "@/lib/utils";

/* ================= MESSAGES ================= */
export function MessagesPage() {
  const { user } = useApp();
  const threads = user?.role === "student"
    ? [
        { name: "Aziza Karimova", initials: "AK", color: "#7B61FF", last: "Great progress today — review the Part 3 notes I sent.", time: "18:42", unread: 1 },
        { name: "Jamshid Mahkamov", initials: "JM", color: "#0E0F13", last: "See you on Thursday at 16:00!", time: "Yesterday", unread: 0 },
        { name: "Madina Rahimova", initials: "MR", color: "#1FAD55", last: "Bring your last SAT practice results.", time: "Mon", unread: 0 },
      ]
    : [
        { name: "Jasur Toshev", initials: "JT", color: "#1FAD55", last: "Thank you for the lesson! Homework sent.", time: "18:40", unread: 1 },
        { name: "Madina Rahimova", initials: "MR", color: "#7B61FF", last: "Can we move Friday to 18:00?", time: "Yesterday", unread: 1 },
        { name: "Sofia Karimova", initials: "SK", color: "#F5A623", last: "Looking forward to the trial lesson.", time: "Sun", unread: 0 },
      ];
  return (
    <div className="mx-auto max-w-4xl animate-fade-up">
      <h1 className="font-display text-[28px] font-bold tracking-tight text-ink">Messages</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-[300px_1fr]">
        <Card className="overflow-hidden">
          {threads.map((t, i) => (
            <button key={t.name} className={cn("flex w-full items-center gap-3 border-b border-line px-4 py-3.5 text-left transition hover:bg-cloud", i === 0 && "bg-brand-50/60")}>
              <Avatar initials={t.initials} color={t.color} size="md" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="truncate text-[13px] font-semibold text-ink">{t.name}</p>
                  <span className="text-[10px] text-ink-400">{t.time}</span>
                </div>
                <p className="mt-0.5 truncate text-xs text-ink-400">{t.last}</p>
              </div>
              {t.unread > 0 && <span className="flex h-4.5 w-4.5 h-[18px] w-[18px] items-center justify-center rounded-full bg-brand-500 text-[9px] font-bold text-white">{t.unread}</span>}
            </button>
          ))}
        </Card>
        <Card className="flex min-h-[420px] flex-col">
          <div className="flex items-center gap-3 border-b border-line px-5 py-3.5">
            <Avatar initials={threads[0].initials} color={threads[0].color} size="sm" />
            <p className="text-sm font-semibold text-ink">{threads[0].name}</p>
          </div>
          <div className="flex flex-1 items-center justify-center p-6">
            <EmptyState
              icon={<MessageSquare size={20} />}
              title="Full messaging is coming soon"
              body="For now, use the classroom chat during lessons. Booking and schedule messages arrive as notifications."
            />
          </div>
          <div className="border-t border-line p-3">
            <div className="flex items-center gap-2 rounded-full border border-line bg-cloud py-1 pl-4 pr-1">
              <input disabled placeholder="Messaging coming soon…" className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-ink-300" />
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-mist text-ink-300"><Send size={13} /></span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ================= SETTINGS ================= */
export function SettingsPage() {
  const { user, signOut } = useApp();
  const [saved, setSaved] = useState(false);
  return (
    <div className="mx-auto max-w-2xl animate-fade-up">
      <h1 className="font-display text-[28px] font-bold tracking-tight text-ink">Settings</h1>
      <Card className="mt-6 p-6">
        <h2 className="font-display text-[15px] font-semibold text-ink">Account</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Full name"><Input defaultValue={user?.name} /></Field>
          <Field label="Email"><Input defaultValue={user?.email} disabled className="opacity-60" /></Field>
          <Field label="Language">
            <select className="h-11 w-full rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-brand-500">
              <option>English</option><option>Русский</option><option>O‘zbek</option>
            </select>
          </Field>
          <Field label="Timezone"><Input defaultValue="UTC+5 — Tashkent" disabled className="opacity-60" /></Field>
        </div>
        <div className="mt-5 flex items-center gap-3">
          <Btn onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}>Save changes</Btn>
          {saved && <Badge tone="green">Saved</Badge>}
        </div>
      </Card>

      <Card className="mt-4 p-6">
        <h2 className="font-display text-[15px] font-semibold text-ink">Notifications</h2>
        <div className="mt-3 space-y-3">
          {["Lesson reminders (1 hour and 10 minutes before)", "New booking notifications", "Platform updates"].map((label, i) => (
            <label key={label} className="flex cursor-pointer items-center justify-between rounded-xl border border-line px-4 py-3 text-sm text-ink">
              <span className="flex items-center gap-2.5"><Bell size={14} className="text-ink-400" /> {label}</span>
              <input type="checkbox" defaultChecked={i < 2} className="h-4 w-4 accent-brand-500" />
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
  return (
    <div className="mx-auto max-w-5xl animate-fade-up">
      <div className="flex items-center gap-3">
        <h1 className="font-display text-[28px] font-bold tracking-tight text-ink">Admin</h1>
        <Badge tone="ink"><ShieldCheck size={11} /> Internal</Badge>
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
                <th className="px-5 py-3 font-medium">Lessons</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {TEACHERS.map((t) => (
                <tr key={t.id} className="border-b border-line last:border-0 hover:bg-cloud/60">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar initials={t.initials} color={t.color} size="sm" />
                      <span className="font-semibold text-ink">{t.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-ink-500">{t.subjects.join(", ")}</td>
                  <td className="px-5 py-3 font-medium text-ink">{t.rating.toFixed(1)}</td>
                  <td className="px-5 py-3 text-ink-500">{t.lessonsTaught.toLocaleString()}</td>
                  <td className="px-5 py-3">{t.verified ? <Badge tone="brand">Verified</Badge> : <Badge tone="gray">Pending</Badge>}</td>
                  <td className="px-5 py-3 text-right">
                    <button className="text-xs font-medium text-ink-400 hover:text-danger">Deactivate</button>
                  </td>
                </tr>
              ))}
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
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {[
                ["Jasur Toshev", "Student", "jasur@student.liberum.uz", "#1FAD55"],
                ["Aziza Karimova", "Teacher", "aziza@liberum.uz", "#7B61FF"],
                ["Madina Rahimova", "Student", "madina@student.liberum.uz", "#F5A623"],
                ["Bekzod Alimov", "Student", "bekzod@student.liberum.uz", "#3B82F6"],
              ].map(([name, role, email, color]) => (
                <tr key={email} className="border-b border-line last:border-0 hover:bg-cloud/60">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar initials={name.split(" ").map((w) => w[0]).join("")} color={color} size="sm" />
                      <span className="font-semibold text-ink">{name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3"><Badge tone={role === "Teacher" ? "brand" : "gray"}>{role}</Badge></td>
                  <td className="px-5 py-3 text-ink-500">{email}</td>
                  <td className="px-5 py-3 text-right">
                    <button className="text-xs font-medium text-ink-400 hover:text-danger">Deactivate</button>
                  </td>
                </tr>
              ))}
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
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {[
                ["IELTS Speaking Practice", "Aziza Karimova", "Jasur Toshev", "Today · 17:30", 120000],
                ["General English", "Jamshid Mahkamov", "Jasur Toshev", "Thu · 16:00", 90000],
                ["SAT Math", "Madina Rahimova", "Jasur Toshev", "Sat · 14:00", 110000],
              ].map(([title, teacher, student, when, price]) => (
                <tr key={String(title) + String(when)} className="border-b border-line last:border-0 hover:bg-cloud/60">
                  <td className="px-5 py-3 font-semibold text-ink">{title}</td>
                  <td className="px-5 py-3 text-ink-500">{teacher}</td>
                  <td className="px-5 py-3 text-ink-500">{student}</td>
                  <td className="px-5 py-3 text-ink-500">{when}</td>
                  <td className="px-5 py-3 font-medium text-ink">{fmtUzs(price as number)}</td>
                  <td className="px-5 py-3 text-right">
                    <button className="text-xs font-medium text-ink-400 hover:text-danger">Cancel</button>
                  </td>
                </tr>
              ))}
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
