// Tipos compartilhados do módulo de Simulação Completa.

export type ClienteRow = {
  id: string;
  nome: string;
  cpf_cnpj: string;
  data_nasc?: string | null;
  renda?: number | null;
  email?: string | null;
  celular?: string | null;
};

export type SegmentoResultado = {
  segmento: string;
  primeiraParcela: number;
  ultimaParcela: number;
  taxaEfetiva: number;
  rendaEstimada: number;
  ltv: number;
  total: number;
};

export type BancoResultado = {
  idBanco: string;
  nomeBanco: string;
  logoSlug?: string;
  brandColor?: string;
  segmentos: SegmentoResultado[];
};

export type SimulacaoForm = {
  tipoImovel: string;
  usoImovel: string;
  situacaoImovel: string;
  uf: string;
  valorImovel: number;
  valorFinanciamento: number;
  prazo: number;
  utilizaFgts: boolean;
  bancosSelecionados: string[];
  cpfCnpj: string;
  nome: string;
  renda: number;
  dataNascimento: string;
  email: string;
  celular: string;
  sistemaAmortizacao: string;
  fgFinanciarDespesas: boolean;
  estadoCivil: string;
};

export const FORM_INICIAL: SimulacaoForm = {
  tipoImovel: "1",
  usoImovel: "1",
  situacaoImovel: "N",
  uf: "SP",
  valorImovel: 500_000,
  valorFinanciamento: 350_000,
  prazo: 360,
  utilizaFgts: false,
  bancosSelecionados: ["b-itau", "b-cef", "b-santander"],
  cpfCnpj: "",
  nome: "",
  renda: 12_000,
  dataNascimento: "",
  email: "",
  celular: "",
  sistemaAmortizacao: "SAC",
  fgFinanciarDespesas: false,
  estadoCivil: "1",
};
