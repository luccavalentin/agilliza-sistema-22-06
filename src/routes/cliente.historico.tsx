import { createFileRoute } from "@tanstack/react-router";
import { ClienteHistorico } from "@/components/cliente/cliente-historico";

export const Route = createFileRoute("/cliente/historico")({
  component: () => (
    <div className="p-6">
      <ClienteHistorico />
    </div>
  ),
});
