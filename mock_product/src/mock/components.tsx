import { cn } from "@/lib/utils";

export function MockMark({ dark = false, className }: { dark?: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-display text-[11px] font-semibold uppercase tracking-[0.14em]",
        dark ? "border-white/20 bg-white/10 text-white" : "border-brand-200 bg-brand-50 text-brand-600",
        className
      )}
    >
      Mock
    </span>
  );
}

/** IELTS band chip */
export function BandChip({ value, size = "md" }: { value: number; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "h-7 min-w-7 px-1.5 text-[11px]", md: "h-8 min-w-8 px-2 text-[13px]", lg: "h-12 min-w-12 px-3 text-lg" };
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-lg bg-ink font-display font-bold tabular-nums text-white",
        sizes[size]
      )}
    >
      {value.toFixed(1)}
    </span>
  );
}

/** Minimal SVG line chart for band progression */
export function BandTrendChart({ data, height = 160 }: { data: { label: string; value: number }[]; height?: number }) {
  const w = 560;
  const h = height;
  const pad = { l: 34, r: 16, t: 14, b: 26 };
  const min = 4.5;
  const max = 9;
  const x = (i: number) => pad.l + (i * (w - pad.l - pad.r)) / Math.max(data.length - 1, 1);
  const y = (v: number) => pad.t + (1 - (v - min) / (max - min)) * (h - pad.t - pad.b);
  const pts = data.map((d, i) => `${x(i)},${y(d.value)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
      {[5, 6, 7, 8, 9].map((g) => (
        <g key={g}>
          <line x1={pad.l} x2={w - pad.r} y1={y(g)} y2={y(g)} stroke="#E5E5EB" strokeDasharray="3 4" />
          <text x={pad.l - 8} y={y(g) + 3.5} textAnchor="end" fontSize="10" fill="#8A8E99" className="font-display">
            {g.toFixed(1)}
          </text>
        </g>
      ))}
      <polyline points={pts} fill="none" stroke="#7B61FF" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((d, i) => (
        <g key={d.label}>
          <circle cx={x(i)} cy={y(d.value)} r="4" fill="#fff" stroke="#7B61FF" strokeWidth="2.5" />
          <text x={x(i)} y={y(d.value) - 9} textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#0E0F13" className="font-display">
            {d.value.toFixed(1)}
          </text>
          <text x={x(i)} y={h - 8} textAnchor="middle" fontSize="9.5" fill="#8A8E99">
            {d.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

/** Horizontal skill bar */
export function SkillBar({ label, value, target = 7.5 }: { label: string; value: number; target?: number }) {
  const pct = ((value - 4) / 5) * 100;
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-[13px] font-medium text-ink">{label}</span>
        <span className="font-display text-[13px] font-bold tabular-nums text-ink">{value.toFixed(1)}</span>
      </div>
      <div className="relative h-2 overflow-hidden rounded-full bg-mist">
        <div className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-700" style={{ width: `${Math.max(pct, 2)}%` }} />
        <div className="absolute inset-y-0 w-0.5 bg-ink/40" style={{ left: `${((target - 4) / 5) * 100}%` }} title={`Target ${target}`} />
      </div>
    </div>
  );
}
