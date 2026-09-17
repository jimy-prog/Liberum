import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  ArrowRight, BarChart3, BookOpen, Check, CheckCircle2, ChevronLeft, ChevronRight,
  ClipboardList, Eye, FilePlus2, FileUp, Library, Plus, Search, Send, Sparkles, Trash2, Users, Loader2,
} from "lucide-react";
import { TEACHER_LIBRARY, TEACHER_RESULTS, TEACHER_STUDENTS, type QuestionType } from "../data";
import { useMock } from "../store";
import { BandChip } from "../components";
import { Avatar, Badge, Btn, BtnLink, Card, EmptyState, Field, Input } from "@/components/ui-kit";
import { cn } from "@/lib/utils";

/* ================= TEACHER DASHBOARD ================= */
export function TeacherDashboard() {
  const { user } = useMock();
  const [statsData, setStatsData] = useState<{ active_students: number; tests_assigned: number; completed_attempts: number; average_band: number } | null>(null);

  useEffect(() => {
    fetch("/api/mock/teacher/dashboard")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.stats) setStatsData(data.stats);
      })
      .catch(() => {});
  }, []);

  const stats = [
    { label: "Active students", value: String(statsData?.active_students ?? "6"), icon: Users, sub: "registered students" },
    { label: "Tests assigned", value: String(statsData?.tests_assigned ?? "36"), icon: ClipboardList, sub: "8 due this week" },
    { label: "Completed attempts", value: String(statsData?.completed_attempts ?? "24"), icon: CheckCircle2, sub: "total completions" },
    { label: "Average band", value: String(statsData?.average_band ?? "6.6"), icon: BarChart3, sub: "across all students" },
  ];
  return (
    <div className="mx-auto max-w-6xl animate-fade-up">
      <p className="text-[13px] text-ink-400">Saturday · Aug 22</p>
      <h1 className="mt-1 font-display text-[30px] font-bold tracking-tight text-ink">Good afternoon, {user?.name.split(" ")[0]}</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-medium text-ink-500">{s.label}</p>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><s.icon size={16} /></span>
            </div>
            <p className="mt-2 font-display text-[32px] font-bold leading-none tracking-tight text-ink">{s.value}</p>
            <p className="mt-1.5 text-xs text-ink-400">{s.sub}</p>
          </Card>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        {/* Recent results */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-ink">Recent student results</h2>
            <BtnLink to="/app/results" variant="ghost" size="sm">All results <ArrowRight size={13} /></BtnLink>
          </div>
          <div className="mt-4 divide-y divide-line">
            {TEACHER_RESULTS.slice(0, 4).map((r, i) => (
              <div key={i} className="flex items-center gap-3 py-3">
                <Avatar initials={r.student.split(" ").map((w) => w[0]).join("")} color="#7B61FF" size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{r.student}</p>
                  <p className="truncate text-xs text-ink-400">{r.test} · {r.date}</p>
                </div>
                {r.status === "AI estimated" && <Badge tone="amber">AI estimated</Badge>}
                <BandChip value={r.overall} size="sm" />
              </div>
            ))}
          </div>
        </Card>

        {/* Quick actions */}
        <Card className="flex flex-col bg-gradient-to-br from-brand-500 to-brand-700 p-6 text-white">
          <h2 className="font-display text-lg font-semibold">Quick actions</h2>
          <div className="mt-4 flex-1 space-y-2.5">
            {[
              { to: "/app/create", icon: FilePlus2, label: "Create a new mock", sub: "6-step builder" },
              { to: "/app/assign", icon: Send, label: "Assign a test", sub: "Pick students & deadline" },
              { to: "/app/library", icon: Library, label: "Mock library", sub: "6 tests · 2 drafts" },
            ].map((a) => (
              <Link key={a.label} to={a.to} className="flex items-center gap-3 rounded-xl bg-white/10 p-3.5 ring-1 ring-white/15 transition hover:bg-white/20">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15"><a.icon size={16} /></span>
                <span className="flex-1">
                  <span className="block text-sm font-semibold">{a.label}</span>
                  <span className="block text-[11px] text-white/65">{a.sub}</span>
                </span>
                <ChevronRight size={15} className="text-white/60" />
              </Link>
            ))}
          </div>
          <p className="mt-4 text-[11px] text-white/60">2 drafts are waiting to be published.</p>
        </Card>
      </div>

      {/* Students overview */}
      <Card className="mt-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink">Students</h2>
          <BtnLink to="/app/students" variant="ghost" size="sm">Manage <ArrowRight size={13} /></BtnLink>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {TEACHER_STUDENTS.map((s) => (
            <div key={s.id} className="flex items-center gap-3 rounded-xl border border-line p-3.5 transition hover:border-brand-300 hover:shadow-sm">
              <Avatar initials={s.initials} color={s.color} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{s.name}</p>
                <p className="text-xs text-ink-400">{s.tests} tests · last {s.last}</p>
              </div>
              <div className="text-right">
                <p className="font-display text-lg font-bold tabular-nums text-ink">{s.avg.toFixed(1)}</p>
                <p className="text-[10px] uppercase tracking-wider text-ink-400">avg band</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ================= MOCK LIBRARY ================= */
const libStatusTone: Record<string, "green" | "amber" | "gray"> = { Published: "green", Draft: "amber", Archived: "gray" };

export function MockLibraryPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const rows = TEACHER_LIBRARY.filter(
    (t) => (filter === "All" || t.status === filter) && t.name.toLowerCase().includes(query.toLowerCase())
  );
  return (
    <div className="mx-auto max-w-6xl animate-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-[26px] font-bold tracking-tight text-ink">Mock library</h1>
          <p className="mt-1 text-sm text-ink-500">Your test bank — structured by section, passage and question group.</p>
        </div>
        <BtnLink to="/app/create"><Plus size={15} /> Create mock</BtnLink>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tests…" className="w-64 pl-9" />
        </div>
        <div className="flex gap-1.5">
          {["All", "Published", "Draft", "Archived"].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn("rounded-full px-3.5 py-1.5 text-[13px] font-medium transition",
                filter === f ? "bg-ink text-white" : "bg-white text-ink-500 ring-1 ring-line hover:text-ink")}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <Card className="mt-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-cloud text-[11px] uppercase tracking-wider text-ink-400">
                <th className="px-5 py-3 font-semibold">Test</th>
                <th className="px-5 py-3 font-semibold">Type</th>
                <th className="px-5 py-3 font-semibold">Questions</th>
                <th className="px-5 py-3 font-semibold">Assigned</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Created</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((t) => (
                <tr key={t.id} className="transition hover:bg-cloud/60">
                  <td className="px-5 py-3.5 font-semibold text-ink">{t.name}</td>
                  <td className="px-5 py-3.5 text-ink-500">{t.type}</td>
                  <td className="px-5 py-3.5 tabular-nums text-ink-500">{t.questions}</td>
                  <td className="px-5 py-3.5 tabular-nums text-ink-500">{t.assigned}</td>
                  <td className="px-5 py-3.5"><Badge tone={libStatusTone[t.status]}>{t.status}</Badge></td>
                  <td className="px-5 py-3.5 text-ink-400">{t.created}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-end gap-1">
                      <BtnLink to={`/app/tests/${t.id}`} variant="ghost" size="sm"><Eye size={13} /> Preview</BtnLink>
                      {t.status === "Draft" && <BtnLink to="/app/create" variant="outline" size="sm">Edit</BtnLink>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && <EmptyState icon={<BookOpen size={20} />} title="No tests found" body="Try a different search or filter." />}
      </Card>
    </div>
  );
}

/* ================= CREATE MOCK — 6-step wizard ================= */
interface DraftQuestion {
  number: number;
  type: QuestionType;
  text: string;
  options: string[];
  correct: string;
  explanation: string;
  points: number;
}

const WIZARD_STEPS = ["Basic info", "Sections", "Questions", "Settings", "Preview", "Publish"];
const Q_TYPES: { id: QuestionType; label: string }[] = [
  { id: "mcq", label: "Multiple choice" },
  { id: "tfng", label: "True / False / Not Given" },
  { id: "completion", label: "Sentence completion" },
];

const ALL_SECTIONS = [
  { id: "listening", label: "Listening", desc: "Audio + 40 questions" },
  { id: "reading", label: "Reading", desc: "3 passages · 40 questions" },
  { id: "writing", label: "Writing", desc: "Task 1 + Task 2" },
  { id: "speaking", label: "Speaking", desc: "3 parts, recorded" },
];

export function CreateMockPage() {
  const [creationMode, setCreationMode] = useState<"manual" | "pdf">("manual");
  const [step, setStep] = useState(0);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUploading, setPdfUploading] = useState(false);
  const [pdfStatusMsg, setPdfStatusMsg] = useState("");
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [sections, setSections] = useState<string[]>(["reading"]);
  const [questions, setQuestions] = useState<DraftQuestion[]>([
    { number: 1, type: "mcq", text: "", options: ["", "", "", ""], correct: "A", explanation: "", points: 1 },
  ]);
  const [timeLimit, setTimeLimit] = useState("60");
  const [shuffle, setShuffle] = useState(false);
  const [showKey, setShowKey] = useState(true);
  const [published, setPublished] = useState(false);

  const updateQ = (i: number, patch: Partial<DraftQuestion>) =>
    setQuestions((qs) => qs.map((q, j) => (j === i ? { ...q, ...patch } : q)));
  const addQuestion = () =>
    setQuestions((qs) => [
      ...qs,
      { number: qs.length + 1, type: "mcq", text: "", options: ["", "", "", ""], correct: "A", explanation: "", points: 1 },
    ]);
  const removeQuestion = (i: number) =>
    setQuestions((qs) => qs.filter((_, j) => j !== i).map((q, j) => ({ ...q, number: j + 1 })));

  const canNext = step === 0 ? title.trim().length > 2 : step === 1 ? sections.length > 0 : true;

  if (published) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center py-16 text-center animate-fade-up">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E9F9EF] text-[#1FAD55]"><Check size={30} /></span>
        <h1 className="mt-5 font-display text-2xl font-bold text-ink">“{title}” is published</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-500">
          The mock is now in your library and ready to assign. Students see it the moment you assign it.
        </p>
        <div className="mt-6 flex gap-2.5">
          <BtnLink to="/app/assign"><Send size={14} /> Assign now</BtnLink>
          <BtnLink to="/app/library" variant="outline">Back to library</BtnLink>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl animate-fade-up">
      <h1 className="font-display text-[26px] font-bold tracking-tight text-ink">Create a mock</h1>
      <p className="mt-1 text-sm text-ink-500">Structured content: test → sections → question groups → questions.</p>

      {/* stepper */}
      <div className="mt-6 flex items-center gap-1.5">
        {WIZARD_STEPS.map((s, i) => (
          <div key={s} className="flex flex-1 flex-col gap-1.5">
            <div className={cn("h-1.5 rounded-full transition-colors", i <= step ? "bg-brand-500" : "bg-mist")} />
            <span className={cn("hidden text-[10.5px] font-medium sm:block", i === step ? "text-brand-600" : "text-ink-400")}>{s}</span>
          </div>
        ))}
      </div>

      <Card className="mt-5 p-6 sm:p-7">
        {/* STEP 0 — basic info */}
        {step === 0 && (
          <div className="space-y-5">
            <div className="flex gap-2 p-1 bg-cloud rounded-xl border border-line">
              <button
                type="button"
                onClick={() => setCreationMode("manual")}
                className={cn("flex-1 py-2 rounded-lg text-[13px] font-semibold transition",
                  creationMode === "manual" ? "bg-white text-ink shadow-xs" : "text-ink-500 hover:text-ink")}
              >
                Manual Step-by-Step Builder
              </button>
              <button
                type="button"
                onClick={() => setCreationMode("pdf")}
                className={cn("flex-1 py-2 rounded-lg text-[13px] font-semibold transition flex items-center justify-center gap-1.5",
                  creationMode === "pdf" ? "bg-white text-ink shadow-xs" : "text-ink-500 hover:text-ink")}
              >
                <Sparkles size={14} className="text-brand-600" /> AI PDF Ingestion (Cambridge)
              </button>
            </div>

            {creationMode === "pdf" && (
              <div className="rounded-2xl border-2 border-dashed border-brand-200 bg-brand-50/30 p-6 text-center">
                <FileUp size={32} className="mx-auto text-brand-600" />
                <h3 className="mt-3 font-display text-sm font-bold text-ink">Upload Official Cambridge or IELTS Exam PDF</h3>
                <p className="mt-1 text-xs text-ink-500 max-w-sm mx-auto">
                  Our pipeline automatically parses passages, question numbers, prompts, and answer keys.
                </p>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setPdfFile(e.target.files[0]);
                      if (!title) {
                        setTitle(e.target.files[0].name.replace(/\.pdf$/i, "").replace(/[-_]/g, " "));
                      }
                    }
                  }}
                  className="mt-4 text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-brand-600 file:text-white hover:file:bg-brand-700 cursor-pointer"
                />
                {pdfFile && (
                  <p className="mt-2 text-xs font-semibold text-[#157A3E]">
                    ✓ Selected: {pdfFile.name} ({(pdfFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </p>
                )}
                {pdfUploading && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-xs font-medium text-brand-700">
                    <Loader2 size={14} className="animate-spin" />
                    <span>{pdfStatusMsg || "AI is extracting sections, passages and questions..."}</span>
                  </div>
                )}
              </div>
            )}
            <Field label="Test title">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. IELTS Academic Mock 03" />
            </Field>
            <Field label="Difficulty">
              <div className="flex gap-2">
                {["Intermediate", "Upper-Intermediate", "Advanced"].map((d) => (
                  <button key={d} onClick={() => setDifficulty(d)}
                    className={cn("rounded-full px-4 py-2 text-[13px] font-medium transition",
                      difficulty === d ? "bg-ink text-white" : "bg-white text-ink-500 ring-1 ring-line hover:text-ink")}>
                    {d}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Description" hint="Shown to students on the test info page.">
              <textarea rows={3} placeholder="A full Academic mock mirroring real exam timing…"
                className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
            </Field>
          </div>
        )}

        {/* STEP 1 — sections */}
        {step === 1 && (
          <div>
            <p className="text-sm font-semibold text-ink">Which sections does this mock include?</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {ALL_SECTIONS.map((s) => {
                const on = sections.includes(s.id);
                return (
                  <button key={s.id}
                    onClick={() => setSections((p) => (on ? p.filter((x) => x !== s.id) : [...p, s.id]))}
                    className={cn("flex items-center gap-3 rounded-xl border p-4 text-left transition",
                      on ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500" : "border-line bg-white hover:border-ink-300")}>
                    <span className={cn("flex h-5 w-5 items-center justify-center rounded-md border transition",
                      on ? "border-brand-500 bg-brand-500 text-white" : "border-ink-300")}>
                      {on && <Check size={12} strokeWidth={3} />}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-ink">{s.label}</span>
                      <span className="block text-xs text-ink-400">{s.desc}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2 — question builder */}
        {step === 2 && (
          <div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-ink">Question builder</p>
              <Badge tone="brand">{questions.length} question{questions.length !== 1 && "s"}</Badge>
            </div>
            <div className="mt-4 space-y-4">
              {questions.map((q, i) => (
                <div key={i} className="rounded-xl border border-line p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-ink font-display text-[11px] font-bold text-white">{q.number}</span>
                    <div className="flex gap-1.5">
                      {Q_TYPES.map((t) => (
                        <button key={t.id} onClick={() => updateQ(i, { type: t.id })}
                          className={cn("rounded-full px-3 py-1 text-[11.5px] font-medium transition",
                            q.type === t.id ? "bg-brand-500 text-white" : "bg-mist text-ink-500 hover:text-ink")}>
                          {t.label}
                        </button>
                      ))}
                    </div>
                    <button onClick={() => removeQuestion(i)} className="ml-auto rounded-lg p-1.5 text-ink-400 transition hover:bg-[#FFEDEC] hover:text-[#C0352C]" title="Remove question">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <Input value={q.text} onChange={(e) => updateQ(i, { text: e.target.value })}
                    placeholder="Question text…" className="mt-3" />
                  {q.type === "mcq" && (
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {q.options.map((opt, oi) => (
                        <div key={oi} className="flex items-center gap-2">
                          <button onClick={() => updateQ(i, { correct: String.fromCharCode(65 + oi) })}
                            title="Mark as correct"
                            className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-display text-xs font-bold transition",
                              q.correct === String.fromCharCode(65 + oi) ? "bg-[#1FAD55] text-white" : "bg-mist text-ink-500 hover:bg-line")}>
                            {String.fromCharCode(65 + oi)}
                          </button>
                          <Input value={opt} onChange={(e) => updateQ(i, { options: q.options.map((o, j) => (j === oi ? e.target.value : o)) })}
                            placeholder={`Option ${String.fromCharCode(65 + oi)}`} />
                        </div>
                      ))}
                    </div>
                  )}
                  {q.type === "tfng" && (
                    <div className="mt-3 flex gap-2">
                      {["True", "False", "Not Given"].map((v) => (
                        <button key={v} onClick={() => updateQ(i, { correct: v })}
                          className={cn("rounded-lg px-3.5 py-2 text-[13px] font-medium transition",
                            q.correct === v ? "bg-[#1FAD55] text-white" : "bg-mist text-ink-500 hover:text-ink")}>
                          {v}
                        </button>
                      ))}
                    </div>
                  )}
                  {q.type === "completion" && (
                    <Input value={q.correct} onChange={(e) => updateQ(i, { correct: e.target.value })}
                      placeholder="Correct answer (key)…" className="mt-3" />
                  )}
                  <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_110px]">
                    <Input value={q.explanation} onChange={(e) => updateQ(i, { explanation: e.target.value })}
                      placeholder="Explanation shown in review (optional)…" />
                    <Input type="number" min={1} value={q.points} onChange={(e) => updateQ(i, { points: Number(e.target.value) })}
                      placeholder="Points" />
                  </div>
                </div>
              ))}
            </div>
            <Btn variant="outline" size="sm" className="mt-4" onClick={addQuestion}><Plus size={14} /> Add question</Btn>
          </div>
        )}

        {/* STEP 3 — settings */}
        {step === 3 && (
          <div className="space-y-5">
            <Field label="Time limit (minutes)">
              <Input type="number" min={5} value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)} className="w-36" />
            </Field>
            {[
              { label: "Shuffle question order", sub: "Each student sees a different order", value: shuffle, set: setShuffle },
              { label: "Show answer key after submission", sub: "Students can review correct answers", value: showKey, set: setShowKey },
            ].map((s) => (
              <button key={s.label} onClick={() => s.set(!s.value)} className="flex w-full items-center justify-between rounded-xl border border-line p-4 text-left transition hover:border-ink-300">
                <span>
                  <span className="block text-sm font-semibold text-ink">{s.label}</span>
                  <span className="block text-xs text-ink-400">{s.sub}</span>
                </span>
                <span className={cn("relative h-6 w-11 rounded-full transition", s.value ? "bg-brand-500" : "bg-line")}>
                  <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", s.value ? "left-[22px]" : "left-0.5")} />
                </span>
              </button>
            ))}
          </div>
        )}

        {/* STEP 4 — preview */}
        {step === 4 && (
          <div>
            <p className="text-sm font-semibold text-ink">Preview</p>
            <div className="mt-4 rounded-xl border border-line bg-cloud p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="brand">{difficulty}</Badge>
                {sections.map((s) => <Badge key={s} tone="outline" className="capitalize">{s}</Badge>)}
              </div>
              <h3 className="mt-3 font-display text-xl font-bold text-ink">{title || "Untitled mock"}</h3>
              <p className="mt-1 text-[13px] text-ink-500">
                {questions.length} questions · {timeLimit} min · {shuffle ? "shuffled order" : "fixed order"} · key {showKey ? "shown" : "hidden"} after submission
              </p>
              <div className="mt-4 divide-y divide-line rounded-xl border border-line bg-white">
                {questions.slice(0, 4).map((q) => (
                  <div key={q.number} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-mist font-display text-[10px] font-bold text-ink-500">{q.number}</span>
                    <span className="flex-1 truncate text-ink">{q.text || <span className="text-ink-300">Question text…</span>}</span>
                    <Badge tone="gray">{Q_TYPES.find((t) => t.id === q.type)?.label}</Badge>
                  </div>
                ))}
                {questions.length > 4 && <p className="px-4 py-2.5 text-xs text-ink-400">+ {questions.length - 4} more questions</p>}
              </div>
            </div>
          </div>
        )}

        {/* STEP 5 — publish */}
        {step === 5 && (
          <div className="text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600"><Send size={22} /></span>
            <h3 className="mt-4 font-display text-xl font-bold text-ink">Ready to publish?</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-500">
              “{title}” will appear in your library as <span className="font-semibold text-ink">Published</span>. You can still edit it later — assigned students keep their version.
            </p>
          </div>
        )}

        {/* nav */}
        <div className="mt-7 flex items-center justify-between border-t border-line pt-5">
          <Btn variant="ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}><ChevronLeft size={15} /> Back</Btn>
          {step < WIZARD_STEPS.length - 1 ? (
            <Btn disabled={!canNext} onClick={() => setStep((s) => s + 1)}>Continue <ChevronRight size={15} /></Btn>
          ) : (
            <Btn onClick={async () => {
              try {
                if (creationMode === "pdf" && pdfFile) {
                  setPdfUploading(true);
                  setPdfStatusMsg("Uploading and processing exam PDF with AI pipeline...");
                  const formData = new FormData();
                  formData.append("title", title || pdfFile.name.replace(/\.pdf$/i, ""));
                  formData.append("test_scope", "Reading Section");
                  formData.append("pdf_file", pdfFile);
                  
                  const res = await fetch("/api/mock/teacher/exams/import-pdf", {
                    method: "POST",
                    body: formData,
                  });
                  if (res.ok) {
                    setPublished(true);
                  }
                } else {
                  await fetch("/api/mock/teacher/exams/create", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      title,
                      difficulty,
                      sections,
                      time_limit_minutes: Number(timeLimit) || 60,
                      questions: questions.map((q) => ({
                        number: q.number,
                        type: q.type,
                        text: q.text,
                        options: q.options,
                        correct: q.correct,
                        points: q.points,
                      })),
                    }),
                  });
                  setPublished(true);
                }
              } catch (e) {
                console.warn("Could not sync mock creation:", e);
                setPublished(true);
              } finally {
                setPdfUploading(false);
              }
            }}><Check size={15} /> Publish mock</Btn>
          )}
        </div>
      </Card>
    </div>
  );
}

/* ================= ASSIGN TEST ================= */
export function AssignPage() {
  const [test, setTest] = useState("m2");
  const [picked, setPicked] = useState<string[]>([]);
  const [due, setDue] = useState("2026-08-29");
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center py-16 text-center animate-fade-up">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E9F9EF] text-[#1FAD55]"><Check size={30} /></span>
        <h1 className="mt-5 font-display text-2xl font-bold text-ink">Assigned to {picked.length} student{picked.length !== 1 && "s"}</h1>
        <p className="mt-2 text-sm text-ink-500">They'll see it on their dashboard with the deadline you set.</p>
        <BtnLink to="/app" className="mt-6" variant="outline">Back to dashboard</BtnLink>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl animate-fade-up">
      <h1 className="font-display text-[26px] font-bold tracking-tight text-ink">Assign a test</h1>
      <p className="mt-1 text-sm text-ink-500">Pick a mock, choose students, set a deadline.</p>

      <Card className="mt-5 space-y-6 p-6 sm:p-7">
        <Field label="Test">
          <div className="grid gap-2 sm:grid-cols-2">
            {TEACHER_LIBRARY.filter((t) => t.status === "Published").map((t) => (
              <button key={t.id} onClick={() => setTest(t.id)}
                className={cn("rounded-xl border p-3.5 text-left transition",
                  test === t.id ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500" : "border-line hover:border-ink-300")}>
                <p className="text-sm font-semibold text-ink">{t.name}</p>
                <p className="mt-0.5 text-xs text-ink-400">{t.type} · {t.questions} questions</p>
              </button>
            ))}
          </div>
        </Field>

        <Field label={`Students (${picked.length} selected)`}>
          <div className="grid gap-2 sm:grid-cols-2">
            {TEACHER_STUDENTS.map((s) => {
              const on = picked.includes(s.id);
              return (
                <button key={s.id} onClick={() => setPicked((p) => (on ? p.filter((x) => x !== s.id) : [...p, s.id]))}
                  className={cn("flex items-center gap-3 rounded-xl border p-3 text-left transition",
                    on ? "border-brand-500 bg-brand-50" : "border-line hover:border-ink-300")}>
                  <Avatar initials={s.initials} color={s.color} size="sm" />
                  <span className="flex-1 text-sm font-medium text-ink">{s.name}</span>
                  <span className={cn("flex h-5 w-5 items-center justify-center rounded-md border transition",
                    on ? "border-brand-500 bg-brand-500 text-white" : "border-ink-300")}>
                    {on && <Check size={12} strokeWidth={3} />}
                  </span>
                </button>
              );
            })}
          </div>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Deadline">
            <Input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
          </Field>
          <Field label="Note (optional)">
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Focus on timing…" />
          </Field>
        </div>

        <div className="flex justify-end border-t border-line pt-5">
          <Btn disabled={picked.length === 0} onClick={() => setSent(true)}><Send size={14} /> Assign test</Btn>
        </div>
      </Card>
    </div>
  );
}

/* ================= STUDENTS ================= */
export function StudentsPage() {
  const [query, setQuery] = useState("");
  const [studentList, setStudentList] = useState(TEACHER_STUDENTS);

  useEffect(() => {
    fetch("/api/mock/teacher/students")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.students && data.students.length > 0) {
          setStudentList(data.students);
        }
      })
      .catch(() => {});
  }, []);

  const rows = studentList.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="mx-auto max-w-5xl animate-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-[26px] font-bold tracking-tight text-ink">Students</h1>
          <p className="mt-1 text-sm text-ink-500">{TEACHER_STUDENTS.length} active students in your group.</p>
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search students…" className="w-60 pl-9" />
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {rows.map((s) => (
          <Card key={s.id} className="flex items-center gap-4 p-5">
            <Avatar initials={s.initials} color={s.color} size="lg" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-[15px] font-semibold text-ink">{s.name}</p>
              <p className="text-xs text-ink-400">{s.tests} tests taken · last active {s.last}</p>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1.5 w-28 overflow-hidden rounded-full bg-mist">
                  <div className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600" style={{ width: `${((s.avg - 4) / 5) * 100}%` }} />
                </div>
                <span className="text-xs tabular-nums text-ink-500">avg {s.avg.toFixed(1)}</span>
              </div>
            </div>
            <BtnLink to="/app/results" variant="outline" size="sm">Results</BtnLink>
          </Card>
        ))}
      </div>
      {rows.length === 0 && <div className="mt-5"><EmptyState icon={<Users size={20} />} title="No students found" body="Try a different search." /></div>}
    </div>
  );
}

/* ================= RESULTS (teacher) ================= */
interface TeacherResultItem {
  id?: number | string;
  student: string;
  test: string;
  date: string;
  overall: number;
  l: number;
  r: number;
  w: number;
  s: number;
  status: string;
}

export function TeacherResultsPage() {
  const [resultsList, setResultsList] = useState<TeacherResultItem[]>(TEACHER_RESULTS);
  const [selected, setSelected] = useState<number | null>(null);
  const [teacherFeedback, setTeacherFeedback] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);

  useEffect(() => {
    fetch("/api/mock/teacher/results")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.results && data.results.length > 0) {
          setResultsList(data.results);
        }
      })
      .catch(() => {});
  }, []);

  const r = selected !== null ? resultsList[selected] : null;

  const bands = useMemo(
    () => (r ? [
      { label: "Listening", value: r.l },
      { label: "Reading", value: r.r },
      { label: "Writing", value: r.w },
      { label: "Speaking", value: r.s },
    ].filter((b) => b.value > 0) : []),
    [r]
  );

  if (r) {
    return (
      <div className="mx-auto max-w-3xl animate-fade-up">
        <Btn variant="ghost" size="sm" onClick={() => setSelected(null)}><ChevronLeft size={14} /> All results</Btn>
        <Card className="mt-4 overflow-hidden">
          <div className="bg-gradient-to-br from-brand-500 to-[#5A41D8] p-6 text-white sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Avatar initials={r.student.split(" ").map((w) => w[0]).join("")} color="#7B61FF" size="lg" className="ring-2 ring-white/40" />
                <div>
                  <p className="font-display text-lg font-bold">{r.student}</p>
                  <p className="text-[13px] text-white/70">{r.test} · {r.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70">Overall</p>
                <p className="font-display text-5xl font-bold leading-none">{r.overall.toFixed(1)}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-5 p-6">
            {bands.map((b) => (
              <div key={b.label} className="flex items-center gap-2.5">
                <BandChip value={b.value} />
                <span className="text-[13px] text-ink-500">{b.label}</span>
              </div>
            ))}
            {r.status === "AI estimated" && <Badge tone="amber" className="ml-auto">AI estimated — review recommended</Badge>}
          </div>
        </Card>

        <Card className="mt-4 p-6">
          <h2 className="font-display text-lg font-semibold text-ink">Teacher evaluation & feedback</h2>
          <textarea
            rows={4}
            value={teacherFeedback}
            onChange={(e) => setTeacherFeedback(e.target.value)}
            placeholder="Write constructive band feedback for the student…"
            className="mt-3 w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
          <div className="mt-3 flex items-center justify-between">
            <p className="text-[11px] text-ink-400">
              {feedbackSent ? "✓ Feedback successfully submitted and visible to student." : "Feedback is recorded and shared with the student immediately."}
            </p>
            <Btn
              size="sm"
              disabled={!teacherFeedback.trim() || feedbackSent}
              onClick={async () => {
                if (!r) return;
                try {
                  const res = await fetch(`/api/mock/teacher/results/${r.id ?? selected ?? 1}/feedback`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      overall: r.overall,
                      writing: r.w,
                      speaking: r.s,
                      feedback: teacherFeedback,
                    }),
                  });
                  if (res.ok) {
                    setFeedbackSent(true);
                  }
                } catch (e) {
                  console.warn("Could not submit feedback:", e);
                }
              }}
            >
              <Send size={13} /> {feedbackSent ? "Sent" : "Send feedback"}
            </Btn>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl animate-fade-up">
      <h1 className="font-display text-[26px] font-bold tracking-tight text-ink">Student results</h1>
      <p className="mt-1 text-sm text-ink-500">Latest attempts across your group.</p>
      <Card className="mt-5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-cloud text-[11px] uppercase tracking-wider text-ink-400">
                <th className="px-5 py-3 font-semibold">Student</th>
                <th className="px-5 py-3 font-semibold">Test</th>
                <th className="px-5 py-3 font-semibold">Date</th>
                <th className="px-5 py-3 text-center font-semibold">L</th>
                <th className="px-5 py-3 text-center font-semibold">R</th>
                <th className="px-5 py-3 text-center font-semibold">W</th>
                <th className="px-5 py-3 text-center font-semibold">S</th>
                <th className="px-5 py-3 font-semibold">Overall</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {resultsList.map((row, i) => (
                <tr key={i} onClick={() => setSelected(i)} className="cursor-pointer transition hover:bg-cloud/60">
                  <td className="px-5 py-3.5 font-semibold text-ink">{row.student}</td>
                  <td className="px-5 py-3.5 text-ink-500">{row.test}</td>
                  <td className="px-5 py-3.5 text-ink-400">{row.date}</td>
                  {[row.l, row.r, row.w, row.s].map((v, j) => (
                    <td key={j} className="px-5 py-3.5 text-center tabular-nums text-ink-500">{v > 0 ? v.toFixed(1) : "—"}</td>
                  ))}
                  <td className="px-5 py-3.5"><BandChip value={row.overall} size="sm" /></td>
                  <td className="px-5 py-3.5">
                    <Badge tone={row.status === "Scored" ? "green" : "amber"}>{row.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
