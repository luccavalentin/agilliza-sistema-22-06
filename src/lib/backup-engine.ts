/**
 * backup-engine.ts — Motor de exportação XLSX (Agilliza).
 *
 * Gera planilha .xlsx profissionalmente formatada usando ExcelJS:
 *  • Cabeçalho em negrito com fundo brand e texto branco
 *  • Freeze pane na linha 1
 *  • AutoFilter ativado em todas as abas
 *  • Larguras de coluna calculadas
 *  • Tipos nativos: número (BRL), data (DD/MM/AAAA), percentual, boolean
 *  • Bordas leves, zebra striping discreto
 *  • Aba "Resumo" com totais consolidados
 *
 * Nenhum registro é omitido — inclui finalizados, cancelados, arquivados,
 * históricos. Nunca exporta senhas/tokens.
 */
import ExcelJS from "exceljs";

import {
  clientes, propostas, simulacoes, demandas, tarefas, bancos, usuarios,
} from "@/lib/operacional/mock-data";
import {
  contasReceber, contasPagar, comissoes, recorrencias,
  categorias, centrosCusto, contas, itensConciliacao,
} from "@/lib/financeiro/mock-data";

// ---------------------------------------------------------------------------
// Tipos do DSL de coluna
// ---------------------------------------------------------------------------
type ColType = "text" | "number" | "money" | "percent" | "date" | "datetime" | "bool" | "int";
interface ColSpec {
  header: string;
  key: string;
  type?: ColType;
  width?: number;
}
interface SheetSpec {
  name: string;
  cols: ColSpec[];
  rows: Record<string, unknown>[];
}

// Tokens visuais (alinhados ao tema brand)
const BRAND = "FF000F9F";
const BRAND_FG = "FFFFFFFF";
const ZEBRA = "FFF8FAFC";
const BORDER = "FFE5E7EB";
const RESUMO_FILL = "FFFEF3C7";

const NUMFMT = {
  money: '"R$" #,##0.00;[Red]-"R$" #,##0.00;"-"',
  percent: "0.00%",
  date: "DD/MM/YYYY",
  datetime: "DD/MM/YYYY HH:MM",
  int: "#,##0",
  number: "#,##0.00",
} as const;

// ---------------------------------------------------------------------------
// Helpers de lookup
// ---------------------------------------------------------------------------
const uName = (id?: string) => usuarios.find((u) => u.id === id)?.nome ?? "";
const cName = (id?: string) => clientes.find((c) => c.id === id)?.nome ?? "";
const bName = (id?: string) => bancos.find((b) => b.id === id)?.nome ?? "";
const catName = (id?: string) => categorias.find((c) => c.id === id)?.nome ?? "";
const ccName = (id?: string) => centrosCusto.find((c) => c.id === id)?.nome ?? "";
const acctName = (id?: string) => contas.find((c) => c.id === id)?.nome ?? "";

function toDate(v: unknown): Date | string {
  if (!v) return "";
  if (v instanceof Date) return v;
  if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}/.test(v)) {
    const d = new Date(v);
    return isNaN(d.getTime()) ? v : d;
  }
  return String(v);
}

// ---------------------------------------------------------------------------
// Especificações por aba
// ---------------------------------------------------------------------------
function buildSheets(): SheetSpec[] {
  return [
    {
      name: "Clientes",
      cols: [
        { header: "ID", key: "id", width: 14 },
        { header: "Nome", key: "nome", width: 32 },
        { header: "Tipo", key: "tipo", width: 16 },
        { header: "CPF", key: "cpf", width: 16 },
        { header: "CNPJ", key: "cnpj", width: 20 },
        { header: "E-mail", key: "email", width: 30 },
        { header: "Telefone", key: "telefone", width: 18 },
        { header: "Corretor responsável", key: "corretor", width: 26 },
      ],
      rows: clientes.map((c) => ({
        id: c.id,
        nome: c.nome,
        tipo: c.cnpj ? "Pessoa Jurídica" : "Pessoa Física",
        cpf: c.cpf ?? "",
        cnpj: c.cnpj ?? "",
        email: c.email ?? "",
        telefone: c.telefone ?? "",
        corretor: uName(c.corretorId),
      })),
    },
    {
      name: "Simulações",
      cols: [
        { header: "ID", key: "id", width: 14 },
        { header: "Status", key: "status", width: 18 },
        { header: "Produto", key: "produto", width: 22 },
        { header: "Cliente", key: "cliente", width: 28 },
        { header: "Corretor", key: "corretor", width: 24 },
        { header: "Criada em", key: "criada", type: "datetime", width: 18 },
        { header: "Atualizada em", key: "atualizada", type: "datetime", width: 18 },
        { header: "Valor do imóvel", key: "vImovel", type: "money", width: 18 },
        { header: "Valor entrada", key: "vEntrada", type: "money", width: 18 },
        { header: "Valor financiado", key: "vFin", type: "money", width: 18 },
        { header: "Valor solicitado (HE)", key: "vHE", type: "money", width: 20 },
        { header: "LTV", key: "ltv", type: "percent", width: 10 },
        { header: "Prazo (meses)", key: "prazo", type: "int", width: 14 },
        { header: "Renda bruta", key: "renda", type: "money", width: 16 },
        { header: "Observações", key: "obs", width: 40 },
      ],
      rows: simulacoes.map((s) => ({
        id: s.id,
        status: s.status,
        produto: s.produto,
        cliente: cName(s.clienteId),
        corretor: uName(s.corretorId),
        criada: toDate(s.criadaEm),
        atualizada: toDate(s.atualizadaEm),
        vImovel: s.valorImovel ?? "",
        vEntrada: s.valorEntrada ?? "",
        vFin: s.valorFinanciado ?? "",
        vHE: s.valorSolicitado ?? "",
        ltv: s.ltvPercent != null ? s.ltvPercent / 100 : "",
        prazo: s.prazoMesesBase ?? "",
        renda: s.rendaBruta ?? "",
        obs: s.observacoes ?? "",
      })),
    },
    {
      name: "Propostas (Kanban)",
      cols: [
        { header: "ID", key: "id", width: 14 },
        { header: "Número", key: "numero", width: 16 },
        { header: "Status", key: "status", width: 18 },
        { header: "Etapa (Kanban)", key: "etapa", width: 22 },
        { header: "Produto", key: "produto", width: 20 },
        { header: "Banco", key: "banco", width: 22 },
        { header: "Cliente", key: "cliente", width: 28 },
        { header: "Corretor", key: "corretor", width: 24 },
        { header: "Responsável", key: "resp", width: 24 },
        { header: "Valor", key: "valor", type: "money", width: 18 },
        { header: "Prioridade", key: "prio", width: 14 },
        { header: "SLA prazo", key: "sla", type: "date", width: 14 },
        { header: "Pendências", key: "pend", type: "int", width: 12 },
        { header: "Documentos", key: "docs", type: "int", width: 12 },
        { header: "Transferida", key: "transf", type: "bool", width: 12 },
        { header: "Criada em", key: "criada", type: "datetime", width: 18 },
        { header: "Atualizada em", key: "atualizada", type: "datetime", width: 18 },
      ],
      rows: propostas.map((p) => ({
        id: p.id, numero: p.numero, status: p.status, etapa: p.etapa,
        produto: p.produto, banco: bName(p.bancoId), cliente: cName(p.clienteId),
        corretor: uName(p.corretorId), resp: uName(p.responsavelId),
        valor: p.valor ?? "", prio: p.prioridade, sla: toDate(p.slaPrazo),
        pend: p.pendencias ?? 0, docs: p.documentos ?? 0, transf: !!p.transferida,
        criada: toDate(p.criadaEm), atualizada: toDate(p.atualizadaEm),
      })),
    },
    {
      name: "Histórico de propostas",
      cols: [
        { header: "Proposta ID", key: "pid", width: 14 },
        { header: "Número", key: "numero", width: 16 },
        { header: "Data", key: "data", type: "datetime", width: 18 },
        { header: "Usuário", key: "usuario", width: 24 },
        { header: "Ação", key: "acao", width: 60 },
      ],
      rows: propostas.flatMap((p) =>
        (p.historico ?? []).map((h) => ({
          pid: p.id, numero: p.numero, data: toDate(h.data),
          usuario: uName(h.usuarioId), acao: h.acao,
        })),
      ),
    },
    {
      name: "Demandas - SLA",
      cols: [
        { header: "ID", key: "id", width: 14 },
        { header: "Título", key: "titulo", width: 38 },
        { header: "Tipo", key: "tipo", width: 18 },
        { header: "Status", key: "status", width: 16 },
        { header: "Prioridade", key: "prio", width: 14 },
        { header: "Cliente", key: "cliente", width: 28 },
        { header: "Proposta vinculada", key: "pid", width: 18 },
        { header: "Responsável", key: "resp", width: 24 },
        { header: "Criado por", key: "criadoPor", width: 24 },
        { header: "SLA prazo", key: "sla", type: "date", width: 14 },
        { header: "Transferida", key: "transf", type: "bool", width: 12 },
        { header: "Criada em", key: "criada", type: "datetime", width: 18 },
      ],
      rows: demandas.map((d) => ({
        id: d.id, titulo: d.titulo, tipo: d.tipo, status: d.status, prio: d.prioridade,
        cliente: cName(d.clienteId), pid: d.propostaId ?? "",
        resp: uName(d.responsavelId), criadoPor: uName(d.criadoPorId),
        sla: toDate(d.slaPrazo), transf: !!d.transferida, criada: toDate(d.criadaEm),
      })),
    },
    {
      name: "Tarefas",
      cols: [
        { header: "ID", key: "id", width: 14 },
        { header: "Título", key: "titulo", width: 40 },
        { header: "Status", key: "status", width: 16 },
        { header: "Prioridade", key: "prio", width: 14 },
        { header: "Usuário", key: "usuario", width: 24 },
        { header: "Cliente", key: "cliente", width: 28 },
        { header: "Proposta vinculada", key: "pid", width: 18 },
        { header: "Prazo", key: "prazo", type: "date", width: 14 },
      ],
      rows: tarefas.map((t) => ({
        id: t.id, titulo: t.titulo, status: t.status, prio: t.prioridade,
        usuario: uName(t.usuarioId), cliente: cName(t.clienteId),
        pid: t.propostaId ?? "", prazo: toDate(t.prazo),
      })),
    },
    {
      name: "Contas a receber",
      cols: [
        { header: "ID", key: "id", width: 14 },
        { header: "Descrição", key: "desc", width: 38 },
        { header: "Status", key: "status", width: 18 },
        { header: "Natureza", key: "nat", width: 14 },
        { header: "Produto", key: "prod", width: 18 },
        { header: "Cliente", key: "cliente", width: 28 },
        { header: "Corretor", key: "corretor", width: 24 },
        { header: "Proposta", key: "pid", width: 14 },
        { header: "Categoria", key: "cat", width: 22 },
        { header: "Centro de custo", key: "cc", width: 18 },
        { header: "Conta financeira", key: "conta", width: 22 },
        { header: "Forma de pagamento", key: "forma", width: 18 },
        { header: "Valor", key: "valor", type: "money", width: 16 },
        { header: "Valor pago", key: "vPago", type: "money", width: 16 },
        { header: "Saldo", key: "saldo", type: "money", width: 16 },
        { header: "Emissão", key: "emissao", type: "date", width: 14 },
        { header: "Vencimento", key: "vencimento", type: "date", width: 14 },
        { header: "Liquidação", key: "liquidacao", type: "date", width: 14 },
        { header: "Parcela atual", key: "parcAtual", type: "int", width: 12 },
        { header: "Total parcelas", key: "parcTotal", type: "int", width: 12 },
      ],
      rows: contasReceber.map((r) => ({
        id: r.id, desc: r.descricao, status: r.status, nat: r.natureza,
        prod: r.produto ?? "", cliente: cName(r.clienteId), corretor: uName(r.corretorId),
        pid: r.propostaId ?? "", cat: catName(r.categoriaId), cc: ccName(r.centroCustoId),
        conta: acctName(r.contaId), forma: r.forma ?? "",
        valor: r.valor ?? 0, vPago: r.valorPago ?? 0,
        saldo: (r.valor ?? 0) - (r.valorPago ?? 0),
        emissao: toDate(r.emissao), vencimento: toDate(r.vencimento), liquidacao: toDate(r.liquidacao),
        parcAtual: r.parcelamento?.parcelaAtual ?? "",
        parcTotal: r.parcelamento?.totalParcelas ?? "",
      })),
    },
    {
      name: "Contas a pagar",
      cols: [
        { header: "ID", key: "id", width: 14 },
        { header: "Descrição", key: "desc", width: 38 },
        { header: "Status", key: "status", width: 18 },
        { header: "Natureza", key: "nat", width: 14 },
        { header: "Fornecedor", key: "forn", width: 24 },
        { header: "Beneficiário", key: "ben", width: 24 },
        { header: "Categoria", key: "cat", width: 22 },
        { header: "Centro de custo", key: "cc", width: 18 },
        { header: "Conta financeira", key: "conta", width: 22 },
        { header: "Forma de pagamento", key: "forma", width: 18 },
        { header: "Valor", key: "valor", type: "money", width: 16 },
        { header: "Valor pago", key: "vPago", type: "money", width: 16 },
        { header: "Saldo", key: "saldo", type: "money", width: 16 },
        { header: "Emissão", key: "emissao", type: "date", width: 14 },
        { header: "Vencimento", key: "vencimento", type: "date", width: 14 },
        { header: "Liquidação", key: "liquidacao", type: "date", width: 14 },
        { header: "Parcela atual", key: "parcAtual", type: "int", width: 12 },
        { header: "Total parcelas", key: "parcTotal", type: "int", width: 12 },
      ],
      rows: contasPagar.map((p) => ({
        id: p.id, desc: p.descricao, status: p.status, nat: p.natureza,
        forn: p.fornecedor ?? "", ben: p.beneficiario ?? "",
        cat: catName(p.categoriaId), cc: ccName(p.centroCustoId),
        conta: acctName(p.contaId), forma: p.forma ?? "",
        valor: p.valor ?? 0, vPago: p.valorPago ?? 0,
        saldo: (p.valor ?? 0) - (p.valorPago ?? 0),
        emissao: toDate(p.emissao), vencimento: toDate(p.vencimento), liquidacao: toDate(p.liquidacao),
        parcAtual: p.parcelamento?.parcelaAtual ?? "",
        parcTotal: p.parcelamento?.totalParcelas ?? "",
      })),
    },
    {
      name: "Comissões",
      cols: [
        { header: "ID", key: "id", width: 14 },
        { header: "Status", key: "status", width: 18 },
        { header: "Produto", key: "prod", width: 22 },
        { header: "Banco", key: "banco", width: 22 },
        { header: "Corretor", key: "corretor", width: 24 },
        { header: "Cliente", key: "cliente", width: 28 },
        { header: "Proposta", key: "pid", width: 14 },
        { header: "Base de cálculo", key: "base", type: "money", width: 18 },
        { header: "Percentual", key: "pct", type: "percent", width: 12 },
        { header: "Valor comissão", key: "valor", type: "money", width: 16 },
        { header: "Data prevista", key: "prev", type: "date", width: 14 },
        { header: "Data liberação", key: "lib", type: "date", width: 14 },
        { header: "Data pagamento", key: "pago", type: "date", width: 14 },
        { header: "Forma", key: "forma", width: 16 },
        { header: "Bloqueada", key: "bloq", type: "bool", width: 12 },
        { header: "Motivo bloqueio", key: "motivo", width: 32 },
      ],
      rows: comissoes.map((c) => ({
        id: c.id, status: c.status, prod: c.produto, banco: bName(c.bancoId),
        corretor: uName(c.corretorId), cliente: cName(c.clienteId), pid: c.propostaId,
        base: c.baseCalculo ?? 0, pct: (c.percentual ?? 0) / 100, valor: c.valor ?? 0,
        prev: toDate(c.dataPrevista), lib: toDate(c.dataLiberacao), pago: toDate(c.dataPagamento),
        forma: c.forma ?? "", bloq: !!c.bloqueada, motivo: c.motivoBloqueio ?? "",
      })),
    },
    {
      name: "Recorrências",
      cols: [
        { header: "ID", key: "id", width: 14 },
        { header: "Descrição", key: "desc", width: 36 },
        { header: "Tipo", key: "tipo", width: 12 },
        { header: "Status", key: "status", width: 14 },
        { header: "Frequência", key: "freq", width: 16 },
        { header: "Dia vencimento", key: "dia", type: "int", width: 14 },
        { header: "Data inicial", key: "ini", type: "date", width: 14 },
        { header: "Indefinido", key: "indef", type: "bool", width: 12 },
        { header: "Valor", key: "valor", type: "money", width: 16 },
        { header: "Valor variável", key: "vvar", type: "bool", width: 14 },
        { header: "Conta financeira", key: "conta", width: 22 },
        { header: "Categoria", key: "cat", width: 22 },
        { header: "Próxima geração", key: "prox", type: "date", width: 16 },
        { header: "Última geração", key: "ult", type: "date", width: 16 },
      ],
      rows: recorrencias.map((r) => ({
        id: r.id, desc: r.descricao, tipo: r.tipo === "pagar" ? "Pagar" : "Receber",
        status: r.status, freq: r.frequencia, dia: r.diaVencimento,
        ini: toDate(r.dataInicial), indef: !!r.indefinido,
        valor: r.valor ?? 0, vvar: !!r.valorVariavel,
        conta: acctName(r.contaId), cat: catName(r.categoriaId),
        prox: toDate(r.proximaGeracao), ult: toDate(r.ultimaGeracao),
      })),
    },
    {
      name: "Conciliação bancária",
      cols: [
        { header: "ID", key: "id", width: 14 },
        { header: "Data", key: "data", type: "date", width: 14 },
        { header: "Conta", key: "conta", width: 22 },
        { header: "Descrição", key: "desc", width: 36 },
        { header: "Categoria", key: "cat", width: 22 },
        { header: "Valor", key: "valor", type: "money", width: 16 },
        { header: "Status", key: "status", width: 18 },
        { header: "Origem", key: "origem", width: 16 },
      ],
      rows: itensConciliacao.map((i) => ({
        id: i.id, data: toDate(i.data), conta: acctName(i.contaId),
        desc: i.descricao, cat: catName(i.categoriaId),
        valor: i.valor ?? 0, status: i.status, origem: i.origem,
      })),
    },
    {
      name: "Contas financeiras",
      cols: [
        { header: "ID", key: "id", width: 14 },
        { header: "Nome", key: "nome", width: 28 },
        { header: "Banco", key: "banco", width: 22 },
        { header: "Agência", key: "agencia", width: 12 },
        { header: "Conta", key: "conta", width: 16 },
        { header: "Saldo atual", key: "saldo", type: "money", width: 18 },
      ],
      rows: contas.map((c) => ({
        id: c.id, nome: c.nome, banco: c.banco, agencia: c.agencia ?? "",
        conta: c.conta ?? "", saldo: c.saldoAtual ?? 0,
      })),
    },
    {
      name: "Usuários - Equipe",
      cols: [
        { header: "ID", key: "id", width: 14 },
        { header: "Nome", key: "nome", width: 28 },
        { header: "E-mail", key: "email", width: 32 },
        { header: "Papel", key: "papel", width: 22 },
      ],
      rows: usuarios.map((u) => ({
        id: u.id, nome: u.nome, email: u.email, papel: u.papel,
      })),
    },
    {
      name: "Bancos parceiros",
      cols: [
        { header: "ID", key: "id", width: 14 },
        { header: "Nome", key: "nome", width: 28 },
        { header: "Sigla", key: "sigla", width: 10 },
      ],
      rows: bancos.map((b) => ({ id: b.id, nome: b.nome, sigla: b.sigla })),
    },
    {
      name: "Categorias financeiras",
      cols: [
        { header: "ID", key: "id", width: 18 },
        { header: "Nome", key: "nome", width: 28 },
        { header: "Tipo", key: "tipo", width: 18 },
        { header: "Centro de custo", key: "cc", width: 22 },
        { header: "Ativa", key: "ativa", type: "bool", width: 10 },
        { header: "Cor", key: "cor", width: 12 },
      ],
      rows: categorias.map((c) => ({
        id: c.id, nome: c.nome, tipo: c.tipo, cc: ccName(c.centroCustoId),
        ativa: !!c.ativa, cor: c.cor,
      })),
    },
  ];
}

// ---------------------------------------------------------------------------
// Aba RESUMO (visão consolidada)
// ---------------------------------------------------------------------------
function addResumoSheet(wb: ExcelJS.Workbook, geradoEm: Date) {
  const ws = wb.addWorksheet("Resumo", { views: [{ state: "frozen", ySplit: 1 }] });
  ws.columns = [
    { key: "a", width: 36 },
    { key: "b", width: 24 },
    { key: "c", width: 40 },
  ];

  const titleRow = ws.addRow(["AGILLIZA — BACKUP COMPLETO DO SISTEMA"]);
  ws.mergeCells(titleRow.number, 1, titleRow.number, 3);
  titleRow.font = { bold: true, color: { argb: BRAND_FG }, size: 14 };
  titleRow.alignment = { vertical: "middle", horizontal: "center" };
  titleRow.height = 26;
  titleRow.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: BRAND } };

  const meta = ws.addRow(["Gerado em:", geradoEm, ""]);
  meta.getCell(2).numFmt = NUMFMT.datetime;
  meta.font = { italic: true, color: { argb: "FF374151" } };
  ws.addRow([]);

  const h1 = ws.addRow(["Módulo", "Registros", "Observação"]);
  styleHeader(h1);
  const modCount: Array<[string, number, string]> = [
    ["Clientes", clientes.length, ""],
    ["Simulações", simulacoes.length, "Inclui arquivadas"],
    ["Propostas (Kanban)", propostas.length, "Inclui finalizadas, canceladas e arquivadas"],
    ["Histórico de propostas", propostas.reduce((s, p) => s + (p.historico?.length ?? 0), 0), "Log completo de transições"],
    ["Demandas - SLA", demandas.length, "Inclui concluídas e vencidas"],
    ["Tarefas", tarefas.length, "Inclui concluídas"],
    ["Contas a receber", contasReceber.length, ""],
    ["Contas a pagar", contasPagar.length, ""],
    ["Comissões", comissoes.length, ""],
    ["Recorrências", recorrencias.length, ""],
    ["Conciliação bancária", itensConciliacao.length, ""],
    ["Contas financeiras", contas.length, ""],
    ["Usuários - Equipe", usuarios.length, "Sem senhas/tokens"],
    ["Bancos parceiros", bancos.length, ""],
    ["Categorias financeiras", categorias.length, ""],
  ];
  modCount.forEach((r, i) => {
    const row = ws.addRow(r);
    row.getCell(2).numFmt = NUMFMT.int;
    if (i % 2 === 1) zebra(row, 3);
  });

  ws.addRow([]);
  const h2 = ws.addRow(["Financeiro", "Valor", ""]);
  styleHeader(h2);
  const totalReceber = contasReceber.reduce((s, r) => s + r.valor, 0);
  const totalRecebido = contasReceber.filter((r) => r.status === "Recebido").reduce((s, r) => s + r.valor, 0);
  const totalPagar = contasPagar.reduce((s, r) => s + r.valor, 0);
  const totalPago = contasPagar.filter((p) => p.status === "Pago").reduce((s, r) => s + r.valor, 0);
  const totalComissoes = comissoes.reduce((s, c) => s + c.valor, 0);
  const comissoesPagas = comissoes.filter((c) => c.status === "Paga").reduce((s, c) => s + c.valor, 0);
  const saldoTotal = contas.reduce((s, c) => s + c.saldoAtual, 0);

  const fin: Array<[string, number, string]> = [
    ["Saldo total das contas", saldoTotal, ""],
    ["Total a receber (em aberto)", totalReceber - totalRecebido, ""],
    ["Total recebido", totalRecebido, ""],
    ["Total a pagar (em aberto)", totalPagar - totalPago, ""],
    ["Total pago", totalPago, ""],
    ["Total comissões previstas", totalComissoes, ""],
    ["Total comissões pagas", comissoesPagas, ""],
  ];
  fin.forEach((r, i) => {
    const row = ws.addRow(r);
    row.getCell(2).numFmt = NUMFMT.money;
    if (i % 2 === 1) zebra(row, 3);
  });
}

// ---------------------------------------------------------------------------
// Estilização compartilhada
// ---------------------------------------------------------------------------
function styleHeader(row: ExcelJS.Row) {
  row.height = 22;
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: BRAND_FG }, size: 11 };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BRAND } };
    cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
    cell.border = {
      top: { style: "thin", color: { argb: BORDER } },
      bottom: { style: "thin", color: { argb: BORDER } },
      left: { style: "thin", color: { argb: BORDER } },
      right: { style: "thin", color: { argb: BORDER } },
    };
  });
}

function zebra(row: ExcelJS.Row, lastCol: number, color = ZEBRA) {
  for (let i = 1; i <= lastCol; i++) {
    row.getCell(i).fill = { type: "pattern", pattern: "solid", fgColor: { argb: color } };
  }
}

function applySheet(wb: ExcelJS.Workbook, spec: SheetSpec) {
  // Excel sheet name: ≤31 chars; chars proibidos: \ / ? * [ ]
  const safe = spec.name.replace(/[\\/?*[\]]/g, "-").slice(0, 31);
  const ws = wb.addWorksheet(safe, {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  ws.columns = spec.cols.map((c) => ({ header: c.header, key: c.key, width: c.width ?? 16 }));

  // Cabeçalho
  styleHeader(ws.getRow(1));

  // Linhas
  spec.rows.forEach((rowObj, idx) => {
    const row = ws.addRow(rowObj);
    spec.cols.forEach((col, ci) => {
      const cell = row.getCell(ci + 1);
      switch (col.type) {
        case "money": cell.numFmt = NUMFMT.money; break;
        case "percent": cell.numFmt = NUMFMT.percent; break;
        case "date": cell.numFmt = NUMFMT.date; break;
        case "datetime": cell.numFmt = NUMFMT.datetime; break;
        case "int": cell.numFmt = NUMFMT.int; break;
        case "number": cell.numFmt = NUMFMT.number; break;
        case "bool":
          cell.value = rowObj[col.key] ? "Sim" : "Não";
          cell.alignment = { horizontal: "center" };
          break;
        default: break;
      }
      cell.border = {
        top: { style: "hair", color: { argb: BORDER } },
        bottom: { style: "hair", color: { argb: BORDER } },
        left: { style: "hair", color: { argb: BORDER } },
        right: { style: "hair", color: { argb: BORDER } },
      };
    });
    if (idx % 2 === 1) zebra(row, spec.cols.length);
  });

  // AutoFilter na linha 1, todas as colunas
  ws.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: spec.cols.length },
  };

  // Linha de totais para abas com valor monetário
  const moneyCols = spec.cols
    .map((c, i) => ({ ...c, idx: i + 1 }))
    .filter((c) => c.type === "money");
  if (moneyCols.length > 0 && spec.rows.length > 0) {
    const totalRow = ws.addRow({});
    totalRow.getCell(1).value = "TOTAL";
    totalRow.getCell(1).font = { bold: true };
    moneyCols.forEach((c) => {
      const colLetter = ws.getColumn(c.idx).letter;
      const cell = totalRow.getCell(c.idx);
      cell.value = { formula: `SUBTOTAL(9,${colLetter}2:${colLetter}${spec.rows.length + 1})` };
      cell.numFmt = NUMFMT.money;
      cell.font = { bold: true };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: RESUMO_FILL } };
    });
    totalRow.eachCell((cell) => {
      cell.border = {
        top: { style: "medium", color: { argb: BRAND } },
        bottom: { style: "thin", color: { argb: BORDER } },
        left: { style: "hair", color: { argb: BORDER } },
        right: { style: "hair", color: { argb: BORDER } },
      };
    });
  }
}

// ---------------------------------------------------------------------------
// Função principal — gera e baixa o arquivo
// ---------------------------------------------------------------------------
export async function gerarBackupXLSX(): Promise<void> {
  const agora = new Date();
  const stamp =
    agora.toISOString().slice(0, 10).replace(/-/g, "") +
    "-" + String(agora.getHours()).padStart(2, "0") + String(agora.getMinutes()).padStart(2, "0");
  const nomeArquivo = `agilliza-backup-${stamp}.xlsx`;

  const wb = new ExcelJS.Workbook();
  wb.creator = "Agilliza";
  wb.created = agora;
  wb.lastModifiedBy = "Agilliza Backup Engine";

  addResumoSheet(wb, agora);
  for (const spec of buildSheets()) applySheet(wb, spec);

  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomeArquivo;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ---------------------------------------------------------------------------
// Metadados do backup (UI)
// ---------------------------------------------------------------------------
export interface BackupMetadata {
  geradoEm: string;
  nomeArquivo: string;
  modulos: { nome: string; registros: number }[];
  totais: {
    saldoContas: number;
    totalReceber: number;
    totalPagar: number;
    totalComissoes: number;
  };
}

export function getBackupMetadata(): BackupMetadata {
  const agora = new Date();
  const stamp =
    agora.toISOString().slice(0, 10).replace(/-/g, "") +
    "-" + String(agora.getHours()).padStart(2, "0") + String(agora.getMinutes()).padStart(2, "0");

  return {
    geradoEm: agora.toLocaleString("pt-BR"),
    nomeArquivo: `agilliza-backup-${stamp}.xlsx`,
    modulos: [
      { nome: "Clientes", registros: clientes.length },
      { nome: "Simulações", registros: simulacoes.length },
      { nome: "Propostas (Kanban)", registros: propostas.length },
      { nome: "Histórico de propostas", registros: propostas.reduce((s, p) => s + (p.historico?.length ?? 0), 0) },
      { nome: "Demandas / SLA", registros: demandas.length },
      { nome: "Tarefas", registros: tarefas.length },
      { nome: "Contas a receber", registros: contasReceber.length },
      { nome: "Contas a pagar", registros: contasPagar.length },
      { nome: "Comissões", registros: comissoes.length },
      { nome: "Recorrências", registros: recorrencias.length },
      { nome: "Conciliação bancária", registros: itensConciliacao.length },
      { nome: "Contas financeiras", registros: contas.length },
      { nome: "Usuários / Equipe", registros: usuarios.length },
      { nome: "Bancos parceiros", registros: bancos.length },
      { nome: "Categorias financeiras", registros: categorias.length },
    ],
    totais: {
      saldoContas: contas.reduce((s, c) => s + c.saldoAtual, 0),
      totalReceber: contasReceber.filter((r) => r.status !== "Recebido").reduce((s, r) => s + r.valor, 0),
      totalPagar: contasPagar.filter((p) => p.status !== "Pago").reduce((s, r) => s + r.valor, 0),
      totalComissoes: comissoes.reduce((s, c) => s + c.valor, 0),
    },
  };
}
