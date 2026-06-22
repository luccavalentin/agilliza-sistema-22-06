// Tipos alinhados à API oficial HomeFin (base: https://api.homefin.com.br/external).
// Fonte: APIs/2 - Documentacao API Homefin.pdf + Postman collection.

export type Json = string | number | boolean | null | { [k: string]: Json } | Json[];
export type JsonObject = { [k: string]: Json };

export type HomefinTipoImovel = "AP" | "CS" | "GA" | "TE" | "TC";
export type HomefinUsoImovel = "R" | "C";
export type HomefinSituacaoImovel = "N" | "U";
export type HomefinTipoOperacao = "1" | "2"; // 1=FI, 2=HE (ver /dominios/operacoes)
export type HomefinSistemaAmortizacao = "S" | "P"; // S=SAC, P=PRICE
export type HomefinFlagSimulacao = "S" | "N";
export type HomefinSimNao = "S" | "N";
export type HomefinTipoPessoa = "F" | "J";
export type HomefinTipoEstadoCivil = "S" | "CA" | "UE" | "DI" | "VI" | "SL";
export type HomefinTipoQualificacao = "CO" | "CV" | "CC"; // Comprador, Convivente, Co-comprador
export type HomefinTipoSexo = "M" | "F";
export type HomefinTipoFollowUp = "I" | "E" | "B"; // Interno / Externo / Banco

// ---- Autenticação ----
export interface HomefinAuthRequest {
  secretId: string;
  secretKey: string;
}
export interface HomefinAuthResponse {
  token: string;
  expiresIn?: number;
  type?: string;
}

// ---- Domínios ----
export interface HomefinBanco {
  idBanco: number;
  codigoBanco: number;
  nomeBanco: string;
}
export interface HomefinOperacao {
  idOperacao: string;
  nomeOperacao: string;
}

// ---- Oportunidade ----
export interface HomefinBancoSimulacao {
  idBanco: number;
  codigoBanco?: number;
  nomeBanco?: string;
  flagSimulacao: HomefinFlagSimulacao;
}

export interface HomefinCriarOportunidadeRequest {
  operacao: { idOperacao: HomefinTipoOperacao };
  regional: { idRegional: string };
  parceiro: { idParceiro: string };
  usuarioParceiro: { idUsuarioParceiro: string };
  tipoImovel: { id: HomefinTipoImovel };
  usoImovel: { id: HomefinUsoImovel };
  uf: { codigo: string };
  valorImovel: number;
  valorFinanciamento: number;
  prazo: number;
  utilizaFgtsSimulacao: HomefinSimNao;
  bancos: HomefinBancoSimulacao[];
  cpfCnpj: string;
  nome: string;
  rendaTotal: number;
  codigoSistemaAmortizacaoBanco: { id: HomefinSistemaAmortizacao };
  dataNascimento: string; // yyyy-MM-dd
  email: string;
  celular: string;
  fgCompoeRenda: boolean;
  situacaoImovel: { codigo: HomefinSituacaoImovel };
  fgFinanciarDespesas: HomefinSimNao;
  tipoEstadoCivil: { id: HomefinTipoEstadoCivil };
}

export interface HomefinOportunidadeResponse {
  idOportunidade: number;
  status?: string;
  // demais campos espelham o request + IDs gerados
  [k: string]: Json | undefined;
}

export interface HomefinAtualizarOportunidadeRequest {
  valorImovel?: number;
  valorFinanciamento?: number;
  prazo?: number;
}

// ---- Simulação ----
export interface HomefinCriarSimulacaoRequest {
  valorImovel: number;
  valorFinanciamento: number;
  prazo: number;
  codigoSistemaAmortizacaoBanco: { id: HomefinSistemaAmortizacao };
  codigoOportunidadeBanco?: string | null;
  valorParcelaBanco?: number | null;
  taxaJurosAnoBanco?: number | null;
  codigoIndexadorBanco?: string | null;
  valorIofBanco?: number | null;
  valorFinanciamentoBancoMax?: number | null;
  valorParcelaBancoMax?: number | null;
  prazoPagamentoBancoMax?: number | null;
  banco: { idBanco: number };
  fgAutorizacaoDados: boolean;
}

export interface HomefinSimulacaoResponse {
  idSimulacao: number;
  valorParcelaInicial?: number;
  valorParcelaFinal?: number;
  taxaJurosAno?: number;
  cet?: number;
  rendaMinima?: number;
  status?: string;
  [k: string]: unknown;
}

// ---- Participante ----
export interface HomefinParticipanteRequest {
  tipoSituacao: "A" | "I";
  nomeParticipante: string;
  tipoQualificacao: HomefinTipoQualificacao;
  tipoPessoa: HomefinTipoPessoa;
  cpfCnpj: string;
  dataNascimento: string;
  nomeMae?: string;
  tipoSexo?: HomefinTipoSexo;
  tipoEstadoCivil: HomefinTipoEstadoCivil;
  tipoRegimeCasamento?: "CP" | "CU" | "PA" | "SC" | "SO";
  tipoDocumentoIdentidade?: "RG" | "CNH";
  numeroDocumento?: string;
  dataExpedicao?: string;
  orgaoExpedidor?: string;
  ufExpedicao?: string;
  nomeProfissao?: string;
  nomeEmpresaProfissao?: string;
  renda?: number;
  email?: string;
  celular?: string;
  cep?: string;
  logradouro?: string;
  numeroLogradouro?: string;
  complementoLogradouro?: string;
  bairro?: string;
  municipio?: string;
  uf?: string;
  utilizaFgts?: HomefinSimNao;
  fgAutorizacaoDados: boolean;
}

// ---- Integração / Proposta ao banco ----
export interface HomefinIncluirPropostaRequest {
  idSimulacao: number;
}

// ---- Follow-up ----
export interface HomefinFollowUpRequest {
  idOportunidade: number;
  tipoFup: HomefinTipoFollowUp;
  titulo: string;
  comentario: string;
}

// ---- Webhook (retornos do banco para a HomeFin → para o nosso sistema) ----
/**
 * Evento de webhook recebido da HomeFin sinalizando mudança de status
 * em uma simulação/proposta/oportunidade.
 */
export interface HomefinWebhookEvent {
  evento: string;                // ex: "SIMULACAO_APROVADA", "PROPOSTA_RECUSADA", "CONTRATO_EMITIDO"
  idOportunidade?: number;
  idSimulacao?: number;
  idIntegracao?: number;
  banco?: HomefinBanco;
  status?: string;
  motivo?: string;
  payload?: Record<string, unknown>;
  ocorridoEm?: string;           // ISO timestamp
}
