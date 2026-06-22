import { useMemo } from "react";
import {
  AlertTriangle,
  BarChart3,
  Briefcase,
  Building2,
  CheckCircle2,
  Clock,
  FileText,
  Layers,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";
import {
  Area,
  AreaChart,
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
import { CLIENTES_MOCK, fmtBRL, type Cliente } from "@/data/homefin-clientes";

/* ============================================================
 * Painel de Monitoramento de Clientes
 * KPIs, evolução, funil, produtos de interesse e distribuição
 * por corretor, imobiliária e comercial. Calculado a partir de
 * CLIENTES_MOCK (mesma base do CRM) + séries históricas mock.
 * ============================================================ */

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"];

// Série histórica de cadastros (mock — substituir pela API)
const evolucaoCadastros = [
  { mes: "Jan", cadastrados: 142, ativos: 124, inativos: 18 },
  { mes: "Fev", cadastrados: 168, ativos: 149, inativos: 19 },
  { mes: "Mar", cadastrados: 184, ativos: 162, inativos: 22 },
  { mes: "Abr", cadastrados: 156, ativos: 138, inativos: 18 },
  { mes: "Mai", cadastrados: 212, ativos: 188, inativos: 24 },
  { mes: "Jun", cadastrados: 238, ativos: 211, inativos: 27 },
];

// Mapeamento de "comercial responsável" (gerente comercial interno)
const COMERCIAL_POR_CORRETOR: Record<string, string> = {
  "Mariana Pires": "Bruno Ferraz",
  "Eduardo Lima": "Bruno Ferraz",
  "Camila Souza": "Letícia Andrade",
  "Ricardo Alves": "Letícia Andrade",
  "Patrícia Reis": "Diego Sampaio",
};

const PRODUTO_COLORS: Record<string, string> = {
  "Financiamento Imobiliário": "var(--brand)",
  "Home Equity": "var(--info)",
  Portabilidade: "var(--warning)",
};

function topN<T extends { nome: string; qtd: number }>(arr: T[], n = 5) {
  return arr.slice().sort((a, b) => b.qtd - a.qtd).slice(0, n);
}

function isDoMes(iso: string, mesAtual = 5 /* Jun = 5 */) {
  const d = new Date(iso);
  return d.getMonth() === mesAtual;
}

export function ClientesMonitoringDashboard({
  clientes,
}: {
  clientes: Cliente[];
}) {
  const dash = useMemo(() => calcular(clientes), [clientes]);

  return (
    <section className="space-y-4">
      {/* KPIs */}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Kpi label="Total de clientes"   value={dash.total.toString()}      hint={`${dash.ativos} ativos`}                    icon={Users}         tone="brand" />
        <Kpi label="Cadastrados no mês"  value={dash.cadMes.toString()}     hint={`Δ +${dash.deltaMes}% vs. mês anterior`}    icon={UserPlus}      tone="info" />
        <Kpi label="Em aprovação"        value={dash.emAprovacao.toString()} hint="Propostas em análise bancária"             icon={Clock}         tone="info" />
        <Kpi label="Reprovados do mês"   value={dash.reprovadosMes.toString()} hint={`${dash.taxaReprov}% do mês`}             icon={XCircle}       tone="direction" />
        <Kpi label="Doc. pendente"       value={dash.pendentes.toString()}  hint="Documentação aguardando envio/correção"     icon={AlertTriangle} tone="warning" />
        <Kpi label="Ticket médio aprov." value={fmtBRL(dash.ticketMedio)}   hint="Média de financiamento das aprovações"      icon={Wallet}        tone="success" />
      </div>

      {/* Evolução + Produtos */}
      <div className="grid gap-3 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardTitle icon={LineChartIcon} title="Evolução de clientes cadastrados" subtitle="Últimos 6 meses · ativos vs. inativos" />
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={evolucaoCadastros} margin={{ top: 6, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradAtivos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--brand)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradInativos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--warning)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--warning)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="mes" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="ativos"    name="Ativos"    stroke="var(--brand)"   fill="url(#gradAtivos)"   strokeWidth={2} />
                <Area type="monotone" dataKey="inativos"  name="Inativos"  stroke="var(--warning)" fill="url(#gradInativos)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardTitle icon={PieChartIcon} title="Produtos de interesse" subtitle="Distribuição das oportunidades ativas" />
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={dash.produtos} dataKey="value" innerRadius={38} outerRadius={64} paddingAngle={2} stroke="var(--card)">
                  {dash.produtos.map((p) => (
                    <Cell key={p.name} fill={PRODUTO_COLORS[p.name] ?? "var(--brand)"} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 space-y-1.5">
            {dash.produtos.map((p) => (
              <li key={p.name} className="flex items-center gap-2 text-[12px]">
                <span className="h-2 w-2 rounded-full" style={{ background: PRODUTO_COLORS[p.name] ?? "var(--brand)" }} />
                <span className="text-graphite">{p.name}</span>
                <span className="ml-auto font-semibold text-graphite">{p.value}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Funil + Estágio CRM */}
      <div className="grid gap-3 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardTitle icon={Layers} title="Funil de clientes" subtitle="Conversão do cadastro à formalização" />
          <ul className="space-y-2">
            {dash.funil.map((f, i) => (
              <li key={f.etapa}>
                <div className="flex items-center justify-between text-[12px] text-graphite">
                  <span className="font-medium">{i + 1}. {f.etapa}</span>
                  <span className="font-semibold">
                    {f.qtd.toLocaleString("pt-BR")}
                    <span className="ml-1 font-normal text-muted-foreground">· {f.pct}%</span>
                  </span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-sm bg-secondary">
                  <div className="h-full rounded-sm bg-brand" style={{ width: `${f.pct}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardTitle icon={CheckCircle2} title="Status das oportunidades" subtitle="Distribuição atual" />
          <ul className="space-y-2">
            {dash.statusOp.map((s) => (
              <li key={s.label} className="flex items-center gap-2 text-[12px]">
                <span className={`h-2 w-2 rounded-full ${s.dot}`} />
                <span className="text-graphite">{s.label}</span>
                <span className="ml-auto font-semibold text-graphite">{s.qtd}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 rounded-sm border border-border bg-secondary/40 p-2.5">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Tempo médio cadastro → aprovação
            </p>
            <p className="mt-1 text-lg font-bold text-brand">
              {dash.tempoMedio.toFixed(1).replace(".", ",")} dias
            </p>
          </div>
        </Card>
      </div>

      {/* Distribuições por vínculo */}
      <div className="grid gap-3 lg:grid-cols-3">
        <RankCard
          title="Clientes por corretor"
          icon={TrendingUp}
          data={dash.porCorretor}
          color="var(--brand)"
        />
        <RankCard
          title="Clientes por imobiliária"
          icon={Building2}
          data={dash.porImobiliaria}
          color="var(--info)"
        />
        <RankCard
          title="Clientes por comercial"
          icon={Briefcase}
          data={dash.porComercial}
          color="var(--success)"
        />
      </div>

      {/* Resumo documental */}
      <Card>
        <CardTitle icon={FileText} title="Saúde documental dos clientes" subtitle="Status agregado de todos os documentos enviados" />
        <div className="grid gap-2 sm:grid-cols-4">
          {dash.docs.map((d) => (
            <div key={d.label} className="rounded-sm border border-border bg-secondary/30 p-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{d.label}</span>
                <span className={`h-2 w-2 rounded-full ${d.dot}`} />
              </div>
              <p className="mt-1 text-lg font-bold text-graphite">{d.qtd}</p>
              <p className="text-[11px] text-muted-foreground">{d.pct}% do total</p>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}

/* =========================================================== */

function calcular(clientes: Cliente[]) {
  const total = clientes.length;
  const ativos = clientes.filter((c) => c.tipoSituacao === "A").length;

  const cadMes = clientes.filter((c) => isDoMes(c.criadoEm)).length;
  const cadMesAnterior = Math.max(1, clientes.filter((c) => {
    const d = new Date(c.criadoEm);
    return d.getMonth() === 4;
  }).length);
  const deltaMes = Math.round(((cadMes - cadMesAnterior) / cadMesAnterior) * 100);

  const todasPropostas = clientes.flatMap((c) => c.propostas);
  const emAprovacao = todasPropostas.filter((p) => p.status === "em_analise" || p.status === "incluida" || p.status === "tratativa").length;
  const reprovadosMes = todasPropostas.filter((p) => p.status === "reprovada").length;
  const propostasMes = Math.max(1, todasPropostas.length);
  const taxaReprov = Math.round((reprovadosMes / propostasMes) * 100);

  const pendentes = clientes.filter((c) => c.possuiPendencia).length;

  const aprovadas = clientes.flatMap((c) =>
    c.oportunidades.filter((o) => c.propostas.some((p) => p.status === "aprovada")),
  );
  const ticketMedio = aprovadas.length
    ? aprovadas.reduce((a, o) => a + o.valorFinanciamento, 0) / aprovadas.length
    : 0;

  // Produtos de interesse
  const produtosMap = new Map<string, number>();
  clientes.forEach((c) =>
    c.oportunidades.forEach((o) => produtosMap.set(o.nomeOperacao, (produtosMap.get(o.nomeOperacao) ?? 0) + 1)),
  );
  const produtos = Array.from(produtosMap, ([name, value]) => ({ name, value }));

  // Funil
  const comSimulacao = clientes.filter((c) => c.simulacoes.length > 0).length;
  const comProposta  = clientes.filter((c) => c.propostas.length > 0).length;
  const comAprovada  = clientes.filter((c) => c.propostas.some((p) => p.status === "aprovada")).length;
  const funilBase = Math.max(1, total);
  const funil = [
    { etapa: "Cadastrados",        qtd: total,         pct: 100 },
    { etapa: "Com simulação",      qtd: comSimulacao,  pct: Math.round((comSimulacao / funilBase) * 100) },
    { etapa: "Com proposta",       qtd: comProposta,   pct: Math.round((comProposta  / funilBase) * 100) },
    { etapa: "Aprovados",          qtd: comAprovada,   pct: Math.round((comAprovada  / funilBase) * 100) },
    { etapa: "Formalizados",       qtd: Math.round(comAprovada * 0.6), pct: Math.round(((comAprovada * 0.6) / funilBase) * 100) },
  ];

  // Status oportunidades
  const op = clientes.flatMap((c) => c.oportunidades);
  const statusOp = [
    { label: "Em andamento", dot: "bg-[var(--info)]",    qtd: op.filter((o) => o.tipoSituacao === "A").length },
    { label: "Tratativa",    dot: "bg-[var(--warning)]", qtd: op.filter((o) => o.tipoSituacao === "T").length },
    { label: "Concluídas",   dot: "bg-[var(--success)]", qtd: op.filter((o) => o.tipoSituacao === "C").length },
  ];

  // Distribuições
  const porCorretor = agrupar(clientes, (c) => c.nomeCorretor);
  const porImobiliaria = agrupar(clientes, (c) => c.nomeImobiliaria ?? "Sem imobiliária");
  const porComercial = agrupar(clientes, (c) => COMERCIAL_POR_CORRETOR[c.nomeCorretor] ?? c.nomeAnalista ?? "Não atribuído");

  // Documentos
  const docs0 = clientes.flatMap((c) => c.documentos);
  const docsTotal = Math.max(1, docs0.length);
  const docs = [
    { label: "Aceitos",   qtd: docs0.filter((d) => d.situacao === "aceito").length,    dot: "bg-[var(--success)]" },
    { label: "Enviados",  qtd: docs0.filter((d) => d.situacao === "enviado").length,   dot: "bg-[var(--info)]" },
    { label: "Pendentes", qtd: docs0.filter((d) => d.situacao === "pendente").length,  dot: "bg-[var(--warning)]" },
    { label: "Rejeitados",qtd: docs0.filter((d) => d.situacao === "rejeitado").length, dot: "bg-direction" },
  ].map((d) => ({ ...d, pct: Math.round((d.qtd / docsTotal) * 100) }));

  return {
    total, ativos, cadMes, deltaMes,
    emAprovacao, reprovadosMes, taxaReprov, pendentes,
    ticketMedio,
    produtos,
    funil,
    statusOp,
    tempoMedio: 6.4,
    porCorretor: topN(porCorretor),
    porImobiliaria: topN(porImobiliaria),
    porComercial: topN(porComercial),
    docs,
  };
}

function agrupar(clientes: Cliente[], key: (c: Cliente) => string) {
  const m = new Map<string, number>();
  clientes.forEach((c) => {
    const k = key(c);
    m.set(k, (m.get(k) ?? 0) + 1);
  });
  return Array.from(m, ([nome, qtd]) => ({ nome, qtd }));
}

/* =========================================================== */

const tooltipStyle = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 6,
  fontSize: 12,
} as const;

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-md border border-border bg-card p-3.5 ${className}`}>
      {children}
    </div>
  );
}

function CardTitle({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-3 flex items-start gap-2">
      <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-sm bg-accent text-brand">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0">
        <h3 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-graphite">{title}</h3>
        {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}

type Tone = "brand" | "success" | "warning" | "direction" | "info";
const TONE_BG: Record<Tone, string> = {
  brand: "bg-accent text-brand",
  success: "bg-[color-mix(in_oklab,var(--success)_12%,white)] text-[var(--success)]",
  warning: "bg-[color-mix(in_oklab,var(--warning)_12%,white)] text-[var(--warning)]",
  direction: "bg-[color-mix(in_oklab,var(--direction)_10%,white)] text-direction",
  info: "bg-[color-mix(in_oklab,var(--info)_10%,white)] text-[var(--info)]",
};

function Kpi({
  label,
  value,
  hint,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: Tone;
}) {
  return (
    <button
      type="button"
      className="group flex w-full flex-col rounded-md border border-border bg-card p-3 text-left transition hover:border-brand/40 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">{label}</span>
        <span className={`grid h-7 w-7 place-items-center rounded-sm ${TONE_BG[tone]}`}>
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>
      <span className="mt-2 text-[22px] font-bold leading-none tracking-tight text-graphite">{value}</span>
      {hint && <p className="mt-1.5 text-[11px] text-muted-foreground">{hint}</p>}
    </button>
  );
}

function RankCard({
  title,
  icon: Icon,
  data,
  color,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  data: { nome: string; qtd: number }[];
  color: string;
}) {
  return (
    <Card>
      <CardTitle icon={Icon} title={title} subtitle="Top 5 por volume de clientes" />
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 12, left: 4, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" allowDecimals={false} />
            <YAxis type="category" dataKey="nome" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" width={110} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="qtd" fill={color} radius={[0, 2, 2, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

// Ícone exportado só para evitar tree-shake do BarChart3 sem uso
export const _icons = { BarChart3 };
