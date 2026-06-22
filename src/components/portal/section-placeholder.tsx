import type { ComponentType } from "react";
import { Layers } from "lucide-react";

export function SectionPlaceholder({
  title,
  description,
  icon: Icon = Layers,
  eyebrow,
}: {
  title: string;
  description: string;
  icon?: ComponentType<{ className?: string; strokeWidth?: number }>;
  eyebrow?: string;
}) {
  return (
    <div className="mx-auto max-w-5xl">
      {eyebrow && (
        <span className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-secondary px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-brand">
          <span className="h-1.5 w-1.5 rounded-full bg-direction" />
          {eyebrow}
        </span>
      )}

      <header className="mt-3 flex items-start gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-brand text-brand-foreground">
          <Icon className="h-6 w-6" strokeWidth={2.25} />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-graphite">{title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
        </div>
      </header>
    </div>
  );
}
