import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import {
  AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight,
  Flag, HelpCircle, Loader2, Mic, PenLine, Play, Save, Square, X,
} from "lucide-react";
import {
  EXAM_SECTIONS, MOCK_TESTS, SPEAKING_PARTS, WRITING_TASKS,
  roundHalf, scoreToBand,
  type Question, type QuestionGroup,
} from "../data";
import { clearSession, loadSession, saveSession, useMock, type ExamSession } from "../store";
import { Badge, Btn } from "@/components/ui-kit";
import { cn } from "@/lib/utils";

const fmtT = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

/* =================================================================
   Shared question renderer
================================================================= */
function QuestionView({
  q, value, onAnswer,
}: { q: Question; value: string; onAnswer: (v: string) => void }) {
  if (q.type === "completion") {
    const before = q.text.split("________");
    return (
      <div className="text-[15px] leading-[1.9] text-ink">
        <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-md bg-ink font-display text-[11px] font-bold text-white">{q.number}</span>
        {before[0]}
        <input
          value={value}
          onChange={(e) => onAnswer(e.target.value)}
          className="mx-1 inline-block w-44 rounded-md border-b-2 border-ink-300 bg-brand-50/50 px-2 py-0.5 text-center font-medium text-ink outline-none transition focus:border-brand-500 focus:bg-brand-50"
          aria-label={`Answer ${q.number}`}
        />
        {before[1]}
      </div>
    );
  }
  return (
    <div>
      <p className="text-[15px] leading-relaxed text-ink">
        <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-md bg-ink font-display text-[11px] font-bold text-white">{q.number}</span>
        {q.text}
      </p>
      <div className={cn("mt-3 ml-8 space-y-2", q.type === "tfng" && "flex gap-2 space-y-0")}>
        {(q.options ?? []).map((opt, i) => {
          const letter = q.type === "tfng" ? opt : String.fromCharCode(65 + i);
          const label = q.type === "tfng" ? opt : `${letter}. ${opt}`;
          const val = q.type === "tfng" ? opt : letter;
          const active = value === val;
          return (
            <button
              key={opt}
              onClick={() => onAnswer(val)}
              className={cn(
                "block w-full rounded-lg border px-3.5 py-2.5 text-left text-sm transition active:scale-[0.99]",
                q.type === "tfng" && "w-auto flex-1 text-center",
                active ? "border-ink bg-ink text-white" : "border-line bg-white text-ink-600 hover:border-ink-400"
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function GroupView({
  group, answers, onAnswer,
}: { group: QuestionGroup; answers: Record<string, string>; onAnswer: (id: string, v: string) => void }) {
  return (
    <div className="mb-8">
      <div className="mb-4 rounded-lg border-l-[3px] border-ink bg-cloud px-4 py-3">
        <p className="font-display text-[13px] font-semibold text-ink">{group.title}</p>
        <p className="mt-1 text-[13px] italic leading-relaxed text-ink-500">{group.instruction}</p>
      </div>
      <div className="space-y-7">
        {group.questions.map((q) => (
          <div key={q.id} id={`q-${q.number}`} className="scroll-mt-20">
            <QuestionView q={q} value={answers[q.id] ?? ""} onAnswer={(v) => onAnswer(q.id, v)} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* =================================================================
   Question palette
================================================================= */
function Palette({
  questions, answers, flags, current, onJump,
}: {
  questions: Question[];
  answers: Record<string, string>;
  flags: string[];
  current: number;
  onJump: (n: number) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {questions.map((q) => {
        const answered = !!answers[q.id]?.trim();
        const flagged = flags.includes(q.id);
        const isCurrent = q.number === current;
        return (
          <button
            key={q.id}
            onClick={() => onJump(q.number)}
            aria-label={`Question ${q.number}${answered ? ", answered" : ""}${flagged ? ", flagged" : ""}`}
            className={cn(
              "relative flex h-8 w-8 items-center justify-center rounded-md border font-display text-[12px] font-semibold transition",
              isCurrent
                ? "border-ink bg-ink text-white"
                : answered
                  ? "border-brand-300 bg-brand-50 text-brand-700"
                  : "border-line bg-white text-ink-400 hover:border-ink-300"
            )}
          >
            {q.number}
            {flagged && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-[#F5A623] ring-2 ring-white" />}
          </button>
        );
      })}
    </div>
  );
}

/* =================================================================
   Reading section — split screen + highlighting
================================================================= */
function ReadingSection({
  groups, passage, answers, onAnswer, current,
}: {
  groups: QuestionGroup[];
  passage: NonNullable<(typeof EXAM_SECTIONS)[1]["passage"]>;
  answers: Record<string, string>;
  onAnswer: (id: string, v: string) => void;
  current: number;
}) {
  const passageRef = useRef<HTMLDivElement>(null);
  const [mobilePane, setMobilePane] = useState<"passage" | "questions">("passage");

  const highlightSelection = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !passageRef.current) return;
    const range = sel.getRangeAt(0);
    if (!passageRef.current.contains(range.commonAncestorContainer)) return;
    try {
      const mark = document.createElement("mark");
      mark.className = "mock-hl";
      range.surroundContents(mark);
      sel.removeAllRanges();
    } catch {
      /* cross-node selection — skip */
    }
  }, []);

  const removeHighlight = useCallback((e: React.MouseEvent) => {
    const t = e.target as HTMLElement;
    if (t.tagName === "MARK") {
      const parent = t.parentNode;
      while (t.firstChild) parent?.insertBefore(t.firstChild, t);
      parent?.removeChild(t);
      parent?.normalize();
    }
  }, []);

  const passageEl = (
    <div
      ref={passageRef}
      onMouseUp={highlightSelection}
      onClick={removeHighlight}
      className="h-full overflow-y-auto px-6 py-6 lg:px-8"
      style={{ userSelect: "text" }}
    >
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="font-display text-lg font-bold text-ink">{passage.title}</p>
          <p className="mt-0.5 text-xs text-ink-400">{passage.subtitle}</p>
        </div>
        <span className="hidden items-center gap-1.5 rounded-full bg-mist px-3 py-1 text-[11px] font-medium text-ink-500 sm:inline-flex">
          <PenLine size={11} /> Select text to highlight · click a highlight to remove
        </span>
      </div>
      <div className="max-w-none space-y-5">
        {passage.paragraphs.map((p, i) => (
          <p key={i} className="text-[15px] leading-[1.85] text-ink-600">{p}</p>
        ))}
      </div>
    </div>
  );

  const questionsEl = (
    <div className="h-full overflow-y-auto px-6 py-6 lg:px-8">
      {groups.map((g) => (
        <GroupView key={g.id} group={g} answers={answers} onAnswer={onAnswer} />
      ))}
      <div ref={(el) => { if (el) el.dataset.role = "end"; }} />
    </div>
  );

  // scroll to current question when palette used
  useEffect(() => {
    setMobilePane((p) => p); // keep pane
  }, [current]);

  return (
    <div className="flex h-full min-h-0 flex-col lg:flex-row">
      <div className="flex shrink-0 gap-2 border-b border-line bg-white px-4 py-2 lg:hidden">
        {(["passage", "questions"] as const).map((p) => (
          <button key={p} onClick={() => setMobilePane(p)}
            className={cn("h-8 flex-1 rounded-full text-[13px] font-medium capitalize transition",
              mobilePane === p ? "bg-ink text-white" : "bg-mist text-ink-500")}>
            {p}
          </button>
        ))}
      </div>
      <div className={cn("min-h-0 flex-1 border-r border-line bg-white lg:basis-1/2", mobilePane !== "passage" && "hidden lg:block")}>
        {passageEl}
      </div>
      <div className={cn("min-h-0 flex-1 bg-[#FCFCFD] lg:basis-1/2", mobilePane !== "questions" && "hidden lg:block")}>
        {questionsEl}
      </div>
    </div>
  );
}

/* =================================================================
   Listening section — exam-style player + questions
================================================================= */
function ListeningSection({
  groups, answers, onAnswer,
}: { groups: QuestionGroup[]; answers: Record<string, string>; onAnswer: (id: string, v: string) => void }) {
  const [audioState, setAudioState] = useState<"idle" | "error">("idle");
  return (
    <div className="h-full overflow-y-auto bg-[#FCFCFD]">
      <div className="mx-auto max-w-3xl px-6 py-6">
        {/* Exam audio player — deliberately limited controls */}
        <div className="rounded-xl border border-line bg-white p-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setAudioState("error")}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-white transition hover:bg-ink-soft"
              aria-label="Play recording"
            >
              <Play size={17} className="ml-0.5" />
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between text-[11px] font-medium text-ink-400">
                <span>Part 1 recording</span>
                <span className="tabular-nums">--:--</span>
              </div>
              <div className="mt-1.5 flex h-8 items-end gap-[3px]" aria-hidden>
                {Array.from({ length: 48 }).map((_, i) => (
                  <span key={i} className="w-full rounded-sm bg-line" style={{ height: `${20 + Math.abs(Math.sin(i * 0.7)) * 70}%` }} />
                ))}
              </div>
            </div>
          </div>
          {audioState === "error" && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-[#FFF6E5] px-3 py-2 text-[12px] font-medium text-[#9A6700]">
              <AlertTriangle size={13} /> Recording streams from Liberum servers in production. In this demo, answer from the transcript-style questions below.
            </div>
          )}
          <p className="mt-2.5 text-[11px] text-ink-400">The recording plays once. Controls are intentionally limited — as in the real exam.</p>
        </div>
        <div className="mt-6">
          {groups.map((g) => (
            <GroupView key={g.id} group={g} answers={answers} onAnswer={onAnswer} />
          ))}
        </div>
      </div>
    </div>
  );
}

export { Palette, QuestionView, GroupView, ReadingSection, ListeningSection, fmtT };

/* =================================================================
   Writing section — distraction-free editor
================================================================= */
function TaskOneChart() {
  // Simple honest SVG line chart for Task 1 (households owned vs rented)
  const years = ["1918", "1939", "1961", "1981", "2001", "2011"];
  const owned = [23, 32, 42, 58, 69, 64];
  const rented = [77, 68, 58, 42, 31, 36];
  const w = 520, h = 220, pad = { l: 34, r: 12, t: 12, b: 26 };
  const x = (i: number) => pad.l + (i * (w - pad.l - pad.r)) / (years.length - 1);
  const y = (v: number) => pad.t + (1 - v / 100) * (h - pad.t - pad.b);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-4 w-full rounded-lg border border-line bg-white p-2">
      {[0, 25, 50, 75, 100].map((g) => (
        <g key={g}>
          <line x1={pad.l} x2={w - pad.r} y1={y(g)} y2={y(g)} stroke="#E5E5EB" />
          <text x={pad.l - 7} y={y(g) + 3} textAnchor="end" fontSize="9" fill="#8A8E99">{g}%</text>
        </g>
      ))}
      <polyline points={owned.map((v, i) => `${x(i)},${y(v)}`).join(" ")} fill="none" stroke="#7B61FF" strokeWidth="2.5" />
      <polyline points={rented.map((v, i) => `${x(i)},${y(v)}`).join(" ")} fill="none" stroke="#0E0F13" strokeWidth="2.5" strokeDasharray="5 4" />
      {years.map((yr, i) => (
        <text key={yr} x={x(i)} y={h - 8} textAnchor="middle" fontSize="9" fill="#8A8E99">{yr}</text>
      ))}
      <circle cx={w - 150} cy={24} r="4" fill="#7B61FF" /><text x={w - 140} y={28} fontSize="10" fill="#0E0F13">Owned</text>
      <circle cx={w - 90} cy={24} r="4" fill="#0E0F13" /><text x={w - 80} y={28} fontSize="10" fill="#0E0F13">Rented</text>
    </svg>
  );
}

function WritingSection({
  writing, onWrite, savedAt,
}: { writing: Record<string, string>; onWrite: (id: string, v: string) => void; savedAt: string }) {
  const [task, setTask] = useState(0);
  const t = WRITING_TASKS[task];
  const text = writing[t.id] ?? "";
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const enough = words >= t.minWords;
  return (
    <div className="flex h-full min-h-0 flex-col bg-[#FCFCFD]">
      <div className="flex shrink-0 items-center gap-2 border-b border-line bg-white px-4 py-2.5">
        {WRITING_TASKS.map((wt, i) => (
          <button key={wt.id} onClick={() => setTask(i)}
            className={cn("h-8 rounded-full px-4 text-[13px] font-medium transition",
              task === i ? "bg-ink text-white" : "bg-mist text-ink-500 hover:text-ink")}>
            {wt.label} · {wt.minutes} min
          </button>
        ))}
        <span className="ml-auto hidden items-center gap-1.5 text-[11px] text-ink-400 sm:inline-flex">
          <Save size={11} /> All answers saved · {savedAt}
        </span>
      </div>
      <div className="grid min-h-0 flex-1 lg:grid-cols-[1fr_1.15fr]">
        <div className="overflow-y-auto border-r border-line bg-white px-6 py-6">
          <Badge tone="ink">{t.label}</Badge>
          <p className="mt-3 text-[11px] font-semibold uppercase tracking-widest text-ink-400">Write at least {t.minWords} words</p>
          <p className="mt-4 text-[15px] leading-[1.8] text-ink-600">{t.prompt}</p>
          {t.hasChart && <TaskOneChart />}
        </div>
        <div className="flex min-h-[300px] flex-col">
          <textarea
            value={text}
            onChange={(e) => onWrite(t.id, e.target.value)}
            placeholder="Write your answer here…"
            className="min-h-0 flex-1 resize-none bg-[#FCFCFD] px-6 py-6 font-serif text-[16px] leading-[1.9] text-ink outline-none placeholder:text-ink-300"
            aria-label={`${t.label} answer`}
          />
          <div className="flex shrink-0 items-center justify-between border-t border-line bg-white px-6 py-3">
            <span className={cn("font-display text-sm font-semibold tabular-nums", enough ? "text-[#157A3E]" : "text-ink")}>
              Word count: {words} / {t.minWords}
            </span>
            {enough && <Badge tone="green"><CheckCircle2 size={11} /> Minimum reached</Badge>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =================================================================
   Speaking section — real MediaRecorder capture
================================================================= */
function SpeakingSection() {
  const [partIdx, setPartIdx] = useState(0);
  const [phase, setPhase] = useState<"idle" | "prep" | "recording" | "done">("idle");
  const [count, setCount] = useState(0);
  const [level, setLevel] = useState(0);
  const [micState, setMicState] = useState<"off" | "on" | "denied">("off");
  const [playUrl, setPlayUrl] = useState<string | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number>(0);

  const part = SPEAKING_PARTS[partIdx];

  const startMeter = (stream: MediaStream) => {
    const ctx = new AudioContext();
    const src = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    src.connect(analyser);
    analyserRef.current = analyser;
    const data = new Uint8Array(analyser.frequencyBinCount);
    const tick = () => {
      analyser.getByteFrequencyData(data);
      setLevel(Math.min(1, data.reduce((a, b) => a + b, 0) / data.length / 90));
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();
  };

  const enableMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setMicState("on");
      startMeter(stream);
    } catch {
      setMicState("denied");
    }
  };

  useEffect(() => () => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  useEffect(() => {
    if (phase !== "prep" && phase !== "recording") return;
    if (count <= 0) {
      if (phase === "prep") startRecording();
      else stopRecording();
      return;
    }
    const id = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [phase, count]);

  const startPrep = () => {
    if (part.prepSec > 0) {
      setPhase("prep");
      setCount(part.prepSec);
    } else startRecording();
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    const rec = new MediaRecorder(streamRef.current);
    const chunks: Blob[] = [];
    rec.ondataavailable = (e) => chunks.push(e.data);
    rec.onstop = () => setPlayUrl(URL.createObjectURL(new Blob(chunks, { type: "audio/webm" })));
    recRef.current = rec;
    rec.start();
    setPhase("recording");
    setCount(part.speakSec);
  };

  const stopRecording = () => {
    recRef.current?.stop();
    setPhase("done");
  };

  return (
    <div className="h-full overflow-y-auto bg-[#FCFCFD]">
      <div className="mx-auto max-w-2xl px-6 py-8">
        {/* Part tabs */}
        <div className="flex gap-2">
          {SPEAKING_PARTS.map((p, i) => (
            <button key={p.id} onClick={() => { setPartIdx(i); setPhase("idle"); setPlayUrl(null); }}
              className={cn("h-9 flex-1 rounded-full text-[13px] font-medium transition",
                partIdx === i ? "bg-ink text-white" : "bg-white text-ink-500 ring-1 ring-line hover:text-ink")}>
              {p.label}
            </button>
          ))}
        </div>

        <div className="mt-5 rounded-2xl border border-line bg-white p-7 text-center">
          <Badge tone="brand">{part.label} · {part.title}</Badge>
          <p className="mx-auto mt-5 max-w-md whitespace-pre-line text-[15px] leading-[1.85] text-ink-600">{part.prompt}</p>

          {/* mic status */}
          <div className="mt-7 flex items-center justify-center gap-2 text-[13px]">
            <span className={cn("flex h-8 items-center gap-2 rounded-full px-3.5 font-medium",
              micState === "on" ? "bg-[#E9F9EF] text-[#157A3E]" : micState === "denied" ? "bg-[#FFEDEC] text-[#C0352C]" : "bg-mist text-ink-500")}>
              <Mic size={13} />
              {micState === "on" ? "Microphone ready" : micState === "denied" ? "Microphone blocked — check browser permissions" : "Microphone off"}
            </span>
            {micState !== "on" && micState !== "denied" && (
              <Btn size="sm" variant="outline" onClick={enableMic}>Enable microphone</Btn>
            )}
          </div>

          {/* level meter */}
          <div className="mx-auto mt-6 flex h-10 max-w-xs items-end justify-center gap-1" aria-hidden>
            {Array.from({ length: 24 }).map((_, i) => (
              <span key={i} className={cn("w-1.5 rounded-full transition-all duration-75", phase === "recording" ? "bg-brand-500" : "bg-line")}
                style={{ height: `${8 + (phase === "recording" ? Math.max(0, level * 32 * (0.5 + Math.abs(Math.sin(i * 1.3)))) : 0)}px` }} />
            ))}
          </div>

          {/* timers */}
          <div className="mt-6">
            {phase === "prep" && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-400">Preparation</p>
                <p className="mt-1 font-display text-5xl font-bold tabular-nums text-ink">{fmtT(count)}</p>
                <p className="mt-2 text-[13px] text-ink-500">Recording starts automatically</p>
              </div>
            )}
            {phase === "recording" && (
              <div>
                <p className="flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-danger">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-danger" /> Recording — speak now
                </p>
                <p className="mt-1 font-display text-5xl font-bold tabular-nums text-ink">{fmtT(count)}</p>
              </div>
            )}
            {phase === "done" && (
              <div>
                <Badge tone="green"><CheckCircle2 size={11} /> Response recorded</Badge>
                {playUrl && (
                  <audio controls src={playUrl} className="mx-auto mt-4 h-10 w-full max-w-sm" />
                )}
                {partIdx < SPEAKING_PARTS.length - 1 && (
                  <Btn className="mt-4" onClick={() => { setPartIdx((i) => i + 1); setPhase("idle"); setPlayUrl(null); }}>
                    Continue to {SPEAKING_PARTS[partIdx + 1].label} <ChevronRight size={14} />
                  </Btn>
                )}
              </div>
            )}
            {phase === "idle" && (
              <Btn size="lg" disabled={micState !== "on"} onClick={startPrep}>
                {part.prepSec > 0 ? `Start — ${part.prepSec}s prep, then speak` : "Start speaking"}
              </Btn>
            )}
            {phase === "recording" && (
              <Btn variant="danger" className="mt-3" onClick={stopRecording}><Square size={13} /> Stop</Btn>
            )}
          </div>
        </div>
        <p className="mt-4 text-center text-[12px] leading-relaxed text-ink-400">
          Recordings stay in your browser in this demo. In production they are submitted for AI estimated scoring.
        </p>
      </div>
    </div>
  );
}

/* =================================================================
   Review screen
================================================================= */
function ReviewScreen({
  session, allQuestions, onReturn, onSubmit,
}: {
  session: ExamSession;
  allQuestions: Question[];
  onReturn: () => void;
  onSubmit: () => void;
}) {
  const answered = allQuestions.filter((q) => session.answers[q.id]?.trim()).length;
  const flagged = session.flags.length;
  const [confirm, setConfirm] = useState(false);
  return (
    <div className="flex h-full items-center justify-center overflow-y-auto bg-[#FCFCFD] px-6 py-10">
      <div className="w-full max-w-md animate-fade-up rounded-2xl border border-line bg-white p-7">
        <h2 className="font-display text-xl font-bold text-ink">Review your answers</h2>
        <p className="mt-1 text-sm text-ink-500">Check before final submission.</p>
        <div className="mt-5 grid grid-cols-3 gap-2.5 text-center">
          {[
            [answered, "Answered", "text-[#157A3E]"],
            [allQuestions.length - answered, "Unanswered", "text-[#9A6700]"],
            [flagged, "Flagged", "text-brand-600"],
          ].map(([v, l, c]) => (
            <div key={l as string} className="rounded-xl bg-cloud py-3.5">
              <p className={cn("font-display text-2xl font-bold", c as string)}>{v}</p>
              <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-ink-400">{l}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl border border-line p-3.5 text-center">
          <p className="font-display text-sm font-semibold text-ink">{answered} / {allQuestions.length} answered</p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-mist">
            <div className="h-full rounded-full bg-brand-500" style={{ width: `${(answered / allQuestions.length) * 100}%` }} />
          </div>
        </div>
        <div className="mt-6 flex gap-2.5">
          <Btn variant="outline" className="flex-1" onClick={onReturn}>Return to Test</Btn>
          <Btn variant="ink" className="flex-1" onClick={() => setConfirm(true)}>Submit Test</Btn>
        </div>
      </div>

      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm animate-fade-up rounded-2xl bg-white p-6">
            <h3 className="font-display text-lg font-bold text-ink">Submit your test?</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-500">
              {answered} answered · {allQuestions.length - answered} unanswered · {flagged} flagged. You can't change answers after submitting.
            </p>
            <div className="mt-5 flex gap-2.5">
              <Btn variant="outline" className="flex-1" onClick={() => setConfirm(false)}>Continue Test</Btn>
              <Btn className="flex-1" onClick={onSubmit}>Submit Test</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =================================================================
   MAIN EXAM PAGE
================================================================= */
export default function ExamPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, signIn, addAttempt } = useMock();
  const test = MOCK_TESTS.find((t) => t.id === id) ?? MOCK_TESTS[1];
  const sections = EXAM_SECTIONS.filter((s) => test.sections.includes(s.id));

  useEffect(() => {
    if (!user) {
      const demo = searchParams.get("demo");
      if (demo === "student" || demo === "teacher") signIn(demo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const [session, setSession] = useState<ExamSession>(() => {
    const s = loadSession();
    if (s.timeLeft === 0) s.timeLeft = sections[0].durationMin * 60;
    return s;
  });
  const [phase, setPhase] = useState<"exam" | "review" | "processing">("exam");
  const [savedAt, setSavedAt] = useState("—");
  const [exitWarn, setExitWarn] = useState(false);

  const section = sections[Math.min(session.sectionIndex, sections.length - 1)];
  const allQuestions = useMemo(
    () => sections.flatMap((s) => s.groups.flatMap((g) => g.questions)),
    [sections]
  );
  const sectionQuestions = useMemo(() => section.groups.flatMap((g) => g.questions), [section]);

  // persist
  useEffect(() => {
    saveSession(session);
    const now = new Date();
    setSavedAt(`${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`);
  }, [session]);

  // timer
  useEffect(() => {
    if (phase !== "exam") return;
    const id = setInterval(() => {
      setSession((s) => {
        if (s.timeLeft <= 1) {
          if (s.sectionIndex < sections.length - 1) {
            return { ...s, sectionIndex: s.sectionIndex + 1, timeLeft: sections[s.sectionIndex + 1].durationMin * 60 };
          }
          setPhase("review");
          return { ...s, timeLeft: 0 };
        }
        return { ...s, timeLeft: s.timeLeft - 1 };
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase, sections]);

  const onAnswer = (qid: string, v: string) => setSession((s) => ({ ...s, answers: { ...s.answers, [qid]: v } }));
  const onWrite = (tid: string, v: string) => setSession((s) => ({ ...s, writing: { ...s.writing, [tid]: v } }));
  const toggleFlag = (qid: string) =>
    setSession((s) => ({ ...s, flags: s.flags.includes(qid) ? s.flags.filter((f) => f !== qid) : [...s.flags, qid] }));

  const [currentQ, setCurrentQ] = useState(1);
  const jump = (n: number) => {
    setCurrentQ(n);
    document.getElementById(`q-${n}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const submit = async () => {
    setPhase("processing");
    const lQs = sections.find((s) => s.id === "listening")?.groups.flatMap((g) => g.questions) ?? [];
    const rQs = sections.find((s) => s.id === "reading")?.groups.flatMap((g) => g.questions) ?? [];
    const score = (qs: Question[]) =>
      scoreToBand(
        qs.filter((q) => (session.answers[q.id] ?? "").trim().toLowerCase() === q.correct.toLowerCase() || (q.type !== "completion" && session.answers[q.id] === q.correct)).length,
        qs.length
      );
    const listening = lQs.length ? score(lQs) : 0;
    const reading = rQs.length ? score(rQs) : 0;
    const writing = test.sections.includes("writing") ? 6.5 : 0; // AI estimated
    const speaking = test.sections.includes("speaking") ? 7.0 : 0; // AI estimated
    const parts = [listening, reading, writing, speaking].filter((v) => v > 0);
    const overall = roundHalf(parts.reduce((a, b) => a + b, 0) / (parts.length || 1));
    const localId = "att-" + Date.now();

    try {
      // If user is authenticated with backend, record attempt and submission
      const startRes = await fetch("/api/mock/attempts/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test_id: test.id.replace(/\D/g, "") || "1" }),
      });
      if (startRes.ok) {
        const startData = await startRes.json();
        await fetch("/api/mock/attempts/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            attempt_id: startData.attempt_id,
            answers: session.answers,
            writing: session.writing,
          }),
        });
      }
    } catch (e) {
      console.warn("Backend submission failed, saving locally:", e);
    }

    localStorage.setItem("mock-review-" + localId, JSON.stringify(session.answers));
    addAttempt({
      id: localId,
      testTitle: test.title,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      overall, listening, reading, writing, speaking,
      status: writing || speaking ? "AI estimated" : "Scored",
    });
    clearSession();
    navigate(`/app/results/${localId}`);
  };

  const timerState = session.timeLeft <= 300 ? "critical" : session.timeLeft <= 600 ? "warning" : "normal";

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cloud px-6 text-center">
        <div>
          <p className="font-display text-lg font-semibold text-ink">Test sessions require an account</p>
          <p className="mt-1 text-sm text-ink-500">Your attempt must be linked to you.</p>
          <Btn className="mt-5" onClick={() => navigate("/login")}>Log in</Btn>
        </div>
      </div>
    );
  }

  if (phase === "processing") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-ink px-6 text-center text-white">
        <Loader2 size={30} className="animate-spin text-brand-400" />
        <h1 className="mt-6 font-display text-2xl font-bold">Test completed</h1>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/60">
          Your responses are being evaluated. Listening & Reading are scored instantly; Writing & Speaking receive an AI estimated score.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-white">
      {/* ---------- Exam header (testing mode: neutral, focused) ---------- */}
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line bg-white px-4">
        <span className="font-display text-[15px] font-bold text-ink">
          Liber<span className="text-brand-500">um</span>
          <span className="ml-2 rounded-full bg-mist px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-ink-500">Mock</span>
        </span>
        <span className="h-4 w-px bg-line" />
        <span className="font-display text-[13px] font-semibold uppercase tracking-widest text-ink-500">
          {phase === "review" ? "Review" : section.name}
        </span>
        <span className="hidden text-[12px] text-ink-400 sm:block">
          Section {session.sectionIndex + 1} of {sections.length} · {test.title}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <span className="hidden items-center gap-1.5 text-[11px] text-ink-400 md:inline-flex">
            <Save size={11} /> Saved {savedAt}
          </span>
          <span
            className={cn(
              "rounded-lg px-3 py-1.5 font-display text-[15px] font-bold tabular-nums",
              timerState === "normal" && "bg-mist text-ink",
              timerState === "warning" && "bg-[#FFF6E5] text-[#9A6700]",
              timerState === "critical" && "bg-[#FFEDEC] text-[#C0352C]"
            )}
            aria-live="polite"
          >
            {fmtT(session.timeLeft)}
          </span>
          <button className="rounded-lg p-2 text-ink-400 transition hover:bg-mist hover:text-ink" title="Help" aria-label="Help">
            <HelpCircle size={17} />
          </button>
          <button onClick={() => setExitWarn(true)} className="rounded-lg p-2 text-ink-400 transition hover:bg-mist hover:text-ink" title="Exit test" aria-label="Exit test">
            <X size={17} />
          </button>
        </div>
      </header>

      {/* ---------- Body ---------- */}
      <div className="min-h-0 flex-1">
        {phase === "review" ? (
          <ReviewScreen session={session} allQuestions={allQuestions} onReturn={() => setPhase("exam")} onSubmit={submit} />
        ) : section.id === "reading" ? (
          <ReadingSection groups={section.groups} passage={section.passage!} answers={session.answers} onAnswer={onAnswer} current={currentQ} />
        ) : section.id === "listening" ? (
          <ListeningSection groups={section.groups} answers={session.answers} onAnswer={onAnswer} />
        ) : section.id === "writing" ? (
          <WritingSection writing={session.writing} onWrite={onWrite} savedAt={savedAt} />
        ) : (
          <SpeakingSection />
        )}
      </div>

      {/* ---------- Bottom bar ---------- */}
      {phase === "exam" && (
        <footer className="flex shrink-0 flex-wrap items-center gap-3 border-t border-line bg-white px-4 py-2.5">
          {sectionQuestions.length > 0 ? (
            <Palette questions={sectionQuestions} answers={session.answers} flags={session.flags} current={currentQ} onJump={jump} />
          ) : (
            <span className="text-[12px] text-ink-400">
              {section.id === "writing" ? "Both tasks must be completed before submission" : "Complete all three speaking parts"}
            </span>
          )}
          <div className="ml-auto flex items-center gap-2">
            {sectionQuestions.length > 0 && (
              <Btn
                variant="outline" size="sm"
                onClick={() => {
                  const firstUnanswered = sectionQuestions.find((q) => !session.answers[q.id]?.trim());
                  if (firstUnanswered) toggleFlag(firstUnanswered.id);
                }}
              >
                <Flag size={13} /> Flag next unanswered
              </Btn>
            )}
            <Btn variant="ghost" size="sm" disabled={session.sectionIndex === 0}
              onClick={() => setSession((s) => ({ ...s, sectionIndex: s.sectionIndex - 1, timeLeft: sections[s.sectionIndex - 1].durationMin * 60 }))}>
              <ChevronLeft size={14} /> Previous section
            </Btn>
            {session.sectionIndex < sections.length - 1 ? (
              <Btn variant="ink" size="sm"
                onClick={() => setSession((s) => ({ ...s, sectionIndex: s.sectionIndex + 1, timeLeft: sections[s.sectionIndex + 1].durationMin * 60 }))}>
                Next: {sections[session.sectionIndex + 1].name} <ChevronRight size={14} />
              </Btn>
            ) : (
              <Btn size="sm" onClick={() => setPhase("review")}>Review Answers</Btn>
            )}
          </div>
        </footer>
      )}

      {/* exit warning */}
      {exitWarn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm animate-fade-up rounded-2xl bg-white p-6">
            <h3 className="font-display text-lg font-bold text-ink">Leave the test?</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-500">
              Your answers have been saved. You can resume this attempt later — the timer, however, keeps running in a real exam.
            </p>
            <div className="mt-5 flex gap-2.5">
              <Btn variant="outline" className="flex-1" onClick={() => setExitWarn(false)}>Stay in test</Btn>
              <Btn variant="danger" className="flex-1" onClick={() => navigate("/app/tests")}>Exit</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { WritingSection, SpeakingSection };
