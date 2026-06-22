import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  Briefcase,
  CheckCircle2,
  Database,
  Download,
  FileBarChart2,
  FileText,
  Filter as FilterIcon,
  Layers,
  Map as MapIcon,
  ShieldCheck,
  TrendingUp,
  Users,
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
import { CLIENTES_MOCK, DOM_UFS, fmtBRL, type Cliente } from "@/data/homefin-clientes";

export type RelatoriosScope = "correspondente" | "corretor";

const RELATORIOS = [
  { id: "carteira",   label: "Carteira de Clientes",     icon: Users },
  { id: "producao",   label: "Produção por Corretor",    icon: TrendingUp },
  { id: "funil",      label: "Funil Comercial",          icon: Layers },
  { id: "qualidade",  label: "Qualidade da Base",        icon: Database },
  { id: "lgpd",       label: "LGPD & Compliance",        icon: ShieldCheck },
  { id: "origem",     label: "Origem e Captação",        icon: MapIcon },
] as const;
type RelId = typeof RELATORIOS[number]["id"];

const ORIGENS = ["Indicação", "Site", "Parceiro", "Importação", "Campanha"];

export function ClienteRelatorios({ scope }: { scope: RelatoriosScope }) {
  const [rel, setRel] = useState<RelId>("carteira");
  const [periodo, setPeriodo] = useState("ult-30");
  const [uf, setUf] = useState("");
  const [tipoPessoa, setTipoPessoa] = useState("");
  const [tipoQualificacao, setTipoQualificacao] = useState("");
  const [parceiro, setParceiro] = useState("");

  const base = useMemo(() => {
    let list: Cliente[] = scope === "corretor"
      ? CLIENTES_MOCK.filter((c) => c.nomeCorretor === "Mariana Pires")
      : CLIENTES_MOCK;
    if (uf) list = list.filter((c) => c.uf === uf);
    if (tipoPessoa) list = list.filter((c) => c.tipoPessoa === tipoPessoa);
    if (tipoQualificacao) list = list.filter((c) => c.tipoQualificacao === tipoQualificacao);
    if (parceiro) list = list.filter((c) => c.nomeCorretor.toLowerCase().includes(parceiro.toLowerCase()));
    return list;
  }, [scope, uf, tipoPessoa, tipoQualificacao, parceiro]);

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      {/* Header */}
      <header className="border-b border-border pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-secondary px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-brand">
              <span className="h-1.5 w-1.5 rounded-full bg-direction" />
              {scope === "correspondente" ? "Correspondente · CRM" : "Corretor · CRM"}
            </span>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-graphite">
              Relatórios de Clientes
            </h1>
            <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
              Agregações sobre Participants × Opportunities — mesmas fontes do Painel de Monitoramento,
              garantindo consistência total entre dashboards e relatórios.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <ExportBtn label="CSV" />
            <ExportBtn label="XLSX" />
            <ExportBtn label="PDF" hint="Confidencial · uso interno" />
          </div>
        </div>
      </header>

      {/* Filtros globais */}
      <section className="rounded-md border border-border bg-card p-3">
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <FilterIcon className="h-3.5 w-3.5 text-brand" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-graphite">
            Filtros globais
          </span>
        </div>
        <div className="mt-3 grid gap-2 md:grid-cols-2 lg:grid-cols-5">
          <Sel label="Período (cadastro)" value={periodo} onChange={setPeriodo} opts={[
            { v: "ult-7", l: "Últimos 7 dias" },
            { v: "ult-30", l: "Últimos 30 dias" },
            { v: "mtd", l: "Mês atual" },
            { v: "ytd", l: "Ano atual" },
            { v: "12m", l: "Últimos 12 meses" },
          ]} />
          <Txt label="Parceiro / Regional" value={parceiro} onChange={setParceiro} placeholder={scope === "corretor" ? "Bloqueado para corretor" : "Buscar corretor"} disabled={scope === "corretor"} />
          <Sel label="UF" value={uf} onChange={setUf} opts={[{ v: "", l: "Todas" }, ...DOM_UFS.map((u) => ({ v: u, l: u }))]} />
          <Sel label="Tipo de pessoa" value={tipoPessoa} onChange={setTipoPessoa} opts={[
            { v: "", l: "Todos" }, { v: "F", l: "Física" }, { v: "J", l: "Jurídica" }]} />
          <Sel label="Qualificação" value={tipoQualificacao} onChange={setTipoQualificacao} opts={[
            { v: "", l: "Todos" }, { v: "CO", l: "Comprador" }, { v: "VD", l: "Vendedor" }]} />
        </div>
      </section>

      {/* Tabs de relatórios */}
      <nav className="flex flex-wrap gap-1.5">
        {RELATORIOS.map((r) => (
          <button
            key={r.id}
            onClick={() => setRel(r.id)}
            className={`inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition ${
              rel === r.id
                ? "border-brand bg-brand text-brand-foreground"
                : "border-border bg-card text-graphite hover:border-brand/40"
            }`}
          >
            <r.icon className="h-3.5 w-3.5" /> {r.label}
          </button>
        ))}
      </nav>

      {/* Conteúdo do relatório */}
      <section className="rounded-md border border-border bg-card p-4">
        {rel === "carteira"  && <RelCarteira  base={base} />}
        {rel === "producao"  && <RelProducao  base={base} />}
        {rel === "funil"     && <RelFunil     base={base} />}
        {rel === "qualidade" && <RelQualidade base={base} />}
        {rel === "lgpd"      && <RelLGPD      base={base} />}
        {rel === "origem"    && <RelOrigem    base={base} />}
      </section>

    </div>
  );
}

/* ====================== 1. Carteira de Clientes ====================== */

function RelCarteira({ base }: { base: Cliente[] }) {
  const ativos = base.filter((c) => c.tipoSituacao === "A").length;
  const inativos = base.length - ativos;
  const pf = base.filter((c) => c.tipoPessoa === "F").length;
  const pj = base.length - pf;

  const porUf = useMemo(() => {
    const m = new Map<string, number>();
    base.forEach((c) => m.set(c.uf, (m.get(c.uf) ?? 0) + 1));
    return Array.from(m, ([uf, qtd]) => ({ uf, qtd })).sort((a, b) => b.qtd - a.qtd).slice(0, 10);
  }, [base]);

  const topCorretores = useMemo(() => {
    const m = new Map<string, number>();
    base.forEach((c) => m.set(c.nomeCorretor, (m.get(c.nomeCorretor) ?? 0) + 1));
    return Array.from(m, ([nome, qtd]) => ({ nome, qtd })).sort((a, b) => b.qtd - a.qtd).slice(0, 10);
  }, [base]);

  return (
    <div className="space-y-4">
      <RelHeader icon={Users} title="Carteira de Clientes" subtitle="Composição da base e distribuição geográfica" />
      <div className="grid gap-3 sm:grid-cols-4">
        <Kpi label="Total"    value={base.length.toString()} icon={Users} />
        <Kpi label="Ativos"   value={ativos.toString()}      icon={CheckCircle2} tone="success" />
        <Kpi label="Inativos" value={inativos.toString()}    icon={AlertTriangle} tone="warning" />
        <Kpi label="PF / PJ"  value={`${pf} / ${pj}`}        icon={Briefcase}    tone="info" />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <ChartCard title="Distribuição por UF (Top 10)" subtitle="Heatmap geográfico simplificado">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={porUf}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="uf" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <Tooltip contentStyle={tooltip} />
              <Bar dataKey="qtd" fill="var(--brand)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top 10 corretores por carteira" subtitle="Quantidade de clientes vinculados">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topCorretores} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <YAxis type="category" dataKey="nome" width={120} tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
              <Tooltip contentStyle={tooltip} />
              <Bar dataKey="qtd" fill="var(--info)" radius={[0, 2, 2, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

/* ====================== 2. Produção por Corretor ====================== */

function RelProducao({ base }: { base: Cliente[] }) {
  const linhas = useMemo(() => {
    const m = new Map<string, { cad: number; opor: number; sim: number; prop: number; contr: number; ticket: number }>();
    base.forEach((c) => {
      const row = m.get(c.nomeCorretor) ?? { cad: 0, opor: 0, sim: 0, prop: 0, contr: 0, ticket: 0 };
      row.cad += 1;
      row.opor += c.oportunidades.length > 0 ? 1 : 0;
      row.sim += c.simulacoes.length > 0 ? 1 : 0;
      row.prop += c.propostas.length > 0 ? 1 : 0;
      row.contr += c.propostas.some((p) => p.status === "aprovada") ? 1 : 0;
      row.ticket += c.oportunidades.reduce((a, o) => a + o.valorFinanciamento, 0);
      m.set(c.nomeCorretor, row);
    });
    return Array.from(m, ([nome, r]) => ({
      nome, ...r,
      ticketMedio: r.opor > 0 ? r.ticket / r.opor : 0,
      conv: r.cad > 0 ? Math.round((r.contr / r.cad) * 100) : 0,
    })).sort((a, b) => b.ticket - a.ticket);
  }, [base]);

  return (
    <div className="space-y-4">
      <RelHeader icon={TrendingUp} title="Produção por Corretor" subtitle="Conversão por etapa e ticket médio (valorFinanciamento)" />
      <div className="overflow-x-auto rounded-sm border border-border">
        <table className="w-full text-left text-[12px]">
          <thead className="bg-secondary/40 text-[10px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-3 py-2">Corretor</th>
              <th className="px-3 py-2 text-right">Cadastros</th>
              <th className="px-3 py-2 text-right">Oportunidades</th>
              <th className="px-3 py-2 text-right">Simulações</th>
              <th className="px-3 py-2 text-right">Propostas</th>
              <th className="px-3 py-2 text-right">Contratos</th>
              <th className="px-3 py-2 text-right">Conv. cad→contr.</th>
              <th className="px-3 py-2 text-right">Ticket médio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {linhas.map((l) => (
              <tr key={l.nome} className="hover:bg-secondary/30">
                <td className="px-3 py-2 font-semibold text-graphite">{l.nome}</td>
                <td className="px-3 py-2 text-right">{l.cad}</td>
                <td className="px-3 py-2 text-right">{l.opor}</td>
                <td className="px-3 py-2 text-right">{l.sim}</td>
                <td className="px-3 py-2 text-right">{l.prop}</td>
                <td className="px-3 py-2 text-right font-semibold text-[var(--success)]">{l.contr}</td>
                <td className="px-3 py-2 text-right">
                  <span className={`rounded-sm px-1.5 py-0.5 text-[10px] font-semibold ${
                    l.conv >= 40 ? "bg-[color-mix(in_oklab,var(--success)_12%,white)] text-[var(--success)]"
                    : l.conv >= 20 ? "bg-[color-mix(in_oklab,var(--warning)_12%,white)] text-[var(--warning)]"
                    : "bg-[color-mix(in_oklab,var(--direction)_10%,white)] text-direction"
                  }`}>{l.conv}%</span>
                </td>
                <td className="px-3 py-2 text-right font-bold text-brand">{fmtBRL(l.ticketMedio)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ====================== 3. Funil Comercial ====================== */

function RelFunil({ base }: { base: Cliente[] }) {
  const totalCad = base.length;
  const comOp   = base.filter((c) => c.oportunidades.length > 0).length;
  const comSim  = base.filter((c) => c.simulacoes.length > 0).length;
  const comProp = base.filter((c) => c.propostas.length > 0).length;
  const comCtr  = base.filter((c) => c.propostas.some((p) => p.status === "aprovada")).length;
  const denom = Math.max(1, totalCad);

  const etapas = [
    { etapa: "Cadastro",      qtd: totalCad, sla: 0   },
    { etapa: "Oportunidade",  qtd: comOp,    sla: 2.1 },
    { etapa: "Simulação",     qtd: comSim,   sla: 1.4 },
    { etapa: "Proposta",      qtd: comProp,  sla: 3.8 },
    { etapa: "Contrato",      qtd: comCtr,   sla: 6.2 },
  ];

  return (
    <div className="space-y-4">
      <RelHeader icon={Layers} title="Funil Comercial" subtitle="Conversão entre etapas e tempo médio entre transições (SLA)" />
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="space-y-2 rounded-sm border border-border bg-secondary/30 p-3">
          {etapas.map((e, i) => {
            const pct = Math.round((e.qtd / denom) * 100);
            return (
              <div key={e.etapa}>
                <div className="flex items-center justify-between text-[12px] text-graphite">
                  <span className="font-medium">{i + 1}. {e.etapa}</span>
                  <span className="font-semibold">{e.qtd} <span className="font-normal text-muted-foreground">· {pct}%</span></span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-sm bg-card">
                  <div className="h-full bg-brand" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        <ChartCard title="Tempo médio entre etapas (dias úteis)" subtitle="SLA do funil">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={etapas.slice(1)}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="etapa" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" unit="d" />
              <Tooltip contentStyle={tooltip} />
              <Bar dataKey="sla" fill="var(--warning)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

/* ====================== 4. Qualidade da Base ====================== */

function RelQualidade({ base }: { base: Cliente[] }) {
  const n = Math.max(1, base.length);
  const lgpd  = base.filter((c) => c.fgAutorizacaoDados).length;
  const email = base.filter((c) => /@/.test(c.email)).length;
  const cel   = base.filter((c) => c.celular.replace(/\D/g, "").length === 11).length;
  const ende  = base.filter((c) => c.logradouro && c.numeroLogradouro && c.cep).length;
  const docId = base.filter((c) => c.numeroDocumento && c.numeroDocumento !== "00.000.000-0").length;
  const banco = base.filter((c) => (c as unknown as { codigoContaCorrente?: string }).codigoContaCorrente).length;

  const cpfDup = useMemo(() => {
    const m = new Map<string, number>();
    base.forEach((c) => m.set(c.cpfCnpj, (m.get(c.cpfCnpj) ?? 0) + 1));
    return Array.from(m.values()).filter((v) => v > 1).length;
  }, [base]);

  const itens = [
    { l: "Autorização LGPD",   q: lgpd,  pct: Math.round((lgpd / n) * 100) },
    { l: "E-mail válido",      q: email, pct: Math.round((email / n) * 100) },
    { l: "Celular válido",     q: cel,   pct: Math.round((cel / n) * 100) },
    { l: "Endereço completo",  q: ende,  pct: Math.round((ende / n) * 100) },
    { l: "Documento de identidade", q: docId, pct: Math.round((docId / n) * 100) },
    { l: "Dados bancários",    q: banco, pct: Math.round((banco / n) * 100) },
  ];

  return (
    <div className="space-y-4">
      <RelHeader icon={Database} title="Qualidade da Base" subtitle="Completude dos dados cadastrais e detecção de duplicidade" />
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {itens.map((it) => (
          <div key={it.l} className="rounded-sm border border-border bg-card p-3">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-graphite">{it.l}</span>
              <span className={`font-bold ${it.pct >= 80 ? "text-[var(--success)]" : it.pct >= 50 ? "text-[var(--warning)]" : "text-direction"}`}>
                {it.pct}%
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-sm bg-secondary">
              <div className={`h-full ${it.pct >= 80 ? "bg-[var(--success)]" : it.pct >= 50 ? "bg-[var(--warning)]" : "bg-direction"}`} style={{ width: `${it.pct}%` }} />
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground">{it.q} de {base.length} clientes</p>
          </div>
        ))}
      </div>
      <div className="rounded-sm border border-border bg-secondary/30 p-3 text-[12px]">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-direction" />
          <span className="font-semibold text-graphite">Clientes duplicados (mesmo CPF/CNPJ):</span>
          <span className="ml-auto text-lg font-bold text-direction">{cpfDup}</span>
        </div>
      </div>
    </div>
  );
}

/* ====================== 5. LGPD & Compliance ====================== */

function RelLGPD({ base }: { base: Cliente[] }) {
  const semAuth = base.filter((c) => !c.fgAutorizacaoDados);
  return (
    <div className="space-y-4">
      <RelHeader icon={ShieldCheck} title="LGPD & Compliance" subtitle="Status de autorizações, direito ao esquecimento e auditoria de campos sensíveis" />
      <div className="grid gap-3 sm:grid-cols-3">
        <Kpi label="Sem autorização ativa"            value={semAuth.length.toString()}                 icon={AlertTriangle} tone="direction" />
        <Kpi label="Solicitações de exclusão"         value="3"                                         icon={FileText}      tone="warning" />
        <Kpi label="Alterações sensíveis (últimos 30d)" value="14"                                      icon={ShieldCheck}   tone="info" />
      </div>
      <div className="rounded-sm border border-border bg-card">
        <div className="border-b border-border bg-secondary/40 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-graphite">
          Clientes sem autorização ativa
        </div>
        <ul className="divide-y divide-border">
          {semAuth.slice(0, 8).map((c) => (
            <li key={c.idParticipante} className="flex items-center gap-3 px-3 py-2 text-[12px]">
              <AlertTriangle className="h-3.5 w-3.5 text-direction" />
              <span className="font-semibold text-graphite">{c.nomeParticipante}</span>
              <span className="ml-auto text-[11px] text-muted-foreground">{c.municipio}/{c.uf}</span>
            </li>
          ))}
          {semAuth.length === 0 && (
            <li className="px-3 py-4 text-center text-[12px] text-muted-foreground">
              Toda a base está em conformidade.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

/* ====================== 6. Origem e Captação ====================== */

function RelOrigem({ base }: { base: Cliente[] }) {
  // Distribuição mock determinística pelo idParticipante
  const data = useMemo(() => {
    const buckets = ORIGENS.map((o) => ({ name: o, value: 0 }));
    base.forEach((c, i) => { buckets[i % ORIGENS.length].value += 1; });
    return buckets;
  }, [base]);

  const colors = ["var(--brand)", "var(--info)", "var(--success)", "var(--warning)", "var(--direction)"];

  return (
    <div className="space-y-4">
      <RelHeader icon={MapIcon} title="Origem e Captação" subtitle="Distribuição por canal e custo por aquisição (integração futura com Financeiro)" />
      <div className="grid gap-3 lg:grid-cols-3">
        <ChartCard title="Distribuição por origem" className="lg:col-span-1" small>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" innerRadius={40} outerRadius={70} paddingAngle={2} stroke="var(--card)">
                {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
              </Pie>
              <Tooltip contentStyle={tooltip} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
        <div className="rounded-sm border border-border bg-card lg:col-span-2">
          <div className="border-b border-border bg-secondary/40 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-graphite">
            Custo por aquisição (CPA) por canal
          </div>
          <ul className="divide-y divide-border">
            {data.map((d, i) => (
              <li key={d.name} className="flex items-center gap-3 px-3 py-2 text-[12px]">
                <span className="h-2 w-2 rounded-full" style={{ background: colors[i] }} />
                <span className="font-semibold text-graphite">{d.name}</span>
                <span className="ml-auto text-muted-foreground">{d.value} clientes</span>
                <span className="w-24 text-right font-bold text-brand">
                  {fmtBRL(180 + i * 80)}
                </span>
              </li>
            ))}
          </ul>
          <p className="border-t border-border px-3 py-2 text-[10px] text-muted-foreground">
            Valores ilustrativos — integração com módulo Financeiro pendente.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============================== UI ============================== */

const inp =
  "w-full rounded-sm border border-border bg-card px-2.5 py-1.5 text-[12px] text-graphite outline-none placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:bg-secondary/60 disabled:text-muted-foreground";
const tooltip = { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12 } as const;

function Sel({ label, value, onChange, opts }: { label: string; value: string; onChange: (v: string) => void; opts: { v: string; l: string }[] }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={inp}>
        {opts.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </label>
  );
}

function Txt({ label, value, onChange, placeholder, disabled }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; disabled?: boolean }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <input value={value} disabled={disabled} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={inp} />
    </label>
  );
}

function RelHeader({ icon: Icon, title, subtitle }: { icon: React.ComponentType<{ className?: string }>; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-border pb-2">
      <span className="grid h-7 w-7 place-items-center rounded-sm bg-accent text-brand">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-graphite">{title}</h2>
        {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}

function Kpi({ label, value, icon: Icon, tone = "brand" }: { label: string; value: string; icon: React.ComponentType<{ className?: string }>; tone?: "brand" | "success" | "warning" | "direction" | "info" }) {
  const toneBg: Record<string, string> = {
    brand: "bg-accent text-brand",
    success: "bg-[color-mix(in_oklab,var(--success)_12%,white)] text-[var(--success)]",
    warning: "bg-[color-mix(in_oklab,var(--warning)_12%,white)] text-[var(--warning)]",
    direction: "bg-[color-mix(in_oklab,var(--direction)_10%,white)] text-direction",
    info: "bg-[color-mix(in_oklab,var(--info)_10%,white)] text-[var(--info)]",
  };
  return (
    <div className="rounded-sm border border-border bg-card p-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">{label}</span>
        <span className={`grid h-7 w-7 place-items-center rounded-sm ${toneBg[tone]}`}>
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>
      <p className="mt-2 text-[22px] font-bold leading-none tracking-tight text-graphite">{value}</p>
    </div>
  );
}

function ChartCard({ title, subtitle, children, className = "", small }: { title: string; subtitle?: string; children: React.ReactNode; className?: string; small?: boolean }) {
  return (
    <div className={`rounded-sm border border-border bg-card p-3 ${className}`}>
      <div className="mb-2">
        <h3 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-graphite">{title}</h3>
        {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
      </div>
      <div className={small ? "h-44" : "h-56"}>{children}</div>
    </div>
  );
}

function ExportBtn({ label, hint }: { label: string; hint?: string }) {
  return (
    <button title={hint} className="inline-flex items-center gap-1 rounded-sm border border-border bg-card px-2.5 py-1.5 font-semibold uppercase tracking-wider text-graphite hover:border-brand/40">
      <Download className="h-3.5 w-3.5" /> {label}
    </button>
  );
}

// reserva ícones
export const _icons = { BarChart3, FileBarChart2 };
