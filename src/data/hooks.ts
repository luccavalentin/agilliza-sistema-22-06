// Hooks reativos e seletores derivados consumindo a store central.

import { useMemo } from "react";
import { useDB, findCliente, findBanco, findUsuario } from "./store";
import type { DetailRow } from "@/components/dashboards/detail-dialog";
import type { Lancamento, Comissao } from "@/lib/financeiro/types";
import type { Proposta } from "@/lib/operacional/types";

// ============================== Seletores básicos ==============================
export const usePropostas = () => useDB((s) => s.propostas);
export const useClientes = () => useDB((s) => s.clientes);
export const useLancamentos = () => useDB((s) => s.lancamentos);
export const useReceber = () => useDB((s) => s.lancamentos.filter((l) => l.tipo === "receber"));
export const usePagar = () => useDB((s) => s.lancamentos.filter((l) => l.tipo === "pagar"));
export const useComissoes = () => useDB((s) => s.comissoes);
export const useTarefas = () => useDB((s) => s.tarefas);
export const useNotificacoes = () => useDB((s) => s.notificacoes);

// ============================== Formatters ==============================
const fmtBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const fmtDate = (iso?: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${String(d.getUTCDate()).padStart(2, "0")}/${String(d.getUTCMonth() + 1).padStart(2, "0")}/${d.getUTCFullYear()}`;
};

function toneFor(status: string): DetailRow["statusTone"] {
  const s = status.toLowerCase();
  if (s.includes("aprov") || s.includes("recebido") || s.includes("pago") || s.includes("conclu") || s.includes("liber"))
    return "success";
  if (s.includes("vencid") || s.includes("reprov") || s.includes("cancel") || s.includes("bloque")) return "direction";
  if (s.includes("pend") || s.includes("aguard") || s.includes("revisão") || s.includes("trata")) return "warning";
  return "info";
}

// ============================== Conversores ==============================
function propostaToRow(p: Proposta): DetailRow {
  const cli = findCliente(p.clienteId);
  const banco = findBanco(p.bancoId);
  const user = findUsuario(p.responsavelId ?? p.corretorId);
  return {
    data: fmtDate(p.atualizadaEm),
    cliente: cli?.nome ?? "—",
    banco: banco?.nome ?? "—",
    status: p.status,
    statusTone: toneFor(p.status),
    usuario: user?.nome ?? "—",
    valor: fmtBRL(p.valor),
  };
}

function lancamentoToRow(l: Lancamento): DetailRow {
  const cli = l.clienteId ? findCliente(l.clienteId) : undefined;
  const cred = cli?.nome ?? l.fornecedor ?? l.beneficiario ?? l.descricao;
  return {
    data: fmtDate(l.vencimento),
    cliente: cred,
    banco: l.tipo === "receber" ? "Recebível" : "A pagar",
    status: l.status,
    statusTone: toneFor(l.status),
    usuario: findUsuario(l.criadoPor)?.nome ?? "—",
    valor: fmtBRL(l.valor),
  };
}

function comissaoToRow(c: Comissao): DetailRow {
  const cli = findCliente(c.clienteId);
  const banco = findBanco(c.bancoId);
  const user = findUsuario(c.corretorId);
  return {
    data: fmtDate(c.dataPrevista),
    cliente: cli?.nome ?? "—",
    banco: banco?.nome ?? "—",
    status: c.status,
    statusTone: toneFor(c.status),
    usuario: user?.nome ?? "—",
    valor: fmtBRL(c.valor),
  };
}

// ============================== Detail rows (drill-down) ==============================
/**
 * Resolve linhas detalhadas a partir de uma "chave" associada ao card/KPI clicado.
 * Convenções:
 *   "propostas:*" — todas as propostas
 *   "propostas:status=Aprovada"
 *   "propostas:etapa=Análise jurídica"
 *   "lancamentos:tipo=receber"
 *   "lancamentos:tipo=pagar&status=Vencido"
 *   "comissoes:status=Paga"
 *
 * Mantém fallback: se a chave for desconhecida, retorna propostas recentes.
 */
export function useDetailRows(key?: string): DetailRow[] {
  const propostas = usePropostas();
  const lancamentos = useLancamentos();
  const comissoes = useComissoes();

  return useMemo(() => {
    if (!key) return propostas.slice(0, 30).map(propostaToRow);
    const [scope, qs = ""] = key.split(":");
    const params = Object.fromEntries(
      qs.split("&").filter(Boolean).map((kv) => {
        const [k, v] = kv.split("=");
        return [k, decodeURIComponent(v ?? "")];
      }),
    );
    if (scope === "propostas") {
      let out = propostas;
      if (params.status) out = out.filter((p) => p.status === params.status);
      if (params.etapa) out = out.filter((p) => p.etapa === params.etapa);
      if (params.banco) out = out.filter((p) => findBanco(p.bancoId)?.nome === params.banco);
      return out.map(propostaToRow);
    }
    if (scope === "lancamentos") {
      let out = lancamentos;
      if (params.tipo) out = out.filter((l) => l.tipo === params.tipo);
      if (params.status) out = out.filter((l) => l.status === params.status);
      return out.map(lancamentoToRow);
    }
    if (scope === "comissoes") {
      let out = comissoes;
      if (params.status) out = out.filter((c) => c.status === params.status);
      return out.map(comissaoToRow);
    }
    return propostas.slice(0, 30).map(propostaToRow);
  }, [key, propostas, lancamentos, comissoes]);
}

// ============================== Dashboard KPIs ==============================
export type DashboardKpis = {
  propostasAtivas: number;
  propostasAprovadas: number;
  propostasReprovadas: number;
  propostasDocPendente: number;
  totalAReceber: number;
  totalRecebido: number;
  totalAPagar: number;
  totalPago: number;
  comissoesPrevistas: number;
  comissoesPagas: number;
  saldoCaixa: number;
  slaVencidos: number;
};

export function useDashboardKpis(): DashboardKpis {
  const propostas = usePropostas();
  const lancamentos = useLancamentos();
  const comissoes = useComissoes();
  const contas = useDB((s) => s.contas);

  return useMemo(() => {
    const ativas = propostas.filter(
      (p) => !["Aprovada", "Reprovada", "Finalizada"].includes(p.status),
    ).length;
    const aprovadas = propostas.filter((p) => p.status === "Aprovada" || p.status === "Contrato emitido").length;
    const reprovadas = propostas.filter((p) => p.status === "Reprovada").length;
    const docPend = propostas.filter((p) => p.status === "Documentação pendente").length;

    const receber = lancamentos.filter((l) => l.tipo === "receber");
    const pagar = lancamentos.filter((l) => l.tipo === "pagar");
    const totalAReceber = receber
      .filter((l) => l.status !== "Recebido" && l.status !== "Cancelado")
      .reduce((a, l) => a + l.valor, 0);
    const totalRecebido = receber
      .filter((l) => l.status === "Recebido" || l.status === "Recebido parcialmente")
      .reduce((a, l) => a + (l.valorPago ?? l.valor), 0);
    const totalAPagar = pagar
      .filter((l) => l.status !== "Pago" && l.status !== "Cancelado")
      .reduce((a, l) => a + l.valor, 0);
    const totalPago = pagar
      .filter((l) => l.status === "Pago" || l.status === "Pago parcialmente")
      .reduce((a, l) => a + (l.valorPago ?? l.valor), 0);

    const comissoesPrevistas = comissoes
      .filter((c) => c.status === "Prevista" || c.status === "Aguardando aprovação" || c.status === "Liberada")
      .reduce((a, c) => a + c.valor, 0);
    const comissoesPagas = comissoes.filter((c) => c.status === "Paga").reduce((a, c) => a + c.valor, 0);
    const saldoCaixa = contas.reduce((a, c) => a + c.saldoAtual, 0);

    const ANCHOR = new Date("2026-06-21T12:00:00.000Z").getTime();
    const slaVencidos = propostas.filter((p) => new Date(p.slaPrazo).getTime() < ANCHOR).length;

    return {
      propostasAtivas: ativas,
      propostasAprovadas: aprovadas,
      propostasReprovadas: reprovadas,
      propostasDocPendente: docPend,
      totalAReceber,
      totalRecebido,
      totalAPagar,
      totalPago,
      comissoesPrevistas,
      comissoesPagas,
      saldoCaixa,
      slaVencidos,
    };
  }, [propostas, lancamentos, comissoes, contas]);
}

// ============================== Funil Kanban ==============================
export function useFunilEtapas() {
  const propostas = usePropostas();
  return useMemo(() => {
    const map = new Map<string, number>();
    propostas.forEach((p) => map.set(p.etapa, (map.get(p.etapa) ?? 0) + 1));
    return Array.from(map.entries()).map(([etapa, qtd]) => ({ etapa, qtd }));
  }, [propostas]);
}
