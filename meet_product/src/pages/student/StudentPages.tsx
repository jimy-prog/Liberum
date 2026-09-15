import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import {
  ArrowLeft, ArrowRight, BadgeCheck, CalendarDays, Check, ChevronLeft,
  Clock, Compass, Copy, Globe, GraduationCap, Search, Share2, Star, Video,
} from "lucide-react";
import { BOOKABLE_TIMES, fmtUzs, SUBJECTS, TEACHERS } from "@/lib/data";
import { useApp } from "@/lib/store";
import { meetApi } from "@/lib/api";
import { Avatar, Badge, Btn, BtnLink, Card, EmptyState } from "@/components/ui-kit";
import { cn } from "@/lib/utils";
import type { Lesson, Teacher } from "@/lib/types";

export function LessonStatusBadge({ status }: { status: Lesson["status"] }) {
  const map = {
    scheduled: { tone: "gray" as const, label: "Scheduled" },
    "starting-soon": { tone: "amber" as const, label: "Starting soon" },
    live: { tone: "brand" as const, label: "Live now" },
    completed: { tone: "green" as const, label: "Completed" },
    cancelled: { tone: "red" as const, label: "Cancelled" },
  };
  const m = map[status];
  return (
    <Badge tone={m.tone}>
      {status === "live" && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-500" />}
      {m.label}
    </Badge>
  );
}

export function LessonCard({ lesson, perspective }: { lesson: Lesson; perspective: "student" | "teacher" }) {
  const other = perspective === "student" ? lesson.teacherName : lesson.studentName;
  const teacher = TEACHERS.find((t) => t.id === lesson.teacherId);
  const initials = other.split(" ").map((w) => w[0]).join("").slice(0, 2);
  const joinable = lesson.status === "starting-soon" || lesson.status === "live";
  return (
    <Card className="flex items-center gap-4 p-4 transition hover:shadow-[0_12px_32px_-16px_rgba(14,15,19,0.18)]">
      <Avatar initials={initials} color={perspective === "student" ? teacher?.color ?? "#7B61FF" : "#1FAD55"} size="lg" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-semibold text-ink">{lesson.title}</p>
          <LessonStatusBadge status={lesson.status} />
        </div>
        <p className="mt-0.5 text-[13px] text-ink-500">
          {perspective === "student" ? "with" : "student"} <span className="font-medium text-ink">{other}</span>
        </p>
        <p className="mt-1 flex flex-wrap items-center gap-2.5 text-xs text-ink-400">
          <span className="inline-flex items-center gap-1"><CalendarDays size={12} /> {lesson.date}</span>
          <span className="inline-flex items-center gap-1"><Clock size={12} /> {lesson.time} · {lesson.durationMin} min</span>
          {lesson.priceUzs > 0 && (
            <span className="font-medium text-ink">{fmtUzs(lesson.priceUzs)}</span>
          )}
          {lesson.escrowStatus === "held" && (
            <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
              Escrow Held
            </span>
          )}
          {lesson.escrowStatus === "released" && (
            <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
              Paid · Escrow Released
            </span>
          )}
        </p>
      </div>
      {joinable ? (
        <BtnLink to={`/classroom/${lesson.id}`} size="sm">
          <Video size={14} /> Join Lesson
        </BtnLink>
      ) : lesson.status === "scheduled" ? (
        <Badge tone="outline" className="hidden sm:inline-flex">Join opens 10 min before</Badge>
      ) : null}
    </Card>
  );
}

/* ================= STUDENT DASHBOARD ================= */
export function StudentDashboard() {
  const { user, lessons } = useApp();
  const upcoming = lessons.filter((l) => l.status === "scheduled" || l.status === "starting-soon" || l.status === "live");
  const completed = lessons.filter((l) => l.status === "completed");
  const next = upcoming[0];

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

      {/* Next lesson hero */}
      {next ? (
        <Card className="relative mt-6 overflow-hidden p-6 sm:p-7">
          <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-brand-400 to-brand-600" />
          <div className="flex flex-wrap items-center gap-5">
            <Avatar initials="AK" color="#7B61FF" size="xl" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="amber">Next lesson</Badge>
                <LessonStatusBadge status={next.status} />
              </div>
              <p className="mt-2 font-display text-xl font-semibold text-ink">{next.title}</p>
              <p className="mt-1 text-sm text-ink-500">
                with {next.teacherName} · {next.date} · {next.time} · {next.durationMin} min
              </p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto">
              <BtnLink to={`/classroom/${next.id}`} size="lg" className="animate-pulse-ring">
                <Video size={16} /> Join Lesson
              </BtnLink>
              <p className="text-center text-[11px] text-ink-400">Classroom opens 10 min before start</p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="mt-6">
          <EmptyState
            icon={<CalendarDays size={20} />}
            title="You don't have any upcoming lessons yet"
            body="Find a teacher and book your first lesson — it takes less than a minute."
            action={<BtnLink to="/app/teachers"><Compass size={15} /> Find a Teacher</BtnLink>}
          />
        </div>
      )}

      {/* Upcoming */}
      <div className="mt-9 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-ink">Upcoming lessons</h2>
        <Link to="/app/lessons" className="text-[13px] font-medium text-brand-600 hover:underline">
          View all
        </Link>
      </div>
      <div className="mt-4 space-y-3">
        {upcoming.slice(1).map((l) => (
          <LessonCard key={l.id} lesson={l} perspective="student" />
        ))}
        {upcoming.length <= 1 && (
          <p className="rounded-xl border border-dashed border-line py-6 text-center text-[13px] text-ink-400">
            No more upcoming lessons. <Link to="/app/teachers" className="font-medium text-brand-600 hover:underline">Book another one</Link>
          </p>
        )}
      </div>

      {/* Completed */}
      <h2 className="mt-9 font-display text-lg font-semibold text-ink">Completed</h2>
      <div className="mt-4 space-y-3">
        {completed.slice(0, 3).map((l) => (
          <LessonCard key={l.id} lesson={l} perspective="student" />
        ))}
      </div>
    </div>
  );
}

/* ================= FIND TEACHERS ================= */
export function FindTeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>(TEACHERS);
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("All subjects");
  const [maxPrice, setMaxPrice] = useState(150000);
  const [onlineOnly, setOnlineOnly] = useState(false);

  useEffect(() => {
    meetApi.listTeachers()
      .then((data) => {
        if (data && data.length > 0) setTeachers(data);
      })
      .catch(() => {
        // use fallback data
      });
  }, []);

  const results = useMemo(
    () =>
      teachers.filter((t) => {
        const q = query.toLowerCase();
        const matchesQ =
          !q ||
          t.name.toLowerCase().includes(q) ||
          t.title.toLowerCase().includes(q) ||
          t.subjects.some((s) => s.toLowerCase().includes(q)) ||
          t.specializations.some((s) => s.toLowerCase().includes(q));
        const matchesS = subject === "All subjects" || t.subjects.includes(subject);
        const minPrice = t.lessons.length > 0 ? Math.min(...t.lessons.map((l) => l.priceUzs)) : 0;
        return matchesQ && matchesS && minPrice <= maxPrice && (!onlineOnly || t.online);
      }),
    [teachers, query, subject, maxPrice, onlineOnly]
  );

  return (
    <div className="mx-auto max-w-6xl animate-fade-up">
      <h1 className="font-display text-[28px] font-bold tracking-tight text-ink">Find your teacher</h1>
      <p className="mt-1.5 text-sm text-ink-500">{TEACHERS.length} verified independent teachers · book directly, learn online</p>

      {/* Search + filters */}
      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search teachers, subjects, specializations…"
            className="h-12 w-full rounded-full border border-line bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-ink-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {SUBJECTS.slice(0, 6).map((s) => (
            <button
              key={s}
              onClick={() => setSubject(s)}
              className={cn(
                "h-9 rounded-full border px-4 text-[13px] font-medium transition active:scale-[0.97]",
                subject === s ? "border-ink bg-ink text-white" : "border-line bg-white text-ink-500 hover:border-ink-400"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl border border-line bg-white px-5 py-3.5">
        <label className="flex items-center gap-3 text-[13px] text-ink-500">
          Max price
          <input
            type="range"
            min={50000}
            max={150000}
            step={10000}
            value={maxPrice}
            onChange={(e) => setMaxPrice(+e.target.value)}
            className="w-36 accent-brand-500"
          />
          <span className="font-semibold text-ink">{fmtUzs(maxPrice)}</span>
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-[13px] text-ink-500">
          <input type="checkbox" checked={onlineOnly} onChange={(e) => setOnlineOnly(e.target.checked)} className="h-4 w-4 rounded accent-brand-500" />
          Available online now
        </label>
        <span className="ml-auto text-[13px] font-medium text-ink-400">{results.length} teachers</span>
      </div>

      {/* Grid */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {results.map((t, i) => (
          <TeacherCard key={t.id} teacher={t} style={{ animationDelay: `${i * 60}ms` }} />
        ))}
      </div>
      {results.length === 0 && (
        <EmptyState
          icon={<Search size={20} />}
          title="No teachers match your filters"
          body="Try widening the price range or choosing a different subject."
        />
      )}
    </div>
  );
}

function TeacherCard({ teacher: t, style }: { teacher: Teacher; style?: React.CSSProperties }) {
  const from = Math.min(...t.lessons.map((l) => l.priceUzs));
  return (
    <Card className="group flex animate-fade-up flex-col p-5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_48px_-20px_rgba(14,15,19,0.22)]" >
      <div className="flex items-start gap-3.5" style={style}>
        <div className="relative">
          <Avatar initials={t.initials} color={t.color} size="lg" />
          {t.online && <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#1FAD55]" />}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="truncate font-display text-[15px] font-semibold text-ink">{t.name}</p>
            {t.verified && <BadgeCheck size={15} className="shrink-0 text-brand-500" />}
          </div>
          <p className="truncate text-[13px] text-ink-500">{t.title}</p>
          <div className="mt-1 flex items-center gap-1 text-xs text-ink-500">
            <Star size={12} className="fill-[#F5A623] text-[#F5A623]" />
            <span className="font-semibold text-ink">{t.rating.toFixed(1)}</span>
            <span className="text-ink-400">({t.reviewsCount})</span>
            <span className="text-ink-300">·</span>
            <span className="text-ink-400">{t.experienceYears} yrs</span>
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {t.specializations.slice(0, 3).map((s) => (
          <Badge key={s} tone="gray">{s}</Badge>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-ink-400">from</p>
          <p className="font-display text-[15px] font-bold text-ink">{fmtUzs(from)}</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-wide text-ink-400">next available</p>
          <p className="text-[13px] font-semibold text-[#157A3E]">{t.nextAvailable}</p>
        </div>
      </div>
      <BtnLink to={`/app/teachers/${t.id}`} variant="outline" className="mt-4 w-full group-hover:border-brand-500 group-hover:text-brand-600">
        View Profile <ArrowRight size={14} />
      </BtnLink>
    </Card>
  );
}

/* ================= TEACHER PUBLIC PROFILE ================= */
export function TeacherProfilePage() {
  const { id } = useParams();
  const defaultTeacher = TEACHERS.find((x) => x.id === id) ?? TEACHERS[0];
  const [t, setT] = useState<Teacher>(defaultTeacher);

  useEffect(() => {
    if (id) {
      meetApi.getTeacher(id)
        .then((data) => {
          if (data && data.id) {
            setT(data);
            document.title = `${data.name} — Liberum Meet Teacher`;
          }
        })
        .catch(() => {});
    }
  }, [id]);

  useEffect(() => {
    if (t?.name) {
      document.title = `${t.name} — Liberum Meet Teacher`;
    }
    return () => {
      document.title = "Liberum Meet — Teach. Learn. Meet.";
    };
  }, [t?.name]);

  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const url = `${window.location.origin}/teachers/${t.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="mx-auto max-w-6xl animate-fade-up">
      <div className="flex items-center justify-between">
        <Link to="/app/teachers" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-500 transition hover:text-ink">
          <ChevronLeft size={15} /> All teachers
        </Link>
        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-1.5 text-xs font-medium text-ink transition hover:border-brand-500 hover:text-brand-600 active:scale-95"
        >
          {copied ? <Check size={13} className="text-emerald-500" /> : <Share2 size={13} />}
          {copied ? "Link Copied!" : "Share Profile"}
        </button>
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Main */}
        <div>
          <Card className="overflow-hidden">
            <div className="h-28 bg-gradient-to-r from-brand-500 via-brand-400 to-brand-600 bg-grid-dark" />
            <div className="px-6 pb-6">
              <div className="-mt-10 flex flex-wrap items-end gap-4">
                <Avatar initials={t.initials} color={t.color} size="xl" className="h-24 w-24 text-2xl ring-4 ring-white" />
                <div className="min-w-0 flex-1 pb-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="font-display text-2xl font-bold tracking-tight text-ink">{t.name}</h1>
                    {t.verified && (
                      <Badge tone="brand"><BadgeCheck size={12} /> Verified teacher</Badge>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-ink-500">{t.title}</p>
                </div>
                <div className="flex gap-2 pb-1">
                  <button
                    onClick={handleShare}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-white px-3.5 text-xs font-semibold text-ink transition hover:border-brand-500 hover:text-brand-600"
                  >
                    {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                    {copied ? "Copied" : "Share"}
                  </button>
                  <BtnLink to="/app/messages" variant="outline" size="md">Message</BtnLink>
                  <BtnLink to={`/app/book/${t.id}`} size="md">Book a Lesson</BtnLink>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { icon: Star, label: "Rating", value: `${t.rating.toFixed(1)} · ${t.reviewsCount} reviews` },
                  { icon: GraduationCap, label: "Students taught", value: `${t.studentsTaught}+` },
                  { icon: Video, label: "Lessons", value: t.lessonsTaught.toLocaleString() },
                  { icon: Globe, label: "Languages", value: t.languages.join(" · ") },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl border border-line bg-cloud p-3.5">
                    <s.icon size={15} className="text-brand-500" />
                    <p className="mt-2 text-[11px] uppercase tracking-wide text-ink-400">{s.label}</p>
                    <p className="mt-0.5 truncate text-[13px] font-semibold text-ink">{s.value}</p>
                  </div>
                ))}
              </div>

              <h2 className="mt-7 font-display text-[15px] font-semibold text-ink">About</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">{t.bio}</p>

              <div className="mt-5 flex flex-wrap gap-1.5">
                {t.specializations.map((s) => (
                  <Badge key={s} tone="brand">{s}</Badge>
                ))}
                <Badge tone="gray">{t.experienceYears} years experience</Badge>
                {t.online && <Badge tone="green"><span className="h-1.5 w-1.5 rounded-full bg-[#1FAD55]" /> Online now</Badge>}
              </div>
            </div>
          </Card>

          {/* Lesson options */}
          <h2 className="mt-8 font-display text-lg font-semibold text-ink">Lessons with {t.name.split(" ")[0]}</h2>
          <div className="mt-4 space-y-3">
            {t.lessons.map((l) => (
              <Card key={l.id} className="flex flex-wrap items-center gap-4 p-5">
                <div className="min-w-0 flex-1">
                  <p className="font-display text-[15px] font-semibold text-ink">{l.title}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-ink-500">{l.description}</p>
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-400">
                    <Clock size={12} /> {l.durationMin} minutes · online classroom
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-lg font-bold text-ink">{fmtUzs(l.priceUzs)}</p>
                  <p className="text-[11px] text-ink-400">per lesson</p>
                </div>
                <BtnLink to={`/app/book/${t.id}?lesson=${l.id}`} variant="outline" size="sm">Select</BtnLink>
              </Card>
            ))}
          </div>
        </div>

        {/* Availability sidebar */}
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-[15px] font-semibold text-ink">Availability</h3>
              <Badge tone="outline">UTC+5 · Tashkent</Badge>
            </div>
            <div className="mt-4 space-y-2">
              {t.availability.map((d) => (
                <div key={d.day} className="flex items-center gap-3">
                  <span className={cn("w-9 text-[13px] font-semibold", d.enabled ? "text-ink" : "text-ink-300")}>{d.day}</span>
                  <div className="flex flex-1 flex-wrap gap-1">
                    {d.enabled ? (
                      d.ranges.map((r) => (
                        <span key={r.start} className="rounded-md bg-brand-50 px-2 py-1 text-[11px] font-medium text-brand-700 ring-1 ring-brand-100">
                          {r.start}–{r.end}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-ink-300">Unavailable</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <BtnLink to={`/app/book/${t.id}`} className="mt-5 w-full">Book a Lesson</BtnLink>
            <p className="mt-3 text-center text-[11px] leading-relaxed text-ink-400">
              Times shown in your timezone · reschedule up to 12 hours before
            </p>
          </Card>
          <Card className="p-5">
            <p className="text-[13px] leading-relaxed text-ink-500">
              <span className="font-semibold text-ink">How booking works.</span> Pick a lesson, choose a free slot, and confirm. You'll both get a notification and the classroom link appears in My Lessons.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ================= BOOKING FLOW ================= */

export function BookingPage() {
  const { id } = useParams();
  const { bookLesson } = useApp();
  const defaultTeacher = TEACHERS.find((x) => x.id === id) ?? TEACHERS[0];
  const [t, setT] = useState<Teacher>(defaultTeacher);
  const [params] = useSearchParams();

  useEffect(() => {
    if (id) {
      meetApi.getTeacher(id)
        .then((data) => {
          if (data && data.id) setT(data);
        })
        .catch(() => {});
    }
  }, [id]);

  const [step, setStep] = useState(0);
  const [lessonId, setLessonId] = useState(params.get("lesson") ?? defaultTeacher.lessons[0]?.id ?? "l1");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"click" | "payme" | "balance">("click");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (t && t.lessons.length > 0 && !t.lessons.some(l => l.id === lessonId)) {
      setLessonId(t.lessons[0].id);
    }
  }, [t]);

  // Dynamic rolling 14-day calendar
  const bookingDays = useMemo(() => {
    const list: { d: string; sub: string; full: string }[] = [];
    const base = new Date();
    for (let i = 0; i < 14; i++) {
      const dt = new Date(base);
      dt.setDate(base.getDate() + i);
      const dayName = i === 0 ? "Today" : i === 1 ? "Tomorrow" : dt.toLocaleDateString("en-US", { weekday: "short" });
      const monthDay = dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const dayCode = dt.toLocaleDateString("en-US", { weekday: "short" });
      list.push({
        d: dayName,
        sub: monthDay,
        full: i === 0 ? "Today" : i === 1 ? "Tomorrow" : `${dayCode}, ${monthDay}`,
      });
    }
    return list;
  }, []);

  const lesson = t.lessons.find((l) => l.id === lessonId) ?? t.lessons[0] ?? {
    id: "l1",
    title: "1-on-1 Lesson",
    durationMin: 60,
    priceUzs: 100000,
    description: "Personal tutoring session",
  };
  const steps = ["Lesson", "Date", "Time", "Confirm"];

  if (done) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center py-16 text-center animate-fade-up">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E9F9EF] text-[#157A3E]">
          <Check size={28} strokeWidth={2.5} />
        </div>
        <h1 className="mt-6 font-display text-2xl font-bold tracking-tight text-ink">Lesson booked</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-500">
          {lesson.title} with {t.name} · {date} · {time}. Both of you have been notified — the classroom link will appear in My Lessons.
        </p>
        <div className="mt-6 flex gap-3">
          <BtnLink to="/app/lessons" variant="ink">Go to My Lessons</BtnLink>
          <BtnLink to="/app/teachers" variant="outline">Find more teachers</BtnLink>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl animate-fade-up">
      <Link to={`/app/teachers/${t.id}`} className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-500 transition hover:text-ink">
        <ArrowLeft size={14} /> Back to profile
      </Link>

      <div className="mt-4 flex items-center gap-3">
        <Avatar initials={t.initials} color={t.color} size="md" />
        <div>
          <h1 className="font-display text-xl font-bold tracking-tight text-ink">Book a lesson with {t.name}</h1>
          <p className="text-[13px] text-ink-500">{t.title}</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="mt-7 flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition",
                i < step ? "bg-brand-500 text-white" : i === step ? "bg-ink text-white" : "bg-mist text-ink-400"
              )}
            >
              {i < step ? <Check size={13} /> : i + 1}
            </span>
            <span className={cn("hidden text-[13px] font-medium sm:block", i === step ? "text-ink" : "text-ink-400")}>{s}</span>
            {i < steps.length - 1 && <span className={cn("h-px flex-1", i < step ? "bg-brand-500" : "bg-line")} />}
          </div>
        ))}
      </div>

      <Card className="mt-6 p-6">
        {step === 0 && (
          <div className="animate-fade-up space-y-3">
            {t.lessons.map((l) => (
              <button
                key={l.id}
                onClick={() => setLessonId(l.id)}
                className={cn(
                  "flex w-full items-center gap-4 rounded-xl border p-4 text-left transition active:scale-[0.99]",
                  lessonId === l.id ? "border-brand-500 bg-brand-50 ring-4 ring-brand-500/10" : "border-line hover:border-ink-400"
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink">{l.title}</p>
                  <p className="mt-0.5 text-xs text-ink-400">{l.durationMin} min · {l.description}</p>
                </div>
                <p className="font-display text-[15px] font-bold text-ink">{fmtUzs(l.priceUzs)}</p>
              </button>
            ))}
            <div className="flex justify-end pt-2">
              <Btn onClick={() => setStep(1)}>Continue <ArrowRight size={15} /></Btn>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="animate-fade-up">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {bookingDays.map((d) => (
                <button
                  key={d.sub}
                  onClick={() => setDate(d.full)}
                  className={cn(
                    "rounded-xl border p-4 text-center transition active:scale-[0.97]",
                    date === d.full ? "border-brand-500 bg-brand-50 ring-4 ring-brand-500/10" : "border-line hover:border-ink-400"
                  )}
                >
                  <p className="text-sm font-semibold text-ink">{d.d}</p>
                  <p className="mt-0.5 text-xs text-ink-400">{d.sub}</p>
                </button>
              ))}
            </div>
            <StepNav back={() => setStep(0)} next={() => setStep(2)} nextDisabled={!date} />
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-up">
            <p className="mb-4 flex items-center gap-2 text-[13px] text-ink-500">
              <Globe size={13} /> Times in your timezone · UTC+5 — Tashkent
            </p>
            <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
              {BOOKABLE_TIMES.map((tm) => (
                <button
                  key={tm}
                  onClick={() => setTime(tm)}
                  className={cn(
                    "h-11 rounded-xl border text-sm font-medium transition active:scale-[0.97]",
                    time === tm ? "border-brand-500 bg-brand-500 text-white shadow-[0_8px_20px_-8px_rgba(123,97,255,0.6)]" : "border-line hover:border-brand-400 hover:text-brand-600"
                  )}
                >
                  {tm}
                </button>
              ))}
            </div>
            <StepNav back={() => setStep(1)} next={() => setStep(3)} nextDisabled={!time} />
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-up">
            <div className="rounded-xl border border-line bg-cloud p-5">
              {[
                ["Teacher", t.name],
                ["Lesson", lesson.title],
                ["Duration", `${lesson.durationMin} minutes`],
                ["Date", date],
                ["Time", `${time} (UTC+5)`],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between border-b border-line py-2.5 text-sm last:border-0">
                  <span className="text-ink-400">{k}</span>
                  <span className="font-medium text-ink">{v}</span>
                </div>
              ))}
              <div className="mt-3 flex items-center justify-between rounded-lg bg-white px-4 py-3 ring-1 ring-line">
                <span className="text-sm font-medium text-ink">Total to Pay</span>
                <span className="font-display text-lg font-bold text-ink">{fmtUzs(lesson.priceUzs)}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">Payment method</p>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: "click", name: "Click", tag: "Uzcard / Humo" },
                  { id: "payme", name: "Payme", tag: "Instant" },
                  { id: "balance", name: "Liberum Pay", tag: "0% Fee" },
                ].map((pm) => (
                  <div
                    key={pm.id}
                    onClick={() => setPaymentMethod(pm.id as any)}
                    className={cn(
                      "cursor-pointer rounded-xl border p-3 transition active:scale-[0.98]",
                      paymentMethod === pm.id ? "border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/20" : "border-line bg-white hover:border-ink-300"
                    )}
                  >
                    <p className="text-xs font-bold text-ink">{pm.name}</p>
                    <p className="text-[10px] text-ink-400">{pm.tag}</p>
                  </div>
                ))}
              </div>
              <p className="mt-2.5 flex items-center gap-1.5 text-[11px] text-[#157A3E]">
                <BadgeCheck size={13} /> Escrow Protected: Teacher is paid only after lesson is successfully completed.
              </p>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <Btn variant="ghost" onClick={() => setStep(2)}>Back</Btn>
              <Btn
                size="lg"
                onClick={() => {
                  bookLesson({ teacherId: t.id, lessonOptionId: lessonId, date, time, paymentMethod });
                  setDone(true);
                }}
              >
                <Check size={15} /> Confirm & Pay with {paymentMethod === "click" ? "Click" : paymentMethod === "payme" ? "Payme" : "Liberum Pay"}
              </Btn>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function StepNav({ back, next, nextDisabled }: { back: () => void; next: () => void; nextDisabled?: boolean }) {
  return (
    <div className="mt-6 flex items-center justify-between">
      <Btn variant="ghost" onClick={back}>Back</Btn>
      <Btn onClick={next} disabled={nextDisabled}>Continue <ArrowRight size={15} /></Btn>
    </div>
  );
}

/* ================= MY LESSONS ================= */
export function MyLessonsPage() {
  const { lessons } = useApp();
  const [tab, setTab] = useState<"upcoming" | "completed">("upcoming");
  const upcoming = lessons.filter((l) => l.status !== "completed" && l.status !== "cancelled");
  const completed = lessons.filter((l) => l.status === "completed");
  const list = tab === "upcoming" ? upcoming : completed;

  return (
    <div className="mx-auto max-w-4xl animate-fade-up">
      <h1 className="font-display text-[28px] font-bold tracking-tight text-ink">My Lessons</h1>
      <div className="mt-5 inline-flex rounded-full border border-line bg-white p-1">
        {(
          [
            ["upcoming", `Upcoming · ${upcoming.length}`],
            ["completed", `Completed · ${completed.length}`],
          ] as const
        ).map(([v, label]) => (
          <button
            key={v}
            onClick={() => setTab(v)}
            className={cn(
              "h-8 rounded-full px-4 text-[13px] font-medium transition",
              tab === v ? "bg-ink text-white" : "text-ink-500 hover:text-ink"
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="mt-5 space-y-3">
        {list.map((l) => (
          <LessonCard key={l.id} lesson={l} perspective="student" />
        ))}
        {list.length === 0 && (
          <EmptyState
            icon={<CalendarDays size={20} />}
            title={tab === "upcoming" ? "You don't have any upcoming lessons yet" : "No completed lessons yet"}
            body={tab === "upcoming" ? "Find a teacher and book your first lesson." : "Finished lessons will appear here."}
            action={tab === "upcoming" ? <BtnLink to="/app/teachers"><Compass size={15} /> Find a Teacher</BtnLink> : undefined}
          />
        )}
      </div>
    </div>
  );
}
