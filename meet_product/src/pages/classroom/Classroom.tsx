import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import {
  BookOpen, Check, Eraser, Mic, MicOff, MonitorUp,
  PenTool, PhoneOff, Plus, RefreshCw, RotateCcw, Send,
  Signal, Sparkles, Star, Video, VideoOff, Wand2, X,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { meetApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui-kit";

interface ChatMsg {
  id: number;
  from: "me" | "them";
  name: string;
  text: string;
  time: string;
}

interface VocabItem {
  word: string;
  definition: string;
  example: string;
}

interface WhiteboardDrawAction {
  tool: "pen" | "eraser";
  color: string;
  size: number;
  points: { x: number; y: number }[];
}

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function ClassroomPage() {
  const { lessonId } = useParams();
  const { user, lessons, completeLesson } = useApp();
  const lesson = lessons.find((l) => l.id === lessonId) ?? lessons[0];

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [activeSideTab, setActiveSideTab] = useState<"chat" | "whiteboard" | "notes" | "ai">("chat");
  const [sideOpen, setSideOpen] = useState(true);
  const [elapsed, setElapsed] = useState(0); // starts from 00:00
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [draft, setDraft] = useState("");
  const [ended, setEnded] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [conn, setConn] = useState<"excellent" | "good" | "weak">("excellent");
  const [wsConnected, setWsConnected] = useState(false);
  const [reconnectCounter, setReconnectCounter] = useState(0);

  // Lesson Superpowers State
  const [notesText, setNotesText] = useState("# Lesson Notes\n\n- Focus on Part 2 cue cards\n- Work on natural pauses instead of 'um' / 'uh'");
  const [vocabulary, setVocabulary] = useState<VocabItem[]>([
    { word: "Articulate", definition: "Able to express thoughts clearly and effectively.", example: "She gave an articulate response during the mock interview." },
    { word: "Nuance", definition: "A subtle difference in meaning or tone.", example: "Understanding cultural nuances is vital for higher band scores." }
  ]);
  const [homework, setHomework] = useState("Record a 2-minute voice reply describing an impressive historical building you visited.");
  const [aiSummary, setAiSummary] = useState("");
  const [analyzingAi, setAnalyzingAi] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [newVocabWord, setNewVocabWord] = useState("");
  const [newVocabDef, setNewVocabDef] = useState("");

  // Whiteboard Canvas State
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [penColor, setPenColor] = useState("#7B61FF");
  const [penSize] = useState(3);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const currentPathRef = useRef<{ x: number; y: number }[]>([]);
  const strokesRef = useRef<WhiteboardDrawAction[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [hasStream, setHasStream] = useState(false);

  const total = (lesson?.durationMin ?? 60) * 60;
  const remaining = total - elapsed;
  const iAmTeacher = user?.role === "teacher";
  const otherName = lesson ? (iAmTeacher ? lesson.studentName : lesson.teacherName) : "Aziza Karimova";
  const otherInitials = otherName.split(" ").map((w) => w[0]).join("").slice(0, 2);

  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [peerConnected, setPeerConnected] = useState(false);

  // WebRTC ICE Servers Configuration (STUN + TURN fallback for symmetric NATs)
  const rtcConfig: RTCConfiguration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
      { urls: "stun:stun3.l.google.com:19302" },
      { urls: "stun:stun4.l.google.com:19302" },
      { urls: "stun:stun.services.mozilla.com" },
      { urls: "stun:global.stun.twilio.com:3478" },
      // OpenRelay public WebRTC TURN server for strict corporate/mobile firewalls
      {
        urls: "turn:openrelay.metered.ca:80",
        username: "openrelayproject",
        credential: "openrelayproject",
      },
      {
        urls: "turn:openrelay.metered.ca:443",
        username: "openrelayproject",
        credential: "openrelayproject",
      },
    ],
    iceCandidatePoolSize: 10,
  };

  // Real local camera & microphone
  useEffect(() => {
    if (!camOn) {
      streamRef.current?.getVideoTracks().forEach((t) => (t.enabled = false));
    } else {
      streamRef.current?.getVideoTracks().forEach((t) => (t.enabled = true));
    }
  }, [camOn]);

  useEffect(() => {
    if (!micOn) {
      streamRef.current?.getAudioTracks().forEach((t) => (t.enabled = false));
    } else {
      streamRef.current?.getAudioTracks().forEach((t) => (t.enabled = true));
    }
  }, [micOn]);

  // Initialize Media and WebRTC Peer Connection + WebSocket Tunnel
  useEffect(() => {
    let active = true;

    async function initMediaAndSignaling() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (!active) return;
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setHasStream(true);

        // Setup RTCPeerConnection
        const pc = new RTCPeerConnection(rtcConfig);
        pcRef.current = pc;

        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        // When remote peer tracks arrive
        pc.ontrack = (event) => {
          if (event.streams && event.streams[0]) {
            setRemoteStream(event.streams[0]);
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = event.streams[0];
            }
          }
        };

        pc.oniceconnectionstatechange = () => {
          if (pc.iceConnectionState === "connected" || pc.iceConnectionState === "completed") {
            setPeerConnected(true);
            setConn("excellent");
          } else if (pc.iceConnectionState === "disconnected" || pc.iceConnectionState === "failed") {
            setPeerConnected(false);
            setConn("weak");
          }
        };

        // Connect WebSocket Signaling tunnel
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsUrl = `${protocol}//${window.location.host}/api/meet/classroom/${lessonId || "room-1"}/signal`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setWsConnected(true);
        };

        ws.onclose = () => {
          setWsConnected(false);
          // Try auto-reconnecting after 3 seconds if session is active
          if (active && !ended) {
            setTimeout(() => {
              if (active) setReconnectCounter((c) => c + 1);
            }, 3000);
          }
        };

        const candidateQueue: RTCIceCandidateInit[] = [];

        pc.onicecandidate = (event) => {
          if (event.candidate && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "ice-candidate", candidate: event.candidate }));
          }
        };

        ws.onmessage = async (evt) => {
          try {
            const data = JSON.parse(evt.data);
            if (data.type === "peer-joined") {
              // Role-deterministic initiator: Only the teacher (or caller) sends the offer to avoid glare
              if (iAmTeacher) {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                ws.send(JSON.stringify({ type: "sdp-offer", sdp: offer }));
              }
            } else if (data.type === "sdp-offer") {
              // Remote peer sent offer, set remote description and create answer
              await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
              // Flush queued candidates
              while (candidateQueue.length > 0) {
                const cand = candidateQueue.shift();
                if (cand) await pc.addIceCandidate(new RTCIceCandidate(cand));
              }
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              ws.send(JSON.stringify({ type: "sdp-answer", sdp: answer }));
            } else if (data.type === "sdp-answer") {
              // Remote peer accepted our offer
              await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
              // Flush queued candidates
              while (candidateQueue.length > 0) {
                const cand = candidateQueue.shift();
                if (cand) await pc.addIceCandidate(new RTCIceCandidate(cand));
              }
            } else if (data.type === "ice-candidate") {
              // Add ICE Candidate safely
              if (data.candidate) {
                if (pc.remoteDescription && pc.remoteDescription.type) {
                  await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
                } else {
                  candidateQueue.push(data.candidate);
                }
              }
            } else if (data.type === "peer-left") {
              setPeerConnected(false);
              setRemoteStream(null);
            } else if (data.type === "whiteboard-stroke") {
              // Remote peer drew on whiteboard
              if (data.stroke) {
                strokesRef.current.push(data.stroke);
                redrawCanvas();
              }
            } else if (data.type === "whiteboard-clear") {
              strokesRef.current = [];
              redrawCanvas();
            } else if (data.type === "notes-sync") {
              if (data.notesMarkdown) setNotesText(data.notesMarkdown);
              if (data.vocabulary) setVocabulary(data.vocabulary);
              if (data.homework) setHomework(data.homework);
            } else if (data.type === "vocab-add") {
              if (data.item) {
                setVocabulary((prev) => [...prev, data.item]);
              }
            }
          } catch (err) {
            console.error("Signaling error:", err);
          }
        };
      } catch (e) {
        console.warn("User denied camera/mic or no devices available:", e);
        setHasStream(false);
      }
    }

    initMediaAndSignaling();

    return () => {
      active = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      pcRef.current?.close();
      wsRef.current?.close();
    };
  }, [lessonId, reconnectCounter]);

  const handleToggleShare = async () => {
    if (sharing) {
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
      setSharing(false);
      if (videoRef.current && streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
      }
      // Re-replace track in WebRTC
      if (pcRef.current && streamRef.current) {
        const videoTrack = streamRef.current.getVideoTracks()[0];
        const sender = pcRef.current.getSenders().find((s) => s.track?.kind === "video");
        if (sender && videoTrack) sender.replaceTrack(videoTrack);
      }
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = screenStream;
        setSharing(true);
        if (videoRef.current) {
          videoRef.current.srcObject = screenStream;
        }
        // Send screen track over WebRTC tunnel
        if (pcRef.current) {
          const screenVideoTrack = screenStream.getVideoTracks()[0];
          const sender = pcRef.current.getSenders().find((s) => s.track?.kind === "video");
          if (sender && screenVideoTrack) sender.replaceTrack(screenVideoTrack);
        }
        screenStream.getVideoTracks()[0].onended = () => {
          setSharing(false);
          if (videoRef.current && streamRef.current) {
            videoRef.current.srcObject = streamRef.current;
          }
          if (pcRef.current && streamRef.current) {
            const videoTrack = streamRef.current.getVideoTracks()[0];
            const sender = pcRef.current.getSenders().find((s) => s.track?.kind === "video");
            if (sender && videoTrack) sender.replaceTrack(videoTrack);
          }
        };
      } catch {
        setSharing(false);
      }
    }
  };

  useEffect(() => {
    if (ended) return;
    const id = setInterval(() => setElapsed((e) => Math.min(e + 1, total)), 1000);
    return () => clearInterval(id);
  }, [ended, total]);

  // Poll or load chat messages from backend
  useEffect(() => {
    if (!lessonId) return;
    meetApi.getClassroomMessages(lessonId)
      .then((data) => {
        if (data && data.length > 0) setMsgs(data);
      })
      .catch(() => {});

    const pollId = setInterval(() => {
      meetApi.getClassroomMessages(lessonId)
        .then((data) => {
          if (data && data.length > 0) setMsgs(data);
        })
        .catch(() => {});
    }, 4000);

    return () => clearInterval(pollId);
  }, [lessonId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, sideOpen, activeSideTab]);

  const send = async () => {
    if (!draft.trim()) return;
    const text = draft.trim();
    setDraft("");

    const now = new Date();
    const optimistic: ChatMsg = {
      id: Date.now(),
      from: "me",
      name: "You",
      text,
      time: `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`,
    };
    setMsgs((p) => [...p, optimistic]);

    if (lessonId) {
      try {
        const saved = await meetApi.sendClassroomMessage(lessonId, text);
        if (saved) {
          setMsgs((p) => p.map((m) => (m.id === optimistic.id ? saved : m)));
        }
      } catch {
        // keep optimistic
      }
    }
  };

  // Load and sync lesson notes
  useEffect(() => {
    if (!lessonId) return;
    meetApi.getClassroomNotes(lessonId)
      .then((data) => {
        if (data) {
          if (data.notesMarkdown) setNotesText(data.notesMarkdown);
          if (data.vocabulary && data.vocabulary.length > 0) setVocabulary(data.vocabulary);
          if (data.homework) setHomework(data.homework);
          if (data.aiSummary) setAiSummary(data.aiSummary);
        }
      })
      .catch(() => {});
  }, [lessonId]);

  // Load and sync whiteboard
  useEffect(() => {
    if (!lessonId) return;
    meetApi.getClassroomWhiteboard(lessonId)
      .then((data) => {
        if (data && data.elements && data.elements.length > 0) {
          strokesRef.current = data.elements;
          redrawCanvas();
        }
      })
      .catch(() => {});
  }, [lessonId]);

  // Redraw canvas from strokesRef
  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    strokesRef.current.forEach((stroke) => {
      if (stroke.points.length < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = stroke.tool === "eraser" ? "#14151B" : stroke.color;
      ctx.lineWidth = stroke.size;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    });
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setDrawing(true);
    currentPathRef.current = [{ x, y }];
  };

  const drawMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    currentPathRef.current.push({ x, y });
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const points = currentPathRef.current;
    if (points.length >= 2) {
      ctx.beginPath();
      ctx.strokeStyle = tool === "eraser" ? "#14151B" : penColor;
      ctx.lineWidth = tool === "eraser" ? 18 : penSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.moveTo(points[points.length - 2].x, points[points.length - 2].y);
      ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (!drawing) return;
    setDrawing(false);
    if (currentPathRef.current.length > 1) {
      const newStroke: WhiteboardDrawAction = {
        tool,
        color: penColor,
        size: tool === "eraser" ? 18 : penSize,
        points: [...currentPathRef.current],
      };
      strokesRef.current.push(newStroke);
      currentPathRef.current = [];

      // Broadcast stroke via WebSocket
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "whiteboard-stroke", stroke: newStroke }));
      }
      // Save to backend
      if (lessonId) {
        meetApi.updateClassroomWhiteboard(lessonId, strokesRef.current).catch(() => {});
      }
    }
  };

  const clearWhiteboard = () => {
    strokesRef.current = [];
    redrawCanvas();
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "whiteboard-clear" }));
    }
    if (lessonId) {
      meetApi.updateClassroomWhiteboard(lessonId, []).catch(() => {});
    }
  };

  // Save lesson notes to backend
  const handleSaveNotes = async () => {
    if (!lessonId) return;
    setSavingNotes(true);
    try {
      await meetApi.updateClassroomNotes(lessonId, {
        notesMarkdown: notesText,
        vocabulary,
        homework,
      });
      // Broadcast notes update via WebSocket
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: "notes-sync",
          notesMarkdown: notesText,
          vocabulary,
          homework,
        }));
      }
    } finally {
      setSavingNotes(false);
    }
  };

  // Run AI Lesson Copilot Analysis
  const handleRunAiAnalysis = async () => {
    if (!lessonId) return;
    setAnalyzingAi(true);
    try {
      const fullContext = `${notesText}\n\nChat:\n${msgs.map((m) => `${m.name}: ${m.text}`).join("\n")}`;
      const res = await meetApi.analyzeLessonAI(lessonId, fullContext);
      if (res && res.aiSummary) {
        setAiSummary(res.aiSummary);
        if (res.suggestedVocabulary && res.suggestedVocabulary.length > 0) {
          setVocabulary((prev) => {
            const existingWords = new Set(prev.map((v) => v.word.toLowerCase()));
            const toAdd = res.suggestedVocabulary.filter((v) => !existingWords.has(v.word.toLowerCase()));
            return [...prev, ...toAdd];
          });
        }
      }
    } finally {
      setAnalyzingAi(false);
    }
  };

  const addVocabItem = () => {
    if (!newVocabWord.trim()) return;
    const item: VocabItem = {
      word: newVocabWord.trim(),
      definition: newVocabDef.trim() || "Defined during lesson practice.",
      example: "Used during mock dialogue.",
    };
    const updated = [...vocabulary, item];
    setVocabulary(updated);
    setNewVocabWord("");
    setNewVocabDef("");
    if (lessonId) {
      meetApi.updateClassroomNotes(lessonId, { vocabulary: updated }).catch(() => {});
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "vocab-add", item }));
      }
    }
  };

  const endLesson = () => {
    if (lesson) completeLesson(lesson.id);
    setEnded(true);
  };

  if (ended) {
    const handleReviewSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!lessonId) return;
      setSubmittingReview(true);
      try {
        await meetApi.submitReview(lessonId, rating, reviewComment);
        setReviewSubmitted(true);
      } catch (err) {
        console.error("Failed to submit review:", err);
      } finally {
        setSubmittingReview(false);
      }
    };

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0E0F13] px-6 text-center text-white">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/20 text-brand-400 ring-1 ring-brand-500/30">
          <Video size={28} />
        </div>
        <h1 className="mt-5 font-display text-3xl font-bold tracking-tight">Lesson completed</h1>
        <p className="mt-2 max-w-md text-sm text-white/60">
          {lesson?.title ?? "Lesson"} · {lesson ? fmt(total) : "60:00"} with <span className="text-white font-medium">{otherName}</span>.
        </p>

        {!iAmTeacher && (
          <div className="mt-8 w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 text-left backdrop-blur-sm">
            {reviewSubmitted ? (
              <div className="flex flex-col items-center py-4 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                  <Check size={22} />
                </div>
                <h3 className="mt-3 font-display text-lg font-semibold text-white">Thank you for your review!</h3>
                <p className="mt-1 text-xs text-white/60">Your feedback helps other students find the right teachers on Liberum Meet.</p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit}>
                <h3 className="font-display text-base font-semibold text-white">Rate your lesson with {otherName.split(" ")[0]}</h3>
                <p className="mt-1 text-xs text-white/50">How was your learning experience today?</p>

                {/* Stars */}
                <div className="mt-4 flex items-center justify-center gap-2 py-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = (hoverRating || rating) >= star;
                    return (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="rounded-lg p-1.5 transition hover:scale-110"
                      >
                        <Star
                          size={28}
                          className={cn(
                            "transition-colors",
                            active ? "fill-[#F5A623] text-[#F5A623]" : "text-white/20 hover:text-white/40"
                          )}
                        />
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3">
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Write a brief note (e.g. helpful explanations, great pronunciation tips, etc.)..."
                    rows={3}
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white placeholder-white/30 outline-none transition focus:border-brand-500 focus:bg-white/10"
                  />
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="rounded-xl bg-brand-500 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-brand-600 disabled:opacity-50"
                  >
                    {submittingReview ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        <div className="mt-8 flex gap-3">
          <Link to="/app/lessons" className="rounded-full bg-brand-500 px-6 py-3 text-sm font-medium transition hover:bg-brand-600">
            Back to My Lessons
          </Link>
          <Link to="/app" className="rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-white/80 transition hover:bg-white/10">
            Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#0E0F13] text-white">
      {/* Top bar */}
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-white/10 px-4">
        <Link to="/app" className="font-display text-[15px] font-bold tracking-tight">
          Liber<span className="text-brand-400">um</span>
          <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/70">Meet</span>
        </Link>
        <span className="hidden h-4 w-px bg-white/15 sm:block" />
        <p className="hidden truncate text-[13px] text-white/60 sm:block">
          {lesson?.title ?? "IELTS Speaking Practice"} · with {otherName}
        </p>
        <div className="ml-auto flex items-center gap-3">
          {!wsConnected && (
            <button
              onClick={() => setReconnectCounter((c) => c + 1)}
              className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-2.5 py-1 text-[11px] font-medium text-amber-300 transition hover:bg-amber-500/30"
            >
              <RefreshCw size={11} className="animate-spin" /> Reconnecting tunnel...
            </button>
          )}
          <span
            className={cn(
              "hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium sm:inline-flex",
              conn === "excellent" && "bg-[#1FAD55]/15 text-[#4ADE80]",
              conn === "good" && "bg-[#F5A623]/15 text-[#FBBF24]",
              conn === "weak" && "bg-danger/15 text-danger"
            )}
          >
            <Signal size={11} /> {conn === "excellent" ? "Excellent connection" : conn === "good" ? "Good connection" : "Weak connection"}
          </span>
          <span className={cn("rounded-full px-3 py-1 font-display text-[13px] font-semibold tabular-nums", remaining <= 600 ? "bg-[#F5A623]/15 text-[#FBBF24]" : "bg-white/10 text-white/85")}>
            {fmt(elapsed)} / {fmt(total)}
          </span>
          {remaining <= 600 && remaining > 300 && (
            <span className="hidden text-[11px] font-medium text-[#FBBF24] md:block">10 min remaining</span>
          )}
          {remaining <= 300 && (
            <span className="hidden animate-pulse text-[11px] font-medium text-[#FBBF24] md:block">5 min remaining</span>
          )}
        </div>
      </header>

      {/* Main */}
      <div className="flex min-h-0 flex-1">
        <div className="relative flex flex-1 flex-col p-3 sm:p-4">
          <div className="grid min-h-0 flex-1 gap-3 sm:gap-4" style={{ gridTemplateRows: "1fr" }}>
            <div className="grid min-h-0 gap-3 sm:grid-cols-2 sm:gap-4">
              {/* Other participant */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-900 via-[#1B1440] to-[#0E0F13] ring-1 ring-white/10">
                {remoteStream && peerConnected ? (
                  <video ref={remoteVideoRef} autoPlay playsInline className="h-full w-full object-cover" />
                ) : (
                  <>
                    <div className="bg-grid-dark absolute inset-0 opacity-30" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <Avatar initials={otherInitials} color="#7B61FF" size="xl" className="h-24 w-24 text-2xl ring-4 ring-white/10" />
                      <div className="mt-4 flex items-end gap-1" aria-hidden>
                        {[0.9, 0.6, 1.1, 0.7, 1.0].map((d, i) => (
                          <span key={i} className="eq-bar h-3.5 w-1 rounded-full bg-brand-400" style={{ animationDelay: `${d * 0.3}s`, animationDuration: `${d}s` }} />
                        ))}
                      </div>
                    </div>
                  </>
                )}
                <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-black/50 px-3 py-1.5 text-xs font-medium backdrop-blur">
                  <span className={cn("h-1.5 w-1.5 rounded-full", peerConnected ? "bg-[#4ADE80]" : "bg-brand-400 animate-pulse")} />
                  {otherName} {iAmTeacher ? "· Student" : "· Teacher"} {peerConnected ? "(Live)" : "(Waiting...)"}
                </div>
                <div className="absolute right-3 top-3 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-medium text-white/70 backdrop-blur">
                  {peerConnected ? "WebRTC P2P" : "1080p"}
                </div>
              </div>

              {/* Self */}
              <div className="relative overflow-hidden rounded-2xl bg-[#14151B] ring-1 ring-white/10">
                {camOn && hasStream ? (
                  <video ref={videoRef} autoPlay playsInline muted className="h-full w-full -scale-x-100 object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#14151B] to-[#1B1440]">
                    <div className="bg-grid-dark absolute inset-0 opacity-30" />
                    <Avatar initials={user?.initials ?? "JT"} color="#1FAD55" size="xl" className="h-20 w-20 ring-4 ring-white/10" />
                  </div>
                )}
                <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-black/50 px-3 py-1.5 text-xs font-medium backdrop-blur">
                  {micOn ? <Mic size={11} className="text-[#4ADE80]" /> : <MicOff size={11} className="text-danger" />}
                  You {iAmTeacher ? "· Teacher" : "· Student"}
                </div>
                {sharing && (
                  <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-brand-500 px-2.5 py-1 text-[10px] font-semibold">
                    <MonitorUp size={11} /> Sharing screen
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="mt-3 flex shrink-0 items-center justify-center gap-2.5 sm:mt-4 sm:gap-3">
            <CtrlButton active={micOn} onClick={() => setMicOn((v) => !v)} label={micOn ? "Mute" : "Unmute"} offIcon={<MicOff size={19} />} onIcon={<Mic size={19} />} danger={!micOn} />
            <CtrlButton active={camOn} onClick={() => setCamOn((v) => !v)} label={camOn ? "Stop video" : "Start video"} offIcon={<VideoOff size={19} />} onIcon={<Video size={19} />} danger={!camOn} />
            <CtrlButton active={sharing} onClick={handleToggleShare} label={sharing ? "Stop sharing" : "Share screen"} onIcon={<MonitorUp size={19} />} highlight={sharing} />
            {/* Superpower Control Buttons */}
            <CtrlButton
              active={sideOpen && activeSideTab === "whiteboard"}
              onClick={() => {
                if (sideOpen && activeSideTab === "whiteboard") {
                  setSideOpen(false);
                } else {
                  setActiveSideTab("whiteboard");
                  setSideOpen(true);
                  setTimeout(redrawCanvas, 50);
                }
              }}
              label="Interactive Whiteboard"
              onIcon={<PenTool size={18} />}
              highlight={sideOpen && activeSideTab === "whiteboard"}
            />
            <CtrlButton
              active={sideOpen && activeSideTab === "notes"}
              onClick={() => {
                if (sideOpen && activeSideTab === "notes") {
                  setSideOpen(false);
                } else {
                  setActiveSideTab("notes");
                  setSideOpen(true);
                }
              }}
              label="Lesson Notes & Vocabulary"
              onIcon={<BookOpen size={18} />}
              highlight={sideOpen && activeSideTab === "notes"}
            />
            <CtrlButton
              active={sideOpen && activeSideTab === "ai"}
              onClick={() => {
                if (sideOpen && activeSideTab === "ai") {
                  setSideOpen(false);
                } else {
                  setActiveSideTab("ai");
                  setSideOpen(true);
                }
              }}
              label="AI Copilot & Summary"
              onIcon={<Sparkles size={18} className="text-brand-300" />}
              highlight={sideOpen && activeSideTab === "ai"}
            />
            <CtrlButton
              active={sideOpen && activeSideTab === "chat"}
              onClick={() => {
                if (sideOpen && activeSideTab === "chat") {
                  setSideOpen(false);
                } else {
                  setActiveSideTab("chat");
                  setSideOpen(true);
                }
              }}
              label="Chat"
              onIcon={
                <span className="relative">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg>
                  {msgs.some((m) => m.from === "them") && (!sideOpen || activeSideTab !== "chat") && <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-brand-400" />}
                </span>
              }
              highlight={sideOpen && activeSideTab === "chat"}
            />
            <button
              onClick={endLesson}
              className="ml-1 flex h-12 items-center gap-2 rounded-full bg-danger px-5 text-sm font-semibold text-white transition hover:bg-[#e04c45] active:scale-[0.97] sm:ml-3"
            >
              <PhoneOff size={17} /> <span className="hidden sm:inline">{iAmTeacher ? "End lesson" : "Leave"}</span>
            </button>
          </div>
        </div>

        {/* Superpowers Panel */}
        {sideOpen && (
          <aside className="hidden w-[380px] shrink-0 flex-col border-l border-white/10 bg-[#14151B] md:flex">
            {/* Tabs Header */}
            <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 px-3">
              <div className="flex items-center gap-1">
                {(["chat", "whiteboard", "notes", "ai"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveSideTab(tab);
                      if (tab === "whiteboard") setTimeout(redrawCanvas, 50);
                    }}
                    className={cn(
                      "rounded-lg px-2.5 py-1 text-xs font-medium capitalize transition",
                      activeSideTab === tab ? "bg-brand-500 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    {tab === "ai" ? "AI Copilot" : tab}
                  </button>
                ))}
              </div>
              <button onClick={() => setSideOpen(false)} className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white">
                <X size={15} />
              </button>
            </div>

            {/* TAB 1: CHAT */}
            {activeSideTab === "chat" && (
              <div className="flex min-h-0 flex-1 flex-col">
                <div className="flex-1 space-y-4 overflow-y-auto p-4">
                  {msgs.map((m) => (
                    <div key={m.id} className={cn("flex flex-col", m.from === "me" && "items-end")}>
                      <p className="mb-1 text-[10px] font-medium text-white/40">
                        {m.name} · {m.time}
                      </p>
                      <div
                        className={cn(
                          "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed",
                          m.from === "me" ? "rounded-br-md bg-brand-500 text-white" : "rounded-bl-md bg-white/10 text-white/90"
                        )}
                      >
                        {m.text}
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <div className="shrink-0 border-t border-white/10 p-3">
                  <div className="flex items-center gap-2 rounded-full bg-white/10 py-1 pl-4 pr-1">
                    <input
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && send()}
                      placeholder="Message…"
                      className="min-w-0 flex-1 bg-transparent text-[13px] text-white outline-none placeholder:text-white/40"
                    />
                    <button onClick={send} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500 transition hover:bg-brand-600" aria-label="Send">
                      <Send size={13} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: WHITEBOARD */}
            {activeSideTab === "whiteboard" && (
              <div className="flex min-h-0 flex-1 flex-col p-3">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setTool("pen")}
                      className={cn("rounded-lg p-1.5 transition", tool === "pen" ? "bg-brand-500 text-white" : "text-white/60 hover:bg-white/10")}
                      title="Pen"
                    >
                      <PenTool size={15} />
                    </button>
                    <button
                      onClick={() => setTool("eraser")}
                      className={cn("rounded-lg p-1.5 transition", tool === "eraser" ? "bg-brand-500 text-white" : "text-white/60 hover:bg-white/10")}
                      title="Eraser"
                    >
                      <Eraser size={15} />
                    </button>
                    <div className="mx-1 h-4 w-px bg-white/15" />
                    {["#7B61FF", "#4ADE80", "#FBBF24", "#EF4444", "#FFFFFF"].map((c) => (
                      <button
                        key={c}
                        onClick={() => { setPenColor(c); setTool("pen"); }}
                        className={cn("h-4 w-4 rounded-full transition", penColor === c && tool === "pen" ? "ring-2 ring-white ring-offset-1 ring-offset-[#14151B]" : "opacity-80")}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <button
                    onClick={clearWhiteboard}
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-white/50 transition hover:bg-white/10 hover:text-danger"
                    title="Clear Board"
                  >
                    <RotateCcw size={12} /> Clear
                  </button>
                </div>
                <div className="relative min-h-0 flex-1 rounded-xl border border-white/10 bg-[#0E0F13] overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    width={356}
                    height={480}
                    onMouseDown={startDrawing}
                    onMouseMove={drawMove}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    className="h-full w-full cursor-crosshair touch-none"
                  />
                </div>
                <p className="mt-2 text-center text-[11px] text-white/40">Both teacher & student can draw together in real time.</p>
              </div>
            )}

            {/* TAB 3: NOTES & VOCABULARY */}
            {activeSideTab === "notes" && (
              <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4 space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <p className="font-display text-xs font-semibold text-white/80">Lesson Notes</p>
                    <button
                      onClick={handleSaveNotes}
                      disabled={savingNotes}
                      className="rounded-lg bg-brand-500/20 px-2.5 py-1 text-[11px] font-medium text-brand-300 transition hover:bg-brand-500/30"
                    >
                      {savingNotes ? "Saving..." : "Save Notes"}
                    </button>
                  </div>
                  <textarea
                    value={notesText}
                    onChange={(e) => setNotesText(e.target.value)}
                    rows={6}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs leading-relaxed text-white outline-none focus:border-brand-500"
                    placeholder="Write key lesson notes, grammar corrections..."
                  />
                </div>

                <div>
                  <p className="font-display text-xs font-semibold text-white/80">Vocabulary Bank ({vocabulary.length})</p>
                  <div className="mt-2 space-y-2">
                    {vocabulary.map((v, i) => (
                      <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-brand-300">{v.word}</span>
                          <button
                            onClick={() => {
                              const updated = vocabulary.filter((_, idx) => idx !== i);
                              setVocabulary(updated);
                              if (lessonId) meetApi.updateClassroomNotes(lessonId, { vocabulary: updated }).catch(() => {});
                            }}
                            className="text-white/30 hover:text-danger"
                          >
                            <X size={12} />
                          </button>
                        </div>
                        <p className="mt-1 text-white/70">{v.definition}</p>
                        {v.example && <p className="mt-1 italic text-white/40">"{v.example}"</p>}
                      </div>
                    ))}
                  </div>

                  {/* Add Vocab Inline */}
                  <div className="mt-3 flex gap-2">
                    <input
                      value={newVocabWord}
                      onChange={(e) => setNewVocabWord(e.target.value)}
                      placeholder="New word"
                      className="h-8 flex-1 rounded-lg border border-white/10 bg-white/5 px-2.5 text-xs text-white outline-none focus:border-brand-500"
                    />
                    <input
                      value={newVocabDef}
                      onChange={(e) => setNewVocabDef(e.target.value)}
                      placeholder="Definition"
                      className="h-8 flex-1 rounded-lg border border-white/10 bg-white/5 px-2.5 text-xs text-white outline-none focus:border-brand-500"
                    />
                    <button
                      onClick={addVocabItem}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-white hover:bg-brand-600"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                <div>
                  <p className="font-display text-xs font-semibold text-white/80">Homework Task</p>
                  <textarea
                    value={homework}
                    onChange={(e) => setHomework(e.target.value)}
                    rows={2}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs leading-relaxed text-white outline-none focus:border-brand-500"
                  />
                </div>
              </div>
            )}

            {/* TAB 4: AI COPILOT */}
            {activeSideTab === "ai" && (
              <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4 space-y-4">
                <div className="rounded-xl bg-gradient-to-br from-brand-600/20 to-brand-900/10 border border-brand-500/30 p-3.5">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-brand-400" />
                    <span className="font-display text-xs font-bold text-white">Liberum AI Lesson Copilot</span>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-white/70">
                    Analyze the entire lesson conversation and notes to extract grammar assessments, fluency markers, and personalized vocabulary recommendations.
                  </p>
                  <button
                    onClick={handleRunAiAnalysis}
                    disabled={analyzingAi}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 py-2 text-xs font-semibold text-white transition hover:bg-brand-600 disabled:opacity-50"
                  >
                    <Wand2 size={13} />
                    {analyzingAi ? "Analyzing session..." : "Generate AI Lesson Summary"}
                  </button>
                </div>

                {aiSummary ? (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 text-xs leading-relaxed text-white/90 whitespace-pre-line">
                    {aiSummary}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-white/40">
                    <BookOpen size={24} className="mb-2 opacity-50" />
                    <p className="text-xs">Click above to generate an instant lesson summary.</p>
                  </div>
                )}
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}

function CtrlButton({
  active, onClick, label, onIcon, offIcon, danger, highlight,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  onIcon: React.ReactNode;
  offIcon?: React.ReactNode;
  danger?: boolean;
  highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cn(
        "flex h-12 w-12 items-center justify-center rounded-full transition active:scale-95",
        danger ? "bg-danger text-white" : highlight ? "bg-brand-500 text-white" : "bg-white/10 text-white/85 hover:bg-white/20"
      )}
    >
      {active || !offIcon ? onIcon : offIcon}
    </button>
  );
}
