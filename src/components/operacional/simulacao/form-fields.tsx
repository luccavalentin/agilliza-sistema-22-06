// Primitivos visuais reutilizáveis do formulário.

import type { ReactNode } from "react";

export const inputCls =
  "w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] uppercase font-bold tracking-wider text-slate-500 mb-1">
        {label}
      </span>
      {children}
    </label>
  );
}

export function SectionCard({
  title, icon, children, className = "",
}: { title?: ReactNode; icon?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      {title && (
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
          {icon}{title}
        </h3>
      )}
      {children}
    </section>
  );
}
