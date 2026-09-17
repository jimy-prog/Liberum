import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import {
  ArrowLeft, ArrowRight, CheckCircle2, ChevronDown, Loader2, Sparkles, XCircle,
} from "lucide-react";
import { EXAM_SECTIONS, type Question } from "../data";
import { useMock } from "../store";
import { BandChip, BandTrendChart, SkillBar } from "../components";
import { Badge, BtnLink, Card } from "@/components/ui-kit";
import { cn } from "@/lib/utils";
import { BAND_TREND } from "../data";

interface ReviewItem {
  id: string;
  number: number;
  type: string;
  text: string;
  userAnswer?: string;
  correct: string;
  isCorrect?: boolean;
}

interface ReviewSectionData {
  id: string;
  name: string;
  groups: {
    id: string;
    title: string;
    instruction: string;
    questions: ReviewItem[];
  }[];
}

function ReviewRow({ q }: { q: ReviewItem }) {
  const hasAnswer = q.userAnswer !== undefined && q.userAnswer.trim() !== "";
  const correct = q.isCorrect !== undefined
    ? q.isCorrect
    : hasAnswer &&
      (q.userAnswer!.trim().toLowerCase() === q.correct.toLowerCase() ||
        (q.type !== "completion" && q.userAnswer === q.correct));

  return (
    <div className="flex gap-3 border-b border-line py-4 last:border-0">
      <span
        className={cn(
          "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md font-display text-[11px] font-bold shadow-xs",
          !hasAnswer ? "bg-mist text-ink-500" : correct ? "bg-[#E7F7EE] text-[#1FAD55]" : "bg-[#FFEDEC] text-[#C0352C]"
        )}
      >
        {q.number}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-relaxed text-ink">{q.text.replace("________", "______")}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-[12.5px]">
          {hasAnswer && (
            <span className={cn("flex items-center gap-1.5 font-medium", correct ? "text-[#1FAD55]" : "text-[#C0352C]")}>
              {correct ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
              Your answer: {q.userAnswer || "—"}
            </span>
          )}
          {!correct && (
            <span className="text-ink-600">
              Correct answer: <span className="font-semibold text-ink">{q.correct}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  const { attemptId } = useParams();
  const { attempts } = useMock();
  const localAttempt = attempts.find((a) => a.id === attemptId) ?? attempts[0];

  const [loadingBackend, setLoadingBackend] = useState(false);
  const [backendAttempt, setBackendAttempt] = useState<{
    id: string;
    testTitle: string;
    date: string;
    overall: number;
    listening: number;
    reading: number;
    writing: number;
    speaking: number;
    status: string;
    userAnswers: Record<string, string>;
    reviewSections: ReviewSectionData[];
  } | null>(null);

  const [openSection, setOpenSection] = useState<string | null>(null);

  useEffect(() => {
    // If attemptId looks like backend numeric or a{num}
    const cleanId = attemptId?.replace(/\D/g, "");
    if (cleanId) {
      setLoadingBackend(true);
      fetch(`/api/mock/attempts/${cleanId}/details`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.reviewSections) {
            setBackendAttempt(data);
            if (data.reviewSections.length > 0) {
              setOpenSection(data.reviewSections[0].id);
            }
          }
        })
        .catch(() => {})
        .finally(() => setLoadingBackend(false));
    }
  }, [attemptId]);

  const storedLocalAnswers = useMemo<Record<string, string> | null>(() => {
    if (!localAttempt) return null;
    try {
      const raw = localStorage.getItem("mock-review-" + localAttempt.id);
      return raw ? (JSON.parse(raw) as Record<string, string>) : null;
    } catch {
      return null;
    }
  }, [localAttempt]);

  const attempt = backendAttempt || localAttempt || {
    id: "att-0",
    testTitle: "IELTS Mock Test",
    date: "Today",
    overall: 6.5,
    listening: 6.5,
    reading: 6.5,
    writing: 6.5,
    speaking: 7.0,
    status: "AI estimated",
  };

  const skills = [
    { label: "Listening", value: attempt.listening },
    { label: "Reading", value: attempt.reading },
    { label: "Writing", value: attempt.writing },
    { label: "Speaking", value: attempt.speaking },
  ].filter((s) => s.value > 0);

  // Determine fallback review sections if backend sections not yet loaded
  const displaySections: ReviewSectionData[] = useMemo(() => {
    if (backendAttempt?.reviewSections && backendAttempt.reviewSections.length > 0) {
      return backendAttempt.reviewSections;
    }
    return EXAM_SECTIONS.filter((s) => s.groups.length > 0).map((sec) => ({
      id: sec.id,
      name: sec.name,
      groups: sec.groups.map((g) => ({
        id: g.id,
        title: g.title,
        instruction: g.instruction,
        questions: g.questions.map((q: Question) => ({
          id: q.id,
          number: q.number,
          type: q.type,
          text: q.text,
          userAnswer: storedLocalAnswers?.[q.id],
          correct: q.correct,
        })),
      })),
    }));
  }, [backendAttempt, storedLocalAnswers]);

  useEffect(() => {
    if (!openSection && displaySections.length > 0) {
      setOpenSection(displaySections[0].id);
    }
  }, [displaySections, openSection]);

  return (
    <div className="mx-auto max-w-4xl animate-fade-up">
      <BtnLink to="/app/history" variant="ghost" size="sm"><ArrowLeft size={14} /> Back to history</BtnLink>

      {/* Header: overall band */}
      <Card className="mt-4 overflow-hidden">
        <div className="bg-gradient-to-br from-brand-500 via-brand-600 to-[#5A41D8] p-6 text-white sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="font-display text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70">Overall Band Score</p>
              <p className="mt-1 font-display text-[64px] font-bold leading-none tracking-tight">
                {attempt.overall.toFixed(1)}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {attempt.status === "AI estimated" ? (
                  <Badge className="bg-white/15 text-white ring-white/25"><Sparkles size={11} /> Automated diagnostic score</Badge>
                ) : (
                  <Badge className="bg-white/15 text-white ring-white/25"><CheckCircle2 size={11} /> Authenticated score</Badge>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="font-display text-lg font-semibold leading-snug">{attempt.testTitle}</p>
              <p className="mt-1 text-[13px] text-white/70">{attempt.date}</p>
              <BtnLink to="/app/tests" variant="white" size="sm" className="mt-4">Take another test <ArrowRight size={13} /></BtnLink>
            </div>
          </div>
        </div>

        {/* skill bands */}
        <div className="grid grid-cols-2 divide-line sm:grid-cols-4 sm:divide-x">
          {skills.map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-2 p-5">
              <BandChip value={s.value} size="lg" />
              <p className="text-[12px] font-medium text-ink-500">{s.label}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {/* Skill breakdown */}
        <Card className="p-6">
          <h2 className="font-display text-lg font-semibold text-ink">Skill Breakdown</h2>
          <p className="mt-0.5 text-xs text-ink-400">Target benchmark 7.5</p>
          <div className="mt-4 space-y-3.5">
            {skills.map((s) => (
              <SkillBar key={s.label} label={s.label} value={s.value} />
            ))}
          </div>
        </Card>

        {/* Progress */}
        <Card className="p-6">
          <h2 className="font-display text-lg font-semibold text-ink">Progress Trend</h2>
          <div className="mt-4">
            <BandTrendChart data={BAND_TREND} height={170} />
          </div>
        </Card>
      </div>

      {/* Diagnostic feedback */}
      <Card className="mt-4 p-6">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-brand-600"><Sparkles size={15} /></span>
          <h2 className="font-display text-lg font-semibold text-ink">Diagnostic Feedback</h2>
          <Badge tone="brand">Performance Analysis</Badge>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-cloud p-4">
            <p className="text-[13px] font-semibold text-ink">Strong areas</p>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-500">
              High accuracy on main idea and factual locator questions. Your responses demonstrate solid scanning ability.
            </p>
          </div>
          <div className="rounded-xl bg-cloud p-4">
            <p className="text-[13px] font-semibold text-ink">Recommended focus</p>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-500">
              Pay close attention to grammatical constraints on summary completions (singular/plural, verb forms, and word counts).
            </p>
          </div>
        </div>
      </Card>

      {/* Question review */}
      <Card className="mt-4 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold text-ink">Detailed Question Review</h2>
            <p className="mt-0.5 text-xs text-ink-400">Review your responses alongside the official answer keys.</p>
          </div>
          {loadingBackend && <Loader2 size={16} className="animate-spin text-ink-400" />}
        </div>

        <div className="mt-4 space-y-3">
          {displaySections.map((sec) => {
            const qs = sec.groups.flatMap((g) => g.questions);
            const correctCount = qs.filter((q) => {
              if (q.isCorrect !== undefined) return q.isCorrect;
              const a = q.userAnswer;
              return a !== undefined && a.trim() !== "" && (a.trim().toLowerCase() === q.correct.toLowerCase() || (q.type !== "completion" && a === q.correct));
            }).length;

            const open = openSection === sec.id;
            return (
              <div key={sec.id} className="overflow-hidden rounded-xl border border-line">
                <button
                  onClick={() => setOpenSection(open ? null : sec.id)}
                  className="flex w-full items-center gap-3 bg-cloud px-4 py-3 text-left transition hover:bg-mist"
                >
                  <span className="font-display text-sm font-semibold text-ink capitalize">{sec.name}</span>
                  <Badge tone={correctCount / (qs.length || 1) >= 0.6 ? "green" : "amber"}>
                    {correctCount}/{qs.length} correct
                  </Badge>
                  <ChevronDown size={15} className={cn("ml-auto text-ink-400 transition-transform", open && "rotate-180")} />
                </button>
                {open && (
                  <div className="px-4 py-1">
                    {sec.groups.map((g) => (
                      <div key={g.id} className="py-2">
                        <p className="pt-2 text-[11px] font-semibold uppercase tracking-widest text-ink-400">{g.title}</p>
                        {g.questions.map((q) => (
                          <ReviewRow key={q.id} q={q} />
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <div className="mt-6 flex flex-wrap justify-center gap-3 pb-4">
        <BtnLink to="/app/tests" size="lg">Take another mock test <ArrowRight size={15} /></BtnLink>
        <BtnLink to="/app/analytics" variant="outline" size="lg">View Performance Analytics</BtnLink>
      </div>
    </div>
  );
}
