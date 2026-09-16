import { useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Check } from "lucide-react";
import { LiberumLogo } from "@/components/brand";
import { Btn, Field, GoogleButton, Input } from "@/components/ui-kit";
import { MockMark } from "./components";
import { useMock } from "./store";
import { cn } from "@/lib/utils";
import type { Role, User } from "@/lib/types";
import { signInWithEmailAndPassword, signInWithPopup, createUserWithEmailAndPassword } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";


function AuthLayout({ children, title, subtitle }: { children: ReactNode; title: string; subtitle: string }) {
  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800 p-12 text-white lg:flex">
        <div className="bg-grid-dark absolute inset-0 opacity-40" />
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <span className="font-display text-[22px] font-bold tracking-tight text-white">
            Liber<span className="text-white/70">um</span>
          </span>
          <MockMark dark />
        </div>
        <div className="relative">
          <p className="font-display text-[44px] font-bold leading-[1.08] tracking-tight">
            Practice IELTS
            <br />
            like the <span className="text-brand-200">real thing.</span>
          </p>
          <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-white/75">
            Realistic computer-delivered mock tests, honest analytics, and one Liberum account across the whole ecosystem.
          </p>
          <div className="mt-10 space-y-3.5">
            {["Full Listening, Reading, Writing & Speaking", "Band scores with per-skill breakdown", "Progress you can actually see"].map((t) => (
              <div key={t} className="flex items-center gap-3 text-sm text-white/85">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15"><Check size={11} strokeWidth={3} /></span>
                {t}
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-xs text-white/50">© 2026 Liberum · mock.liberum.uz</p>
      </div>
      <div className="flex flex-1 flex-col bg-cloud">
        <div className="flex items-center justify-between p-6">
          <Link to="/" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-500 transition hover:text-ink">
            <ArrowLeft size={14} /> Back to Mock
          </Link>
          <div className="flex items-center gap-2 lg:hidden">
            <LiberumLogo className="text-[18px]" />
            <MockMark />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center px-6 pb-16">
          <div className="w-full max-w-[400px] animate-fade-up">
            <h1 className="font-display text-[28px] font-bold tracking-tight text-ink">{title}</h1>
            <p className="mt-2 text-sm leading-relaxed text-ink-500">{subtitle}</p>
            <div className="mt-8">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MockLoginPage() {
  const { signIn, clearHistory } = useMock();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

    const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    let success = false;
    let backendUser = null;

    try {
      // 1. Try Firebase if it's an email
      if (email.includes("@")) {
        try {
          const cred = await signInWithEmailAndPassword(auth, email, password);
          const idToken = await cred.user.getIdToken();
          
          const fbRes = await fetch("/api/auth/firebase", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken, role: "student" }) // role ignored for existing users
          });
          
          if (fbRes.ok) {
            success = true;
          } else {
             console.warn("Firebase token rejected by backend");
          }
        } catch (err: any) {
          console.warn("Firebase login failed, falling back to classic", err);
        }
      }

      // 2. Fallback to Classic Backend Login
      if (!success) {
        const getRes = await fetch("/login");
        const html = await getRes.text();
        const match = html.match(/id="csrf_token"\s+value="([^"]+)"/);
        const csrfToken = match ? match[1] : "";

        const res = await fetch("/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier: email, password: password, csrf_token: csrfToken })
        });
        
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
           const data = await res.json();
           if (res.ok) {
              success = true;
           } else {
              throw new Error(data.detail || "Invalid credentials");
           }
        } else {
           throw new Error("Invalid response from backend (Check CORS or CSRF)");
        }
      }

      // 3. Fetch synced profile info from /api/auth/me
      if (success) {
        const meRes = await fetch("/api/auth/me");
        if (meRes.ok) {
           backendUser = await meRes.json();
        } else {
           // Fallback to minimal profile if /me fails for some reason
           backendUser = { id: "user", username: email, email: email, full_name: email.split("@")[0], role: "student" };
        }
        
        // Map roles: owner/admin -> teacher view in Mock app
        const rawRole = backendUser.role?.toLowerCase() || "student";
        const isTeacherView = ["teacher", "owner", "admin"].includes(rawRole);
        
        if (["owner", "admin"].includes(rawRole)) {
            clearHistory(); // clear dummy data for owners
        }

        const name = backendUser.full_name || backendUser.username || email;
        const initials = name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();

        const mockUser: User = {
            id: backendUser.id.toString(),
            name: name,
            email: backendUser.email || email,
            role: (isTeacherView ? "teacher" : "student") as Role,
            initials: initials || "ME"
        };
        
        signIn(mockUser);
        navigate("/app");
      }
    } catch (err: any) {
      setError(err.message || "Failed to log in");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const idToken = await cred.user.getIdToken();
      
      const fbRes = await fetch("/api/auth/firebase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, role: "student" })
      });
      
      if (!fbRes.ok) throw new Error("Backend authentication failed");
      
      const meRes = await fetch("/api/auth/me");
      let backendUser = null;
      if (meRes.ok) {
         backendUser = await meRes.json();
      } else {
         backendUser = { id: cred.user.uid, username: cred.user.email, email: cred.user.email, full_name: cred.user.displayName, role: "student" };
      }
      
      const rawRole = backendUser.role?.toLowerCase() || "student";
      const isTeacherView = ["teacher", "owner", "admin"].includes(rawRole);
      
      if (["owner", "admin"].includes(rawRole)) {
          clearHistory(); // clear dummy data for owners
      }

      const name = backendUser.full_name || backendUser.username || cred.user.email || "User";
      const initials = name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();

      const mockUser: User = {
          id: backendUser.id.toString(),
          name: name,
          email: backendUser.email || cred.user.email || "",
          role: (isTeacherView ? "teacher" : "student") as Role,
          initials: initials || "ME"
      };
      
      signIn(mockUser);
      navigate("/app");
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Log in with your Liberum account to continue to Mock.">
      <GoogleButton onClick={handleGoogle} />
      <div className="my-6 flex items-center gap-4">
        <span className="h-px flex-1 bg-line" />
        <span className="text-[11px] font-semibold uppercase tracking-widest text-ink-400">or</span>
        <span className="h-px flex-1 bg-line" />
      </div>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Email or Username"><Input type="text" required placeholder="you@example.com or username" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
        <Field label="Password"><Input type="password" required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Btn type="submit" className="w-full" size="lg" disabled={loading}>{loading ? "Logging in..." : "Log in"}</Btn>
      </form>
      <div className="mt-6 rounded-xl border border-line bg-white p-3.5 text-center">
        <p className="text-[13px] text-ink-500">
          Exploring?{" "}
          <button className="font-semibold text-brand-600 hover:underline" onClick={() => { signIn("student"); navigate("/app"); }}>Demo as Student</button>{" · "}
          <button className="font-semibold text-brand-600 hover:underline" onClick={() => { signIn("teacher"); navigate("/app"); }}>Demo as Teacher</button>
        </p>
      </div>
      <p className="mt-6 text-center text-[13px] text-ink-500">
        New to Liberum? <Link to="/register" className="font-semibold text-brand-600 hover:underline">Create an account</Link>
      </p>
    </AuthLayout>
  );
}

export function MockRegisterPage() {
  const { signIn } = useMock();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. If Firebase is configured and user typed email, create Firebase user first
      if (email.includes("@")) {
        try {
          await createUserWithEmailAndPassword(auth, email, password);
        } catch (fbErr: any) {
          if (fbErr.code === "auth/email-already-in-use") {
            try {
              await signInWithEmailAndPassword(auth, email, password);
            } catch {
              // ignore and fallback
            }
          }
        }
      }

      // 2. Call backend /api/mock/register
      const res = await fetch("/api/mock/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
          full_name: fullName.trim(),
          role: role,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Registration failed. Please check your details.");
      }

      if (data.user) {
        signIn(data.user);
        navigate("/app");
      } else {
        signIn(role);
        navigate("/app");
      }
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const idToken = await cred.user.getIdToken();

      const fbRes = await fetch("/api/auth/firebase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, role: role }),
      });

      let backendUser = null;
      if (fbRes.ok) {
        const meRes = await fetch("/api/auth/me");
        if (meRes.ok) {
          backendUser = await meRes.json();
        }
      }

      const name = backendUser?.full_name || cred.user.displayName || fullName || "Student";
      const initials = name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();

      const mockUser = {
        id: backendUser?.id?.toString() || cred.user.uid,
        name: name,
        email: backendUser?.email || cred.user.email || email,
        role: role,
        initials: initials || "ME",
      };

      signIn(mockUser);
      navigate("/app");
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="One Liberum account for Meet, Studio, Mock, and AI.">
      <GoogleButton onClick={handleGoogle} />
      <div className="my-6 flex items-center gap-4">
        <span className="h-px flex-1 bg-line" />
        <span className="text-[11px] font-semibold uppercase tracking-widest text-ink-400">or</span>
        <span className="h-px flex-1 bg-line" />
      </div>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Full name"><Input required placeholder="Aziza Karimova" value={fullName} onChange={(e) => setFullName(e.target.value)} /></Field>
        <Field label="Email or Username"><Input type="text" required placeholder="you@example.com or username" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
        <Field label="Password" hint="At least 8 characters."><Input type="password" required minLength={8} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
        <div>
          <span className="mb-1.5 block text-[13px] font-medium text-ink">I am a</span>
          <div className="grid grid-cols-2 gap-3">
            {([["student", "Student", "I'm preparing for IELTS"], ["teacher", "Teacher", "I assess students"]] as const).map(([v, label, desc]) => (
              <button key={v} type="button" onClick={() => setRole(v)}
                className={cn("rounded-xl border p-3.5 text-left transition active:scale-[0.98]",
                  role === v ? "border-brand-500 bg-brand-50 ring-4 ring-brand-500/10" : "border-line bg-white hover:border-ink-400")}>
                <span className="block text-sm font-semibold text-ink">{label}</span>
                <span className="mt-0.5 block text-xs text-ink-400">{desc}</span>
              </button>
            ))}
          </div>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Btn type="submit" className="w-full" size="lg" disabled={loading}>{loading ? "Creating..." : "Create account"}</Btn>
      </form>
      <p className="mt-6 text-center text-[13px] text-ink-500">
        Already have a Liberum account? <Link to="/login" className="font-semibold text-brand-600 hover:underline">Log in</Link>
      </p>
    </AuthLayout>
  );
}
