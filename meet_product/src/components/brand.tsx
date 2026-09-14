import { Link } from "react-router";
import { cn } from "@/lib/utils";

export function LiberumLogo({
  className,
  dark = false,
  to = "/",
}: {
  className?: string;
  dark?: boolean;
  to?: string;
}) {
  return (
    <Link to={to} className={cn("inline-flex items-baseline gap-1.5 font-display text-[22px] font-bold tracking-tight", className)}>
      <span className={dark ? "text-white" : "text-ink"}>
        Liber<span className="text-brand-500">um</span>
      </span>
    </Link>
  );
}

export function MeetMark({ dark = false, className }: { dark?: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-display text-[11px] font-semibold uppercase tracking-[0.14em]",
        dark ? "border-white/20 bg-white/10 text-white" : "border-brand-200 bg-brand-50 text-brand-600",
        className
      )}
    >
      Meet
    </span>
  );
}

/** Browser chrome frame used to present real product screens. */
export function BrowserFrame({
  url,
  children,
  className,
}: {
  url: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border border-line bg-white shadow-[0_24px_80px_-24px_rgba(14,15,19,0.25)]", className)}>
      <div className="flex items-center gap-3 border-b border-line bg-cloud px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
        </div>
        <div className="flex flex-1 justify-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[11px] font-medium text-ink-400 ring-1 ring-line">
            <svg width="9" height="10" viewBox="0 0 9 10" fill="none"><path d="M7.5 4.5H7V3a2.5 2.5 0 0 0-5 0v1.5h-.5A.5.5 0 0 0 1 5v4a.5.5 0 0 0 .5.5h6a.5.5 0 0 0 .5-.5V5a.5.5 0 0 0-.5-.5ZM3 3a1.5 1.5 0 1 1 3 0v1.5H3V3Z" fill="currentColor"/></svg>
            {url}
          </span>
        </div>
        <div className="w-[52px]" />
      </div>
      {children}
    </div>
  );
}
