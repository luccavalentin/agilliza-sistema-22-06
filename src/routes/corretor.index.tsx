import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  DollarSign,
  Filter,
  Layers,
  LineChart as LineChartIcon,
  Plus,
  ShieldCheck,
  Target,
  TrendingUp,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
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

export const Route = createFileRoute("/corretor/")({
  component: PainelCorretor,
});

const minhaEvolucao = [
  { mes: "Jan", simul: 12, aprov: 6, reprov: 3 },
  { mes: "Fev", simul: 18, aprov: 9, reprov: 4 },
  { mes: "Mar", simul: 22, aprov: 12, reprov: 5 },
  { mes: "Abr", simul: 16, aprov: 8, reprov: 3 },
  { mes: "Mai", simul: 24, aprov: 14, reprov: 4 },
  { mes: "Jun", simul: 28, aprov: 17, reprov: 5 },
];

const meusClientes = [
  { nome: "Fernanda Albuquerque", produto: "Financiamento", status: "Em análise", tone: "info" as const },
  { nome: "Roberto Tavares", produto: "Home Equity", status: "Documentação", tone: "warning" as const },
  { nome: "Aline Castro", produto: "Financiamento", status: "Aprovada", tone: "success" as const },
  { nome: "Marcos Vinícius", produto: "Home Equity", status: "Tratativa", tone: "warning" as const },
  { nome: "Bianca Moraes", produto: "Financiamento", status: "Reprovada", tone: "direction" as const },
];

const minhasTarefas = [
  { tarefa: "Enviar contracheque do cliente Roberto T.", prazo: "Hoje", tone: "direction" as const },
  { tarefa: "Retornar avaliação do imóvel · Aline C.", prazo: "Amanhã", tone: "warning" as const },
  { tarefa: "Reapresentar proposta · Bianca M.", prazo: "2 dias", tone: "warning" as const },
  { tarefa: "Confirmar assinatura digital · Fernanda A.", prazo: "3 dias", tone: "info" as const },
];

const meusBancos = [
  { nome: "Banco A", aprov: 82, simulacoes: 14 },
  { nome: "Banco B", aprov: 74, simulacoes: 11 },
  { nome: "Banco C", aprov: 66, simulacoes: 8 },
  { nome: "Banco D", aprov: 51, simulacoes: 5 },
];

const funilPessoal = [
  { etapa: "Simulações", qtd: 28, pct: 100 },
  { etapa: "Aprovadas", qtd: 17, pct: 61 },
  { etapa: "Formalizadas", qtd: 11, pct: 39 },
  { etapa: "Comissionadas", qtd: 9, pct: 32 },
];

const toneStatus: Record<string, string> = {
  success: "bg-[color-mix(in_oklab,var(--success)_12%,white)] text-[var(--success)]",
  info: "bg-[color-mix(in_oklab,var(--info)_10%,white)] text-[var(--info)]",
  warning: "bg-[color-mix(in_oklab,var(--warning)_12%,white)] text-[var(--warning)]",
  direction: "bg-[color-mix(in_oklab,var(--direction)_10%,white)] text-direction",
};

function PainelCorretor() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PainelHeader
        eyebrow="Visão Geral · Corretor"
        title="Bom dia, Mariana — sua carteira hoje"
        subtitle="Período: 30 dias · Produto: Todos · Banco: Todos · Status: Todos · Carteira pessoal"
        
      />

      {/* Atalhos rápidos */}
      <div className="flex flex-wrap gap-2">
        <button className="inline-flex items-center gap-1.5 rounded-sm bg-brand px-3 py-2 text-[12px] font-semibold uppercase tracking-wider text-brand-foreground hover:opacity-95">
          <Plus className="h-3.5 w-3.5" /> Nova simulação
        </button>
        <button className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-card px-3 py-2 text-[12px] font-semibold uppercase tracking-wider text-graphite hover:border-brand/40">
          <Users className="h-3.5 w-3.5" /> Novo cliente
        </button>
        <button className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-card px-3 py-2 text-[12px] font-semibold uppercase tracking-wider text-graphite hover:border-brand/40">
          <Activity className="h-3.5 w-3.5" /> Acompanhar propostas
        </button>
      </div>

      {/* Filtros */}
      <Card className="p-3">
        <div className="flex items-center gap-2 border-b border-border pb-2.5">
          <Filter className="h-3.5 w-3.5 text-brand" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-graphite">
            Filtros da minha carteira
          </span>
        </div>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          <FilterPill label="Período" value="Últimos 30 dias" active />
          <FilterPill label="Produto" value="Todos" />
          <FilterPill label="Banco" value="Todos" />
          <FilterPill label="Status" value="Todos" />
        </div>
      </Card>

      {/* KPIs */}
      <section>
        <SectionTitle
          icon={BarChart3}
          title="Meus indicadores"
          description="Volumes e conversões da sua carteira pessoal no período."
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <KpiCard
            label="Minhas simulações"
            value="28"
            hint="Ticket médio: R$ 486 mil"
            tone="brand"
            icon={TrendingUp}
            trend={{ dir: "up", value: "+9,4%" }}
          />
          <KpiCard
            label="Minhas aprovações"
            value="17"
            hint="R$ 8,2 mi · Conversão 60,7%"
            tone="success"
            icon={CheckCircle2}
            trend={{ dir: "up", value: "+14,2%" }}
          />
          <KpiCard
            label="Minhas reprovações"
            value="5"
            hint="Motivo principal: comprometimento de renda"
            tone="direction"
            icon={XCircle}
            trend={{ dir: "down", value: "-2,1%" }}
          />
          <KpiCard
            label="Volume total"
            value="R$ 13,6 mi"
            hint="Mês atual · todas as carteiras"
            tone="amber"
            icon={DollarSign}
            trend={{ dir: "up", value: "+7,8%" }}
          />
          <KpiCard
            label="Em andamento"
            value="9"
            hint="Aguardando retorno do banco"
            tone="info"
            icon={Clock}
            trend={{ dir: "up", value: "+3,5%" }}
          />
          <KpiCard
            label="Simulações paradas"
            value="4"
            hint="2 exigem ação hoje"
            tone="warning"
            icon={AlertTriangle}
            trend={{ dir: "down", value: "-1,6%" }}
          />
        </div>
      </section>

      {/* Evolução + Meta */}
      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="p-4 lg:col-span-2">
          <SectionTitle
            icon={LineChartIcon}
            title="Minha evolução mensal"
            description="Volumes pessoais nos últimos 6 meses."
          />
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={minhaEvolucao} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
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
        </Card>

        <Card className="p-4">
          <SectionTitle icon={Target} title="Meta do mês" description="Volume aprovado." />
          <div className="rounded-sm border border-border bg-secondary/40 p-3">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Realizado
            </p>
            <p className="text-2xl font-bold text-brand">R$ 8,2 mi</p>
            <p className="text-[11px] text-muted-foreground">de R$ 12,0 mi</p>
            <div className="mt-3 h-2.5 overflow-hidden rounded-sm bg-card">
              <div className="h-full bg-brand" style={{ width: "68%" }} />
            </div>
            <p className="mt-2 text-[11px] font-semibold text-[var(--success)]">
              68% da meta · faltam 8 dias úteis
            </p>
          </div>

          <SectionTitle
            icon={Layers}
            title="Meu funil"
            description="Da simulação ao comissionamento."
          />
          <ul className="space-y-2">
            {funilPessoal.map((f, i) => (
              <li key={f.etapa}>
                <div className="flex items-center justify-between text-[12px] text-graphite">
                  <span className="font-medium">
                    {i + 1}. {f.etapa}
                  </span>
                  <span className="font-semibold">
                    {f.qtd}
                    <span className="ml-1 text-muted-foreground font-normal">
                      · {f.pct}%
                    </span>
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-sm bg-secondary">
                  <div className="h-full bg-brand" style={{ width: `${f.pct}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {/* Clientes + Tarefas */}
      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <SectionTitle
            icon={Users}
            title="Meus clientes ativos"
            description="Clique para abrir o registro no CRM."
            action={
              <button className="text-[11px] font-semibold uppercase tracking-wider text-brand hover:underline">
                Ver carteira
              </button>
            }
          />
          <ul className="divide-y divide-border">
            {meusClientes.map((c) => (
              <li
                key={c.nome}
                className="flex items-center gap-3 py-2.5 hover:bg-secondary/40"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-sm bg-accent text-[11px] font-bold text-brand">
                  {c.nome
                    .split(" ")
                    .map((p) => p[0])
                    .slice(0, 2)
                    .join("")}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-graphite">
                    {c.nome}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{c.produto}</p>
                </div>
                <span
                  className={`rounded-sm px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${toneStatus[c.tone]}`}
                >
                  {c.status}
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-4">
          <SectionTitle
            icon={AlertTriangle}
            title="Próximas ações e SLA"
            description="Ordenadas por urgência."
          />
          <ul className="space-y-2">
            {minhasTarefas.map((t) => (
              <li
                key={t.tarefa}
                className="flex items-center gap-3 rounded-sm border border-border bg-card p-3"
              >
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-sm text-[10px] font-bold uppercase tracking-wider ${toneStatus[t.tone]}`}
                >
                  {t.prazo}
                </span>
                <p className="flex-1 text-[12px] leading-snug text-graphite">
                  {t.tarefa}
                </p>
                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
              </li>
            ))}
          </ul>

          <SectionTitle
            icon={Building2}
            title="Distribuição por banco"
            description="Onde você mais converte."
          />
          <ul className="space-y-2">
            {meusBancos.map((b) => (
              <li key={b.nome}>
                <div className="flex items-center justify-between text-[12px] text-graphite">
                  <span className="font-medium">{b.nome}</span>
                  <span className="text-[11px] text-muted-foreground">
                    {b.simulacoes} simulações ·{" "}
                    <span className="font-semibold text-[var(--success)]">
                      {b.aprov}%
                    </span>
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-sm bg-secondary">
                  <div
                    className="h-full bg-brand"
                    style={{ width: `${b.aprov}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-3">
          <StatusDot tone="success" label="Sincronizado com a operação" />
          <StatusDot tone="brand" label="Carteira pessoal" />
        </div>
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="h-3 w-3" />
          Permissão restrita à sua carteira
        </span>
      </footer>
    </div>
  );
}
