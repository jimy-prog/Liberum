import { useEffect, useState } from "react";
import {
  ArrowRight, BarChart3, BookOpen, Check, ChevronDown, ClipboardList, FilePlus2,
  Flag, Headphones, Highlighter, Menu, Mic, PenLine, Send, ShieldCheck, Sparkles,
  Target, Timer, TrendingUp, X,
} from "lucide-react";
import { BrowserFrame, LiberumLogo } from "@/components/brand";
import { MockMark } from "../components";
import { Badge, BtnLink, Eyebrow } from "@/components/ui-kit";
import { useReveal } from "@/hooks/use-reveal";
import { cn } from "@/lib/utils";

/* =================================================================
   NAV
================================================================= */
function LandingNav() {
  const [open, setOpen] = useState(false);
  const links = [
    { label: "How it works", href: "#how" },
    { label: "Test types", href: "#types" },
    { label: "Two modes", href: "#modes" },
    { label: "For teachers", href: "#teachers" },
  ];
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line/70 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-5 lg:px-8">
        <div className="flex items-center gap-2.5">
          <LiberumLogo to="/" />
          <MockMark />
        </div>
        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          <div className="group relative">
            <button className="flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-medium text-ink-500 transition hover:bg-mist hover:text-ink">
              Products <ChevronDown size={13} />
            </button>
            <div className="invisible absolute left-0 top-full pt-2 opacity-0 transition group-hover:visible group-hover:opacity-100">
              <div className="w-64 rounded-2xl border border-line bg-white p-2 shadow-[0_24px_60px_-16px_rgba(14,15,19,0.2)]">
                {[
                  ["Meet", "Teach and learn online", false],
                  ["Studio", "Run your teaching business", false],
                  ["Mock", "IELTS-style assessment", true],
                  ["AI", "Intelligent evaluation", false],
                ].map(([name, desc, active]) => (
                  <div key={name as string} className={cn("flex items-start gap-3 rounded-xl px-3 py-2.5", active ? "bg-brand-50" : "hover:bg-cloud")}>
                    <span className={cn("mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg font-display text-xs font-bold", active ? "bg-brand-500 text-white" : "bg-mist text-ink-500")}>
                      {(name as string)[0]}
                    </span>
                    <span>
                      <span className="flex items-center gap-2 text-sm font-semibold text-ink">
                        {name}
                        {active ? <Badge tone="brand">You are here</Badge> : <Badge tone="gray">liberum.uz</Badge>}
                      </span>
                      <span className="text-xs text-ink-400">{desc}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {links.map((l) => (
            <a key={l.href} href={l.href} className="rounded-full px-3.5 py-2 text-sm font-medium text-ink-500 transition hover:bg-mist hover:text-ink">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto hidden items-center gap-2.5 lg:flex">
          <BtnLink to="/login" variant="ghost" size="sm">Sign in</BtnLink>
          <BtnLink to="/register" size="sm">Take a free mock <ArrowRight size={14} /></BtnLink>
        </div>
        <button className="ml-auto rounded-lg p-2 text-ink lg:hidden" onClick={() => setOpen((v) => !v)}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {open && (
        <div className="border-t border-line bg-white px-5 py-4 lg:hidden">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink-600 hover:bg-mist">
              {l.label}
            </a>
          ))}
          <div className="mt-3 flex gap-2.5">
            <BtnLink to="/login" variant="outline" size="sm" className="flex-1 justify-center">Sign in</BtnLink>
            <BtnLink to="/register" size="sm" className="flex-1 justify-center">Take a free mock</BtnLink>
          </div>
        </div>
      )}
    </header>
  );
}

/* =================================================================
   HERO
================================================================= */
function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#F6F4FF] via-white to-white pb-20 pt-32 lg:pt-40">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-brand-200/40 blur-[140px]" />
      <div className="relative mx-auto max-w-7xl px-5 text-center lg:px-8">
        <div className="animate-fade-up">
          <Badge tone="brand" className="mx-auto"><Sparkles size={11} /> Part of the Liberum ecosystem</Badge>
        </div>
        <h1 className="mx-auto mt-6 max-w-3xl animate-fade-up font-display text-[42px] font-bold leading-[1.05] tracking-tight text-ink sm:text-[56px] lg:text-[68px]">
          Practice IELTS like the <span className="bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent">real thing</span>.
        </h1>
        <p className="mx-auto mt-5 max-w-xl animate-fade-up text-[17px] leading-relaxed text-ink-500" style={{ animationDelay: "80ms" }}>
          Full mock exams with real exam timing, all four sections, instant Listening & Reading scores,
          and honest AI estimated bands for Writing & Speaking.
        </p>
        <div className="mt-8 flex animate-fade-up flex-wrap justify-center gap-3" style={{ animationDelay: "160ms" }}>
          <BtnLink to="/register" size="lg">Start a free mock <ArrowRight size={16} /></BtnLink>
          <BtnLink to="/login" variant="outline" size="lg">Sign in</BtnLink>
        </div>
        <p className="mt-4 animate-fade-up text-xs text-ink-400" style={{ animationDelay: "220ms" }}>
          No card required · Answers saved automatically · Results in minutes
        </p>

        {/* Hero visual — real product screenshot */}
        <div className="relative mx-auto mt-14 max-w-5xl animate-fade-up" style={{ animationDelay: "300ms" }}>
          <div className="pointer-events-none absolute -inset-x-8 -top-8 bottom-16 rounded-[40px] bg-gradient-to-b from-brand-100/60 to-transparent" />
          <BrowserFrame url="mock.liberum.uz/app" className="relative shadow-[0_60px_120px_-30px_rgba(123,97,255,0.35)]">
            <img src="showcase/mock-dashboard.png" alt="Liberum Mock student dashboard" className="w-full" />
          </BrowserFrame>

          {/* floating band chip */}
          <div className="absolute -right-3 top-16 hidden animate-float-y rounded-2xl border border-line bg-white/95 p-4 shadow-[0_20px_50px_-16px_rgba(14,15,19,0.25)] backdrop-blur md:block">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-400">Latest band</p>
            <p className="mt-0.5 font-display text-[34px] font-bold leading-none text-ink">7.0</p>
            <Badge tone="green" className="mt-2"><TrendingUp size={10} /> +0.5 this month</Badge>
          </div>
          {/* floating timer chip */}
          <div className="absolute -left-3 bottom-24 hidden animate-float-y rounded-2xl border border-line bg-white/95 px-4 py-3 shadow-[0_20px_50px_-16px_rgba(14,15,19,0.25)] backdrop-blur md:block" style={{ animationDelay: "1.2s" }}>
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-mist text-ink"><Timer size={15} /></span>
              <div>
                <p className="font-display text-[15px] font-bold tabular-nums text-ink">19:42</p>
                <p className="text-[10px] text-ink-400">Reading · real exam timing</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =================================================================
   STATS BAR
================================================================= */
function StatsBar() {
  const stats = [
    { value: "4", label: "Exam sections covered" },
    { value: "9.0", label: "Band scale, like the real test" },
    { value: "100%", label: "Answers auto-saved" },
    { value: "2", label: "Modes: Testing & Platform" },
  ];
  return (
    <section className="border-y border-line bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 divide-line lg:grid-cols-4 lg:divide-x">
        {stats.map((s) => (
          <div key={s.label} className="px-6 py-8 text-center">
            <p className="font-display text-[34px] font-bold tracking-tight text-ink">{s.value}</p>
            <p className="mt-1 text-[13px] text-ink-400">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* =================================================================
   HOW IT WORKS
================================================================= */
function HowItWorks() {
  const steps = [
    { icon: BookOpen, title: "Choose a test", body: "Full mocks or single sections — Listening, Reading, Writing or Speaking practice." },
    { icon: Timer, title: "Take it under exam conditions", body: "Real timing per section, question palette, flags and a distraction-free testing mode." },
    { icon: BarChart3, title: "Receive your bands", body: "Listening & Reading scored instantly. Writing & Speaking get an AI estimated score." },
    { icon: TrendingUp, title: "Improve with analytics", body: "Track band progression, per-skill strengths and accuracy by question type." },
  ];
  return (
    <section id="how" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Eyebrow center>How it works</Eyebrow>
        <h2 className="mx-auto mt-3 max-w-2xl text-center font-display text-[34px] font-bold tracking-tight text-ink sm:text-[42px]">
          From practice test to a plan
        </h2>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s.title} className="reveal group relative rounded-3xl border border-line bg-white p-6 transition hover:border-brand-300 hover:shadow-[0_20px_50px_-20px_rgba(123,97,255,0.35)]">
              <span className="absolute right-5 top-5 font-display text-[40px] font-bold leading-none text-mist transition group-hover:text-brand-100">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                <s.icon size={19} />
              </span>
              <h3 className="mt-4 font-display text-[17px] font-semibold text-ink">{s.title}</h3>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-500">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =================================================================
   TEST TYPES
================================================================= */
const TEST_TYPES = [
  { icon: Headphones, name: "Listening", desc: "Exam-style audio player with limited controls — play, listen, answer. No rewinding the real thing.", q: "40 questions", time: "~30 min" },
  { icon: BookOpen, name: "Reading", desc: "Split-screen passages with in-text highlighting, True/False/Not Given, matching and completion.", q: "40 questions", time: "60 min" },
  { icon: PenLine, name: "Writing", desc: "Task 1 with a real chart and Task 2 essay. Live word count keeps you above the minimum.", q: "2 tasks", time: "60 min" },
  { icon: Mic, name: "Speaking", desc: "Three parts with preparation timers and real microphone recording in your browser.", q: "3 parts", time: "~14 min" },
];

function TestTypes() {
  return (
    <section id="types" className="bg-cloud py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow>Test types</Eyebrow>
            <h2 className="mt-3 max-w-xl font-display text-[34px] font-bold tracking-tight text-ink sm:text-[42px]">
              Every section. Same pressure as test day.
            </h2>
          </div>
          <div className="reveal rounded-2xl border border-brand-200 bg-brand-50 p-5">
            <p className="font-display text-[15px] font-semibold text-ink">Full Mock</p>
            <p className="mt-1 max-w-[240px] text-[13px] leading-relaxed text-ink-500">
              All four sections back-to-back — 2 hours 45 minutes of real exam stamina.
            </p>
          </div>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TEST_TYPES.map((t) => (
            <div key={t.name} className="reveal rounded-3xl border border-line bg-white p-6 transition hover:-translate-y-1 hover:shadow-[0_24px_50px_-24px_rgba(14,15,19,0.25)]">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink text-white">
                <t.icon size={19} />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold text-ink">{t.name}</h3>
              <p className="mt-1.5 min-h-[60px] text-[13.5px] leading-relaxed text-ink-500">{t.desc}</p>
              <div className="mt-4 flex items-center gap-2 border-t border-line pt-3.5 text-xs text-ink-400">
                <ClipboardList size={12} /> {t.q} · {t.time}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =================================================================
   TWO MODES — the product's signature
================================================================= */
function TwoModes() {
  return (
    <section id="modes" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Eyebrow center>Two modes, one platform</Eyebrow>
        <h2 className="mx-auto mt-3 max-w-2xl text-center font-display text-[34px] font-bold tracking-tight text-ink sm:text-[42px]">
          Focused when you test. Insightful when you review.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-[15px] leading-relaxed text-ink-500">
          Liberum Mock deliberately separates two visual modes — and never mixes them.
        </p>
        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {/* Testing mode */}
          <div className="reveal overflow-hidden rounded-3xl border border-line bg-white">
            <div className="border-b border-line p-6">
              <Badge tone="ink">Testing mode</Badge>
              <h3 className="mt-3 font-display text-xl font-bold text-ink">Minimal. Neutral. Exam-like.</h3>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-500">
                A calm, monochrome environment: section timer, question palette, flags — nothing else competing for your attention.
              </p>
            </div>
            <div className="bg-cloud p-5">
              <BrowserFrame url="mock.liberum.uz/test/reading">
                <img src="showcase/mock-exam-reading.png" alt="Testing mode — Reading section" className="w-full" />
              </BrowserFrame>
            </div>
            <div className="flex flex-wrap gap-2 p-5">
              {["Distraction-free", "Real section timing", "Flag & revisit", "Auto-saved answers"].map((f) => (
                <Badge key={f} tone="outline"><Check size={11} /> {f}</Badge>
              ))}
            </div>
          </div>
          {/* Platform mode */}
          <div className="reveal overflow-hidden rounded-3xl border border-line bg-white">
            <div className="border-b border-line p-6">
              <Badge tone="brand">Platform mode</Badge>
              <h3 className="mt-3 font-display text-xl font-bold text-ink">Premium. Analytical. Liberum.</h3>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-500">
                Once you submit, the full Liberum experience takes over: band breakdowns, trends, question review and AI feedback.
              </p>
            </div>
            <div className="bg-gradient-to-br from-[#F6F4FF] to-white p-5">
              <BrowserFrame url="mock.liberum.uz/app/results">
                <img src="showcase/mock-results.png" alt="Platform mode — results and analytics" className="w-full" />
              </BrowserFrame>
            </div>
            <div className="flex flex-wrap gap-2 p-5">
              {["Band breakdown", "Progress trends", "Question review", "AI estimated feedback"].map((f) => (
                <Badge key={f} tone="brand"><Check size={11} /> {f}</Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =================================================================
   EXAM FEATURES + ANALYTICS SHOWCASE
================================================================= */
function ExamFeatures() {
  const features = [
    { icon: Timer, title: "Timer states", body: "Normal, warning under 10 minutes, critical under 5 — and automatic section advance at zero." },
    { icon: Flag, title: "Flag & navigate", body: "A numbered palette shows current, answered, unanswered and flagged questions at a glance." },
    { icon: Highlighter, title: "Passage highlighting", body: "Select any text in the Reading passage to highlight it. Click a highlight to remove it." },
    { icon: Mic, title: "Real recording", body: "Speaking uses your actual microphone with preparation and speaking timers per part." },
  ];
  return (
    <section className="bg-ink py-24 text-white">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Eyebrow>Inside the exam room</Eyebrow>
            <h2 className="mt-3 font-display text-[34px] font-bold tracking-tight sm:text-[42px]">
              Built to feel like test day — before test day
            </h2>
            <div className="mt-8 space-y-5">
              {features.map((f) => (
                <div key={f.title} className="reveal flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-brand-300 ring-1 ring-white/15">
                    <f.icon size={17} />
                  </span>
                  <div>
                    <h3 className="font-display text-[15.5px] font-semibold">{f.title}</h3>
                    <p className="mt-1 text-[13.5px] leading-relaxed text-white/60">{f.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="reveal">
            <BrowserFrame url="mock.liberum.uz/app/analytics">
              <img src="showcase/mock-analytics.png" alt="Performance analytics" className="w-full" />
            </BrowserFrame>
            <p className="mt-4 text-center text-xs text-white/40">
              Real screenshot from Liberum Mock — performance analytics in platform mode.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =================================================================
   FOR TEACHERS
================================================================= */
function ForTeachers() {
  const items = [
    { icon: FilePlus2, title: "Create mocks in minutes", body: "A 6-step builder: basic info, sections, question builder with answer keys, settings, preview, publish." },
    { icon: Send, title: "Assign with deadlines", body: "Pick a test, choose students, set a due date. Students see it on their dashboard instantly." },
    { icon: BarChart3, title: "Track every band", body: "Per-student results, class averages and AI-estimated flags where a human review helps." },
  ];
  return (
    <section id="teachers" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="reveal order-2 lg:order-1">
            <BrowserFrame url="mock.liberum.uz/app">
              <img src="showcase/mock-teacher.png" alt="Teacher dashboard" className="w-full" />
            </BrowserFrame>
          </div>
          <div className="order-1 lg:order-2">
            <Eyebrow>For teachers</Eyebrow>
            <h2 className="mt-3 font-display text-[34px] font-bold tracking-tight text-ink sm:text-[42px]">
              Your own IELTS test lab
            </h2>
            <div className="mt-8 space-y-6">
              {items.map((f) => (
                <div key={f.title} className="reveal flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <f.icon size={17} />
                  </span>
                  <div>
                    <h3 className="font-display text-[15.5px] font-semibold text-ink">{f.title}</h3>
                    <p className="mt-1 text-[13.5px] leading-relaxed text-ink-500">{f.body}</p>
                  </div>
                </div>
              ))}
            </div>
            <BtnLink to="/register" className="mt-8">Create teacher account <ArrowRight size={15} /></BtnLink>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =================================================================
   HONESTY / TRUST
================================================================= */
function Trust() {
  return (
    <section className="border-y border-line bg-cloud py-16">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:grid-cols-3 lg:px-8">
        {[
          { icon: ShieldCheck, title: "Honest scoring", body: "Listening & Reading are scored from the answer key. Writing & Speaking are clearly labelled AI estimated — never presented as official IELTS bands." },
          { icon: Check, title: "Authentic & reliable", body: "Answers are genuinely saved as you type. Real timer, real question formats, and full diagnostic feedback." },
          { icon: Target, title: "Built for progress", body: "Every result feeds your analytics: band trends, per-skill bars and accuracy by question type." },
        ].map((t) => (
          <div key={t.title} className="reveal flex gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-600 ring-1 ring-line">
              <t.icon size={17} />
            </span>
            <div>
              <h3 className="font-display text-[15px] font-semibold text-ink">{t.title}</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-500">{t.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* =================================================================
   FINAL CTA + FOOTER
================================================================= */
function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-500 via-brand-600 to-[#5A41D8] py-24 text-center text-white">
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-ink/20 blur-3xl" />
      <div className="relative mx-auto max-w-2xl px-5">
        <h2 className="font-display text-[36px] font-bold tracking-tight sm:text-[46px]">
          Your next band score starts with a mock
        </h2>
        <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-white/75">
          Take a full mock this week and see exactly where you stand — section by section.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <BtnLink to="/register" variant="white" size="lg">Take a free mock <ArrowRight size={16} /></BtnLink>
          <BtnLink to="/login" variant="ghost" size="lg" className="text-white ring-1 ring-white/30 hover:bg-white/10">Sign in</BtnLink>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-ink py-12 text-white/50">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-5 text-center lg:px-8">
        <div className="flex items-center gap-2.5">
          <LiberumLogo dark to="/" />
          <MockMark dark />
        </div>
        <p className="max-w-md text-[13px] leading-relaxed">
          IELTS-style mock exams inside the Liberum ecosystem — alongside Meet for live lessons and Studio for teaching businesses.
        </p>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[13px]">
          <a href="#how" className="transition hover:text-white">How it works</a>
          <a href="#types" className="transition hover:text-white">Test types</a>
          <a href="#modes" className="transition hover:text-white">Two modes</a>
          <a href="#teachers" className="transition hover:text-white">For teachers</a>
        </div>
        <p className="text-xs text-white/30">© 2026 Liberum · mock.liberum.uz — IELTS is a registered trademark of its owners; Liberum Mock is a practice platform.</p>
      </div>
    </footer>
  );
}

export default function MockLandingPage() {
  useReveal();
  useEffect(() => {
    document.title = "Liberum Mock — Practice IELTS like the real thing.";
  }, []);
  return (
    <div className="min-h-screen bg-white font-sans text-ink antialiased">
      <LandingNav />
      <Hero />
      <StatsBar />
      <HowItWorks />
      <TestTypes />
      <TwoModes />
      <ExamFeatures />
      <ForTeachers />
      <Trust />
      <FinalCta />
      <Footer />
    </div>
  );
}
