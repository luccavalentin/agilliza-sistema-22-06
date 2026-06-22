import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  Banknote,
  BarChart3,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  Filter,
  Layers,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Trophy,
  XCircle,
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

const evolucao = [
  { mes: "Jan", simul: 184, aprov: 96, reprov: 38, trat: 22 },
  { mes: "Fev", simul: 212, aprov: 118, reprov: 41, trat: 25 },
  { mes: "Mar", simul: 246, aprov: 132, reprov: 47, trat: 31 },
  { mes: "Abr", simul: 198, aprov: 110, reprov: 36, trat: 18 },
  { mes: "Mai", simul: 268, aprov: 152, reprov: 44, trat: 28 },
  { mes: "Jun", simul: 304, aprov: 176, reprov: 49, trat: 34 },
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

const bancos = [
  { nome: "Banco A", volume: 184_500_000, aprov: 86, reprov: 14 },
  { nome: "Banco B", volume: 142_300_000, aprov: 78, reprov: 22 },
  { nome: "Banco C", volume: 96_700_000, aprov: 71, reprov: 29 },
  { nome: "Banco D", volume: 74_100_000, aprov: 65, reprov: 35 },
  { nome: "Banco E", volume: 41_900_000, aprov: 58, reprov: 42 },
];

const ranking = [
  { corretor: "Mariana Pires", volume: 28_400_000, aprovacoes: 24 },
  { corretor: "Eduardo Lima", volume: 22_100_000, aprovacoes: 19 },
  { corretor: "Camila Souza", volume: 19_700_000, aprovacoes: 17 },
  { corretor: "Ricardo Alves", volume: 17_200_000, aprovacoes: 15 },
  { corretor: "Patrícia Reis", volume: 14_900_000, aprovacoes: 13 },
];

const alertas = [
  { tone: "warning" as const, label: "Documentação pendente há +5 dias", qtd: 38 },
  { tone: "direction" as const, label: "SLA estourado (>7 dias sem ação)", qtd: 17 },
  { tone: "info" as const, label: "Propostas sem responsável atribuído", qtd: 9 },
  { tone: "warning" as const, label: "Reanálises bancárias em aberto", qtd: 22 },
];

const fmtBRL = (v: number) =>
  v >= 1_000_000
    ? `R$ ${(v / 1_000_000).toFixed(1).replace(".", ",")} mi`
    : `R$ ${(v / 1_000).toFixed(0)} mil`;

function PainelCorrespondente() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PainelHeader
        eyebrow="Visão Geral · Correspondente"
        title="Painel de Monitoramento"
        subtitle="Período: 30 dias · Produto: Todos · Banco: Todos · Status: Todos · Visão consolidada do ecossistema"
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
          <FilterPill label="Período" value="Últimos 30 dias" active />
          <FilterPill label="Produto" value="Todos" />
          <FilterPill label="Banco" value="Todos (12)" />
          <FilterPill label="Corretor" value="Todos (47)" />
          <FilterPill label="Analista" value="Todos (8)" />
          <FilterPill label="Status" value="Todos" />
          <FilterPill label="Datas" value="Personalizado" />
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
            hint="Volume: R$ 612,4 mi"
            tone="brand"
            icon={Activity}
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
          />
          <KpiCard
            label="Reprovações"
            value="188"
            hint="R$ 92,1 mi · 15,1% do volume"
            tone="direction"
            icon={XCircle}
          />
          <KpiCard
            label="Em andamento"
            value="268"
            hint="Tempo médio em análise: 4,8 dias"
            tone="info"
            icon={Clock}
          />
          <KpiCard
            label="Em tratativa"
            value="144"
            hint="32 atrasadas (>7 dias)"
            tone="warning"
            icon={AlertTriangle}
          />
          <KpiCard
            label="Não sequenciadas"
            value="61"
            hint="Sem ação há +10 dias"
            tone="direction"
            icon={AlertTriangle}
          />
        </div>
      </section>

      {/* Evolução + Distribuição */}
      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="p-4 lg:col-span-2">
          <SectionTitle
            icon={LineChartIcon}
            title="Evolução mensal"
            description="Simulações, aprovações, reprovações e tratativas nos últimos 6 meses."
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
                <Bar dataKey="trat" name="Tratativa" fill="var(--warning)" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
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

      {/* Funil + Comparativo produto */}
      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="p-4 lg:col-span-2">
          <SectionTitle
            icon={Layers}
            title="Funil operacional"
            description="Da simulação à formalização."
          />
          <ul className="space-y-2">
            {funil.map((f, i) => (
              <li key={f.etapa}>
                <div className="flex items-center justify-between text-[12px] text-graphite">
                  <span className="font-medium">
                    {i + 1}. {f.etapa}
                  </span>
                  <span className="font-semibold">
                    {f.qtd.toLocaleString("pt-BR")}{" "}
                    <span className="text-muted-foreground font-normal">· {f.pct}%</span>
                  </span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-sm bg-secondary">
                  <div
                    className="h-full rounded-sm bg-brand"
                    style={{ width: `${f.pct}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-4">
          <SectionTitle
            icon={Banknote}
            title="Produto"
            description="Financiamento × Home Equity"
          />
          <div className="space-y-3">
            {[
              {
                nome: "Financiamento Imobiliário",
                volume: "R$ 412,8 mi",
                ticket: "R$ 612 mil",
                pct: 68,
              },
              {
                nome: "Home Equity",
                volume: "R$ 199,6 mi",
                ticket: "R$ 384 mil",
                pct: 32,
              },
            ].map((p) => (
              <div key={p.nome} className="rounded-sm border border-border bg-secondary/40 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-graphite">{p.nome}</span>
                  <span className="text-[11px] text-muted-foreground">Ticket {p.ticket}</span>
                </div>
                <p className="mt-0.5 text-lg font-bold text-brand">{p.volume}</p>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-sm bg-card">
                  <div className="h-full bg-brand" style={{ width: `${p.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Bancos + Ranking */}
      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <SectionTitle
            icon={Building2}
            title="Performance por banco"
            description="Volume e taxa de aprovação."
          />
          <ul className="divide-y divide-border">
            {bancos.map((b) => (
              <li key={b.nome} className="flex items-center gap-3 py-2.5">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-sm bg-accent text-[11px] font-bold text-brand">
                  {b.nome.split(" ")[1]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-graphite">{b.nome}</p>
                  <p className="text-[11px] text-muted-foreground">{fmtBRL(b.volume)}</p>
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="inline-flex items-center gap-1 font-semibold text-[var(--success)]">
                    <TrendingUp className="h-3 w-3" /> {b.aprov}%
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-direction">
                    <TrendingDown className="h-3 w-3" /> {b.reprov}%
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-4">
          <SectionTitle
            icon={Trophy}
            title="Ranking de corretores"
            description="Clique para abrir a visão filtrada da carteira."
          />
          <ul className="divide-y divide-border">
            {ranking.map((r, i) => (
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
                    {r.aprovacoes} aprovações
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
      </section>

      {/* Alertas */}
      <section>
        <Card className="p-4">
          <SectionTitle
            icon={AlertTriangle}
            title="Alertas operacionais"
            description="Itens que exigem ação administrativa imediata."
          />
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {alertas.map((a) => (
              <li
                key={a.label}
                className="flex items-center gap-3 rounded-sm border border-border bg-card p-3"
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
          <StatusDot tone="brand" label="Visão total do ecossistema" />
        </div>
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="h-3 w-3" />
          Acesso registrado em log de auditoria
        </span>
      </footer>
    </div>
  );
}
