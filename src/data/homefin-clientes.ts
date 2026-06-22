/* ============================================================
 * Tipos e mock data espelhados no contrato da API HomeFin.
 * Nomes técnicos (camelCase) e domínios de enum idênticos aos
 * payloads de Participante / Oportunidade / Simulação / Proposta
 * / Documento / Follow-up. Substituir por chamadas reais à API
 * sem mudar a UI.
 * ============================================================ */

export type TipoSituacao = "A" | "I";
export type TipoQualificacao = "CO" | "VD";
export type TipoPessoa = "F" | "J";
export type TipoSexo = "M" | "F";
export type TipoEstadoCivil = "CA" | "S" | "VI" | "DI" | "SL" | "UE";
export type TipoRegimeCasamento = "CP" | "CU" | "PA" | "SC" | "SO";
export type TipoImovel = "AP" | "CS" | "GA" | "TE" | "TC";
export type UsoImovel = "R" | "C";
export type SistemaAmortizacao = "S" | "P";
export type SituacaoOportunidade = "A" | "T" | "C";
export type FlagSN = "S" | "N";
export type SituacaoDocumento = "pendente" | "enviado" | "aceito" | "rejeitado";

export interface Conjuge {
  nomeConjuge: string;
  cpfConjuge: string;
  dataNascimentoConjuge: string;
  rendaConjuge: number;
  tipoSexoConjuge: TipoSexo;
}

export interface Oportunidade {
  idOportunidade: string;
  codigoOportunidade: string;
  idOperacao: number;
  nomeOperacao: string;
  tipoImovel: TipoImovel;
  usoImovel: UsoImovel;
  uf: string;
  municipio: string;
  valorImovel: number;
  valorFinanciamento: number;
  prazo: number;
  utilizaFgtsSimulacao: FlagSN;
  sistemaAmortizacao: SistemaAmortizacao;
  idBancoEscolhido: number;
  nomeBancoEscolhido: string;
  tipoSituacao: SituacaoOportunidade;
  criadoEm: string;
}

export interface Simulacao {
  idSimulacao: string;
  valorFinanciamentoSimulacao: number;
  valorParcelaSimulacao: number;
  prazoPagamentoSimulacao: number;
  taxaJurosAnoBanco: number;
  sistemaAmortizacaoBanco: SistemaAmortizacao;
  indexadorBanco: string;
  enviadaEm: string;
  status: "rascunho" | "enviada" | "retornada";
}

export interface Proposta {
  idProposta: string;
  codigoPropostaBanco: string;
  nomeBanco: string;
  status: "incluida" | "em_analise" | "aprovada" | "reprovada" | "tratativa";
  criadaEm: string;
  retornoEm?: string;
}

export interface Documento {
  idDocumento: string;
  descricao: string;
  alvo: "cliente" | "imovel" | "conjuge" | "compositor";
  situacao: SituacaoDocumento;
  atualizadoEm: string;
}

export interface FollowUp {
  idFollowUp: string;
  data: string;
  autor: string;
  tipoContato: "telefone" | "whatsapp" | "email" | "presencial" | "sistema";
  texto: string;
}

export interface Cliente {
  // CreateParticipantRequest — núcleo
  idParticipante: string;
  tipoSituacao: TipoSituacao;
  tipoQualificacao: TipoQualificacao;
  tipoPessoa: TipoPessoa;
  nomeParticipante: string;
  cpfCnpj: string;
  dataNascimento: string;
  nomeMae?: string;
  tipoSexo?: TipoSexo;
  tipoEstadoCivil: TipoEstadoCivil;
  tipoRegimeCasamento?: TipoRegimeCasamento;
  fgAutorizacaoDados: boolean;
  compradorPrincipal: FlagSN;

  // Documento
  numeroDocumento: string;
  tipoDocumentoIdentidade: "RG" | "CNH";
  ufExpedicao: string;

  // Contato
  email: string;
  celular: string;

  // Endereço
  cep: string;
  logradouro: string;
  numeroLogradouro: string;
  bairro: string;
  municipio: string;
  uf: string;

  // Profissão / Renda
  nomeProfissao: string;
  nomeEmpresaProfissao: string;
  renda: number;
  utilizaFgts: FlagSN;

  // Bancário
  idBanco: number;
  nomeBanco: string;
  codigoAgencia: string;
  codigoContaCorrente: string;
  digitoContaCorrente: string;

  // Cônjuge
  conjuge?: Conjuge;

  // Vínculos do ecossistema
  idUsuarioParceiro: number;
  nomeCorretor: string;
  nomeImobiliaria?: string;
  nomeAnalista?: string;

  // Vínculos HomeFin
  oportunidades: Oportunidade[];
  simulacoes: Simulacao[];
  propostas: Proposta[];
  documentos: Documento[];
  followUps: FollowUp[];

  criadoEm: string;
  atualizadoEm: string;
  possuiPendencia: boolean;
}

/* ===================== Domínios (mock) ===================== */

export const DOM_OPERACOES: { idOperacao: number; nome: string }[] = [
  { idOperacao: 1, nome: "Financiamento Imobiliário" },
  { idOperacao: 2, nome: "Home Equity" },
  { idOperacao: 3, nome: "Portabilidade" },
];

export const DOM_BANCOS: { idBanco: number; codigoBanco: string; nome: string }[] = [
  { idBanco: 1, codigoBanco: "001", nome: "Banco A" },
  { idBanco: 2, codigoBanco: "104", nome: "Banco B" },
  { idBanco: 3, codigoBanco: "237", nome: "Banco C" },
  { idBanco: 4, codigoBanco: "341", nome: "Banco D" },
  { idBanco: 5, codigoBanco: "033", nome: "Banco E" },
];

export const DOM_TIPO_IMOVEL: Record<TipoImovel, string> = {
  AP: "Apartamento",
  CS: "Casa",
  GA: "Galpão",
  TE: "Terreno",
  TC: "Terreno + Construção",
};

export const DOM_USO_IMOVEL: Record<UsoImovel, string> = {
  R: "Residencial",
  C: "Comercial",
};

export const DOM_ESTADO_CIVIL: Record<TipoEstadoCivil, string> = {
  CA: "Casado(a)",
  S: "Solteiro(a)",
  VI: "Viúvo(a)",
  DI: "Divorciado(a)",
  SL: "Separado(a)",
  UE: "União Estável",
};

export const DOM_SITUACAO_OPORTUNIDADE: Record<SituacaoOportunidade, string> = {
  A: "Ativa",
  T: "Contrato emitido",
  C: "Cancelada",
};

export const DOM_UFS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB",
  "PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

/* ===================== Mock clientes ===================== */

const mk = (c: Partial<Cliente>): Cliente => ({
  idParticipante: crypto.randomUUID(),
  tipoSituacao: "A",
  tipoQualificacao: "CO",
  tipoPessoa: "F",
  nomeParticipante: "",
  cpfCnpj: "",
  dataNascimento: "1985-01-01",
  tipoSexo: "M",
  tipoEstadoCivil: "S",
  fgAutorizacaoDados: true,
  compradorPrincipal: "S",
  numeroDocumento: "00.000.000-0",
  tipoDocumentoIdentidade: "RG",
  ufExpedicao: "SP",
  email: "",
  celular: "",
  cep: "01310100",
  logradouro: "Av. Paulista",
  numeroLogradouro: "1000",
  bairro: "Bela Vista",
  municipio: "São Paulo",
  uf: "SP",
  nomeProfissao: "Analista",
  nomeEmpresaProfissao: "—",
  renda: 0,
  utilizaFgts: "N",
  idBanco: 1,
  nomeBanco: "Banco A",
  codigoAgencia: "0001",
  codigoContaCorrente: "12345",
  digitoContaCorrente: "6",
  idUsuarioParceiro: 1,
  nomeCorretor: "Mariana Pires",
  oportunidades: [],
  simulacoes: [],
  propostas: [],
  documentos: [],
  followUps: [],
  criadoEm: "2025-05-12",
  atualizadoEm: "2025-06-18",
  possuiPendencia: false,
  ...c,
});

export const CLIENTES_MOCK: Cliente[] = [
  mk({
    nomeParticipante: "Fernanda Albuquerque",
    cpfCnpj: "12345678901",
    dataNascimento: "1988-03-14",
    tipoSexo: "F",
    tipoEstadoCivil: "CA",
    tipoRegimeCasamento: "CP",
    email: "fernanda.alb@email.com",
    celular: "11912345678",
    renda: 18500,
    utilizaFgts: "S",
    nomeProfissao: "Arquiteta",
    nomeEmpresaProfissao: "Albuquerque Arquitetura ME",
    nomeCorretor: "Eduardo Lima",
    nomeImobiliaria: "Premier Imóveis",
    nomeAnalista: "Camila Souza",
    conjuge: {
      nomeConjuge: "Rafael Albuquerque",
      cpfConjuge: "10987654321",
      dataNascimentoConjuge: "1985-09-02",
      rendaConjuge: 12000,
      tipoSexoConjuge: "M",
    },
    oportunidades: [
      {
        idOportunidade: "OP-2024-08731",
        codigoOportunidade: "08731",
        idOperacao: 1,
        nomeOperacao: "Financiamento Imobiliário",
        tipoImovel: "AP",
        usoImovel: "R",
        uf: "SP",
        municipio: "São Paulo",
        valorImovel: 780000,
        valorFinanciamento: 480000,
        prazo: 360,
        utilizaFgtsSimulacao: "S",
        sistemaAmortizacao: "S",
        idBancoEscolhido: 1,
        nomeBancoEscolhido: "Banco A",
        tipoSituacao: "A",
        criadoEm: "2025-05-13",
      },
    ],
    simulacoes: [
      {
        idSimulacao: "SIM-001",
        valorFinanciamentoSimulacao: 480000,
        valorParcelaSimulacao: 3842.17,
        prazoPagamentoSimulacao: 360,
        taxaJurosAnoBanco: 10.49,
        sistemaAmortizacaoBanco: "S",
        indexadorBanco: "TR",
        enviadaEm: "2025-05-13",
        status: "retornada",
      },
    ],
    propostas: [
      {
        idProposta: "PR-9921",
        codigoPropostaBanco: "BA-44128",
        nomeBanco: "Banco A",
        status: "em_analise",
        criadaEm: "2025-05-20",
      },
    ],
    documentos: [
      { idDocumento: "D1", descricao: "RG e CPF", alvo: "cliente", situacao: "aceito", atualizadoEm: "2025-05-14" },
      { idDocumento: "D2", descricao: "Comprovante de residência", alvo: "cliente", situacao: "enviado", atualizadoEm: "2025-05-16" },
      { idDocumento: "D3", descricao: "Declaração de IR", alvo: "cliente", situacao: "rejeitado", atualizadoEm: "2025-05-18" },
      { idDocumento: "D4", descricao: "Matrícula do imóvel", alvo: "imovel", situacao: "pendente", atualizadoEm: "2025-05-12" },
    ],
    followUps: [
      { idFollowUp: "F1", data: "2025-06-18", autor: "Eduardo Lima", tipoContato: "whatsapp", texto: "Cliente confirmou reenvio do IR completo." },
      { idFollowUp: "F2", data: "2025-06-16", autor: "Sistema", tipoContato: "sistema", texto: "Proposta encaminhada para análise bancária." },
    ],
    possuiPendencia: true,
    criadoEm: "2025-05-12",
    atualizadoEm: "2025-06-18",
  }),
  mk({
    nomeParticipante: "Roberto Tavares",
    cpfCnpj: "98765432100",
    dataNascimento: "1979-11-22",
    tipoSexo: "M",
    tipoEstadoCivil: "DI",
    email: "roberto.t@email.com",
    celular: "21998877665",
    renda: 32000,
    utilizaFgts: "N",
    uf: "RJ",
    municipio: "Rio de Janeiro",
    nomeProfissao: "Empresário",
    nomeEmpresaProfissao: "RT Investimentos",
    nomeCorretor: "Mariana Pires",
    nomeImobiliaria: "Atlântica Imóveis",
    oportunidades: [
      {
        idOportunidade: "OP-2024-08812",
        codigoOportunidade: "08812",
        idOperacao: 2,
        nomeOperacao: "Home Equity",
        tipoImovel: "CS",
        usoImovel: "R",
        uf: "RJ",
        municipio: "Rio de Janeiro",
        valorImovel: 1850000,
        valorFinanciamento: 900000,
        prazo: 240,
        utilizaFgtsSimulacao: "N",
        sistemaAmortizacao: "P",
        idBancoEscolhido: 2,
        nomeBancoEscolhido: "Banco B",
        tipoSituacao: "A",
        criadoEm: "2025-06-01",
      },
    ],
    simulacoes: [],
    propostas: [],
    documentos: [
      { idDocumento: "D5", descricao: "Contracheque", alvo: "cliente", situacao: "pendente", atualizadoEm: "2025-06-02" },
    ],
    followUps: [
      { idFollowUp: "F3", data: "2025-06-21", autor: "Mariana Pires", tipoContato: "telefone", texto: "Aguardando envio do contracheque para abrir simulação." },
    ],
    possuiPendencia: true,
  }),
  mk({
    nomeParticipante: "Aline Castro",
    cpfCnpj: "45612378900",
    dataNascimento: "1992-07-08",
    tipoSexo: "F",
    tipoEstadoCivil: "UE",
    tipoRegimeCasamento: "PA",
    email: "aline.castro@email.com",
    celular: "11987654321",
    renda: 9800,
    utilizaFgts: "S",
    uf: "SP",
    municipio: "Campinas",
    nomeProfissao: "Designer",
    nomeEmpresaProfissao: "Freelance",
    nomeCorretor: "Eduardo Lima",
    oportunidades: [
      {
        idOportunidade: "OP-2024-08120",
        codigoOportunidade: "08120",
        idOperacao: 1,
        nomeOperacao: "Financiamento Imobiliário",
        tipoImovel: "AP",
        usoImovel: "R",
        uf: "SP",
        municipio: "Campinas",
        valorImovel: 420000,
        valorFinanciamento: 280000,
        prazo: 300,
        utilizaFgtsSimulacao: "S",
        sistemaAmortizacao: "S",
        idBancoEscolhido: 3,
        nomeBancoEscolhido: "Banco C",
        tipoSituacao: "T",
        criadoEm: "2025-04-09",
      },
    ],
    simulacoes: [
      {
        idSimulacao: "SIM-014",
        valorFinanciamentoSimulacao: 280000,
        valorParcelaSimulacao: 2410.55,
        prazoPagamentoSimulacao: 300,
        taxaJurosAnoBanco: 9.99,
        sistemaAmortizacaoBanco: "S",
        indexadorBanco: "TR",
        enviadaEm: "2025-04-12",
        status: "retornada",
      },
    ],
    propostas: [
      { idProposta: "PR-9810", codigoPropostaBanco: "BC-22910", nomeBanco: "Banco C", status: "aprovada", criadaEm: "2025-04-20", retornoEm: "2025-05-03" },
    ],
    documentos: [
      { idDocumento: "D6", descricao: "RG e CPF", alvo: "cliente", situacao: "aceito", atualizadoEm: "2025-04-15" },
      { idDocumento: "D7", descricao: "Matrícula do imóvel", alvo: "imovel", situacao: "aceito", atualizadoEm: "2025-04-22" },
    ],
    followUps: [
      { idFollowUp: "F4", data: "2025-05-03", autor: "Banco C", tipoContato: "sistema", texto: "Proposta aprovada — contrato emitido." },
    ],
    possuiPendencia: false,
  }),
  mk({
    nomeParticipante: "Marcos Vinícius Souto",
    cpfCnpj: "32165498700",
    dataNascimento: "1983-02-19",
    tipoSexo: "M",
    tipoEstadoCivil: "S",
    email: "marcos.souto@email.com",
    celular: "31999887766",
    renda: 14500,
    utilizaFgts: "N",
    uf: "MG",
    municipio: "Belo Horizonte",
    nomeProfissao: "Engenheiro",
    nomeEmpresaProfissao: "MVS Engenharia",
    nomeCorretor: "Camila Souza",
    oportunidades: [
      {
        idOportunidade: "OP-2024-08600",
        codigoOportunidade: "08600",
        idOperacao: 2,
        nomeOperacao: "Home Equity",
        tipoImovel: "CS",
        usoImovel: "R",
        uf: "MG",
        municipio: "Belo Horizonte",
        valorImovel: 950000,
        valorFinanciamento: 380000,
        prazo: 180,
        utilizaFgtsSimulacao: "N",
        sistemaAmortizacao: "P",
        idBancoEscolhido: 4,
        nomeBancoEscolhido: "Banco D",
        tipoSituacao: "A",
        criadoEm: "2025-06-05",
      },
    ],
    simulacoes: [
      {
        idSimulacao: "SIM-022",
        valorFinanciamentoSimulacao: 380000,
        valorParcelaSimulacao: 5120.4,
        prazoPagamentoSimulacao: 180,
        taxaJurosAnoBanco: 13.5,
        sistemaAmortizacaoBanco: "P",
        indexadorBanco: "IPCA",
        enviadaEm: "2025-06-07",
        status: "retornada",
      },
    ],
    propostas: [
      { idProposta: "PR-9890", codigoPropostaBanco: "BD-7711", nomeBanco: "Banco D", status: "tratativa", criadaEm: "2025-06-10" },
    ],
    documentos: [
      { idDocumento: "D8", descricao: "Avaliação do imóvel", alvo: "imovel", situacao: "enviado", atualizadoEm: "2025-06-12" },
    ],
    followUps: [
      { idFollowUp: "F5", data: "2025-06-20", autor: "Camila Souza", tipoContato: "email", texto: "Banco solicitou laudo técnico complementar." },
    ],
    possuiPendencia: true,
  }),
  mk({
    nomeParticipante: "Bianca Moraes",
    cpfCnpj: "11122233344",
    dataNascimento: "1990-12-30",
    tipoSexo: "F",
    tipoEstadoCivil: "S",
    email: "bianca.m@email.com",
    celular: "41988776655",
    renda: 7200,
    utilizaFgts: "S",
    uf: "PR",
    municipio: "Curitiba",
    nomeProfissao: "Professora",
    nomeEmpresaProfissao: "Rede Municipal",
    nomeCorretor: "Patrícia Reis",
    oportunidades: [
      {
        idOportunidade: "OP-2024-07999",
        codigoOportunidade: "07999",
        idOperacao: 1,
        nomeOperacao: "Financiamento Imobiliário",
        tipoImovel: "AP",
        usoImovel: "R",
        uf: "PR",
        municipio: "Curitiba",
        valorImovel: 310000,
        valorFinanciamento: 230000,
        prazo: 360,
        utilizaFgtsSimulacao: "S",
        sistemaAmortizacao: "S",
        idBancoEscolhido: 5,
        nomeBancoEscolhido: "Banco E",
        tipoSituacao: "C",
        criadoEm: "2025-03-18",
      },
    ],
    simulacoes: [],
    propostas: [
      { idProposta: "PR-9710", codigoPropostaBanco: "BE-1010", nomeBanco: "Banco E", status: "reprovada", criadaEm: "2025-04-01", retornoEm: "2025-04-08" },
    ],
    documentos: [],
    followUps: [
      { idFollowUp: "F6", data: "2025-04-08", autor: "Banco E", tipoContato: "sistema", texto: "Proposta reprovada — comprometimento de renda acima do limite." },
    ],
    possuiPendencia: false,
    tipoSituacao: "I",
  }),
  mk({
    nomeParticipante: "Construtora Horizonte LTDA",
    cpfCnpj: "12345678000190",
    tipoPessoa: "J",
    tipoEstadoCivil: "S",
    dataNascimento: "2012-04-10",
    email: "contato@horizonte.com.br",
    celular: "1133224455",
    renda: 0,
    uf: "SP",
    municipio: "São Paulo",
    nomeProfissao: "—",
    nomeEmpresaProfissao: "Construtora Horizonte",
    tipoQualificacao: "VD",
    compradorPrincipal: "N",
    nomeCorretor: "Mariana Pires",
    oportunidades: [],
    simulacoes: [],
    propostas: [],
    documentos: [
      { idDocumento: "D9", descricao: "Contrato social", alvo: "cliente", situacao: "aceito", atualizadoEm: "2025-05-30" },
    ],
    followUps: [],
    possuiPendencia: false,
  }),
];

/* ===================== Helpers ===================== */

export const fmtBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });

export const fmtDate = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return d && m && y ? `${d}/${m}/${y}` : iso;
};

export const fmtCpfCnpj = (v: string) => {
  const s = v.replace(/\D/g, "");
  if (s.length === 11) return `${s.slice(0,3)}.${s.slice(3,6)}.${s.slice(6,9)}-${s.slice(9)}`;
  if (s.length === 14) return `${s.slice(0,2)}.${s.slice(2,5)}.${s.slice(5,8)}/${s.slice(8,12)}-${s.slice(12)}`;
  return v;
};

export const maskCpfCnpj = (v: string) => {
  const f = fmtCpfCnpj(v);
  const s = v.replace(/\D/g, "");
  if (s.length === 11) return `***.${f.slice(4, 7)}.${f.slice(8, 11)}-**`;
  if (s.length === 14) return `**.***.${f.slice(7, 10)}/${f.slice(11, 15)}-**`;
  return v;
};

export const fmtPhone = (v: string) => {
  const s = v.replace(/\D/g, "");
  if (s.length === 11) return `(${s.slice(0,2)}) ${s.slice(2,7)}-${s.slice(7)}`;
  if (s.length === 10) return `(${s.slice(0,2)}) ${s.slice(2,6)}-${s.slice(6)}`;
  return v;
};
