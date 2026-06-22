import { createFileRoute } from "@tanstack/react-router";
import { ClienteDocumentos } from "@/components/cliente/cliente-documentos";

export const Route = createFileRoute("/cliente/documentos")({
  component: () => (
    <div className="p-6">
      <ClienteDocumentos />
    </div>
  ),
});
