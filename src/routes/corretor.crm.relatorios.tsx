import { createFileRoute } from "@tanstack/react-router";
import { ClienteRelatorios } from "@/components/crm/cliente-relatorios";

export const Route = createFileRoute("/corretor/crm/relatorios")({
  component: () => <ClienteRelatorios scope="corretor" />,
});
