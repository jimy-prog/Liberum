import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, NavLink, useNavigate, useSearchParams } from "react-router";
import {
  Bell, Calendar, CalendarDays, ChevronDown, Compass, Home, LayoutDashboard, LogOut, Menu,
  MessageSquare, Search, Settings, ShieldCheck, User, Video, Wallet,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Avatar, Badge } from "./ui-kit";

const studentNav = [
  { to: "/app", label: "Home", icon: Home, end: true },
  { to: "/app/teachers", label: "Find Teachers", icon: Compass },
  { to: "/app/lessons", label: "My Lessons", icon: CalendarDays },
  { to: "/app/messages", label: "Messages", icon: MessageSquare },
  { to: "/app/student/profile", label: "My Profile", icon: User },
  { to: "/app/settings", label: "Settings", icon: Settings },
];

const teacherNav = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/app/calendar", label: "Calendar", icon: Calendar },
  { to: "/app/availability", label: "Availability", icon: CalendarDays },
  { to: "/app/lessons", label: "Lessons", icon: Video },
  { to: "/app/earnings", label: "Earnings", icon: Wallet },
  { to: "/app/profile", label: "Profile", icon: User },
  { to: "/app/settings", label: "Settings", icon: Settings },
];

function Notifications({ onClose }: { onClose: () => void }) {
  const { notifications, markAllRead } = useApp();
  return (
    <div className="absolute right-0 top-12 z-50 w-[380px] max-w-[calc(100vw-2rem)] animate-fade-up rounded-2xl border border-line bg-white p-2 shadow-[0_24px_60px_-16px_rgba(14,15,19,0.25)]">
      <div className="flex items-center justify-between px-3 py-2">
        <p className="font-display text-sm font-semibold">Notifications</p>
        <button onClick={markAllRead} className="text-xs font-medium text-brand-600 hover:underline">
          Mark all read
        </button>
      </div>
      <div className="max-h-[380px] overflow-y-auto">
        {notifications.map((n) => (
          <div key={n.id} className={cn("flex gap-3 rounded-xl px-3 py-2.5 transition hover:bg-cloud", !n.read && "bg-brand-50/60")}>
            <span
              className={cn(
                "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                n.kind === "booking" ? "bg-brand-100 text-brand-600" : n.kind === "reminder" ? "bg-[#FFF6E5] text-[#9A6700]" : "bg-mist text-ink-500"
              )}
            >
              {n.kind === "booking" ? <CalendarDays size={14} /> : n.kind === "reminder" ? <Bell size={14} /> : <ShieldCheck size={14} />}
            </span>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-ink">{n.title}</p>
              <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-ink-500">{n.body}</p>
              <p className="mt-1 text-[11px] text-ink-400">{n.time}</p>
            </div>
            {!n.read && <span className="ml-auto mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" />}
          </div>
        ))}
      </div>
      <button onClick={onClose} className="mt-1 w-full rounded-xl py-2 text-center text-xs font-medium text-ink-500 hover:bg-cloud">
        Close
      </button>
    </div>
  );
}

function UserProfileMenu({ onClose }: { onClose: () => void }) {
  const { user, signOut } = useApp();
  const navigate = useNavigate();
  if (!user) return null;

  const profileUrl = user.role === "teacher" ? "/app/profile" : "/app/student/profile";

  return (
    <div className="absolute right-0 top-12 z-50 w-64 animate-fade-up rounded-2xl border border-line bg-white p-2 shadow-[0_24px_60px_-16px_rgba(14,15,19,0.25)] ring-1 ring-black/5">
      {/* User Header */}
      <div className="border-b border-line px-3 pb-3 pt-2">
        <div className="flex items-center gap-2.5">
          <Avatar initials={user.initials} color={user.role === "teacher" ? "#7B61FF" : "#1FAD55"} size="md" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-bold text-ink">{user.name}</p>
            <p className="truncate text-xs text-ink-400">{user.email}</p>
          </div>
        </div>
        <div className="mt-2.5 flex items-center justify-between">
          <Badge tone={user.role === "teacher" ? "brand" : "green"} className="capitalize">
            {user.role} account
          </Badge>
          <span className="text-[10px] font-medium text-ink-400">ID #{user.id}</span>
        </div>
      </div>

      {/* Navigation options */}
      <div className="mt-1 space-y-0.5">
        <Link
          to={profileUrl}
          onClick={onClose}
          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium text-ink transition hover:bg-cloud"
        >
          <User size={15} className="text-brand-500" />
          My Profile
        </Link>
        <Link
          to="/app/settings"
          onClick={onClose}
          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium text-ink transition hover:bg-cloud"
        >
          <Settings size={15} className="text-ink-400" />
          Account Settings
        </Link>
        <Link
          to="/app/messages"
          onClick={onClose}
          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium text-ink transition hover:bg-cloud"
        >
          <MessageSquare size={15} className="text-ink-400" />
          Messages
        </Link>
        {user.role === "teacher" && (
          <Link
            to="/app/earnings"
            onClick={onClose}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium text-ink transition hover:bg-cloud"
          >
            <Wallet size={15} className="text-ink-400" />
            Earnings & Payouts
          </Link>
        )}
      </div>

      {/* Telegram status */}
      <div className="mt-1 border-t border-line pt-1">
        <Link
          to="/app/settings"
          onClick={onClose}
          className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-ink-500 transition hover:bg-cloud"
        >
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#24A1DE]" />
            Telegram Alerts
          </span>
          <span className="text-[11px] font-semibold text-brand-600">
            {user.telegramUsername ? `@${user.telegramUsername}` : "Connect"}
          </span>
        </Link>
      </div>

      {/* Logout */}
      <div className="mt-1 border-t border-line pt-1">
        <button
          onClick={() => {
            onClose();
            signOut();
            navigate("/");
          }}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium text-danger transition hover:bg-red-50"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </div>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  const { user, signOut, signIn, lessons, notifications } = useApp();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const unread = notifications.filter((n) => !n.read).length;

  // Click outside & Escape key listeners
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setNotifOpen(false);
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const [searchParams] = useSearchParams();
  useEffect(() => {
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
        <span className="rounded-full bg-white/15 px-2 py-0.5 font-display text-[10px] font-semibold uppercase tracking-[0.14em]">
          Meet
        </span>
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
            onClick={() => {
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
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 lg:block">{sidebar}</aside>

      {/* Mobile sidebar */}
      {mobileNav && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setMobileNav(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 animate-fade-in">{sidebar}</aside>
        </div>
      )}

      <div className="flex min-h-screen flex-1 flex-col lg:pl-60">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-white/85 px-4 backdrop-blur-md sm:px-6">
          <button className="rounded-lg p-2 text-ink-500 hover:bg-mist lg:hidden" onClick={() => setMobileNav(true)}>
            <Menu size={19} />
          </button>
          <div className="relative hidden max-w-md flex-1 sm:block">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              placeholder={user.role === "teacher" ? "Search lessons, students…" : "Search teachers, subjects…"}
              className="h-9 w-full rounded-full border border-line bg-cloud pl-9 pr-4 text-[13px] outline-none transition placeholder:text-ink-400 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            {user.role === "student" && (
              <Link
                to="/app/teachers"
                className="hidden h-9 items-center gap-2 rounded-full bg-ink px-4 text-[13px] font-medium text-white transition hover:bg-ink-soft sm:inline-flex"
              >
                <Compass size={14} /> Find a teacher
              </Link>
            )}
            <div ref={notifRef} className="relative">
              <button
                onClick={() => {
                  setNotifOpen((v) => !v);
                  setProfileOpen(false);
                }}
                className="relative rounded-full p-2.5 text-ink-500 transition hover:bg-mist"
                aria-label="Notifications"
              >
                <Bell size={18} />
                {unread > 0 && (
                  <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[9px] font-bold text-white">
                    {unread}
                  </span>
                )}
              </button>
              {notifOpen && <Notifications onClose={() => setNotifOpen(false)} />}
            </div>

            {/* Profile Dropdown Trigger */}
            <div ref={profileRef} className="relative">
              <button
                onClick={() => {
                  setProfileOpen((v) => !v);
                  setNotifOpen(false);
                }}
                className="flex items-center gap-2.5 rounded-full p-1 transition hover:bg-mist/80 sm:px-2.5 sm:py-1.5"
                aria-label="User profile menu"
              >
                <Avatar initials={user.initials} color={roleColor} size="md" />
                <div className="hidden text-left xl:block">
                  <p className="text-[13px] font-semibold leading-tight text-ink">{user.name}</p>
                  <Badge tone={user.role === "teacher" ? "brand" : "green"} className="mt-0.5 text-[10px] capitalize">
                    {user.role}
                  </Badge>
                </div>
                <ChevronDown size={14} className={cn("hidden text-ink-400 transition sm:block", profileOpen && "rotate-180")} />
              </button>
              {profileOpen && <UserProfileMenu onClose={() => setProfileOpen(false)} />}
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">{children}</main>

        <footer className="border-t border-line px-6 py-5 text-center text-xs text-ink-400">
          Liberum Meet · Part of the Liberum ecosystem · meet.liberum.uz
        </footer>
      </div>

      {/* Floating classroom quick-join for active / live lessons */}
      {(() => {
        const liveLesson = lessons.find((l) => l.status === "live" || l.status === "starting-soon");
        if (!liveLesson) return null;
        return (
          <Link
            to={`/classroom/${liveLesson.id}`}
            className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-brand-500 px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_12px_32px_-8px_rgba(123,97,255,0.6)] transition hover:bg-brand-600"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
            </span>
            Enter Live Classroom
          </Link>
        );
      })()}
    </div>
  );
}
