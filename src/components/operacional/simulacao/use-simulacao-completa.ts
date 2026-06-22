// Hook que orquestra o estado e os efeitos da Simulação Completa.

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { FORM_INICIAL, type BancoResultado, type ClienteRow, type SimulacaoForm } from "./types";
import { executarSimulacaoHomefin } from "./simulacao-service";
import { downloadSimulacaoPdf } from "./simulacao-pdf";

export function useSimulacaoCompleta() {
  const [semCliente, setSemCliente] = useState(false);
  const [clienteSel, setClienteSel] = useState<ClienteRow | null>(null);
  const [form, setForm] = useState<SimulacaoForm>(FORM_INICIAL);
  const [resultados, setResultados] = useState<BancoResultado[]>([]);
  const [simulando, setSimulando] = useState(false);
  const [gerandoPdf, setGerandoPdf] = useState(false);

  const updateForm = useCallback(
    (patch: Partial<SimulacaoForm>) => setForm((f) => ({ ...f, ...patch })),
    [],
  );

  const selecionarCliente = useCallback((c: ClienteRow) => {
    setClienteSel(c);
    setForm((f) => ({
      ...f,
      cpfCnpj: c.cpf_cnpj ?? "",
      nome: c.nome ?? "",
      dataNascimento: c.data_nasc ?? "",
      renda: c.renda ?? f.renda,
      email: c.email ?? "",
      celular: c.celular ?? "",
    }));
  }, []);

  const limparCliente = useCallback(() => {
    setClienteSel(null);
    setForm((f) => ({ ...f, cpfCnpj: "", nome: "", dataNascimento: "", email: "", celular: "" }));
  }, []);

  const simular = useCallback(async () => {
    if (!form.nome || !form.cpfCnpj) {
      toast.error("Informe nome e CPF/CNPJ do participante");
      return;
    }
    if (form.bancosSelecionados.length === 0) {
      toast.error("Selecione ao menos um banco");
      return;
    }
    setSimulando(true);
    try {
      const { resultados: r, demo } = await executarSimulacaoHomefin(form);
      setResultados(r);
      if (demo) toast.warning("Edge function indisponível — exibindo simulação local (demo).");
      else toast.success(`Simulação concluída em ${r.length} banco(s)`);
    } finally {
      setSimulando(false);
    }
  }, [form]);

  const baixarPdf = useCallback(async () => {
    if (resultados.length === 0) return;
    setGerandoPdf(true);
    try {
      await downloadSimulacaoPdf({
        cliente: { nome: form.nome, telefone: form.celular, email: form.email, dataNasc: form.dataNascimento },
        dados: {
          valorImovel: form.valorImovel,
          entrada: form.valorImovel - form.valorFinanciamento,
          financiamento: form.valorFinanciamento,
          prazo: form.prazo,
          sistema: form.sistemaAmortizacao,
        },
        resultados,
        responsavel: "Usuário",
      });
    } catch {
      toast.error("Falha ao gerar PDF");
    } finally {
      setGerandoPdf(false);
    }
  }, [form, resultados]);

  return {
    semCliente, setSemCliente,
    clienteSel, selecionarCliente, limparCliente,
    form, updateForm,
    simular, simulando,
    resultados,
    baixarPdf, gerandoPdf,
  };
}
