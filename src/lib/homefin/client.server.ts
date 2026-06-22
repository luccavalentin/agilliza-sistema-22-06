// Cliente HTTP server-side para a API HomeFin.
// Faz autenticação JWT (POST /auth/token) com cache em memória do token,
// e expõe helpers tipados para cada endpoint da coleção oficial.
//
// IMPORTANTE: este arquivo só pode ser importado dentro de handlers de
// server functions ou server routes (process.env, fetch server-side).

import type {
  HomefinAuthResponse, HomefinBanco, HomefinOperacao,
  HomefinCriarOportunidadeRequest, HomefinOportunidadeResponse,
  HomefinAtualizarOportunidadeRequest,
  HomefinCriarSimulacaoRequest, HomefinSimulacaoResponse,
  HomefinParticipanteRequest, HomefinIncluirPropostaRequest,
  HomefinFollowUpRequest,
} from "./types";

const DEFAULT_BASE = "https://api.homefin.com.br/external";

// ────────────────────────── cache de token em memória (cold-start safe) ──────────────────────────
type TokenCache = { token: string; expiresAt: number };
let cachedToken: TokenCache | null = null;
const SAFETY_WINDOW_MS = 60_000; // renova 1min antes de expirar

function getEnv() {
  const baseUrl = process.env.HOMEFIN_BASE_URL?.trim() || DEFAULT_BASE;
  const secretId = process.env.HOMEFIN_SECRET_ID;
  const secretKey = process.env.HOMEFIN_SECRET_KEY;
  if (!secretId || !secretKey) {
    throw new HomefinError(
      "HOMEFIN_SECRET_ID e HOMEFIN_SECRET_KEY não configurados. Adicione-os via Lovable Cloud → Secrets.",
      { status: 0, code: "MISSING_CREDENTIALS" },
    );
  }
  return { baseUrl, secretId, secretKey };
}

export class HomefinError extends Error {
  status: number;
  code?: string;
  body?: unknown;
  constructor(message: string, opts: { status: number; code?: string; body?: unknown }) {
    super(message);
    this.name = "HomefinError";
    this.status = opts.status;
    this.code = opts.code;
    this.body = opts.body;
  }
}

async function authenticate(): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt - SAFETY_WINDOW_MS > now) {
    return cachedToken.token;
  }
  const { baseUrl, secretId, secretKey } = getEnv();
  const res = await fetch(`${baseUrl}/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ secretId, secretKey }),
  });
  const text = await res.text();
  let json: HomefinAuthResponse | undefined;
  try { json = text ? JSON.parse(text) as HomefinAuthResponse : undefined; } catch { /* noop */ }
  if (!res.ok || !json?.token) {
    throw new HomefinError("Falha na autenticação HomeFin", {
      status: res.status, code: "AUTH_FAILED", body: text,
    });
  }
  const ttlMs = (json.expiresIn ?? 30 * 60) * 1000;
  cachedToken = { token: json.token, expiresAt: now + ttlMs };
  return json.token;
}

export function invalidateToken() {
  cachedToken = null;
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  init?: RequestInit,
): Promise<T> {
  const { baseUrl } = getEnv();
  const token = await authenticate();
  const url = `${baseUrl}${path}`;
  const headers: Record<string, string> = {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
    ...(init?.headers as Record<string, string> | undefined),
  };
  let payload: BodyInit | undefined;
  if (body !== undefined) {
    if (body instanceof FormData) {
      payload = body;
    } else {
      headers["Content-Type"] = "application/json";
      payload = JSON.stringify(body);
    }
  }
  let res = await fetch(url, { method, headers, body: payload });
  // Retry uma vez se o token expirou no servidor (401)
  if (res.status === 401) {
    invalidateToken();
    const retryToken = await authenticate();
    headers.Authorization = `Bearer ${retryToken}`;
    res = await fetch(url, { method, headers, body: payload });
  }
  const text = await res.text();
  let parsed: unknown = undefined;
  if (text) {
    try { parsed = JSON.parse(text); } catch { parsed = text; }
  }
  if (!res.ok) {
    throw new HomefinError(`HomeFin ${method} ${path} falhou (${res.status})`, {
      status: res.status,
      code: `HTTP_${res.status}`,
      body: parsed,
    });
  }
  return parsed as T;
}

// ────────────────────────── ENDPOINTS ──────────────────────────

export const homefin = {
  // Autenticação (raramente chamado direto — usado para testar config)
  ping: () => authenticate().then(() => ({ ok: true as const })),

  // Domínios
  listarBancos:    () => request<HomefinBanco[]>("GET", "/dominios/bancos"),
  listarOperacoes: () => request<HomefinOperacao[]>("GET", "/dominios/operacoes"),
  listarUsuariosParceiros: () => request<unknown[]>("GET", "/usuarios-parceiros"),

  // Oportunidade
  criarOportunidade: (data: HomefinCriarOportunidadeRequest) =>
    request<HomefinOportunidadeResponse>("POST", "/oportunidade", data),

  consultarOportunidade: (idOportunidade: number) =>
    request<HomefinOportunidadeResponse>("GET", `/oportunidade/${idOportunidade}`),

  atualizarOportunidade: (idOportunidade: number, data: HomefinAtualizarOportunidadeRequest) =>
    request<HomefinOportunidadeResponse>("PUT", `/oportunidade/${idOportunidade}`, data),

  // Simulação
  criarSimulacao: (idOportunidade: number, data: HomefinCriarSimulacaoRequest) =>
    request<HomefinSimulacaoResponse>("POST", `/oportunidade/${idOportunidade}/simulacao`, data),

  atualizarSimulacao: (idOportunidade: number, idSimulacao: number, data: Partial<HomefinCriarSimulacaoRequest>) =>
    request<HomefinSimulacaoResponse>("PUT", `/oportunidade/${idOportunidade}/simulacao/${idSimulacao}`, data),

  // Participantes
  incluirParticipante: (idOportunidade: number, data: HomefinParticipanteRequest) =>
    request<{ idParticipante: number }>("POST", `/oportunidade/${idOportunidade}/participante`, data),

  atualizarParticipante: (idOportunidade: number, idParticipante: number, data: HomefinParticipanteRequest) =>
    request<{ idParticipante: number }>("PUT", `/oportunidade/${idOportunidade}/participante/${idParticipante}`, data),

  excluirParticipante: (idOportunidade: number, idParticipante: number) =>
    request<{ ok: true }>("DELETE", `/oportunidade/${idOportunidade}/participante/${idParticipante}`),

  // Integração bancária (envio de proposta ao banco)
  enviarPropostaIntegracao: (idOportunidade: number, data: HomefinIncluirPropostaRequest) =>
    request<{ idIntegracao: number; status?: string }>(
      "POST", `/oportunidade/${idOportunidade}/incluir-proposta-integracao`, data,
    ),

  vincularDocumentosIntegracao: (idOportunidade: number, data: HomefinIncluirPropostaRequest) =>
    request<{ ok: true }>(
      "POST", `/oportunidade/${idOportunidade}/incluir-documentos-integracao`, data,
    ),

  // Documentos
  uploadDocumento: (idDocumento: string, file: FormData) =>
    request<{ ok: true; idDocumento: string }>("POST", `/documento/${idDocumento}/upload`, file),

  // Follow-up
  registrarFollowUp: (idOportunidade: number, data: HomefinFollowUpRequest) =>
    request<{ idFollowUp: number }>("POST", `/oportunidade/${idOportunidade}/follow-up`, data),
};

export type HomefinClient = typeof homefin;
