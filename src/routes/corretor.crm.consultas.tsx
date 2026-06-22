import { createFileRoute } from "@tanstack/react-router";
import { ClienteConsultas } from "@/components/crm/cliente-consultas";

export const Route = createFileRoute("/corretor/crm/consultas")({
  component: () => <ClienteConsultas scope="corretor" />,
});
