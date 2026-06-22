// Mapeamento entre tipos internos do Agilliza e códigos da API HomeFin.
// Substitui o antigo homefin-mappers.ts (que estava desalinhado com a API real).

import type {
  HomefinTipoImovel, HomefinUsoImovel, HomefinSituacaoImovel,
  HomefinTipoEstadoCivil, HomefinSistemaAmortizacao, HomefinTipoOperacao,
} from "./types";

// ============ Produto / Operação ============
export const mapProduto = (produto: string): HomefinTipoOperacao =>
  produto === "Home Equity" ? "2" : "1";

// ============ Sistema de amortização ============
export const mapSistemaAmortizacao = (s: string): HomefinSistemaAmortizacao =>
  s.toUpperCase() === "PRICE" ? "P" : "S";

// ============ Tipo de imóvel ============
export const TIPOS_IMOVEL: { value: HomefinTipoImovel; label: string }[] = [
  { value: "AP", label: "Apartamento" },
  { value: "CS", label: "Casa" },
  { value: "GA", label: "Galpão / Industrial" },
  { value: "TE", label: "Terreno" },
  { value: "TC", label: "Terreno em Condomínio" },
];

// ============ Uso ============
export const USOS_IMOVEL: { value: HomefinUsoImovel; label: string }[] = [
  { value: "R", label: "Residencial" },
  { value: "C", label: "Comercial" },
];

// ============ Situação ============
export const SITUACOES_IMOVEL: { value: HomefinSituacaoImovel; label: string }[] = [
  { value: "N", label: "Novo" },
  { value: "U", label: "Usado" },
];

// ============ Estado civil ============
export const ESTADOS_CIVIS: { value: HomefinTipoEstadoCivil; label: string }[] = [
  { value: "S",  label: "Solteiro(a)" },
  { value: "CA", label: "Casado(a)" },
  { value: "UE", label: "União estável" },
  { value: "DI", label: "Divorciado(a)" },
  { value: "VI", label: "Viúvo(a)" },
  { value: "SL", label: "Separado(a) legalmente" },
];

// ============ Bancos: mapeamento Agilliza → HomeFin ============
// Os IDs HomeFin foram retirados do exemplo oficial da coleção Postman.
// Outros bancos serão obtidos dinamicamente via GET /dominios/bancos.
export const BANCOS_HOMEFIN_FIXOS: Record<string, { idBanco: number; codigoBanco: number; nomeBanco: string }> = {
  "b-bradesco":  { idBanco: 45, codigoBanco: 237, nomeBanco: "Banco Bradesco" },
  "b-itau":      { idBanco: 61, codigoBanco: 341, nomeBanco: "Banco Itaú" },
  "b-santander": { idBanco: 9,  codigoBanco: 33,  nomeBanco: "Banco Santander" },
  // CEF, BB e Inter serão preenchidos quando o endpoint /dominios/bancos for chamado.
};

export function mapBancosToHomefin(bancoIds: string[], selectedSet: Set<string>) {
  return bancoIds
    .map((id) => {
      const b = BANCOS_HOMEFIN_FIXOS[id];
      if (!b) return null;
      return { ...b, flagSimulacao: (selectedSet.has(id) ? "S" : "N") as "S" | "N" };
    })
    .filter(Boolean) as Array<{ idBanco: number; codigoBanco: number; nomeBanco: string; flagSimulacao: "S" | "N" }>;
}

// ============ Datas ============
/** Converte ISO/Date para yyyy-MM-dd exigido pela HomeFin */
export const toHomefinDate = (d: string | Date): string => {
  const date = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

// ============ CPF/CNPJ ============
export const onlyDigits = (s: string) => s.replace(/\D+/g, "");
