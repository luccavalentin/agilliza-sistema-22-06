import { createFileRoute } from "@tanstack/react-router";
import { ClienteAcompanhamento } from "@/components/cliente/cliente-acompanhamento";

export const Route = createFileRoute("/cliente/proposta")({
  component: () => (
    <div className="p-6">
      <ClienteAcompanhamento />
    </div>
  ),
});
