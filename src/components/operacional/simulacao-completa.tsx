// Orquestrador da tela de Simulação Completa.
// Mantemos o caminho original como re-export para compatibilidade.

import { PanelHeader } from "@/components/dashboards/primitives";
import { ClienteSeletor } from "./simulacao/cliente-seletor";
import { SimulacaoFormPanel } from "./simulacao/simulacao-form";
import { ResultadosBancos } from "./simulacao/resultados-bancos";
import { useSimulacaoCompleta } from "./simulacao/use-simulacao-completa";

export function SimulacaoCompleta() {
  const s = useSimulacaoCompleta();

  return (
    <div className="space-y-6">
      <PanelHeader
        eyebrow="Operacional · Simulação"
        title="Simulação Completa"
        subtitle="Crie oportunidades e dispare simulações multibanco via integração Homefin."
      />

      <ClienteSeletor
        semCliente={s.semCliente}
        onToggleSemCliente={s.setSemCliente}
        clienteSel={s.clienteSel}
        onSelect={s.selecionarCliente}
        onClear={s.limparCliente}
      />

      <SimulacaoFormPanel
        form={s.form}
        onChange={s.updateForm}
        onSubmit={s.simular}
        loading={s.simulando}
      />

      <ResultadosBancos
        resultados={s.resultados}
        onBaixarPdf={s.baixarPdf}
        gerandoPdf={s.gerandoPdf}
      />
    </div>
  );
}
