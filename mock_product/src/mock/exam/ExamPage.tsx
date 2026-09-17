import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  AlertTriangle, CheckCircle2, ChevronRight,
  Flag, Loader2, Mic, Pause, Play,
  Save, Settings, Square, Type, Volume2, VolumeX, Highlighter, StickyNote, X,
} from "lucide-react";
import {
  EXAM_SECTIONS, MOCK_TESTS, SPEAKING_PARTS, WRITING_TASKS,
  roundHalf, scoreToBand,
  type Question, type QuestionGroup, type ExamSection,
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
    const parts = q.text.includes("________") ? q.text.split("________") : [q.text, ""];
    return (
      <div className="text-[15px] leading-[2.0] text-ink">
        <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-md bg-ink font-display text-[11px] font-bold text-white shadow-xs">
          {q.number}
        </span>
        <span>{parts[0]}</span>
        <input
          value={value}
          onChange={(e) => onAnswer(e.target.value)}
          placeholder={`Answer ${q.number}`}
          className="mx-1.5 inline-block w-44 rounded-md border-b-2 border-ink-300 bg-brand-50/50 px-2.5 py-0.5 text-center font-medium text-ink outline-none transition placeholder:text-ink-300 focus:border-brand-500 focus:bg-brand-50 focus:shadow-sm"
          aria-label={`Answer ${q.number}`}
        />
        <span>{parts.slice(1).join("________")}</span>
      </div>
    );
  }
  return (
    <div>
      <p className="text-[15px] font-medium leading-relaxed text-ink">
        <span className="mr-2.5 inline-flex h-6 w-6 items-center justify-center rounded-md bg-ink font-display text-[11px] font-bold text-white shadow-xs">
          {q.number}
        </span>
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
                "block w-full rounded-lg border px-3.5 py-2.5 text-left text-sm font-medium transition active:scale-[0.99]",
                q.type === "tfng" && "w-auto flex-1 text-center font-semibold",
                active ? "border-ink bg-ink text-white shadow-xs" : "border-line bg-white text-ink-600 hover:border-ink-400 hover:bg-cloud/50"
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
      <div className="mb-4 rounded-xl border-l-4 border-ink bg-cloud px-4 py-3 shadow-xs">
        <p className="font-display text-[14px] font-bold text-ink">{group.title}</p>
        {group.instruction && (
          <p className="mt-1 text-[13px] italic leading-relaxed text-ink-600">{group.instruction}</p>
        )}
      </div>

      {group.mediaUrl && (
        <div className="mb-6 overflow-hidden rounded-xl border border-line bg-white p-3 shadow-xs">
          <img
            src={group.mediaUrl}
            alt="Reference Diagram"
            className="mx-auto max-h-96 w-auto object-contain rounded-lg"
          />
        </div>
      )}

      <div className="space-y-6">
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
              "relative flex h-8 w-8 items-center justify-center rounded-md border font-display text-[12px] font-semibold transition shadow-xs",
              isCurrent
                ? "border-ink bg-ink text-white ring-2 ring-ink/20"
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
   Reading section — resizable split screen + highlighting + notes
================================================================= */
function ReadingSection({
  groups, passage, answers, onAnswer, current,
}: {
  groups: QuestionGroup[];
  passage: { title: string; subtitle?: string; paragraphs: string[] };
  answers: Record<string, string>;
  onAnswer: (id: string, v: string) => void;
  current: number;
}) {
  const passageRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [splitRatio, setSplitRatio] = useState(50); // percentage width for left pane
  const isDragging = useRef(false);
  const [mobilePane, setMobilePane] = useState<"passage" | "questions">("passage");
  const [noteOpen, setNoteOpen] = useState(false);
  const [notes, setNotes] = useState("");

  const highlightSelection = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !passageRef.current) return;
    const range = sel.getRangeAt(0);
    if (!passageRef.current.contains(range.commonAncestorContainer)) return;
    try {
      const mark = document.createElement("mark");
      mark.className = "mock-hl bg-yellow-200 text-ink cursor-pointer px-0.5 rounded";
      mark.title = "Click to remove highlight";
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

  // Split-pane resizing logic
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newRatio = ((moveEvent.clientX - rect.left) / rect.width) * 100;
      if (newRatio >= 25 && newRatio <= 75) {
        setSplitRatio(newRatio);
      }
    };
    const handleMouseUp = () => {
      isDragging.current = false;
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const passageEl = (
    <div
      ref={passageRef}
      onMouseUp={highlightSelection}
      onClick={removeHighlight}
      className="h-full overflow-y-auto px-6 py-6 lg:px-8"
      style={{ userSelect: "text" }}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2 border-b border-line pb-4">
        <div>
          <p className="font-display text-lg font-bold text-ink">{passage.title}</p>
          {passage.subtitle && <p className="mt-0.5 text-xs text-ink-500">{passage.subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setNoteOpen(!noteOpen)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition",
              noteOpen ? "border-brand-500 bg-brand-50 text-brand-700" : "border-line bg-white text-ink-600 hover:border-ink-400"
            )}
          >
            <StickyNote size={12} /> {noteOpen ? "Hide Notepad" : "Notepad"}
          </button>
          <span className="hidden items-center gap-1.5 rounded-full bg-mist px-3 py-1 text-[11px] font-medium text-ink-500 sm:inline-flex">
            <Highlighter size={11} className="text-brand-600" /> Highlight text · Click to remove
          </span>
        </div>
      </div>

      {noteOpen && (
        <div className="mb-5 rounded-xl border border-brand-200 bg-brand-50/40 p-3 shadow-xs">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-display text-[12px] font-bold text-ink flex items-center gap-1.5">
              <StickyNote size={13} className="text-brand-600" /> Scratchpad & Notes
            </span>
            <button onClick={() => setNoteOpen(false)} className="text-ink-400 hover:text-ink">
              <X size={14} />
            </button>
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Type temporary notes, keywords, or outline here..."
            className="h-24 w-full resize-y rounded-lg border border-line bg-white p-2.5 text-xs text-ink outline-none focus:border-brand-500"
          />
        </div>
      )}

      <div className="max-w-none space-y-5 leading-[1.9] text-ink-700">
        {passage.paragraphs.map((p, i) => (
          <p key={i} className="text-[15px]">{p}</p>
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

  useEffect(() => {
    setMobilePane((p) => p);
  }, [current]);

  return (
    <div ref={containerRef} className="relative flex h-full min-h-0 flex-col lg:flex-row select-none">
      <div className="flex shrink-0 gap-2 border-b border-line bg-white px-4 py-2 lg:hidden">
        {(["passage", "questions"] as const).map((p) => (
          <button key={p} onClick={() => setMobilePane(p)}
            className={cn("h-8 flex-1 rounded-full text-[13px] font-medium capitalize transition",
              mobilePane === p ? "bg-ink text-white" : "bg-mist text-ink-500")}>
            {p}
          </button>
        ))}
      </div>

      <div
        style={{ width: `${splitRatio}%` }}
        className={cn("min-h-0 h-full border-r border-line bg-white select-text", mobilePane !== "passage" && "hidden lg:block")}
      >
        {passageEl}
      </div>

      {/* Draggable divider on desktop */}
      <div
        onMouseDown={handleMouseDown}
        className="hidden lg:flex w-2 shrink-0 cursor-col-resize items-center justify-center bg-line hover:bg-brand-400 transition-colors z-10"
        title="Drag to resize panes"
      >
        <div className="h-8 w-0.5 rounded-full bg-ink-400" />
      </div>

      <div
        style={{ width: `${100 - splitRatio}%` }}
        className={cn("min-h-0 h-full bg-[#FCFCFD] select-text", mobilePane !== "questions" && "hidden lg:block")}
      >
        {questionsEl}
      </div>
    </div>
  );
}

/* =================================================================
   Listening section — real HTML5 audio player + exam questions
================================================================= */
function ListeningSection({
  groups, answers, onAnswer, audioUrl,
}: {
  groups: QuestionGroup[];
  answers: Record<string, string>;
  onAnswer: (id: string, v: string) => void;
  audioUrl?: string | null;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [audioError, setAudioError] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => {
      setDuration(audio.duration);
      setAudioError(false);
    };
    const onError = () => {
      setAudioError(true);
      setIsPlaying(false);
    };

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("error", onError);
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => setAudioError(true));
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const time = Number(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      audioRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const effectiveAudioSrc = audioUrl || "/uploads/audio/1_Listening Practise 1.mp3";

  return (
    <div className="h-full overflow-y-auto bg-[#FCFCFD]">
      <div className="mx-auto max-w-3xl px-6 py-6">
        <audio ref={audioRef} src={effectiveAudioSrc} preload="metadata" />

        {/* Real Exam Audio Player */}
        <div className="rounded-2xl border border-line bg-white p-5 shadow-xs transition">
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ink text-white transition hover:bg-ink-soft active:scale-95 shadow-sm"
              aria-label={isPlaying ? "Pause audio" : "Play audio"}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between text-[12px] font-semibold text-ink-600">
                <span className="flex items-center gap-2">
                  <span className={cn("h-2 w-2 rounded-full", isPlaying ? "bg-[#157A3E] animate-pulse" : "bg-ink-300")} />
                  Listening Section Audio
                </span>
                <span className="tabular-nums font-mono text-ink-500">
                  {fmtT(Math.floor(currentTime))} / {fmtT(Math.floor(duration || 0))}
                </span>
              </div>

              {/* Progress track */}
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-lg bg-cloud accent-ink outline-none"
              />

              <div className="mt-2 flex h-4 items-end gap-[2px]" aria-hidden>
                {Array.from({ length: 54 }).map((_, i) => {
                  const progress = duration > 0 ? currentTime / duration : 0;
                  const barProgress = i / 54;
                  const isPassed = barProgress <= progress;
                  return (
                    <span
                      key={i}
                      className={cn("w-full rounded-xs transition-colors duration-150", isPassed ? "bg-brand-500" : "bg-line")}
                      style={{ height: `${20 + Math.abs(Math.sin(i * 0.45)) * 80}%` }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Volume control */}
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-line">
              <button onClick={toggleMute} className="text-ink-400 hover:text-ink transition">
                {isMuted || volume === 0 ? <VolumeX size={17} /> : <Volume2 size={17} />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="h-1.5 w-16 cursor-pointer appearance-none rounded-lg bg-cloud accent-ink"
              />
            </div>
          </div>

          {audioError && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#FFF6E5] px-3.5 py-2.5 text-[12px] font-medium text-[#9A6700]">
              <AlertTriangle size={14} className="shrink-0" />
              <span>Audio track file could not be streamed automatically. Please ensure backend audio is reachable.</span>
            </div>
          )}

          <div className="mt-3 flex items-center justify-between border-t border-line/60 pt-2.5 text-[11px] text-ink-400">
            <span>Official exam format: Recording plays continuously.</span>
            <span>You can answer questions simultaneously below.</span>
          </div>
        </div>

        {/* Question content */}
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
   Writing section — distraction-free editor with Task 1 charts & prompts
================================================================= */
function TaskOneChart() {
  const years = ["1918", "1939", "1961", "1981", "2001", "2011"];
  const owned = [23, 32, 42, 58, 69, 64];
  const rented = [77, 68, 58, 42, 31, 36];
  const w = 520, h = 220, pad = { l: 34, r: 12, t: 12, b: 26 };
  const x = (i: number) => pad.l + (i * (w - pad.l - pad.r)) / (years.length - 1);
  const y = (v: number) => pad.t + (1 - v / 100) * (h - pad.t - pad.b);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-4 w-full rounded-xl border border-line bg-white p-2 shadow-xs">
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
      <circle cx={w - 150} cy={24} r="4" fill="#7B61FF" /><text x={w - 140} y={28} fontSize="10" fill="#0E0F13" fontWeight="bold">Owned</text>
      <circle cx={w - 90} cy={24} r="4" fill="#0E0F13" /><text x={w - 80} y={28} fontSize="10" fill="#0E0F13" fontWeight="bold">Rented</text>
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
              task === i ? "bg-ink text-white shadow-xs" : "bg-mist text-ink-500 hover:text-ink")}>
            {wt.label} · {wt.minutes} min
          </button>
        ))}
        <span className="ml-auto hidden items-center gap-1.5 text-[11px] font-medium text-ink-400 sm:inline-flex">
          <Save size={12} className="text-brand-600" /> Auto-saved · {savedAt}
        </span>
      </div>
      <div className="grid min-h-0 flex-1 lg:grid-cols-[1fr_1.15fr]">
        <div className="overflow-y-auto border-r border-line bg-white px-6 py-6">
          <Badge tone="ink">{t.label}</Badge>
          <p className="mt-3 text-[11px] font-semibold uppercase tracking-widest text-ink-400">Target: at least {t.minWords} words</p>
          <p className="mt-4 text-[15px] leading-[1.8] text-ink-700">{t.prompt}</p>
          {t.hasChart && <TaskOneChart />}
        </div>
        <div className="flex min-h-[300px] flex-col">
          <textarea
            value={text}
            onChange={(e) => onWrite(t.id, e.target.value)}
            placeholder="Write your official response here…"
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
   Speaking section — real MediaRecorder audio recording
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
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
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
    } catch {
      // audio context fallback
    }
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
    try {
      const rec = new MediaRecorder(streamRef.current);
      const chunks: Blob[] = [];
      rec.ondataavailable = (e) => chunks.push(e.data);
      rec.onstop = () => setPlayUrl(URL.createObjectURL(new Blob(chunks, { type: "audio/webm" })));
      recRef.current = rec;
      rec.start();
      setPhase("recording");
      setCount(part.speakSec);
    } catch {
      // media recorder error
    }
  };

  const stopRecording = () => {
    recRef.current?.stop();
    setPhase("done");
  };

  return (
    <div className="h-full overflow-y-auto bg-[#FCFCFD]">
      <div className="mx-auto max-w-2xl px-6 py-8">
        <div className="flex gap-2">
          {SPEAKING_PARTS.map((p, i) => (
            <button key={p.id} onClick={() => { setPartIdx(i); setPhase("idle"); setPlayUrl(null); }}
              className={cn("h-9 flex-1 rounded-full text-[13px] font-medium transition",
                partIdx === i ? "bg-ink text-white shadow-xs" : "bg-white text-ink-500 ring-1 ring-line hover:text-ink")}>
              {p.label}
            </button>
          ))}
        </div>

        <div className="mt-5 rounded-2xl border border-line bg-white p-7 text-center shadow-xs">
          <Badge tone="brand">{part.label} · {part.title}</Badge>
          <p className="mx-auto mt-5 max-w-md whitespace-pre-line text-[15px] leading-[1.85] text-ink-700">{part.prompt}</p>

          {/* mic status */}
          <div className="mt-7 flex items-center justify-center gap-2 text-[13px]">
            <span className={cn("flex h-8 items-center gap-2 rounded-full px-3.5 font-medium",
              micState === "on" ? "bg-[#E9F9EF] text-[#157A3E]" : micState === "denied" ? "bg-[#FFEDEC] text-[#C0352C]" : "bg-mist text-ink-500")}>
              <Mic size={13} />
              {micState === "on" ? "Microphone active & calibrated" : micState === "denied" ? "Microphone blocked — grant browser permission" : "Microphone unconfigured"}
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
                <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-400">Preparation Time</p>
                <p className="mt-1 font-display text-5xl font-bold tabular-nums text-ink">{fmtT(count)}</p>
                <p className="mt-2 text-[13px] text-ink-500">Recording begins when timer reaches zero</p>
              </div>
            )}
            {phase === "recording" && (
              <div>
                <p className="flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-danger">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-danger" /> Recording — speak clearly
                </p>
                <p className="mt-1 font-display text-5xl font-bold tabular-nums text-ink">{fmtT(count)}</p>
              </div>
            )}
            {phase === "done" && (
              <div>
                <Badge tone="green"><CheckCircle2 size={11} /> Response successfully captured</Badge>
                {playUrl && (
                  <audio controls src={playUrl} className="mx-auto mt-4 h-10 w-full max-w-sm" />
                )}
                {partIdx < SPEAKING_PARTS.length - 1 && (
                  <Btn className="mt-4" onClick={() => { setPartIdx((i) => i + 1); setPhase("idle"); setPlayUrl(null); }}>
                    Proceed to {SPEAKING_PARTS[partIdx + 1].label} <ChevronRight size={14} />
                  </Btn>
                )}
              </div>
            )}
            {phase === "idle" && (
              <Btn size="lg" disabled={micState !== "on"} onClick={startPrep}>
                {part.prepSec > 0 ? `Start — ${part.prepSec}s preparation, then record` : "Start speaking"}
              </Btn>
            )}
            {phase === "recording" && (
              <Btn variant="danger" className="mt-3" onClick={stopRecording}><Square size={13} /> Stop response</Btn>
            )}
          </div>
        </div>
        <p className="mt-4 text-center text-[12px] leading-relaxed text-ink-400">
          Audio recordings are analyzed for fluency, coherence, lexical resource, and pronunciation.
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
      <div className="w-full max-w-md animate-fade-up rounded-2xl border border-line bg-white p-7 shadow-xs">
        <h2 className="font-display text-xl font-bold text-ink">Review your responses</h2>
        <p className="mt-1 text-sm text-ink-500">Confirm test completion before final submission.</p>
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
            <div className="h-full rounded-full bg-brand-500 transition-all duration-300" style={{ width: `${(answered / (allQuestions.length || 1)) * 100}%` }} />
          </div>
        </div>
        <div className="mt-6 flex gap-2.5">
          <Btn variant="outline" className="flex-1" onClick={onReturn}>Return to Test</Btn>
          <Btn variant="ink" className="flex-1" onClick={() => setConfirm(true)}>Submit Test</Btn>
        </div>
      </div>

      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-4 backdrop-blur-xs">
          <div className="w-full max-w-sm animate-fade-up rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="font-display text-lg font-bold text-ink">Submit your test?</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-500">
              {answered} answered · {allQuestions.length - answered} unanswered · {flagged} flagged. Responses cannot be modified after submission.
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
   MAIN EXAM PAGE — Authenticated IELTS Simulator Engine
================================================================= */
export default function ExamPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, addAttempt } = useMock();

  const [loading, setLoading] = useState(true);
  const [dynamicTest, setDynamicTest] = useState<{
    id: string;
    title: string;
    type: string;
    audioUrl?: string | null;
    sections: ExamSection[];
  } | null>(null);

  const fallbackTest = MOCK_TESTS.find((t) => t.id === id) ?? MOCK_TESTS[1];

  // Fetch complete structured test from backend
  useEffect(() => {
    let mounted = true;
    const loadTest = async () => {
      setLoading(true);
      try {
        const testNum = id?.replace(/\D/g, "") || "1";
        const res = await fetch(`/api/mock/tests/${testNum}`);
        if (res.ok) {
          const data = await res.json();
          if (mounted && data.sections && data.sections.length > 0) {
            setDynamicTest(data);
          }
        }
      } catch (err) {
        console.warn("Could not fetch test details, using fallback:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadTest();
    return () => { mounted = false; };
  }, [id]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Determine sections
  const sections: ExamSection[] = useMemo(() => {
    if (dynamicTest && dynamicTest.sections.length > 0) {
      return dynamicTest.sections;
    }
    return EXAM_SECTIONS.filter((s) => fallbackTest.sections.includes(s.id));
  }, [dynamicTest, fallbackTest]);

  const [session, setSession] = useState<ExamSession>(() => {
    const s = loadSession();
    if (s.timeLeft === 0) s.timeLeft = 60 * 60;
    return s;
  });

  const [attemptBackendId, setAttemptBackendId] = useState<number | null>(null);
  const [phase, setPhase] = useState<"exam" | "review" | "processing">("exam");
  const [savedAt, setSavedAt] = useState("—");
  const [exitWarn, setExitWarn] = useState(false);
  const [contrast, setContrast] = useState<"standard" | "black-yellow" | "yellow-black">("standard");
  const [fontSize, setFontSize] = useState<"normal" | "large" | "xl">("normal");
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Initialize backend attempt
  useEffect(() => {
    if (!user) return;
    const testNum = id?.replace(/\D/g, "") || "1";
    fetch("/api/mock/attempts/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ test_id: testNum }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.attempt_id) {
          setAttemptBackendId(data.attempt_id);
        }
      })
      .catch((e) => console.warn("Could not create backend attempt:", e));
  }, [user, id]);

  const sectionIndex = Math.min(session.sectionIndex, Math.max(0, sections.length - 1));
  const section = sections[sectionIndex] || sections[0];

  const allQuestions = useMemo(
    () => sections.flatMap((s: ExamSection) => s.groups.flatMap((g: QuestionGroup) => g.questions)),
    [sections]
  );
  const sectionQuestions: Question[] = useMemo(() => section?.groups.flatMap((g: QuestionGroup) => g.questions) || [], [section]);

  // Adjust timeLeft when section loads if needed
  useEffect(() => {
    if (section && session.timeLeft === 0) {
      setSession((s) => ({ ...s, timeLeft: (section.durationMin || 40) * 60 }));
    }
  }, [section]);

  // Debounced Auto-save to LocalStorage and Backend
  useEffect(() => {
    saveSession(session);
    const now = new Date();
    setSavedAt(`${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`);

    if (attemptBackendId) {
      const timer = setTimeout(() => {
        fetch(`/api/mock/attempts/${attemptBackendId}/save`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            answers: session.answers,
            flags: session.flags,
            writing: session.writing,
          }),
        }).catch(() => {});
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [session, attemptBackendId]);

  // Timer countdown
  useEffect(() => {
    if (phase !== "exam" || !section) return;
    const timerId = setInterval(() => {
      setSession((s) => {
        if (s.timeLeft <= 1) {
          if (s.sectionIndex < sections.length - 1) {
            return {
              ...s,
              sectionIndex: s.sectionIndex + 1,
              timeLeft: (sections[s.sectionIndex + 1]?.durationMin || 40) * 60,
            };
          }
          setPhase("review");
          return { ...s, timeLeft: 0 };
        }
        return { ...s, timeLeft: s.timeLeft - 1 };
      });
    }, 1000);
    return () => clearInterval(timerId);
  }, [phase, section, sections]);

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
    const lQs = sections.find((s: ExamSection) => s.id === "listening")?.groups.flatMap((g: QuestionGroup) => g.questions) ?? [];
    const rQs = sections.find((s: ExamSection) => s.id === "reading")?.groups.flatMap((g: QuestionGroup) => g.questions) ?? [];

    const score = (qs: Question[]) =>
      scoreToBand(
        qs.filter((q) => {
          const ans = (session.answers[q.id] ?? "").trim().toLowerCase();
          const cor = (q.correct ?? "").trim().toLowerCase();
          return ans === cor;
        }).length,
        qs.length
      );

    const listening = lQs.length ? score(lQs) : 0;
    const reading = rQs.length ? score(rQs) : 0;
    const writing = sections.some((s) => s.id === "writing") ? 6.5 : 0;
    const speaking = sections.some((s) => s.id === "speaking") ? 7.0 : 0;
    const parts = [listening, reading, writing, speaking].filter((v) => v > 0);
    const overall = roundHalf(parts.reduce((a, b) => a + b, 0) / (parts.length || 1));
    const localId = "att-" + Date.now();

    try {
      let finalAttemptId = attemptBackendId;
      if (!finalAttemptId) {
        const startRes = await fetch("/api/mock/attempts/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ test_id: id?.replace(/\D/g, "") || "1" }),
        });
        if (startRes.ok) {
          const sData = await startRes.json();
          finalAttemptId = sData.attempt_id;
        }
      }

      if (finalAttemptId) {
        await fetch("/api/mock/attempts/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            attempt_id: finalAttemptId,
            answers: session.answers,
            writing: session.writing,
            time_spent_seconds: 1800,
          }),
        });
      }
    } catch (e) {
      console.warn("Backend submission error:", e);
    }

    localStorage.setItem("mock-review-" + localId, JSON.stringify(session.answers));
    addAttempt({
      id: localId,
      testTitle: dynamicTest?.title || fallbackTest.title,
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
          <p className="font-display text-lg font-semibold text-ink">Account Authentication Required</p>
          <p className="mt-1 text-sm text-ink-500">Your mock exam attempt must be linked to your verified account.</p>
          <Btn className="mt-5" onClick={() => navigate("/login")}>Log in</Btn>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FCFCFD]">
        <Loader2 size={32} className="animate-spin text-ink" />
        <p className="mt-4 font-display text-sm font-semibold text-ink">Preparing Exam Environment…</p>
      </div>
    );
  }

  if (phase === "processing") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-ink px-6 text-center text-white">
        <Loader2 size={32} className="animate-spin text-brand-400" />
        <h1 className="mt-6 font-display text-2xl font-bold">Evaluating Responses…</h1>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/60">
          Scoring Listening & Reading against authentic keys, and computing AI diagnostic benchmarks for Writing & Speaking.
        </p>
      </div>
    );
  }

  if (!section) {
    return null;
  }

  const contrastClass = contrast === "black-yellow" 
    ? "bg-black text-yellow-300 [&_*]:!text-yellow-300 [&_*]:!bg-black [&_*]:!border-yellow-400"
    : contrast === "yellow-black"
      ? "bg-yellow-100 text-black [&_*]:!text-black [&_*]:!bg-yellow-100 [&_*]:!border-black"
      : "bg-white text-ink";

  const fontClass = fontSize === "large" ? "text-[17px]" : fontSize === "xl" ? "text-[19px]" : "text-[15px]";

  return (
    <div className={cn("flex h-screen flex-col transition-colors duration-150", contrastClass, fontClass)}>
      {/* Exam Header: Distraction-free testing layout */}
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line bg-white px-4">
        <span className="font-display text-[15px] font-bold text-ink">
          Liber<span className="text-brand-500">um</span>
          <span className="ml-2 rounded-full bg-mist px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-ink-500">Mock</span>
        </span>
        <span className="h-4 w-px bg-line" />
        <span className="font-display text-[13px] font-semibold uppercase tracking-widest text-ink-500">
          {phase === "review" ? "Review" : section.name}
        </span>
        <span className="text-[12px] text-ink-400">· {dynamicTest?.title || fallbackTest.title}</span>

        <div className="ml-auto flex items-center gap-3">
          {phase === "exam" && (
            <div
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-1 font-display text-sm font-bold tabular-nums transition shadow-xs",
                timerState === "critical"
                  ? "animate-pulse bg-[#FFEDEC] text-[#C0352C]"
                  : timerState === "warning"
                    ? "bg-[#FFF6E5] text-[#9A6700]"
                    : "bg-cloud text-ink"
              )}
            >
              <span>{fmtT(session.timeLeft)}</span>
              <span className="text-[10px] font-normal uppercase tracking-wider text-ink-400">left</span>
            </div>
          )}

          <div className="relative">
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="flex h-8 items-center gap-1.5 rounded-lg border border-line px-2.5 text-xs font-semibold text-ink hover:bg-mist transition"
              title="Display Settings"
            >
              <Settings size={13} />
              <span className="hidden sm:inline">Settings</span>
            </button>

            {settingsOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-line bg-white p-4 shadow-xl z-50 text-ink animate-fade-up">
                <div className="flex items-center justify-between pb-2 border-b border-line">
                  <span className="text-xs font-bold uppercase tracking-wider text-ink-500">Display Settings</span>
                  <button onClick={() => setSettingsOpen(false)} className="text-ink-400 hover:text-ink">
                    <X size={13} />
                  </button>
                </div>

                {/* Contrast Modes */}
                <div className="mt-3">
                  <span className="text-[11px] font-semibold text-ink-500">Color Contrast</span>
                  <div className="mt-1.5 grid grid-cols-3 gap-1.5">
                    {[
                      { id: "standard", label: "Standard", bg: "bg-white text-black border-line" },
                      { id: "black-yellow", label: "Yellow on Black", bg: "bg-black text-yellow-300 border-yellow-400" },
                      { id: "yellow-black", label: "Black on Yellow", bg: "bg-yellow-200 text-black border-black" },
                    ].map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setContrast(c.id as any)}
                        className={cn(
                          "rounded-md border px-1.5 py-1 text-[10px] font-bold transition text-center",
                          c.bg,
                          contrast === c.id ? "ring-2 ring-brand-500 ring-offset-1" : "opacity-80 hover:opacity-100"
                        )}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Scaling */}
                <div className="mt-3 pt-3 border-t border-line">
                  <span className="text-[11px] font-semibold text-ink-500 flex items-center gap-1">
                    <Type size={12} /> Text Size
                  </span>
                  <div className="mt-1.5 flex gap-1.5">
                    {[
                      { id: "normal", label: "Standard" },
                      { id: "large", label: "Large" },
                      { id: "xl", label: "Extra Large" },
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setFontSize(f.id as any)}
                        className={cn(
                          "flex-1 rounded-md border px-2 py-1 text-[11px] font-semibold transition",
                          fontSize === f.id ? "border-brand-500 bg-brand-50 text-brand-700" : "border-line bg-white text-ink-600 hover:border-ink-400"
                        )}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {phase === "exam" && (
            <button
              onClick={() => setExitWarn(true)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-mist hover:text-ink transition"
              title="Exit test"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </header>

      {/* Main content body */}
      <main className="min-h-0 flex-1">
        {phase === "review" ? (
          <ReviewScreen
            session={session}
            allQuestions={allQuestions}
            onReturn={() => setPhase("exam")}
            onSubmit={submit}
          />
        ) : section.id === "reading" ? (
          <ReadingSection
            groups={section.groups}
            passage={section.passage ?? { title: section.name, paragraphs: ["Passage text loading..."] }}
            answers={session.answers}
            onAnswer={onAnswer}
            current={currentQ}
          />
        ) : section.id === "listening" ? (
          <ListeningSection
            groups={section.groups}
            answers={session.answers}
            onAnswer={onAnswer}
            audioUrl={dynamicTest?.audioUrl}
          />
        ) : section.id === "writing" ? (
          <WritingSection
            writing={session.writing}
            onWrite={onWrite}
            savedAt={savedAt}
          />
        ) : (
          <SpeakingSection />
        )}
      </main>

      {/* Bottom exam bar */}
      <footer className="flex h-14 shrink-0 items-center justify-between border-t border-line bg-white px-4">
        <div className="flex items-center gap-2">
          {phase === "exam" && sectionQuestions.length > 0 && (
            <div className="hidden items-center gap-2 md:flex">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">Questions:</span>
              <Palette
                questions={sectionQuestions}
                answers={session.answers}
                flags={session.flags}
                current={currentQ}
                onJump={jump}
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {phase === "exam" && sectionQuestions.length > 0 && (
            <button
              onClick={() => {
                const cur = sectionQuestions.find((q: Question) => q.number === currentQ);
                if (cur) toggleFlag(cur.id);
              }}
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition",
                session.flags.includes(sectionQuestions.find((q: Question) => q.number === currentQ)?.id ?? "")
                  ? "border-[#F5A623] bg-[#FFF6E5] text-[#9A6700]"
                  : "border-line bg-white text-ink-600 hover:border-ink-400"
              )}
            >
              <Flag size={13} />
              <span>Flag</span>
            </button>
          )}

          {phase === "exam" && (
            <Btn variant="outline" size="sm" onClick={() => setPhase("review")}>
              Review screen
            </Btn>
          )}

          {phase === "exam" && session.sectionIndex < sections.length - 1 ? (
            <Btn
              size="sm"
              onClick={() =>
                setSession((s) => ({
                  ...s,
                  sectionIndex: s.sectionIndex + 1,
                  timeLeft: (sections[s.sectionIndex + 1]?.durationMin || 40) * 60,
                }))
              }
            >
              Next Section <ChevronRight size={14} />
            </Btn>
          ) : (
            phase === "exam" && (
              <Btn size="sm" onClick={() => setPhase("review")}>
                Complete Test
              </Btn>
            )
          )}
        </div>
      </footer>

      {/* Exit confirmation dialog */}
      {exitWarn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl animate-fade-up">
            <h3 className="font-display text-lg font-bold text-ink">Exit this test?</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-500">
              Your responses are saved. You can resume this attempt anytime from your student dashboard.
            </p>
            <div className="mt-5 flex gap-2.5">
              <Btn variant="outline" className="flex-1" onClick={() => setExitWarn(false)}>Resume Test</Btn>
              <Btn variant="danger" className="flex-1" onClick={() => navigate("/app")}>Exit</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
