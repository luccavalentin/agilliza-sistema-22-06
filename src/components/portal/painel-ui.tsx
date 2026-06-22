import type { ComponentType, ReactNode } from "react";
import { ShieldCheck } from "lucide-react";

/* =========================================================================
 * Building blocks compartilhados entre os três Painéis de Monitoramento.
 * Mesma identidade visual (azul profundo, vermelho direcional, verde, âmbar)
 * para reforçar a coerência do ecossistema.
 * ========================================================================= */

export function PainelHeader({
  eyebrow,
  title,
  subtitle,
  badge,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  badge?: string;
}) {
  return (
    <header className="border-b border-border pb-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-secondary px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-brand">
            <span className="h-1.5 w-1.5 rounded-full bg-direction" />
            {eyebrow}
          </span>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-graphite sm:text-[28px]">
            {title}
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{subtitle}</p>
        </div>
        {badge && (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-sm border border-brand/15 bg-accent px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-brand">
            <ShieldCheck className="h-3.5 w-3.5" />
            {badge}
          </span>
        )}
      </div>
    </header>
  );
}

export function SectionTitle({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-sm bg-accent text-brand">
          <Icon className="h-3.5 w-3.5" strokeWidth={2.25} />
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-graphite">
            {title}
          </h2>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-md border border-border bg-card shadow-[0_1px_0_0_rgba(15,23,42,0.02)] ${className}`}
    >
      {children}
    </div>
  );
}

type Tone = "brand" | "success" | "warning" | "direction" | "info" | "neutral" | "amber";

const toneMap: Record<
  Tone,
  { dot: string; chip: string; text: string; ring: string }
> = {
  brand: {
    dot: "bg-brand",
    chip: "bg-accent text-brand",
    text: "text-brand",
    ring: "ring-brand/15",
  },
  success: {
    dot: "bg-[var(--success)]",
    chip: "bg-[color-mix(in_oklab,var(--success)_10%,white)] text-[var(--success)]",
    text: "text-[var(--success)]",
    ring: "ring-[var(--success)]/20",
  },
  warning: {
    dot: "bg-[var(--warning)]",
    chip: "bg-[color-mix(in_oklab,var(--warning)_12%,white)] text-[var(--warning)]",
    text: "text-[var(--warning)]",
    ring: "ring-[var(--warning)]/20",
  },
  direction: {
    dot: "bg-direction",
    chip: "bg-[color-mix(in_oklab,var(--direction)_10%,white)] text-direction",
    text: "text-direction",
    ring: "ring-direction/20",
  },
  info: {
    dot: "bg-[var(--info)]",
    chip: "bg-[color-mix(in_oklab,var(--info)_10%,white)] text-[var(--info)]",
    text: "text-[var(--info)]",
    ring: "ring-[var(--info)]/20",
  },
  neutral: {
    dot: "bg-muted-foreground",
    chip: "bg-secondary text-graphite",
    text: "text-graphite",
    ring: "ring-border",
  },
  amber: {
    dot: "bg-amber-500",
    chip: "bg-amber-50 text-amber-600",
    text: "text-amber-600",
    ring: "ring-amber-500/20",
  },
};

export function KpiCard({
  label,
  value,
  hint,
  tone = "brand",
  icon: Icon,
  breakdown,
  onClickHint = "Clique para detalhar",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: Tone;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  breakdown?: { label: string; value: string; tone?: Tone }[];
  onClickHint?: string;
}) {
  const t = toneMap[tone];
  return (
    <button
      type="button"
      className={`group relative flex h-full w-full flex-col rounded-md border border-border bg-card p-4 text-left transition hover:border-brand/40 hover:shadow-sm focus:outline-none focus-visible:ring-2 ${t.ring}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          {label}
        </span>
        <span className={`grid h-7 w-7 place-items-center rounded-sm ${t.chip}`}>
          <Icon className="h-3.5 w-3.5" strokeWidth={2.25} />
        </span>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-[26px] font-bold leading-none tracking-tight text-graphite">
          {value}
        </span>
      </div>
      {hint && (
        <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>
      )}
      {breakdown && (
        <ul className="mt-3 grid grid-cols-2 gap-1.5 border-t border-border pt-2.5">
          {breakdown.map((b) => {
            const bt = toneMap[b.tone ?? "neutral"];
            return (
              <li key={b.label} className="flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${bt.dot}`} />
                <span className="truncate text-[11px] text-muted-foreground">
                  {b.label}
                </span>
                <span className={`ml-auto text-[11px] font-semibold ${bt.text}`}>
                  {b.value}
                </span>
              </li>
            );
          })}
        </ul>
      )}
      <span className="mt-3 inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80 opacity-0 transition group-hover:opacity-100">
        {onClickHint} →
      </span>
    </button>
  );
}

export function FilterPill({
  label,
  value,
  active = false,
}: {
  label: string;
  value: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className={`inline-flex shrink-0 items-center gap-2 rounded-sm border px-2.5 py-1.5 text-[11px] transition ${
        active
          ? "border-brand bg-brand text-brand-foreground"
          : "border-border bg-card text-graphite hover:border-brand/40"
      }`}
    >
      <span className="font-semibold uppercase tracking-wider opacity-70">
        {label}
      </span>
      <span className="font-semibold">{value}</span>
    </button>
  );
}

export function StatusDot({ tone, label }: { tone: Tone; label: string }) {
  const t = toneMap[tone];
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] text-graphite">
      <span className={`h-1.5 w-1.5 rounded-full ${t.dot}`} />
      {label}
    </span>
  );
}
