import { createFileRoute } from "@tanstack/react-router";
import { ClienteMensagens } from "@/components/cliente/cliente-mensagens";

export const Route = createFileRoute("/cliente/mensagens")({
  component: () => (
    <div className="p-6">
      <ClienteMensagens />
    </div>
  ),
});
