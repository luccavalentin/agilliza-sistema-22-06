import { createFileRoute } from "@tanstack/react-router";
import { SimulacaoWizard } from "@/components/operacional/simulacao-wizard";

export const Route = createFileRoute("/corretor/operacional/simulacoes")({
  component: () => <div className="p-6"><SimulacaoWizard escopo="corretor" /></div>,
});
