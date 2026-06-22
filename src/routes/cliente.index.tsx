import { createFileRoute } from "@tanstack/react-router";
import {
  Bell,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Headphones,
  Home,
  MessageCircle,
  Phone,
  ShieldCheck,
  Upload,
  XCircle,
} from "lucide-react";
import { Card, PainelHeader, SectionTitle, StatusDot } from "@/components/portal/painel-ui";

export const Route = createFileRoute("/cliente/")({
  component: PainelCliente,
});

type EtapaState = "concluida" | "atual" | "futura";
const etapas: { nome: string; data: string; resp?: string; state: EtapaState }[] = [
  { nome: "Cadastro", data: "12 mai", resp: "Você", state: "concluida" },
  { nome: "Simulação", data: "13 mai", resp: "Eduardo Lima", state: "concluida" },
  { nome: "Documentação", data: "16 mai", resp: "Você + Corretor", state: "concluida" },
  { nome: "Análise de crédito", data: "Em andamento", resp: "Banco A", state: "atual" },
  { nome: "Avaliação do imóvel", data: "Previsão: 24 jun", state: "futura" },
  { nome: "Aprovação", data: "Previsão: 28 jun", state: "futura" },
  { nome: "Contrato", data: "Previsão: 03 jul", state: "futura" },
  { nome: "Assinatura", data: "Previsão: 08 jul", state: "futura" },
  { nome: "Liberação", data: "Previsão: 12 jul", state: "futura" },
];

const documentos = [
  { nome: "RG e CPF", status: "Recebido", tone: "success" as const },
  { nome: "Comprovante de residência", status: "Em análise", tone: "info" as const },
  { nome: "Comprovante de renda (3 últimos)", status: "Recebido", tone: "success" as const },
  { nome: "Declaração de IR completa", status: "Recusado", tone: "direction" as const },
  { nome: "Matrícula do imóvel atualizada", status: "Pendente", tone: "warning" as const },
];

const feed = [
  {
    quando: "Hoje · 09:42",
    autor: "Banco A",
    msg: "Sua proposta foi encaminhada para a etapa de análise de crédito.",
  },
  {
    quando: "Ontem · 17:18",
    autor: "Eduardo Lima (Corretor)",
    msg: "Recebi os comprovantes de renda. Já anexei na proposta.",
  },
  {
    quando: "16 mai · 14:05",
    autor: "Sistema",
    msg: "Documentação inicial concluída. Etapa avançada para análise bancária.",
  },
  {
    quando: "13 mai · 10:21",
    autor: "Eduardo Lima (Corretor)",
    msg: "Simulação aprovada com o Banco A. Vamos prosseguir com a documentação.",
  },
];

const toneStatus: Record<string, string> = {
  success: "bg-[color-mix(in_oklab,var(--success)_12%,white)] text-[var(--success)]",
  info: "bg-[color-mix(in_oklab,var(--info)_10%,white)] text-[var(--info)]",
  warning: "bg-[color-mix(in_oklab,var(--warning)_12%,white)] text-[var(--warning)]",
  direction: "bg-[color-mix(in_oklab,var(--direction)_10%,white)] text-direction",
};

function PainelCliente() {
  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <PainelHeader
        eyebrow="Visão Geral · Cliente"
        title="Olá, Fernanda — sua proposta está em análise"
        subtitle="Financiamento Imobiliário · Banco A · Proposta nº 2024-08731"
        
      />

      {/* Status macro */}
      <Card className="overflow-hidden">
        <div className="grid gap-0 md:grid-cols-[minmax(0,1fr)_auto]">
          <div className="p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Status atual da sua proposta
            </p>
            <div className="mt-2 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-md bg-[color-mix(in_oklab,var(--info)_10%,white)] text-[var(--info)]">
                <Clock className="h-5 w-5" strokeWidth={2.25} />
              </span>
              <div>
                <p className="text-xl font-bold tracking-tight text-graphite">
                  Em análise bancária
                </p>
                <p className="text-[12px] text-muted-foreground">
                  Previsão de retorno: até 24 de junho
                </p>
              </div>
            </div>
          </div>
          <div className="border-t border-border bg-secondary/50 p-5 md:border-l md:border-t-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand">
              Próxima ação
            </p>
            <p className="mt-1 text-[13px] text-graphite">
              Reenviar a <strong>Declaração de IR completa</strong> (a anterior foi recusada por estar incompleta).
            </p>
            <button className="mt-3 inline-flex items-center gap-1.5 rounded-sm bg-brand px-3 py-2 text-[12px] font-semibold uppercase tracking-wider text-brand-foreground hover:opacity-95">
              <Upload className="h-3.5 w-3.5" /> Enviar documento
            </button>
          </div>
        </div>
      </Card>

      {/* Resumo da proposta */}
      <section>
        <SectionTitle
          icon={Home}
          title="Resumo da proposta"
          description="Condições contratadas com o banco escolhido."
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { l: "Valor financiado", v: "R$ 480.000,00" },
            { l: "Prazo", v: "360 meses" },
            { l: "Parcela estimada", v: "R$ 3.842,17" },
            { l: "Banco escolhido", v: "Banco A" },
          ].map((i) => (
            <Card key={i.l} className="p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {i.l}
              </p>
              <p className="mt-1 text-lg font-bold text-graphite">{i.v}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Timeline + Documentos */}
      <section className="grid gap-4 lg:grid-cols-5">
        <Card className="p-5 lg:col-span-3">
          <SectionTitle
            icon={Clock}
            title="Linha do tempo do processo"
            description="Acompanhe etapa por etapa, com responsável e previsão."
          />
          <ol className="relative ml-2 space-y-4 border-l-2 border-border pl-5">
            {etapas.map((e) => {
              const concl = e.state === "concluida";
              const atual = e.state === "atual";
              return (
                <li key={e.nome} className="relative">
                  <span
                    className={`absolute -left-[31px] grid h-5 w-5 place-items-center rounded-full ring-4 ring-card ${
                      concl
                        ? "bg-[var(--success)] text-white"
                        : atual
                        ? "bg-brand text-brand-foreground"
                        : "border border-border bg-card"
                    }`}
                  >
                    {concl ? (
                      <CheckCircle2 className="h-3 w-3" strokeWidth={3} />
                    ) : atual ? (
                      <Clock className="h-2.5 w-2.5" strokeWidth={3} />
                    ) : null}
                  </span>
                  <div
                    className={`rounded-sm border p-3 ${
                      atual
                        ? "border-brand bg-accent"
                        : concl
                        ? "border-border bg-card"
                        : "border-dashed border-border bg-secondary/40"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-[13px] font-semibold text-graphite">
                        {e.nome}
                      </p>
                      <span
                        className={`text-[11px] ${
                          atual ? "font-semibold text-brand" : "text-muted-foreground"
                        }`}
                      >
                        {e.data}
                      </span>
                    </div>
                    {e.resp && (
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        Responsável: {e.resp}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          <Card className="p-5">
            <SectionTitle
              icon={FileText}
              title="Documentos"
              description="O que já recebemos e o que ainda falta."
            />
            <ul className="divide-y divide-border">
              {documentos.map((d) => (
                <li key={d.nome} className="flex items-center gap-3 py-2.5">
                  <span
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-sm ${toneStatus[d.tone]}`}
                  >
                    {d.tone === "success" ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : d.tone === "direction" ? (
                      <XCircle className="h-3.5 w-3.5" />
                    ) : (
                      <Clock className="h-3.5 w-3.5" />
                    )}
                  </span>
                  <p className="flex-1 text-[12px] text-graphite">{d.nome}</p>
                  <span
                    className={`rounded-sm px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${toneStatus[d.tone]}`}
                  >
                    {d.status}
                  </span>
                </li>
              ))}
            </ul>
            <button className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-sm border border-brand bg-card px-3 py-2 text-[12px] font-semibold uppercase tracking-wider text-brand hover:bg-accent">
              <Upload className="h-3.5 w-3.5" /> Enviar novo documento
            </button>
          </Card>

          <Card className="p-5">
            <SectionTitle
              icon={Headphones}
              title="Corretor responsável"
              description="Fale diretamente com quem cuida da sua proposta."
            />
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent text-[13px] font-bold text-brand">
                EL
              </span>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-graphite">
                  Eduardo Lima
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Correspondente · CRECI 00.000
                </p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button className="inline-flex items-center justify-center gap-1.5 rounded-sm border border-border bg-card px-3 py-2 text-[12px] font-semibold text-graphite hover:border-brand/40">
                <Phone className="h-3.5 w-3.5" /> Ligar
              </button>
              <button className="inline-flex items-center justify-center gap-1.5 rounded-sm bg-brand px-3 py-2 text-[12px] font-semibold text-brand-foreground hover:opacity-95">
                <MessageCircle className="h-3.5 w-3.5" /> Mensagem
              </button>
            </div>
          </Card>
        </div>
      </section>

      {/* Feed de mensagens */}
      <section>
        <Card className="p-5">
          <SectionTitle
            icon={Bell}
            title="Mensagens e atualizações"
            description="Tudo o que aconteceu na sua proposta, em ordem cronológica."
          />
          <ol className="space-y-3">
            {feed.map((m, i) => (
              <li
                key={i}
                className="flex gap-3 rounded-sm border border-border bg-card p-3"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-sm bg-secondary text-brand">
                  <Building2 className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[12px] font-semibold text-graphite">
                      {m.autor}
                    </p>
                    <span className="text-[11px] text-muted-foreground">
                      {m.quando}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">
                    {m.msg}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Card>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-3">
          <StatusDot tone="success" label="Conexão segura" />
          <StatusDot tone="info" label="Atualização em tempo real" />
        </div>
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="h-3 w-3" />
          Você só vê os dados da sua própria proposta
        </span>
      </footer>
    </div>
  );
}
