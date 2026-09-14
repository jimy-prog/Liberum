import { useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Check, GraduationCap, Presentation } from "lucide-react";
import { LiberumLogo, MeetMark } from "@/components/brand";
import { Btn, BtnLink, Field, GoogleButton, Input } from "@/components/ui-kit";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/types";

function AuthLayout({ children, title, subtitle }: { children: ReactNode; title: string; subtitle: string }) {
  return (
    <div className="flex min-h-screen">
      {/* Brand panel */}
      <div className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800 p-12 text-white lg:flex">
        <div className="bg-grid-dark absolute inset-0 opacity-40" />
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-brand-300/30 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <LiberumLogo dark />
          <MeetMark dark />
        </div>
        <div className="relative">
          <p className="font-display text-[44px] font-bold leading-[1.08] tracking-tight">
            Teach. Learn.
            <br />
            Meet.
          </p>
          <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-white/75">
            One Liberum account connects you to Meet, Studio, Mock, and AI — the ecosystem for modern education.
          </p>
          <div className="mt-10 space-y-3.5">
            {["Discover verified teachers", "Book lessons around your schedule", "Learn in a classroom built for education"].map((t) => (
              <div key={t} className="flex items-center gap-3 text-sm text-white/85">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15">
                  <Check size={11} strokeWidth={3} />
                </span>
                {t}
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-xs text-white/50">© 2026 Liberum · meet.liberum.uz</p>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 flex-col bg-cloud">
        <div className="flex items-center justify-between p-6">
          <Link to="/" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-500 transition hover:text-ink">
            <ArrowLeft size={14} /> Back to Meet
          </Link>
          <div className="flex items-center gap-2 lg:hidden">
            <LiberumLogo className="text-[18px]" />
            <MeetMark />
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

export function LoginPage() {
  const { loginWithBackend, signIn } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await loginWithBackend(email, password);
      navigate("/app");
    } catch (err: any) {
      setError(err.message || "Failed to log in. Check your email and password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Log in with your Liberum account to continue to Meet.">
      <GoogleButton />
      <div className="my-6 flex items-center gap-4">
        <span className="h-px flex-1 bg-line" />
        <span className="text-[11px] font-semibold uppercase tracking-widest text-ink-400">or</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-600 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={submit} className="space-y-4">
        <Field label="Email">
          <Input type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Password">
          <Input type="password" required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-[13px] font-medium text-brand-600 hover:underline">
            Forgot password?
          </Link>
        </div>
        <Btn type="submit" className="w-full" size="lg" disabled={submitting}>
          {submitting ? "Logging in..." : "Log in"}
        </Btn>
      </form>
      <div className="mt-6 rounded-xl border border-line bg-white p-3.5 text-center">
        <p className="text-[13px] text-ink-500">
          Exploring?{" "}
          <button className="font-semibold text-brand-600 hover:underline" onClick={() => { signIn("student"); navigate("/app"); }}>
            Demo as Student
          </button>{" "}
          ·{" "}
          <button className="font-semibold text-brand-600 hover:underline" onClick={() => { signIn("teacher"); navigate("/app"); }}>
            Demo as Teacher
          </button>
        </p>
      </div>
      <p className="mt-6 text-center text-[13px] text-ink-500">
        New to Liberum?{" "}
        <Link to="/register" className="font-semibold text-brand-600 hover:underline">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}

export function RegisterPage() {
  const { registerWithBackend } = useApp();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await registerWithBackend(name, email, password, role);
      navigate("/app");
    } catch (err: any) {
      setError(err.message || "Registration failed. Try a different email.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="One Liberum account for Meet, Studio, Mock, and AI.">
      <GoogleButton />
      <div className="my-6 flex items-center gap-4">
        <span className="h-px flex-1 bg-line" />
        <span className="text-[11px] font-semibold uppercase tracking-widest text-ink-400">or</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-600 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={submit} className="space-y-4">
        <Field label="Full name">
          <Input required placeholder="Aziza Karimova" value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Email">
          <Input type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Password" hint="At least 8 characters.">
          <Input type="password" required minLength={8} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        <div>
          <span className="mb-1.5 block text-[13px] font-medium text-ink">I am a</span>
          <div className="grid grid-cols-2 gap-3">
            {(
              [
                { value: "student", label: "Student", desc: "I want to learn", icon: GraduationCap },
                { value: "teacher", label: "Teacher", desc: "I want to teach", icon: Presentation },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRole(opt.value)}
                className={cn(
                  "flex flex-col items-start gap-1 rounded-xl border p-3.5 text-left transition active:scale-[0.98]",
                  role === opt.value
                    ? "border-brand-500 bg-brand-50 ring-4 ring-brand-500/10"
                    : "border-line bg-white hover:border-ink-400"
                )}
              >
                <opt.icon size={17} className={role === opt.value ? "text-brand-600" : "text-ink-400"} />
                <span className="mt-1 text-sm font-semibold text-ink">{opt.label}</span>
                <span className="text-xs text-ink-400">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>
        <Btn type="submit" className="w-full" size="lg" disabled={submitting}>
          {submitting ? "Creating account..." : "Create account"}
        </Btn>
      </form>
      <p className="mt-6 text-center text-[13px] text-ink-500">
        Already have a Liberum account?{" "}
        <Link to="/login" className="font-semibold text-brand-600 hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  return (
    <AuthLayout title="Reset your password" subtitle="We'll email you a secure link to reset your password.">
      {sent ? (
        <div className="rounded-2xl border border-line bg-white p-6 text-center">
          <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#E9F9EF] text-[#157A3E]">
            <Check size={20} />
          </div>
          <p className="font-display text-[15px] font-semibold text-ink">Check your inbox</p>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-500">
            If an account exists for this email, a reset link is on its way.
          </p>
          <BtnLink to="/login" variant="outline" className="mt-5 w-full">
            Back to log in
          </BtnLink>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
          className="space-y-4"
        >
          <Field label="Email">
            <Input type="email" required placeholder="you@example.com" />
          </Field>
          <Btn type="submit" className="w-full" size="lg">
            Send reset link
          </Btn>
          <p className="text-center text-[13px] text-ink-500">
            Remembered it?{" "}
            <Link to="/login" className="font-semibold text-brand-600 hover:underline">
              Log in
            </Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}
