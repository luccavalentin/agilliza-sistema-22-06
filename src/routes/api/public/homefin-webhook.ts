// Webhook público para receber retornos da HomeFin (aprovações, recusas,
// mudanças de status de simulação/proposta/integração bancária).
//
// URL: /api/public/homefin-webhook
// Configure este endpoint na HomeFin como destino dos eventos.
//
// Segurança: a HomeFin assina o corpo com HMAC-SHA256 usando
// HOMEFIN_WEBHOOK_SECRET; verificamos antes de processar.

import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";

const HEADER_SIGNATURE = "x-homefin-signature";

function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

export const Route = createFileRoute("/api/public/homefin-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.HOMEFIN_WEBHOOK_SECRET;
        const rawBody = await request.text();

        // 1) Verificação de assinatura (se o secret estiver configurado)
        if (secret) {
          const signature = request.headers.get(HEADER_SIGNATURE) ?? "";
          const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
          if (!signature || !safeEqual(signature, expected)) {
            return new Response("Invalid signature", { status: 401 });
          }
        } else {
          console.warn(
            "[homefin-webhook] HOMEFIN_WEBHOOK_SECRET não configurado — endpoint aceitando eventos sem validação. NÃO use em produção.",
          );
        }

        // 2) Parse + processamento
        let event: Record<string, unknown>;
        try {
          event = rawBody ? JSON.parse(rawBody) : {};
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        try {
          await processHomefinEvent(event);
        } catch (err) {
          console.error("[homefin-webhook] erro ao processar evento", err, event);
          // Devolvemos 200 mesmo assim para evitar replays infinitos da HomeFin;
          // o erro fica nos logs e pode ser reprocessado manualmente.
        }

        return Response.json({ received: true });
      },

      // Healthcheck — facilita a HomeFin testar a URL antes de habilitar o envio
      GET: async () =>
        Response.json({ ok: true, endpoint: "homefin-webhook", version: 1 }),
    },
  },
});

// ────────────────────────── Processamento ──────────────────────────
// Esta função recebe o evento já autenticado e despacha conforme `evento`.
// Quando as tabelas locais existirem (oportunidades, simulacoes, propostas),
// faça aqui o UPSERT usando supabaseAdmin (importação dinâmica obrigatória).

async function processHomefinEvent(event: Record<string, unknown>) {
  const tipo = String(event.evento ?? event.type ?? "DESCONHECIDO");
  const idOportunidade = (event.idOportunidade as number | undefined) ?? null;
  const idSimulacao   = (event.idSimulacao   as number | undefined) ?? null;
  const status         = (event.status        as string | undefined) ?? null;

  console.info("[homefin-webhook] evento recebido", {
    tipo, idOportunidade, idSimulacao, status,
  });

  // TODO: quando as tabelas locais forem criadas, persistir aqui:
  //
  //   const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  //   await supabaseAdmin.from("homefin_eventos").insert({
  //     tipo, id_oportunidade: idOportunidade, id_simulacao: idSimulacao,
  //     status, payload: event, recebido_em: new Date().toISOString(),
  //   });
  //
  //   switch (tipo) {
  //     case "SIMULACAO_APROVADA":  /* atualiza simulações locais */ break;
  //     case "SIMULACAO_RECUSADA":  /* idem */ break;
  //     case "PROPOSTA_APROVADA":   /* atualiza proposta + dispara comissão */ break;
  //     case "PROPOSTA_RECUSADA":   /* idem */ break;
  //     case "CONTRATO_EMITIDO":    /* gera recebíveis */ break;
  //     case "FOLLOWUP_BANCO":      /* registra histórico */ break;
  //   }
}
