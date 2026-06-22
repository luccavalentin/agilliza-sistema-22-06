import { createFileRoute } from "@tanstack/react-router";
import { ClientePerfil } from "@/components/cliente/cliente-perfil";

export const Route = createFileRoute("/cliente/perfil")({
  component: () => (
    <div className="p-6">
      <ClientePerfil />
    </div>
  ),
});
