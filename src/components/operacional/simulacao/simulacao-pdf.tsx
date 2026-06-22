// Documento PDF da simulação no modelo Agilliza.

import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer";
import { formatBRL } from "@/lib/operacional/formatters";
import type { BancoResultado } from "./types";

export type DadosCliente = { nome: string; telefone: string; email: string; dataNasc: string };
export type DadosOperacao = {
  valorImovel: number; entrada: number; financiamento: number; prazo: number; sistema: string;
};

const styles = StyleSheet.create({
  page: { padding: 28, fontSize: 9, color: "#1E293B", fontFamily: "Helvetica" },
  header: { backgroundColor: "#003F5C", color: "#FFFFFF", padding: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  brand: { fontSize: 14, fontWeight: 700, color: "#FFFFFF" },
  title: { fontSize: 12, color: "#FFFFFF", fontWeight: 700 },
  intro: { color: "#F97316", fontSize: 9, marginBottom: 10, fontStyle: "italic" },
  box: { border: "1pt solid #E2E8F0", borderRadius: 4, padding: 8, marginBottom: 10 },
  row: { flexDirection: "row", flexWrap: "wrap" },
  cell: { width: "25%", marginBottom: 4 },
  label: { color: "#64748B", fontSize: 7, textTransform: "uppercase" },
  value: { color: "#1E293B", fontSize: 9, fontWeight: 700 },
  bankHeader: { backgroundColor: "#003F5C", color: "#FFFFFF", padding: 6, marginTop: 10, fontWeight: 700 },
  tableHeader: { flexDirection: "row", backgroundColor: "#F1F5F9", padding: 4, fontWeight: 700, fontSize: 8 },
  tableRow: { flexDirection: "row", padding: 4, borderBottom: "0.5pt solid #E2E8F0", fontSize: 8 },
  col: { flex: 1, textAlign: "right" },
  colLeft: { flex: 1.5, textAlign: "left" },
  footer: { position: "absolute", bottom: 20, left: 28, right: 28, fontSize: 7, color: "#64748B", borderTop: "1pt solid #E2E8F0", paddingTop: 6 },
});

export function SimulacaoPdf({
  cliente, dados, resultados, responsavel,
}: {
  cliente: DadosCliente;
  dados: DadosOperacao;
  resultados: BancoResultado[];
  responsavel: string;
}) {
  const data = new Date().toLocaleDateString("pt-BR");
  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header} fixed>
          <Text style={styles.brand}>Agilliza</Text>
          <Text style={styles.title}>Simulação Financiamento Imobiliário</Text>
        </View>

        <Text style={styles.intro}>
          Trabalhamos com os maiores bancos do mercado para encontrar a melhor condição para você.
        </Text>

        <View style={styles.box}>
          <View style={styles.row}>
            <Cell label="Nome" value={cliente.nome} />
            <Cell label="Telefone" value={cliente.telefone} />
            <Cell label="E-mail" value={cliente.email} />
            <Cell label="Data Nasc." value={cliente.dataNasc} />
            <Cell label="Valor Imóvel" value={formatBRL(dados.valorImovel)} />
            <Cell label="Entrada" value={formatBRL(dados.entrada)} />
            <Cell label="Financiamento" value={formatBRL(dados.financiamento)} />
            <Cell label="Prazo / Tabela" value={`${dados.prazo}m · ${dados.sistema}`} />
          </View>
        </View>

        {resultados.map((banco) => (
          <View key={banco.idBanco} wrap={false}>
            <Text style={styles.bankHeader}>{banco.nomeBanco}</Text>
            <View style={styles.tableHeader}>
              <Text style={styles.colLeft}>Segmento</Text>
              <Text style={styles.col}>1ª Parc.</Text>
              <Text style={styles.col}>Última</Text>
              <Text style={styles.col}>Taxa %</Text>
              <Text style={styles.col}>Renda</Text>
              <Text style={styles.col}>LTV</Text>
              <Text style={styles.col}>Total</Text>
            </View>
            {banco.segmentos.map((s) => (
              <View style={styles.tableRow} key={s.segmento}>
                <Text style={styles.colLeft}>{s.segmento}</Text>
                <Text style={styles.col}>{formatBRL(s.primeiraParcela)}</Text>
                <Text style={styles.col}>{formatBRL(s.ultimaParcela)}</Text>
                <Text style={styles.col}>{s.taxaEfetiva.toFixed(2)}%</Text>
                <Text style={styles.col}>{formatBRL(s.rendaEstimada)}</Text>
                <Text style={styles.col}>{s.ltv.toFixed(1)}%</Text>
                <Text style={styles.col}>{formatBRL(s.total)}</Text>
              </View>
            ))}
          </View>
        ))}

        <View style={styles.footer} fixed>
          <Text>
            Simulação meramente informativa, sujeita à análise de crédito e aprovação do banco. Valores podem variar conforme política vigente.
          </Text>
          <Text render={({ pageNumber, totalPages }) =>
            `Data da Simulação: ${data}  |  Responsável: ${responsavel}  |  Página ${pageNumber} de ${totalPages}`
          } />
        </View>
      </Page>
    </Document>
  );
}

function Cell({ label, value }: { label: string; value?: string }) {
  return (
    <View style={styles.cell}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || "—"}</Text>
    </View>
  );
}

// Helper de download — encapsula a geração + trigger.
export async function downloadSimulacaoPdf(params: {
  cliente: DadosCliente; dados: DadosOperacao; resultados: BancoResultado[]; responsavel: string;
}) {
  const blob = await pdf(<SimulacaoPdf {...params} />).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `simulacao-${(params.cliente.nome || "cliente").replace(/\s+/g, "_")}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
