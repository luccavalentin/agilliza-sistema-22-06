// Minhas Simulações — lista e ações sobre simulações do usuário/escopo.

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowRightLeft, Copy, Download, Eye, History, Pencil, Search, Send, Share2, Star } from "lucide-react";
import { PanelHeader, FilterBar } from "@/components/dashboards/primitives";
import { simulacoes, clienteById, usuarioById, bancos, clientes, bancoById } from "@/lib/operacional/mock-data";
import { formatBRL, formatDataHora, formatPercent } from "@/lib/operacional/formatters";
import { useDashboardFilters, PERIODOS } from "@/hooks/use-dashboard-filters";
import { BankLogo } from "@/components/operacional/bank-logo";
import { downloadBrandedPdf } from "@/lib/pdf-export";
import type { Simulacao } from "@/lib/operacional/types";

export function MinhasSimulacoes({
  escopo, usuarioAtualId = "u-cor-1",
}: { escopo: "correspondente" | "corretor"; usuarioAtualId?: string }) {
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<"todas" | "favoritas" | "enviadas" | "rascunhos">("todas");
  const { filters, set, reset, apply } = useDashboardFilters();

  const linhas = useMemo(() => {
    let src = escopo === "corretor"
      ? simulacoes.filter((s) => s.corretorId === usuarioAtualId || s.usuarioId === usuarioAtualId)
      : simulacoes.filter((s) => s.usuarioId === usuarioAtualId);
    if (filtro === "enviadas") src = src.filter((s) => s.status === "Enviada para proposta");
    if (filtro === "rascunhos") src = src.filter((s) => s.status === "Rascunho");
    src = apply(src, {
      data: (s) => s.criadaEm,
      produto: (s) => s.produto,
      status: (s) => s.status,
      cliente: (s) => clienteById(s.clienteId)?.nome,
    });
    const q = busca.toLowerCase();
    if (q) {
      src = src.filter((s) => {
        const cli = clienteById(s.clienteId);
        return s.id.toLowerCase().includes(q) || cli?.nome.toLowerCase().includes(q) || s.produto.toLowerCase().includes(q);
      });
    }
    return src;
  }, [busca, filtro, escopo, usuarioAtualId, apply]);

  return (
    <div className="space-y-5">
      <PanelHeader
        eyebrow="OPERACIONAL"
        title="Minhas Simulações"
        subtitle="Gerencie as simulações que você criou ou está acompanhando."
      />

      <FilterBar
        onReset={reset}
        filters={[
          { label: "Cliente", value: filters.cliente, options: ["Todos", ...clientes.map(c => c.nome)], onChange: set("cliente") },
          { label: "Banco", value: filters.banco, options: ["Todos", ...bancos.map(b => b.sigla)], onChange: set("banco") },
          { label: "Produto", value: filters.produto, options: ["Todos", "Financiamento Imobiliário", "Home Equity"], onChange: set("produto") },
          { label: "Analista", value: filters.analista, options: ["Todos", "Camila Reis", "Pedro Nogueira"], onChange: set("analista") },
          { label: "Status", value: filters.status, options: ["Todos", "Rascunho", "Em andamento", "Concluída", "Enviada para proposta", "Arquivada"], onChange: set("status") },
          { label: "Período", value: filters.periodo, options: PERIODOS, onChange: set("periodo") },
        ]}
        dateRange={{
          from: filters.customFrom,
          to: filters.customTo,
          onFrom: set("customFrom"),
          onTo: set("customTo"),
          show: filters.periodo === "Personalizado",
        }}
      />


      <section className="rounded-lg border border-border bg-card">
        <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
          <div className="inline-flex rounded-md border border-border bg-secondary p-0.5 text-xs">
            {([
              ["todas", "Todas"],
              ["favoritas", "Favoritas"],
              ["enviadas", "Enviadas p/ proposta"],
              ["rascunhos", "Rascunhos"],
            ] as const).map(([k, l]) => (
              <button key={k} onClick={() => setFiltro(k)}
                className={`px-3 py-1.5 rounded font-semibold ${filtro === k ? "bg-brand text-brand-foreground" : "text-muted-foreground"}`}>{l}</button>
            ))}
          </div>
          <div className="relative ml-auto w-full sm:w-72">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar simulação…"
              className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-xs outline-none focus:border-brand focus:ring-2 focus:ring-brand/15" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-xs">
            <thead>
              <tr className="bg-secondary">
                {["ID", "Cliente", "Produto", "Bancos", "Valor", "Prazo", "Cenários", "Status", "Criada por", "Criada em", "Ações"].map((h) => (
                  <th key={h} className="border-b border-border px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {linhas.map((s) => {
                const bancosUnicos = Array.from(new Set(s.cenarios.map((c) => c.bancoId)))
                  .map((id) => bancoById(id)).filter(Boolean);
                return (
                <tr key={s.id} className="border-b border-border hover:bg-secondary/40">
                  <td className="px-3 py-2 font-bold text-graphite">
                    {s.id}
                    {s.origemCopiaDeId && <span className="ml-1.5 rounded bg-info/10 px-1.5 py-0.5 text-[9px] font-bold uppercase text-info">Cópia</span>}
                  </td>
                  <td className="px-3 py-2">{clienteById(s.clienteId)?.nome ?? <span className="italic text-muted-foreground">Sem cliente</span>}</td>
                  <td className="px-3 py-2">{s.produto}</td>
                  <td className="px-3 py-2">
                    <div className="flex -space-x-1">
                      {bancosUnicos.slice(0, 5).map((b) => (
                        <BankLogo key={b!.id} banco={b} size="xs" />
                      ))}
                      {bancosUnicos.length === 0 && <span className="text-muted-foreground">—</span>}
                    </div>
                  </td>
                  <td className="px-3 py-2">{formatBRL(s.valorImovel ?? s.valorSolicitado ?? 0)}</td>
                  <td className="px-3 py-2">{s.prazoMesesBase}m</td>
                  <td className="px-3 py-2">{s.cenarios.length || "—"}</td>
                  <td className="px-3 py-2"><span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-semibold text-graphite">{s.status}</span></td>
                  <td className="px-3 py-2">{usuarioById(s.usuarioId)?.nome.split(" ")[0]}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-[11px] text-muted-foreground">{formatDataHora(s.criadaEm)}</td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-1">
                      <IconBtn icon={Eye}        title="Visualizar"   onClick={() => toast.info(`Abrindo ${s.id}`)} />
                      <IconBtn icon={Pencil}     title="Editar"       onClick={() => toast.info("Edição em breve")} />
                      <IconBtn icon={Copy}       title="Duplicar"     onClick={() => toast.success("Simulação duplicada")} />
                      <IconBtn icon={Send}       title="Enviar p/ proposta" onClick={() => toast.success("Enviada para proposta")} />
                      <IconBtn icon={Share2}     title="Compartilhar" onClick={() => toast.info("Link copiado")} />
                      <IconBtn icon={Download}   title="Baixar PDF"   onClick={() => baixarSimulacaoPdf(s)} />
                      <IconBtn icon={Star}       title="Favoritar"    onClick={() => toast.success("Favoritada")} />
                      <IconBtn icon={History}    title="Histórico"    onClick={() => toast.info("Histórico")} />
                      <IconBtn icon={ArrowRightLeft} title="Comparar" onClick={() => toast.info("Comparar")} />
                    </div>
                  </td>
                </tr>
              );})}
              {linhas.length === 0 && (
                <tr><td colSpan={11} className="p-6 text-center text-xs text-muted-foreground">Nenhuma simulação encontrada.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function IconBtn({ icon: Icon, title, onClick }: { icon: typeof Eye; title: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className="grid h-7 w-7 place-items-center rounded border border-border bg-background text-muted-foreground transition hover:border-brand/40 hover:text-brand"
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}

async function baixarSimulacaoPdf(s: Simulacao) {
  if (!s.cenarios.length) {
    toast.info("Esta simulação ainda não tem cenários para exportar.");
    return;
  }
  const cli = clienteById(s.clienteId);
  await downloadBrandedPdf({
    title: `Simulação ${s.id}`,
    module: "Operacional",
    subtitle: cli ? `Cliente: ${cli.nome} · ${s.produto}` : s.produto,
    fileName: `simulacao-${s.id}`,
    kpis: [
      { label: "Valor do imóvel", value: formatBRL(s.valorImovel ?? s.valorSolicitado ?? 0) },
      { label: "Prazo base", value: `${s.prazoMesesBase} m` },
      { label: "Cenários", value: String(s.cenarios.length) },
      { label: "Status", value: s.status },
    ],
    sections: [{
      title: "Cenários comparativos",
      head: ["Banco", "Prazo", "Tabela", "Taxa a.a.", "Parcela inicial", "Parcela final", "Total pago", "Juros", "CET", "Renda mín."],
      body: s.cenarios.map((c) => {
        const b = bancoById(c.bancoId);
        return [
          b?.nome ?? c.bancoId,
          `${c.prazoMeses}m`,
          c.tabela,
          formatPercent(c.taxaAaPercent),
          formatBRL(c.parcelaInicial),
          formatBRL(c.parcelaFinal),
          formatBRL(c.totalPago),
          formatBRL(c.totalJuros),
          formatPercent(c.cetPercent),
          formatBRL(c.rendaMinima),
        ];
      }),
    }],
  });
}
