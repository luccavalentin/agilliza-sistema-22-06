// Serviço de simulação: chama a edge function `homefin-proxy` e
// expõe um fallback determinístico para modo demo.

import { supabase } from "@/integrations/supabase/client";
import { bancos as bancosMock } from "@/lib/operacional/mock-data";
import type { BancoResultado, SegmentoResultado, SimulacaoForm } from "./types";

export function montarPayloadHomefin(form: SimulacaoForm) {
  return {
    operacao: { idOperacao: "1" },
    regional: { idRegional: undefined },
    parceiro: { idParceiro: undefined },
    usuarioParceiro: { idUsuarioParceiro: undefined },
    tipoImovel: { id: form.tipoImovel },
    usoImovel: { id: form.usoImovel },
    situacaoImovel: { codigo: form.situacaoImovel },
    uf: { codigo: form.uf },
    valorImovel: form.valorImovel,
    valorFinanciamento: form.valorFinanciamento,
    prazo: form.prazo,
    utilizaFgtsSimulacao: form.utilizaFgts ? "S" : "N",
    bancos: form.bancosSelecionados.map((id) => ({ idBanco: id, flagSimulacao: "S" })),
    cpfCnpj: form.cpfCnpj,
    nome: form.nome,
    rendaTotal: form.renda,
    dataNascimento: form.dataNascimento,
    email: form.email,
    celular: form.celular,
    codigoSistemaAmortizacaoBanco: { id: form.sistemaAmortizacao },
    fgCompoeRenda: false,
    fgFinanciarDespesas: form.fgFinanciarDespesas ? "S" : "N",
    tipoEstadoCivil: { id: form.estadoCivil },
  };
}

export type SimulacaoResposta = { resultados: BancoResultado[]; demo: boolean };

export async function executarSimulacaoHomefin(form: SimulacaoForm): Promise<SimulacaoResposta> {
  try {
    const { data, error } = await supabase.functions.invoke("homefin-proxy", {
      body: { action: "criar-oportunidade-simulacao", payload: montarPayloadHomefin(form) },
    });
    if (error) throw error;
    const resultados = (data?.resultados as BancoResultado[]) ?? mockResultados(form);
    return { resultados, demo: !data?.resultados };
  } catch {
    return { resultados: mockResultados(form), demo: true };
  }
}

export function mockResultados(form: SimulacaoForm): BancoResultado[] {
  return form.bancosSelecionados.map((id) => {
    const meta = bancosMock.find((b) => b.id === id)!;
    const baseTaxa = 9.5 + Math.random() * 2;
    const segs: SegmentoResultado[] = ["SBPE", "Crédito Imobiliário", "Pró-Cotista"].map((seg, i) => {
      const taxa = +(baseTaxa + i * 0.2).toFixed(2);
      const primeira = (form.valorFinanciamento / form.prazo) * (1 + taxa / 100);
      const ultima = (form.valorFinanciamento / form.prazo) * (1 + (taxa / 100) * 0.3);
      return {
        segmento: seg,
        primeiraParcela: primeira,
        ultimaParcela: ultima,
        taxaEfetiva: taxa,
        rendaEstimada: primeira / 0.3,
        ltv: (form.valorFinanciamento / form.valorImovel) * 100,
        total: ((primeira + ultima) / 2) * form.prazo,
      };
    });
    return {
      idBanco: meta.id, nomeBanco: meta.nome,
      logoSlug: meta.logoSlug, brandColor: meta.brandColor,
      segmentos: segs,
    };
  });
}
