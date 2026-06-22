import type { ComponentType } from "react";
import { ShieldCheck, Layers } from "lucide-react";

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

      <section className="mt-8 rounded-md border border-dashed border-border bg-card p-10 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-md bg-secondary text-brand">
          <Layers className="h-5 w-5" strokeWidth={2} />
        </div>
        <h2 className="mt-4 text-base font-semibold text-graphite">
          Área pronta para desenvolvimento
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          A estrutura visual e de navegação deste módulo está preparada. As telas
          internas, painéis e funcionalidades serão desenhadas em etapas posteriores.
        </p>
        <div className="mt-5 inline-flex items-center gap-2 rounded-md border border-border bg-secondary px-3 py-1.5 text-[11px] font-medium text-brand">
          <ShieldCheck className="h-3.5 w-3.5" />
          Acesso restrito por perfil · Auditoria ativa
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { t: "Permissões", d: "Visibilidade segmentada por perfil de usuário." },
          { t: "Auditoria", d: "Registro de ações sensíveis e histórico de alterações." },
          { t: "Escalabilidade", d: "Estrutura modular preparada para crescimento." },
        ].map((c) => (
          <div key={c.t} className="rounded-md border border-border bg-card p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-brand">
              {c.t}
            </p>
            <p className="mt-1.5 text-sm text-graphite">{c.d}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
