import { useMemo, useState } from "react";
import {
  ArrowRightLeft,
  Calculator,
  ChevronDown,
  Download,
  Eye,
  FileText,
  Filter as FilterIcon,
  History,
  Mail,
  MessageCircle,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Thermometer,
  X,
} from "lucide-react";
import {
  CLIENTES_MOCK,
  DOM_UFS,
  fmtCpfCnpj,
  fmtDate,
  maskCpfCnpj,
  type Cliente,
} from "@/data/homefin-clientes";

export type ConsultasScope = "correspondente" | "corretor";

interface Filtros {
  q: string;
  tipoPessoa: "" | "F" | "J";
  tipoSituacao: "" | "A" | "I";
  tipoQualificacao: "" | "CO" | "VD";
  uf: string;
  municipio: string;
  idUsuarioParceiro: string;
  idParceiro: string;
  idRegional: string;
  rendaMin: string;
  rendaMax: string;
  possuiOportunidade: "" | "S" | "N";
  temperatura: "" | "Q" | "M" | "F";
  dataInicial: string;
  dataFinal: string;
  fgAutorizacaoDados: "" | "S" | "N";
}

const FILTROS_VAZIOS: Filtros = {
  q: "", tipoPessoa: "", tipoSituacao: "", tipoQualificacao: "",
  uf: "", municipio: "", idUsuarioParceiro: "", idParceiro: "", idRegional: "",
  rendaMin: "", rendaMax: "",
  possuiOportunidade: "", temperatura: "",
  dataInicial: "", dataFinal: "",
  fgAutorizacaoDados: "",
};

// Mock: temperatura calculada determinística por idParticipante
function temperatura(c: Cliente): "Q" | "M" | "F" {
  const propAtiva = c.propostas.some((p) => ["em_analise", "incluida", "aprovada"].includes(p.status));
  if (propAtiva) return "Q";
  if (c.simulacoes.length > 0) return "M";
  return "F";
}
const TEMP_LABEL: Record<"Q" | "M" | "F", { l: string; c: string }> = {
  Q: { l: "Quente", c: "bg-[color-mix(in_oklab,var(--direction)_10%,white)] text-direction" },
  M: { l: "Morna",  c: "bg-[color-mix(in_oklab,var(--warning)_12%,white)] text-[var(--warning)]" },
  F: { l: "Fria",   c: "bg-[color-mix(in_oklab,var(--info)_10%,white)] text-[var(--info)]" },
};

export function ClienteConsultas({ scope }: { scope: ConsultasScope }) {
  const [f, setF] = useState<Filtros>(FILTROS_VAZIOS);
  const [sel, setSel] = useState<Set<string>>(new Set());

  const base = useMemo(() => {
    if (scope === "corretor") return CLIENTES_MOCK.filter((c) => c.nomeCorretor === "Mariana Pires");
    return CLIENTES_MOCK;
  }, [scope]);

  const filtrados = useMemo(() => {
    const q = f.q.trim().toLowerCase();
    return base.filter((c) => {
      if (q) {
        const hay = `${c.nomeParticipante} ${c.cpfCnpj} ${c.email} ${c.celular} ${c.idParticipante} ${c.oportunidades.map((o) => o.codigoOportunidade).join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (f.tipoPessoa && c.tipoPessoa !== f.tipoPessoa) return false;
      if (f.tipoSituacao && c.tipoSituacao !== f.tipoSituacao) return false;
      if (f.tipoQualificacao && c.tipoQualificacao !== f.tipoQualificacao) return false;
      if (f.uf && c.uf !== f.uf) return false;
      if (f.municipio && !c.municipio.toLowerCase().includes(f.municipio.toLowerCase())) return false;
      if (f.idUsuarioParceiro && !c.nomeCorretor.toLowerCase().includes(f.idUsuarioParceiro.toLowerCase())) return false;
      if (f.rendaMin && c.renda < Number(f.rendaMin)) return false;
      if (f.rendaMax && c.renda > Number(f.rendaMax)) return false;
      if (f.possuiOportunidade === "S" && c.oportunidades.length === 0) return false;
      if (f.possuiOportunidade === "N" && c.oportunidades.length > 0) return false;
      if (f.temperatura && temperatura(c) !== f.temperatura) return false;
      if (f.fgAutorizacaoDados === "S" && !c.fgAutorizacaoDados) return false;
      if (f.fgAutorizacaoDados === "N" && c.fgAutorizacaoDados) return false;
      if (f.dataInicial && new Date(c.criadoEm) < new Date(f.dataInicial)) return false;
      if (f.dataFinal   && new Date(c.criadoEm) > new Date(f.dataFinal))   return false;
      return true;
    });
  }, [base, f]);

  const ativos = Object.entries(f).filter(([, v]) => v !== "").length;
  const allChecked = filtrados.length > 0 && sel.size === filtrados.length;
  const toggleAll = () =>
    setSel(allChecked ? new Set() : new Set(filtrados.map((c) => c.idParticipante)));
  const toggle = (id: string) =>
    setSel((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  return (
    <div className="mx-auto max-w-[1500px] space-y-5">
      {/* Header */}
      <header className="border-b border-border pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-secondary px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-brand">
              <span className="h-1.5 w-1.5 rounded-full bg-direction" />
              {scope === "correspondente" ? "Correspondente · CRM" : "Corretor · CRM"}
            </span>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-graphite">
              Consultas de Clientes
            </h1>
            <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
              Busca avançada sobre {scope === "correspondente" ? "toda a base de participantes" : "a sua carteira"} —
              filtros combináveis alinhados aos query params da HomeFin.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <button className="inline-flex items-center gap-1 rounded-sm border border-border bg-card px-2.5 py-1.5 font-semibold uppercase tracking-wider text-graphite hover:border-brand/40">
              <Download className="h-3.5 w-3.5" /> Exportar CSV
            </button>
            <button className="inline-flex items-center gap-1 rounded-sm border border-border bg-card px-2.5 py-1.5 font-semibold uppercase tracking-wider text-graphite hover:border-brand/40">
              <Download className="h-3.5 w-3.5" /> Exportar XLSX
            </button>
          </div>
        </div>
      </header>

      {/* Filtros */}
      <section className="rounded-md border border-border bg-card p-3">
        <div className="flex items-center gap-2 border-b border-border pb-2.5">
          <FilterIcon className="h-3.5 w-3.5 text-brand" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-graphite">
            Filtros avançados
          </span>
          <span className="ml-1 rounded-sm bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-brand">
            {ativos} ativos
          </span>
          {ativos > 0 && (
            <button onClick={() => setF(FILTROS_VAZIOS)} className="ml-auto inline-flex items-center gap-1 text-[11px] font-medium text-direction hover:underline">
              <X className="h-3 w-3" /> Limpar
            </button>
          )}
        </div>

        <div className="mt-3 grid gap-2 md:grid-cols-2 lg:grid-cols-4">
          <label className="relative col-span-full lg:col-span-2">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={f.q}
              onChange={(e) => setF({ ...f, q: e.target.value })}
              placeholder="CPF/CNPJ, nome, razão social, e-mail, celular, idCliente ou codigoOportunidade…"
              className={`${inp} pl-8`}
            />
          </label>

          <Sel label="Tipo de pessoa" value={f.tipoPessoa} onChange={(v) => setF({ ...f, tipoPessoa: v as Filtros["tipoPessoa"] })}
            opts={[{ v: "", l: "Todos" }, { v: "F", l: "Física" }, { v: "J", l: "Jurídica" }]} />
          <Sel label="Situação" value={f.tipoSituacao} onChange={(v) => setF({ ...f, tipoSituacao: v as Filtros["tipoSituacao"] })}
            opts={[{ v: "", l: "Todos" }, { v: "A", l: "Ativo" }, { v: "I", l: "Inativo" }]} />
          <Sel label="Qualificação" value={f.tipoQualificacao} onChange={(v) => setF({ ...f, tipoQualificacao: v as Filtros["tipoQualificacao"] })}
            opts={[{ v: "", l: "Todos" }, { v: "CO", l: "Comprador" }, { v: "VD", l: "Vendedor" }]} />
          <Sel label="UF" value={f.uf} onChange={(v) => setF({ ...f, uf: v })}
            opts={[{ v: "", l: "Todas" }, ...DOM_UFS.map((u) => ({ v: u, l: u }))]} />

          <Txt label="Município" value={f.municipio} onChange={(v) => setF({ ...f, municipio: v })} />
          <Txt label="Corretor (idUsuarioParceiro)" value={f.idUsuarioParceiro} onChange={(v) => setF({ ...f, idUsuarioParceiro: v })}
            disabled={scope === "corretor"} placeholder={scope === "corretor" ? "Fixado em você" : "Nome do corretor"} />
          {scope === "correspondente" && (
            <>
              <Txt label="idParceiro" value={f.idParceiro} onChange={(v) => setF({ ...f, idParceiro: v })} />
              <Txt label="idRegional" value={f.idRegional} onChange={(v) => setF({ ...f, idRegional: v })} />
            </>
          )}

          <div className="flex gap-2">
            <Txt label="Renda mín. (R$)" value={f.rendaMin} onChange={(v) => setF({ ...f, rendaMin: v.replace(/\D/g, "") })} />
            <Txt label="Renda máx. (R$)" value={f.rendaMax} onChange={(v) => setF({ ...f, rendaMax: v.replace(/\D/g, "") })} />
          </div>

          <Sel label="Possui oportunidade" value={f.possuiOportunidade} onChange={(v) => setF({ ...f, possuiOportunidade: v as Filtros["possuiOportunidade"] })}
            opts={[{ v: "", l: "Todos" }, { v: "S", l: "Sim" }, { v: "N", l: "Não" }]} />
          <Sel label="Temperatura" value={f.temperatura} onChange={(v) => setF({ ...f, temperatura: v as Filtros["temperatura"] })}
            opts={[{ v: "", l: "Todas" }, { v: "Q", l: "Quente" }, { v: "M", l: "Morna" }, { v: "F", l: "Fria" }]} />

          <div className="flex gap-2">
            <Txt label="Cadastro de" value={f.dataInicial} onChange={(v) => setF({ ...f, dataInicial: v })} type="date" />
            <Txt label="até" value={f.dataFinal} onChange={(v) => setF({ ...f, dataFinal: v })} type="date" />
          </div>

          <Sel label="LGPD" value={f.fgAutorizacaoDados} onChange={(v) => setF({ ...f, fgAutorizacaoDados: v as Filtros["fgAutorizacaoDados"] })}
            opts={[{ v: "", l: "Todos" }, { v: "S", l: "Autorizado" }, { v: "N", l: "Sem autorização" }]} />
        </div>
      </section>

      {/* Ações em massa */}
      {sel.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-brand/40 bg-accent/60 p-2.5 text-[11px]">
          <Sparkles className="h-3.5 w-3.5 text-brand" />
          <span className="font-semibold text-brand">{sel.size} selecionados.</span>
          <span className="text-muted-foreground">Ações em massa:</span>
          <BulkBtn icon={Download} label="Exportar" />
          <BulkBtn icon={ArrowRightLeft} label="Atribuir corretor" />
          <BulkBtn icon={X} label="Marcar inativo" tone="direction" />
          <BulkBtn icon={Mail} label="Disparar campanha" />
          <button onClick={() => setSel(new Set())} className="ml-auto text-muted-foreground hover:text-direction">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Resultado */}
      <section className="overflow-hidden rounded-md border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border bg-secondary/40 px-3 py-2 text-[11px]">
          <span className="font-semibold text-graphite">
            {filtrados.length} resultados
            <span className="ml-1 font-normal text-muted-foreground">de {base.length} clientes na base</span>
          </span>
          <span className="text-muted-foreground">Ordenado por: última interação ↓</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px]">
            <thead className="bg-secondary/30 text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="w-8 px-3 py-2">
                  <input type="checkbox" checked={allChecked} onChange={toggleAll} className="h-3.5 w-3.5 accent-[var(--brand)]" />
                </th>
                <Th>CPF/CNPJ</Th>
                <Th>Nome</Th>
                <Th>PF/PJ</Th>
                <Th>Sit.</Th>
                <Th>Cidade / UF</Th>
                <Th>Corretor</Th>
                <Th className="text-center">Oport.</Th>
                <Th>Última interação</Th>
                <Th>Temp.</Th>
                <Th>LGPD</Th>
                <Th>Ações</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtrados.map((c) => {
                const t = temperatura(c);
                const ultima = c.followUps[0]?.data ?? c.atualizadoEm;
                const mascarar = scope === "corretor";
                return (
                  <tr key={c.idParticipante} className="hover:bg-secondary/30">
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={sel.has(c.idParticipante)}
                        onChange={() => toggle(c.idParticipante)}
                        className="h-3.5 w-3.5 accent-[var(--brand)]"
                      />
                    </td>
                    <td className="px-3 py-2 font-mono text-[11px] text-muted-foreground">
                      {mascarar ? maskCpfCnpj(c.cpfCnpj) : fmtCpfCnpj(c.cpfCnpj)}
                    </td>
                    <td className="px-3 py-2 font-semibold text-graphite">{c.nomeParticipante}</td>
                    <td className="px-3 py-2">{c.tipoPessoa === "F" ? "Física" : "Jurídica"}</td>
                    <td className="px-3 py-2">
                      <span className={`rounded-sm px-1.5 py-0.5 text-[10px] font-semibold ${
                        c.tipoSituacao === "A"
                          ? "bg-[color-mix(in_oklab,var(--success)_12%,white)] text-[var(--success)]"
                          : "bg-secondary text-muted-foreground"
                      }`}>
                        {c.tipoSituacao === "A" ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{c.municipio} / {c.uf}</td>
                    <td className="px-3 py-2">{c.nomeCorretor}</td>
                    <td className="px-3 py-2 text-center font-semibold text-graphite">{c.oportunidades.length}</td>
                    <td className="px-3 py-2 text-muted-foreground">{fmtDate(ultima)}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[10px] font-semibold ${TEMP_LABEL[t].c}`}>
                        <Thermometer className="h-2.5 w-2.5" /> {TEMP_LABEL[t].l}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`text-[10px] font-semibold ${c.fgAutorizacaoDados ? "text-[var(--success)]" : "text-direction"}`}>
                        {c.fgAutorizacaoDados ? "OK" : "Pendente"}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <RowActions />
                    </td>
                  </tr>
                );
              })}
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={12} className="px-3 py-8 text-center text-muted-foreground">
                    Nenhum cliente encontrado com os filtros atuais.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {scope === "corretor" && (
        <p className="text-[11px] text-muted-foreground">
          <strong>Escopo restrito:</strong> você visualiza apenas clientes com <code className="rounded bg-secondary px-1">idUsuarioParceiro</code> igual ao seu.
        </p>
      )}
    </div>
  );
}

/* ============================== UI ============================== */

const inp =
  "w-full rounded-sm border border-border bg-card px-2.5 py-1.5 text-[12px] text-graphite outline-none placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/20";

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

function Txt({
  label, value, onChange, type = "text", placeholder, disabled,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; disabled?: boolean;
}) {
  return (
    <label className="flex flex-1 flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <input type={type} value={value} disabled={disabled} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`${inp} disabled:bg-secondary/60 disabled:text-muted-foreground`} />
    </label>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={`whitespace-nowrap px-3 py-2 font-semibold ${className}`}>{children}</th>;
}

function BulkBtn({
  icon: Icon, label, tone = "brand",
}: {
  icon: React.ComponentType<{ className?: string }>; label: string; tone?: "brand" | "direction";
}) {
  return (
    <button className={`inline-flex items-center gap-1 rounded-sm px-2 py-1 font-semibold uppercase tracking-wider transition ${
      tone === "direction"
        ? "bg-[color-mix(in_oklab,var(--direction)_10%,white)] text-direction hover:bg-[color-mix(in_oklab,var(--direction)_18%,white)]"
        : "bg-brand text-brand-foreground hover:opacity-95"
    }`}>
      <Icon className="h-3 w-3" /> {label}
    </button>
  );
}

function RowActions() {
  const [open, setOpen] = useState(false);
  const itens = [
    { i: Eye,             l: "Ver ficha" },
    { i: Pencil,          l: "Editar" },
    { i: Plus,            l: "Nova oportunidade" },
    { i: Calculator,      l: "Nova simulação" },
    { i: MessageCircle,   l: "Enviar mensagem" },
    { i: History,         l: "Histórico" },
    { i: ArrowRightLeft,  l: "Transferir corretor" },
    { i: FileText,        l: "Exportar" },
  ];
  return (
    <div className="relative inline-block">
      <button onClick={() => setOpen((v) => !v)} className="inline-flex items-center gap-1 rounded-sm border border-border bg-card px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-graphite hover:border-brand/40">
        Ações <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <ul className="absolute right-0 z-10 mt-1 w-48 rounded-sm border border-border bg-card py-1 shadow-md">
          {itens.map((it) => (
            <li key={it.l}>
              <button className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-[11px] text-graphite hover:bg-secondary/50">
                <it.i className="h-3 w-3 text-brand" /> {it.l}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
