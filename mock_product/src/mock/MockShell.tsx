import { useEffect, useState, type ReactNode } from "react";
import { Link, NavLink, useNavigate, useSearchParams } from "react-router";
import {
  BarChart3, Bell, BookOpen, ClipboardList, FilePlus2, History, LayoutDashboard,
  Library, LogOut, Menu, Settings, Users,
} from "lucide-react";
import { useMock } from "./store";
import { Avatar } from "@/components/ui-kit";
import { cn } from "@/lib/utils";
import type { AppNotification } from "@/lib/types";

const studentNav = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/app/tests", label: "Mock Tests", icon: BookOpen },
  { to: "/app/history", label: "Test History", icon: History },
  { to: "/app/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/app/settings", label: "Settings", icon: Settings },
];

const teacherNav = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/app/library", label: "Mock Library", icon: Library },
  { to: "/app/create", label: "Create Mock", icon: FilePlus2 },
  { to: "/app/assign", label: "Assignments", icon: ClipboardList },
  { to: "/app/students", label: "Students", icon: Users },
  { to: "/app/results", label: "Results", icon: BarChart3 },
  { to: "/app/settings", label: "Settings", icon: Settings },
];

function NotifIcon({ kind }: { kind: AppNotification["kind"] }) {
  return (
    <span className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
      kind === "booking" ? "bg-brand-100 text-brand-600" : kind === "reminder" ? "bg-[#FFF6E5] text-[#9A6700]" : "bg-mist text-ink-500")}>
      {kind === "reminder" ? <Bell size={14} /> : <ClipboardList size={14} />}
    </span>
  );
}

export default function MockShell({ children }: { children: ReactNode }) {
  const { user, signIn, signOut, notifications, markAllRead } = useMock();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    document.title = "Liberum Mock — Practice IELTS like the real thing.";
    if (!user) {
      const demo = searchParams.get("demo");
      if (demo === "student" || demo === "teacher") signIn(demo);
      else navigate("/login");
    }
  }, [user]);

  if (!user) return null;

  const nav = user.role === "teacher" ? teacherNav : studentNav;
  const roleColor = user.role === "teacher" ? "#7B61FF" : "#1FAD55";

  const sidebar = (
    <div className="flex h-full flex-col bg-gradient-to-b from-[#7B61FF] via-[#6F55F4] to-[#5A41D8] text-white">
      <div className="flex items-center gap-2 px-5 pb-5 pt-6">
        <Link to="/" className="font-display text-[19px] font-bold tracking-tight">
          Liber<span className="opacity-80">um</span>
        </Link>
        <span className="rounded-full bg-white/15 px-2 py-0.5 font-display text-[10px] font-semibold uppercase tracking-[0.14em]">Mock</span>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setMobileNav(false)}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                isActive ? "bg-white/95 text-brand-700 shadow-sm" : "text-white/75 hover:bg-white/10 hover:text-white"
              )
            }
          >
            <item.icon size={17} strokeWidth={2} />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3">
        <div className="flex items-center gap-3 rounded-xl bg-white/10 p-3">
          <Avatar initials={user.initials} color={roleColor} size="md" className="ring-2 ring-white/30" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold">{user.name}</p>
            <p className="text-[11px] capitalize text-white/60">{user.role}</p>
          </div>
          <button
            onClick={async () => {
              try {
                await fetch("/api/auth/logout", { method: "POST" });
              } catch {
                // ignore
              }
              signOut();
              navigate("/");
            }}
            className="rounded-lg p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
            title="Sign out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-cloud">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 lg:block">{sidebar}</aside>
      {mobileNav && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setMobileNav(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 animate-fade-in">{sidebar}</aside>
        </div>
      )}

      <div className="flex min-h-screen flex-1 flex-col lg:pl-60">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-white/85 px-4 backdrop-blur-md sm:px-6">
          <button className="rounded-lg p-2 text-ink-500 hover:bg-mist lg:hidden" onClick={() => setMobileNav(true)}>
            <Menu size={19} />
          </button>
          <p className="hidden text-[13px] text-ink-400 sm:block">
            Liberum Mock · <span className="font-medium text-ink">IELTS assessment</span>
          </p>
          <div className="ml-auto flex items-center gap-2">
            {user.role === "student" && (
              <Link to="/app/tests" className="hidden h-9 items-center gap-2 rounded-full bg-ink px-4 text-[13px] font-medium text-white transition hover:bg-ink-soft sm:inline-flex">
                <BookOpen size={14} /> Start a mock
              </Link>
            )}
            {user.role === "teacher" && (
              <Link to="/app/create" className="hidden h-9 items-center gap-2 rounded-full bg-ink px-4 text-[13px] font-medium text-white transition hover:bg-ink-soft sm:inline-flex">
                <FilePlus2 size={14} /> Create mock
              </Link>
            )}
            <div className="relative">
              <button onClick={() => setNotifOpen((v) => !v)} className="relative rounded-full p-2.5 text-ink-500 transition hover:bg-mist" aria-label="Notifications">
                <Bell size={18} />
                {unread > 0 && (
                  <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[9px] font-bold text-white">{unread}</span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-12 z-50 w-[380px] max-w-[calc(100vw-2rem)] animate-fade-up rounded-2xl border border-line bg-white p-2 shadow-[0_24px_60px_-16px_rgba(14,15,19,0.25)]">
                  <div className="flex items-center justify-between px-3 py-2">
                    <p className="font-display text-sm font-semibold">Notifications</p>
                    <button onClick={markAllRead} className="text-xs font-medium text-brand-600 hover:underline">Mark all read</button>
                  </div>
                  <div className="max-h-[380px] overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className={cn("flex gap-3 rounded-xl px-3 py-2.5 transition hover:bg-cloud", !n.read && "bg-brand-50/60")}>
                        <NotifIcon kind={n.kind} />
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-ink">{n.title}</p>
                          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-ink-500">{n.body}</p>
                          <p className="mt-1 text-[11px] text-ink-400">{n.time}</p>
                        </div>
                        {!n.read && <span className="ml-auto mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" />}
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setNotifOpen(false)} className="mt-1 w-full rounded-xl py-2 text-center text-xs font-medium text-ink-500 hover:bg-cloud">Close</button>
                </div>
              )}
            </div>
            <Avatar initials={user.initials} color={roleColor} size="md" />
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">{children}</main>
        <footer className="border-t border-line px-6 py-5 text-center text-xs text-ink-400">
          Liberum Mock · Part of the Liberum ecosystem · mock.liberum.uz
        </footer>
      </div>
    </div>
  );
}
