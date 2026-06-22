import { createFileRoute } from "@tanstack/react-router";
import { SimulacaoCompleta } from "@/components/operacional/simulacao-completa";

export const Route = createFileRoute("/corretor/operacional/simulacoes")({
  component: () => <div className="p-6"><SimulacaoCompleta /></div>,
});
