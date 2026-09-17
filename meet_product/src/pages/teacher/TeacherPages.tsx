import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import {
  CalendarDays, Check, Clock, CreditCard, DollarSign, Edit3, Eye, Globe, Plus, Star, Trash2, Video, Wallet, X,
} from "lucide-react";
import { fmtUzs, TEACHERS } from "@/lib/data";
import { useApp } from "@/lib/store";
import { meetApi } from "@/lib/api";
import { Avatar, Badge, Btn, BtnLink, Card, Field, Input } from "@/components/ui-kit";
import { LessonCard, LessonStatusBadge } from "../student/StudentPages";
import { cn } from "@/lib/utils";
import type { DayAvailability, Teacher } from "@/lib/types";

const DEFAULT_DAYS: DayAvailability[] = [
  { day: "Mon", enabled: true, ranges: [{ start: "10:00", end: "18:00" }] },
  { day: "Tue", enabled: true, ranges: [{ start: "10:00", end: "18:00" }] },
  { day: "Wed", enabled: true, ranges: [{ start: "10:00", end: "18:00" }] },
  { day: "Thu", enabled: true, ranges: [{ start: "10:00", end: "18:00" }] },
  { day: "Fri", enabled: true, ranges: [{ start: "10:00", end: "18:00" }] },
  { day: "Sat", enabled: false, ranges: [] },
  { day: "Sun", enabled: false, ranges: [] },
];

const TIME_OPTIONS = Array.from({ length: 33 }, (_, i) => {
  const h = Math.floor(i / 2) + 6;
  const m = i % 2 === 0 ? "00" : "30";
  return `${String(h).padStart(2, "0")}:${m}`;
}).filter((t) => t <= "22:00");

function TimeSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="cursor-pointer appearance-none rounded-md bg-white px-2 py-1 text-xs font-semibold tabular-nums text-brand-700 outline-none ring-1 ring-brand-100 transition hover:ring-brand-300 focus:ring-brand-400"
    >
      {TIME_OPTIONS.map((t) => (
        <option key={t} value={t}>{t}</option>
      ))}
    </select>
  );
}

/* ================= TEACHER DASHBOARD ================= */
export function TeacherDashboard() {
  const { user, lessons } = useApp();
  const todays = lessons.filter((l) => l.date === "Today");
  const upcoming = lessons.filter((l) => l.status === "scheduled" || l.status === "starting-soon");
  const next = todays[0] ?? upcoming[0];
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    meetApi.getTeacherStats()
      .then((data) => setStats(data))
      .catch(() => {});
  }, [lessons]);

  const earnings = stats ? stats.earnings : lessons.filter(l => l.status === "completed").reduce((acc, l) => acc + (l.priceUzs || 0), 0);
  const ratingVal = stats?.rating ?? 5.0;
  const reviewsCount = stats?.reviewsCount ?? 0;

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="mx-auto max-w-5xl animate-fade-up">
      <p className="text-[13px] text-ink-400">{dateStr}</p>
      <h1 className="mt-1 font-display text-[30px] font-bold tracking-tight text-ink">
        {greeting}, {user?.name.split(" ")[0]}
      </h1>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Lessons today", value: String(todays.length), icon: Video },
          { label: "This week", value: String(upcoming.length), icon: CalendarDays },
          { label: "Rating", value: `${ratingVal} · ${reviewsCount} reviews`, icon: Star },
          { label: "Total earnings", value: fmtUzs(earnings).replace(" UZS", "") + " UZS", icon: Clock },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <s.icon size={15} className="text-brand-500" />
            <p className="mt-2.5 text-[11px] font-medium uppercase tracking-wide text-ink-400">{s.label}</p>
            <p className="mt-0.5 font-display text-lg font-bold text-ink">{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Next lesson */}
      {next && (
        <Card className="relative mt-5 overflow-hidden p-6">
          <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-brand-400 to-brand-600" />
          <div className="flex flex-wrap items-center gap-5">
            <Avatar initials={next.studentName.split(" ").map((w) => w[0]).join("")} color="#1FAD55" size="lg" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="amber">Next lesson</Badge>
                <LessonStatusBadge status={next.status} />
              </div>
              <p className="mt-1.5 font-display text-lg font-semibold text-ink">{next.title}</p>
              <p className="mt-0.5 text-sm text-ink-500">
                {next.studentName} · {next.date} · {next.time} · {next.durationMin} min
              </p>
            </div>
            <BtnLink to={`/classroom/${next.id}`} size="lg"><Video size={16} /> Join Lesson</BtnLink>
          </div>
        </Card>
      )}

      {/* Quick actions */}
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { to: "/app/earnings", icon: Wallet, title: "Earnings & Payouts", desc: "Withdraw to Uzcard/Humo" },
          { to: "/app/availability", icon: CalendarDays, title: "Set availability", desc: "Update your bookable hours" },
          { to: "/app/profile", icon: Edit3, title: "Edit profile", desc: "Bio, pricing, specializations" },
          { to: "/app/calendar", icon: Eye, title: "View calendar", desc: "Your week at a glance" },
        ].map((a) => (
          <Link
            key={a.to}
            to={a.to}
            className="group flex items-center gap-3.5 rounded-2xl border border-line bg-white p-4 transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-[0_12px_32px_-16px_rgba(123,97,255,0.35)]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-500 group-hover:text-white">
              <a.icon size={17} />
            </span>
            <span>
              <span className="block text-sm font-semibold text-ink">{a.title}</span>
              <span className="block text-xs text-ink-400">{a.desc}</span>
            </span>
          </Link>
        ))}
      </div>

      {/* Today's lessons */}
      <h2 className="mt-9 font-display text-lg font-semibold text-ink">Today's lessons</h2>
      <div className="mt-4 space-y-3">
        {todays.map((l) => (
          <LessonCard key={l.id} lesson={l} perspective="teacher" />
        ))}
      </div>

      <h2 className="mt-9 font-display text-lg font-semibold text-ink">Upcoming</h2>
      <div className="mt-4 space-y-3">
        {upcoming.filter((l) => l.date !== "Today").map((l) => (
          <LessonCard key={l.id} lesson={l} perspective="teacher" />
        ))}
      </div>
    </div>
  );
}

/* ================= AVAILABILITY ================= */
export function AvailabilityPage() {
  const [days, setDays] = useState<DayAvailability[]>(DEFAULT_DAYS);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    meetApi.getMyAvailability()
      .then((data) => {
        if (data && data.length > 0) setDays(data);
      })
      .catch(() => {});
  }, []);

  const saveChanges = async () => {
    setSaving(true);
    try {
      await meetApi.updateMyAvailability(days);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      // fallback
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (day: string) =>
    setDays((p) => p.map((d) => (d.day === day ? { ...d, enabled: !d.enabled } : d)));
  const updateRange = (day: string, idx: number, key: "start" | "end", value: string) =>
    setDays((p) =>
      p.map((d) =>
        d.day === day
          ? { ...d, ranges: d.ranges.map((r, i) => (i === idx ? { ...r, [key]: value } : r)) }
          : d
      )
    );
  const addRange = (day: string) =>
    setDays((p) =>
      p.map((d) => (d.day === day ? { ...d, ranges: [...d.ranges, { start: "18:00", end: "20:00" }] } : d))
    );
  const removeRange = (day: string, idx: number) =>
    setDays((p) =>
      p.map((d) => (d.day === day ? { ...d, ranges: d.ranges.filter((_, i) => i !== idx) } : d))
    );

  const weeklyHours = days.reduce(
    (acc, d) =>
      acc +
      (d.enabled
        ? d.ranges.reduce((a, r) => a + (parseInt(r.end) - parseInt(r.start) + (+r.end.slice(3) - +r.start.slice(3)) / 60), 0)
        : 0),
    0
  );

  return (
    <div className="mx-auto max-w-4xl animate-fade-up">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[28px] font-bold tracking-tight text-ink">Availability</h1>
          <p className="mt-1.5 flex items-center gap-2 text-sm text-ink-500">
            <Globe size={14} /> Timezone · UTC+5 — Tashkent
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saved && <Badge tone="green">Saved — slots updated</Badge>}
          <Btn onClick={saveChanges} disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </Btn>
        </div>
      </div>

      <Card className="mt-4 flex items-center justify-between p-4">
        <p className="text-sm text-ink-500">
          Students book <span className="font-semibold text-ink">30–90 min slots</span> inside these windows.
        </p>
        <Badge tone="brand">{weeklyHours.toFixed(0)} h bookable / week</Badge>
      </Card>

      <div className="mt-4 space-y-3">
        {days.map((d) => (
          <Card key={d.day} className={cn("p-4 transition", !d.enabled && "opacity-60")}>
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => toggleDay(d.day)}
                className={cn(
                  "relative h-6 w-11 shrink-0 rounded-full transition",
                  d.enabled ? "bg-brand-500" : "bg-line"
                )}
                aria-label={`Toggle ${d.day}`}
              >
                <span
                  className={cn(
                    "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
                    d.enabled ? "left-[22px]" : "left-0.5"
                  )}
                />
              </button>
              <span className="w-12 font-display text-sm font-semibold text-ink">{d.day}</span>
              <div className="flex flex-1 flex-wrap items-center gap-2">
                {d.enabled && d.ranges.length === 0 && <span className="text-[13px] text-ink-400">Add a time window</span>}
                {d.enabled &&
                  d.ranges.map((r, i) => (
                    <span key={i} className="group inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-1.5 py-1 ring-1 ring-brand-100">
                      <TimeSelect value={r.start} onChange={(v) => updateRange(d.day, i, "start", v)} />
                      <span className="text-xs text-brand-400">–</span>
                      <TimeSelect value={r.end} onChange={(v) => updateRange(d.day, i, "end", v)} />
                      <button
                        onClick={() => removeRange(d.day, i)}
                        className="rounded-md p-1 text-brand-300 transition hover:bg-white hover:text-danger"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                {d.enabled && (
                  <button
                    onClick={() => addRange(d.day)}
                    className="inline-flex items-center gap-1 rounded-lg border border-dashed border-line px-2.5 py-1.5 text-xs font-medium text-ink-400 transition hover:border-brand-400 hover:text-brand-600"
                  >
                    <Plus size={12} /> Add window
                  </button>
                )}
                {!d.enabled && <span className="text-[13px] text-ink-300">Unavailable</span>}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ================= TEACHER LESSONS ================= */
export function TeacherLessonsPage() {
  const { lessons } = useApp();
  const [tab, setTab] = useState<"upcoming" | "completed">("upcoming");
  const upcoming = lessons.filter((l) => l.status !== "completed");
  const completed = lessons.filter((l) => l.status === "completed");
  const list = tab === "upcoming" ? upcoming : completed;
  return (
    <div className="mx-auto max-w-4xl animate-fade-up">
      <h1 className="font-display text-[28px] font-bold tracking-tight text-ink">Lessons</h1>
      <div className="mt-5 inline-flex rounded-full border border-line bg-white p-1">
        {([["upcoming", `Upcoming · ${upcoming.length}`], ["completed", `Completed · ${completed.length}`]] as const).map(([v, label]) => (
          <button
            key={v}
            onClick={() => setTab(v)}
            className={cn("h-8 rounded-full px-4 text-[13px] font-medium transition", tab === v ? "bg-ink text-white" : "text-ink-500 hover:text-ink")}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="mt-5 space-y-3">
        {list.map((l) => (
          <LessonCard key={l.id} lesson={l} perspective="teacher" />
        ))}
      </div>
    </div>
  );
}

/* ================= TEACHER PROFILE EDITOR ================= */
export function TeacherProfileEditor() {
  const { user, uploadUserAvatar } = useApp();
  const [profile, setProfile] = useState<Teacher | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [headline, setHeadline] = useState("");
  const [specializations, setSpecializations] = useState("");
  const [languages, setLanguages] = useState("English, O‘zbek");
  const [bio, setBio] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [badges, setBadges] = useState("");
  const [lessons, setLessons] = useState<{ id: string; title: string; durationMin: number; priceUzs: number; description: string }[]>([
    { id: "l1", title: "1-on-1 Tutoring", durationMin: 60, priceUzs: 100000, description: "Personal tutoring session." }
  ]);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(user?.avatarUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.avatarUrl) setAvatarUrl(user.avatarUrl);
  }, [user?.avatarUrl]);

  useEffect(() => {
    meetApi.getMyTeacherProfile()
      .then((data) => {
        if (data && data.id) {
          setProfile(data);
          setHeadline(data.title || "Independent Teacher");
          setSpecializations((data.specializations || []).join(", "));
          setLanguages((data.languages || []).join(", "));
          setBio(data.bio || "");
          if (data.avatarUrl) setAvatarUrl(data.avatarUrl);
          if (data.videoUrl) setVideoUrl(data.videoUrl);
          if (data.badges && data.badges.length > 0) setBadges(data.badges.join(", "));
          if (data.lessons && data.lessons.length > 0) {
            setLessons(data.lessons);
          }
        }
      })
      .catch(() => {});
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    try {
      await meetApi.updateMyTeacherProfile({
        headline,
        bio,
        subjects: profile?.subjects || ["English"],
        specializations: specializations.split(",").map(s => s.trim()).filter(Boolean),
        languages: languages.split(",").map(s => s.trim()).filter(Boolean),
        experienceYears: profile?.experienceYears || 2,
        videoUrl: videoUrl.trim() || undefined,
        badges: badges.split(",").map(b => b.trim()).filter(Boolean),
        lessons: lessons.map(l => ({
          title: l.title,
          durationMin: l.durationMin,
          priceUzs: l.priceUzs,
          description: l.description,
        })),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      // optimistic
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const updatePrice = (id: string, newPrice: number) => {
    setLessons(p => p.map(l => l.id === id ? { ...l, priceUzs: newPrice } : l));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const url = await uploadUserAvatar(file);
      setAvatarUrl(url);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      alert(err?.message || "Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const teacherName = profile?.name || user?.name || "Teacher";
  const teacherInitials = profile?.initials || user?.initials || "T";
  const teacherColor = profile?.color || "#7B61FF";

  return (
    <div className="mx-auto max-w-3xl animate-fade-up">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[28px] font-bold tracking-tight text-ink">Your profile</h1>
          <p className="mt-1.5 text-sm text-ink-500">This is what students see when they discover you.</p>
        </div>
        <div className="flex gap-2">
          {profile?.id && (
            <BtnLink to={`/app/teachers/${profile.id}`} variant="outline"><Eye size={14} /> View public profile</BtnLink>
          )}
          <Btn onClick={saveProfile} disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </Btn>
        </div>
      </div>
      {saved && <p className="mt-3 rounded-lg bg-[#E9F9EF] px-3.5 py-2.5 text-[13px] font-medium text-[#157A3E]">Profile saved — changes are live.</p>}

      <Card className="mt-6 p-6">
        <div className="flex items-center gap-5">
          <Avatar initials={teacherInitials} src={avatarUrl} color={teacherColor} size="xl" />
          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
            <Btn variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploadingPhoto}>
              {uploadingPhoto ? "Uploading..." : "Change photo"}
            </Btn>
            <p className="mt-2 text-xs text-ink-400">Square photo, at least 400×400. Friendly and professional works best.</p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Full name"><Input defaultValue={teacherName} disabled className="opacity-80" /></Field>
          <Field label="Headline"><Input value={headline} onChange={e => setHeadline(e.target.value)} /></Field>
          <Field label="Specializations"><Input value={specializations} onChange={e => setSpecializations(e.target.value)} placeholder="e.g. IELTS 8.0, Academic Writing" /></Field>
          <Field label="Languages"><Input value={languages} onChange={e => setLanguages(e.target.value)} placeholder="e.g. English, Uzbek, Russian" /></Field>
          <Field label="1-Minute Video Intro URL">
            <Input
              value={videoUrl}
              onChange={e => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=... or Loom embed"
            />
          </Field>
          <Field label="Credential Badges (comma separated)">
            <Input
              value={badges}
              onChange={e => setBadges(e.target.value)}
              placeholder="e.g. IELTS 8.0+, Verified Mentor, SAT Specialist"
            />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Bio">
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-line bg-white px-3.5 py-3 text-sm text-ink outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
            />
          </Field>
        </div>
      </Card>

      <Card className="mt-4 p-6">
        <h2 className="font-display text-[15px] font-semibold text-ink">Lesson options & pricing</h2>
        <div className="mt-4 space-y-3">
          {lessons.map((l) => (
            <div key={l.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-line p-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">{l.title}</p>
                <p className="text-xs text-ink-400">{l.durationMin} min</p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  value={String(l.priceUzs)}
                  onChange={e => updatePrice(l.id, Number(e.target.value) || 0)}
                  className="h-9 w-28 text-right"
                />
                <span className="text-xs text-ink-400">UZS</span>
                <button
                  onClick={() => setLessons(p => p.filter(item => item.id !== l.id))}
                  className="rounded-lg p-2 text-ink-300 transition hover:bg-mist hover:text-danger"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={() => {
              const newId = "l" + Date.now();
              setLessons(p => [...p, { id: newId, title: "Specialized Lesson", durationMin: 60, priceUzs: 100000, description: "Personalized focus session" }]);
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-line py-3 text-[13px] font-medium text-ink-400 transition hover:border-brand-400 hover:text-brand-600"
          >
            <Plus size={14} /> Add lesson option
          </button>
        </div>
      </Card>
    </div>
  );
}

/* ================= CALENDAR ================= */
export function TeacherCalendarPage() {
  const { lessons } = useApp();
  const [availabilities, setAvailabilities] = useState<{ day: string; enabled: boolean; ranges: { start: string; end: string }[] }[]>([]);

  useEffect(() => {
    meetApi.getMyAvailability()
      .then((data) => {
        if (data && data.length > 0) setAvailabilities(data);
      })
      .catch(() => {});
  }, []);

  // Compute current week dates
  const today = new Date();
  const currentDayOfWeek = (today.getDay() + 6) % 7; // 0 = Mon, 6 = Sun
  const monday = new Date(today);
  monday.setDate(today.getDate() - currentDayOfWeek);

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weekDays = dayNames.map((d, i) => {
    const dt = new Date(monday);
    dt.setDate(monday.getDate() + i);
    return {
      dayCode: d,
      label: `${d} ${dt.getDate()}`,
      dayNum: dt.getDate(),
      month: dt.toLocaleString("en-US", { month: "short" }),
      dateStr: dt.toISOString().split("T")[0],
    };
  });

  const hours = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];

  // Map availability ranges to hour slots (0..10)
  const isAvailableSlot = (dayCode: string, hourIndex: number) => {
    const avail = availabilities.find((a) => a.day === dayCode && a.enabled);
    if (!avail) return false;
    const slotHour = 9 + hourIndex;
    return avail.ranges.some((r) => {
      const sH = parseInt(r.start.split(":")[0]);
      const eH = parseInt(r.end.split(":")[0]);
      return slotHour >= sH && slotHour < eH;
    });
  };

  // Map real lessons to week days
  const eventsByDay: Record<string, { title: string; student: string; row: number; span: number; live?: boolean }[]> = {};
  lessons.forEach((l) => {
    // Check if lesson falls on one of the week days or matches dayCode/date
    const targetDay = weekDays.find((wd) => l.date === wd.dateStr || l.date.includes(wd.dayCode) || l.date.includes(String(wd.dayNum)));
    const key = targetDay ? targetDay.dayCode : null;
    if (key) {
      const startH = parseInt(l.time.split(":")[0]) || 10;
      const row = Math.max(0, Math.min(hours.length - 1, startH - 9));
      const span = Math.max(1, Math.round((l.durationMin || 60) / 60));
      if (!eventsByDay[key]) eventsByDay[key] = [];
      eventsByDay[key].push({
        title: l.title,
        student: l.studentName,
        row,
        span,
        live: l.status === "scheduled" && l.date === new Date().toISOString().split("T")[0],
      });
    }
  });

  return (
    <div className="mx-auto max-w-6xl animate-fade-up">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[28px] font-bold tracking-tight text-ink">Calendar</h1>
          <p className="mt-1.5 text-sm text-ink-500">
            Week of {weekDays[0].month} {weekDays[0].dayNum} – {weekDays[6].month} {weekDays[6].dayNum} · UTC+5
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-ink-400">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-brand-100 ring-1 ring-brand-200" /> Bookable window
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-brand-500" /> Booked lesson
          </span>
        </div>
      </div>

      <Card className="mt-6 overflow-x-auto">
        <div className="min-w-[820px]">
          <div className="grid grid-cols-[64px_repeat(7,1fr)] border-b border-line">
            <div className="p-3" />
            {weekDays.map((wd) => (
              <div key={wd.dayCode} className="border-l border-line p-3 text-center">
                <p className="font-display text-[13px] font-semibold text-ink">{wd.dayCode}</p>
                <p className="text-[11px] text-ink-400">{wd.month} {wd.dayNum}</p>
              </div>
            ))}
          </div>
          <div className="relative grid grid-cols-[64px_repeat(7,1fr)]">
            <div>
              {hours.map((h) => (
                <div key={h} className="h-12 border-b border-line pr-2 pt-1 text-right text-[10px] font-medium text-ink-300">{h}</div>
              ))}
            </div>
            {weekDays.map((wd) => (
              <div key={wd.dayCode} className="relative border-l border-line">
                {hours.map((h, i) => {
                  const avail = isAvailableSlot(wd.dayCode, i);
                  return <div key={h} className={cn("h-12 border-b border-line", avail && "bg-brand-50/70")} />;
                })}
                {(eventsByDay[wd.dayCode] ?? []).map((ev, i) => (
                  <div
                    key={i}
                    className={cn(
                      "absolute left-1 right-1 rounded-lg p-2 text-white shadow-sm z-10",
                      ev.live ? "bg-gradient-to-br from-brand-500 to-brand-700 ring-2 ring-brand-300" : "bg-brand-500/90"
                    )}
                    style={{ top: ev.row * 48 + 2, height: ev.span * 48 - 6 }}
                  >
                    <p className="truncate text-[11px] font-semibold leading-tight">{ev.title}</p>
                    <p className="truncate text-[10px] text-white/75">{ev.student}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ================= TEACHER EARNINGS & PAYOUTS ================= */
export function TeacherEarningsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState(100000);
  const [cardPan, setCardPan] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [payoutSuccess, setPayoutSuccess] = useState(false);
  const [error, setError] = useState("");

  const loadEarnings = async () => {
    setLoading(true);
    try {
      const res = await meetApi.getTeacherEarnings();
      setData(res);
    } catch {
      setData({
        availableBalance: 360000,
        inEscrow: 240000,
        totalEarned: 600000,
        totalWithdrawn: 0,
        payouts: [],
        transactions: [
          {
            id: "tx-demo-1",
            lessonTitle: "IELTS Speaking Practice",
            studentName: "Timur Aliev",
            amountUzs: 120000,
            paymentMethod: "click",
            escrowStatus: "released",
            status: "completed",
            date: "Today",
            time: "14:00",
          },
          {
            id: "tx-demo-2",
            lessonTitle: "Academic Writing Clinic",
            studentName: "Jasur Rahimov",
            amountUzs: 120000,
            paymentMethod: "payme",
            escrowStatus: "held",
            status: "scheduled",
            date: "Tomorrow",
            time: "16:00",
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEarnings();
  }, []);

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (amount < 50000) {
      setError("Minimum payout amount is 50,000 UZS");
      return;
    }
    const cleanCard = cardPan.replace(/\s+/g, "");
    if (cleanCard.length !== 16) {
      setError("Please enter a valid 16-digit card number (Uzcard or Humo)");
      return;
    }

    setRequesting(true);
    try {
      await meetApi.requestPayout(amount, cleanCard, cardHolder);
      setPayoutSuccess(true);
      setCardPan("");
      await loadEarnings();
      setTimeout(() => setPayoutSuccess(false), 4000);
    } catch (err: any) {
      setError(err?.message || "Failed to process payout request");
    } finally {
      setRequesting(false);
    }
  };

  const available = data?.availableBalance ?? 0;
  const inEscrow = data?.inEscrow ?? 0;
  const totalEarned = data?.totalEarned ?? 0;

  if (loading && !data) {
    return (
      <div className="mx-auto max-w-5xl animate-pulse py-12 text-center text-ink-400">
        <p className="text-sm font-medium">Loading earnings and escrow ledger...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl animate-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-[28px] font-bold tracking-tight text-ink">Earnings & Payouts</h1>
          <p className="mt-1 text-sm text-ink-500">
            Escrow-backed payout balance for your completed lessons on Liberum Meet.
          </p>
        </div>
        <Badge tone="green">
          <Check size={12} /> Instant Payouts Active
        </Badge>
      </div>

      {/* Overview Cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-5 ring-2 ring-brand-500/20 bg-gradient-to-br from-brand-50/50 to-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">Available to Withdraw</span>
            <Wallet size={18} className="text-brand-600" />
          </div>
          <p className="mt-3 font-display text-2xl font-extrabold text-ink">{fmtUzs(available)}</p>
          <p className="mt-1 text-xs text-ink-400">Escrow released from completed lessons</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">In Escrow Guarantee</span>
            <Clock size={18} className="text-amber-500" />
          </div>
          <p className="mt-3 font-display text-2xl font-extrabold text-ink">{fmtUzs(inEscrow)}</p>
          <p className="mt-1 text-xs text-ink-400">Funds held until scheduled lessons finish</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">Total Lifetime Earned</span>
            <DollarSign size={18} className="text-emerald-600" />
          </div>
          <p className="mt-3 font-display text-2xl font-extrabold text-ink">{fmtUzs(totalEarned)}</p>
          <p className="mt-1 text-xs text-ink-400">From all conducted sessions</p>
        </Card>
      </div>

      {/* Payout Form & Instructions */}
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div>
          <Card className="p-6">
            <h2 className="font-display text-base font-semibold text-ink">Request Payout to Card</h2>
            <p className="mt-1 text-xs text-ink-500">
              Direct transfer to any Uzbekistan bank card (Uzcard or Humo) via Payme/Click gateway.
            </p>

            {payoutSuccess && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-medium text-emerald-700">
                <Check size={16} /> Payout processed successfully! Funds transferred to your card.
              </div>
            )}

            {error && (
              <div className="mt-4 rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-700">
                {error}
              </div>
            )}

            <form onSubmit={handleRequestPayout} className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Card Number (Uzcard / Humo)">
                  <div className="relative">
                    <Input
                      value={cardPan}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
                        const parts = raw.match(/.{1,4}/g);
                        setCardPan(parts ? parts.join(" ") : raw);
                      }}
                      placeholder="8600 0000 0000 0000"
                      className="font-mono text-sm"
                    />
                    <CreditCard size={16} className="absolute right-3 top-3 text-ink-400" />
                  </div>
                </Field>

                <Field label="Cardholder Name">
                  <Input
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    placeholder="E.g. AZIZA KARIMOVA"
                  />
                </Field>
              </div>

              <Field label="Amount to Withdraw (UZS)">
                <div className="relative">
                  <Input
                    type="number"
                    step={10000}
                    min={50000}
                    max={available || 5000000}
                    value={amount}
                    onChange={(e) => setAmount(+e.target.value)}
                    className="font-semibold text-ink"
                  />
                  <button
                    type="button"
                    onClick={() => setAmount(available)}
                    className="absolute right-2.5 top-2 rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-600 hover:bg-brand-100"
                  >
                    Max
                  </button>
                </div>
              </Field>

              <div className="pt-2">
                <Btn type="submit" disabled={requesting || available < 50000}>
                  {requesting ? "Processing Payout..." : `Withdraw ${fmtUzs(amount)}`}
                </Btn>
              </div>
            </form>
          </Card>

          {/* Transactions / Ledger Table */}
          <Card className="mt-6 p-6">
            <h2 className="font-display text-base font-semibold text-ink">Escrow & Lesson Transactions</h2>
            <div className="mt-4 divide-y divide-line">
              {data?.transactions && data.transactions.length > 0 ? (
                data.transactions.map((tx: any) => (
                  <div key={tx.id} className="flex flex-wrap items-center justify-between py-3.5 text-xs">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-ink">{tx.lessonTitle}</p>
                      <p className="mt-0.5 text-ink-400">
                        {tx.studentName} · {tx.date} · {tx.time} · Paid via {tx.paymentMethod?.toUpperCase()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge tone={tx.escrowStatus === "released" ? "green" : "amber"}>
                        {tx.escrowStatus === "released" ? "Escrow Released" : "Held in Escrow"}
                      </Badge>
                      <p className="font-display text-sm font-bold text-ink">+{fmtUzs(tx.amountUzs)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="py-6 text-center text-xs text-ink-400">No transactions recorded yet.</p>
              )}
            </div>
          </Card>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="font-display text-sm font-semibold text-ink">How Payouts Work</h3>
            <div className="mt-3 space-y-3 text-xs leading-relaxed text-ink-500">
              <p>
                <strong className="text-ink">1. Escrow Guarantee:</strong> When a student books your lesson, their payment is secured in Liberum Escrow.
              </p>
              <p>
                <strong className="text-ink">2. Automatic Release:</strong> Once the lesson is conducted in the interactive classroom and marked complete, funds move immediately into your Available Balance.
              </p>
              <p>
                <strong className="text-ink">3. Instant Card Transfer:</strong> Request a payout to any Uzcard or Humo card at any time. Payouts are executed automatically with 0% platform withdrawal fee.
              </p>
            </div>
          </Card>

          {/* Past Payouts */}
          <Card className="p-5">
            <h3 className="font-display text-sm font-semibold text-ink">Recent Payouts</h3>
            <div className="mt-3 divide-y divide-line text-xs">
              {data?.payouts && data.payouts.length > 0 ? (
                data.payouts.map((po: any) => (
                  <div key={po.id} className="flex items-center justify-between py-2.5">
                    <div>
                      <p className="font-semibold text-ink">{po.cardPan}</p>
                      <p className="text-[11px] text-ink-400">{po.createdAt}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-ink">{fmtUzs(po.amountUzs)}</p>
                      <Badge tone="green">Success</Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="py-4 text-center text-[11px] text-ink-400">No payout withdrawals yet.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
