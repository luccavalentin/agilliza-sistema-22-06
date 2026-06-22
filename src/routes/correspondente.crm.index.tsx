import { createFileRoute } from "@tanstack/react-router";
import { CrmClientesList } from "@/components/crm/cliente-list";

export const Route = createFileRoute("/correspondente/crm/")({
  component: () => <CrmClientesList scope="correspondente" />,
});
