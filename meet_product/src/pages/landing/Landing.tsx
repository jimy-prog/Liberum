import { useState } from "react";
import {
  ArrowRight, Bell, BookOpen, CalendarDays, Check, ChevronDown,
  Compass, Lock, Menu, MessageSquare, Mic, MonitorUp,
  ShieldCheck, Sparkles, Video, X,
} from "lucide-react";
import { BrowserFrame, LiberumLogo, MeetMark } from "@/components/brand";
import { Avatar, Badge, BtnLink, Eyebrow } from "@/components/ui-kit";
import { useReveal } from "@/hooks/use-reveal";
import { cn } from "@/lib/utils";

/* =================================================================
   NAV
================================================================= */
function LandingNav() {
  const [open, setOpen] = useState(false);
  const links = [
    { label: "How it works", href: "#how" },
    { label: "For Students", href: "#students" },
    { label: "For Teachers", href: "#teachers" },
    { label: "Classroom", href: "#classroom" },
  ];
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line/70 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-5 lg:px-8">
        <div className="flex items-center gap-2.5">
          <LiberumLogo />
          <MeetMark />
        </div>
        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          <div className="group relative">
            <button className="flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-medium text-ink-500 transition hover:bg-mist hover:text-ink">
              Products <ChevronDown size={13} />
            </button>
            <div className="invisible absolute left-0 top-full pt-2 opacity-0 transition group-hover:visible group-hover:opacity-100">
              <div className="w-64 rounded-2xl border border-line bg-white p-2 shadow-[0_24px_60px_-16px_rgba(14,15,19,0.2)]">
                {[
                  ["Meet", "Teach and learn online", true],
                  ["Studio", "Run your teaching business", false],
                  ["Mock", "IELTS-style assessment", false],
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
        <div className="ml-auto hidden items-center gap-2 lg:flex">
          <BtnLink to="/login" variant="ghost" size="sm">Log in</BtnLink>
          <BtnLink to="/register" variant="ink" size="sm">Sign up <ArrowRight size={13} /></BtnLink>
        </div>
        <button className="ml-auto rounded-lg p-2 text-ink lg:hidden" onClick={() => setOpen((v) => !v)} aria-label="Menu">
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
          <div className="mt-3 flex gap-2">
            <BtnLink to="/login" variant="outline" className="flex-1">Log in</BtnLink>
            <BtnLink to="/register" variant="ink" className="flex-1">Sign up</BtnLink>
          </div>
        </div>
      )}
    </header>
  );
}

/* =================================================================
   HERO — floating live classroom mock
================================================================= */
function HeroClassroomMock() {
  return (
    <div className="animate-float-y relative">
      <div className="overflow-hidden rounded-2xl bg-[#0E0F13] shadow-[0_48px_120px_-32px_rgba(123,97,255,0.5)] ring-1 ring-white/10">
        {/* top bar */}
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
          <span className="font-display text-[11px] font-bold text-white">
            Liber<span className="text-brand-400">um</span>
            <span className="ml-1.5 rounded-full bg-white/10 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-widest text-white/60">Meet</span>
          </span>
          <span className="rounded-full bg-white/10 px-2.5 py-0.5 font-display text-[10px] font-semibold tabular-nums text-white/85">48:32 / 60:00</span>
        </div>
        {/* videos */}
        <div className="grid grid-cols-2 gap-2.5 p-3">
          <div className="relative flex h-32 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-brand-600/40 to-brand-900 ring-1 ring-white/10 sm:h-40">
            <Avatar initials="AK" color="#7B61FF" size="lg" className="ring-2 ring-white/20" />
            <div className="mt-2 flex items-end gap-0.5">
              {[0.8, 1.1, 0.6, 1.0, 0.7].map((d, i) => (
                <span key={i} className="eq-bar h-2.5 w-[3px] rounded-full bg-brand-300" style={{ animationDuration: `${d}s`, animationDelay: `${i * 0.12}s` }} />
              ))}
            </div>
            <span className="absolute bottom-2 left-2 rounded-full bg-black/50 px-2 py-0.5 text-[9px] font-medium text-white backdrop-blur">Aziza K. · Teacher</span>
          </div>
          <div className="relative flex h-32 flex-col items-center justify-center rounded-xl bg-[#14151B] ring-1 ring-white/10 sm:h-40">
            <Avatar initials="JT" color="#1FAD55" size="lg" className="ring-2 ring-white/20" />
            <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 text-[9px] font-medium text-white backdrop-blur">
              <Mic size={8} className="text-[#4ADE80]" /> Jasur T. · Student
            </span>
          </div>
        </div>
        {/* controls */}
        <div className="flex items-center justify-center gap-2 pb-3.5">
          {[Mic, Video, MonitorUp, MessageSquare].map((Icon, i) => (
            <span key={i} className={cn("flex h-8 w-8 items-center justify-center rounded-full", i === 3 ? "bg-brand-500 text-white" : "bg-white/10 text-white/80")}>
              <Icon size={13} />
            </span>
          ))}
          <span className="ml-1 flex h-8 items-center rounded-full bg-danger px-3.5 text-[10px] font-semibold text-white">Leave</span>
        </div>
      </div>

      {/* floating cards */}
      <div className="absolute -left-4 -top-5 hidden animate-fade-up rounded-xl border border-line bg-white px-3.5 py-2.5 shadow-[0_16px_40px_-16px_rgba(14,15,19,0.3)] sm:block" style={{ animationDelay: "0.4s" }}>
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E9F9EF] text-[#157A3E]"><Check size={12} strokeWidth={3} /></span>
          <div>
            <p className="text-[11px] font-semibold text-ink">Lesson booked</p>
            <p className="text-[9px] text-ink-400">IELTS Speaking · Today 17:30</p>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-5 -right-3 hidden animate-fade-up rounded-xl border border-line bg-white px-3.5 py-2.5 shadow-[0_16px_40px_-16px_rgba(14,15,19,0.3)] sm:block" style={{ animationDelay: "0.7s" }}>
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-50 text-brand-600"><Bell size={11} /></span>
          <div>
            <p className="text-[11px] font-semibold text-ink">Starts in 10 minutes</p>
            <p className="text-[9px] text-ink-400">Classroom is ready</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden pt-16">
      <div className="bg-grid-light absolute inset-0 opacity-60" style={{ maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent)" }} />
      <div className="absolute -top-40 left-1/2 h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-brand-500/10 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-16 sm:pt-24 lg:grid-cols-[1.05fr_1fr] lg:px-8 lg:pb-28">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3.5 py-1.5 text-xs font-medium text-ink-500 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
            Part of the Liberum ecosystem
          </div>
          <h1 className="mt-6 font-display text-[52px] font-bold leading-[1.02] tracking-tight text-ink sm:text-[72px]">
            Teach.
            <br />
            Learn.
            <br />
            <span className="text-brand-500">Meet.</span>
          </h1>
          <p className="mt-6 max-w-md text-[17px] leading-relaxed text-ink-500">
            Connect with great teachers, book lessons around your schedule, and learn in a classroom built for education — not meetings.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <BtnLink to="/app/teachers" variant="ink" size="lg">
              Find a Teacher <ArrowRight size={16} />
            </BtnLink>
            <BtnLink to="/register" variant="outline" size="lg">
              Become a Teacher
            </BtnLink>
          </div>
          <p className="mt-5 text-[13px] text-ink-400">Free to join · For students and independent teachers</p>
        </div>
        <div className="relative mx-auto w-full max-w-[520px]">
          <HeroClassroomMock />
        </div>
      </div>

      {/* stat bar */}
      <div className="relative border-y border-line bg-cloud">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-5 py-5 lg:px-8">
          {[
            ["240+", "independent teachers"],
            ["9,800+", "lessons taught"],
            ["4.9", "average rating"],
            ["3", "languages"],
          ].map(([v, l]) => (
            <div key={l} className="flex items-baseline gap-2">
              <span className="font-display text-xl font-bold text-ink">{v}</span>
              <span className="text-[13px] text-ink-400">{l}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =================================================================
   HOW IT WORKS
================================================================= */
function HowItWorks() {
  const steps = [
    { n: "01", icon: Compass, title: "Find a Teacher", desc: "Browse verified independent teachers by subject, price, rating, and real availability." },
    { n: "02", icon: BookOpen, title: "Choose a Lesson", desc: "Every teacher offers clear lesson options — trial, exam prep, conversation — with transparent pricing." },
    { n: "03", icon: CalendarDays, title: "Book a Time", desc: "Pick a slot from the teacher's live availability. Both of you get instant confirmation." },
    { n: "04", icon: Video, title: "Meet & Learn", desc: "At lesson time, join the Liberum Classroom — video, screen share, chat, and a lesson timer." },
  ];
  return (
    <section id="how" className="mx-auto max-w-7xl px-5 py-24 lg:px-8 lg:py-32">
      <div className="reveal">
        <Eyebrow center>How Liberum Meet works</Eyebrow>
        <h2 className="mt-4 text-center font-display text-4xl font-bold tracking-tight text-ink sm:text-[44px] sm:leading-[1.1]">
          From search to classroom
          <br />
          in <span className="text-brand-500">four steps.</span>
        </h2>
      </div>
      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <div key={s.n} className="reveal group relative rounded-2xl border border-line bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-[0_20px_48px_-20px_rgba(123,97,255,0.35)]" style={{ transitionDelay: `${i * 60}ms` }}>
            <div className="flex items-center justify-between">
              <span className="font-display text-[13px] font-bold text-brand-500">{s.n}</span>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-500 group-hover:text-white">
                <s.icon size={18} />
              </span>
            </div>
            <p className="mt-5 font-display text-lg font-semibold text-ink">{s.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-500">{s.desc}</p>
            {i < steps.length - 1 && (
              <ArrowRight size={16} className="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-brand-300 lg:block" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

/* =================================================================
   FOR STUDENTS / FOR TEACHERS
================================================================= */
function SplitSections() {
  return (
    <>
      {/* Students */}
      <section id="students" className="border-y border-line bg-cloud">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-24 lg:grid-cols-2 lg:px-8">
          <div className="reveal">
            <Eyebrow>For students</Eyebrow>
            <h2 className="mt-4 font-display text-4xl font-bold leading-[1.08] tracking-tight text-ink">
              Your teacher is out there. <span className="text-brand-500">Book them tonight.</span>
            </h2>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-ink-500">
              Search by subject, compare real profiles and prices, and book a slot that fits your week — no agencies, no waiting for callbacks.
            </p>
            <ul className="mt-7 space-y-3.5">
              {[
                "Verified teacher profiles with real ratings and experience",
                "Live availability — what you see is what you can book",
                "One-click classroom access when the lesson starts",
                "All your lessons, past and upcoming, in one place",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-sm text-ink-600">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                    <Check size={11} strokeWidth={3} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
            <BtnLink to="/app/teachers" variant="ink" size="lg" className="mt-8">
              Find Your Teacher <ArrowRight size={15} />
            </BtnLink>
          </div>
          <div className="reveal">
            <BrowserFrame url="meet.liberum.uz/teachers">
              <img src="showcase/find-teachers.png" alt="Liberum Meet teacher discovery interface" className="block w-full" />
            </BrowserFrame>
          </div>
        </div>
      </section>

      {/* Teachers */}
      <section id="teachers" className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-24 lg:grid-cols-2 lg:px-8">
        <div className="reveal order-2 lg:order-1">
          <BrowserFrame url="meet.liberum.uz/app/availability">
            <img src="showcase/availability.png" alt="Liberum Meet availability management" className="block w-full" />
          </BrowserFrame>
        </div>
        <div className="reveal order-1 lg:order-2">
          <Eyebrow>For teachers</Eyebrow>
          <h2 className="mt-4 font-display text-4xl font-bold leading-[1.08] tracking-tight text-ink">
            Teach online. <span className="text-brand-500">Keep your independence.</span>
          </h2>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-ink-500">
            Create a professional profile, set your hours and prices, and let students book you directly. No education center taking a cut.
          </p>
          <ul className="mt-7 space-y-3.5">
            {[
              "A public profile that sells your teaching — photo, bio, pricing",
              "Calendar-based availability that generates bookable slots",
              "Instant booking notifications and lesson reminders",
              "A classroom built for teaching, already connected to your schedule",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3 text-sm text-ink-600">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                  <Check size={11} strokeWidth={3} />
                </span>
                {t}
              </li>
            ))}
          </ul>
          <BtnLink to="/register" size="lg" className="mt-8">
            Become a Teacher <ArrowRight size={15} />
          </BtnLink>
        </div>
      </section>
    </>
  );
}

/* =================================================================
   SHOWCASE — real product screenshots
================================================================= */
function Showcase() {
  const items = [
    {
      src: "showcase/teacher-profile.png",
      url: "meet.liberum.uz/teachers/aziza",
      tag: "Teacher profile",
      title: "Profiles that build trust.",
      desc: "Ratings, experience, languages, lesson options, and live availability — everything a student needs to decide.",
    },
    {
      src: "showcase/booking.png",
      url: "meet.liberum.uz/book",
      tag: "Booking",
      title: "Booking in under a minute.",
      desc: "Choose a lesson, pick a date, pick a time, confirm. Both sides are notified instantly.",
    },
    {
      src: "showcase/classroom.png",
      url: "meet.liberum.uz/classroom",
      tag: "Classroom",
      title: "A classroom built for teaching.",
      desc: "Video, audio, screen sharing, chat, and a lesson timer — designed for education, not meetings.",
    },
    {
      src: "showcase/student-dashboard.png",
      url: "meet.liberum.uz/app",
      tag: "Student dashboard",
      title: "Every lesson, one calm place.",
      desc: "Next lesson up front, upcoming and completed below. Join the classroom with one click.",
    },
  ];
  return (
    <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8 lg:py-32">
      <div className="reveal">
        <Eyebrow center>The product</Eyebrow>
        <h2 className="mt-4 text-center font-display text-4xl font-bold tracking-tight text-ink sm:text-[44px]">
          Designed to disappear.
          <br />
          <span className="text-ink-300">So learning can happen.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-[15px] leading-relaxed text-ink-500">
          Every screen below is the actual Liberum Meet interface — no mockups, no renders.
        </p>
      </div>
      <div className="mt-16 space-y-20">
        {items.map((it, i) => (
          <div key={it.src} className={cn("reveal grid items-center gap-10 lg:grid-cols-[1fr_1.25fr]", i % 2 === 1 && "lg:[&>*:first-child]:order-2")}>
            <div>
              <Badge tone="brand">{it.tag}</Badge>
              <h3 className="mt-3 font-display text-[28px] font-bold tracking-tight text-ink">{it.title}</h3>
              <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-ink-500">{it.desc}</p>
            </div>
            <BrowserFrame url={it.url}>
              <img src={it.src} alt={`Liberum Meet ${it.tag}`} className="block w-full" loading="lazy" />
            </BrowserFrame>
          </div>
        ))}
      </div>
    </section>
  );
}

/* =================================================================
   CLASSROOM SECTION (dark)
================================================================= */
function ClassroomSection() {
  const feats = [
    { icon: Video, title: "HD video & audio", desc: "Crisp, low-latency calls with live connection quality indicators." },
    { icon: MonitorUp, title: "Screen sharing", desc: "Walk through essays, code, or diagrams — one click to share." },
    { icon: MessageSquare, title: "Lesson chat", desc: "Notes, links, and corrections — kept with the lesson." },
    { icon: CalendarDays, title: "Lesson timer", desc: "A shared sense of pace, with gentle 10- and 5-minute reminders." },
  ];
  return (
    <section id="classroom" className="relative overflow-hidden bg-ink py-24 text-white lg:py-32">
      <div className="bg-grid-dark absolute inset-0 opacity-50" />
      <div className="absolute -top-48 right-0 h-[420px] w-[620px] rounded-full bg-brand-500/20 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div className="reveal mx-auto max-w-2xl text-center">
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-6 bg-brand-400/60" />
            <span className="font-display text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-300">Liberum Classroom</span>
            <span className="h-px w-6 bg-brand-400/60" />
          </div>
          <h2 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-[44px] sm:leading-[1.1]">
            A classroom <span className="text-brand-400">built for teaching.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-white/60">
            Not a repurposed meeting tool. Liberum Classroom is designed around the rhythm of a lesson — focus, timing, and interaction.
          </p>
        </div>
        <div className="reveal mx-auto mt-12 max-w-4xl">
          <BrowserFrame url="meet.liberum.uz/classroom/les-1">
            <img src="showcase/classroom.png" alt="Liberum Meet classroom" className="block w-full" />
          </BrowserFrame>
        </div>
        <div className="mx-auto mt-14 grid max-w-4xl gap-4 sm:grid-cols-2">
          {feats.map((f) => (
            <div key={f.title} className="reveal flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur transition hover:border-brand-400/40 hover:bg-white/10">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/20 text-brand-300">
                <f.icon size={17} />
              </span>
              <div>
                <p className="font-display text-[15px] font-semibold">{f.title}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-white/55">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="reveal mt-10 text-center">
          <BtnLink to="/classroom/les-1" size="lg">
            Explore the Classroom <ArrowRight size={15} />
          </BtnLink>
        </div>
      </div>
    </section>
  );
}

/* =================================================================
   TRUST
================================================================= */
function Trust() {
  const items = [
    { icon: ShieldCheck, title: "Verified teachers", desc: "Profiles are reviewed before they can take bookings." },
    { icon: Lock, title: "Private classrooms", desc: "Only the booked teacher and student can enter a lesson room." },
    { icon: Bell, title: "Reliable reminders", desc: "Booking confirmations and lesson reminders for both sides." },
    { icon: Sparkles, title: "Part of Liberum", desc: "One account across Meet, Studio, Mock, and AI." },
  ];
  return (
    <section className="border-b border-line bg-cloud">
      <div className="mx-auto grid max-w-7xl gap-4 px-5 py-16 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        {items.map((it) => (
          <div key={it.title} className="reveal flex gap-3.5 p-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-brand-600 ring-1 ring-line">
              <it.icon size={16} />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">{it.title}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-500">{it.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* =================================================================
   ECOSYSTEM
================================================================= */
function Ecosystem() {
  const products = [
    { name: "Studio", desc: "Run your teaching business — students, groups, schedule, finance.", status: "Available now", active: false },
    { name: "Meet", desc: "Teach and learn online — discovery, booking, classrooms.", status: "You are here", active: true },
    { name: "Mock", desc: "IELTS-style assessment in a professional testing environment.", status: "Available now", active: false },
    { name: "AI", desc: "Intelligent evaluation and feedback, built into the workflow.", status: "Available now", active: false },
  ];
  return (
    <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8 lg:py-32">
      <div className="reveal">
        <Eyebrow center>The Liberum ecosystem</Eyebrow>
        <h2 className="mt-4 text-center font-display text-4xl font-bold tracking-tight text-ink sm:text-[44px]">
          One account. <span className="text-brand-500">One ecosystem.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-[15px] leading-relaxed text-ink-500">
          Meet is where lessons happen live — connected to everything else Liberum does for teachers and students.
        </p>
      </div>
      <div className="mx-auto mt-12 grid max-w-5xl gap-4 sm:grid-cols-2">
        {products.map((p) => (
          <div
            key={p.name}
            className={cn(
              "reveal rounded-2xl border p-6 transition",
              p.active
                ? "border-brand-300 bg-gradient-to-br from-brand-50 to-white shadow-[0_20px_48px_-24px_rgba(123,97,255,0.4)]"
                : "border-line bg-white hover:border-ink-300"
            )}
          >
            <div className="flex items-center justify-between">
              <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl font-display text-sm font-bold", p.active ? "bg-brand-500 text-white" : "bg-mist text-ink-500")}>
                {p.name[0]}
              </span>
              <Badge tone={p.active ? "brand" : "gray"}>{p.status}</Badge>
            </div>
            <p className="mt-4 font-display text-lg font-semibold text-ink">
              Liberum <span className="text-brand-500">{p.name}</span>
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{p.desc}</p>
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
    <section className="px-5 pb-24 lg:px-8">
      <div className="reveal relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800 px-6 py-20 text-center text-white sm:px-12">
        <div className="bg-grid-dark absolute inset-0 opacity-40" />
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="relative">
          <h2 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Your next lesson starts here.</h2>
          <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-white/75">
            Join Liberum Meet — as a student ready to learn, or a teacher ready to grow.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <BtnLink to="/app/teachers" variant="white" size="lg">Find a Teacher <ArrowRight size={15} /></BtnLink>
            <BtnLink to="/register" size="lg" className="border border-white/30 bg-white/10 text-white hover:bg-white/20">Become a Teacher</BtnLink>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const [lang, setLang] = useState("English");
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <LiberumLogo />
              <MeetMark />
            </div>
            <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-ink-500">
              Liberum Meet — online lessons, teacher discovery, booking, and virtual classrooms. Part of the Liberum education ecosystem.
            </p>
            <div className="relative mt-5 inline-block">
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="h-9 appearance-none rounded-full border border-line bg-white pl-3.5 pr-8 text-[13px] font-medium text-ink outline-none transition focus:border-brand-500"
              >
                <option>English</option>
                <option>Русский</option>
                <option>O‘zbek</option>
              </select>
              <ChevronDown size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-400" />
            </div>
          </div>
          {[
            { title: "Products", links: ["Meet", "Studio", "Mock", "AI"] },
            { title: "Meet", links: ["For Teachers", "For Students", "Classroom", "Pricing"] },
            { title: "Support", links: ["Help Center", "Contact", "Privacy", "Terms"] },
          ].map((col) => (
            <div key={col.title}>
              <p className="font-display text-[13px] font-semibold uppercase tracking-wide text-ink-400">{col.title}</p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" onClick={(e) => e.preventDefault()} className="text-sm text-ink-500 transition hover:text-brand-600">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6 text-xs text-ink-400">
          <p>© 2026 Liberum · Tashkent, Uzbekistan</p>
          <p>meet.liberum.uz — Teach. Learn. Meet.</p>
        </div>
      </div>
    </footer>
  );
}

/* =================================================================
   PAGE
================================================================= */
export default function LandingPage() {
  useReveal();
  return (
    <div className="min-h-screen bg-white">
      <LandingNav />
      <Hero />
      <HowItWorks />
      <SplitSections />
      <Showcase />
      <ClassroomSection />
      <Trust />
      <Ecosystem />
      <FinalCta />
      <Footer />
    </div>
  );
}
