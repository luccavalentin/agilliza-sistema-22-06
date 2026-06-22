// Meus Documentos — visão do Cliente.
// Lista de documentos solicitados, status, upload em pendentes/reprovados.

import { useMemo, useState } from "react";
import {
  CheckCircle2, Clock, FileText, Upload, XCircle, AlertCircle, Download, Eye, ShieldCheck,
} from "lucide-react";
import { PanelHeader } from "@/components/dashboards/primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type DocStatus = "approved" | "review" | "pending" | "rejected";
type Doc = {
  id: string;
  nome: string;
  obrigatorio: boolean;
  status: DocStatus;
  enviadoEm?: string;
  validade?: string;
  motivoReprovacao?: string;
  arquivo?: string;
  tamanho?: string;
};

const DOCS_BASE: Doc[] = [
  { id: "d-1", nome: "RG ou CNH", obrigatorio: true, status: "approved", enviadoEm: "12/05/2026", arquivo: "rg-frente-verso.pdf", tamanho: "1,2 MB" },
  { id: "d-2", nome: "CPF", obrigatorio: true, status: "approved", enviadoEm: "12/05/2026", arquivo: "cpf.pdf", tamanho: "0,4 MB" },
  { id: "d-3", nome: "Comprovante de residência (últimos 60 dias)", obrigatorio: true, status: "review", enviadoEm: "18/06/2026", validade: "Expira em 17/08/2026", arquivo: "luz-junho.pdf", tamanho: "0,9 MB" },
  { id: "d-4", nome: "Comprovantes de renda (3 últimos)", obrigatorio: true, status: "approved", enviadoEm: "14/05/2026", arquivo: "holerites.pdf", tamanho: "2,3 MB" },
  { id: "d-5", nome: "Declaração de IR completa (último ano)", obrigatorio: true, status: "rejected", enviadoEm: "14/05/2026", motivoReprovacao: "Arquivo incompleto — faltou recibo de entrega da Receita Federal.", arquivo: "ir-2025-resumo.pdf", tamanho: "0,7 MB" },
  { id: "d-6", nome: "Matrícula do imóvel atualizada (até 30 dias)", obrigatorio: true, status: "pending" },
  { id: "d-7", nome: "Certidão negativa do IPTU", obrigatorio: false, status: "pending" },
];

const STATUS_MAP: Record<DocStatus, { label: string; tone: string; icon: typeof CheckCircle2 }> = {
  approved: { label: "Aprovado", tone: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  review:   { label: "Em análise", tone: "bg-sky-50 text-sky-700 border-sky-200", icon: Clock },
  pending:  { label: "Pendente", tone: "bg-amber-50 text-amber-700 border-amber-200", icon: AlertCircle },
  rejected: { label: "Reprovado", tone: "bg-rose-50 text-rose-700 border-rose-200", icon: XCircle },
};

export function ClienteDocumentos() {
  const [docs, setDocs] = useState<Doc[]>(DOCS_BASE);
  const [confirmacao, setConfirmacao] = useState<string | null>(null);

  const totais = useMemo(() => ({
    total: docs.length,
    aprovados: docs.filter((d) => d.status === "approved").length,
    analise: docs.filter((d) => d.status === "review").length,
    pendentes: docs.filter((d) => d.status === "pending").length,
    reprovados: docs.filter((d) => d.status === "rejected").length,
  }), [docs]);

  const handleUpload = (id: string, file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      alert("Arquivo maior que 10 MB. Compacte o PDF ou reduza a resolução da imagem.");
      return;
    }
    setDocs((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, status: "review", enviadoEm: new Date().toLocaleDateString("pt-BR"), arquivo: file.name, tamanho: `${(file.size / 1024 / 1024).toFixed(1)} MB`, motivoReprovacao: undefined }
          : d,
      ),
    );
    setConfirmacao(id);
    setTimeout(() => setConfirmacao(null), 3000);
  };

  return (
    <div className="space-y-6">
      <PanelHeader
        eyebrow="Acompanhamento · Cliente"
        title="Meus Documentos"
        subtitle="Envie, acompanhe e baixe os documentos da sua proposta."
        right={
          <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-[11px] font-semibold text-emerald-700">
            <ShieldCheck className="h-3.5 w-3.5" /> Escopo · sua proposta
          </span>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Kpi label="Total" valor={totais.total} />
        <Kpi label="Aprovados" valor={totais.aprovados} tone="text-emerald-700" />
        <Kpi label="Em análise" valor={totais.analise} tone="text-sky-700" />
        <Kpi label="Pendentes" valor={totais.pendentes} tone="text-amber-700" />
        <Kpi label="Reprovados" valor={totais.reprovados} tone="text-rose-700" />
      </div>

      {/* Lista */}
      <section className="space-y-3">
        {docs.map((d) => {
          const s = STATUS_MAP[d.status];
          const Icone = s.icon;
          const podeEnviar = d.status === "pending" || d.status === "rejected";
          return (
            <article key={d.id} className="rounded-lg border border-border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className={`grid h-10 w-10 place-items-center rounded-md border ${s.tone}`}>
                    <Icone className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-graphite">{d.nome}</h3>
                      {d.obrigatorio && <Badge variant="outline" className="text-[10px]">Obrigatório</Badge>}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                      {d.enviadoEm && <span>Enviado em {d.enviadoEm}</span>}
                      {d.arquivo && <span className="inline-flex items-center gap-1"><FileText className="h-3 w-3" /> {d.arquivo} · {d.tamanho}</span>}
                      {d.validade && <span className="text-amber-700">{d.validade}</span>}
                    </div>
                  </div>
                </div>
                <Badge className={`border ${s.tone}`} variant="outline">{s.label}</Badge>
              </div>

              {d.motivoReprovacao && (
                <div className="mt-3 rounded-md border border-rose-200 bg-rose-50 p-3 text-[12px] text-rose-700">
                  <strong>Motivo da reprovação:</strong> {d.motivoReprovacao}
                </div>
              )}

              {confirmacao === d.id && (
                <div className="mt-3 flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-2.5 text-[12px] text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" /> Arquivo enviado com sucesso — agora está em análise.
                </div>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {podeEnviar ? (
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-brand px-3 py-2 text-[12px] font-semibold uppercase tracking-wider text-brand-foreground hover:opacity-95">
                    <Upload className="h-3.5 w-3.5" /> Enviar arquivo
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleUpload(d.id, f);
                      }}
                    />
                  </label>
                ) : (
                  <>
                    <Button size="sm" variant="outline" className="gap-1">
                      <Eye className="h-3.5 w-3.5" /> Visualizar
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1">
                      <Download className="h-3.5 w-3.5" /> Baixar
                    </Button>
                  </>
                )}
                <span className="ml-auto text-[10px] text-muted-foreground">
                  Formatos: PDF, JPG, PNG · até 10 MB
                </span>
              </div>
            </article>
          );
        })}
      </section>

      <footer className="rounded-md border border-border bg-secondary/30 p-3 text-[11px] text-muted-foreground">
        Todo upload é registrado em auditoria e dispara uma análise pelo seu corretor em até 4 horas úteis.
      </footer>
    </div>
  );
}

function Kpi({ label, valor, tone = "text-graphite" }: { label: string; valor: number; tone?: string }) {
  return (
    <div className="rounded-md border border-border bg-card p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${tone}`}>{valor}</p>
    </div>
  );
}
