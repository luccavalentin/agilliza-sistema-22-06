// Card colapsável com a tabela de segmentos de um banco.

import { useState } from "react";
import { ChevronDown, ChevronRight, Star } from "lucide-react";
import { BankLogo } from "@/components/operacional/bank-logo";
import { bancos as bancosMock } from "@/lib/operacional/mock-data";
import { formatBRL, formatPercent } from "@/lib/operacional/formatters";
import type { BancoResultado } from "./types";

export function BancoResultadoCard({
  banco, melhorSegmento, defaultOpen = false,
}: {
  banco: BancoResultado;
  melhorSegmento?: string;
  defaultOpen?: boolean;
}) {
  const [aberto, setAberto] = useState(defaultOpen);
  const meta = bancosMock.find((b) => b.id === banco.idBanco) ?? {
    id: banco.idBanco, nome: banco.nomeBanco,
    sigla: banco.nomeBanco.slice(0, 4).toUpperCase(),
    logoSlug: banco.logoSlug, brandColor: banco.brandColor,
  };
  const total = banco.segmentos.reduce((s, x) => s + x.total, 0);

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <button
        onClick={() => setAberto((a) => !a)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100"
      >
        <div className="flex items-center gap-3">
          <BankLogo banco={meta as any} size="md" />
          <span className="font-bold text-sm text-slate-800">{banco.nomeBanco}</span>
          <span className="text-[11px] text-slate-500">{banco.segmentos.length} segmento(s)</span>
        </div>
        {aberto ? <ChevronDown className="h-4 w-4 text-slate-500" /> : <ChevronRight className="h-4 w-4 text-slate-500" />}
      </button>

      {aberto && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-white text-slate-500 uppercase text-[10px] tracking-wider">
                <th className="text-left px-4 py-2">Segmento</th>
                <th className="text-right px-4 py-2">1ª Parcela</th>
                <th className="text-right px-4 py-2">Última Parcela</th>
                <th className="text-right px-4 py-2">Taxa Efetiva %</th>
                <th className="text-right px-4 py-2">Renda Estimada</th>
                <th className="text-right px-4 py-2">LTV</th>
                <th className="text-right px-4 py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {banco.segmentos.map((s) => {
                const best = melhorSegmento === s.segmento;
                return (
                  <tr key={s.segmento} className={`border-t border-slate-100 ${best ? "bg-emerald-50" : ""}`}>
                    <td className="px-4 py-2 font-medium text-slate-800">
                      <div className="flex items-center gap-2">
                        {s.segmento}
                        {best && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 text-white text-[9px] font-bold uppercase px-2 py-0.5">
                            <Star className="h-2.5 w-2.5" /> Melhor taxa
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums">{formatBRL(s.primeiraParcela)}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{formatBRL(s.ultimaParcela)}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{formatPercent(s.taxaEfetiva / 100)}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{formatBRL(s.rendaEstimada)}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{formatPercent(s.ltv / 100)}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{formatBRL(s.total)}</td>
                  </tr>
                );
              })}
              <tr className="border-t border-slate-200 bg-slate-50 font-bold">
                <td className="px-4 py-2 text-slate-700" colSpan={6}>Total</td>
                <td className="px-4 py-2 text-right tabular-nums text-slate-900">{formatBRL(total)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
