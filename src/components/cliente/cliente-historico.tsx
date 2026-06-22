// Histórico de propostas anteriores — visão do Cliente (somente leitura).

import { useState } from "react";
import { Building2, Calendar, CheckCircle2, XCircle, FileText, History, ShieldCheck } from "lucide-react";
import { PanelHeader } from "@/components/dashboards/primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

type StatusFinal = "Finalizada" | "Cancelada" | "Reprovada";

type PropostaHist = {
  id: string;
  numero: string;
  produto: string;
  banco: string;
  valor: string;
  abertaEm: string;
  encerradaEm: string;
  statusFinal: StatusFinal;
  motivo?: string;
  timeline: { etapa: string; data: string; concluida: boolean }[];
};

const HISTORICO: PropostaHist[] = [
  {
    id: "ph-1",
    numero: "2023-04412",
    produto: "Financiamento Imobiliário SBPE",
    banco: "Banco do Brasil",
    valor: "R$ 320.000,00",
    abertaEm: "10/02/2023",
    encerradaEm: "18/05/2023",
    statusFinal: "Finalizada",
    timeline: [
      { etapa: "Cadastro", data: "10/02/2023", concluida: true },
      { etapa: "Documentos", data: "15/02/2023", concluida: true },
      { etapa: "Simulação", data: "20/02/2023", concluida: true },
      { etapa: "Análise bancária", data: "10/03/2023", concluida: true },
      { etapa: "Aprovação", data: "12/04/2023", concluida: true },
      { etapa: "Contrato e liberação", data: "18/05/2023", concluida: true },
    ],
  },
  {
    id: "ph-2",
    numero: "2024-01187",
    produto: "Crédito com Garantia de Imóvel",
    banco: "Itaú Unibanco",
    valor: "R$ 180.000,00",
    abertaEm: "05/01/2024",
    encerradaEm: "22/03/2024",
    statusFinal: "Reprovada",
    motivo: "Comprometimento de renda acima do limite do produto.",
    timeline: [
      { etapa: "Cadastro", data: "05/01/2024", concluida: true },
      { etapa: "Documentos", data: "12/01/2024", concluida: true },
      { etapa: "Simulação", data: "18/01/2024", concluida: true },
      { etapa: "Análise bancária", data: "15/02/2024", concluida: true },
      { etapa: "Reprovação", data: "22/03/2024", concluida: true },
    ],
  },
  {
    id: "ph-3",
    numero: "2024-09923",
    produto: "Portabilidade Imobiliária",
    banco: "Santander",
    valor: "R$ 410.000,00",
    abertaEm: "12/09/2024",
    encerradaEm: "30/09/2024",
    statusFinal: "Cancelada",
    motivo: "Cancelada a pedido do cliente (mudança de imóvel).",
    timeline: [
      { etapa: "Cadastro", data: "12/09/2024", concluida: true },
      { etapa: "Documentos", data: "16/09/2024", concluida: true },
      { etapa: "Cancelada", data: "30/09/2024", concluida: true },
    ],
  },
];

const TONE: Record<StatusFinal, string> = {
  Finalizada: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Cancelada:  "bg-slate-50 text-slate-700 border-slate-200",
  Reprovada:  "bg-rose-50 text-rose-700 border-rose-200",
};

export function ClienteHistorico() {
  const [aberta, setAberta] = useState<PropostaHist | null>(null);

  return (
    <div className="space-y-6">
      <PanelHeader
        eyebrow="Acompanhamento · Cliente"
        title="Histórico de Propostas"
        subtitle="Suas propostas encerradas, em modo somente leitura."
        right={
          <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-[11px] font-semibold text-emerald-700">
            <ShieldCheck className="h-3.5 w-3.5" /> Escopo · sua proposta
          </span>
        }
      />

      <section className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {HISTORICO.map((p) => {
          const Ic = p.statusFinal === "Finalizada" ? CheckCircle2 : p.statusFinal === "Reprovada" ? XCircle : FileText;
          return (
            <article key={p.id} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{p.numero}</p>
                  <h3 className="mt-1 text-sm font-bold text-graphite">{p.produto}</h3>
                </div>
                <Badge className={`border ${TONE[p.statusFinal]}`} variant="outline">
                  <Ic className="mr-1 h-3 w-3" /> {p.statusFinal}
                </Badge>
              </div>
              <ul className="mt-3 space-y-1 text-[12px] text-muted-foreground">
                <li className="inline-flex items-center gap-1.5"><Building2 className="h-3 w-3" /> {p.banco}</li>
                <li className="inline-flex items-center gap-1.5"><FileText className="h-3 w-3" /> {p.valor}</li>
                <li className="inline-flex items-center gap-1.5"><Calendar className="h-3 w-3" /> Encerrada em {p.encerradaEm}</li>
              </ul>
              <Button size="sm" variant="outline" className="mt-3 w-full gap-1" onClick={() => setAberta(p)}>
                <History className="h-3.5 w-3.5" /> Ver detalhes
              </Button>
            </article>
          );
        })}
      </section>

      <Dialog open={!!aberta} onOpenChange={(o) => !o && setAberta(null)}>
        <DialogContent className="max-w-2xl">
          {aberta && (
            <>
              <DialogHeader>
                <DialogTitle>{aberta.produto} · {aberta.numero}</DialogTitle>
                <DialogDescription>
                  {aberta.banco} · {aberta.valor} · Aberta em {aberta.abertaEm} · Encerrada em {aberta.encerradaEm}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <Badge className={`border ${TONE[aberta.statusFinal]}`} variant="outline">{aberta.statusFinal}</Badge>
                {aberta.motivo && (
                  <p className="rounded-md border border-border bg-secondary/40 p-3 text-[12px] text-muted-foreground">
                    <strong>Motivo:</strong> {aberta.motivo}
                  </p>
                )}
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-graphite">Linha do tempo (congelada)</h4>
                  <ol className="space-y-2">
                    {aberta.timeline.map((t) => (
                      <li key={t.etapa} className="flex items-center gap-2 text-[12px]">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span className="font-medium text-graphite">{t.etapa}</span>
                        <span className="text-muted-foreground">— {t.data}</span>
                      </li>
                    ))}
                  </ol>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Esta proposta está encerrada e não pode ser alterada. Para uma nova solicitação, fale com seu corretor.
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
