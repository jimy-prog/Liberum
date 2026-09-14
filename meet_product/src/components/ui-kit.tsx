import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from "react";
import { Link } from "react-router";
import { cn } from "@/lib/utils";

/* ---------------- Buttons ---------------- */
type BtnVariant = "primary" | "ink" | "outline" | "ghost" | "white" | "danger";
type BtnSize = "sm" | "md" | "lg";

const btnBase =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";

const btnVariants: Record<BtnVariant, string> = {
  primary: "bg-brand-500 text-white hover:bg-brand-600 shadow-[0_8px_24px_-8px_rgba(123,97,255,0.55)]",
  ink: "bg-ink text-white hover:bg-ink-soft",
  outline: "border border-line bg-white text-ink hover:border-ink-400 hover:bg-cloud",
  ghost: "text-ink-500 hover:bg-mist hover:text-ink",
  white: "bg-white text-ink hover:bg-mist shadow-sm",
  danger: "bg-danger text-white hover:bg-[#e04c45]",
};

const btnSizes: Record<BtnSize, string> = {
  sm: "h-8 px-3.5 text-[13px]",
  md: "h-10 px-5 text-sm",
  lg: "h-12 px-7 text-[15px]",
};

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant;
  size?: BtnSize;
}

export const Btn = forwardRef<HTMLButtonElement, BtnProps>(function Btn(
  { variant = "primary", size = "md", className, ...props },
  ref
) {
  return <button ref={ref} className={cn(btnBase, btnVariants[variant], btnSizes[size], className)} {...props} />;
});

export function BtnLink({
  to,
  variant = "primary",
  size = "md",
  className,
  children,
}: {
  to: string;
  variant?: BtnVariant;
  size?: BtnSize;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link to={to} className={cn(btnBase, btnVariants[variant], btnSizes[size], className)}>
      {children}
    </Link>
  );
}

/* ---------------- Badge ---------------- */
type BadgeTone = "brand" | "ink" | "green" | "amber" | "red" | "gray" | "outline";
const badgeTones: Record<BadgeTone, string> = {
  brand: "bg-brand-50 text-brand-600 ring-brand-200",
  ink: "bg-ink text-white ring-ink",
  green: "bg-[#E9F9EF] text-[#157A3E] ring-[#BDE8CD]",
  amber: "bg-[#FFF6E5] text-[#9A6700] ring-[#F3DCA8]",
  red: "bg-[#FFEDEC] text-[#C0352C] ring-[#F6C9C5]",
  gray: "bg-mist text-ink-500 ring-line",
  outline: "bg-white text-ink-500 ring-line",
};

export function Badge({ tone = "gray", className, children }: { tone?: BadgeTone; className?: string; children: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1", badgeTones[tone], className)}>
      {children}
    </span>
  );
}

/* ---------------- Avatar ---------------- */
export function Avatar({
  initials,
  color = "#7B61FF",
  size = "md",
  className,
}: {
  initials: string;
  color?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const sizes = {
    sm: "h-7 w-7 text-[10px]",
    md: "h-9 w-9 text-xs",
    lg: "h-12 w-12 text-sm",
    xl: "h-20 w-20 text-xl",
  };
  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center rounded-full font-display font-semibold text-white", sizes[size], className)}
      style={{ background: `linear-gradient(135deg, ${color}, ${color}CC)` }}
    >
      {initials}
    </span>
  );
}

/* ---------------- Card ---------------- */
export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("rounded-2xl border border-line bg-white shadow-[0_1px_2px_rgba(14,15,19,0.04)]", className)}>
      {children}
    </div>
  );
}

/* ---------------- Input ---------------- */
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-xl border border-line bg-white px-3.5 text-sm text-ink outline-none transition placeholder:text-ink-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10",
        className
      )}
      {...props}
    />
  );
});

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-ink">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-xs text-ink-400">{hint}</span>}
    </label>
  );
}

/* ---------------- Eyebrow / Section heading ---------------- */
export function Eyebrow({ children, center }: { children: ReactNode; center?: boolean }) {
  return (
    <div className={cn("flex items-center gap-3", center && "justify-center")}>
      <span className="h-px w-6 bg-brand-500/60" />
      <span className="eyebrow">{children}</span>
      {center && <span className="h-px w-6 bg-brand-500/60" />}
    </div>
  );
}

/* ---------------- Empty state ---------------- */
export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-cloud px-6 py-14 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-500">{icon}</div>
      <p className="font-display text-[15px] font-semibold text-ink">{title}</p>
      <p className="mt-1 max-w-xs text-sm text-ink-400">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ---------------- Google button (Liberum auth) ---------------- */
export function GoogleButton() {
  return (
    <button
      type="button"
      className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-line bg-white text-sm font-medium text-ink transition hover:bg-cloud active:scale-[0.99]"
    >
      <svg width="17" height="17" viewBox="0 0 18 18">
        <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z" />
        <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z" />
        <path fill="#FBBC05" d="M3.97 10.72A5.41 5.41 0 0 1 3.68 9c0-.6.1-1.18.28-1.72V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z" />
        <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59A9 9 0 0 0 .96 4.95l3.01 2.33C6.68 5.16 7.66 3.58 9 3.58Z" />
      </svg>
      Continue with Google
    </button>
  );
}
