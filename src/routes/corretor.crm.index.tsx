import { createFileRoute } from "@tanstack/react-router";
import { CrmClientesList } from "@/components/crm/cliente-list";

export const Route = createFileRoute("/corretor/crm/")({
  component: () => <CrmClientesList scope="corretor" />,
});
