import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Filter as FilterIcon,
  Home,
  Inbox,
  Landmark,
  Mail,
  MapPin,
  MessageCircle,
  Pencil,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  User,
  Wallet,
  X,
  XCircle,
} from "lucide-react";
import { ClientesMonitoringDashboard } from "@/components/crm/clientes-dashboard";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  CLIENTES_MOCK,
  DOM_BANCOS,
  DOM_ESTADO_CIVIL,
  DOM_OPERACOES,
  DOM_SITUACAO_OPORTUNIDADE,
  DOM_TIPO_IMOVEL,
  DOM_UFS,
  DOM_USO_IMOVEL,
  fmtBRL,
  fmtCpfCnpj,
  fmtDate,
  fmtPhone,
  maskCpfCnpj,
  type Cliente,
} from "@/data/homefin-clientes";

type Scope = "correspondente" | "corretor";

interface Filtros {
  busca: string;
  status: "" | "A" | "I";
  idOperacao: "" | number;
  tipoImovel: "" | string;
  usoImovel: "" | "R" | "C";
  uf: string;
  idBanco: "" | number;
  corretor: string;
  utilizaFgts: "" | "S" | "N";
  comPendencia: boolean;
  comSimulacao: boolean;
  comProposta: boolean;
}

const FILTROS_VAZIOS: Filtros = {
  busca: "",
  status: "",
  idOperacao: "",
  tipoImovel: "",
  usoImovel: "",
  uf: "",
  idBanco: "",
  corretor: "",
  utilizaFgts: "",
  comPendencia: false,
  comSimulacao: false,
  comProposta: false,
};

function statusOportunidadeChip(s: string) {
  const map: Record<string, string> = {
    A: "bg-[color-mix(in_oklab,var(--info)_10%,white)] text-[var(--info)] border-[var(--info)]/30",
    T: "bg-[color-mix(in_oklab,var(--success)_10%,white)] text-[var(--success)] border-[var(--success)]/30",
    C: "bg-[color-mix(in_oklab,var(--direction)_10%,white)] text-direction border-direction/30",
  };
  return map[s] ?? "bg-secondary text-graphite border-border";
}

function statusPropostaChip(s: string) {
  const map: Record<string, { c: string; l: string }> = {
    incluida:   { c: "bg-[color-mix(in_oklab,var(--info)_10%,white)] text-[var(--info)]",       l: "Incluída" },
    em_analise: { c: "bg-[color-mix(in_oklab,var(--info)_10%,white)] text-[var(--info)]",       l: "Em análise" },
    aprovada:   { c: "bg-[color-mix(in_oklab,var(--success)_12%,white)] text-[var(--success)]", l: "Aprovada" },
    reprovada:  { c: "bg-[color-mix(in_oklab,var(--direction)_10%,white)] text-direction",     l: "Reprovada" },
    tratativa:  { c: "bg-[color-mix(in_oklab,var(--warning)_12%,white)] text-[var(--warning)]", l: "Tratativa" },
  };
  return map[s] ?? { c: "bg-secondary text-graphite", l: s };
}

function docChip(s: string) {
  const map: Record<string, { c: string; l: string; i: typeof CheckCircle2 }> = {
    aceito:    { c: "text-[var(--success)] bg-[color-mix(in_oklab,var(--success)_12%,white)]", l: "Aceito",    i: CheckCircle2 },
    enviado:   { c: "text-[var(--info)] bg-[color-mix(in_oklab,var(--info)_10%,white)]",       l: "Enviado",   i: Clock },
    pendente:  { c: "text-[var(--warning)] bg-[color-mix(in_oklab,var(--warning)_12%,white)]", l: "Pendente",  i: AlertTriangle },
    rejeitado: { c: "text-direction bg-[color-mix(in_oklab,var(--direction)_10%,white)]",      l: "Rejeitado", i: XCircle },
  };
  return map[s] ?? { c: "bg-secondary text-graphite", l: s, i: Clock };
}

export function CrmClientesList({ scope }: { scope: Scope }) {
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_VAZIOS);
  const [mascarar, setMascarar] = useState(scope === "corretor");
  const [selecionado, setSelecionado] = useState<Cliente | null>(null);

  const base = useMemo(() => {
    // Corretor vê só a própria carteira
    if (scope === "corretor") {
      return CLIENTES_MOCK.filter((c) => c.nomeCorretor === "Mariana Pires");
    }
    return CLIENTES_MOCK;
  }, [scope]);

  const clientes = useMemo(() => {
    return base.filter((c) => {
      const q = filtros.busca.trim().toLowerCase();
      if (q) {
        const hay = `${c.nomeParticipante} ${c.cpfCnpj} ${c.email} ${c.celular}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (filtros.status && c.tipoSituacao !== filtros.status) return false;
      if (filtros.uf && c.uf !== filtros.uf) return false;
      if (filtros.corretor && !c.nomeCorretor.toLowerCase().includes(filtros.corretor.toLowerCase())) return false;
      if (filtros.utilizaFgts && c.utilizaFgts !== filtros.utilizaFgts) return false;
      if (filtros.comPendencia && !c.possuiPendencia) return false;
      if (filtros.comSimulacao && c.simulacoes.length === 0) return false;
      if (filtros.comProposta && c.propostas.length === 0) return false;

      if (filtros.idOperacao !== "" && !c.oportunidades.some((o) => o.idOperacao === filtros.idOperacao)) return false;
      if (filtros.tipoImovel && !c.oportunidades.some((o) => o.tipoImovel === filtros.tipoImovel)) return false;
      if (filtros.usoImovel && !c.oportunidades.some((o) => o.usoImovel === filtros.usoImovel)) return false;
      if (filtros.idBanco !== "" && !c.oportunidades.some((o) => o.idBancoEscolhido === filtros.idBanco)) return false;

      return true;
    });
  }, [base, filtros]);

  const filtroAtivo =
    filtros.busca !== "" ||
    filtros.status !== "" ||
    filtros.idOperacao !== "" ||
    filtros.tipoImovel !== "" ||
    filtros.usoImovel !== "" ||
    filtros.uf !== "" ||
    filtros.idBanco !== "" ||
    filtros.corretor !== "" ||
    filtros.utilizaFgts !== "" ||
    filtros.comPendencia ||
    filtros.comSimulacao ||
    filtros.comProposta;

  const totais = useMemo(() => {
    const ativos = clientes.filter((c) => c.tipoSituacao === "A").length;
    const comProposta = clientes.filter((c) => c.propostas.length > 0).length;
    const pendentes = clientes.filter((c) => c.possuiPendencia).length;
    const vgv = clientes.reduce(
      (a, c) => a + c.oportunidades.reduce((b, o) => b + o.valorFinanciamento, 0),
      0,
    );
    return { total: clientes.length, ativos, comProposta, pendentes, vgv };
  }, [clientes]);

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      {/* Header */}
      <header className="border-b border-border pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-secondary px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-brand">
              <span className="h-1.5 w-1.5 rounded-full bg-direction" />
              {scope === "correspondente" ? "Correspondente · CRM" : "Corretor · CRM"}
            </span>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-graphite">
              Clientes
            </h1>
            <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
              Cadastro central de participantes do ecossistema — espelhado no
              contrato HomeFin (Participante / Oportunidade / Simulação /
              Proposta / Documentos / Follow-up).
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button className="inline-flex items-center gap-1.5 rounded-sm bg-brand px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-brand-foreground hover:opacity-95">
              <Plus className="h-3.5 w-3.5" />
              Novo cliente
            </button>
          </div>
        </div>
      </header>

      {/* Painel de Monitoramento */}
      <ClientesMonitoringDashboard clientes={clientes} />

      {/* Filtros */}
      <section className="rounded-md border border-border bg-card p-3">
        <div className="flex items-center gap-2 border-b border-border pb-2.5">
          <FilterIcon className="h-3.5 w-3.5 text-brand" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-graphite">
            Filtros
          </span>
          {filtroAtivo && (
            <button
              onClick={() => setFiltros(FILTROS_VAZIOS)}
              className="ml-auto inline-flex items-center gap-1 text-[11px] font-medium text-direction hover:underline"
            >
              <X className="h-3 w-3" /> Limpar
            </button>
          )}
        </div>

        <div className="mt-3 grid gap-2 md:grid-cols-2 lg:grid-cols-4">
          {/* Busca */}
          <label className="relative col-span-full lg:col-span-2">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={filtros.busca}
              onChange={(e) => setFiltros((f) => ({ ...f, busca: e.target.value }))}
              placeholder="Buscar por nome, CPF/CNPJ, e-mail ou telefone…"
              className="w-full rounded-sm border border-border bg-card py-2 pl-8 pr-3 text-[12px] text-graphite outline-none placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </label>

          <FilterSelect
            label="Status"
            value={String(filtros.status)}
            onChange={(v) => setFiltros((f) => ({ ...f, status: (v || "") as "" | "A" | "I" }))}
            options={[
              { v: "", l: "Todos" },
              { v: "A", l: "Ativos" },
              { v: "I", l: "Inativos" },
            ]}
          />

          <FilterSelect
            label="Operação"
            value={String(filtros.idOperacao)}
            onChange={(v) =>
              setFiltros((f) => ({ ...f, idOperacao: v === "" ? "" : Number(v) }))
            }
            options={[
              { v: "", l: "Todas" },
              ...DOM_OPERACOES.map((o) => ({ v: String(o.idOperacao), l: o.nome })),
            ]}
          />

          <FilterSelect
            label="Tipo de imóvel"
            value={filtros.tipoImovel}
            onChange={(v) => setFiltros((f) => ({ ...f, tipoImovel: v }))}
            options={[
              { v: "", l: "Todos" },
              ...Object.entries(DOM_TIPO_IMOVEL).map(([v, l]) => ({ v, l })),
            ]}
          />

          <FilterSelect
            label="Uso"
            value={filtros.usoImovel}
            onChange={(v) =>
              setFiltros((f) => ({ ...f, usoImovel: (v || "") as "" | "R" | "C" }))
            }
            options={[
              { v: "", l: "Todos" },
              ...Object.entries(DOM_USO_IMOVEL).map(([v, l]) => ({ v, l })),
            ]}
          />

          <FilterSelect
            label="UF"
            value={filtros.uf}
            onChange={(v) => setFiltros((f) => ({ ...f, uf: v }))}
            options={[{ v: "", l: "Todas" }, ...DOM_UFS.map((u) => ({ v: u, l: u }))]}
          />

          <FilterSelect
            label="Banco escolhido"
            value={String(filtros.idBanco)}
            onChange={(v) =>
              setFiltros((f) => ({ ...f, idBanco: v === "" ? "" : Number(v) }))
            }
            options={[
              { v: "", l: "Todos" },
              ...DOM_BANCOS.map((b) => ({ v: String(b.idBanco), l: `${b.codigoBanco} · ${b.nome}` })),
            ]}
          />

          {scope === "correspondente" && (
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Corretor
              </span>
              <input
                value={filtros.corretor}
                onChange={(e) => setFiltros((f) => ({ ...f, corretor: e.target.value }))}
                placeholder="Nome do corretor"
                className="w-full rounded-sm border border-border bg-card px-2.5 py-1.5 text-[12px] text-graphite outline-none placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </label>
          )}

          <FilterSelect
            label="Utiliza FGTS"
            value={filtros.utilizaFgts}
            onChange={(v) =>
              setFiltros((f) => ({ ...f, utilizaFgts: (v || "") as "" | "S" | "N" }))
            }
            options={[
              { v: "", l: "Indiferente" },
              { v: "S", l: "Sim" },
              { v: "N", l: "Não" },
            ]}
          />
        </div>

        <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
          {[
            { k: "comPendencia" as const, l: "Com pendência" },
            { k: "comSimulacao" as const, l: "Com simulação" },
            { k: "comProposta"  as const, l: "Com proposta" },
          ].map(({ k, l }) => (
            <button
              key={k}
              onClick={() => setFiltros((f) => ({ ...f, [k]: !f[k] }))}
              className={`inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1.5 text-[11px] font-semibold transition ${
                filtros[k]
                  ? "border-brand bg-brand text-brand-foreground"
                  : "border-border bg-card text-graphite hover:border-brand/40"
              }`}
            >
              {filtros[k] ? <CheckCircle2 className="h-3 w-3" /> : <span className="h-3 w-3 rounded-[2px] border border-current/40" />}
              {l}
            </button>
          ))}
          <div className="ml-auto inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="font-bold text-graphite">{clientes.length}</span>
            de <span className="font-bold text-graphite">{base.length}</span> clientes
          </div>
        </div>
      </section>

      {/* Lista */}
      {clientes.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-card p-10 text-center">
          <Inbox className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm font-semibold text-graphite">
            Nenhum cliente encontrado com os filtros atuais
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Ajuste os filtros ou{" "}
            <button onClick={() => setFiltros(FILTROS_VAZIOS)} className="text-brand hover:underline">
              limpe todos
            </button>
            .
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {clientes.map((c) => (
            <ClienteCard
              key={c.idParticipante}
              cliente={c}
              mascarar={mascarar}
              onOpen={() => setSelecionado(c)}
            />
          ))}
        </ul>
      )}

      <ClienteDetalheSheet
        cliente={selecionado}
        mascarar={mascarar}
        onClose={() => setSelecionado(null)}
      />
    </div>
  );
}

/* =========================================================== */

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { v: string; l: string }[];
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-sm border border-border bg-card px-2 py-1.5 text-[12px] text-graphite outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
      >
        {options.map((o) => (
          <option key={o.v} value={o.v}>
            {o.l}
          </option>
        ))}
      </select>
    </label>
  );
}

/* =========================================================== */

function ClienteCard({
  cliente: c,
  mascarar,
  onOpen,
}: {
  cliente: Cliente;
  mascarar: boolean;
  onOpen: () => void;
}) {
  const op = c.oportunidades[0];
  const pr = c.propostas[c.propostas.length - 1];
  const docsPend = c.documentos.filter((d) => d.situacao === "pendente" || d.situacao === "rejeitado").length;
  const iniciais = c.nomeParticipante
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <li>
      <button
        onClick={onOpen}
        className="group block w-full rounded-md border border-border bg-card text-left transition hover:border-brand/40 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
      >
        <div className="grid gap-3 p-4 md:grid-cols-[minmax(0,2.2fr)_minmax(0,2fr)_minmax(0,2fr)_auto] md:items-center">
          {/* Identidade */}
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-accent text-[12px] font-bold text-brand">
              {iniciais || (c.tipoPessoa === "J" ? "PJ" : "PF")}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-[14px] font-semibold text-graphite">
                  {c.nomeParticipante}
                </p>
                <span
                  className={`shrink-0 rounded-sm border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                    c.tipoSituacao === "A"
                      ? "border-[var(--success)]/30 bg-[color-mix(in_oklab,var(--success)_10%,white)] text-[var(--success)]"
                      : "border-border bg-secondary text-muted-foreground"
                  }`}
                >
                  {c.tipoSituacao === "A" ? "Ativo" : "Inativo"}
                </span>
                <span className="shrink-0 rounded-sm border border-border bg-secondary px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-graphite">
                  {c.tipoPessoa === "F" ? "PF" : "PJ"}
                </span>
              </div>
              <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">
                {mascarar ? maskCpfCnpj(c.cpfCnpj) : fmtCpfCnpj(c.cpfCnpj)}
              </p>
              <p className="mt-0.5 flex items-center gap-2 truncate text-[11px] text-muted-foreground">
                <Mail className="h-3 w-3" /> {c.email || "—"}
                <span className="text-border">·</span>
                <Phone className="h-3 w-3" /> {c.celular ? fmtPhone(c.celular) : "—"}
              </p>
            </div>
          </div>

          {/* Oportunidade ativa */}
          <div className="min-w-0">
            {op ? (
              <>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Oportunidade atual
                </p>
                <p className="mt-0.5 truncate text-[13px] font-semibold text-graphite">
                  {op.nomeOperacao}
                </p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Home className="h-3 w-3" />
                    {DOM_TIPO_IMOVEL[op.tipoImovel]} ({DOM_USO_IMOVEL[op.usoImovel]})
                  </span>
                  <span className="text-border">·</span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {op.municipio}/{op.uf}
                  </span>
                </p>
                <p className="mt-0.5 text-[11px]">
                  <span className="font-semibold text-brand">{fmtBRL(op.valorFinanciamento)}</span>
                  <span className="text-muted-foreground"> / {op.prazo} meses · {op.nomeBancoEscolhido}</span>
                </p>
              </>
            ) : (
              <p className="text-[11px] italic text-muted-foreground">Sem oportunidade ativa</p>
            )}
          </div>

          {/* Status & sinais */}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              {op && (
                <span className={`rounded-sm border px-1.5 py-0.5 text-[10px] font-semibold ${statusOportunidadeChip(op.tipoSituacao)}`}>
                  {DOM_SITUACAO_OPORTUNIDADE[op.tipoSituacao]}
                </span>
              )}
              {pr && (
                <span className={`rounded-sm px-1.5 py-0.5 text-[10px] font-semibold ${statusPropostaChip(pr.status).c}`}>
                  Proposta: {statusPropostaChip(pr.status).l}
                </span>
              )}
              {c.utilizaFgts === "S" && (
                <span className="rounded-sm border border-border bg-secondary px-1.5 py-0.5 text-[10px] font-semibold text-graphite">
                  FGTS
                </span>
              )}
              {docsPend > 0 && (
                <span className="inline-flex items-center gap-1 rounded-sm border border-[var(--warning)]/30 bg-[color-mix(in_oklab,var(--warning)_12%,white)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--warning)]">
                  <AlertTriangle className="h-2.5 w-2.5" />
                  {docsPend} doc{docsPend > 1 ? "s" : ""}
                </span>
              )}
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              <span className="font-semibold text-graphite">{c.nomeCorretor}</span>
              {c.nomeImobiliaria && <> · {c.nomeImobiliaria}</>}
            </p>
            <p className="text-[10.5px] text-muted-foreground">
              Atualizado em {fmtDate(c.atualizadoEm)}
            </p>
          </div>

          {/* Setinha */}
          <div className="hidden md:flex md:items-center md:justify-end">
            <ChevronRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-brand" />
          </div>
        </div>
      </button>
    </li>
  );
}

/* =========================================================== */

function ClienteDetalheSheet({
  cliente,
  mascarar,
  onClose,
}: {
  cliente: Cliente | null;
  mascarar: boolean;
  onClose: () => void;
}) {
  return (
    <Sheet open={!!cliente} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto bg-background p-0 sm:max-w-2xl"
      >
        {cliente && (
          <>
            <SheetHeader className="sticky top-0 z-10 border-b border-border bg-card px-5 py-4">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-accent text-[12px] font-bold text-brand">
                  {cliente.nomeParticipante.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <SheetTitle className="truncate text-base font-semibold text-graphite">
                    {cliente.nomeParticipante}
                  </SheetTitle>
                  <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                    {mascarar ? maskCpfCnpj(cliente.cpfCnpj) : fmtCpfCnpj(cliente.cpfCnpj)} ·{" "}
                    {cliente.tipoPessoa === "F" ? "Pessoa Física" : "Pessoa Jurídica"}
                  </p>
                </div>
                <button className="rounded-sm border border-border bg-card p-1.5 text-graphite hover:border-brand/40" title="Editar">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
            </SheetHeader>

            <Tabs defaultValue="ficha" className="p-0">
              <TabsList className="sticky top-[88px] z-10 grid h-auto w-full grid-cols-3 rounded-none border-b border-border bg-card p-0 sm:grid-cols-6">
                {[
                  { v: "ficha",      l: "Ficha" },
                  { v: "oport",      l: "Oportunidades" },
                  { v: "simul",      l: "Simulações" },
                  { v: "prop",       l: "Propostas" },
                  { v: "docs",       l: "Documentos" },
                  { v: "follow",     l: "Follow-up" },
                ].map((t) => (
                  <TabsTrigger
                    key={t.v}
                    value={t.v}
                    className="rounded-none border-b-2 border-transparent py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground data-[state=active]:border-brand data-[state=active]:bg-card data-[state=active]:text-brand"
                  >
                    {t.l}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="ficha" className="p-5">
                <FichaTab cliente={cliente} mascarar={mascarar} />
              </TabsContent>
              <TabsContent value="oport" className="p-5">
                <OportunidadesTab cliente={cliente} />
              </TabsContent>
              <TabsContent value="simul" className="p-5">
                <SimulacoesTab cliente={cliente} />
              </TabsContent>
              <TabsContent value="prop" className="p-5">
                <PropostasTab cliente={cliente} />
              </TabsContent>
              <TabsContent value="docs" className="p-5">
                <DocumentosTab cliente={cliente} />
              </TabsContent>
              <TabsContent value="follow" className="p-5">
                <FollowUpTab cliente={cliente} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

/* ========================== Tabs ========================== */

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-sm border border-border bg-card p-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-[12.5px] font-medium text-graphite">{value || "—"}</p>
    </div>
  );
}

function GroupTitle({
  icon: Icon,
  children,
}: {
  icon: typeof User;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-2 mt-4 flex items-center gap-2 first:mt-0">
      <Icon className="h-3.5 w-3.5 text-brand" />
      <h3 className="text-[11px] font-bold uppercase tracking-[0.1em] text-graphite">
        {children}
      </h3>
    </div>
  );
}

function FichaTab({ cliente: c, mascarar }: { cliente: Cliente; mascarar: boolean }) {
  return (
    <div className="space-y-1">
      <GroupTitle icon={User}>Identificação</GroupTitle>
      <div className="grid gap-2 sm:grid-cols-2">
        <Field label="Nome / Razão social" value={c.nomeParticipante} />
        <Field label="CPF / CNPJ" value={mascarar ? maskCpfCnpj(c.cpfCnpj) : fmtCpfCnpj(c.cpfCnpj)} />
        <Field label="Tipo de pessoa (tipoPessoa)" value={c.tipoPessoa === "F" ? "Física (F)" : "Jurídica (J)"} />
        <Field label="Qualificação (tipoQualificacao)" value={c.tipoQualificacao === "CO" ? "Comprador (CO)" : "Vendedor (VD)"} />
        <Field label="Situação (tipoSituacao)" value={c.tipoSituacao === "A" ? "Ativa (A)" : "Inativa (I)"} />
        <Field label="Comprador principal" value={c.compradorPrincipal === "S" ? "Sim" : "Não"} />
        <Field label="Data de nascimento" value={fmtDate(c.dataNascimento)} />
        <Field label="Sexo" value={c.tipoSexo === "F" ? "Feminino" : "Masculino"} />
        <Field
          label="Estado civil"
          value={`${DOM_ESTADO_CIVIL[c.tipoEstadoCivil]} (${c.tipoEstadoCivil})`}
        />
        {c.tipoRegimeCasamento && (
          <Field label="Regime de casamento" value={c.tipoRegimeCasamento} />
        )}
        <Field label="Nome da mãe" value={c.nomeMae} />
        <Field
          label="Autorização LGPD (fgAutorizacaoDados)"
          value={
            <span className={c.fgAutorizacaoDados ? "text-[var(--success)]" : "text-direction"}>
              {c.fgAutorizacaoDados ? "✓ Autorizado" : "✗ Pendente"}
            </span>
          }
        />
      </div>

      <GroupTitle icon={ShieldCheck}>Documento de identidade</GroupTitle>
      <div className="grid gap-2 sm:grid-cols-3">
        <Field label="Tipo" value={c.tipoDocumentoIdentidade} />
        <Field label="Número" value={c.numeroDocumento} />
        <Field label="UF expedição" value={c.ufExpedicao} />
      </div>

      <GroupTitle icon={Mail}>Contato</GroupTitle>
      <div className="grid gap-2 sm:grid-cols-2">
        <Field label="E-mail" value={c.email} />
        <Field label="Celular" value={fmtPhone(c.celular)} />
      </div>

      <GroupTitle icon={MapPin}>Endereço</GroupTitle>
      <div className="grid gap-2 sm:grid-cols-3">
        <Field label="CEP" value={c.cep} />
        <Field label="UF" value={c.uf} />
        <Field label="Município" value={c.municipio} />
        <Field label="Logradouro" value={`${c.logradouro}, ${c.numeroLogradouro}`} />
        <Field label="Bairro" value={c.bairro} />
      </div>

      <GroupTitle icon={Wallet}>Profissão e renda</GroupTitle>
      <div className="grid gap-2 sm:grid-cols-2">
        <Field label="Profissão" value={c.nomeProfissao} />
        <Field label="Empresa" value={c.nomeEmpresaProfissao} />
        <Field label="Renda" value={fmtBRL(c.renda)} />
        <Field label="Utiliza FGTS" value={c.utilizaFgts === "S" ? "Sim" : "Não"} />
      </div>

      <GroupTitle icon={Landmark}>Dados bancários</GroupTitle>
      <div className="grid gap-2 sm:grid-cols-4">
        <Field label="Banco" value={c.nomeBanco} />
        <Field label="Agência" value={c.codigoAgencia} />
        <Field label="Conta" value={c.codigoContaCorrente} />
        <Field label="Dígito" value={c.digitoContaCorrente} />
      </div>

      {c.conjuge && (
        <>
          <GroupTitle icon={User}>Cônjuge</GroupTitle>
          <div className="grid gap-2 sm:grid-cols-2">
            <Field label="Nome" value={c.conjuge.nomeConjuge} />
            <Field label="CPF" value={mascarar ? maskCpfCnpj(c.conjuge.cpfConjuge) : fmtCpfCnpj(c.conjuge.cpfConjuge)} />
            <Field label="Data de nascimento" value={fmtDate(c.conjuge.dataNascimentoConjuge)} />
            <Field label="Renda" value={fmtBRL(c.conjuge.rendaConjuge)} />
          </div>
        </>
      )}

      <GroupTitle icon={Building2}>Vínculos do ecossistema</GroupTitle>
      <div className="grid gap-2 sm:grid-cols-3">
        <Field label="Corretor (idUsuarioParceiro)" value={`${c.nomeCorretor} (#${c.idUsuarioParceiro})`} />
        <Field label="Imobiliária" value={c.nomeImobiliaria} />
        <Field label="Analista" value={c.nomeAnalista} />
      </div>
    </div>
  );
}

function OportunidadesTab({ cliente: c }: { cliente: Cliente }) {
  if (c.oportunidades.length === 0) return <Empty label="Nenhuma oportunidade vinculada" />;
  return (
    <div className="space-y-3">
      {c.oportunidades.map((o) => (
        <div key={o.idOportunidade} className="rounded-md border border-border bg-card p-3">
          <div className="flex flex-wrap items-start justify-between gap-2 border-b border-border pb-2">
            <div>
              <p className="text-[13px] font-semibold text-graphite">
                {o.nomeOperacao} <span className="font-mono text-[11px] text-muted-foreground">· {o.codigoOportunidade}</span>
              </p>
              <p className="text-[11px] text-muted-foreground">{o.idOportunidade}</p>
            </div>
            <span className={`rounded-sm border px-2 py-0.5 text-[10px] font-semibold ${statusOportunidadeChip(o.tipoSituacao)}`}>
              {DOM_SITUACAO_OPORTUNIDADE[o.tipoSituacao]}
            </span>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <Field label="Imóvel" value={`${DOM_TIPO_IMOVEL[o.tipoImovel]} · ${DOM_USO_IMOVEL[o.usoImovel]}`} />
            <Field label="Local" value={`${o.municipio}/${o.uf}`} />
            <Field label="Valor do imóvel" value={fmtBRL(o.valorImovel)} />
            <Field label="Valor financiado" value={fmtBRL(o.valorFinanciamento)} />
            <Field label="Prazo" value={`${o.prazo} meses`} />
            <Field label="Amortização" value={o.sistemaAmortizacao === "S" ? "SAC (S)" : "PRICE (P)"} />
            <Field label="Banco escolhido" value={o.nomeBancoEscolhido} />
            <Field label="Utiliza FGTS" value={o.utilizaFgtsSimulacao === "S" ? "Sim" : "Não"} />
            <Field label="Criada em" value={fmtDate(o.criadoEm)} />
          </div>
        </div>
      ))}
    </div>
  );
}

function SimulacoesTab({ cliente: c }: { cliente: Cliente }) {
  if (c.simulacoes.length === 0) return <Empty label="Nenhuma simulação cadastrada" cta="Criar simulação" />;
  return (
    <ul className="space-y-2">
      {c.simulacoes.map((s) => (
        <li key={s.idSimulacao} className="rounded-md border border-border bg-card p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-mono text-[11px] text-muted-foreground">{s.idSimulacao}</p>
            <span className="rounded-sm border border-border bg-secondary px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-graphite">
              {s.status}
            </span>
          </div>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            <Field label="Valor financiado" value={fmtBRL(s.valorFinanciamentoSimulacao)} />
            <Field label="Parcela" value={fmtBRL(s.valorParcelaSimulacao)} />
            <Field label="Prazo" value={`${s.prazoPagamentoSimulacao} meses`} />
            <Field label="Taxa a.a." value={`${s.taxaJurosAnoBanco.toFixed(2)} %`} />
            <Field label="Amortização" value={s.sistemaAmortizacaoBanco === "S" ? "SAC" : "PRICE"} />
            <Field label="Indexador" value={s.indexadorBanco} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function PropostasTab({ cliente: c }: { cliente: Cliente }) {
  if (c.propostas.length === 0) return <Empty label="Nenhuma proposta enviada" cta="Incluir proposta" />;
  return (
    <ul className="space-y-2">
      {c.propostas.map((p) => {
        const chip = statusPropostaChip(p.status);
        return (
          <li key={p.idProposta} className="rounded-md border border-border bg-card p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-[13px] font-semibold text-graphite">{p.nomeBanco}</p>
                <p className="font-mono text-[11px] text-muted-foreground">
                  {p.idProposta} · banco {p.codigoPropostaBanco}
                </p>
              </div>
              <span className={`rounded-sm px-2 py-0.5 text-[10px] font-semibold ${chip.c}`}>
                {chip.l}
              </span>
            </div>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <Field label="Criada em" value={fmtDate(p.criadaEm)} />
              <Field label="Retorno em" value={p.retornoEm ? fmtDate(p.retornoEm) : "—"} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function DocumentosTab({ cliente: c }: { cliente: Cliente }) {
  if (c.documentos.length === 0) return <Empty label="Nenhum documento cadastrado" cta="Anexar documento" />;
  return (
    <ul className="divide-y divide-border rounded-md border border-border bg-card">
      {c.documentos.map((d) => {
        const chip = docChip(d.situacao);
        const Icon = chip.i;
        return (
          <li key={d.idDocumento} className="flex items-center gap-3 p-3">
            <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-sm ${chip.c}`}>
              <Icon className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12.5px] font-semibold text-graphite">{d.descricao}</p>
              <p className="text-[11px] text-muted-foreground">
                Alvo: {d.alvo} · atualizado {fmtDate(d.atualizadoEm)}
              </p>
            </div>
            <span className={`shrink-0 rounded-sm px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${chip.c}`}>
              {chip.l}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function FollowUpTab({ cliente: c }: { cliente: Cliente }) {
  if (c.followUps.length === 0) return <Empty label="Nenhum follow-up registrado" cta="Novo follow-up" />;
  const ord = [...c.followUps].sort((a, b) => (a.data < b.data ? 1 : -1));
  return (
    <ol className="space-y-2">
      {ord.map((f) => (
        <li key={f.idFollowUp} className="rounded-md border border-border bg-card p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-sm bg-accent text-brand">
                {f.tipoContato === "whatsapp" || f.tipoContato === "telefone" ? (
                  <MessageCircle className="h-3.5 w-3.5" />
                ) : f.tipoContato === "email" ? (
                  <Mail className="h-3.5 w-3.5" />
                ) : (
                  <Activity className="h-3.5 w-3.5" />
                )}
              </span>
              <p className="text-[12px] font-semibold text-graphite">{f.autor}</p>
              <span className="rounded-sm border border-border bg-secondary px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                {f.tipoContato}
              </span>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <Calendar className="h-3 w-3" /> {fmtDate(f.data)}
            </span>
          </div>
          <p className="mt-2 text-[12px] leading-relaxed text-graphite">{f.texto}</p>
        </li>
      ))}
    </ol>
  );
}

function Empty({ label, cta }: { label: string; cta?: string }) {
  return (
    <div className="rounded-md border border-dashed border-border bg-card p-8 text-center">
      <Inbox className="mx-auto h-7 w-7 text-muted-foreground" />
      <p className="mt-2 text-[12px] font-semibold text-graphite">{label}</p>
      {cta && (
        <button className="mt-3 inline-flex items-center gap-1.5 rounded-sm bg-brand px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-brand-foreground hover:opacity-95">
          <Plus className="h-3 w-3" /> {cta}
        </button>
      )}
    </div>
  );
}
