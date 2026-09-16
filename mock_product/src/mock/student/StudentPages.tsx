import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  AlertTriangle, ArrowRight, BookOpen, CheckCircle2, ChevronLeft, Clock,
  FileText, Headphones, Mic, PenLine, PlayCircle, Sparkles, TrendingUp, Wifi,
} from "lucide-react";
import { MOCK_TESTS, type MockTest } from "../data";
import { useMock } from "../store";
import { BandChip, BandTrendChart, SkillBar } from "../components";
import { Avatar, Badge, Btn, BtnLink, Card, EmptyState } from "@/components/ui-kit";
import { cn } from "@/lib/utils";
import { BAND_TREND } from "../data";

const sectionIcons = { listening: Headphones, reading: BookOpen, writing: PenLine, speaking: Mic };

/* ================= DASHBOARD ================= */
export function MockDashboard() {
  const { user, attempts } = useMock();
  const latest = attempts[0];
  const recommended = MOCK_TESTS.find((t) => t.status === "new");

  return (
    <div className="mx-auto max-w-5xl animate-fade-up">
      <p className="text-[13px] text-ink-400">Saturday · Aug 22</p>
      <h1 className="mt-1 font-display text-[30px] font-bold tracking-tight text-ink">
        Good afternoon, {user?.name.split(" ")[0]}
      </h1>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        {/* Latest band */}
        <Card className="relative overflow-hidden p-6">
          <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-brand-400 to-brand-600" />
          <div className="flex flex-wrap items-center gap-6">
            <div className="text-center">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-400">Latest overall band</p>
              <p className="mt-1 font-display text-[56px] font-bold leading-none tracking-tight text-ink">{latest?.overall.toFixed(1) ?? "—"}</p>
              <Badge tone="green" className="mt-2"><TrendingUp size={11} /> +0.5 vs July</Badge>
            </div>
            <div className="min-w-[220px] flex-1 space-y-3">
              <SkillBar label="Listening" value={latest?.listening ?? 0} />
              <SkillBar label="Reading" value={latest?.reading ?? 0} />
              <SkillBar label="Writing" value={latest?.writing ?? 0} />
              <SkillBar label="Speaking" value={latest?.speaking ?? 0} />
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4">
            <BtnLink to={`/app/results/${latest?.id ?? "a1"}`} variant="outline" size="sm">View full results</BtnLink>
            <BtnLink to="/app/analytics" variant="ghost" size="sm">Analytics <ArrowRight size={13} /></BtnLink>
          </div>
        </Card>

        {/* Recommended next action */}
        <Card className="flex flex-col justify-between bg-gradient-to-br from-brand-500 to-brand-700 p-6 text-white">
          <div>
            <Badge className="bg-white/15 text-white ring-white/25">Recommended next</Badge>
            <p className="mt-3 font-display text-xl font-bold leading-snug">{recommended?.title ?? "IELTS Academic Mock 02"}</p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-white/75">
              Your Writing band trails your other skills. A full mock keeps your exam stamina sharp before the real test day.
            </p>
          </div>
          <div className="mt-5 flex items-center justify-between">
            <span className="flex items-center gap-2 text-[13px] text-white/75"><Clock size={14} /> {recommended?.durationMin ?? 165} min · full test</span>
            <BtnLink to="/app/tests" variant="white" size="md">Start Next Mock <ArrowRight size={14} /></BtnLink>
          </div>
        </Card>
      </div>

      {/* Progress */}
      <Card className="mt-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink">Overall progress</h2>
          <Badge tone="brand">Target 7.5</Badge>
        </div>
        <div className="mt-4">
          <BandTrendChart data={BAND_TREND} />
        </div>
      </Card>

      {/* Recent + available */}
      <div className="mt-9 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-ink">Available tests</h2>
        <Link to="/app/tests" className="text-[13px] font-medium text-brand-600 hover:underline">View all</Link>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {MOCK_TESTS.slice(0, 4).map((t) => (
          <TestCard key={t.id} test={t} />
        ))}
      </div>
    </div>
  );
}

export function TestCard({ test: t }: { test: MockTest }) {
  return (
    <Card className="group flex flex-col p-5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_48px_-20px_rgba(14,15,19,0.22)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          {t.sections.map((s) => {
            const Icon = sectionIcons[s];
            return (
              <span key={s} className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-brand-600" title={s}>
                <Icon size={13} />
              </span>
            );
          })}
        </div>
        {t.status === "completed" ? (
          <Badge tone="green"><CheckCircle2 size={11} /> Completed · {t.bestBand?.toFixed(1)}</Badge>
        ) : t.status === "in-progress" ? (
          <Badge tone="amber">In progress</Badge>
        ) : (
          <Badge tone="brand">New</Badge>
        )}
      </div>
      <p className="mt-3.5 font-display text-[15px] font-semibold text-ink">{t.title}</p>
      <p className="mt-1 flex items-center gap-3 text-xs text-ink-400">
        <span>{t.type}</span>·<span>{t.difficulty}</span>·<span className="inline-flex items-center gap-1"><Clock size={11} /> {t.durationMin} min</span>·<span>{t.questionsCount} questions</span>
      </p>
      <div className="mt-4 flex gap-2 border-t border-line pt-4">
        <BtnLink to={`/app/tests/${t.id}`} variant={t.status === "completed" ? "outline" : "ink"} size="sm" className="flex-1">
          {t.status === "completed" ? "Review" : "Start Test"}
        </BtnLink>
      </div>
    </Card>
  );
}

/* ================= TEST LIBRARY ================= */
export function TestLibraryPage() {
  const [filter, setFilter] = useState("All");
  const types = ["All", "Full Mock", "Reading", "Listening", "Writing", "Speaking"];
  const list = MOCK_TESTS.filter((t) => filter === "All" || t.type === filter);
  return (
    <div className="mx-auto max-w-5xl animate-fade-up">
      <h1 className="font-display text-[28px] font-bold tracking-tight text-ink">Mock tests</h1>
      <p className="mt-1.5 text-sm text-ink-500">Realistic computer-delivered IELTS simulations — full mocks and focused practice.</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {types.map((t) => (
          <button key={t} onClick={() => setFilter(t)}
            className={cn("h-9 rounded-full border px-4 text-[13px] font-medium transition active:scale-[0.97]",
              filter === t ? "border-ink bg-ink text-white" : "border-line bg-white text-ink-500 hover:border-ink-400")}>
            {t}
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <div className="mt-6"><EmptyState icon={<BookOpen size={20} />} title="No mock tests available yet" body="New tests are added weekly — check back soon." /></div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {list.map((t) => <TestCard key={t.id} test={t} />)}
        </div>
      )}
    </div>
  );
}

/* ================= TEST INFO ================= */
export function TestInfoPage() {
  const { id } = useParams();
  const t = MOCK_TESTS.find((x) => x.id === id) ?? MOCK_TESTS[0];
  return (
    <div className="mx-auto max-w-3xl animate-fade-up">
      <Link to="/app/tests" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-500 transition hover:text-ink">
        <ChevronLeft size={15} /> All tests
      </Link>
      <Card className="mt-4 overflow-hidden">
        <div className="bg-gradient-to-r from-brand-500 to-brand-700 px-7 py-8 text-white">
          <Badge className="bg-white/15 text-white ring-white/25">{t.type}</Badge>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight">{t.title}</h1>
          <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-white/75">
            <span className="inline-flex items-center gap-1.5"><Clock size={13} /> {t.durationMin} minutes</span>
            <span className="inline-flex items-center gap-1.5"><FileText size={13} /> {t.questionsCount} questions</span>
            <span>{t.difficulty}</span>
          </p>
        </div>
        <div className="p-7">
          <h2 className="font-display text-[15px] font-semibold text-ink">Sections</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {t.sections.map((s) => {
              const Icon = sectionIcons[s];
              const mins = { listening: 10, reading: 20, writing: 60, speaking: 14 }[s];
              return (
                <div key={s} className="flex items-center gap-3 rounded-xl border border-line p-3.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><Icon size={16} /></span>
                  <div>
                    <p className="text-sm font-semibold capitalize text-ink">{s}</p>
                    <p className="text-xs text-ink-400">~{mins} min · exam duration</p>
                  </div>
                </div>
              );
            })}
          </div>
          <h2 className="mt-7 font-display text-[15px] font-semibold text-ink">Rules</h2>
          <ul className="mt-3 space-y-2.5">
            {[
              "Your answers are saved automatically as you go — a refresh won't lose your work.",
              "The timer runs per section and cannot be paused.",
              "Flag questions to revisit them before submitting.",
              "Listening & Reading are scored instantly; Writing & Speaking receive an AI estimated score.",
            ].map((r) => (
              <li key={r} className="flex items-start gap-2.5 text-sm text-ink-600">
                <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-brand-500" /> {r}
              </li>
            ))}
          </ul>
          <div className="mt-7 flex items-center justify-between rounded-xl bg-cloud p-4">
            <p className="text-[13px] text-ink-500">Ready when you are.</p>
            <BtnLink to={`/app/tests/${t.id}/instructions`} size="lg">Start Test <ArrowRight size={15} /></BtnLink>
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ================= INSTRUCTIONS ================= */
export function TestInstructionsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const t = MOCK_TESTS.find((x) => x.id === id) ?? MOCK_TESTS[0];
  const [agreed, setAgreed] = useState(false);
  return (
    <div className="mx-auto max-w-2xl animate-fade-up">
      <Card className="p-7">
        <Badge tone="brand">Before you begin</Badge>
        <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-ink">{t.title}</h1>
        <p className="mt-1 text-sm text-ink-500">You will complete: {t.sections.map((s) => s[0].toUpperCase() + s.slice(1)).join(" · ")}</p>

        <div className="mt-6 space-y-3">
          {[
            { icon: Wifi, text: "Your internet connection is stable" },
            { icon: Mic, text: "Your microphone works (for the Speaking section)" },
            { icon: Headphones, text: "You are in a quiet environment" },
            { icon: Clock, text: "The timer cannot be paused once the test begins" },
          ].map((r) => (
            <div key={r.text} className="flex items-center gap-3 rounded-xl border border-line px-4 py-3">
              <r.icon size={16} className="shrink-0 text-brand-500" />
              <p className="text-sm text-ink-600">{r.text}</p>
            </div>
          ))}
        </div>

        <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl bg-cloud p-4">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-4 w-4 accent-brand-500" />
          <span className="text-[13px] leading-relaxed text-ink-600">
            I understand this is a timed simulation, my answers are auto-saved locally, and AI-estimated scores are indicative — not official IELTS results.
          </span>
        </label>

        <div className="mt-6 flex items-center justify-between">
          <Btn variant="ghost" onClick={() => navigate(-1)}>Back</Btn>
          <Btn size="lg" disabled={!agreed} onClick={() => navigate(`/test/${t.id}`)}>
            <PlayCircle size={16} /> Begin Test
          </Btn>
        </div>
        <p className="mt-4 flex items-center gap-2 text-[12px] text-ink-400">
          <AlertTriangle size={13} className="text-[#9A6700]" /> The exam interface opens in a focused, distraction-free mode.
        </p>
      </Card>
    </div>
  );
}

/* ================= HISTORY ================= */
export function HistoryPage() {
  const { attempts } = useMock();
  const [filter, setFilter] = useState("All");
  const list = attempts.filter((a) => filter === "All" || (filter === "Full mocks" ? a.testTitle.includes("Mock") : a.testTitle.includes(filter.replace(/s$/, ""))));
  return (
    <div className="mx-auto max-w-5xl animate-fade-up">
      <h1 className="font-display text-[28px] font-bold tracking-tight text-ink">Test history</h1>
      <div className="mt-5 flex flex-wrap gap-2">
        {["All", "Full mocks", "Reading", "Listening", "Writing"].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn("h-9 rounded-full border px-4 text-[13px] font-medium transition", filter === f ? "border-ink bg-ink text-white" : "border-line bg-white text-ink-500 hover:border-ink-400")}>
            {f}
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <div className="mt-6"><EmptyState icon={<FileText size={20} />} title="You haven't completed a mock test yet" body="Your results will appear here after your first test." action={<BtnLink to="/app/tests"><BookOpen size={15} /> Browse tests</BtnLink>} /></div>
      ) : (
        <Card className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-line bg-cloud text-[11px] uppercase tracking-wide text-ink-400">
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Test</th>
                <th className="px-5 py-3 font-medium">Overall</th>
                <th className="px-5 py-3 font-medium">L</th>
                <th className="px-5 py-3 font-medium">R</th>
                <th className="px-5 py-3 font-medium">W</th>
                <th className="px-5 py-3 font-medium">S</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {list.map((a) => (
                <tr key={a.id} className="border-b border-line last:border-0 hover:bg-cloud/60">
                  <td className="px-5 py-3.5 text-ink-500">{a.date}</td>
                  <td className="px-5 py-3.5 font-semibold text-ink">{a.testTitle}</td>
                  <td className="px-5 py-3.5"><BandChip value={a.overall} size="sm" /></td>
                  {[a.listening, a.reading, a.writing, a.speaking].map((v, i) => (
                    <td key={i} className="px-5 py-3.5 tabular-nums text-ink-500">{v ? v.toFixed(1) : "—"}</td>
                  ))}
                  <td className="px-5 py-3.5">
                    <Badge tone={a.status === "Scored" ? "green" : a.status === "AI estimated" ? "brand" : "amber"}>
                      {a.status === "AI estimated" && <Sparkles size={10} />} {a.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <BtnLink to={`/app/results/${a.id}`} variant="outline" size="sm">View Results</BtnLink>
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

/* ================= ANALYTICS ================= */
export function AnalyticsPage() {
  const { attempts } = useMock();
  const avg = attempts.length ? attempts.reduce((s, a) => s + a.overall, 0) / attempts.length : 0;
  const best = attempts.length ? Math.max(...attempts.map((a) => a.overall)) : 0;
  const recent = attempts[0]?.overall ?? 0;
  return (
    <div className="mx-auto max-w-5xl animate-fade-up">
      <h1 className="font-display text-[28px] font-bold tracking-tight text-ink">Performance analytics</h1>
      <p className="mt-1.5 text-sm text-ink-500">What you're good at, what needs work, and whether you're improving.</p>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Average band", value: avg.toFixed(1) },
          { label: "Best band", value: best.toFixed(1) },
          { label: "Most recent", value: recent.toFixed(1) },
          { label: "Tests completed", value: String(attempts.length) },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <p className="text-[11px] font-medium uppercase tracking-wide text-ink-400">{s.label}</p>
            <p className="mt-1 font-display text-2xl font-bold text-ink">{s.value}</p>
          </Card>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-[15px] font-semibold text-ink">Band progression</h2>
            <Badge tone="green"><TrendingUp size={11} /> Improving</Badge>
          </div>
          <div className="mt-4"><BandTrendChart data={BAND_TREND} height={190} /></div>
        </Card>
        <Card className="p-6">
          <h2 className="font-display text-[15px] font-semibold text-ink">Skill breakdown</h2>
          <p className="mt-1 text-xs text-ink-400">Latest full mock · marker shows your 7.5 target</p>
          <div className="mt-5 space-y-4">
            <SkillBar label="Listening" value={7.5} />
            <SkillBar label="Reading" value={7.0} />
            <SkillBar label="Writing" value={6.5} />
            <SkillBar label="Speaking" value={7.0} />
          </div>
          <div className="mt-5 rounded-xl bg-cloud p-4 text-[13px] leading-relaxed text-ink-600">
            <span className="font-semibold text-ink">Where to focus:</span> Writing is your lowest skill. Two Task 2 sprints per week with AI feedback typically moves this band fastest.
          </div>
        </Card>
      </div>

      <Card className="mt-4 p-6">
        <h2 className="font-display text-[15px] font-semibold text-ink">Question accuracy by type</h2>
        <div className="mt-4 space-y-3.5">
          {[
            ["True / False / Not Given", 78],
            ["Multiple Choice", 71],
            ["Matching Headings", 64],
            ["Sentence Completion", 58],
            ["Map / Diagram Labeling", 46],
          ].map(([label, pct]) => (
            <div key={label as string}>
              <div className="mb-1 flex justify-between text-[13px]">
                <span className="font-medium text-ink">{label}</span>
                <span className="tabular-nums text-ink-500">{pct}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-mist">
                <div className={cn("h-full rounded-full", (pct as number) >= 70 ? "bg-[#1FAD55]" : (pct as number) >= 55 ? "bg-brand-500" : "bg-[#F5A623]")} style={{ width: `${pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export { Avatar };
