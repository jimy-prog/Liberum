import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import {
  Mic, MicOff, MonitorUp, MoreVertical, PhoneOff, Send, Signal,
  Video, VideoOff, X,
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

const seedChat: ChatMsg[] = [
  { id: 1, from: "them", name: "Aziza", text: "Salom Jasur! Can you hear me well?", time: "17:31" },
  { id: 2, from: "me", name: "You", text: "Yes, perfectly. Ready when you are.", time: "17:31" },
  { id: 3, from: "them", name: "Aziza", text: "Great. Today we'll do a full Part 2 + Part 3 mock. I'll time you and note your fluency markers.", time: "17:32" },
];

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
  const [chatOpen, setChatOpen] = useState(true);
  const [elapsed, setElapsed] = useState(11 * 60 + 12); // mid-lesson
  const [msgs, setMsgs] = useState<ChatMsg[]>(seedChat);
  const [draft, setDraft] = useState("");
  const [ended, setEnded] = useState(false);
  const [conn, setConn] = useState<"excellent" | "good" | "weak">("excellent");

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

  // WebRTC ICE Servers Configuration (Google STUN)
  const rtcConfig: RTCConfiguration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
    ],
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

        pc.onicecandidate = (event) => {
          if (event.candidate && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "ice-candidate", candidate: event.candidate }));
          }
        };

        ws.onmessage = async (evt) => {
          try {
            const data = JSON.parse(evt.data);
            if (data.type === "peer-joined") {
              // Create Offer
              const offer = await pc.createOffer();
              await pc.setLocalDescription(offer);
              ws.send(JSON.stringify({ type: "sdp-offer", sdp: offer }));
            } else if (data.type === "sdp-offer") {
              // Remote peer sent offer, create answer
              await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              ws.send(JSON.stringify({ type: "sdp-answer", sdp: answer }));
            } else if (data.type === "sdp-answer") {
              // Remote peer accepted our offer
              await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
            } else if (data.type === "ice-candidate") {
              // Add ICE Candidate
              if (data.candidate) {
                await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
              }
            } else if (data.type === "peer-left") {
              setPeerConnected(false);
              setRemoteStream(null);
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
  }, [lessonId]);

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
  }, [msgs, chatOpen]);

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

  const endLesson = () => {
    if (lesson) completeLesson(lesson.id);
    setEnded(true);
  };

  if (ended) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-ink px-6 text-center text-white">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-500/20 text-brand-300">
          <Video size={26} />
        </div>
        <h1 className="mt-6 font-display text-3xl font-bold tracking-tight">Lesson completed</h1>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/60">
          {lesson?.title ?? "Lesson"} · {lesson ? fmt(total) : "60:00"} minutes with {otherName}. The lesson is marked as completed for both of you.
        </p>
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
            <CtrlButton active={chatOpen} onClick={() => setChatOpen((v) => !v)} label="Chat" onIcon={
              <span className="relative">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg>
                {msgs.some((m) => m.from === "them") && !chatOpen && <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-brand-400" />}
              </span>
            } highlight={chatOpen} />
            <button className="hidden h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white/80 transition hover:bg-white/20 sm:flex" aria-label="More options">
              <MoreVertical size={18} />
            </button>
            <button
              onClick={endLesson}
              className="ml-1 flex h-12 items-center gap-2 rounded-full bg-danger px-5 text-sm font-semibold text-white transition hover:bg-[#e04c45] active:scale-[0.97] sm:ml-3"
            >
              <PhoneOff size={17} /> <span className="hidden sm:inline">{iAmTeacher ? "End lesson" : "Leave"}</span>
            </button>
          </div>
        </div>

        {/* Chat panel */}
        {chatOpen && (
          <aside className="hidden w-[320px] shrink-0 flex-col border-l border-white/10 bg-[#14151B] md:flex">
            <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 px-4">
              <p className="font-display text-sm font-semibold">Lesson chat</p>
              <button onClick={() => setChatOpen(false)} className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white">
                <X size={15} />
              </button>
            </div>
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
