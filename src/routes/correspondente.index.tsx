import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type ComponentType } from "react";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Banknote,
  BarChart3,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  DollarSign,
  Bell,
  Filter,
  FileWarning,
  Layers,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  ShieldCheck,
  Timer,
  TrendingUp,
  Trophy,
  Wallet,
  XCircle,
  Zap,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  FilterPill,
  KpiCard,
  PainelHeader,
  SectionTitle,
  StatusDot,
} from "@/components/portal/painel-ui";

export const Route = createFileRoute("/correspondente/")({
  component: PainelCorrespondente,
});

/* =========================================================================
 * Mock data alinhado ao contrato HomeFin: simulações, aprovações, reprovações,
 * volume, status operacionais, comparativo por produto/banco e ranking de
 * corretores. Quando o transporte real (Edge Functions) for plugado, basta
 * substituir cada constante por uma query — os componentes não mudam.
 * ========================================================================= */

const evolucao = [
  { mes: "Jan", simul: 184, aprov: 96, reprov: 38, volume: 412 },
  { mes: "Fev", simul: 212, aprov: 118, reprov: 41, volume: 486 },
  { mes: "Mar", simul: 246, aprov: 132, reprov: 47, volume: 538 },
  { mes: "Abr", simul: 198, aprov: 110, reprov: 36, volume: 461 },
  { mes: "Mai", simul: 268, aprov: 152, reprov: 44, volume: 612 },
  { mes: "Jun", simul: 304, aprov: 176, reprov: 49, volume: 684 },
];

const statusDist = [
  { name: "Aprovadas", value: 412, color: "var(--success)" },
  { name: "Em análise", value: 268, color: "var(--info)" },
  { name: "Tratativa", value: 144, color: "var(--warning)" },
  { name: "Reprovadas", value: 188, color: "var(--direction)" },
  { name: "Formalizadas", value: 226, color: "var(--brand)" },
];

const funil = [
  { etapa: "Simulações", qtd: 1238, pct: 100 },
  { etapa: "Análise bancária", qtd: 902, pct: 73 },
  { etapa: "Tratativas", qtd: 410, pct: 33 },
  { etapa: "Aprovadas", qtd: 414, pct: 33 },
  { etapa: "Formalizadas", qtd: 226, pct: 18 },
];

// Comparativo Financiamento × Home Equity por banco (volume em milhões)
const bancosComparativo = [
  { nome: "Itaú", fin: 92.4, he: 41.2 },
  { nome: "Bradesco", fin: 78.1, he: 36.8 },
  { nome: "Santander", fin: 64.3, he: 28.9 },
  { nome: "Caixa", fin: 88.7, he: 9.4 },
  { nome: "Inter", fin: 22.6, he: 38.1 },
  { nome: "BTG", fin: 14.2, he: 25.6 },
];

// Aprovações × Reprovações absolutas por banco
const bancosTaxas = [
  { nome: "Itaú", aprov: 78, reprov: 14, slaDias: 3.2 },
  { nome: "Bradesco", aprov: 71, reprov: 18, slaDias: 4.1 },
  { nome: "Santander", aprov: 64, reprov: 22, slaDias: 5.0 },
  { nome: "Caixa", aprov: 58, reprov: 27, slaDias: 7.8 },
  { nome: "Inter", aprov: 46, reprov: 31, slaDias: 2.6 },
  { nome: "BTG", aprov: 39, reprov: 24, slaDias: 3.4 },
];

const topVolumeSimulado = [
  { corretor: "Mariana Pires", volume: 64_800_000, qtd: 41 },
  { corretor: "Eduardo Lima", volume: 52_100_000, qtd: 34 },
  { corretor: "Camila Souza", volume: 47_700_000, qtd: 29 },
  { corretor: "Ricardo Alves", volume: 41_200_000, qtd: 27 },
  { corretor: "Patrícia Reis", volume: 36_900_000, qtd: 24 },
];

const topVolumeAprovado = [
  { corretor: "Eduardo Lima", volume: 28_400_000, qtd: 19, conversao: 55.9 },
  { corretor: "Mariana Pires", volume: 27_100_000, qtd: 24, conversao: 58.5 },
  { corretor: "Camila Souza", volume: 19_700_000, qtd: 17, conversao: 58.6 },
  { corretor: "Ricardo Alves", volume: 17_200_000, qtd: 15, conversao: 55.6 },
  { corretor: "Patrícia Reis", volume: 14_900_000, qtd: 13, conversao: 54.2 },
];

const alertas = [
  { tone: "warning" as const, label: "Documentação pendente há +5 dias", qtd: 38 },
  { tone: "direction" as const, label: "SLA estourado (>7 dias sem ação)", qtd: 17 },
  { tone: "direction" as const, label: "Simulações paradas há +10 dias", qtd: 61 },
  { tone: "warning" as const, label: "Reanálises bancárias em aberto", qtd: 22 },
  { tone: "info" as const, label: "Propostas sem responsável atribuído", qtd: 9 },
  { tone: "warning" as const, label: "Contratos aguardando assinatura digital", qtd: 14 },
  { tone: "direction" as const, label: "Comprovantes recusados (reenvio)", qtd: 11 },
  { tone: "info" as const, label: "Reavaliação de imóvel vencendo", qtd: 7 },
];

const fmtBRL = (v: number) =>
  v >= 1_000_000
    ? `R$ ${(v / 1_000_000).toFixed(1).replace(".", ",")} mi`
    : `R$ ${(v / 1_000).toFixed(0)} mil`;

/* ---------- Alertas operacionais ---------- */

type AlertaSeveridade = "critico" | "atencao" | "info";

type Alerta = {
  id: string;
  severidade: AlertaSeveridade;
  badge: string;
  label: string;
  qtd: number;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  acao: string;
  /** Deadline em ms para countdown — quando presente, renderiza relógio */
  deadlineInMs?: number;
};

const alertasOperacionais: Alerta[] = [
  {
    id: "sla-estourado",
    severidade: "critico",
    badge: "URGENTE",
    label: "SLA estourado em propostas ativas",
    qtd: 7,
    icon: AlertCircle,
    acao: "Ver propostas",
    deadlineInMs: 3 * 60 * 60 * 1000 + 27 * 60 * 1000,
  },
  {
    id: "docs-pendentes",
    severidade: "critico",
    badge: "URGENTE",
    label: "Documentos pendentes de envio",
    qtd: 12,
    icon: FileWarning,
    acao: "Ver pendências",
  },
  {
    id: "paradas",
    severidade: "atencao",
    badge: "ATENÇÃO",
    label: "Simulações paradas há +10 dias",
    qtd: 61,
    icon: AlertTriangle,
    acao: "Ver simulações",
  },
  {
    id: "retornos",
    severidade: "info",
    badge: "INFO",
    label: "Novos retornos dos bancos hoje",
    qtd: 18,
    icon: Bell,
    acao: "Abrir caixa de retornos",
  },
];

const severidadeStyles: Record<
  AlertaSeveridade,
  {
    card: string;
    border: string;
    iconWrap: string;
    iconColor: string;
    badge: string;
    button: string;
    pulse: boolean;
  }
> = {
  critico: {
    card: "bg-rose-50",
    border: "border-l-rose-500",
    iconWrap: "bg-rose-100",
    iconColor: "text-rose-600",
    badge: "bg-rose-100 text-rose-700",
    button: "text-rose-700 hover:text-rose-900",
    pulse: true,
  },
  atencao: {
    card: "bg-amber-50",
    border: "border-l-amber-400",
    iconWrap: "bg-amber-100",
    iconColor: "text-amber-600",
    badge: "bg-amber-100 text-amber-700",
    button: "text-amber-700 hover:text-amber-900",
    pulse: false,
  },
  info: {
    card: "bg-sky-50",
    border: "border-l-sky-400",
    iconWrap: "bg-sky-100",
    iconColor: "text-sky-600",
    badge: "bg-sky-100 text-sky-700",
    button: "text-sky-700 hover:text-sky-900",
    pulse: false,
  },
};

function Countdown({ initialMs }: { initialMs: number }) {
  const [remaining, setRemaining] = useState(initialMs);
  useEffect(() => {
    const id = setInterval(() => {
      setRemaining((r) => (r > 1000 ? r - 1000 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, []);
  const total = Math.max(0, Math.floor(remaining / 1000));
  const h = String(Math.floor(total / 3600)).padStart(2, "0");
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-white/70 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-rose-700">
      <Clock className="h-3 w-3" strokeWidth={2.5} />
      {h}:{m}:{s}
    </span>
  );
}

function AlertaCard({ alerta }: { alerta: Alerta }) {
  const s = severidadeStyles[alerta.severidade];
  const Icon = alerta.icon;
  return (
    <article
      className={`relative flex flex-col rounded-xl border border-border border-l-4 p-4 shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md ${s.card} ${s.border}`}
    >
      {s.pulse && (
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-y-0 left-0 w-1 animate-pulse rounded-l-xl ${s.border.replace("border-l-", "bg-")}`}
        />
      )}
      <div className="flex items-start justify-between gap-2">
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${s.iconWrap} ${s.iconColor}`}>
          <Icon className="h-5 w-5" strokeWidth={2.25} />
        </span>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${s.badge}`}>
          {alerta.badge}
        </span>
      </div>
      <p className="mt-3 text-3xl font-black leading-none tracking-tight text-graphite">
        {alerta.qtd}
      </p>
      <p className="mt-1.5 text-[12px] font-medium text-graphite/80">
        {alerta.label}
      </p>
      <div className="mt-3 flex items-center justify-between gap-2">
        <button
          type="button"
          className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider ${s.button}`}
        >
          {alerta.acao}
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.5} />
        </button>
        {alerta.deadlineInMs !== undefined && (
          <Countdown initialMs={alerta.deadlineInMs} />
        )}
      </div>
    </article>
  );
}



function PainelCorrespondente() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PainelHeader
        eyebrow="Visão Geral · Correspondente"
        title="Painel de Monitoramento"
        subtitle="Período: Junho/2026 · Produto: Todos · Banco: Todos · Status: Todos"
        badge="Visão Total · Auditoria Ativa"
      />

      {/* Filtros */}
      <Card className="p-3">
        <div className="flex items-center gap-2 border-b border-border pb-2.5">
          <Filter className="h-3.5 w-3.5 text-brand" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-graphite">
            Filtros ativos
          </span>
          <button className="ml-auto text-[11px] font-medium text-direction hover:underline">
            Limpar filtros
          </button>
        </div>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          <FilterPill label="Período" value="Junho/2026" active />
          <FilterPill label="Produto" value="Todos" />
          <FilterPill label="Banco" value="Todos (12)" />
          <FilterPill label="Corretor" value="Todos (47)" />
          <FilterPill label="Analista" value="Todos (8)" />
          <FilterPill label="Status" value="Todos" />
        </div>
      </Card>

      {/* KPIs */}
      <section>
        <SectionTitle
          icon={BarChart3}
          title="Indicadores principais"
          description="Cada cartão é clicável e abre o detalhamento das propostas que compõem o número."
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <KpiCard
            label="Simulações"
            value="1.238"
            hint="No mês · Ticket médio R$ 552 mil"
            tone="brand"
            icon={TrendingUp}
            trend={{ dir: "up", value: "+12,4%" }}
            breakdown={[
              { label: "Aprovadas", value: "412", tone: "success" },
              { label: "Reprovadas", value: "188", tone: "direction" },
              { label: "Em análise", value: "268", tone: "info" },
              { label: "Tratativa", value: "144", tone: "warning" },
            ]}
          />
          <KpiCard
            label="Aprovações"
            value="412"
            hint="R$ 248,6 mi · Conversão 33,3%"
            tone="success"
            icon={CheckCircle2}
            trend={{ dir: "up", value: "+8,1%" }}
          />
          <KpiCard
            label="Reprovações"
            value="188"
            hint="R$ 92,1 mi · 15,1% do volume"
            tone="direction"
            icon={XCircle}
            trend={{ dir: "down", value: "-3,2%" }}
          />
          <KpiCard
            label="Volume total do mês"
            value="R$ 684,2 mi"
            hint="+11,7% vs. Mai/26 · 1.238 propostas"
            tone="amber"
            icon={DollarSign}
            trend={{ dir: "up", value: "+11,7%" }}
            breakdown={[
              { label: "Financiamento", value: "R$ 484,7 mi", tone: "brand" },
              { label: "Home Equity", value: "R$ 199,5 mi", tone: "info" },
            ]}
          />
          <KpiCard
            label="Em andamento"
            value="268"
            hint="Tempo médio em análise: 4,8 dias"
            tone="info"
            icon={Clock}
            trend={{ dir: "up", value: "+4,6%" }}
          />
          <KpiCard
            label="Simulações paradas"
            value="61"
            hint="Sem ação há +10 dias · Requer triagem"
            tone="warning"
            icon={AlertTriangle}
            trend={{ dir: "down", value: "-6,8%" }}
          />
        </div>
      </section>

      {/* Alertas operacionais */}
      <section>
        <SectionTitle
          icon={Bell}
          title="Alertas operacionais"
          description="Hierarquia por urgência — críticos pulsam, ATENÇÃO em âmbar e INFO em azul claro."
        />
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {alertasOperacionais.map((a) => (
            <AlertaCard key={a.id} alerta={a} />
          ))}
        </div>
      </section>

      {/* Evolução + Distribuição */}
      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="p-4 lg:col-span-2">
          <SectionTitle
            icon={LineChartIcon}
            title="Evolução mensal"
            description="Simulações, aprovações, reprovações e volume financeiro nos últimos 6 meses."
          />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={evolucao} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="mes" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="simul" name="Simulações" fill="var(--brand)" radius={[2, 2, 0, 0]} />
                <Bar dataKey="aprov" name="Aprovadas" fill="var(--success)" radius={[2, 2, 0, 0]} />
                <Bar dataKey="reprov" name="Reprovadas" fill="var(--direction)" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-3 text-[11px]">
            <div>
              <p className="uppercase tracking-wider text-muted-foreground">Volume Jun</p>
              <p className="text-sm font-bold text-brand">R$ 684,2 mi</p>
            </div>
            <div>
              <p className="uppercase tracking-wider text-muted-foreground">Δ vs. Mai</p>
              <p className="text-sm font-bold text-[var(--success)]">+11,7%</p>
            </div>
            <div>
              <p className="uppercase tracking-wider text-muted-foreground">Δ vs. Jan</p>
              <p className="text-sm font-bold text-[var(--success)]">+66,1%</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <SectionTitle
            icon={PieChartIcon}
            title="Distribuição por status"
            description="Clique em uma fatia para filtrar."
          />
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDist}
                  dataKey="value"
                  innerRadius={42}
                  outerRadius={70}
                  paddingAngle={2}
                  stroke="var(--card)"
                >
                  {statusDist.map((s) => (
                    <Cell key={s.name} fill={s.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 space-y-1.5">
            {statusDist.map((s) => (
              <li key={s.name} className="flex items-center gap-2 text-[12px]">
                <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                <span className="text-graphite">{s.name}</span>
                <span className="ml-auto font-semibold text-graphite">{s.value}</span>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {/* Comparativo Financiamento × Home Equity por banco */}
      <section>
        <Card className="p-4">
          <SectionTitle
            icon={Banknote}
            title="Financiamento × Home Equity por banco"
            description="Volume contratado (em R$ milhões) por banco, segmentado por produto."
          />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bancosComparativo} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="nome" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" unit="mi" />
                <Tooltip
                  formatter={(v: number) => `R$ ${v.toFixed(1)} mi`}
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="fin" name="Financiamento Imobiliário" fill="var(--brand)" radius={[2, 2, 0, 0]} />
                <Bar dataKey="he" name="Home Equity" fill="var(--info)" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>

      {/* Aprovações × Reprovações por banco */}
      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <SectionTitle
            icon={CheckCircle2}
            title="Aprovações por banco"
            description="Taxa de aprovação (%) das simulações enviadas no mês."
          />
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={bancosTaxas}
                layout="vertical"
                margin={{ top: 4, right: 16, left: 8, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" unit="%" />
                <YAxis
                  type="category"
                  dataKey="nome"
                  tick={{ fontSize: 11 }}
                  stroke="var(--muted-foreground)"
                  width={70}
                />
                <Tooltip
                  formatter={(v: number) => `${v}%`}
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="aprov" name="Aprovação" fill="var(--success)" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4">
          <SectionTitle
            icon={XCircle}
            title="Reprovações por banco"
            description="Taxa de reprovação (%) por instituição financeira."
          />
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={bancosTaxas}
                layout="vertical"
                margin={{ top: 4, right: 16, left: 8, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" unit="%" />
                <YAxis
                  type="category"
                  dataKey="nome"
                  tick={{ fontSize: 11 }}
                  stroke="var(--muted-foreground)"
                  width={70}
                />
                <Tooltip
                  formatter={(v: number) => `${v}%`}
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="reprov" name="Reprovação" fill="var(--direction)" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>

      {/* Funil operacional + SLA por banco */}
      <section className="space-y-4">
        <Card className="p-4">
          <SectionTitle
            icon={Layers}
            title="Funil operacional"
            description="Da simulação à formalização — cada etapa mostra a conversão acumulada."
          />
          <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
            {funil.map((f, i) => {
              const isLast = i === funil.length - 1;
              return (
                <div key={f.etapa} className="flex flex-1 items-stretch gap-2">
                  <div
                    className={`relative flex flex-1 flex-col justify-between rounded-xl border p-4 transition-transform hover:-translate-y-0.5 ${
                      isLast
                        ? "border-brand bg-brand text-white shadow-md"
                        : "border-brand/15 bg-gradient-to-br from-brand/5 to-brand/15"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`text-[11px] font-bold uppercase tracking-[0.14em] ${
                          isLast ? "text-white/90" : "text-brand"
                        }`}
                      >
                        {i + 1}. {f.etapa}
                      </span>
                      <span
                        className={`inline-grid h-7 min-w-7 place-items-center rounded-full px-1.5 text-[10px] font-bold ${
                          isLast
                            ? "bg-white text-brand"
                            : "bg-brand text-white"
                        }`}
                      >
                        {f.pct}%
                      </span>
                    </div>
                    <p
                      className={`mt-3 text-4xl font-black tracking-tight ${
                        isLast ? "text-white" : "text-graphite"
                      }`}
                    >
                      {f.qtd.toLocaleString("pt-BR")}
                    </p>
                  </div>
                  {!isLast && (
                    <div className="hidden items-center lg:flex" aria-hidden>
                      <ChevronRight className="h-6 w-6 text-brand/40" strokeWidth={2.5} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-4">
          <SectionTitle
            icon={Timer}
            title="SLA por banco"
            description="Tempo médio de resposta (dias úteis) — verde < 3d · amarelo 3-7d · vermelho > 7d."
          />
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-[12px]">
              <thead className="bg-secondary text-[10px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">Banco</th>
                  <th className="px-3 py-2 text-left font-semibold">SLA médio</th>
                  <th className="px-3 py-2 text-right font-semibold">Dias</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {bancosTaxas
                  .slice()
                  .sort((a, b) => a.slaDias - b.slaDias)
                  .map((b) => {
                    const maxSla = 10;
                    const pct = Math.min(100, (b.slaDias / maxSla) * 100);
                    const barColor =
                      b.slaDias < 3
                        ? "bg-emerald-500"
                        : b.slaDias <= 7
                        ? "bg-amber-400"
                        : "bg-rose-500";
                    const textColor =
                      b.slaDias < 3
                        ? "text-emerald-600"
                        : b.slaDias <= 7
                        ? "text-amber-600"
                        : "text-rose-600";
                    return (
                      <tr key={b.nome}>
                        <td className="px-3 py-2.5">
                          <span className="inline-flex items-center gap-2 font-medium text-graphite">
                            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                            {b.nome}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                            <div
                              className={`h-full rounded-full ${barColor} transition-[width]`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </td>
                        <td className={`px-3 py-2.5 text-right font-bold tabular-nums ${textColor}`}>
                          {b.slaDias.toFixed(1).replace(".", ",")}d
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* Top corretores: volume simulado × volume aprovado */}
      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <SectionTitle
            icon={Trophy}
            title="Top corretores · Volume simulado"
            description="Maiores volumes apresentados em simulação no período."
          />
          <ul className="divide-y divide-border">
            {topVolumeSimulado.map((r, i) => (
              <li key={r.corretor} className="flex items-center gap-3 py-2.5">
                <span
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-sm text-[11px] font-bold ${
                    i === 0
                      ? "bg-brand text-brand-foreground"
                      : "bg-secondary text-graphite"
                  }`}
                >
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-graphite">
                    {r.corretor}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {r.qtd} simulações
                  </p>
                </div>
                <span className="text-[12px] font-bold text-brand">
                  {fmtBRL(r.volume)}
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-4">
          <SectionTitle
            icon={TrendingUp}
            title="Top corretores · Volume aprovado"
            description="Maior valor efetivamente aprovado pelas instituições."
          />
          <ul className="divide-y divide-border">
            {topVolumeAprovado.map((r, i) => (
              <li key={r.corretor} className="flex items-center gap-3 py-2.5">
                <span
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-sm text-[11px] font-bold ${
                    i === 0
                      ? "bg-[var(--success)] text-white"
                      : "bg-secondary text-graphite"
                  }`}
                >
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-graphite">
                    {r.corretor}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {r.qtd} aprovações · conv. {r.conversao.toFixed(1).replace(".", ",")}%
                  </p>
                </div>
                <span className="text-[12px] font-bold text-[var(--success)]">
                  {fmtBRL(r.volume)}
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {/* Alertas operacionais */}
      <section>
        <Card className="p-4">
          <SectionTitle
            icon={AlertTriangle}
            title="Alertas operacionais"
            description="Itens que exigem ação administrativa imediata."
            action={
              <span className="inline-flex items-center gap-1.5 rounded-sm bg-[color-mix(in_oklab,var(--direction)_10%,white)] px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-direction">
                <Zap className="h-3 w-3" /> 179 itens em risco
              </span>
            }
          />
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {alertas.map((a) => (
              <li
                key={a.label}
                className="flex items-center gap-3 rounded-sm border border-border bg-card p-3 hover:border-brand/40 hover:shadow-sm"
              >
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-sm text-[13px] font-bold ${
                    a.tone === "direction"
                      ? "bg-[color-mix(in_oklab,var(--direction)_10%,white)] text-direction"
                      : a.tone === "warning"
                      ? "bg-[color-mix(in_oklab,var(--warning)_12%,white)] text-[var(--warning)]"
                      : "bg-[color-mix(in_oklab,var(--info)_10%,white)] text-[var(--info)]"
                  }`}
                >
                  {a.qtd}
                </span>
                <p className="text-[12px] leading-snug text-graphite">{a.label}</p>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-3">
          <StatusDot tone="success" label="Sincronizado" />
          <StatusDot tone="info" label="Atualização em tempo real" />
          <StatusDot tone="brand" label="Visão consolidada" />
        </div>
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="h-3 w-3" />
          Acesso registrado em log de auditoria
        </span>
      </footer>
    </div>
  );
}
