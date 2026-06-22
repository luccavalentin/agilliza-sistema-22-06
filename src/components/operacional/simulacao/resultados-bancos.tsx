// Lista de resultados por banco + ação de download PDF.

import { useMemo } from "react";
import { Download, Loader2 } from "lucide-react";
import { BancoResultadoCard } from "./banco-resultado-card";
import type { BancoResultado } from "./types";

export function ResultadosBancos({
  resultados, onBaixarPdf, gerandoPdf,
}: {
  resultados: BancoResultado[];
  onBaixarPdf: () => void;
  gerandoPdf: boolean;
}) {
  const melhorPorBanco = useMemo(() => {
    const m: Record<string, string> = {};
    resultados.forEach((b) => {
      const best = [...b.segmentos].sort((a, c) => a.taxaEfetiva - c.taxaEfetiva)[0];
      if (best) m[b.idBanco] = best.segmento;
    });
    return m;
  }, [resultados]);

  if (resultados.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800">Resultados por banco</h3>
        <button
          onClick={onBaixarPdf}
          disabled={gerandoPdf}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          {gerandoPdf ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
          Baixar PDF
        </button>
      </div>

      {resultados.map((banco, i) => (
        <BancoResultadoCard
          key={banco.idBanco}
          banco={banco}
          melhorSegmento={melhorPorBanco[banco.idBanco]}
          defaultOpen={i === 0}
        />
      ))}
    </section>
  );
}
