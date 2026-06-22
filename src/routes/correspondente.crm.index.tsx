import { createFileRoute } from "@tanstack/react-router";
import { LayoutDashboard } from "lucide-react";
import { SectionPlaceholder } from "@/components/portal/section-placeholder";

export const Route = createFileRoute("/correspondente/crm/")({
  component: () => (
    <SectionPlaceholder
      eyebrow="Correspondente · CRM"
      title="Dashboard de Clientes"
      description="Visão consolidada da carteira de clientes do correspondente."
      icon={LayoutDashboard}
    />
  ),
});
