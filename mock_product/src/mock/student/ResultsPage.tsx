import { useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import {
  ArrowLeft, ArrowRight, CheckCircle2, ChevronDown, Info, Sparkles, XCircle,
} from "lucide-react";
import { EXAM_SECTIONS, type Question } from "../data";
import { useMock } from "../store";
import { BandChip, BandTrendChart, SkillBar } from "../components";
import { Badge, BtnLink, Card } from "@/components/ui-kit";
import { cn } from "@/lib/utils";
import { BAND_TREND } from "../data";

const REVIEW_SECTIONS = EXAM_SECTIONS.filter((s) => s.groups.length > 0);

function ReviewRow({ q, answer }: { q: Question; answer?: string }) {
  const hasAnswer = answer !== undefined;
  const correct =
    hasAnswer &&
    (answer.trim().toLowerCase() === q.correct.toLowerCase() ||
      (q.type !== "completion" && answer === q.correct));
  return (
    <div className="flex gap-3 border-b border-line py-4 last:border-0">
      <span
        className={cn(
          "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md font-display text-[11px] font-bold",
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
              Your answer: {answer || "—"}
            </span>
          )}
          {!correct && (
            <span className="text-ink-600">
              Correct answer: <span className="font-semibold text-ink">{q.correct}</span>
            </span>
          )}
        </div>
        {q.explanation && <p className="mt-1.5 text-xs leading-relaxed text-ink-400">{q.explanation}</p>}
      </div>
    </div>
  );
}

export default function ResultsPage() {
  const { attemptId } = useParams();
  const { attempts } = useMock();
  const attempt = attempts.find((a) => a.id === attemptId) ?? attempts[0];
  const [openSection, setOpenSection] = useState<string | null>("reading");

  const storedAnswers = useMemo<Record<string, string> | null>(() => {
    try {
      const raw = localStorage.getItem("mock-review-" + attempt.id);
      return raw ? (JSON.parse(raw) as Record<string, string>) : null;
    } catch {
      return null;
    }
  }, [attempt.id]);

  const skills = [
    { label: "Listening", value: attempt.listening },
    { label: "Reading", value: attempt.reading },
    { label: "Writing", value: attempt.writing },
    { label: "Speaking", value: attempt.speaking },
  ].filter((s) => s.value > 0);

  return (
    <div className="mx-auto max-w-4xl animate-fade-up">
      <BtnLink to="/app/history" variant="ghost" size="sm"><ArrowLeft size={14} /> Back to history</BtnLink>

      {/* ------- Header: overall band ------- */}
      <Card className="mt-4 overflow-hidden">
        <div className="bg-gradient-to-br from-brand-500 via-brand-600 to-[#5A41D8] p-6 text-white sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="font-display text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70">Overall band score</p>
              <p className="mt-1 font-display text-[64px] font-bold leading-none tracking-tight">{attempt.overall.toFixed(1)}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {attempt.status === "AI estimated" ? (
                  <Badge className="bg-white/15 text-white ring-white/25"><Sparkles size={11} /> Includes AI estimated scores</Badge>
                ) : (
                  <Badge className="bg-white/15 text-white ring-white/25"><CheckCircle2 size={11} /> Scored</Badge>
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

      {attempt.status === "AI estimated" && (
        <div className="mt-4 flex gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-4 text-[13px] leading-relaxed text-ink-600">
          <Info size={16} className="mt-0.5 shrink-0 text-brand-600" />
          <p>
            Listening and Reading are scored from the answer key. Writing and Speaking show an{" "}
            <span className="font-semibold text-ink">AI estimated score</span> — indicative only, not an official IELTS result.
            A Liberum teacher can review and confirm these bands.
          </p>
        </div>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {/* ------- Skill breakdown ------- */}
        <Card className="p-6">
          <h2 className="font-display text-lg font-semibold text-ink">Skill breakdown</h2>
          <p className="mt-0.5 text-xs text-ink-400">Marker shows your 7.5 target</p>
          <div className="mt-4 space-y-3.5">
            {skills.map((s) => (
              <SkillBar key={s.label} label={s.label} value={s.value} />
            ))}
          </div>
        </Card>

        {/* ------- Progress ------- */}
        <Card className="p-6">
          <h2 className="font-display text-lg font-semibold text-ink">Progress over time</h2>
          <div className="mt-4">
            <BandTrendChart data={BAND_TREND} height={170} />
          </div>
        </Card>
      </div>

      {/* ------- AI feedback ------- */}
      <Card className="mt-4 p-6">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-brand-600"><Sparkles size={15} /></span>
          <h2 className="font-display text-lg font-semibold text-ink">AI feedback</h2>
          <Badge tone="brand">AI estimated score</Badge>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-cloud p-4">
            <p className="text-[13px] font-semibold text-ink">What went well</p>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-500">
              Strong performance on factual True/False/Not Given items — you located evidence quickly and consistently.
            </p>
          </div>
          <div className="rounded-xl bg-cloud p-4">
            <p className="text-[13px] font-semibold text-ink">Focus next</p>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-500">
              Sentence completion answers lost marks on word limits. Practise paraphrasing within “no more than two words”.
            </p>
          </div>
        </div>
        <p className="mt-3 text-[11px] text-ink-400">
          Generated by Liberum AI. Indicative feedback — always confirm with your teacher before booking the real exam.
        </p>
      </Card>

      {/* ------- Question review ------- */}
      <Card className="mt-4 p-6">
        <h2 className="font-display text-lg font-semibold text-ink">Question review</h2>
        <p className="mt-0.5 text-xs text-ink-400">
          {storedAnswers ? "Your answers, the key, and explanations." : "Answer key and explanations for this test."}
        </p>
        <div className="mt-4 space-y-3">
          {REVIEW_SECTIONS.map((sec) => {
            const qs = sec.groups.flatMap((g) => g.questions);
            const correctCount = storedAnswers
              ? qs.filter((q) => {
                  const a = storedAnswers[q.id];
                  return a !== undefined && (a.trim().toLowerCase() === q.correct.toLowerCase() || (q.type !== "completion" && a === q.correct));
                }).length
              : null;
            const open = openSection === sec.id;
            return (
              <div key={sec.id} className="overflow-hidden rounded-xl border border-line">
                <button
                  onClick={() => setOpenSection(open ? null : sec.id)}
                  className="flex w-full items-center gap-3 bg-cloud px-4 py-3 text-left transition hover:bg-mist"
                >
                  <span className="font-display text-sm font-semibold text-ink">{sec.name}</span>
                  {correctCount !== null && (
                    <Badge tone={correctCount / qs.length >= 0.6 ? "green" : "amber"}>{correctCount}/{qs.length} correct</Badge>
                  )}
                  <ChevronDown size={15} className={cn("ml-auto text-ink-400 transition-transform", open && "rotate-180")} />
                </button>
                {open && (
                  <div className="px-4 py-1">
                    {sec.groups.map((g) => (
                      <div key={g.id} className="py-2">
                        <p className="pt-2 text-[11px] font-semibold uppercase tracking-widest text-ink-400">{g.title}</p>
                        {g.questions.map((q) => (
                          <ReviewRow key={q.id} q={q} answer={storedAnswers?.[q.id]} />
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
        <BtnLink to="/app/tests" size="lg">Take the next recommended test <ArrowRight size={15} /></BtnLink>
        <BtnLink to="/app/analytics" variant="outline" size="lg">Open analytics</BtnLink>
      </div>
      <p className="pb-8 text-center text-xs text-ink-400">
        Questions about this result? <Link to="/app/settings" className="font-medium text-brand-600 hover:underline">Contact your teacher</Link>
      </p>
    </div>
  );
}
