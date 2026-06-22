import { createFileRoute } from "@tanstack/react-router";
import { ClienteRelatorios } from "@/components/crm/cliente-relatorios";

export const Route = createFileRoute("/correspondente/crm/relatorios")({
  component: () => <ClienteRelatorios scope="correspondente" />,
});
