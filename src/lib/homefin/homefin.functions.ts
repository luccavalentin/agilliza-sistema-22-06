// Server functions de integração com a HomeFin.
// Chamáveis do front via useServerFn(...) ou de loaders sob _authenticated/.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ─── Schemas ────────────────────────────────────────────────────────────────
const oportunidadeSchema = z.object({
  operacao: z.object({ idOperacao: z.enum(["1", "2"]) }),
  regional: z.object({ idRegional: z.string() }),
  parceiro: z.object({ idParceiro: z.string() }),
  usuarioParceiro: z.object({ idUsuarioParceiro: z.string() }),
  tipoImovel: z.object({ id: z.enum(["AP", "CS", "GA", "TE", "TC"]) }),
  usoImovel: z.object({ id: z.enum(["R", "C"]) }),
  uf: z.object({ codigo: z.string().length(2) }),
  valorImovel: z.number().positive(),
  valorFinanciamento: z.number().positive(),
  prazo: z.number().int().min(12).max(420),
  utilizaFgtsSimulacao: z.enum(["S", "N"]),
  bancos: z.array(z.object({
    idBanco: z.number().int(),
    codigoBanco: z.number().int().optional(),
    nomeBanco: z.string().optional(),
    flagSimulacao: z.enum(["S", "N"]),
  })).min(1),
  cpfCnpj: z.string().min(11),
  nome: z.string().min(2),
  rendaTotal: z.number().nonnegative(),
  codigoSistemaAmortizacaoBanco: z.object({ id: z.enum(["S", "P"]) }),
  dataNascimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  email: z.string().email(),
  celular: z.string().min(10),
  fgCompoeRenda: z.boolean(),
  situacaoImovel: z.object({ codigo: z.enum(["N", "U"]) }),
  fgFinanciarDespesas: z.enum(["S", "N"]),
  tipoEstadoCivil: z.object({ id: z.enum(["S", "CA", "UE", "DI", "VI", "SL"]) }),
});

const simulacaoSchema = z.object({
  idOportunidade: z.number().int().positive(),
  valorImovel: z.number().positive(),
  valorFinanciamento: z.number().positive(),
  prazo: z.number().int().min(12).max(420),
  codigoSistemaAmortizacaoBanco: z.object({ id: z.enum(["S", "P"]) }),
  banco: z.object({ idBanco: z.number().int() }),
  fgAutorizacaoDados: z.boolean(),
});

const propostaSchema = z.object({
  idOportunidade: z.number().int().positive(),
  idSimulacao: z.number().int().positive(),
});

const followUpSchema = z.object({
  idOportunidade: z.number().int().positive(),
  tipoFup: z.enum(["I", "E", "B"]),
  titulo: z.string().min(1).max(200),
  comentario: z.string().min(1).max(2000),
});

// ─── Helper: carrega o cliente HomeFin só no handler (server-only) ─────────
async function getClient() {
  const { homefin, HomefinError } = await import("@/lib/homefin/client.server");
  return { homefin, HomefinError };
}

function toClientError(err: unknown) {
  // Normaliza para um shape seguro de retornar ao browser
  if (err && typeof err === "object" && "name" in err && (err as { name: string }).name === "HomefinError") {
    const e = err as { message: string; status: number; code?: string };
    return { ok: false as const, error: { message: e.message, status: e.status, code: e.code } };
  }
  console.error("[homefin] erro inesperado:", err);
  return { ok: false as const, error: { message: "Erro inesperado ao chamar HomeFin", status: 500 } };
}

// ─── PING / configuração ───────────────────────────────────────────────────
export const homefinPing = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    try {
      const { homefin } = await getClient();
      await homefin.ping();
      return { ok: true as const };
    } catch (err) {
      return toClientError(err);
    }
  });

// ─── DOMÍNIOS ──────────────────────────────────────────────────────────────
export const homefinListarBancos = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    try {
      const { homefin } = await getClient();
      const data = await homefin.listarBancos();
      return { ok: true as const, data };
    } catch (err) { return toClientError(err); }
  });

export const homefinListarOperacoes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    try {
      const { homefin } = await getClient();
      const data = await homefin.listarOperacoes();
      return { ok: true as const, data };
    } catch (err) { return toClientError(err); }
  });

// ─── OPORTUNIDADE ──────────────────────────────────────────────────────────
export const homefinCriarOportunidade = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => oportunidadeSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const { homefin } = await getClient();
      const resp = await homefin.criarOportunidade(data);
      return { ok: true as const, data: resp };
    } catch (err) { return toClientError(err); }
  });

// ─── SIMULAÇÃO ─────────────────────────────────────────────────────────────
export const homefinCriarSimulacao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => simulacaoSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const { homefin } = await getClient();
      const { idOportunidade, ...payload } = data;
      const resp = await homefin.criarSimulacao(idOportunidade, payload);
      return { ok: true as const, data: resp };
    } catch (err) { return toClientError(err); }
  });

// ─── ENVIAR PROPOSTA AO BANCO ──────────────────────────────────────────────
export const homefinEnviarProposta = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => propostaSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const { homefin } = await getClient();
      const resp = await homefin.enviarPropostaIntegracao(data.idOportunidade, { idSimulacao: data.idSimulacao });
      return { ok: true as const, data: resp };
    } catch (err) { return toClientError(err); }
  });

// ─── FOLLOW-UP ─────────────────────────────────────────────────────────────
export const homefinRegistrarFollowUp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => followUpSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const { homefin } = await getClient();
      const { idOportunidade, ...payload } = data;
      const resp = await homefin.registrarFollowUp(idOportunidade, {
        idOportunidade,
        tipoFup: payload.tipoFup,
        titulo: payload.titulo,
        comentario: payload.comentario,
      });
      return { ok: true as const, data: resp };
    } catch (err) { return toClientError(err); }
  });
